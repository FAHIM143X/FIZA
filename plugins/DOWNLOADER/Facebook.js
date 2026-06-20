import axios from 'axios'

export default {
  name: 'facebook',
  command: ['facebook', 'fb', 'fbdl'],
  desc: '📘 𝙁𝙖𝙘𝙚𝙗𝙤𝙤𝙠 𝙑𝙞𝙙𝙚𝙤 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙𝙚𝙧',
  category: 'downloader',
  cooldown: 12,

  async run({ sock, msg, from, args, reply, react }) {
    const url = args[0]
    if (!url || !url.includes('facebook.com') && !url.includes('fb.watch')) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n📘 .facebook <url>\n💝 .facebook https://fb.watch/xxxxx\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

    await react('📘')
    try {
      const { data } = await axios.get(`https://api.agatz.xyz/api/facebook?url=${encodeURIComponent(url)}`, { timeout: 30000 })
      const videoUrl = data?.data?.download?.url || data?.data?.url || data?.url
      if (!videoUrl) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙉𝙤 𝙫𝙞𝙙𝙚𝙤\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

      const res = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 60000 })
      const buffer = Buffer.from(res.data)

      await sock.sendMessage(from, { video: buffer, caption: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n📘 *𝙁𝙖𝙘𝙚𝙗𝙤𝙤𝙠 𝙑𝙞𝙙𝙚𝙤*\n🧁 𝙎𝙖𝙫𝙚𝙙~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡` }, { quoted: msg })
      await react('✅')
    } catch (err) {
      console.log('[FACEBOOK]', err.message)
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙀𝙧𝙧𝙤𝙧: ${err.message}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}