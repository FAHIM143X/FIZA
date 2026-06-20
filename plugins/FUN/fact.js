export default {
  name: 'fact',
  command: ['fact', 'facts'],
  desc: '🧠 𝙍𝙖𝙣𝙙𝙤𝙢 𝙁𝙖𝙘𝙩',
  category: 'fun',
  cooldown: 3,

  async run({ sock, msg, from, reply }) {
    const res = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en')
    const data = await res.json()
    reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🧠 *𝙁𝙖𝙘𝙩*\n${data.text}\n🧁 𝙎𝙩𝙖𝙮 𝙘𝙪𝙧𝙞𝙤𝙪𝙨~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
  }
}