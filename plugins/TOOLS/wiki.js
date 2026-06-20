import axios from 'axios'

export default {
  name: 'wiki',
  command: ['wiki', 'wikipedia'],
  desc: '📚 𝙒𝙞𝙠𝙞𝙥𝙚𝙙𝙞𝙖 𝙎𝙚𝙖𝙧𝙘𝙝',
  category: 'tools',
  cooldown: 6,

  async run({ sock, msg, from, args, reply }) {
    const query = args.join(' ')
    if (!query) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n📚 .wiki <topic>\n💝 .wiki JavaScript\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    try {
      const { data } = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`, { timeout: 10000 })
      if (!data || data.type === 'https://mediawiki.org/wiki/HyperSwitch/errors/bad_request') return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙉𝙤𝙩 𝙛𝙤𝙪𝙣𝙙\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
      const summary = data.extract.length > 1000 ? data.extract.slice(0, 1000) + '...' : data.extract
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n📚 *${data.title}*\n\n${summary}\n🔗 ${data.content_urls?.desktop?.page || ''}\n🧁 𝙇𝙚𝙖𝙧𝙣 𝙨𝙤𝙢𝙚𝙩𝙝𝙞𝙣𝙜~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    } catch {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙀𝙧𝙧𝙤𝙧\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}