import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'
import '../../settings.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const TEMP_DIR = path.join(__dirname, '..', '..', 'temp')
const EXIF_PATH = path.join(__dirname, '..', '..', 'lib', 'exif.data')

if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true })

// Create default exif if not exists
if (!fs.existsSync(EXIF_PATH)) {
    const exifDir = path.dirname(EXIF_PATH)
    if (!fs.existsSync(exifDir)) fs.mkdirSync(exifDir, { recursive: true })
    fs.writeFileSync(EXIF_PATH, Buffer.alloc(0))
}

export default {
    name: 'sticker',
    command: ['sticker', 'stiker', 's', 'take', 'wm', 'steal'],
    desc: '🌟 𝙎𝙩𝙞𝙘𝙠𝙚𝙧 𝙈𝙖𝙠𝙚𝙧 + 𝙏𝙖𝙠𝙚 𝙈𝙚𝙩𝙖𝙙𝙖𝙩𝙖',
    category: 'tools',
    cooldown: 5,

    async run({ msg, sock, reply, react, args, command, sender }) {
        const chatId = msg.key?.remoteJid
        const quoted = msg.quoted || msg
        const mime = quoted.msg?.mimetype || quoted.mediaType || ''
        const isTake = ['take', 'wm', 'steal'].includes(command)

        // 🔥 Get names from settings.js
        const botName = global.botname || global.botName || 'FIZA'
        const ownerName = global.ownername || global.ownerName || 'FAHIM'

        // ──────────────────────────────────────────────────────
        // 🎭 TAKE MODE (reply to sticker)
        // ──────────────────────────────────────────────────────
        if (isTake) {
            if (!/webp|sticker/.test(mime)) {
                return reply(
                    `｡ﾟ•┈୨💖୧┈•ﾟ｡
🎭 *𝙏𝘼𝙆𝙀 𝙎𝙏𝙄𝘾𝙆𝙀𝙍*

🍓 𝙍𝙚𝙥𝙡𝙮 𝙩𝙤 𝙖 𝙨𝙩𝙞𝙘𝙠𝙚𝙧
💝 .take <packname>|<author>

🌸 𝙀𝙭𝙖𝙢𝙥𝙡𝙚:
  .take MyPack|MyName
  .take (uses ${botName}|${ownerName})

🧁 𝘾𝙝𝙖𝙣𝙜𝙚 𝙨𝙩𝙞𝙘𝙠𝙚𝙧 𝙢𝙚𝙩𝙖𝙙𝙖𝙩𝙖~
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
                )
            }

            await react('🎭')

            try {
                const media = await quoted.download()
                const text = args.join(' ')
                
                // 🔥 Parse packname|author from args, or use defaults
                let packname, author
                
                if (text.includes('|')) {
                    // User provided custom names
                    const parts = text.split('|')
                    packname = parts[0].trim() || botName
                    author = parts[1]?.trim() || ownerName
                } else if (text.trim()) {
                    // Only one name provided — use as packname, get sender name
                    packname = text.trim()
                    const senderName = msg.pushName || sender.split('@')[0]
                    author = senderName
                } else {
                    // No names provided — use defaults from settings.js
                    packname = botName
                    author = ownerName
                }

                const inputFile = path.join(TEMP_DIR, `take_in_${Date.now()}.webp`)
                const tempExifFile = path.join(TEMP_DIR, `exif_${Date.now()}.data`)
                const outputFile = path.join(TEMP_DIR, `take_out_${Date.now()}.webp`)

                fs.writeFileSync(inputFile, media)

                // 🔥 Create custom exif with the names
                if (fs.existsSync(EXIF_PATH)) {
                    const originalExif = fs.readFileSync(EXIF_PATH)
                    
                    // Write pack name and author into exif
                    let modifiedExif = Buffer.from(originalExif)
                    
                    // Try to modify the JSON metadata inside the webp
                    try {
                        const packBuffer = Buffer.from(packname, 'utf8')
                        const authBuffer = Buffer.from(author, 'utf8')
                        
                        // Create new exif with custom data
                        const newExif = Buffer.concat([
                            originalExif.slice(0, 50),
                            packBuffer,
                            Buffer.from([0x00]),
                            authBuffer,
                            Buffer.from([0x00]),
                            originalExif.slice(50 + packBuffer.length + authBuffer.length + 2)
                        ])
                        fs.writeFileSync(tempExifFile, newExif)
                    } catch {
                        // Fallback: use original exif
                        fs.writeFileSync(tempExifFile, originalExif)
                    }

                    const cmd = `webpmux -set exif "${tempExifFile}" "${inputFile}" -o "${outputFile}"`

                    await new Promise((resolve, reject) => {
                        exec(cmd, (err) => {
                            if (err) reject(err)
                            else resolve()
                        })
                    })

                    if (fs.existsSync(outputFile)) {
                        const stickerBuffer = fs.readFileSync(outputFile)
                        await sock.sendMessage(chatId, {
                            sticker: stickerBuffer
                        }, { quoted: msg })
                        
                        await reply(
                            `｡ﾟ•┈୨💖୧┈•ﾟ｡
✅ 𝙎𝙩𝙞𝙘𝙠𝙚𝙧 𝙪𝙥𝙙𝙖𝙩𝙚𝙙!

📦 𝙋𝙖𝙘𝙠: ${packname}
✍️ 𝘼𝙪𝙩𝙝𝙤𝙧: ${author}

🧁 𝙒𝙚𝙗𝙥𝙢𝙪𝙭 𝙢𝙖𝙜𝙞𝙘~
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
                        )
                        await react('✅')
                    } else {
                        throw new Error('webpmux failed')
                    }

                    try { fs.unlinkSync(tempExifFile) } catch {}
                } else {
                    // No exif file — just send with metadata caption
                    await sock.sendMessage(chatId, {
                        sticker: media
                    }, { quoted: msg })
                    await reply(
                        `｡ﾟ•┈୨💖୧┈•ﾟ｡
🎭 *${packname}*
✍️ ${author}

⚠️ 𝙚𝙭𝙞𝙛.𝙙𝙖𝙩𝙖 𝙣𝙤𝙩 𝙛𝙤𝙪𝙣𝙙
📁 𝙋𝙪𝙩 𝙞𝙣 /lib/exif.data
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
                    )
                }

                try { fs.unlinkSync(inputFile) } catch {}
                try { fs.unlinkSync(outputFile) } catch {}

            } catch (err) {
                console.log('[TAKE ERROR]', err.message)
                await react('❌')
                reply(
                    `｡ﾟ•┈୨💖୧┈•ﾟ｡
❌ 𝙁𝙖𝙞𝙡𝙚𝙙: ${err.message}

🔧 𝙄𝙣𝙨𝙩𝙖𝙡𝙡:
pkg install webp
📁 𝙋𝙪𝙩 𝙚𝙭𝙞𝙛.𝙙𝙖𝙩𝙖 𝙞𝙣 /lib/
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
                )
            }
            return
        }

        // ──────────────────────────────────────────────────────
        // 🌟 STICKER MODE (reply to image/video)
        // ──────────────────────────────────────────────────────
        if (!/image|video|webp/.test(mime)) {
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
🌟 *𝙎𝙏𝙄𝘾𝙆𝙀𝙍 𝙈𝘼𝙆𝙀𝙍*

🍓 𝙍𝙚𝙥𝙡𝙮 𝙩𝙤 𝙞𝙢𝙖𝙜𝙚/𝙫𝙞𝙙𝙚𝙤
💝 .s (crop) | .s full
🎭 .take pack|author (reply sticker)

📦 𝙋𝙖𝙘𝙠: ${botName}
✍️ 𝘼𝙪𝙩𝙝𝙤𝙧: ${ownerName}

🧁 𝙒𝙚𝙗𝙥𝙢𝙪𝙭 𝙢𝙚𝙩𝙖𝙙𝙖𝙩𝙖~
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            )
        }

        await react('🌟')

        try {
            const media = await quoted.download()
            const isVideo = /video/.test(mime)
            
            const mode = args[0]?.toLowerCase()
            const cropMode = mode === 'crop' ? true : mode === 'full' ? false : true
            
            // 🔥 Parse metadata from args for sticker mode too
            const text = args.join(' ')
            let packname, author
            
            if (text.includes('|')) {
                const parts = text.split('|')
                packname = parts[0].trim()
                author = parts[1]?.trim() || ownerName
            } else if (mode && !['crop', 'full'].includes(mode) && !mode.includes('|')) {
                packname = text.trim() || botName
                author = ownerName
            } else {
                packname = botName
                author = ownerName
            }
            
            const inputFile = path.join(TEMP_DIR, `sticker_${Date.now()}.${isVideo ? 'mp4' : 'png'}`)
            const outputFile = path.join(TEMP_DIR, `sticker_${Date.now()}.webp`)
            const finalFile = path.join(TEMP_DIR, `final_${Date.now()}.webp`)
            const tempExifFile = path.join(TEMP_DIR, `exif_${Date.now()}.data`)

            fs.writeFileSync(inputFile, media)

            // Step 1: Convert to webp with FFmpeg
            let cmd
            if (!isVideo) {
                if (cropMode) {
                    cmd = `ffmpeg -i "${inputFile}" -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" "${outputFile}" -y`
                } else {
                    cmd = `ffmpeg -i "${inputFile}" -vf "scale='min(512,iw)':min(512,ih):force_original_aspect_ratio=decrease" "${outputFile}" -y`
                }
            } else {
                cmd = `ffmpeg -i "${inputFile}" -vf "fps=15,scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -lossless 0 -q:v 80 -loop 0 -preset default -an "${outputFile}" -y`
            }

            await new Promise((resolve, reject) => {
                exec(cmd, (err) => {
                    if (err) reject(err)
                    else resolve()
                })
            })

            if (!fs.existsSync(outputFile)) {
                throw new Error('FFmpeg conversion failed')
            }

            // Step 2: Add metadata with webpmux
            if (fs.existsSync(EXIF_PATH)) {
                const originalExif = fs.readFileSync(EXIF_PATH)
                
                // Create custom exif
                try {
                    const packBuffer = Buffer.from(packname, 'utf8')
                    const authBuffer = Buffer.from(author, 'utf8')
                    
                    const newExif = Buffer.concat([
                        originalExif.slice(0, 50),
                        packBuffer,
                        Buffer.from([0x00]),
                        authBuffer,
                        Buffer.from([0x00]),
                        originalExif.slice(50 + packBuffer.length + authBuffer.length + 2)
                    ])
                    fs.writeFileSync(tempExifFile, newExif)
                } catch {
                    fs.writeFileSync(tempExifFile, originalExif)
                }

                const webpmuxCmd = `webpmux -set exif "${tempExifFile}" "${outputFile}" -o "${finalFile}"`

                await new Promise((resolve, reject) => {
                    exec(webpmuxCmd, (err) => {
                        if (err) reject(err)
                        else resolve()
                    })
                })

                if (fs.existsSync(finalFile)) {
                    const stickerBuffer = fs.readFileSync(finalFile)
                    await sock.sendMessage(chatId, {
                        sticker: stickerBuffer
                    }, { quoted: msg })
                    await react('✅')
                }

                try { fs.unlinkSync(tempExifFile) } catch {}
            } else {
                const stickerBuffer = fs.readFileSync(outputFile)
                await sock.sendMessage(chatId, {
                    sticker: stickerBuffer
                }, { quoted: msg })
                await react('✅')
            }

            try { fs.unlinkSync(inputFile) } catch {}
            try { fs.unlinkSync(outputFile) } catch {}
            try { fs.unlinkSync(finalFile) } catch {}

        } catch (err) {
            console.log('[STICKER ERROR]', err.message)
            await react('❌')
            reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
❌ 𝙁𝙖𝙞𝙡𝙚𝙙: ${err.message}

🔧 𝙄𝙣𝙨𝙩𝙖𝙡𝙡:
pkg install ffmpeg
pkg install webp

📁 𝙋𝙪𝙩 𝙚𝙭𝙞𝙛.𝙙𝙖𝙩𝙖 𝙞𝙣 /lib/
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            )
        }
    }
}