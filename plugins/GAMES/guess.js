const sessions = new Map()

const difficulties = {
  easy:   { max: 50,  attempts: 10, points: 10 },
  medium: { max: 100, attempts: 7,  points: 25 },
  hard:   { max: 200, attempts: 5,  points: 50 }
}

export default {
  name: 'guess',
  command: ['guess','guessnumber'],
  desc: '🔢 𝙂𝙪𝙚𝙨𝙨 𝙉𝙪𝙢𝙗𝙚𝙧 𝘽𝘼𝙏𝙏𝙇𝙀',
  category: 'games',
  cooldown: 2,

  async run({ sock, msg, from, args, reply, react }) {
    const chat = from
    const sub = args[0]?.toLowerCase()

    if (sub === 'start' || sub === 'new') {
      const diff = difficulties[args[1]?.toLowerCase()] || difficulties.medium
      const num = Math.floor(Math.random() * diff.max) + 1
      sessions.set(chat, {
        number: num,
        attempts: 0,
        maxAttempts: diff.attempts,
        max: diff.max,
        points: diff.points,
        startTime: Date.now(),
        hints: []
      })
      await react('🎯')
      return reply(
        `｡ﾟ•┈୨💖୧┈•ﾟ｡\n` +
        `🎯 *𝙂𝙐𝙀𝙎𝙎 𝙏𝙃𝙀 𝙉𝙐𝙈𝘽𝙀𝙍*\n\n` +
        `📊 𝘿𝙞𝙛𝙛𝙞𝙘𝙪𝙡𝙩𝙮: ${args[1]?.toUpperCase() || 'MEDIUM'}\n` +
        `🔢 𝙍𝙖𝙣𝙜𝙚: 1‑${diff.max}\n` +
        `🎯 𝘼𝙩𝙩𝙚𝙢𝙥𝙩𝙨: ${diff.attempts}\n` +
        `⭐ 𝙋𝙤𝙞𝙣𝙩𝙨: ${diff.points}\n\n` +
        `💝 .guess 50\n🧁 𝙂𝙤𝙤𝙙 𝙡𝙪𝙘𝙠!~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
      )
    }

    const session = sessions.get(chat)
    if (!session) return reply(
      `｡ﾟ•┈୨💖୧┈•ﾟ｡\n🎯 𝙉𝙤 𝙜𝙖𝙢𝙚 𝙖𝙘𝙩𝙞𝙫𝙚!\n💝 .guess start [easy/medium/hard]\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
    )

    const guess = parseInt(args[0])
    if (isNaN(guess) || guess < 1 || guess > session.max) {
      return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙀𝙣𝙩𝙚𝙧 1‑${session.max}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }

    session.attempts++
    await react('🔢')

    if (guess === session.number) {
      const elapsed = ((Date.now() - session.startTime) / 1000).toFixed(1)
      const timeBonus = Math.max(0, Math.floor(50 - elapsed))
      const total = session.points + timeBonus
      sessions.delete(chat)
      return reply(
        `｡ﾟ•┈୨💖୧┈•ﾟ｡\n` +
        `🎉 *${guess}* 𝙞𝙨 𝘾𝙊𝙍𝙍𝙀𝘾𝙏!\n\n` +
        `🔢 𝘼𝙩𝙩𝙚𝙢𝙥𝙩𝙨: ${session.attempts}/${session.maxAttempts}\n` +
        `⏱️ 𝙏𝙞𝙢𝙚: ${elapsed}s\n` +
        `⭐ 𝙋𝙤𝙞𝙣𝙩𝙨: ${session.points} + ${timeBonus} 𝙩𝙞𝙢𝙚 𝙗𝙤𝙣𝙪𝙨 = *${total}*\n` +
        `🧁 𝙔𝙤𝙪 𝙧𝙤𝙘𝙠!~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
      )
    }

    if (session.attempts >= session.maxAttempts) {
      sessions.delete(chat)
      return reply(
        `｡ﾟ•┈୨💖୧┈•ﾟ｡\n💀 *𝙂𝘼𝙈𝙀 𝙊𝙑𝙀𝙍!*\n🔢 𝙄𝙩 𝙬𝙖𝙨 *${session.number}*\n🧁 𝙏𝙧𝙮 𝙖𝙜𝙖𝙞𝙣~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
      )
    }

    const diff = guess - session.number
    let hint = ''
    if (Math.abs(diff) <= 5) hint = '🔥 𝙑𝙚𝙧𝙮 𝙘𝙡𝙤𝙨𝙚!'
    else if (Math.abs(diff) <= 15) hint = '👀 𝙂𝙚𝙩𝙩𝙞𝙣𝙜 𝙬𝙖𝙧𝙢...'
    else hint = '❄️ 𝙁𝙖𝙧 𝙖𝙬𝙖𝙮...'

    const direction = guess < session.number ? '📈 𝙃𝙞𝙜𝙝𝙚𝙧!' : '📉 𝙇𝙤𝙬𝙚𝙧!'
    reply(
      `｡ﾟ•┈୨💖୧┈•ﾟ｡\n` +
      `❌ *${guess}* — ${direction}\n` +
      `${hint}\n` +
      `🎯 𝙇𝙚𝙛𝙩: ${session.maxAttempts - session.attempts}/${session.maxAttempts}\n` +
      `🧁 𝙆𝙚𝙚𝙥 𝙜𝙤𝙞𝙣𝙜~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
    )
  }
}