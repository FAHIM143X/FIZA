import axios from 'axios'

export default {
  name: 'tiktok',
  command: ['tiktok', 'tt'],
  desc: '🎵 𝙏𝙞𝙠𝙏𝙤𝙠 𝙑𝙞𝙙𝙚𝙤 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙𝙚𝙧',
  category: 'downloader',
  cooldown: 12,

  async run({ sock, msg, from, args, reply, react }) {
    const url = args[0]
    if (!url || !url.includes('tiktok.com')) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🎵 .tiktok <url>\n💝 .tiktok https://vt.tiktok.com/xxxx/\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

    await react('🎵')
    try {
      const { data } = await axios.get(`https://api.agatz.xyz/api/tiktok?url=${encodeURIComponent(url)}`, { timeout: 30000 })
      const videoUrl = data?.data?.noWatermark || data?.data?.nowm || data?.data?.download?.url || data?.url
      if (!videoUrl) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙉𝙤 𝙫𝙞𝙙𝙚𝙤\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

      const res = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 60000 })
      const buffer = Buffer.from(res.data)

      await sock.sendMessage(from, { video: buffer, caption: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n🎵 *𝙏𝙞𝙠𝙏𝙤𝙠*\n🧁 𝙀𝙣𝙟𝙤𝙮~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡` }, { quoted: msg })
      await react('✅')
    } catch (err) {
      console.log('[TIKTOK]', err.message)
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙀𝙧𝙧𝙤𝙧: ${err.message}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}