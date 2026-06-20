// ╔══════════════════════════════════════════════════════════════╗
// ║             🧠  FAHIM  —  Message Handler v4.2              ║
// ║  ES Module · Hot-Reload · Nested Plugins · Button Routing  ║
// ╚══════════════════════════════════════════════════════════════╝

import fs   from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { createRequire } from 'module'
import chalk from 'chalk'

import './settings.js'
import owner    from './owner.js'
import security from './security.js'
import { getMessageHandler } from './messages.js'
import { logMessage } from './lib/msglogger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
const require    = createRequire(import.meta.url)

const ts      = () => chalk.gray(`[${new Date().toLocaleTimeString('en-IN', { timeZone: global.timezone || 'Asia/Kolkata' })}]`)
const log     = (...a) => console.log(ts(), ...a)
const logErr  = (...a) => console.error(ts(), chalk.red('[ERR]'), ...a)
const logDbg  = (...a) => { if (global.debug) console.log(ts(), chalk.magenta('[DBG]'), ...a) }

const msgHandler = getMessageHandler(global)

let lib = {}
try { const m = await import('./lib/index.js'); lib = m.default ?? m } catch {}

// ═══════════════════════════════════════════════════════════════
// 🆕 DYNAMIC PLUGIN SYSTEM WITH NESTED FOLDER SUPPORT
// ═══════════════════════════════════════════════════════════════
const plugins      = new Map()
const pluginMeta   = new Map()
const buttonRoutes = new Map()   // 🔘 buttonId → plugin
const pluginDir    = global.pluginDir || path.join(__dirname, 'plugins')

if (!fs.existsSync(pluginDir)) fs.mkdirSync(pluginDir, { recursive: true })

function scanPlugins(dir = pluginDir, category = 'root') {
    let results = []
    if (!fs.existsSync(dir)) return results
    for (const item of fs.readdirSync(dir)) {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)
        if (stat.isDirectory()) {
            results.push(...scanPlugins(fullPath, item))
        } else if (stat.isFile() && item.endsWith('.js')) {
            results.push({ path: fullPath, name: path.basename(item, '.js'), category })
        }
    }
    return results
}

// 🔘 Rebuild buttonId → plugin lookup table from currently loaded plugins
function rebuildButtonRoutes() {
    buttonRoutes.clear()
    for (const [, plugin] of plugins) {
        if (!plugin.onButton) continue
        const ids = Array.isArray(plugin.buttons) ? plugin.buttons : (plugin.buttons ? [plugin.buttons] : [])
        for (const id of ids) buttonRoutes.set(id, plugin)
    }
}

async function loadPlugin(filePath, pluginName = null, category = 'root') {
    try {
        try { delete require.cache[require.resolve(filePath)] } catch {}
        const url = pathToFileURL(filePath).href + '?t=' + Date.now()
        const mod  = await import(url)
        const plug = mod.default ?? mod

        if (typeof plug !== 'object' || !plug) throw new TypeError('Must export an object')
        const name = pluginName || plug.name || path.basename(filePath, '.js')

        // 🔘 Plugins with only buttons (no command) are valid too
        const cmds = Array.isArray(plug.command) ? plug.command : [plug.command]
        const hasCommand = cmds.some(Boolean)
        const hasButtons = !!plug.onButton

        if (!hasCommand && !hasButtons) throw new TypeError('Missing "command" or "onButton" field')

        plugins.set(name, plug)
        pluginMeta.set(name, { path: filePath, category, loadedAt: new Date(), commands: cmds })
        log(chalk.green(`[PLUGIN] ✓ ${name}`) + chalk.gray(` └ ${category}`))
        return true
    } catch (err) {
        logErr(`[PLUGIN] ${path.basename(filePath)}: ${err.message}`)
        return false
    }
}

async function loadAllPlugins() {
    plugins.clear()
    pluginMeta.clear()

    const all = scanPlugins(pluginDir)
    if (all.length === 0) {
        log(chalk.gray('[PLUGIN] No plugins found'))
        rebuildButtonRoutes()
        return
    }

    let loaded = 0
    const categorized = {}

    for (const p of all) {
        if (await loadPlugin(p.path, p.name, p.category)) {
            loaded++
            if (!categorized[p.category]) categorized[p.category] = []
            categorized[p.category].push(p.name)
        }
    }

    rebuildButtonRoutes()

    log(chalk.cyan(`[PLUGIN] 📦 ${loaded}/${all.length} loaded`))
    for (const [cat, names] of Object.entries(categorized)) {
        log(chalk.gray(`         └ 📁 ${cat}: ${names.join(', ')}`))
    }
    log(chalk.cyan(`[PLUGIN] 🔘 ${buttonRoutes.size} button route(s)`))
}

function getPluginByCommand(cmd) {
    for (const [name, plugin] of plugins) {
        const cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command]
        if (cmds.filter(Boolean).map(c => c.toLowerCase()).includes(cmd.toLowerCase())) {
            return { name, plugin, meta: pluginMeta.get(name) }
        }
    }
    return null
}

// 🔘 Look up which plugin handles a given button id
function getPluginByButton(buttonId) {
    const plugin = buttonRoutes.get(buttonId)
    if (!plugin) return null
    const name = [...plugins.entries()].find(([, p]) => p === plugin)?.[0]
    return { name, plugin, meta: pluginMeta.get(name) }
}

// ═══════════════════════════════════════════════════════════════
// 🆕 ADVANCED HOT RELOAD (NESTED FOLDERS)
// ═══════════════════════════════════════════════════════════════
const debounce = new Map()
let watchers = []
let watching = false

function startWatcher() {
    if (watching) return
    watching = true

    const watchDir = (dir) => {
        if (!fs.existsSync(dir)) return
        try {
            const w = fs.watch(dir, { persistent: false, recursive: false }, (event, filename) => {
                if (!filename?.endsWith('.js')) return
                const fp = path.join(dir, filename)
                const nm = path.basename(filename, '.js')
                const rp = path.relative(pluginDir, fp)
                const cat = rp.includes(path.sep) ? path.dirname(rp) : 'root'

                if (debounce.has(fp)) clearTimeout(debounce.get(fp))
                debounce.set(fp, setTimeout(async () => {
                    debounce.delete(fp)
                    if (event === 'rename' || !fs.existsSync(fp)) {
                        if (plugins.has(nm)) {
                            plugins.delete(nm)
                            pluginMeta.delete(nm)
                            rebuildButtonRoutes()
                            log(chalk.red(`[HOT] ➖ ${cat}/${filename}`))
                        }
                        return
                    }
                    const ex = plugins.has(nm)
                    if (await loadPlugin(fp, nm, cat)) {
                        rebuildButtonRoutes()
                        log(chalk.yellow(`[HOT] ${ex ? '🔄' : '➕'} ${cat}/${filename}`))
                    }
                }, 300))
            })
            watchers.push(w)
            for (const item of fs.readdirSync(dir)) {
                const ip = path.join(dir, item)
                if (fs.statSync(ip).isDirectory()) watchDir(ip)
            }
        } catch (e) {}
    }

    if (watchers.length > 0) {
        for (const w of watchers) w.close()
        watchers = []
    }
    watchDir(pluginDir)
    log(chalk.gray('[FAHIM] 👁️  Hot-reload active (nested folders)'))
}

// ── ACCESS DENIED MESSAGES ────────────────────────────────────────────
const DENY_MSGS = {
    banned:                  () => global.msg_banned || '🚫 You are banned!',
    global_off:              () => '🔴 Bot is currently OFF',
    group_muted:             () => global.msg_muted  || '🔇 This group is muted!',
    admin_only:              () => global.msg_admin  || '🛡️ Admin only!',
    group_off:               () => '🔴 Bot is OFF in this group',
    command_blacklisted:     () => '🚫 This command is disabled here',
    global_mode:              () => '🔒 Bot is in restricted mode',
    global_chat_restriction:  () => '🔒 Not allowed in this chat type',
}

// ── GROUP EVENTS ──────────────────────────────────────────────────────
async function handleGroupUpdate(sock, store, update) {
    try {
        const { id, participants, action, author } = update
        if (!id || !participants) return

        let meta
        try { meta = store.groupMetadata?.[id] ?? await sock.groupMetadata(id) } catch { return }
        if (meta) store.groupMetadata[id] = meta

        const groupName = meta?.subject ?? 'Group'
        const jids = participants.map(p => typeof p === 'string' ? p : (p?.id ?? String(p)))

        for (const [name, plugin] of plugins) {
            if (action === 'add' && plugin.onWelcome) {
                await plugin.onWelcome({ sock, store, group: id, participants: jids, groupName, meta }).catch(() => {})
            }
            if (action === 'remove' && plugin.onGoodbye) {
                await plugin.onGoodbye({ sock, store, group: id, participants: jids, groupName, meta }).catch(() => {})
            }
            if (action === 'promote' && plugin.onPromote) {
                await plugin.onPromote({ sock, store, group: id, participants: jids, author, meta }).catch(() => {})
            }
            if (action === 'demote' && plugin.onDemote) {
                await plugin.onDemote({ sock, store, group: id, participants: jids, author, meta }).catch(() => {})
            }
        }
    } catch (e) { logErr('[GroupUpdate]', e.message) }
}

// ── ANTILINK ──────────────────────────────────────────────────────────
async function checkAntilink(sock, msg, s) {
    try {
        if (!s.isGroup) return
        if (!security.isAntilink(s.remoteJid)) return
        if (owner.isOwner(s.sender)) return
        if (await owner.isAdmin(sock, null, s.remoteJid, s.sender)) return

        const text    = s.body || ''
        const hasLink = msgHandler.hasGroupLink(text) || msgHandler.extractLinks(text).length > 0
        if (!hasLink) return

        await sock.sendMessage(s.remoteJid, { delete: msg.key }).catch(() => {})
        await sock.sendMessage(s.remoteJid, {
            text: `⚠️ *Anti-Link*\n@${s.sender.split('@')[0]} — Links are not allowed!`,
            mentions: [s.sender],
        }).catch(() => {})

        const warns = security.warnUser(s.remoteJid, s.sender)
        if (warns >= 3) {
            await sock.groupParticipantsUpdate(s.remoteJid, [s.sender], 'remove').catch(() => {})
            security.resetWarnings(s.remoteJid, s.sender)
        }
    } catch (e) { logDbg('[Antilink]', e.message) }
}

// ── ANTI-TOXIC ────────────────────────────────────────────────────────
async function checkToxic(sock, msg, s) {
    try {
        if (!s.isGroup || !security.isAntitoxic(s.remoteJid)) return
        if (!msgHandler.isToxic(s.body || '')) return
        await sock.sendMessage(s.remoteJid, { delete: msg.key }).catch(() => {})
        await sock.sendMessage(s.remoteJid, {
            text: `⚠️ *Anti-Toxic*\n@${s.sender.split('@')[0]} — Watch your language!`,
            mentions: [s.sender],
        }).catch(() => {})
    } catch (e) { logDbg('[AntiToxic]', e.message) }
}

// ── CHATBOT ───────────────────────────────────────────────────────────
async function handleChatBot(sock, msg, s) {
    try {
        if (!s.isGroup || !security.isChatBot(s.remoteJid)) return
        if (s.body?.startsWith(global.botprefix || '.')) return

        const text = (s.body || '').toLowerCase().trim()
        const tag  = `@${s.sender.split('@')[0]}`
        const map  = {
            'hello|hi|hey|halo|hai|helo': `Hello ${tag}! 👋`,
            'good morning|pagi': `Good morning ${tag}! ☀️`,
            'good night|malam': `Good night ${tag}! 🌙`,
            'thank|thx|makasih': `You're welcome ${tag}! 😊`,
            'love you|ily': `Aww, love you too ${tag}! ❤️`,
            '^bot$': `Yes? Use *${global.botprefix || '.'}menu* 🤖`,
        }
        for (const [pattern, reply] of Object.entries(map)) {
            if (new RegExp(pattern, 'i').test(text)) {
                await sock.sendMessage(s.remoteJid, { text: reply, mentions: [s.sender] }).catch(() => {})
                break
            }
        }
    } catch (e) { logDbg('[ChatBot]', e.message) }
}

// ── ANTI-DELETE ───────────────────────────────────────────────────────
const deletedCache = new Map()
function cacheForAntiDelete(msg) {
    if (!global.antiDelete || !msg?.key?.remoteJid) return
    const jid  = msg.key.remoteJid
    const msgs = deletedCache.get(jid) || []
    msgs.push({ ...msg, _ts: Date.now() })
    if (msgs.length > 50) msgs.shift()
    deletedCache.set(jid, msgs)
}

// ── MAIN MESSAGE HANDLER ──────────────────────────────────────────────
async function handleMessages(sock, store, chatUpdate) {
    try {
        const msg = chatUpdate.messages?.[0]
        if (!msg?.message) return
        if (msg.key?.remoteJid === 'status@broadcast') return
        if (msg.key?.id?.startsWith('BAE5') && msg.key.id.length === 16) return

        cacheForAntiDelete(msg)

        if (msg.message?.protocolMessage) {
            if (msg.message.protocolMessage.type === 0 && global.antiDelete) {
                const jid = msg.key.remoteJid
                const deleted = (deletedCache.get(jid) || []).find(m => m.key.id === msg.message.protocolMessage.key.id)
                if (deleted) {
                    const whoDeleted = msg.key.participant || msg.key.remoteJid
                    await sock.sendMessage(jid, { text: `⚠️ *Anti-Delete*\n@${whoDeleted.split('@')[0]} deleted a message!`, mentions: [whoDeleted] }).catch(() => {})
                }
            }
            return
        }

        if (Object.keys(msg.message)[0] === 'ephemeralMessage')
            msg.message = msg.message.ephemeralMessage.message

        const s = await msgHandler.serialize(sock, msg)
        if (!s?.remoteJid || !s?.sender) return

        logMessage(msg, s)

        msgHandler.cacheMessage(msg)
        if (global.autoRead) sock.readMessages([msg.key]).catch(() => {})

        if (global.antiSpam !== false && !owner.isOwner(s.sender)) {
            const spam = msgHandler.checkSpam(s.sender)
            if (spam.jailed) return
        }

        // ════════════════════════════════════════════════════════════
        // 🔘 BUTTON TAP HANDLING — checked BEFORE antilink/chatbot/cmds
        // ════════════════════════════════════════════════════════════
        if (s.isButton && s.buttonId) {
            const route = getPluginByButton(s.buttonId)
            if (!route) {
                logDbg(`[Button] No handler for id: ${s.buttonId}`)
                return
            }

            const qr  = msgHandler.createQuickReply(sock, msg)
            const ctx = {
                sock, msg, store, lib,
                from:   s.remoteJid,
                sender: s.sender,
                botname: global.botname || 'FIZA',
                buttonId:   s.buttonId,
                buttonText: s.buttonText || null,
                isButton:   true,
                isGroup:    s.isGroup,
                senderLid:  s.senderLid || null,
                reply: qr.reply, react: qr.react, send: qr.send,
                typing: qr.typing, stopTyping: qr.stopTyping, deleteMsg: qr.deleteMsg,
                sleep: (ms) => new Promise(r => setTimeout(r, ms)),
                owner, security, plugins, pluginMeta,
            }

            try {
                await route.plugin.onButton(ctx)
                log(chalk.blue('[BTN]') + ` ${s.buttonId}` + chalk.gray(` │ ${s.sender.split('@')[0]} │ ${route.name}`))
            } catch (e) {
                logErr(`[BTN] ${s.buttonId}: ${e.message}`)
                await ctx.reply('❌ Something went wrong.').catch(() => {})
            }
            return   // buttons never fall through to command parsing
        }

        await checkAntilink(sock, msg, s)
        await checkToxic(sock, msg, s)
        await handleChatBot(sock, msg, s)

        const prefix = (Array.isArray(global.prefix) ? global.prefix[0] : null) || global.botprefix || '.'
        if (!s.body?.startsWith(prefix)) return

        const args = s.body.slice(prefix.length).trim().split(/ +/)
        const commandName = args.shift()?.toLowerCase()
        if (!commandName) return

        const pluginInfo = getPluginByCommand(commandName)
        if (!pluginInfo) return
        const plugin = pluginInfo.plugin
        const from = s.remoteJid

        const senderIsOwner   = owner.isOwner(s.sender)
        const senderIsCreator = owner.isCreator(s.sender)
        const senderIsAdmin   = s.isGroup ? await owner.isAdmin(sock, store, from, s.sender) : false
        const botIsAdmin      = s.isGroup ? await owner.isBotAdmin(sock, store, from) : false
        const deny = (text) => sock.sendMessage(from, { text }, { quoted: msg }).catch(() => {})

        if (plugin.isOwner && !senderIsOwner) return deny(global.msg_owner || '👑 Owner only!')
        if (plugin.isCreator && !senderIsCreator) return deny(global.msg_creator || '⭐ Creator only!')
        if (!senderIsOwner && !senderIsCreator) {
            const access = await security.checkAccess(sock, store, from, s.sender, commandName)
            if (!access.allowed) { const f = DENY_MSGS[access.reason]; if (f) await deny(f()); return }
        }
        if (plugin.isAdmin && !senderIsAdmin && !senderIsOwner) return deny(global.msg_admin || '🛡️ Admin only!')
        if (plugin.isGroup && !s.isGroup) return deny(global.msg_group || '👥 Group only!')
        if (plugin.botAdmin && !botIsAdmin) return deny(global.msg_botAdmin || '🤖 Make me admin first!')
        if (plugin.cooldown && !senderIsOwner) {
            const cd = msgHandler.checkCooldown(s.sender, commandName, plugin.cooldown)
            if (cd.onCooldown) return deny(`⏳ Wait *${cd.remaining}s*!`)
            msgHandler.setCooldown(s.sender, commandName, plugin.cooldown)
        }

        const qr  = msgHandler.createQuickReply(sock, msg)
        const ctx = {
            sock, msg, from, sender: s.sender, store, lib, prefix,
            botname: global.botname || 'FIZA',
            args, body: s.body, text: args.join(' '), command: commandName,
            isOwner: senderIsOwner, isCreator: senderIsCreator,
            isAdmin: senderIsAdmin, isGroup: s.isGroup, botAdmin: botIsAdmin,
            senderLid: s.senderLid || null,
            reply: qr.reply, react: qr.react, send: qr.send,
            typing: qr.typing, stopTyping: qr.stopTyping, deleteMsg: qr.deleteMsg,
            sleep: (ms) => new Promise(r => setTimeout(r, ms)),
            owner, security,
            plugins, pluginMeta,
        }

        if (global.autoTyping) await ctx.typing().catch(() => {})
        try {
            await plugin.run(ctx)
            msgHandler.recordCommand(commandName, true)
            log(chalk.green('[CMD]') + ` .${commandName}` + chalk.gray(` │ ${s.sender.split('@')[0]}`) + (s.isGroup ? chalk.gray(' [group]') : ''))
        } catch (e) {
            msgHandler.recordCommand(commandName, false)
            logErr(`[CMD] .${commandName}: ${e.message}`)
            await deny('❌ An error occurred. Please try again.')
        } finally {
            if (global.autoTyping) await ctx.stopTyping().catch(() => {})
        }
    } catch (e) { logErr('[FAHIM] Crash:', e.message) }
}

// ── INIT ──────────────────────────────────────────────────────────────
let initialized = false

export default async function fahim(sock, store) {
    if (!initialized) {
        await loadAllPlugins()
        if (global.plugins?.hotReload !== false) startWatcher()
        initialized = true
    }
    try { sock.ev.removeAllListeners('messages.upsert') } catch {}
    try { sock.ev.removeAllListeners('group-participants.update') } catch {}
    sock.ev.on('messages.upsert', u => handleMessages(sock, store, u))
    sock.ev.on('group-participants.update', u => handleGroupUpdate(sock, store, u))
    const stats = security.getStats()
    log(chalk.green.bold('[FAHIM] ✅ Ready'))
    log(chalk.gray(`  ├─ Prefix  : ${global.prefix?.[0] || '.'}`))
    log(chalk.gray(`  ├─ Plugins : ${plugins.size}`))
    log(chalk.gray(`  ├─ Buttons : ${buttonRoutes.size} routes`))
    log(chalk.gray(`  ├─ Mode    : ${stats.mode}`))
    log(chalk.gray(`  ├─ LID map : ${stats.lidMapSize} entries (persistent)`))
    log(chalk.gray(`  └─ Groups  : ${stats.groups}`))
}

export { plugins, pluginMeta, buttonRoutes, owner, security, loadPlugin, loadAllPlugins, getPluginByCommand, getPluginByButton }
