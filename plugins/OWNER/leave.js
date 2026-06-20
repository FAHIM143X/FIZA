export default {
  name: 'leave',
  command: ['leave', 'out'],
  desc: '🚪 𝙇𝙚𝙖𝙫𝙚 𝙖 𝙜𝙧𝙤𝙪𝙥',
  category: 'owner',
  isOwner: true,

  async run({ sock, msg, from, reply }) {
    if (!from.endsWith('@g.us')) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n👥 𝙂𝙧𝙤𝙪𝙥 𝙤𝙣𝙡𝙮\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    await sock.groupLeave(from)
  }
}