import axios from 'axios'

export default {
  name: 'dadjoke',
  command: ['dadjoke'],
  desc: '👨‍🦰 𝘿𝙖𝙙 𝙅𝙤𝙠𝙚',
  category: 'fun',
  cooldown: 3,

  async run({ sock, msg, from, reply }) {
    try {
      const { data } = await axios.get('https://icanhazdadjoke.com/', { headers: { 'Accept': 'application/json' }, timeout: 6000 })
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n👨‍🦰 *${data.joke}*\n🧁 𝙎𝙤 𝙗𝙖𝙙 𝙞𝙩’𝙨 𝙜𝙤𝙤𝙙~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    } catch {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n👨‍🦰 Why don’t scientists trust atoms? Because they make up everything!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}