import axios from 'axios'

export default {
  name: 'horoscope',
  command: ['horoscope', 'horo'],
  desc: '🔮 𝘿𝙖𝙞𝙡𝙮 𝙃𝙤𝙧𝙤𝙨𝙘𝙤𝙥𝙚',
  category: 'fun',
  cooldown: 8,

  async run({ sock, msg, from, args, reply, react }) {
    const sign = args[0]?.toLowerCase() || 'aries'
    const signs = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces']
    if (!signs.includes(sign)) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🔮 𝙑𝙖𝙡𝙞𝙙 𝙨𝙞𝙜𝙣𝙨: ${signs.join(', ')}\n💝 .horoscope leo\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

    await react('🔮')
    try {
      const { data } = await axios.post(`https://aztro.sameerkumar.website/?sign=${sign}&day=today`)
      reply(
        `｡ﾟ•┈୨💖୧┈•ﾟ｡\n` +
        `🔮 *${sign.toUpperCase()}* – ${data.current_date}\n\n` +
        `💬 *${data.description}*\n` +
        `💖 𝘾𝙤𝙢𝙥𝙖𝙩𝙞𝙗𝙞𝙡𝙞𝙩𝙮: ${data.compatibility}\n` +
        `🎨 𝙈𝙤𝙤𝙙: ${data.mood}\n` +
        `🌈 𝘾𝙤𝙡𝙤𝙧: ${data.color}\n` +
        `🔢 𝙇𝙪𝙘𝙠𝙮 𝙉𝙪𝙢𝙗𝙚𝙧: ${data.lucky_number}\n` +
        `⏰ 𝙇𝙪𝙘𝙠𝙮 𝙏𝙞𝙢𝙚: ${data.lucky_time}\n\n` +
        `🧁 𝙎𝙩𝙖𝙧𝙨 𝙝𝙖𝙫𝙚 𝙨𝙥𝙤𝙠𝙚𝙣~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
      )
    } catch {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙎𝙩𝙖𝙧𝙨 𝙣𝙤𝙩 𝙖𝙡𝙞𝙜𝙣𝙚𝙙\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}