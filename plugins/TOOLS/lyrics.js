import axios from 'axios'

export default {
  name: 'lyrics',
  command: ['lyrics', 'lyric'],
  desc: '🎤 𝙂𝙚𝙩 𝙎𝙤𝙣𝙜 𝙇𝙮𝙧𝙞𝙘𝙨',
  category: 'tools',
  cooldown: 6,

  async run({ sock, msg, from, args, reply }) {
    const song = args.join(' ')
    if (!song) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🎤 .lyrics <song>\n💝 .lyrics perfect\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    try {
      const { data } = await axios.get(`https://some-random-api.com/lyrics?title=${encodeURIComponent(song)}`, { timeout: 10000 })
      if (!data || !data.lyrics) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙉𝙤𝙩 𝙛𝙤𝙪𝙣𝙙\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
      const lyrics = data.lyrics.length > 1500 ? data.lyrics.slice(0, 1500) + '...' : data.lyrics
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🎤 *${data.title}* - ${data.author}\n\n${lyrics}\n🧁 𝙎𝙞𝙣𝙜 𝙖𝙡𝙤𝙣𝙜~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    } catch {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙀𝙧𝙧𝙤𝙧\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}