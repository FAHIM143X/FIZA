export default {
  name: 'base64',
  command: ['base64', 'b64'],
  desc: '🔐 𝘽𝙖𝙨𝙚64 𝙀𝙣𝙘𝙤𝙙𝙚/𝘿𝙚𝙘𝙤𝙙𝙚',
  category: 'tools',
  cooldown: 3,

  async run({ sock, msg, from, args, reply }) {
    const sub = args[0]?.toLowerCase()
    const text = args.slice(1).join(' ')
    if (!text) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🔐 .b64 enc Hello\n🔐 .b64 dec SGVsbG8=\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    if (sub === 'enc' || sub === 'encode') {
      const encoded = Buffer.from(text).toString('base64')
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🔐 *𝙀𝙣𝙘𝙤𝙙𝙚𝙙:* ${encoded}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    } else if (sub === 'dec' || sub === 'decode') {
      try {
        const decoded = Buffer.from(text, 'base64').toString('utf8')
        reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🔓 *𝘿𝙚𝙘𝙤𝙙𝙚𝙙:* ${decoded}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
      } catch {
        reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙄𝙣𝙫𝙖𝙡𝙞𝙙\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
      }
    } else {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ Use enc/dec\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}