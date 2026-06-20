export default {
  name: 'setsubject',
  command: ['setsubject', 'setdesc'],
  desc: '✏️ 𝙎𝙚𝙩 𝙜𝙧𝙤𝙪𝙥 𝙩𝙞𝙩𝙡𝙚 𝙤𝙧 𝙙𝙚𝙨𝙘𝙧𝙞𝙥𝙩𝙞𝙤𝙣',
  category: 'group',
  isGroup: true,
  isAdmin: true,
  botAdmin: true,
  cooldown: 10,

  async run({ sock, msg, from, args, reply }) {
    const sub = args[0]?.toLowerCase()
    const value = args.slice(1).join(' ')
    if (!value) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n✏️ .setsubject title New Name\n✏️ .setsubject desc New Description\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    if (sub === 'title' || sub === 'name') {
      await sock.groupUpdateSubject(from, value)
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n✅ 𝙂𝙧𝙤𝙪𝙥 𝙣𝙖𝙢𝙚 𝙪𝙥𝙙𝙖𝙩𝙚𝙙!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    } else if (sub === 'desc') {
      await sock.groupUpdateDescription(from, value)
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n✅ 𝘿𝙚𝙨𝙘𝙧𝙞𝙥𝙩𝙞𝙤𝙣 𝙪𝙥𝙙𝙖𝙩𝙚𝙙!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    } else {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ Use title or desc\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}