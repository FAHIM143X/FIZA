export default {
  name: 'binary',
  command: ['binary', 'bin'],
  desc: '💻 𝙏𝙚𝙭𝙩 ↔ 𝘽𝙞𝙣𝙖𝙧𝙮 𝘾𝙤𝙣𝙫𝙚𝙧𝙩𝙚𝙧',
  category: 'tools',
  cooldown: 3,

  async run({ sock, msg, from, args, reply, react }) {
    const mode = args[0]?.toLowerCase()
    const text = args.slice(1).join(' ')
    if (!mode || !text) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n💻 .binary enc Hello\n💻 .binary dec 01001000\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

    await react('💻')
    if (mode === 'enc' || mode === 'encode') {
      const bin = text.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ')
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n💻 *𝙀𝙣𝙘𝙤𝙙𝙚𝙙:*\n${bin}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    } else if (mode === 'dec' || mode === 'decode') {
      const cleaned = text.replace(/\s/g, '')
      if (cleaned.length % 8 !== 0) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙄𝙣𝙫𝙖𝙡𝙞𝙙 𝙗𝙞𝙣𝙖𝙧𝙮\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
      const decoded = cleaned.match(/.{8}/g).map(b => String.fromCharCode(parseInt(b, 2))).join('')
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n💻 *𝘿𝙚𝙘𝙤𝙙𝙚𝙙:*\n${decoded}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    } else {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ Use enc/dec\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}