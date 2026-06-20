import axios from 'axios'

export default {
  name: 'animechar',
  command: ['animechar', 'char'],
  desc: '🌸 𝙎𝙚𝙖𝙧𝙘𝙝 𝘼𝙣𝙞𝙢𝙚 𝘾𝙝𝙖𝙧𝙖𝙘𝙩𝙚𝙧',
  category: 'search',
  cooldown: 6,

  async run({ sock, msg, from, args, reply, react }) {
    const query = args.join(' ')
    if (!query) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🌸 .animechar <name>\n💝 .animechar Naruto\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

    await react('🌸')
    try {
      const { data } = await axios.get(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(query)}&limit=1`)
      const char = data.data?.[0]
      if (!char) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙉𝙤𝙩 𝙛𝙤𝙪𝙣𝙙\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

      const caption = `｡ﾟ•┈୨💖୧┈•ﾟ｡
🌸 *${char.name}*
📺 𝙰𝚗𝚒𝚖𝚎: ${char.anime?.[0]?.anime?.title || 'N/A'}
💬 ${char.about?.slice(0, 300) || 'No description'}
🧁 𝙎𝙪𝙜𝙤𝙞!~
｡ﾟ•┈୨🌸୧┈•ﾟ｡`

      await sock.sendMessage(from, {
        image: { url: char.images?.jpg?.image_url || char.images?.webp?.image_url },
        caption
      }, { quoted: msg })
    } catch (e) {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ ${e.message}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}