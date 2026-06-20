import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'
import Jimp from 'jimp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Paths
const ROOT_DIR = path.join(__dirname, '..', '..')
const TEMP_DIR = path.join(ROOT_DIR, 'temp')
const BG_PATH = path.join(ROOT_DIR, 'fizamedia', 'pictures', 'friendship.jpg')
const DEFAULT_PFP = path.join(ROOT_DIR, 'fizamedia', 'pictures', 'fiza.jpg')

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true })
}

let cachedBackground = null, defaultAvatar = null

try {
    if (fs.existsSync(BG_PATH)) {
        cachedBackground = (await Jimp.read(BG_PATH)).resize(900, 600)
        console.log('[FRIENDSHIP] ✅ Background loaded')
    }
    if (fs.existsSync(DEFAULT_PFP)) {
        defaultAvatar = (await Jimp.read(DEFAULT_PFP)).resize(250, 250).circle()
        console.log('[FRIENDSHIP] ✅ Default avatar loaded')
    }
} catch (e) {
    console.log('[FRIENDSHIP INIT]', e.message)
}

// ⚡ Fast PFP fetch
async function getPfpBuffer(jid, sock) {
    try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 3000)
        let url
        try { url = await sock.profilePictureUrl(jid, 'image') }
        catch { try { url = await sock.profilePictureUrl(jid, 'preview') } catch { clearTimeout(timeout); return null } }
        if (!url) { clearTimeout(timeout); return null }
        const res = await fetch(url, { signal: controller.signal })
        clearTimeout(timeout)
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

export default {
    name: 'friendship',
    command: ['friendship', 'bff', 'bestie'],
    desc: '💖 𝘽𝙁𝙁 𝙁𝙧𝙞𝙚𝙣𝙙𝙨𝙝𝙞𝙥 𝙏𝙚𝙨𝙩 𝙬𝙞𝙩𝙝 𝙘𝙞𝙧𝙘𝙡𝙚 𝙖𝙫𝙖𝙩𝙖𝙧𝙨',
    type: 'fun',
    category: 'fun',
    cooldown: 5,

    async run(ctx) {
        const { sock, from, msg, isGroup, react, reply, sender } = ctx

        if (!isGroup) {
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡\n🚫 𝙂𝙧𝙤𝙪𝙥 𝙤𝙣𝙡𝙮 𝙘𝙪𝙩𝙞𝙚! 💕\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            )
        }

        if (!cachedBackground) {
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝘽𝙖𝙘𝙠𝙜𝙧𝙤𝙪𝙣𝙙 𝙣𝙤𝙩 𝙡𝙤𝙖𝙙𝙚𝙙!\n📁 𝙋𝙪𝙩 𝙛𝙧𝙞𝙚𝙣𝙙𝙨𝙝𝙞𝙥.𝙟𝙥𝙜 𝙞𝙣 𝙛𝙞𝙯𝙖𝙢𝙚𝙙𝙞𝙖/𝙥𝙞𝙘𝙩𝙪𝙧𝙚𝙨/\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            )
        }

        const startTime = Date.now()
        await react('💖')

        const metadata = await sock.groupMetadata(from)
        const participants = metadata.participants
        const botJid = sock.user?.id

        let mentionedJid = []
        if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            mentionedJid = msg.message.extendedTextMessage.contextInfo.mentionedJid
                .filter(j => j !== botJid)
        }

        let user1Jid, user2Jid
        let shipMode = ''

        if (mentionedJid.length >= 2) {
            [user1Jid, user2Jid] = mentionedJid.slice(0, 2)
            shipMode = 'tagged'
        } else if (mentionedJid.length === 1) {
            user1Jid = sender
            user2Jid = mentionedJid[0]
            shipMode = 'half-tagged'
        } else {
            const pool = participants
                .filter(p => p.id !== botJid)
                .map(p => p.id)
                .sort(() => Math.random() - 0.5)

            if (pool.length >= 2) {
                user1Jid = pool[0]
                user2Jid = pool[1]
                shipMode = 'random'
            } else {
                return reply(
                    `｡ﾟ•┈୨💖୧┈•ﾟ｡\n🍓 𝙉𝙚𝙚𝙙 𝙖𝙩 𝙡𝙚𝙖𝙨𝙩 2 𝙢𝙚𝙢𝙗𝙚𝙧𝙨! 🧸\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
                )
            }
        }

        function getName(jid) {
            const participant = participants.find(p => p.id === jid)
            let name = participant?.notify || participant?.name || jid.split('@')[0]
            if (name.length > 12) name = name.slice(0, 12)
            return name
        }

        const name1 = getName(user1Jid)
        const name2 = getName(user2Jid)
        const tag1 = `@${user1Jid.split('@')[0]}`
        const tag2 = `@${user2Jid.split('@')[0]}`

        let percent = 50 + Math.floor(Math.random() * 46)
        if (name1[0]?.toLowerCase() === name2[0]?.toLowerCase()) percent += 5
        if (Math.abs(name1.length - name2.length) <= 2) percent += 5
        percent = Math.min(percent, 99)

        const quotes = [
            '𝙈𝙚𝙖𝙣𝙩 𝙩𝙤 𝙨𝙩𝙞𝙘𝙠 𝙩𝙤𝙜𝙚𝙩𝙝𝙚𝙧!',
            '𝙎𝙝𝙞𝙣𝙞𝙣𝙜 𝙗𝙧𝙞𝙜𝙝𝙩 𝙖𝙨 𝙗𝙚𝙨𝙩𝙞𝙚𝙨!',
            '𝙁𝙤𝙧𝙚𝙫𝙚𝙧 𝙫𝙞𝙗𝙞𝙣𝙜, 𝙛𝙤𝙧𝙚𝙫𝙚𝙧 𝙗𝙚𝙨𝙩𝙞𝙚𝙨 ✨',
            '𝘽𝙪𝙞𝙡𝙩 𝙙𝙞𝙛𝙛𝙚𝙧𝙚𝙣𝙩. 𝘽𝙤𝙣𝙙 𝙪𝙣𝙗𝙧𝙚𝙖𝙠𝙖𝙗𝙡𝙚.',
            '𝙇𝙞𝙠𝙚 𝙛𝙧𝙞𝙚𝙨 𝙖𝙣𝙙 𝙠𝙚𝙩𝙘𝙝𝙪𝙥!',
            '𝙎𝙤𝙪𝙡𝙢𝙖𝙩𝙚 𝙛𝙧𝙞𝙚𝙣𝙙𝙨 💗',
            '𝙏𝙝𝙞𝙨 𝙘𝙪𝙩𝙚 𝙨𝙝𝙤𝙪𝙡𝙙 𝙗𝙚 𝙞𝙡𝙡𝙚𝙜𝙖𝙡 💞',
            '𝙎𝙬𝙚𝙚𝙩 𝙖𝙨 𝙨𝙪𝙜𝙖𝙧, 𝙘𝙡𝙤𝙨𝙚 𝙖𝙨 𝙜𝙡𝙪𝙚 🍬'
        ]
        const quote = quotes[Math.floor(Math.random() * quotes.length)]

        let result
        if (percent >= 95) result = '💘 𝙎𝙊𝙐𝙇 𝘽𝙀𝙎𝙏𝙄𝙀𝙎!'
        else if (percent >= 85) result = '💖 𝙍𝙄𝘿𝙀 𝙊𝙍 𝘿𝙄𝙀!'
        else if (percent >= 75) result = '💕 𝘽𝙀𝙎𝙏 𝙁𝙍𝙄𝙀𝙉𝘿𝙎!'
        else if (percent >= 65) result = '🥰 𝙂𝙊𝙊𝘿 𝙁𝙍𝙄𝙀𝙉𝘿𝙎!'
        else result = '🌸 𝘽𝙐𝘿𝘿𝙄𝙀𝙎!'

        try {
            const [pfpBuf1, pfpBuf2] = await Promise.all([
                getPfpBuffer(user1Jid, sock),
                getPfpBuffer(user2Jid, sock)
            ])

            const bg = cachedBackground.clone()

            const [av1, av2] = await Promise.all([
                (async () => {
                    if (pfpBuf1) return (await Jimp.read(pfpBuf1)).resize(250, 250).circle()
                    return defaultAvatar ? defaultAvatar.clone() : null
                })(),
                (async () => {
                    if (pfpBuf2) return (await Jimp.read(pfpBuf2)).resize(250, 250).circle()
                    return defaultAvatar ? defaultAvatar.clone() : null
                })()
            ])

            if (av1) bg.composite(av1, 70, 120)
            if (av2) bg.composite(av2, 580, 120)

            const imageBuffer = await bg.getBufferAsync(Jimp.MIME_PNG)

            const barFilled = Math.floor(percent / 10)
            const barEmpty = 10 - barFilled
            const progressBar = `┃${'💖'.repeat(barFilled)}${'🤍'.repeat(barEmpty)}┃`

            const randomTag = shipMode === 'random' ? '\n🎲 𝙍𝙖𝙣𝙙𝙤𝙢 𝘽𝙁𝙁!' : ''

            const caption = `｡ﾟ•┈୨💖୧┈•ﾟ｡
🌸 *${tag1}* × *${tag2}* 🌸
${progressBar} 💖 *${percent}%* — ${result}
💌 ${quote}${randomTag}
｡ﾟ•┈୨🌸୧┈•ﾟ｡`

            await sock.sendMessage(from, {
                image: imageBuffer,
                caption: caption,
                mentions: [user1Jid, user2Jid]
            }, { quoted: msg })

            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
            console.log(`[friendship] ${shipMode} | ${name1} × ${name2} | ${percent}% | ⚡ ${elapsed}s`)

        } catch (e) {
            console.log('[FRIENDSHIP ERROR]', e)
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙁𝙖𝙞𝙡𝙚𝙙: ${e.message}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            )
        }
    }
}