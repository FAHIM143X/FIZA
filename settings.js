// ============================
// 🌸 FIZA BOT SETTINGS
// ============================

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ════════════════════════════════
// 🤖 BOT INFO
// ════════════════════════════════

global.botname = '𝐹𝐼𝒁𝐴💗'
global.ownername = '𝐹𝐴𝐻𝐼𝑀💋'
global.botversion = '3.0.0'

// ════════════════════════════════
// 👑 OWNERS
// ONLY PUT PHONE NUMBERS
// NO @s.whatsapp.net
// NO @lid
// ════════════════════════════════

global.ownerNumber = [
    '917289881303',
    '916284912807'
]

global.creatorNumber = [
    '917289881303'
]

// ════════════════════════════════
// 📱 BOT NUMBER
// ════════════════════════════════

global.number_bot = ''

// optional helper jids
global.bot_jid = global.number_bot + '@s.whatsapp.net'
global.owner_jid = global.ownerNumber[0] + '@s.whatsapp.net'

// ════════════════════════════════
// 🔥 JID HELPERS
// ════════════════════════════════

global.cleanNumber = (jid = '') => {
    return String(jid)
        .split(':')[0]
        .split('@')[0]
        .replace(/[^0-9]/g, '')
}

global.toJid = (num = '') => {
    return global.cleanNumber(num) + '@s.whatsapp.net'
}

// ════════════════════════════════
// 🆔 LID ↔ PHONE MAP
// WhatsApp Community/Channel groups assign members a LID (Local ID)
// instead of their real phone number JID. This map resolves LIDs
// back to phone numbers so owner checks work in Community groups.
// Populated automatically on startup via contacts.upsert in fiza.js
// ════════════════════════════════

global.lidMap = {}   // lid_number  →  phone_number
global.phoneToLid = {} // phone_number → lid_number  (reverse)

// ════════════════════════════════
// PREFIX
// ════════════════════════════════

global.prefix = ['.']
global.multiPrefix = ['.']
global.botprefix = '.'   // single-string alias used in fahim.js

// ════════════════════════════════
// BOT MODE
// ════════════════════════════════

global.workMode = 'public'

// public / private / group / inbox / off

// ════════════════════════════════
// PAIRING
// ════════════════════════════════

global.usePairingCode = true

// ════════════════════════════════
// AUTO FEATURES
// ════════════════════════════════

global.autoRead = true
global.autoTyping = false
global.autoOnline = true
global.autoReact = false
global.autoSticker = false

// ════════════════════════════════
// GROUP SETTINGS
// ════════════════════════════════

global.welcomeEnabled = true
global.goodbyeEnabled = true

global.welcomeText =
`👋 Hello @user
Welcome to *@group* 🍬`

global.goodbyeText =
`👋 Goodbye @user 💔`

// ════════════════════════════════
// BOT RESPONSES
// ════════════════════════════════

global.msg_owner = '👑 Owner only!'
global.msg_admin = '🛡️ Admin only!'
global.msg_group = '👥 Group only!'
global.msg_creator = '⭐ Creator only!'
global.msg_private = '🔒 Private chat only!'
global.msg_botAdmin = '🤖 Make me admin first!'
global.msg_cooldown = '⏳ Slow down!'
global.msg_error = '⚠️ Something went wrong!'
global.msg_banned = '🚫 You are banned!'
global.msg_muted = '🔇 Group muted!'

// ════════════════════════════════
// LANGUAGE
// ════════════════════════════════

global.language = 'en'
global.timezone = 'Asia/Kolkata'

// ════════════════════════════════
// SESSION
// ════════════════════════════════

global.sessionName = 'fiza-session'

// ════════════════════════════════
// SECURITY
// ════════════════════════════════

global.antiSpam = false
global.antiCall = false
global.antiDelete = false
global.antiBot = true
global.antiToxic = false

// ════════════════════════════════
// LIMITS
// ════════════════════════════════

global.limit = {
    free: 25,
    premium: 1000,
    owner: Infinity,
}

// ════════════════════════════════
// DEFAULT GROUP DATA
// ════════════════════════════════

global.defaultGroupSettings = {
    welcome: true,
    goodbye: true,
    antilink: false,
    antitoxic: false,
    chatbot: false,
    muted: false,
    mode: 'default',
}

// ════════════════════════════════
// PLUGINS
// ════════════════════════════════

global.plugins = {
    hotReload: true,
    disabled: [],
}

// ════════════════════════════════
// DIRECTORIES
// ════════════════════════════════

global.pluginDir = path.join(__dirname, 'plugins')
global.tempDir = path.join(__dirname, 'temp')
global.mediaDir = path.join(__dirname, 'media')

// auto create folders
for (const dir of [
    global.pluginDir,
    global.tempDir,
    global.mediaDir
]) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
}

// ════════════════════════════════
// APIs
// ════════════════════════════════

global.APIs = {
    zenz: 'https://api.zenz.xyz',
    lolhuman: 'https://api.lolhuman.xyz',
}

global.APIKeys = {
    'https://api.zenz.xyz': '',
    'https://api.lolhuman.xyz': '',
}

// ════════════════════════════════
// JIMP GLOBAL
// ════════════════════════════════

try {
    const jimpModule = await import('jimp')

    global.Jimp =
        jimpModule.Jimp ||
        jimpModule.default?.Jimp ||
        jimpModule.default ||
        jimpModule

    console.log('✅ Jimp loaded')
} catch {
    console.log('⚠️ Jimp not installed')
}

// ════════════════════════════════
// DISPLAY
// ════════════════════════════════

console.log(`
╔══════════════════════════════╗
║       🌸 FIZA BOT READY     ║
╠══════════════════════════════╣
║ 🤖 ${global.botname}
║ 👑 ${global.ownername}
║ 📱 ${global.number_bot}
║ 🔧 ${global.workMode}
║ 📝 ${global.multiPrefix.join(', ')}
╚══════════════════════════════╝
`)

// ════════════════════════════════
// EXPORT
// ════════════════════════════════

export default global
