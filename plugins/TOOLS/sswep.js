export default {
  name: 'ssweb',
  command: ['ssweb', 'screenshot'],
  desc: '📸 𝙒𝙚𝙗𝙨𝙞𝙩𝙚 𝙎𝙘𝙧𝙚𝙚𝙣𝙨𝙝𝙤𝙩',
  category: 'tools',
  cooldown: 12,

  async run({ sock, msg, from, args, reply, react }) {
    const url = args[0]
    if (!url) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n📸 .ssweb https://example.com\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

    await react('📸')
    const imageUrl = `https://image.thum.io/get/width/1200/crop/900/${encodeURIComponent(url)}`
    await sock.sendMessage(from, {
      image: { url: imageUrl },
      caption: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n📸 *𝙎𝙘𝙧𝙚𝙚𝙣𝙨𝙝𝙤𝙩*\n🔗 ${url}\n🧁 𝙎𝙣𝙖𝙥𝙥𝙚𝙙~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
    }, { quoted: msg })
  }
}