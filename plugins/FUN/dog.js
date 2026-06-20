import axios from 'axios'

export default {
  name: 'dog',
  command: ['dog', 'woof'],
  desc: '🐶 𝙍𝙖𝙣𝙙𝙤𝙢 𝘿𝙤𝙜 𝙋𝙞𝙘𝙩𝙪𝙧𝙚',
  category: 'fun',
  cooldown: 5,

  async run({ sock, msg, from, reply, react }) {
    await react('🐶')
    try {
      const { data } = await axios.get('https://dog.ceo/api/breeds/image/random')
      await sock.sendMessage(from, {
        image: { url: data.message },
        caption: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n🐶 *𝙒𝙤𝙤𝙛!*\n🧁 𝙂𝙤𝙤𝙙 𝙗𝙤𝙮 𝙖𝙡𝙚𝙧𝙩~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
      }, { quoted: msg })
    } catch {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙒𝙤𝙤𝙛 𝙛𝙖𝙞𝙡𝙚𝙙\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}