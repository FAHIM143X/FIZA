import axios from 'axios'

export default {
  name: 'numberfact',
  command: ['numberfact', 'numfact'],
  desc: '🔢 𝙍𝙖𝙣𝙙𝙤𝙢 𝙉𝙪𝙢𝙗𝙚𝙧 𝙁𝙖𝙘𝙩',
  category: 'fun',
  cooldown: 5,

  async run({ sock, msg, from, args, reply, react }) {
    const num = args[0] || 'random'
    await react('🔢')
    try {
      const { data } = await axios.get(`http://numbersapi.com/${num}/trivia?notfound=floor`)
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🔢 *${num === 'random' ? '𝙍𝙖𝙣𝙙𝙤𝙢' : num}*\n${data}\n🧁 𝙈𝙖𝙩𝙝 𝙞𝙨 𝙛𝙪𝙣~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    } catch {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙉𝙪𝙢𝙗𝙚𝙧 𝙨𝙝𝙮\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}-