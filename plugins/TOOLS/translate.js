import axios from 'axios'

export default {
  name: 'translate',
  command: ['tr', 'translate'],
  desc: '🌐 𝙏𝙧𝙖𝙣𝙨𝙡𝙖𝙩𝙚 𝙩𝙚𝙭𝙩',
  category: 'tools',
  cooldown: 5,

  async run({ sock, msg, from, args, reply }) {
    const [lang, ...text] = args.join(' ').split('|')
    if (!lang || !text.length) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🌐 .tr en|Hello\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    const res = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.join('|'))}&langpair=auto|${lang}`)
    const translated = res.data.responseData.translatedText
    reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🌐 *${lang.toUpperCase()}*\n${translated}\n🧁 𝙏𝙧𝙖𝙣𝙨𝙡𝙖𝙩𝙚𝙙~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
  }
}