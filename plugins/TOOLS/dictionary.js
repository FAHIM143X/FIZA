import axios from 'axios'

export default {
  name: 'dictionary',
  command: ['dict', 'dictionary'],
  desc: '📖 𝙒𝙤𝙧𝙙 𝘿𝙚𝙛𝙞𝙣𝙞𝙩𝙞𝙤𝙣',
  category: 'tools',
  cooldown: 5,

  async run({ sock, msg, from, args, reply, react }) {
    const word = args[0]?.toLowerCase()
    if (!word) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n📖 .dict <word>\n💝 .dict love\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

    await react('📖')
    try {
      const { data } = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      const entry = data[0]
      const meaning = entry.meanings[0]
      const definition = meaning.definitions[0].definition
      const example = meaning.definitions[0].example || ''
      reply(
        `｡ﾟ•┈୨💖୧┈•ﾟ｡\n` +
        `📖 *${entry.word}* (${meaning.partOfSpeech})\n` +
        `💬 ${definition}\n` +
        (example ? `✍️ 𝙴𝚡𝚊𝚖𝚙𝚕𝚎: ${example}\n` : '') +
        `🧁 𝙒𝙤𝙧𝙙𝙨 𝙢𝙖𝙩𝙩𝙚𝙧~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
      )
    } catch {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙉𝙤𝙩 𝙛𝙤𝙪𝙣𝙙\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}