export default {
  name: 'joke',
  command: ['joke', 'jokes'],
  desc: '🤣 𝙍𝙖𝙣𝙙𝙤𝙢 𝙅𝙤𝙠𝙚',
  category: 'fun',
  cooldown: 3,

  async run({ sock, msg, from, reply }) {
    const res = await fetch('https://v2.jokeapi.dev/joke/Any?safe-mode')
    const data = await res.json()
    const joke = data.type === 'single' ? data.joke : `*${data.setup}*\n\n${data.delivery}`
    reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🤣 *𝙅𝙤𝙠𝙚*\n${joke}\n🧁 𝙃𝙤𝙥𝙚 𝙮𝙤𝙪 𝙡𝙖𝙪𝙜𝙝𝙚𝙙~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
  }
}