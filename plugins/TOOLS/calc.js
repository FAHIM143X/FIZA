export default {
  name: 'calc',
  command: ['calc', 'math'],
  desc: '🔢 𝙎𝙞𝙢𝙥𝙡𝙚 𝘾𝙖𝙡𝙘𝙪𝙡𝙖𝙩𝙤𝙧',
  category: 'tools',
  cooldown: 2,

  async run({ sock, msg, from, args, reply }) {
    const expression = args.join('')
    if (!expression) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🔢 .calc 2+2\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    try {
      const result = eval(expression)
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🔢 *${expression}* = *${result}*\n🧁 𝙀𝙖𝙨𝙮 𝙢𝙖𝙩𝙝~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    } catch {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙄𝙣𝙫𝙖𝙡𝙞𝙙\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}