export default {
  name: 'morse',
  command: ['morse'],
  desc: '⚡ 𝙈𝙤𝙧𝙨𝙚 𝘾𝙤𝙙𝙚 𝘾𝙤𝙣𝙫𝙚𝙧𝙩𝙚𝙧',
  category: 'tools',
  cooldown: 3,

  async run({ sock, msg, from, args, reply }) {
    const morse = {
      'a':'.-','b':'-...','c':'-.-.','d':'-..','e':'.','f':'..-.','g':'--.','h':'....','i':'..','j':'.---','k':'-.-','l':'.-..','m':'--','n':'-.','o':'---','p':'.--.','q':'--.-','r':'.-.','s':'...','t':'-','u':'..-','v':'...-','w':'.--','x':'-..-','y':'-.--','z':'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.',' ':'/'
    }
    const text = args.join(' ').toLowerCase()
    if (!text) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n⚡ .morse hello\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    const converted = text.split('').map(c => morse[c] || c).join(' ')
    reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n⚡ *𝙈𝙤𝙧𝙨𝙚:*\n${converted}\n🧁 𝘽𝙚𝙚𝙥 𝙗𝙤𝙤𝙥~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
  }
}