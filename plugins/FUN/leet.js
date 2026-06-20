export default {
  name: 'leet',
  command: ['leet', '1337'],
  desc: '🤓 𝙇𝙚𝙚𝙩 𝙎𝙥𝙚𝙖𝙠 𝘾𝙤𝙣𝙫𝙚𝙧𝙩𝙚𝙧',
  category: 'fun',
  cooldown: 2,

  async run({ sock, msg, from, args, reply, react }) {
    const text = args.join(' ')
    if (!text) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🤓 .leet Hello\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    await react('🤓')
    const map = {a:'4',e:'3',i:'1',o:'0',s:'5',t:'7',l:'1'}
    const leet = text.toLowerCase().split('').map(c => map[c] || c).join('')
    reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🤓 *${leet}*\n🧁 1337 𝙝𝙖𝙭~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
  }
}