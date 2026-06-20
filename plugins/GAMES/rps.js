const choices = ['rock','paper','scissors']
const emojis = { rock:'✊', paper:'✋', scissors:'✌️' }
const streaks = new Map()

const trashTalk = {
  win: ['𝙀𝙖𝙨𝙮! 😎','𝙔𝙤𝙪 𝙘𝙖𝙣\'𝙩 𝙗𝙚𝙖𝙩 𝙢𝙚!','𝙄\'𝙢 𝙪𝙣𝙗𝙚𝙖𝙩𝙖𝙗𝙡𝙚! 🤖','𝙉𝙞𝙘𝙚 𝙩𝙧𝙮 𝙝𝙪𝙢𝙖𝙣!'],
  lose: ['𝙉𝙤𝙤𝙤! 𝙔𝙤𝙪 𝙜𝙤𝙩 𝙡𝙪𝙘𝙠𝙮! 😤','𝙄 𝙡𝙚𝙩 𝙮𝙤𝙪 𝙬𝙞𝙣! 🙄','𝘽𝙚𝙨𝙩 𝙤𝙛 3? 🤔'],
  tie: ['𝙂𝙧𝙚𝙖𝙩 𝙢𝙞𝙣𝙙𝙨 𝙩𝙝𝙞𝙣𝙠 𝙖𝙡𝙞𝙠𝙚! 🧠','𝙎𝙤𝙢𝙚𝙤𝙣𝙚\'𝙨 𝙘𝙤𝙥𝙮𝙞𝙣𝙜 𝙢𝙚! 👀']
}

export default {
  name: 'rps',
  command: ['rps','rockpaperscissors'],
  desc: '✊✋✌️ 𝙍𝙋𝙎 𝘿𝙀𝙇𝙐𝙓𝙀 — 𝙏𝙧𝙖𝙨𝙝 𝙏𝙖𝙡𝙠 𝘽𝙤𝙩',
  category: 'games',
  cooldown: 2,

  async run({ sock, msg, from, args, reply, react }) {
    const player = args[0]?.toLowerCase()
    if (!player || !choices.includes(player)) {
      const options = choices.map(c => `${emojis[c]} ${c}`).join(' / ')
      return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🎮 *𝙍𝙋𝙎 𝘿𝙀𝙇𝙐𝙓𝙀*\n\n🤖 𝙄\'𝙢 𝙧𝙚𝙖𝙙𝙮!\nChoose: ${options}\n💝 .rps rock\n📊 .rps stats\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }

    if (player === 'stats') {
      const s = streaks.get(from) || { wins: 0, losses: 0, ties: 0, streak: 0 }
      return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n📊 *𝙍𝙋𝙎 𝙎𝙩𝙖𝙩𝙨*\n🎉 𝙒𝙞𝙣𝙨: ${s.wins}\n😢 𝙇𝙤𝙨𝙨𝙚𝙨: ${s.losses}\n🤝 𝙏𝙞𝙚𝙨: ${s.ties}\n🔥 𝙎𝙩𝙧𝙚𝙖𝙠: ${s.streak}\n🧁 𝙆𝙚𝙚𝙥 𝙥𝙡𝙖𝙮𝙞𝙣𝙜~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }

    const bot = choices[Math.floor(Math.random()*3)]
    
    // Show "thinking" animation via reactions
    await react('🤔')
    await new Promise(r => setTimeout(r, 500))
    await react('✊')
    await new Promise(r => setTimeout(r, 300))
    await react('✋')
    await new Promise(r => setTimeout(r, 300))
    await react('✌️')
    await new Promise(r => setTimeout(r, 300))
    
    let result, emoji, trash
    const stats = streaks.get(from) || { wins: 0, losses: 0, ties: 0, streak: 0 }

    if (player === bot) {
      result = '🤝 𝙄𝙩\'𝙨 𝙖 𝙩𝙞𝙚!'
      emoji = '🤝'
      stats.ties++
      stats.streak = 0
      trash = trashTalk.tie[Math.floor(Math.random()*trashTalk.tie.length)]
    } else if (
      (player==='rock' && bot==='scissors') ||
      (player==='paper' && bot==='rock') ||
      (player==='scissors' && bot==='paper')
    ) {
      result = '🎉 𝙔𝙤𝙪 𝙒𝙄𝙉!'
      emoji = '🎉'
      stats.wins++
      stats.streak++
      trash = trashTalk.lose[Math.floor(Math.random()*trashTalk.lose.length)]
    } else {
      result = '😢 𝘽𝙤𝙩 𝙒𝙞𝙣𝙨!'
      emoji = '😢'
      stats.losses++
      stats.streak = 0
      trash = trashTalk.win[Math.floor(Math.random()*trashTalk.win.length)]
    }

    streaks.set(from, stats)
    await react(emoji)

    const streakMsg = stats.streak > 2 ? `\n🔥 𝙃𝙤𝙩 𝙎𝙩𝙧𝙚𝙖𝙠: *${stats.streak}* 𝙬𝙞𝙣𝙨 𝙞𝙣 𝙖 𝙧𝙤𝙬!` : ''

    reply(
      `｡ﾟ•┈୨💖୧┈•ﾟ｡\n` +
      `👤 𝙔𝙤𝙪: ${emojis[player]} *${player}*\n` +
      `🤖 𝘽𝙤𝙩: ${emojis[bot]} *${bot}*\n\n` +
      `${result}\n` +
      `💬 *"${trash}"*` +
      `${streakMsg}\n` +
      `🧁 .rps rock | .rps stats\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
    )
  }
}