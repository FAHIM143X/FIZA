import Jimp from 'jimp'

export default {
  name: 'colorpalette',
  command: ['colors', 'palette'],
  desc: '🎨 𝙂𝙚𝙣𝙚𝙧𝙖𝙩𝙚 𝙘𝙤𝙡𝙤𝙧 𝙥𝙖𝙡𝙚𝙩𝙩𝙚',
  category: 'fun',
  cooldown: 5,

  async run({ sock, msg, from, reply }) {
    const canvas = new Jimp(600, 200)
    const colors = Array.from({ length: 6 }, () => [
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256)
    ])
    colors.forEach(([r, g, b], i) => {
      const x = i * 100
      for (let dx = 0; dx < 100; dx++) {
        for (let y = 0; y < 200; y++) {
          canvas.setPixelColor(Jimp.rgbaToInt(r, g, b, 255), x + dx, y)
        }
      }
    })
    const buf = await canvas.getBufferAsync(Jimp.MIME_PNG)
    await sock.sendMessage(from, {
      image: buf,
      caption: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n🎨 *𝙍𝙖𝙣𝙙𝙤𝙢 𝙋𝙖𝙡𝙚𝙩𝙩𝙚*\n${colors.map((c,i) => `🔹 #${c.map(v=>v.toString(16).padStart(2,'0')).join('')}`).join('\n')}\n🧁 𝘾𝙤𝙡𝙤𝙧 𝙄𝙣𝙨𝙥𝙞𝙧𝙖𝙩𝙞𝙤𝙣~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
    }, { quoted: msg })
  }
}