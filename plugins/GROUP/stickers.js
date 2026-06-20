import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'
import { spawn } from 'child_process'
import { downloadMediaMessage } from '@whiskeysockets/baileys'
import axios from 'axios'

export default {
    name: 'sticker',
    command: ['sticker', 's'],
    desc: '🖼️ 𝘾𝙤𝙣𝙫𝙚𝙧𝙩 𝙞𝙢𝙖𝙜𝙚 𝙤𝙧 𝙫𝙞𝙙𝙚𝙤 𝙩𝙤 𝙨𝙩𝙞𝙘𝙠𝙚𝙧',
    type: 'tools',
    category: 'tools',

    async run({ msg, sock }) {
        const chatId = msg.key?.remoteJid

        await sock.sendMessage(chatId, {
            react: { text: '🌟', key: msg.key }
        })

        // Find media in quoted or current message
        const quotedMedia = msg.quotedMessage?.extendedTextMessage?.contextInfo?.quotedMessage
        const mediaType = quotedMedia
            ? Object.keys(quotedMedia).find(k => k.includes('image') || k.includes('video'))
            : Object.keys(msg.message || {}).find(k => k.includes('image') || k.includes('video'))

        const mediaMsg = quotedMedia
            ? { message: { [mediaType]: quotedMedia[mediaType] } }
            : { message: { [mediaType]: msg.message[mediaType] } }

        if (!mediaType || !mediaMsg.message[mediaType]) {
            return sock.sendMessage(chatId, {
                text: `｡ﾟ•┈୨💖୧┈•ﾟ｡
🌟 *𝙎𝙏𝙄𝘾𝙆𝙀𝙍 𝙈𝘼𝙆𝙀𝙍*

🍓 𝙍𝙚𝙥𝙡𝙮 𝙩𝙤 𝙖𝙣 𝙞𝙢𝙖𝙜𝙚/𝙫𝙞𝙙𝙚𝙤
💝 𝙐𝙨𝙖𝙜𝙚: .s (reply to media)
🧁 𝙎𝙪𝙥𝙥𝙤𝙧𝙩𝙨 𝙞𝙢𝙖𝙜𝙚 & 𝙫𝙞𝙙𝙚𝙤~
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            }, { quoted: msg })
        }

        // Download media
        let buffer
        try {
            buffer = await downloadMediaMessage(mediaMsg, 'buffer', {}, {
                logger: sock.logger,
                reuploadRequest: sock.updateMediaMessage
            })
        } catch (err) {
            return sock.sendMessage(chatId, {
                text: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙁𝙖𝙞𝙡𝙚𝙙 𝙩𝙤 𝙙𝙤𝙬𝙣𝙡𝙤𝙖𝙙: ${err.message || 'Unknown'}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            }, { quoted: msg })
        }

        const isVideo = mediaType.includes('video')
        const inputFile = path.join(tmpdir(), `input_${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`)
        const outputFile = path.join(tmpdir(), `output_${Date.now()}.webp`)

        fs.writeFileSync(inputFile, buffer)

        try {
            // Convert to sticker
            await convertToSticker(inputFile, outputFile)

            const stickerBuffer = fs.readFileSync(outputFile)
            const thumb = await getThumbBuffer('https://files.catbox.moe/9xuiwp.jpg')

            await sock.sendMessage(chatId, {
                sticker: stickerBuffer,
                contextInfo: {
                    externalAdReply: {
                        title: `🌸 FIZA Sticker`,
                        body: `🧁 Made with love~`,
                        mediaType: 1,
                        renderLargeThumbnail: true,
                        jpegThumbnail: thumb,
                        sourceUrl: 'https://github.com/iblamefahim'
                    }
                }
            }, { quoted: msg })

        } catch (err) {
            await sock.sendMessage(chatId, {
                text: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙁𝙁𝙢𝙥𝙚𝙜 𝙛𝙖𝙞𝙡𝙚𝙙: ${err.message || err}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            }, { quoted: msg })
        } finally {
            if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile)
            if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile)
        }
    }
}

// Convert media to webp sticker
function convertToSticker(input, output) {
    const args = [
        '-i', input,
        '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=15',
        '-c:v', 'libwebp',
        '-lossless', '0',
        '-t', '10',
        '-y',
        '-preset', 'default',
        '-an',
        output
    ]

    return new Promise((resolve, reject) => {
        spawn('ffmpeg', args)
            .on('close', code => code === 0 ? resolve() : reject(new Error('FFmpeg error')))
    })
}

// Get thumbnail buffer
async function getThumbBuffer(url) {
    try {
        const res = await axios.get(url, { responseType: 'arraybuffer' })
        return Buffer.from(res.data)
    } catch {
        return fs.readFileSync('./media/default.jpg')
    }
}