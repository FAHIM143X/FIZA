import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TEMP = path.join(__dirname, '..', '..', 'temp')
if (!fs.existsSync(TEMP)) fs.mkdirSync(TEMP, { recursive: true })

export default {
  name: 'universal',
  command: ['dl', 'download'],
  desc: '📥 𝙐𝙣𝙞𝙫𝙚𝙧𝙨𝙖𝙡 𝙈𝙚𝙙𝙞𝙖 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙𝙚𝙧 (𝙮𝙩‑𝙙𝙡𝙥)',
  category: 'downloader',
  cooldown: 20,

  async run({ sock, msg, from, args, reply, react }) {
    const url = args[0]
    if (!url) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n📥 .dl <url>\n💝 Supports YouTube, Instagram, TikTok, Twitter, etc.\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

    await react('📥')
    const outFile = path.join(TEMP, `dl_${Date.now()}.mp4`)
    const cmd = `yt-dlp -f best -o "${outFile}" "${url}" --no-playlist --force-ipv4 --socket-timeout 30`

    exec(cmd, async (err) => {
      if (err) {
        console.log('[DL] yt-dlp error:', err.message)
        return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙙𝙤𝙬𝙣𝙡𝙤𝙖𝙙 𝙛𝙖𝙞𝙡𝙚𝙙\n🔧 𝙄𝙨 𝙮𝙩‑𝙙𝙡𝙥 𝙞𝙣𝙨𝙩𝙖𝙡𝙡𝙚𝙙?\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
      }
      if (!fs.existsSync(outFile)) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙁𝙞𝙡𝙚 𝙣𝙤𝙩 𝙘𝙧𝙚𝙖𝙩𝙚𝙙\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

      const stat = fs.statSync(outFile)
      if (stat.size > 100 * 1024 * 1024) {
        fs.unlinkSync(outFile)
        return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙁𝙞𝙡𝙚 𝙩𝙤𝙤 𝙡𝙖𝙧𝙜𝙚 (>100 MB)\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
      }

      await sock.sendMessage(from, {
        video: fs.readFileSync(outFile),
        caption: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n📥 *𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙𝙚𝙙*\n🔗 ${url}\n🧁 𝙐𝙣𝙞𝙫𝙚𝙧𝙨𝙖𝙡 𝙙𝙤𝙬𝙣𝙡𝙤𝙖𝙙𝙚𝙧~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
      }, { quoted: msg })

      try { fs.unlinkSync(outFile) } catch {}
      await react('✅')
    })
  }
}