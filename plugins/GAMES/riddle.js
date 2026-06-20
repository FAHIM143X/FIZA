import axios from 'axios'

const scores = new Map() // user -> total score
const activeRiddles = new Map()

const categories = {
  general: 'https://riddles-api.vercel.app/random',
  // Add more categories if API supports
}

export default {
  name: 'riddle',
  command: ['riddle','puzzle'],
  desc: '🤔 𝙍𝙞𝙙𝙙𝙡𝙚 𝘼𝙙𝙫𝙚𝙣𝙩𝙪𝙧𝙚 — 𝙀𝙖𝙧𝙣 𝙋𝙤𝙞𝙣𝙩𝙨!',
  category: 'games',
  cooldown: 4,

  async run({ sock, msg, from, args, reply, react, sender }) {
    const user = sender

    // Show leaderboard
    if (args[0] === 'leaderboard' || args[0] === 'top') {
      const top = [...scores.entries()].sort((a,b) => b[1] - a[1]).slice(0, 5)
      if (top.length === 0) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🏆 𝙉𝙤 𝙨𝙘𝙤𝙧𝙚𝙨 𝙮𝙚𝙩!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
      const board = top.map(([u,s],i) => `${['🥇','🥈','🥉','4️⃣','5️⃣'][i]} @${u.split('@')[0]}: ${s} pts`).join('\n')
      return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🏆 *𝙍𝙄𝘿𝘿𝙇𝙀 𝙇𝙀𝘼𝘿𝙀𝙍𝘽𝙊𝘼𝙍𝘿*\n\n${board}\n🧁 .riddle to play!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`, { mentions: top.map(t => t[0]) })
    }

    // Answer a riddle
    if (args[0] === 'answer') {
      const answer = args.slice(1).join(' ').toLowerCase()
      const riddle = activeRiddles.get(from)
      if (!riddle) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🤔 𝙉𝙤 𝙧𝙞𝙙𝙙𝙡𝙚 𝙖𝙘𝙩𝙞𝙫𝙚.\n💝 .riddle\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
      
      if (answer === riddle.answer.toLowerCase()) {
        const userScore = (scores.get(user) || 0) + 10
        scores.set(user, userScore)
        activeRiddles.delete(from)
        await react('🎉')
        return reply(
          `｡ﾟ•┈୨💖୧┈•ﾟ｡\n` +
          `🎉 *𝘾𝙊𝙍𝙍𝙀𝘾𝙏!* +10 𝙥𝙤𝙞𝙣𝙩𝙨\n` +
          `✅ 𝘼𝙣𝙨𝙬𝙚𝙧: *${riddle.answer}*\n` +
          `⭐ 𝙔𝙤𝙪𝙧 𝙎𝙘𝙤𝙧𝙚: ${userScore}\n` +
          `🧁 .riddle for more | .riddle top\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
        )
      } else {
        return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙒𝙧𝙤𝙣𝙜! 𝙏𝙧𝙮 𝙖𝙜𝙖𝙞𝙣! 💪\n💡 𝙃𝙞𝙣𝙩: 𝙞𝙩 𝙨𝙩𝙖𝙧𝙩𝙨 𝙬𝙞𝙩𝙝 "${riddle.answer[0].toUpperCase()}"\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
      }
    }

    // Get a riddle
    await react('🤔')
    try {
      const { data } = await axios.get(categories.general)
      if (!data?.riddle) throw new Error('No riddle')
      activeRiddles.set(from, { answer: data.answer, attempts: 0 })
      const userScore = scores.get(user) || 0
      reply(
        `｡ﾟ•┈୨💖୧┈•ﾟ｡\n` +
        `🤔 *𝙍𝙄𝘿𝘿𝙇𝙀 𝘼𝘿𝙑𝙀𝙉𝙏𝙐𝙍𝙀*\n\n` +
        `📝 ${data.riddle}\n\n` +
        `💡 .riddle answer <your guess>\n` +
        `⭐ 𝙔𝙤𝙪𝙧 𝙎𝙘𝙤𝙧𝙚: ${userScore}\n` +
        `🧁 𝙂𝙤𝙤𝙙 𝙡𝙪𝙘𝙠!~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
      )
    } catch {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙉𝙤 𝙧𝙞𝙙𝙙𝙡𝙚 𝙖𝙫𝙖𝙞𝙡𝙖𝙗𝙡𝙚\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}