import axios from 'axios'

export default {
  name: 'imagine',
  command: ['imagine', 'aiimg', 'gen'],
  desc: '🎨 𝘼𝙄 𝙄𝙢𝙖𝙜𝙚 𝙂𝙚𝙣𝙚𝙧𝙖𝙩𝙤𝙧',
  category: 'ai',
  cooldown: 15,

  async run({ sock, msg, from, args, reply, react }) {
    const prompt = args.join(' ')
    if (!prompt) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🎨 .imagine <description>\n💝 .imagine cute cat\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

    await react('🎨')
    try {
      const { data } = await axios.get(`https://api.agatz.xyz/api/stable-diffusion?prompt=${encodeURIComponent(prompt)}`, { timeout: 60000 })
      const imageUrl = data?.data?.url || data?.url
      if (!imageUrl) throw new Error('No image')

      await sock.sendMessage(from, {
        image: { url: imageUrl },
        caption: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n🎨 *${prompt}*\n🧁 𝘼𝙄 𝙂𝙚𝙣𝙚𝙧𝙖𝙩𝙚𝙙~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
      }, { quoted: msg })
      await react('✅')
    } catch (e) {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙁𝙖𝙞𝙡𝙚𝙙: ${e.message}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}