import axios from 'axios'

export default {
  name: 'shorturl',
  command: ['short', 'shorten'],
  desc: '🔗 𝙐𝙍𝙇 𝙎𝙝𝙤𝙧𝙩𝙚𝙣𝙚𝙧',
  category: 'tools',
  cooldown: 5,

  async run({ sock, msg, from, args, reply }) {
    const url = args[0]
    if (!url) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🔗 .short <url>\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    try {
      const { data } = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`)
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🔗 *𝙎𝙝𝙤𝙧𝙩𝙚𝙣𝙚𝙙:*\n${data}\n🧁 𝙀𝙖𝙨𝙮 𝙨𝙝𝙖𝙧𝙚~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    } catch {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙁𝙖𝙞𝙡𝙚𝙙\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}