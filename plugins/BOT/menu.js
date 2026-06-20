import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import moment from 'moment-timezone'
import axios from 'axios'
import '../../settings.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const THUMB_PATH = path.join(__dirname, '..', '..', 'fizamedia', 'pictures', 'fiza.jpg')

export default {
    name: 'menu',
    command: ['menu', 'help', 'xejin'],
    tags: ['main'],
    desc: '🌸 𝙎𝙩𝙮𝙡𝙞𝙨𝙝 𝙞𝙣𝙩𝙚𝙧𝙖𝙘𝙩𝙞𝙫𝙚 𝙠𝙖𝙬𝙖𝙞𝙞 𝙢𝙚𝙣𝙪',

    async run({ sock, msg, prefix }) {
        const chatId = msg.key?.remoteJid
        const pushName = msg.pushName || 'User'
        const uptime = process.uptime()

        const formatUptime = (seconds) => {
            const h = Math.floor(seconds / 3600)
            const m = Math.floor((seconds % 3600) / 60)
            const s = Math.floor(seconds % 60)
            return `${h}h ${m}m ${s}s`
        }

        const botName = global.botname || 'FIZA'
        const ownerName = global.ownerName || global.ownername || 'FAHIM'
        const pluginCount = Object.keys(global.plugins || {}).length || 0
        const mode = global.self ? 'Self 🔒' : 'Public 🌍'

        const now = moment().tz('Asia/Kolkata')
        const stars = String.fromCharCode(0x200e).repeat(4001)

        const header = `
╭──🌷 *𝕄𝔼ℕ𝕌 𝕊𝕌𝕄𝕄𝔸ℝ𝕐* 🌷──╮
│ 🎐 𝙽𝚊𝚖𝚎: ${botName}
│ 🧷 𝙼𝚘𝚍𝚎: ${mode}
│ ⏳ 𝚄𝚙𝚝𝚒𝚖𝚎: ${formatUptime(uptime)}
│ 📆 𝙳𝚊𝚝𝚎: ${now.format('dddd, MMMM Do YYYY')}
│ 💖 𝙿𝚕𝚞𝚐𝚒𝚗𝚜: ${pluginCount}+
│ 💌 𝙿𝚛𝚎𝚏𝚒𝚡: ${prefix || '.'}
│ 👑 𝙾𝚠𝚗𝚎𝚛: ${ownerName}
╰────❀──────🎀────╯
${stars}
`.trim()

        const pluginsDir = path.join(__dirname, '..', '..', 'plugins')
        const categories = scanCategories(pluginsDir)
        
        let menuBody = header + '\n\n'
        
        for (const [category, commands] of Object.entries(categories)) {
            const catEmoji = getCatEmoji(category)
            menuBody += `╭━━〔 ${catEmoji} ${category.toUpperCase()} 〕━━⬣\n`
            for (const cmd of commands) {
                menuBody += `│ • ${prefix}${cmd}\n`
            }
            menuBody += `╰━━〔 🖤 𝙀𝙉𝘿 〕━━⬣\n\n`
        }

        let thumb = null
        if (fs.existsSync(THUMB_PATH)) {
            thumb = fs.readFileSync(THUMB_PATH)
        }
        if (!thumb) {
            try {
                const res = await axios.get('https://files.catbox.moe/3afsch.jpg', { responseType: 'arraybuffer' })
                thumb = Buffer.from(res.data)
            } catch {}
        }

        const contextInfo = {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363400771679306@newsletter',
                newsletterName: 'FIZA',
                serverMessageId: -1
            },
            externalAdReply: {
                title: `🌸 ${botName}`,
                body: `𝘽𝙔 ${ownerName}`,
                mediaType: 1,
                thumbnail: thumb || undefined,
                renderLargerThumbnail: true,
                showAdAttribution: false,
                sourceUrl: 'https://github.com/iblamefahim'
            }
        }

        await sock.sendMessage(chatId, {
            text: menuBody,
            contextInfo: contextInfo
        }, { quoted: msg })

        const audioDir = path.join(__dirname, '..', '..', 'media', 'audio')
        if (fs.existsSync(audioDir)) {
            const audioFiles = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3'))
            if (audioFiles.length > 0) {
                const randomAudio = path.join(audioDir, audioFiles[Math.floor(Math.random() * audioFiles.length)])
                try {
                    await sock.sendMessage(chatId, {
                        audio: fs.readFileSync(randomAudio),
                        mimetype: 'audio/mpeg',
                        ptt: true
                    }, { quoted: msg })
                } catch {}
            }
        }
    }
}

function scanCategories(pluginsDir) {
    const categories = {}
    if (!fs.existsSync(pluginsDir)) return categories
    
    function scanDir(dir, category = 'root') {
        const items = fs.readdirSync(dir)
        for (const item of items) {
            const fullPath = path.join(dir, item)
            const stat = fs.statSync(fullPath)
            if (stat.isDirectory()) {
                scanDir(fullPath, item)
            } else if (stat.isFile() && item.endsWith('.js')) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8')
                    const cmdMatch = content.match(/command\s*:\s*\[([^\]]+)\]/)
                    if (cmdMatch) {
                        const commands = cmdMatch[1]
                            .split(',')
                            .map(c => c.trim().replace(/['"]/g, ''))
                            .filter(c => c && c !== 'undefined')
                        if (commands.length > 0) {
                            const cat = category === 'root' ? 'misc' : category
                            if (!categories[cat]) categories[cat] = []
                            categories[cat].push(commands[0])
                        }
                    } else {
                        const singleCmd = content.match(/command\s*:\s*['"]([^'"]+)['"]/)
                        if (singleCmd) {
                            const cat = category === 'root' ? 'misc' : category
                            if (!categories[cat]) categories[cat] = []
                            categories[cat].push(singleCmd[1])
                        }
                    }
                } catch {}
            }
        }
    }
    scanDir(pluginsDir)
    return categories
}

function getCatEmoji(category) {
    const emojis = {
        'info': 'ℹ️', 'main': '⚡', 'owner': '👑', 'group': '👥',
        'fun': '🎮', 'games': '🎯', 'media': '🖼', 'downloader': '💾',
        'search': '🔍', 'ai': '💬', 'chat': '💬', 'match': '❤️',
        'react': '🎭', 'tools': '🔧', 'rpg': '⚔️', 'misc': '📌'
    }
    return emojis[category] || '📌'
}