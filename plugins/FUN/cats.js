export default {
  name: 'cat',
  command: ['cat', 'meow'],
  desc: '🐱 𝙍𝙖𝙣𝙙𝙤𝙢 𝘾𝙖𝙩 𝙋𝙞𝙘𝙩𝙪𝙧𝙚',
  category: 'fun',
  cooldown: 5,

  async run({ sock, msg, from, reply, react }) {
    await react('🐱')
    const url = `https://cataas.com/cat?t=${Date.now()}`
    await sock.sendMessage(from, {
      image: { url },
      caption: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n🐱 *𝙈𝙚𝙤𝙬!*\n🧁 𝘾𝙪𝙩𝙚 𝙘𝙖𝙩 𝙖𝙡𝙚𝙧𝙩~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
    }, { quoted: msg })
  }
}