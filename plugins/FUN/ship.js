import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Jimp from 'jimp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Paths
const ROOT_DIR = path.join(__dirname, '..', '..')
const TEMP_DIR = path.join(ROOT_DIR, 'temp')
const BG_PATH = path.join(ROOT_DIR, 'fizamedia', 'pictures', 'shipbackground.jpg')
const HEART_MASK_PATH = path.join(ROOT_DIR, 'fizamedia', 'pictures', 'heart.png')
const DEFAULT_PFP = path.join(ROOT_DIR, 'fizamedia', 'pictures', 'fiza.jpg')

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true })
}

let cachedBackground = null, heartMask = null, defaultAvatar = null

try {
    if (fs.existsSync(BG_PATH)) {
        cachedBackground = (await Jimp.read(BG_PATH)).resize(900, 600)
        console.log('[SHIP] ✅ Background loaded')
    }
    if (fs.existsSync(HEART_MASK_PATH)) {
        heartMask = (await Jimp.read(HEART_MASK_PATH)).resize(250, 250)
        console.log('[SHIP] ✅ Heart mask loaded')
    }
    if (fs.existsSync(DEFAULT_PFP)) {
        defaultAvatar = (await Jimp.read(DEFAULT_PFP)).resize(250, 250)
        if (heartMask) defaultAvatar = defaultAvatar.mask(heartMask.clone(), 0, 0)
        console.log('[SHIP] ✅ Default avatar loaded')
    }
} catch (e) {
    console.log('[SHIP INIT]', e.message)
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
    name: 'ship',
    command: ['ship', 'lovetest', 'couple'],
    desc: '💖 𝘽𝙚𝙖𝙪𝙩𝙞𝙛𝙪𝙡 𝙨𝙝𝙞𝙥 𝙘𝙖𝙧𝙙 𝙬𝙞𝙩𝙝 𝙝𝙚𝙖𝙧𝙩-𝙨𝙝𝙖𝙥𝙚𝙙 𝙥𝙧𝙤𝙛𝙞𝙡𝙚 𝙥𝙞𝙘𝙨',
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
                `｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝘽𝙖𝙘𝙠𝙜𝙧𝙤𝙪𝙣𝙙 𝙣𝙤𝙩 𝙡𝙤𝙖𝙙𝙚𝙙!\n📁 𝙋𝙪𝙩 𝙨𝙝𝙞𝙥𝙗𝙖𝙘𝙠𝙜𝙧𝙤𝙪𝙣𝙙.𝙟𝙥𝙜 𝙞𝙣 𝙛𝙞𝙯𝙖𝙢𝙚𝙙𝙞𝙖/𝙥𝙞𝙘𝙩𝙪𝙧𝙚𝙨/\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
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

        let percent = 60 + Math.floor(Math.random() * 36)
        if (name1[0]?.toLowerCase() === name2[0]?.toLowerCase()) percent += 5
        if (Math.abs(name1.length - name2.length) <= 2) percent += 5
        percent = Math.min(percent, 99)

        let result, emoji, loveNote
        if (percent >= 95) {
            result = '💘 𝙎𝙊𝙐𝙇𝙈𝘼𝙏𝙀𝙎 𝙁𝙊𝙍𝙀𝙑𝙀𝙍'; emoji = '💘'
            loveNote = '𝙈𝙖𝙙𝙚 𝙛𝙤𝙧 𝙚𝙖𝙘𝙝 𝙤𝙩𝙝𝙚𝙧!'
        } else if (percent >= 85) {
            result = '💖 𝙋𝙀𝙍𝙁𝙀𝘾𝙏 𝙈𝘼𝙏𝘾𝙃'; emoji = '💖'
            loveNote = '𝘼 𝙢𝙖𝙩𝙘𝙝 𝙢𝙖𝙙𝙚 𝙞𝙣 𝙝𝙚𝙖𝙫𝙚𝙣!'
        } else if (percent >= 75) {
            result = '💕 𝙎𝙒𝙀𝙀𝙏 𝘾𝙊𝙐𝙋𝙇𝙀'; emoji = '💕'
            loveNote = '𝙎𝙪𝙘𝙝 𝙖 𝙨𝙬𝙚𝙚𝙩 𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙞𝙤𝙣!'
        } else if (percent >= 65) {
            result = '🥰 𝘾𝙐𝙏𝙀 𝘾𝙊𝙐𝙋𝙇𝙀'; emoji = '🥰'
            loveNote = '𝘼𝙙𝙤𝙧𝙖𝙗𝙡𝙚 𝙩𝙤𝙜𝙚𝙩𝙝𝙚𝙧!'
        } else {
            result = '🌸 𝙂𝙊𝙊𝘿 𝙁𝙍𝙄𝙀𝙉𝘿𝙎'; emoji = '🌸'
            loveNote = '𝙁𝙧𝙞𝙚𝙣𝙙𝙨𝙝𝙞𝙥 𝙞𝙨 𝙥𝙧𝙚𝙘𝙞𝙤𝙪𝙨!'
        }

        try {
            const [pfpBuf1, pfpBuf2] = await Promise.all([
                getPfpBuffer(user1Jid, sock),
                getPfpBuffer(user2Jid, sock)
            ])

            // --- FIX START: Preserve aspect ratio ---
            const bg = cachedBackground.clone()
            // 1. We don't resize it again because it's already sized to 900x600 from the initial load.
            // If your original background is 900x600 it fits perfectly.
            
            // --- FIX START: Updated sizes for new background ---
            // The hearts on your new image seem to be around 270px wide.
            const pfpSize = 260; 
            // Left heart center is roughly X:190, Right heart center is roughly X:710
            // (Assuming a 900px wide canvas)
            const leftX = 60;   
            const rightX = 580;
            const yPos = 110; // Adjust this slightly up/down if the faces are clipping
            // --- FIX END ---

            const [av1, av2] = await Promise.all([
                (async () => {
                    if (pfpBuf1) {
                        const img = (await Jimp.read(pfpBuf1)).resize(pfpSize, pfpSize)
                        return heartMask ? img.mask(heartMask.clone(), 0, 0) : img.circle()
                    }
                    return defaultAvatar ? defaultAvatar.clone() : null
                })(),
                (async () => {
                    if (pfpBuf2) {
                        const img = (await Jimp.read(pfpBuf2)).resize(pfpSize, pfpSize)
                        return heartMask ? img.mask(heartMask.clone(), 0, 0) : img.circle()
                    }
                    return defaultAvatar ? defaultAvatar.clone() : null
                })()
            ])

            if (av1) bg.composite(av1, leftX, yPos)
            if (av2) bg.composite(av2, rightX, yPos)

            const imageBuffer = await bg.getBufferAsync(Jimp.MIME_PNG)

            const barFilled = Math.floor(percent / 10)
            const barEmpty = 10 - barFilled
            const progressBar = `┃${'█'.repeat(barFilled)}${'░'.repeat(barEmpty)}┃`

            const randomTag = shipMode === 'random'
                ? `\n🎲 *𝙍𝙖𝙣𝙙𝙤𝙢 𝙎𝙝𝙞𝙥!*`
                : ''

            const caption = `｡ﾟ•┈୨💖୧┈•ﾟ｡
${emoji} *${tag1}*  ✖  *${tag2}* ${emoji}

${progressBar}  💘 *${percent}%*
🌟 ${result}
💌 ${loveNote}
${randomTag}
｡ﾟ•┈୨🌸୧┈•ﾟ｡`

            await sock.sendMessage(from, {
                image: imageBuffer,
                caption: caption,
                mentions: [user1Jid, user2Jid]
            }, { quoted: msg })

            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
            console.log(`[ship] ${shipMode} | ${name1} ✖ ${name2} | ${percent}% | ⚡ ${elapsed}s`)

        } catch (e) {
            console.log('[SHIP ERROR]', e)
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙁𝙖𝙞𝙡𝙚𝙙: ${e.message}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            )
        }
    }
}