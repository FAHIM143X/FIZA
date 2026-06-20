export default {
  name: 'block',
  command: ['block', 'unblock'],
  desc: '🚫 𝙊𝙬𝙣𝙚𝙧 𝙩𝙤𝙤𝙡 𝙩𝙤 𝙗𝙡𝙤𝙘𝙠/𝙪𝙣𝙗𝙡𝙤𝙘𝙠',
  category: 'owner',
  isOwner: true,

  async run({ sock, msg, from, args, reply }) {
    const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                   (args[0]?.replace(/\D/g, '') + '@s.whatsapp.net')
    if (!target) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🍓 𝙏𝙖𝙜 𝙤𝙧 𝙣𝙪𝙢𝙗𝙚𝙧\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    const cmd = args[0]?.toLowerCase() === 'unblock' ? 'unblock' : 'block'
    await sock.updateBlockStatus(target, cmd)
    reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n✅ @${target.split('@')[0]} ${cmd}ed\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`, { mentions: [target] })
  }
}