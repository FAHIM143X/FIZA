import axios from 'axios'

export default {
  name: 'weather',
  command: ['weather', 'wthr'],
  desc: '🌤️ 𝙒𝙚𝙖𝙩𝙝𝙚𝙧 𝙍𝙚𝙥𝙤𝙧𝙩',
  category: 'tools',
  cooldown: 5,

  async run({ sock, msg, from, args, reply }) {
    const city = args.join(' ')
    if (!city) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🌤️ .weather <city>\n💝 .weather London\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    try {
      const res = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=%C+%t+%w+%h`, { timeout: 8000 })
      const text = res.data
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🌤️ *${city}*\n${text}\n🧁 𝙎𝙩𝙖𝙮 𝙨𝙖𝙛𝙚~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    } catch {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙉𝙤𝙩 𝙛𝙤𝙪𝙣𝙙\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}