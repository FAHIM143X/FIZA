import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TEMP = path.join(__dirname, '..', '..', 'temp')

export default {
  name: 'emojimix',
  command: ['emojimix', 'emix'],
  desc: '🎨 𝙈𝙞𝙭 𝙩𝙬𝙤 𝙚𝙢𝙤𝙟𝙞𝙨',
  category: 'fun',
  cooldown: 5,

  async run({ sock, msg, from, args, reply, react }) {
    const text = args.join(' ')
    if (!text.includes('+')) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🎨 .emojimix 😎+🥰\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    const [e1, e2] = text.split('+').map(s => s.trim())
    const url = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&collection=emoji_kitchen_v5&q=${encodeURIComponent(e1)}_${encodeURIComponent(e2)}`
    const res = await fetch(url)
    const data = await res.json()
    if (!data.results?.length) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝘾𝙖𝙣'𝙩 𝙢𝙞𝙭\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

    const imgUrl = data.results[0].url
    const imgRes = await fetch(imgUrl)
    const inp = path.join(TEMP, `mix_${Date.now()}.png`)
    const out = path.join(TEMP, `mix_${Date.now()}.webp`)
    fs.writeFileSync(inp, Buffer.from(await imgRes.arrayBuffer()))
    exec(`ffmpeg -y -i "${inp}" -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" "${out}"`, async (err) => {
      try { fs.unlinkSync(inp) } catch {}
      if (err) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙁𝙁𝙢𝙥𝙚𝙜\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
      if (!fs.existsSync(out)) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙎𝙩𝙞𝙘𝙠𝙚𝙧\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
      await sock.sendMessage(from, { sticker: fs.readFileSync(out) }, { quoted: msg })
      try { fs.unlinkSync(out) } catch {}
    })
  }
}