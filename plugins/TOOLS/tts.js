import axios from 'axios'

export default {
  name: 'tts',
  command: ['tts', 'speak'],
  desc: '🗣️ 𝙏𝙚𝙭𝙩 𝙩𝙤 𝙎𝙥𝙚𝙚𝙘𝙝',
  category: 'tools',
  cooldown: 8,

  async run({ sock, msg, from, args, reply, react }) {
    const text = args.join(' ')
    if (!text) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🗣️ .tts Hello world\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    await react('🔊')
    try {
      const url = `https://api.agatz.xyz/api/tts?text=${encodeURIComponent(text)}`
      const { data } = await axios.get(url, { timeout: 15000 })
      const audioUrl = data?.data?.url || data?.url
      if (!audioUrl) throw new Error('No audio')
      await sock.sendMessage(from, {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        ptt: true
      }, { quoted: msg })
    } catch {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙁𝙖𝙞𝙡𝙚𝙙\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}