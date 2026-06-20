// ╔══════════════════════════════════════════════════════════════╗
// ║              🤖  FIZA BOT  —  Connection Manager            ║
// ║   Pair-Code · Auto-Reconnect · Persistent LID Map          ║
// ╚══════════════════════════════════════════════════════════════╝

import './settings.js'
import owner from './owner.js'

import fs        from 'fs'
import path      from 'path'
import readline  from 'readline'
import { fileURLToPath } from 'url'

import pino   from 'pino'
import chalk  from 'chalk'
import { Boom } from '@hapi/boom'
import PhoneNumber from 'awesome-phonenumber'

import {
    default as makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers,
} from '@whiskeysockets/baileys'

const __filename    = fileURLToPath(import.meta.url)
const __dirname     = path.dirname(__filename)
const SESSION_DIR   = './fiza-session'
const MAX_RETRIES   = 5
const BASE_DELAY_MS = 5_000
const CODE_TTL_S    = 60

const bootTime = Date.now()
const uptime   = () => {
    const s = Math.floor((Date.now() - bootTime) / 1000)
    return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s % 3600 / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

const store = { contacts: {}, messages: {}, groupMetadata: {}, presences: {} }

const ts    = () => chalk.gray(`[${new Date().toLocaleTimeString('en-IN', { timeZone: global.timezone || 'Asia/Kolkata' })}]`)
const log   = (...a) => console.log(ts(), ...a)
const logErr = (...a) => console.error(ts(), chalk.red('[ERR]'), ...a)
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

let sockInstance = null
let retries      = 0

// ── SESSION WIPE ──────────────────────────────────────────────────────
function wipeSession() {
    try {
        if (fs.existsSync(SESSION_DIR)) {
            fs.rmSync(SESSION_DIR, { recursive: true, force: true })
            log(chalk.yellow('🗑️  Session wiped'))
        }
    } catch (e) { logErr('Wipe failed:', e.message) }
}

// ── PAIRING CODE ──────────────────────────────────────────────────────
const question = (prompt) => new Promise(res => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    rl.question(prompt, ans => { rl.close(); res(ans.trim()) })
})

async function requestPairCode(sock) {
    while (true) {
        let phone = String(global.number_bot || process.env.BOT_NUMBER || '').replace(/[^0-9]/g, '')

        if (!phone) {
            phone = (await question(chalk.yellow('\n  📱 Enter your WhatsApp number (e.g. 916284912807):\n  ➜ '))).replace(/[^0-9]/g, '')
        }

        if (!phone || phone.length < 7) {
            logErr('Invalid phone number')
            const retry = await question(chalk.yellow('  Retry? (y/n): '))
            if (retry.toLowerCase() !== 'y') process.exit(1)
            continue
        }

        await sleep(3000)

        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                let code = await sock.requestPairingCode(phone)
                code = code?.match(/.{1,4}/g)?.join('-') ?? code
                if (!code || code.length < 4) throw new Error('Invalid code received')

                console.log('\n' + chalk.bgGreen.black.bold(
                    `\n  ╔═══════════════════════════════════╗\n` +
                    `  ║   🔑  YOUR PAIRING CODE:          ║\n` +
                    `  ║   ${chalk.white.bold(code.padEnd(31))}║\n` +
                    `  ╚═══════════════════════════════════╝\n`
                ))
                console.log(chalk.yellow.bold(`  ⚡ Expires in ${CODE_TTL_S} seconds!\n`))
                return
            } catch (e) {
                logErr(`Pair attempt ${attempt}/3: ${e.message}`)
                if (attempt < 3) await sleep(3000)
                else { wipeSession(); await sleep(3000) }
            }
        }
    }
}

// ── STORE EVENTS ──────────────────────────────────────────────────────
function bindStoreEvents(sock) {
    // Messages
    sock.ev.on('messages.upsert', ({ messages }) => {
        const msg = messages[0]
        if (!msg?.message) return
        const jid = msg.key.remoteJid
        if (!jid) return
        if (!store.messages[jid]) store.messages[jid] = []
        store.messages[jid].push(msg)
        if (store.messages[jid].length > 200) store.messages[jid] = store.messages[jid].slice(-200)
    })

    // ── Contacts → feed owner.js LID map ─────────────────────────────
    // This is how LID↔phone mappings are discovered.
    // owner.js saves them to disk so they survive restarts.
    sock.ev.on('contacts.upsert', contacts => {
        for (const c of contacts) store.contacts[c.id] = { ...store.contacts[c.id], ...c }
        owner.processContacts(contacts)
    })
    sock.ev.on('contacts.update', contacts => {
        for (const c of contacts) if (c.id) store.contacts[c.id] = { ...store.contacts[c.id], ...c }
        owner.processContacts(contacts)
    })

    // Groups
    sock.ev.on('groups.update', async updates => {
        for (const u of updates) {
            if (!u.id) continue
            try { store.groupMetadata[u.id] = await sock.groupMetadata(u.id) } catch {}
        }
    })
    sock.ev.on('group-participants.update', async update => {
        if (!update.id) return
        try { store.groupMetadata[update.id] = await sock.groupMetadata(update.id) } catch {}
    })

    // Presences
    sock.ev.on('presence.update', ({ id, presences }) => {
        if (id) store.presences[id] = { ...store.presences[id], ...presences }
    })
}

// ── MAIN ──────────────────────────────────────────────────────────────
async function startFiza() {
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR)
    const { version }          = await fetchLatestBaileysVersion()

    log(chalk.green(`📡 WhatsApp Web v${version.join('.')}`))

    const sock = makeWASocket({
        version,
        logger:   pino({ level: 'silent' }),
        browser:  Browsers.ubuntu('Chrome'),
        auth: {
            creds: state.creds,
            keys:  makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' })),
        },
        markOnlineOnConnect:         true,
        generateHighQualityLinkPreview: true,
        syncFullHistory:             true,
        connectTimeoutMs:            120_000,
        keepAliveIntervalMs:         30_000,
        retryRequestDelayMs:         5_000,
        msgRetryCounterCache:        new Map(),
        shouldIgnoreJid:             () => false,
        patchMessageBeforeSending:   msg => msg,
        getMessage: async key => {
            try {
                const found = (store.messages[key.remoteJid] || []).find(m => m.key?.id === key.id)
                return found?.message || ''
            } catch { return { conversation: '' } }
        },
    })

    sockInstance = sock
    sock.ev.on('creds.update', saveCreds)
    bindStoreEvents(sock)

    if (!sock.authState.creds.registered) await requestPairCode(sock)

    sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
        if (connection === 'connecting') log(chalk.yellow('🔄 Connecting...'))

        if (connection === 'open') {
            retries = 0

            // ── Seed bot's own LID into owner.js ─────────────────────
            // Critical for Community group owner detection.
            // owner.js also loads the saved LID map from disk on startup,
            // so this just adds/updates the bot's entry.
            owner.autoDetect(sock)

            const botNum  = sock.user?.id?.split(':')[0] || '?'
            const botName = sock.user?.name || global.botname || 'FIZA BOT'
            const time    = new Date().toLocaleString('en-IN', { timeZone: global.timezone || 'Asia/Kolkata' })

            console.clear()
            console.log(chalk.greenBright.bold(
                `\n  ╔══════════════════════════════════════════════╗\n` +
                `  ║         ✅  FIZA BOT CONNECTED!              ║\n` +
                `  ╠══════════════════════════════════════════════╣\n` +
                `  ║  🤖 Name    : ${botName.padEnd(31)}║\n` +
                `  ║  📱 Number  : ${botNum.padEnd(31)}║\n` +
                `  ║  🗺️  LID map : ${String(owner.lidMapSize + ' entries (persistent)').padEnd(31)}║\n` +
                `  ║  ⏰ Started : ${time.padEnd(31)}║\n` +
                `  ║  ⏱️  Uptime  : ${uptime().padEnd(31)}║\n` +
                `  ╚══════════════════════════════════════════════╝\n`
            ))

            // Ensure database directory
            const dbDir = path.join(__dirname, 'database')
            if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })

            // Load FAHIM handler
            try {
                const { default: fahim } = await import('./fahim.js')
                await fahim(sock, store)
                log(chalk.cyan('[FAHIM] Handler loaded ✅'))
            } catch (e) {
                logErr('[FAHIM] Load failed:', e.message)
            }

            // Notify owner
            try {
                const owners = Array.isArray(global.ownerNumber) ? global.ownerNumber : [global.ownerNumber]
                if (owners[0]) {
                    const jid = owners[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
                    await sock.sendMessage(jid, {
                        text: `✅ *${global.botname || 'FIZA'} is now online!*\n\n🗺️ LID map: ${owner.lidMapSize} entries`,
                    }).catch(() => {})
                }
            } catch {}
        }

        if (connection === 'close') {
            const code = new Boom(lastDisconnect?.error)?.output?.statusCode
            logErr(`Connection closed — code: ${code || 'unknown'}`)

            if (code === DisconnectReason.loggedOut || code === 401) {
                wipeSession()
                await sleep(3000)
                process.exit(1)
            }

            if (retries >= MAX_RETRIES) { logErr('Max retries reached'); process.exit(1) }

            const wait = BASE_DELAY_MS * Math.pow(1.5, retries)
            retries++
            log(chalk.yellow(`🔄 Reconnecting in ${(wait / 1000).toFixed(1)}s (${retries}/${MAX_RETRIES})`))
            await sleep(wait)
            startFiza()
        }
    })
}

process.on('SIGINT',              () => { try { sockInstance?.end() } catch {} process.exit(0) })
process.on('SIGTERM',             () => { try { sockInstance?.end() } catch {} process.exit(0) })
process.on('uncaughtException',   e  => logErr('Uncaught:', e.message))
process.on('unhandledRejection',  e  => logErr('Rejection:', e?.message || e))

console.log(chalk.cyanBright.bold(`
  ╔══════════════════════════════════════════════╗
  ║     ███████╗██╗███████╗ █████╗              ║
  ║     ██╔════╝██║╚══███╔╝██╔══██╗             ║
  ║     █████╗  ██║  ███╔╝ ███████║             ║
  ║     ██╔══╝  ██║ ███╔╝  ██╔══██║             ║
  ║     ██║     ██║███████╗██║  ██║             ║
  ║     ╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝             ║
  ╠══════════════════════════════════════════════╣
  ║      🤖  FIZA BOT  v4.0  (Stable)           ║
  ╚══════════════════════════════════════════════╝
`))

startFiza().catch(e => { logErr('Fatal:', e.message); process.exit(1) })
