import axios from 'axios'

export default {
  name: 'meme',
  command: ['meme'],
  desc: '🤣 𝙍𝙖𝙣𝙙𝙤𝙢 𝙈𝙚𝙢𝙚',
  category: 'fun',
  cooldown: 5,

  async run({ sock, msg, from, reply }) {
    try {
      const { data } = await axios.get('https://meme-api.com/gimme', { timeout: 8000 })
      await sock.sendMessage(from, {
        image: { url: data.url },
        caption: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n🤣 *${data.title}*\n👤 r/${data.subreddit}\n👍 ${data.ups} upvotes\n🧁 𝙁𝙧𝙚𝙨𝙝 𝙢𝙚𝙢𝙚~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
      }, { quoted: msg })
    } catch {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙈𝙚𝙢𝙚 𝙛𝙖𝙞𝙡𝙚𝙙\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}