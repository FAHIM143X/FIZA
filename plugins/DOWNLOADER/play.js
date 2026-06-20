// plugins/media/play.js
import { exec } from 'child_process'
import fs       from 'fs'
import path     from 'path'
import { fileURLToPath } from 'url'
import axios    from 'axios'
import yts      from 'yt-search'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
const TEMP       = path.join(__dirname, '../../temp')

if (!fs.existsSync(TEMP)) fs.mkdirSync(TEMP, { recursive: true })

const getThumb = async (id) => {
    for (const q of ['maxresdefault', 'hqdefault', 'mqdefault']) {
        try {
            const r = await axios.get(`https://img.youtube.com/vi/${id}/${q}.jpg`, {
                responseType: 'arraybuffer', timeout: 5000
            })
            const b = Buffer.from(r.data)
            if (b.length > 5000) return b
        } catch {}
    }
    return null
}

export default {
    name:     'play',
    command:  ['play', 'song', 'mp3'],
    desc:     '🎵 Play music from YouTube',
    usage:    '.play <song name>',
    category: 'media',
    cooldown: 15,

    async run({ msg, sock, args, reply, react }) {
        const query  = args.join(' ').trim()
        const chatId = msg.key.remoteJid

        if (!query) return reply('🎵 *.play <song name>*\nExample: .play faded alan walker')

        await react('🔍')

        // Search + thumbnail in parallel
        const [search] = await Promise.all([yts(query)]).catch(() => [null])
        const video = search?.videos?.[0]

        if (!video) {
            await react('❌')
            return reply(`❌ No results for: *${query}*`)
        }

        // Fetch thumbnail (non-blocking)
        const thumbPromise = getThumb(video.videoId)

        // Send found card immediately
        const thumbBuf = await thumbPromise

        await sock.sendMessage(chatId, {
            text: `🎵 *${video.title}*\n⏱️ ${video.timestamp} • 📺 ${video.author?.name || 'YouTube'}\n⬇️ Downloading...`,
            contextInfo: {
                externalAdReply: {
                    title:                 video.title,
                    body:                  `${video.author?.name || 'YouTube'} • ${video.timestamp}`,
                    thumbnail:             thumbBuf || undefined,
                    mediaType:             1,
                    renderLargerThumbnail: true,
                    showAdAttribution:     false,
                    sourceUrl:             video.url,
                    mediaUrl:              video.url,
                }
            }
        }, { quoted: msg })

        await react('⬇️')

        // Download
        const out = path.join(TEMP, `play_${Date.now()}.mp3`)
        const cmd = `yt-dlp -f bestaudio --extract-audio --audio-format mp3 --audio-quality 128K -o "${out}" "${video.url}" --no-playlist --force-ipv4 --socket-timeout 30 --no-warnings -q`

        exec(cmd, async (err) => {
            if (err || !fs.existsSync(out)) {
                await react('❌')
                return reply('❌ Download failed!\n`pkg install yt-dlp` or `pip install yt-dlp`')
            }

            const size = fs.statSync(out).size
            if (size > 100 * 1024 * 1024) {
                fs.unlinkSync(out)
                await react('❌')
                return reply('❌ File too large!')
            }

            await sock.sendMessage(chatId, {
                audio:    fs.readFileSync(out),
                mimetype: 'audio/mpeg',
                ptt:      false,
                fileName: `${video.title}.mp3`,
                contextInfo: {
                    externalAdReply: {
                        title:                 `🎧 ${video.title}`,
                        body:                  `${video.author?.name || 'YouTube'} • ${video.timestamp}`,
                        thumbnail:             thumbBuf || undefined,
                        mediaType:             2,
                        renderLargerThumbnail: false,
                        showAdAttribution:     false,
                        sourceUrl:             video.url,
                        mediaUrl:              video.url,
                    }
                }
            }, { quoted: msg })

            await react('✅')
            try { fs.unlinkSync(out) } catch {}
        })
    }
}
