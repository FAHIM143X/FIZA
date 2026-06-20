import axios from 'axios'

export default {
  name: 'gpt',
  command: ['gpt', 'ai', 'ask'],
  desc: '🤖 𝙂𝙋𝙏 𝘼𝙄 𝘾𝙝𝙖𝙩',
  category: 'ai',
  cooldown: 10,

  async run({ sock, msg, from, args, reply, react }) {
    const prompt = args.join(' ')
    if (!prompt) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🤖 .gpt <question>\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    await react('🤖')
    try {
      const res = await axios.post('https://api.agatz.xyz/api/gpt', { prompt }, { timeout: 30000 })
      const answer = res.data?.data?.response || res.data?.response || res.data?.data
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🤖 *𝙂𝙋𝙏*\n\n${answer}\n🧁 𝙋𝙤𝙬𝙚𝙧𝙚𝙙 𝙗𝙮 𝙁𝙄𝙕𝘼\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    } catch {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝘼𝙄 𝙪𝙣𝙖𝙫𝙖𝙞𝙡𝙖𝙗𝙡𝙚\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}