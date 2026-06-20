export default {
  name: 'compliment',
  command: ['compliment', 'praise'],
  desc: '💖 𝙂𝙞𝙫𝙚 𝙖 𝙘𝙤𝙢𝙥𝙡𝙞𝙢𝙚𝙣𝙩',
  category: 'fun',
  cooldown: 3,

  async run({ sock, msg, from, args, reply }) {
    const compliments = [
      'You light up the room!', 'Your smile is contagious.', 'You’re a great listener.',
      'You have a heart of gold.', 'You’re smarter than you think.',
      'You’re wonderfully unique.', 'You make life fun!', 'You’re an amazing friend.'
    ]
    const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                   (args[0] ? args[0] : 'You')
    const tag = target.includes('@') ? `@${target.split('@')[0]}` : target
    const comp = compliments[Math.floor(Math.random() * compliments.length)]
    reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n💖 *${tag}* — ${comp}\n🧁 𝙎𝙥𝙧𝙚𝙖𝙙 𝙡𝙤𝙫𝙚~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`, { mentions: target.includes('@') ? [target] : [] })
  }
}