import axios from 'axios'

export default {
  name: 'wordoftheday',
  command: ['wotd', 'word'],
  desc: '📖 𝙒𝙤𝙧𝙙 𝙤𝙛 𝙩𝙝𝙚 𝘿𝙖𝙮',
  category: 'tools',
  cooldown: 6,

  async run({ sock, msg, from, reply, react }) {
    await react('📖')
    try {
      const { data } = await axios.get('https://random-words-api.vercel.app/word')
      const wordData = data[0]
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n📖 *${wordData.word}*\n💬 ${wordData.definition}\n✍️ 𝙴𝚡𝚊𝚖𝚙𝚕𝚎: ${wordData.pronunciation || 'N/A'}\n🧁 𝙀𝙭𝙥𝙖𝙣𝙙 𝙮𝙤𝙪𝙧 𝙫𝙤𝙘𝙖𝙗~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    } catch {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙒𝙤𝙧𝙙 𝙛𝙖𝙞𝙡𝙚𝙙\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}