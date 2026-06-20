import axios from 'axios'

export default {
  name: 'fox',
  command: ['fox'],
  desc: '🦊 𝙍𝙖𝙣𝙙𝙤𝙢 𝙁𝙤𝙭 𝙋𝙞𝙘𝙩𝙪𝙧𝙚',
  category: 'fun',
  cooldown: 5,

  async run({ sock, msg, from, reply, react }) {
    await react('🦊')
    try {
      const { data } = await axios.get('https://randomfox.ca/floof/')
      await sock.sendMessage(from, {
        image: { url: data.image },
        caption: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n🦊 *𝙁𝙤𝙭 𝙖𝙥𝙥𝙚𝙖𝙧𝙚𝙙!*\n🧁 𝙒𝙝𝙖𝙩 𝙙𝙤𝙚𝙨 𝙩𝙝𝙚 𝙛𝙤𝙭 𝙨𝙖𝙮?~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
      }, { quoted: msg })
    } catch {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙁𝙤𝙭 𝙝𝙞𝙙𝙞𝙣𝙜\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}