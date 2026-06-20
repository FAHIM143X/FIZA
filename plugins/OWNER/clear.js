export default {
  name: 'clear',
  command: ['clear', 'cls'],
  desc: '🧹 𝙊𝙬𝙣𝙚𝙧 𝙘𝙡𝙚𝙖𝙧 𝙘𝙝𝙖𝙩',
  category: 'owner',
  isOwner: true,
  cooldown: 10,

  async run({ sock, msg, from, reply }) {
    try {
      const messages = await sock.loadMessages(from, 50)
      const keys = messages.filter(m => m.key.fromMe).map(m => m.key)
      if (keys.length === 0) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🧹 𝙉𝙤 𝙗𝙤𝙩 𝙢𝙚𝙨𝙨𝙖𝙜𝙚𝙨 𝙩𝙤 𝙘𝙡𝙚𝙖𝙧\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
      for (const key of keys) {
        await sock.sendMessage(from, { delete: key })
        await new Promise(r => setTimeout(r, 500))
      }
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n✅ 𝘾𝙡𝙚𝙖𝙧𝙚𝙙 ${keys.length} 𝙢𝙚𝙨𝙨𝙖𝙜𝙚𝙨\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    } catch (e) {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ ${e.message}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}