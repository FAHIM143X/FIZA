import axios from 'axios'

export default {
  name: 'twitter',
  command: ['twitter', 'x'],
  desc: '🐦 𝙏𝙬𝙞𝙩𝙩𝙚𝙧 𝙑𝙞𝙙𝙚𝙤 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙𝙚𝙧',
  category: 'downloader',
  cooldown: 12,

  async run({ sock, msg, from, args, reply, react }) {
    const url = args[0]
    if (!url || !url.includes('twitter.com') && !url.includes('x.com')) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🐦 .twitter <url>\n💝 .twitter https://twitter.com/user/status/xxx\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

    await react('🐦')
    try {
      const { data } = await axios.get(`https://api.agatz.xyz/api/twitter?url=${encodeURIComponent(url)}`, { timeout: 30000 })
      const media = data?.data?.download?.url || data?.data?.url || data?.url
      if (!media) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙉𝙤 𝙢𝙚𝙙𝙞𝙖\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

      const res = await axios.get(media, { responseType: 'arraybuffer', timeout: 60000 })
      const buffer = Buffer.from(res.data)

      await sock.sendMessage(from, { video: buffer, caption: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n🐦 *𝙏𝙬𝙞𝙩𝙩𝙚𝙧 𝙑𝙞𝙙𝙚𝙤*\n🧁 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙𝙚𝙙~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡` }, { quoted: msg })
      await react('✅')
    } catch (err) {
      console.log('[TWITTER]', err.message)
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙀𝙧𝙧𝙤𝙧: ${err.message}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}