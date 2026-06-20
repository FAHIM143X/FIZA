export default {
  name: 'timestamp',
  command: ['timestamp', 'ts'],
  desc: '🕐 𝙐𝙣𝙞𝙭 𝙏𝙞𝙢𝙚𝙨𝙩𝙖𝙢𝙥 𝘾𝙤𝙣𝙫𝙚𝙧𝙩𝙚𝙧',
  category: 'tools',
  cooldown: 2,

  async run({ sock, msg, from, args, reply }) {
    const input = args[0]
    if (!input) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🕐 .ts 1700000000\n🕐 .ts now\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    if (input === 'now') {
      const now = Math.floor(Date.now() / 1000)
      return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🕐 *Now:* ${now}\n📅 ${new Date().toLocaleString()}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
    const ts = parseInt(input)
    if (isNaN(ts)) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙄𝙣𝙫𝙖𝙡𝙞𝙙\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    const date = new Date(ts * 1000)
    reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🕐 *${ts}*\n📅 ${date.toLocaleString()}\n🧁 𝙏𝙞𝙢𝙚 𝙩𝙧𝙖𝙫𝙚𝙡~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
  }
}