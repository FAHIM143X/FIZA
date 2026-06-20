export default {
  name: 'broadcast',
  command: ['bc', 'broadcast'],
  desc: '📢 𝙊𝙬𝙣𝙚𝙧 𝘽𝙧𝙤𝙖𝙙𝙘𝙖𝙨𝙩',
  category: 'owner',
  isOwner: true,
  cooldown: 30,

  async run({ sock, msg, from, args, reply, sleep }) {
    const text = args.join(' ')
    if (!text) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n📢 .bc <message>\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    const chats = await sock.groupFetchAllParticipating()
    const ids = Object.keys(chats)
    for (const id of ids) {
      await sock.sendMessage(id, { text: `📢 *𝘽𝙧𝙤𝙖𝙙𝙘𝙖𝙨𝙩*\n\n${text}\n\n🧁 𝙁𝙄𝙕𝘼 𝘽𝙤𝙩` })
      await sleep(2000)
    }
    reply(`✅ 𝙎𝙚𝙣𝙩 𝙩𝙤 ${ids.length} 𝙜𝙧𝙤𝙪𝙥𝙨`)
  }
}