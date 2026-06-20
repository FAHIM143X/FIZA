import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import yts from 'yt-search'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

export default {
    name: 'music',
    command: ['music'],
    desc: '🎧 𝙋𝙡𝙖𝙮 𝙢𝙪𝙨𝙞𝙘 𝙗𝙮 𝙣𝙖𝙢𝙚',
    category: 'downloader',
    cooldown: 10,

    async run({ msg, sock, args, reply, react }) {
        const query = args.join(' ')
        const chatId = msg.key?.remoteJid

        if (!query) {
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
🎧 *𝙋𝙇𝘼𝙔 𝙈𝙐𝙎𝙄𝘾*

🍓 .play perfect
💝 .play faded alan walker
🌸 .play believer

🧁 𝙅𝙪𝙨𝙩 𝙩𝙮𝙥𝙚 𝙩𝙝𝙚 𝙨𝙤𝙣𝙜 𝙣𝙖𝙢𝙚~
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            )
        }

        const startTime = Date.now()
        await react('🔎')

        // Progress bars
        const bars = ['▰▱▱▱▱▱▱▱▱▱','▰▰▱▱▱▱▱▱▱▱','▰▰▰▱▱▱▱▱▱▱','▰▰▰▰▱▱▱▱▱▱','▰▰▰▰▰▱▱▱▱▱','▰▰▰▰▰▰▱▱▱▱','▰▰▰▰▰▰▰▱▱▱','▰▰▰▰▰▰▰▰▱▱','▰▰▰▰▰▰▰▰▰▱','▰▰▰▰▰▰▰▰▰▰']

        // Searching message
        const searchMsg = await sock.sendMessage(chatId, {
            text: `｡ﾟ•┈୨💖୧┈•ﾟ｡
🔎 *𝙎𝙚𝙖𝙧𝙘𝙝𝙞𝙣𝙜:* ${query}
⏳ ${bars[0]} 10%
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
        }, { quoted: msg })

        try {
            // 🔍 Search YouTube
            const search = await yts(query)
            const video = search.videos[0]

            if (!video) {
                if (searchMsg?.key) await sock.sendMessage(chatId, { delete: searchMsg.key }).catch(() => {})
                return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙉𝙤 𝙧𝙚𝙨𝙪𝙡𝙩𝙨 𝙛𝙤𝙧: ${query}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
            }

            // Animate search progress
            for (let i = 2; i < 6; i++) {
                await sleep(200)
                if (searchMsg?.key) {
                    await sock.sendMessage(chatId, {
                        text: `｡ﾟ•┈୨💖୧┈•ﾟ｡
🔎 *𝙎𝙚𝙖𝙧𝙘𝙝𝙞𝙣𝙜:* ${query}
⏳ ${bars[i]} ${(i + 1) * 10}%
｡ﾟ•┈୨🌸୧┈•ﾟ｡`,
                        edit: searchMsg.key
                    }).catch(() => {})
                }
            }

            // Delete search message
            if (searchMsg?.key) await sock.sendMessage(chatId, { delete: searchMsg.key }).catch(() => {})

            // 📋 Send found card
            const foundMsg = await sock.sendMessage(chatId, {
                text: `｡ﾟ•┈୨💖୧┈•ﾟ｡
🎀 *𝙁𝙤𝙪𝙣𝙙!*

🎵 *${video.title}*
⏱️ ${video.timestamp}
📺 ${video.author.name}

⏳ 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙𝙞𝙣𝙜...
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            }, { quoted: msg })

            // 📁 Setup temp
            const tempDir = path.join(__dirname, '..', '..', 'temp')
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
            const outputFile = path.join(tempDir, `play_${Date.now()}.mp3`)

            // ⚡ Download with yt-dlp
            const cmd = `yt-dlp -f bestaudio --extract-audio --audio-format mp3 --audio-quality 128K -o "${outputFile}" "${video.url}" --no-playlist --force-ipv4 --socket-timeout 30 --no-warnings`

            exec(cmd, async (err) => {
                // Delete found message
                if (foundMsg?.key) await sock.sendMessage(chatId, { delete: foundMsg.key }).catch(() => {})

                if (err) {
                    console.log('[PLAY] yt-dlp error:', err.message)
                    return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙 𝙛𝙖𝙞𝙡𝙚𝙙!\n🔧 𝙄𝙣𝙨𝙩𝙖𝙡𝙡: pkg install yt-dlp\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
                }

                if (!fs.existsSync(outputFile)) {
                    return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙁𝙞𝙡𝙚 𝙣𝙤𝙩 𝙘𝙧𝙚𝙖𝙩𝙚𝙙!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
                }

                const stats = fs.statSync(outputFile)
                const sizeMB = (stats.size / (1024 * 1024)).toFixed(1)

                if (stats.size > 100 * 1024 * 1024) {
                    fs.unlinkSync(outputFile)
                    return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙁𝙞𝙡𝙚 𝙩𝙤𝙤 𝙡𝙖𝙧𝙜𝙚 (${sizeMB}MB)!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
                }

                // 🎵 Send audio
                sock.sendMessage(chatId, {
                    audio: fs.readFileSync(outputFile),
                    mimetype: 'audio/mpeg',
                    ptt: false,
                    contextInfo: {
                        externalAdReply: {
                            title: `🎧 ${video.title}`,
                            body: `🌸 FIZA Music • ${((Date.now() - startTime) / 1000).toFixed(1)}s`,
                            mediaType: 2,
                            mediaUrl: video.url,
                            sourceUrl: video.url,
                            renderLargerThumbnail: true,
                            showAdAttribution: false
                        }
                    }
                }, { quoted: msg }).catch(() => {})

                react('✅')

                // Cleanup
                try { fs.unlinkSync(outputFile) } catch {}
                console.log(`[PLAY] ${video.title} | ${sizeMB}MB | ${((Date.now() - startTime) / 1000).toFixed(1)}s`)
            })

        } catch (err) {
            console.log('[PLAY]', err.message)
            if (searchMsg?.key) await sock.sendMessage(chatId, { delete: searchMsg.key }).catch(() => {})
            reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙀𝙧𝙧𝙤𝙧! 𝙏𝙧𝙮 𝙖𝙣𝙤𝙩𝙝𝙚𝙧 𝙨𝙤𝙣𝙜 🍓\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
        }
    }
}