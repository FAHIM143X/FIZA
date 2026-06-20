export default {
  name: 'poll',
  command: ['poll', 'vote'],
  desc: '📊 𝙂𝙧𝙤𝙪𝙥 𝙋𝙤𝙡𝙡',
  category: 'group',
  isGroup: true,
  isAdmin: true,
  cooldown: 10,

  async run({ sock, msg, from, args, reply }) {
    const parts = args.join(' ').split('|')
    const question = parts[0]?.trim()
    const options = parts.slice(1).map(o => o.trim()).filter(o => o)
    if (!question || options.length < 2) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n📊 .poll Question?|A|B|C\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

    await sock.sendMessage(from, {
      poll: {
        name: question,
        values: options,
        selectableCount: 1
      }
    }, { quoted: msg })
  }
}