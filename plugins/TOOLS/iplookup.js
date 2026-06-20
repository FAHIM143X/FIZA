import axios from 'axios'

export default {
  name: 'ip',
  command: ['ip', 'iplookup'],
  desc: '🌐 𝙄𝙋 𝘼𝙙𝙙𝙧𝙚𝙨𝙨 𝙇𝙤𝙤𝙠𝙪𝙥',
  category: 'tools',
  cooldown: 6,

  async run({ sock, msg, from, args, reply, react }) {
    const ip = args[0]
    if (!ip) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🌐 .ip 8.8.8.8\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

    await react('🌐')
    try {
      const { data } = await axios.get(`https://ipwhois.app/json/${ip}`)
      if (!data.success) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙄𝙣𝙫𝙖𝙡𝙞𝙙 𝙄𝙋\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

      const lines = [
        `🌐 *${data.ip}*`,
        `🏳️ 𝙲𝚘𝚞𝚗𝚝𝚛𝚢: ${data.country} (${data.country_code})`,
        `🏙️ 𝙲𝚒𝚝𝚢: ${data.city}`,
        `📡 𝙸𝚂𝙿: ${data.isp}`,
        `🕒 𝚃𝚒𝚖𝚎𝚣𝚘𝚗𝚎: ${data.timezone}`,
        `💻 𝚃𝚢𝚙𝚎: ${data.type}`
      ].join('\n')
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n${lines}\n🧁 𝙄𝙋 𝙞𝙣𝙛𝙤~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    } catch {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙇𝙤𝙤𝙠𝙪𝙥 𝙛𝙖𝙞𝙡𝙚𝙙\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}