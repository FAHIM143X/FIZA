import axios from 'axios'

export default {
  name: 'currency',
  command: ['currency', 'cur'],
  desc: '💱 𝙀𝙭𝙘𝙝𝙖𝙣𝙜𝙚 𝙍𝙖𝙩𝙚𝙨',
  category: 'tools',
  cooldown: 8,

  async run({ sock, msg, from, args, reply, react }) {
    const [amount, from, to] = args
    if (!amount || !from || !to) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n💱 .cur 1 USD INR\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

    await react('💱')
    try {
      const { data } = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from.toUpperCase()}`)
      const rate = data.rates[to.toUpperCase()]
      if (!rate) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙄𝙣𝙫𝙖𝙡𝙞𝙙 𝙘𝙪𝙧𝙧𝙚𝙣𝙘𝙮\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
      const result = (amount * rate).toFixed(2)
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n💱 *${amount} ${from.toUpperCase()}* = *${result} ${to.toUpperCase()}*\n🧁 𝙍𝙖𝙩𝙚: 1 ${from.toUpperCase()} = ${rate} ${to.toUpperCase()}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    } catch {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙎𝙚𝙧𝙫𝙚𝙧 𝙙𝙤𝙬𝙣\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}