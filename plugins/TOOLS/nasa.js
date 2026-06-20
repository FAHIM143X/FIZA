import axios from 'axios'

const NASA_KEY = 'DEMO_KEY' // Replace with your free key

export default {
  name: 'nasa',
  command: ['nasa', 'apod'],
  desc: '🚀 𝙉𝘼𝙎𝘼 𝙋𝙞𝙘𝙩𝙪𝙧𝙚 𝙤𝙛 𝙩𝙝𝙚 𝘿𝙖𝙮',
  category: 'tools',
  cooldown: 10,

  async run({ sock, msg, from, reply, react }) {
    await react('🚀')
    try {
      const { data } = await axios.get(`https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}`)
      if (data.media_type === 'image') {
        await sock.sendMessage(from, {
          image: { url: data.url },
          caption: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n🚀 *${data.title}*\n📅 ${data.date}\n\n${data.explanation?.slice(0, 300)}...\n🧁 𝙎𝙥𝙖𝙘𝙚 𝙞𝙨 𝙘𝙤𝙤𝙡~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
        }, { quoted: msg })
      } else {
        reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🚀 *${data.title}*\n🔗 ${data.url}\n🧁 𝙎𝙥𝙖𝙘𝙚 𝙫𝙞𝙙𝙚𝙤~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
      }
    } catch {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙉𝘼𝙎𝘼 𝙗𝙪𝙨𝙮\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}