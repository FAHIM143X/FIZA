import axios from 'axios'

export default {
  name: 'chucknorris',
  command: ['chuck', 'norris'],
  desc: '🥋 𝘾𝙝𝙪𝙘𝙠 𝙉𝙤𝙧𝙧𝙞𝙨 𝙅𝙤𝙠𝙚',
  category: 'fun',
  cooldown: 4,

  async run({ sock, msg, from, reply, react }) {
    await react('🥋')
    try {
      const { data } = await axios.get('https://api.chucknorris.io/jokes/random')
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🥋 *${data.value}*\n🧁 𝘾𝙝𝙪𝙘𝙠 𝙖𝙥𝙥𝙧𝙤𝙫𝙚𝙙~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    } catch {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🥋 𝘾𝙝𝙪𝙘𝙠 𝙞𝙨 𝙗𝙪𝙨𝙮\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}