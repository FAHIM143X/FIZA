export default {
  name: 'join',
  command: ['join'],
  desc: '🔗 𝙅𝙤𝙞𝙣 𝙖 𝙜𝙧𝙤𝙪𝙥 𝙫𝙞𝙖 𝙡𝙞𝙣𝙠',
  category: 'owner',
  isOwner: true,
  cooldown: 10,

  async run({ sock, msg, from, args, reply }) {
    const link = args[0]
    if (!link) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🔗 .join <invite link>\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    const code = link.match(/chat\.whatsapp\.com\/(?:invite\/)?([a-zA-Z0-9]+)/)?.[1]
    if (!code) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙄𝙣𝙫𝙖𝙡𝙞𝙙 𝙡𝙞𝙣𝙠\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    try {
      await sock.groupAcceptInvite(code)
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n✅ 𝙅𝙤𝙞𝙣𝙚𝙙 𝙜𝙧𝙤𝙪𝙥!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    } catch (e) {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ ${e.message}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}