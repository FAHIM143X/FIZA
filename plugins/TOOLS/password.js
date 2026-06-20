export default {
  name: 'password',
  command: ['password', 'passgen'],
  desc: '🔐 𝙍𝙖𝙣𝙙𝙤𝙢 𝙋𝙖𝙨𝙨𝙬𝙤𝙧𝙙 𝙂𝙚𝙣𝙚𝙧𝙖𝙩𝙤𝙧',
  category: 'tools',
  cooldown: 2,

  async run({ sock, msg, from, args, reply }) {
    const length = parseInt(args[0]) || 16
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()'
    let pass = ''
    for (let i = 0; i < length; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length))
    reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🔐 *𝙋𝙖𝙨𝙨𝙬𝙤𝙧𝙙* (${length} chars)\n\`\`\`${pass}\`\`\`\n🧁 𝙆𝙚𝙚𝙥 𝙞𝙩 𝙨𝙖𝙛𝙚~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
  }
}