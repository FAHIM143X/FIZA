export default {
  name: 'advice',
  command: ['advice', 'tip'],
  desc: '💡 𝙍𝙖𝙣𝙙𝙤𝙢 𝘼𝙙𝙫𝙞𝙘𝙚',
  category: 'fun',
  cooldown: 3,

  async run({ sock, msg, from, reply }) {
    try {
      const res = await fetch('https://api.adviceslip.com/advice')
      const data = await res.json()
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n💡 *${data.slip.advice}*\n🧁 𝙒𝙞𝙨𝙚 𝙬𝙤𝙧𝙙𝙨~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    } catch {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n💡 *Always be yourself.*\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}