export default {
  name: 'lovecalc',
  command: ['lovecalc', 'love'],
  desc: '💘 𝙇𝙤𝙫𝙚 𝘾𝙖𝙡𝙘𝙪𝙡𝙖𝙩𝙤𝙧',
  category: 'fun',
  cooldown: 5,

  async run({ sock, msg, from, args, reply }) {
    const [name1, name2] = args
    if (!name1 || !name2) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n💘 .lovecalc Alice Bob\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    const percent = Math.floor(Math.random() * 101)
    reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n💘 *${name1}* + *${name2}* = *${percent}%*\n🧁 𝙇𝙤𝙫𝙚 𝙞𝙨 𝙞𝙣 𝙩𝙝𝙚 𝙖𝙞𝙧~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
  }
}