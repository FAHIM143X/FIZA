const EMOJIS = ['🍎','🍊','🍋','🍇','🍓','🍒','🥝','🍑']
const games = new Map()

export default {
    name: 'memory',
    command: ['memory', 'match', 'cards'],
    desc: '🃏 𝙈𝙚𝙢𝙤𝙧𝙮 𝙈𝙖𝙩𝙘𝙝 — 𝙁𝙡𝙞𝙥 & 𝙈𝙖𝙩𝙘𝙝!',
    category: 'games',
    cooldown: 2,

    async run({ sock, msg, from, args, reply, react, sender }) {
        const chat = from
        const input = args[0]?.toLowerCase()

        // Start
        if (input === 'start' || input === 'new') {
            if (games.has(chat)) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n⚠️ 𝙂𝙖𝙢𝙚 𝙞𝙣 𝙥𝙧𝙤𝙜𝙧𝙚𝙨𝙨!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

            // Create shuffled pairs
            const cards = [...EMOJIS, ...EMOJIS].sort(() => Math.random() - 0.5)
            const board = cards.map((emoji, i) => ({ emoji, flipped: false, matched: false, id: i }))

            games.set(chat, {
                board,
                flipped: [],
                matches: 0,
                attempts: 0,
                streak: 0,
                startTime: Date.now(),
                player: sender
            })

            await react('🃏')
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
🃏 *𝙈𝙀𝙈𝙊𝙍𝙔 𝙈𝘼𝙏𝘾𝙃*

🎯 𝙁𝙡𝙞𝙥 2 𝙘𝙖𝙧𝙙𝙨 & 𝙛𝙞𝙣𝙙 𝙥𝙖𝙞𝙧𝙨!

${renderBoard(games.get(chat).board)}

💝 .memory flip 1 5
🧁 𝙁𝙞𝙣𝙙 𝙖𝙡𝙡 8 𝙥𝙖𝙞𝙧𝙨!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            )
        }

        // Flip cards
        if (input === 'flip') {
            const game = games.get(chat)
            if (!game) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n⚠️ 𝙉𝙤 𝙜𝙖𝙢𝙚!\n💝 .memory start\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

            const card1 = parseInt(args[1]) - 1
            const card2 = parseInt(args[2]) - 1

            if (isNaN(card1) || isNaN(card2)) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ .memory flip <card1> <card2>\n💝 .memory flip 1 5\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
            if (card1 < 0 || card1 > 15 || card2 < 0 || card2 > 15) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝘾𝙖𝙧𝙙𝙨 1‑16\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
            if (card1 === card2) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝘿𝙞𝙛𝙛𝙚𝙧𝙚𝙣𝙩 𝙘𝙖𝙧𝙙𝙨!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
            if (game.board[card1].matched || game.board[card2].matched) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝘼𝙡𝙧𝙚𝙖𝙙𝙮 𝙢𝙖𝙩𝙘𝙝𝙚𝙙!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

            game.attempts++
            const c1 = game.board[card1]
            const c2 = game.board[card2]

            if (c1.emoji === c2.emoji) {
                // Match!
                c1.matched = true
                c2.matched = true
                game.matches++
                game.streak++

                await react('✅')

                if (game.matches === EMOJIS.length) {
                    // All matched!
                    const time = ((Date.now() - game.startTime) / 1000).toFixed(1)
                    const score = Math.floor(1000 / game.attempts * EMOJIS.length)
                    games.delete(chat)
                    return reply(
                        `｡ﾟ•┈୨💖୧┈•ﾟ｡
🎉 *𝙒𝙄𝙉!*

⏱️ ${time}s | 🎯 ${game.attempts} 𝙖𝙩𝙩𝙚𝙢𝙥𝙩𝙨
⭐ 𝙎𝙘𝙤𝙧𝙚: ${score}

${renderBoard(game.board)}

🧁 .memory start 𝙩𝙤 𝙥𝙡𝙖𝙮 𝙖𝙜𝙖𝙞𝙣!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
                    )
                }

                return reply(
                    `｡ﾟ•┈୨💖୧┈•ﾟ｡
✅ *𝙈𝙖𝙩𝙘𝙝!* ${c1.emoji}
🔥 𝙎𝙩𝙧𝙚𝙖𝙠: ${game.streak}

${renderBoard(game.board)}

🎯 ${EMOJIS.length - game.matches} 𝙥𝙖𝙞𝙧𝙨 𝙡𝙚𝙛𝙩
💝 .memory flip <c1> <c2>
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
                )
            } else {
                // No match
                game.streak = 0
                await react('❌')
                return reply(
                    `｡ﾟ•┈୨💖୧┈•ﾟ｡
❌ ${c1.emoji} ≠ ${c2.emoji}
🎯 ${game.attempts} 𝙖𝙩𝙩𝙚𝙢𝙥𝙩𝙨

💝 .memory flip <c1> <c2>
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
                )
            }
        }

        return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🃏 .memory start | flip <c1> <c2>\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
}

function renderBoard(board) {
    let display = ''
    for (let i = 0; i < 16; i += 4) {
        display += board.slice(i, i + 4).map(c => 
            c.matched ? '✅' : c.flipped ? c.emoji : `[${c.id + 1}]`
        ).join(' ') + '\n'
    }
    return '```\n' + display + '```'
}