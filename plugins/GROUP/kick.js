import owner from '../../owner.js'

export default {
  name: 'kick',
  command: ['kick', 'remove'],
  desc: '🥾 𝙆𝙞𝙘𝙠 𝙖 𝙢𝙚𝙢𝙗𝙚𝙧',
  category: 'group',
  isGroup: true,
  isAdmin: true,
  botAdmin: true,

  async run({ sock, msg, from, args, sender, reply }) {
    let target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                msg.message?.extendedTextMessage?.contextInfo?.participant
    if (!target && args[0]) {
      const num = args[0].replace(/\D/g, '')
      if (num.length >= 7) target = num + '@s.whatsapp.net'
    }
    if (!target) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🍓 𝙏𝙖𝙜 𝙤𝙧 𝙧𝙚𝙥𝙡𝙮 𝙩𝙤 𝙨𝙤𝙢𝙚𝙤𝙣𝙚!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    if (target === sender) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🍓 𝙔𝙤𝙪 𝙘𝙖𝙣'𝙩 𝙠𝙞𝙘𝙠 𝙮𝙤𝙪𝙧𝙨𝙚𝙡𝙛!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    if (target === sock.user?.id) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🤖 𝙄 𝙘𝙖𝙣'𝙩 𝙠𝙞𝙘𝙠 𝙢𝙮𝙨𝙚𝙡𝙛!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    if (owner.isOwner(target)) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n👑 𝘾𝙖𝙣'𝙩 𝙠𝙞𝙘𝙠 𝙩𝙝𝙚 𝙤𝙬𝙣𝙚𝙧!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

    try {
      await sock.groupParticipantsUpdate(from, [target], 'remove')
      sock.sendMessage(from, {
        text: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n🥾 @${target.split('@')[0]} 𝙠𝙞𝙘𝙠𝙚𝙙!\n👋 𝘽𝙮𝙚~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`,
        mentions: [target]
      })
    } catch (e) {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙁𝙖𝙞𝙡𝙚𝙙!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}