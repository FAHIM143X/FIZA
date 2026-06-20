import axios from 'axios'

export default {
  name: 'crypto',
  command: ['crypto', 'coin'],
  desc: '🪙 𝘾𝙧𝙮𝙥𝙩𝙤 𝙋𝙧𝙞𝙘𝙚',
  category: 'tools',
  cooldown: 8,

  async run({ sock, msg, from, args, reply, react }) {
    const coin = args[0]?.toLowerCase() || 'bitcoin'
    await react('🪙')
    try {
      const { data } = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd&include_24hr_change=true`)
      const info = data[coin]
      if (!info) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙉𝙤𝙩 𝙛𝙤𝙪𝙣𝙙\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
      reply(
        `｡ﾟ•┈୨💖୧┈•ﾟ｡\n` +
        `🪙 *${coin.toUpperCase()}*\n` +
        `💵 $${info.usd}\n` +
        `📈 24h: ${info.usd_24h_change?.toFixed(2)}%\n` +
        `🧁 𝙃𝙊𝘿𝙇 𝙤𝙧 𝙛𝙤𝙡𝙙~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
      )
    } catch {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝘼𝙋𝙄 𝙡𝙞𝙢𝙞𝙩\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}