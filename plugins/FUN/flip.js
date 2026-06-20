export default {
  name: 'flip',
  command: ['flip', 'coin'],
  desc: '🪙 𝙁𝙡𝙞𝙥 𝙖 𝙘𝙤𝙞𝙣',
  category: 'fun',
  cooldown: 2,

  async run({ sock, msg, from, reply }) {
    const result = Math.random() < 0.5 ? '𝙃𝙚𝙖𝙙𝙨 🪙' : '𝙏𝙖𝙞𝙡𝙨 🪙'
    reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🪙 *${result}*\n🧁 𝙇𝙪𝙘𝙠 𝙩𝙚𝙨𝙩~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
  }
}