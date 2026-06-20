import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'
import Jimp from 'jimp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TEMP = path.join(__dirname, '..', '..', 'temp')
if (!fs.existsSync(TEMP)) fs.mkdirSync(TEMP, { recursive: true })

export default {
  name: 'stickertext',
  command: ['stickertext', 'stxt'],
  desc: '💬 𝙎𝙩𝙞𝙘𝙠𝙚𝙧 𝙬𝙞𝙩𝙝 𝙩𝙚𝙭𝙩',
  category: 'tools',
  cooldown: 8,

  async run({ sock, msg, from, args, reply, react, quoted }) {
    const q = quoted || msg
    const mime = q.msg?.mimetype || q.mediaType || ''
    if (!/image|video/.test(mime)) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🖼️ 𝙍𝙚𝙥𝙡𝙮 𝙩𝙤 𝙞𝙢𝙖𝙜𝙚\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

    const text = args.join(' ')
    if (!text) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n💬 .stickertext <text>\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

    const media = await q.download()
    const inp = path.join(TEMP, `st_${Date.now()}.png`)
    const out = path.join(TEMP, `st_${Date.now()}.webp`)
    fs.writeFileSync(inp, media)

    try {
      const img = await Jimp.read(inp)
      img.resize(512, 512)
      const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE)
      img.print(font, 10, 10, text, 492)
      await img.writeAsync(inp)

      exec(`ffmpeg -i "${inp}" -vf "scale=512:512" -c:v libwebp -lossless 0 -q:v 80 "${out}" -y`, async (err) => {
        try { fs.unlinkSync(inp) } catch {}
        if (err) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙁𝙁𝙢𝙥𝙚𝙜\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
        if (!fs.existsSync(out)) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙎𝙩𝙞𝙘𝙠𝙚𝙧\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
        await sock.sendMessage(from, { sticker: fs.readFileSync(out) }, { quoted: msg })
        try { fs.unlinkSync(out) } catch {}
      })
    } catch (e) {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ ${e.message}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}