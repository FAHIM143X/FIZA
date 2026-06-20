const words = ['javascript','whatsapp','bot','fiza','programming','computer','keyboard','internet']

export default {
  name: 'scramble',
  command: ['scramble','jumble'],
  desc: '🔀 𝙒𝙤𝙧𝙙 𝙎𝙘𝙧𝙖𝙢𝙗𝙡𝙚',
  category: 'games',
  cooldown: 5,

  async run({ sock, msg, from, args, reply, react }) {
    if (args[0] === 'answer') {
      const answer = args.slice(1).join('').toLowerCase()
      const last = this.lastWord?.get?.(from)
      if (!last) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🔀 𝙉𝙤 𝙬𝙤𝙧𝙙 𝙖𝙘𝙩𝙞𝙫𝙚.\n💝 .scramble\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
      if (answer === last.original) {
        this.lastWord.delete(from)
        return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🎉 𝘾𝙤𝙧𝙧𝙚𝙘𝙩! *${last.original}*\n🧁 𝙒𝙚𝙡𝙡 𝙙𝙤𝙣𝙚~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
      } else {
        return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙒𝙧𝙤𝙣𝙜! 𝙏𝙧𝙮 𝙖𝙜𝙖𝙞𝙣.\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
      }
    }

    const word = words[Math.floor(Math.random()*words.length)]
    const scrambled = word.split('').sort(()=>Math.random()-0.5).join('')
    if (scrambled === word) return this.run(...arguments) // reshuffle if same
    this.lastWord = this.lastWord || new Map()
    this.lastWord.set(from, { original: word })
    await react('🔀')
    reply(
      `｡ﾟ•┈୨💖୧┈•ﾟ｡\n🔀 *${scrambled}*\n\n💡 𝙏𝙮𝙥𝙚 *.scramble answer <word>*\n🧁 𝙐𝙣𝙨𝙘𝙧𝙖𝙢𝙗𝙡𝙚 𝙞𝙩~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
    )
  }
}