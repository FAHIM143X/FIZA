export default {
  name: '8ball',
  command: ['8ball', 'ask'],
  desc: '🎱 𝙈𝙖𝙜𝙞𝙘 8 𝘽𝙖𝙡𝙡',
  category: 'fun',
  cooldown: 3,

  async run({ sock, msg, from, args, reply }) {
    if (!args.length) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🎱 .8ball Will I win?\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    const answers = ['Yes!', 'No.', 'Maybe...', 'Ask again later.', 'Definitely!', 'I doubt it.', 'Absolutely!', 'Not likely.']
    const ans = answers[Math.floor(Math.random() * answers.length)]
    reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🎱 *8𝘽𝙖𝙡𝙡:* ${ans}\n🧁 𝙁𝙖𝙩𝙚 𝙝𝙖𝙨 𝙨𝙥𝙤𝙠𝙚𝙣~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
  }
}