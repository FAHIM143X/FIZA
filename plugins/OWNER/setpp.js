export default {
  name: 'setpp',
  command: ['setpp', 'setpfp'],
  desc: '🤖 𝙎𝙚𝙩 𝙗𝙤𝙩 𝙥𝙧𝙤𝙛𝙞𝙡𝙚 𝙥𝙞𝙘𝙩𝙪𝙧𝙚',
  category: 'owner',
  isOwner: true,
  cooldown: 10,

  async run({ sock, msg, from, args, reply, quoted }) {
    const q = quoted || msg
    const mime = q.msg?.mimetype || q.mediaType || ''
    if (!/image/.test(mime)) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🖼️ 𝙍𝙚𝙥𝙡𝙮 𝙩𝙤 𝙖𝙣 𝙞𝙢𝙖𝙜𝙚\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

    const img = await q.download()
    await sock.updateProfilePicture(sock.user.id, img)
    reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n✅ 𝙋𝙧𝙤𝙛𝙞𝙡𝙚 𝙥𝙞𝙘𝙩𝙪𝙧𝙚 𝙪𝙥𝙙𝙖𝙩𝙚𝙙!\n🧁 𝙇𝙤𝙤𝙠𝙞𝙣𝙜 𝙘𝙪𝙩𝙚~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
  }
}