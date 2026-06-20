import axios from 'axios'

export default {
  name: 'quote',
  command: ['quote'],
  desc: '💬 𝙄𝙣𝙨𝙥𝙞𝙧𝙞𝙣𝙜 𝙌𝙪𝙤𝙩𝙚',
  category: 'fun',
  cooldown: 4,

  async run({ sock, msg, from, reply }) {
    try {
      const { data } = await axios.get('https://api.quotable.io/random', { timeout: 6000 })
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n💬 *“${data.content}”*\n— *${data.author}*\n🧁 𝙎𝙩𝙖𝙮 𝙞𝙣𝙨𝙥𝙞𝙧𝙚𝙙~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    } catch {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n💬 *“Be yourself; everyone else is already taken.”*\n— Oscar Wilde\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}