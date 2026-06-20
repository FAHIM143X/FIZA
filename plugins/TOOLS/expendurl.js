export default {
  name: 'expandurl',
  command: ['expand', 'unshort'],
  desc: '🔗 𝙀𝙭𝙥𝙖𝙣𝙙 𝙎𝙝𝙤𝙧𝙩 𝙐𝙍𝙇',
  category: 'tools',
  cooldown: 5,

  async run({ sock, msg, from, args, reply, react }) {
    const url = args[0]
    if (!url) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🔗 .expand https://tinyurl.com/xxxx\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

    await react('🔗')
    try {
      const res = await fetch(url, { method: 'HEAD', redirect: 'manual' })
      const location = res.headers.get('location')
      if (location) {
        reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🔗 *𝙀𝙭𝙥𝙖𝙣𝙙𝙚𝙙:*\n${location}\n🧁 𝙉𝙤 𝙢𝙤𝙧𝙚 𝙢𝙮𝙨𝙩𝙚𝙧𝙮~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
      } else {
        reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙉𝙤 𝙧𝙚𝙙𝙞𝙧𝙚𝙘𝙩\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
      }
    } catch {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙁𝙖𝙞𝙡𝙚𝙙\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}