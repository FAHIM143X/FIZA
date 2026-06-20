// ╔══════════════════════════════════════════════════════════════╗
// ║            🎀  WELCOME  —  Group Join Alert                 ║
// ║   Profile Pic · External Ad Reply · On/Off per Group       ║
// ║   Manual: .welcome @tag → sends welcome to tagged user     ║
// ╚══════════════════════════════════════════════════════════════╝

import fs   from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import owner from '../../owner.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const DB_PATH = path.join(__dirname, '../../database/welcome.json')

function loadDB() {
    if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '{}')
    try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')) } catch { return {} }
}
function saveDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

const FALLBACK_IMAGE = 'https://i.ibb.co/TmhYTWh/xejin.jpg'

async function getProfilePic(sock, jid) {
    try {
        const url = await sock.profilePictureUrl(jid, 'image')
        const res = await fetch(url + '?t=' + Date.now())
        return Buffer.from(await res.arrayBuffer())
    } catch {
        try {
            const res = await fetch(FALLBACK_IMAGE)
            return Buffer.from(await res.arrayBuffer())
        } catch {
            return null
        }
    }
}

function buildWelcomeText(userJid, groupName, memberCount, date, time) {
    const tag = `@${userJid.split('@')[0]}`
    return (
        `｡ﾟ•┈୨💖୧┈•ﾟ｡\n` +
        `╭── 🎀 *𝙒𝙀𝙇𝘾𝙊𝙈𝙀* 🎀 ──╮\n` +
        `│ 👋 𝙃𝙚𝙮 ${tag}!\n` +
        `│ 💖 𝙒𝙚𝙡𝙘𝙤𝙢𝙚 𝙩𝙤 ${groupName}\n` +
        `│ 👥 𝙈𝙚𝙢𝙗𝙚𝙧𝙨: ${memberCount}\n` +
        `│ 📅 ${date}\n` +
        `│ ⏰ ${time}\n` +
        `│ 🌸 𝙀𝙣𝙟𝙤𝙮 𝙮𝙤𝙪𝙧 𝙨𝙩𝙖𝙮~\n` +
        `╰── ✨ ${global.botname || 'FIZA'} ✨ ──╯\n` +
        `｡ﾟ•┈୨🌸୧┈•ﾟ｡`
    ).trim()
}

const plugin = {
    name:    'welcome',
    command: ['welcome'],
    desc:    '🌸 𝙀𝙣𝙖𝙗𝙡𝙚/𝙙𝙞𝙨𝙖𝙗𝙡𝙚 𝙬𝙚𝙡𝙘𝙤𝙢𝙚 𝙤𝙧 𝙨𝙚𝙣𝙙 𝙬𝙚𝙡𝙘𝙤𝙢𝙚 𝙩𝙤 @𝙪𝙨𝙚𝙧',
    usage:   '.welcome on | .welcome off | .welcome @user',
    category: 'group',

    async run({ sock, msg, from, sender, args, reply }) {

        if (!from?.endsWith('@g.us'))
            return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙂𝙧𝙤𝙪𝙥 𝙤𝙣𝙡𝙮!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

        let meta
        try { meta = await sock.groupMetadata(from) } catch {
            return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝘾𝙤𝙪𝙡𝙙 𝙣𝙤𝙩 𝙛𝙚𝙩𝙘𝙝 𝙜𝙧𝙤𝙪𝙥 𝙞𝙣𝙛𝙤.\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
        }

        const participants = meta.participants || []
        const normalize = (j) => String(j).split(':')[0].split('@')[0].replace(/[^0-9]/g, '')

        const senderIsAdmin = participants.some(p =>
            normalize(p.id) === normalize(sender) && (p.admin === 'admin' || p.admin === 'superadmin')
        )
        const senderIsOwner = owner.isOwner(sender)

        // ── .welcome @user → Send welcome silently ──────────────────
        const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        const quotedSender = msg.message?.extendedTextMessage?.contextInfo?.participant
        const targetJid = mentionedJid || quotedSender

        if (targetJid) {
            if (!senderIsAdmin && !senderIsOwner)
                return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🔐 𝙊𝙣𝙡𝙮 𝘼𝙙𝙢𝙞𝙣𝙨 𝙤𝙧 𝙊𝙬𝙣𝙚𝙧!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

            try {
                const memberCount = participants.length
                let displayName = targetJid.split('@')[0]
                try { const info = await sock.onWhatsApp(targetJid); displayName = info?.[0]?.notify || displayName } catch {}

                const thumbnail = await getProfilePic(sock, targetJid)
                const now = new Date()
                const time = now.toLocaleTimeString('en-GB')
                const date = now.toLocaleDateString('en-GB')
                const text = buildWelcomeText(targetJid, meta.subject, memberCount, date, time)

                await sock.sendMessage(from, {
                    text,
                    contextInfo: {
                        mentionedJid: [targetJid],
                        externalAdReply: {
                            title: `🌸 Welcome ${displayName}`,
                            body: `👥 ${memberCount} members in ${meta.subject}`,
                            thumbnail: thumbnail || undefined,
                            mediaType: 1,
                            renderLargerThumbnail: false,
                            showAdAttribution: false,
                        },
                    },
                })
                // ✅ Silently sent — no reply
                return
            } catch (e) {
                console.error('[Welcome Manual]', e.message)
                return
            }
        }

        // ── .welcome on / off ────────────────────────────────────────
        if (!senderIsAdmin && !senderIsOwner)
            return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🔐 𝙊𝙣𝙡𝙮 𝘼𝙙𝙢𝙞𝙣𝙨 𝙤𝙧 𝙊𝙬𝙣𝙚𝙧!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

        const sub = args[0]?.toLowerCase()

        if (sub === 'on') {
            const db = loadDB(); db[from] = true; saveDB(db)
            return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n✅ 𝙒𝙚𝙡𝙘𝙤𝙢𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙚𝙣𝙖𝙗𝙡𝙚𝙙!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
        }

        if (sub === 'off') {
            const db = loadDB(); delete db[from]; saveDB(db)
            return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🚫 𝙒𝙚𝙡𝙘𝙤𝙢𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙙𝙞𝙨𝙖𝙗𝙡𝙚𝙙!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
        }

        return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n📌 .welcome on | .welcome off | .welcome @user\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    },

    // ── onWelcome hook ─────────────────────────────────────────────────
    async onWelcome({ sock, store, group, participants, groupName, meta }) {
        try {
            const db = loadDB()
            if (!db[group]) return
            const memberCount = meta?.participants?.length || '?'

            for (const userJid of participants) {
                try {
                    let displayName = userJid.split('@')[0]
                    try { const info = await sock.onWhatsApp(userJid); displayName = info?.[0]?.notify || displayName } catch {}
                    const thumbnail = await getProfilePic(sock, userJid)
                    const now = new Date()
                    const time = now.toLocaleTimeString('en-GB')
                    const date = now.toLocaleDateString('en-GB')
                    const text = buildWelcomeText(userJid, groupName, memberCount, date, time)
                    await sock.sendMessage(group, {
                        text,
                        contextInfo: {
                            mentionedJid: [userJid],
                            externalAdReply: {
                                title: `🌸 Welcome ${displayName}`,
                                body: `👥 ${memberCount} members in ${groupName}`,
                                thumbnail: thumbnail || undefined,
                                mediaType: 1,
                                renderLargerThumbnail: false,
                                showAdAttribution: false,
                            },
                        },
                    })
                } catch (e) { console.error('[Welcome]', e.message) }
            }
        } catch (e) { console.error('[Welcome]', e.message) }
    },

    // ── onGoodbye hook ─────────────────────────────────────────────────
    async onGoodbye({ sock, store, group, participants, groupName, meta }) {
        try {
            const db = loadDB()
            if (!db[group]) return
            for (const userJid of participants) {
                try {
                    const tag = `@${userJid.split('@')[0]}`
                    const memberCount = meta?.participants?.length || '?'
                    const thumbnail = await getProfilePic(sock, userJid)
                    await sock.sendMessage(group, {
                        text: (
                            `｡ﾟ•┈୨💖୧┈•ﾟ｡\n` +
                            `╭── 👋 *𝙂𝙊𝙊𝘿𝘽𝙔𝙀* ──╮\n` +
                            `│ 💔 ${tag} 𝙡𝙚𝙛𝙩\n` +
                            `│ 👥 ${groupName}\n` +
                            `│ 📊 ${memberCount} 𝙢𝙚𝙢𝙗𝙚𝙧𝙨\n` +
                            `╰── 🧁 𝘽𝙮𝙚 𝙗𝙮𝙚~\n` +
                            `｡ﾟ•┈୨🌸୧┈•ﾟ｡`
                        ).trim(),
                        contextInfo: {
                            mentionedJid: [userJid],
                            externalAdReply: {
                                title: `👋 Goodbye ${userJid.split('@')[0]}`,
                                body: `👥 ${memberCount} members in ${groupName}`,
                                thumbnail: thumbnail || undefined,
                                mediaType: 1,
                                renderLargerThumbnail: false,
                                showAdAttribution: false,
                            },
                        },
                    })
                } catch (e) { console.error('[Goodbye]', e.message) }
            }
        } catch (e) { console.error('[Goodbye]', e.message) }
    },
}

export default plugin