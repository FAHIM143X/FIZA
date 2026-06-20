export default {
  name: 'reverse',
  command: ['reverse', 'rev'],
  desc: '🔄 𝙍𝙚𝙫𝙚𝙧𝙨𝙚 𝙏𝙚𝙭𝙩',
  category: 'fun',
  cooldown: 2,

  async run({ sock, msg, from, args, reply, react }) {
    const text = args.join(' ')
    if (!text) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🔄 .reverse Hello\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    await react('🔄')
    const reversed = text.split('').reverse().join('')
    reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🔄 *${reversed}*\n🧁 𝙐𝙣𝙤 𝙚𝙨𝙧𝙚𝙫𝙚𝙧~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
  }
}