import axios from 'axios'

export default {
  name: 'define',
  command: ['define', 'ud', 'urban'],
  desc: '📖 𝙐𝙧𝙗𝙖𝙣 𝘿𝙞𝙘𝙩𝙞𝙤𝙣𝙖𝙧𝙮',
  category: 'tools',
  cooldown: 5,

  async run({ sock, msg, from, args, reply }) {
    const term = args.join(' ')
    if (!term) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n📖 .define <word>\n💝 .define yeet\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    try {
      const { data } = await axios.get(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(term)}`, { timeout: 8000 })
      if (!data.list || data.list.length === 0) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙉𝙤 𝙙𝙚𝙛𝙞𝙣𝙞𝙩𝙞𝙤𝙣\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
      const entry = data.list[0]
      const def = entry.definition.length > 500 ? entry.definition.slice(0, 500) + '...' : entry.definition
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n📖 *${entry.word}*\n\n${def}\n\n📊 👍 ${entry.thumbs_up} | 👎 ${entry.thumbs_down}\n🧁 𝙐𝙧𝙗𝙖𝙣 𝙆𝙣𝙤𝙬𝙡𝙚𝙙𝙜𝙚~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    } catch {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙀𝙧𝙧𝙤𝙧\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}