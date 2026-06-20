import Spotify from 'spotifydl-core'
const spotify = new Spotify({
  clientId: 'YOUR_SPOTIFY_CLIENT_ID',
  clientSecret: 'YOUR_SPOTIFY_CLIENT_SECRET'
})

export default {
  name: 'spotify',
  command: ['spotify', 'spdl'],
  desc: '🎵 𝙎𝙥𝙤𝙩𝙞𝙛𝙮 𝙈𝙪𝙨𝙞𝙘 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙𝙚𝙧',
  category: 'downloader',
  cooldown: 15,
  isOwner: true,   // due to API keys, restrict to owner

  async run({ sock, msg, from, args, reply, react }) {
    const url = args[0]
    if (!url || !url.includes('spotify.com')) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🎵 .spotify <track url>\n💝 .spotify https://open.spotify.com/track/xxx\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

    await react('🎵')
    try {
      const buffer = await spotify.downloadTrack(url)
      await sock.sendMessage(from, {
        audio: buffer,
        mimetype: 'audio/mpeg',
        ptt: false
      }, { quoted: msg })
      await react('✅')
    } catch (err) {
      console.log('[SPOTIFY]', err.message)
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙁𝙖𝙞𝙡𝙚𝙙. 𝘾𝙝𝙚𝙘𝙠 𝙠𝙚𝙮𝙨.\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}