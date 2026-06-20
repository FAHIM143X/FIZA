export default {
  name: 'dice',
  command: ['dice', 'roll'],
  desc: '🎲 𝙍𝙤𝙡𝙡 𝙖 𝙙𝙞𝙘𝙚',
  category: 'fun',
  cooldown: 2,

  async run({ sock, msg, from, reply }) {
    const num = Math.floor(Math.random() * 6) + 1
    const faces = ['','⚀','⚁','⚂','⚃','⚄','⚅']
    reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🎲 *${faces[num]} ${num}*\n🧁 𝙏𝙧𝙮 𝙮𝙤𝙪𝙧 𝙡𝙪𝙘𝙠~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
  }
}