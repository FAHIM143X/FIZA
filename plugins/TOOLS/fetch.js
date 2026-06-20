import axios from 'axios'

export default {
  name: 'fetch',
  command: ['fetch', 'get'],
  desc: '🌐 𝙁𝙚𝙩𝙘𝙝 𝙐𝙍𝙇 𝙘𝙤𝙣𝙩𝙚𝙣𝙩',
  category: 'tools',
  cooldown: 5,

  async run({ sock, msg, from, args, reply }) {
    const url = args[0]
    if (!url) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🌐 .fetch https://api.example.com\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    try {
      const res = await axios.get(url, { timeout: 10000 })
      const body = JSON.stringify(res.data, null, 2).slice(0, 500)
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🌐 *𝙁𝙚𝙩𝙘𝙝 𝙍𝙚𝙨𝙪𝙡𝙩*\n\`\`\`${body}\`\`\`\n🧁 𝘼𝙋𝙄 𝙍𝙚𝙨𝙥𝙤𝙣𝙨𝙚~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    } catch (e) {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ ${e.message}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}