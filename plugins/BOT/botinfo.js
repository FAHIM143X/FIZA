export default {
  name: 'botinfo',
  command: ['botinfo', 'bi'],
  desc: '📟 𝘽𝙤𝙩 𝙄𝙣𝙛𝙤',
  category: 'owner',
  isOwner: true,
  cooldown: 5,

  async run({ sock, msg, from, reply }) {
    const bot = sock.user
    reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🤖 *𝙱𝚘𝚝 𝙸𝚗𝚏𝚘*\n\n• 𝙽𝚊𝚖𝚎: ${bot.name || 'FIZA'}\n• 𝙽𝚞𝚖𝚋𝚎𝚛: ${bot.id.split(':')[0]}\n• 𝙿𝚛𝚎𝚏𝚒𝚡: ${global.prefix?.[0] || '.'}\n🧁 𝙁𝙄𝙕𝘼 𝙎𝙮𝙨𝙩𝙚𝙢\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
  }
}