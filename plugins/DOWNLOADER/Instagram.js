import axios from 'axios'

export default {
  name: 'instagram',
  command: ['instagram', 'ig', 'reel'],
  desc: '📸 𝙄𝙣𝙨𝙩𝙖𝙜𝙧𝙖𝙢 𝙑𝙞𝙙𝙚𝙤 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙𝙚𝙧',
  category: 'downloader',
  cooldown: 12,

  async run({ sock, msg, from, args, reply, react }) {
    const url = args[0]
    if (!url || !url.includes('instagram.com')) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n📸 .instagram <url>\n💝 .instagram https://www.instagram.com/reel/xxx/\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

    await react('📸')
    try {
      const { data } = await axios.get(`https://api.agatz.xyz/api/instagram?url=${encodeURIComponent(url)}`, { timeout: 30000 })
      const media = data?.data?.download?.url || data?.data?.url || data?.url
      if (!media) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙉𝙤 𝙢𝙚𝙙𝙞𝙖 𝙛𝙤𝙪𝙣𝙙\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

      const res = await axios.get(media, { responseType: 'arraybuffer', timeout: 60000 })
      const buffer = Buffer.from(res.data)
      const isVideo = media.endsWith('.mp4') || (res.headers['content-type']?.includes('video'))

      if (isVideo) {
        await sock.sendMessage(from, { video: buffer, caption: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n📸 *𝙄𝙣𝙨𝙩𝙖𝙜𝙧𝙖𝙢 𝙑𝙞𝙙𝙚𝙤*\n🧁 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙𝙚𝙙~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡` }, { quoted: msg })
      } else {
        await sock.sendMessage(from, { image: buffer, caption: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n📸 *𝙄𝙣𝙨𝙩𝙖𝙜𝙧𝙖𝙢 𝙋𝙤𝙨𝙩*\n🧁 𝙎𝙖𝙫𝙚𝙙~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡` }, { quoted: msg })
      }
      await react('✅')
    } catch (err) {
      console.log('[INSTAGRAM]', err.message)
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙀𝙧𝙧𝙤𝙧: ${err.message}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}