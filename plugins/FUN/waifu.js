export default {
  name: 'waifu',
  command: ['waifu', 'neko', 'animegirl'],
  desc: '🌸 𝘼𝙣𝙞𝙢𝙚 𝙒𝙖𝙞𝙛𝙪 / 𝙉𝙚𝙠𝙤',
  category: 'fun',
  cooldown: 5,

  async run({ sock, msg, from, args, reply, react }) {
    const type = args[0]?.toLowerCase() === 'neko' ? 'neko' : 'waifu'
    const res = await fetch(`https://api.waifu.pics/sfw/${type}`)
    const data = await res.json()
    await sock.sendMessage(from, {
      image: { url: data.url },
      caption: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n🌸 *${type.toUpperCase()}*\n🧁 𝙆𝙖𝙬𝙖𝙞𝙞~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
    }, { quoted: msg })
  }
}