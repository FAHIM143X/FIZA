import yts from 'yt-search'
import axios from 'axios'

export default {
  name: 'ytmp4',
  command: ['ytmp4', 'video'],
  desc: '🎬 𝙔𝙤𝙪𝙏𝙪𝙗𝙚 𝙑𝙞𝙙𝙚𝙤 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙𝙚𝙧',
  category: 'downloader',
  cooldown: 15,

  async run({ sock, msg, from, args, reply, react }) {
    const query = args.join(' ')
    if (!query) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🎬 .ytmp4 <video name or url>\n💝 .ytmp4 never gonna give you up\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

    await react('🎬')
    try {
      const search = await yts(query)
      const video = search.videos[0]
      if (!video) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙉𝙤 𝙧𝙚𝙨𝙪𝙡𝙩𝙨\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

      await sock.sendMessage(from, {
        text: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n🎬 *𝙁𝙤𝙪𝙣𝙙!*\n🎵 *${video.title}*\n⏱️ ${video.timestamp}\n📺 ${video.author.name}\n⏳ 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙𝙞𝙣𝙜...\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
      }, { quoted: msg })

      let videoUrl = null
      try {
        const { data } = await axios.get(`https://api.agatz.xyz/api/ytmp4?url=${encodeURIComponent(video.url)}`, { timeout: 30000 })
        videoUrl = data?.data?.download?.url || data?.data?.url
      } catch {}

      if (!videoUrl) {
        try {
          const { data } = await axios.get(`https://api.giftedtech.web.id/api/download/dlmp4?url=${encodeURIComponent(video.url)}`, { timeout: 30000 })
          videoUrl = data?.data?.url || data?.result?.download?.url
        } catch {}
      }

      if (!videoUrl) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙 𝙛𝙖𝙞𝙡𝙚𝙙\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

      const videoRes = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 120000 })
      const videoBuffer = Buffer.from(videoRes.data)

      // Try to get thumbnail
      let thumbnail = null
      try {
        const thumbRes = await axios.get(video.thumbnail, { responseType: 'arraybuffer', timeout: 5000 })
        thumbnail = Buffer.from(thumbRes.data)
      } catch {}

      await sock.sendMessage(from, {
        video: videoBuffer,
        mimetype: 'video/mp4',
        caption: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n🎬 *${video.title}*\n🧁 𝙀𝙣𝙟𝙤𝙮 𝙮𝙤𝙪𝙧 𝙫𝙞𝙙𝙚𝙤~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`,
        jpegThumbnail: thumbnail || undefined
      }, { quoted: msg })

      await react('✅')
    } catch (err) {
      console.log('[YTMP4]', err.message)
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙀𝙧𝙧𝙤𝙧: ${err.message}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}