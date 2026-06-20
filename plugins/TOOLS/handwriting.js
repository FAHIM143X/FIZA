import axios from 'axios'

export default {
  name: 'handwriting',
  command: ['handwrite', 'hw'],
  desc: '✍️ 𝙏𝙚𝙭𝙩 𝙩𝙤 𝙃𝙖𝙣𝙙𝙬𝙧𝙞𝙩𝙞𝙣𝙜',
  category: 'fun',
  cooldown: 8,

  async run({ sock, msg, from, args, reply, react }) {
    const text = args.join(' ')
    if (!text) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n✍️ .hw Hello World\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

    await react('✍️')
    try {
      const { data } = await axios.get(`https://api.agatz.xyz/api/handwrite?text=${encodeURIComponent(text)}`, { timeout: 15000 })
      const imageUrl = data?.data?.url || data?.url
      if (!imageUrl) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙂𝙚𝙣𝙚𝙧𝙖𝙩𝙞𝙤𝙣 𝙛𝙖𝙞𝙡𝙚𝙙\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

      await sock.sendMessage(from, {
        image: { url: imageUrl },
        caption: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n✍️ *𝙃𝙖𝙣𝙙𝙬𝙧𝙞𝙩𝙞𝙣𝙜*\n🧁 𝙇𝙤𝙤𝙠𝙨 𝙡𝙞𝙠𝙚 𝙮𝙤𝙪 𝙬𝙧𝙤𝙩𝙚 𝙞𝙩~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
      }, { quoted: msg })
    } catch {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝘼𝙋𝙄 𝙚𝙧𝙧𝙤𝙧\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}