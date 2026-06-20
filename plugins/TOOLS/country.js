import axios from 'axios'

export default {
  name: 'country',
  command: ['country', 'countryinfo'],
  desc: '🌍 𝘾𝙤𝙪𝙣𝙩𝙧𝙮 𝙄𝙣𝙛𝙤',
  category: 'tools',
  cooldown: 5,

  async run({ sock, msg, from, args, reply }) {
    const name = args.join(' ')
    if (!name) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🌍 .country India\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    try {
      const { data } = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}`)
      if (!data || data.length === 0) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙉𝙤𝙩 𝙛𝙤𝙪𝙣𝙙\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
      const c = data[0]
      const info = {
        '🏛️ 𝙾𝚏𝚏𝚒𝚌𝚒𝚊𝚕': c.name.official,
        '🏙️ 𝙲𝚊𝚙𝚒𝚝𝚊𝚕': c.capital?.[0],
        '👥 𝙿𝚘𝚙𝚞𝚕𝚊𝚝𝚒𝚘𝚗': c.population.toLocaleString(),
        '🗣️ 𝙻𝚊𝚗𝚐𝚞𝚊𝚐𝚎𝚜': Object.values(c.languages || {}).join(', '),
        '💰 𝙲𝚞𝚛𝚛𝚎𝚗𝚌𝚢': Object.values(c.currencies || {})[0]?.name,
        '🌐 𝚁𝚎𝚐𝚒𝚘𝚗': c.region
      }
      const txt = Object.entries(info).map(([k,v]) => `${k}: ${v}`).join('\n')
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🌍 *${c.name.common}*\n${txt}\n🧁 𝙏𝙧𝙖𝙫𝙚𝙡 𝙩𝙝𝙚 𝙬𝙤𝙧𝙡𝙙~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    } catch {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙀𝙧𝙧𝙤𝙧\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}