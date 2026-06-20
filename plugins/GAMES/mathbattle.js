const games = new Map()

export default {
    name: 'mathbattle',
    command: ['math', 'maths', 'quiz'],
    desc: '🧮 𝙈𝙖𝙩𝙝 𝘽𝙖𝙩𝙩𝙡𝙚 — 𝙎𝙤𝙡𝙫𝙚 𝙀𝙦𝙪𝙖𝙩𝙞𝙤𝙣𝙨!',
    category: 'games',
    cooldown: 1,

    async run({ sock, msg, from, args, reply, react, sender }) {
        const chat = from
        const input = args[0]?.toLowerCase()

        if (input === 'start') {
            if (games.has(chat)) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n⚠️ 𝙂𝙖𝙢𝙚 𝙞𝙣 𝙥𝙧𝙤𝙜𝙧𝙚𝙨𝙨!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

            const num1 = Math.floor(Math.random() * 50) + 10
            const num2 = Math.floor(Math.random() * 20) + 1
            const ops = ['+','-','×']
            const op = ops[Math.floor(Math.random() * ops.length)]
            let answer
            
            if (op === '+') answer = num1 + num2
            else if (op === '-') answer = num1 - num2
            else answer = num1 * num2

            games.set(chat, {
                question: `${num1} ${op} ${num2}`,
                answer,
                startTime: Date.now(),
                attempts: 0,
                streak: games.get(chat)?.streak || 0
            })

            await react('🧮')
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
🧮 *𝙈𝘼𝙏𝙃 𝘽𝘼𝙏𝙏𝙇𝙀*

❓ ${num1} ${op} ${num2} = ?

💝 .math <answer>
⚡ 𝙎𝙥𝙚𝙚𝙙 𝙢𝙖𝙩𝙩𝙚𝙧𝙨!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            )
        }

        const game = games.get(chat)
        if (!game) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n⚠️ 𝙉𝙤 𝙦𝙪𝙚𝙨𝙩𝙞𝙤𝙣!\n💝 .math start\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

        const userAnswer = parseInt(input)
        if (isNaN(userAnswer)) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙀𝙣𝙩𝙚𝙧 𝙖 𝙣𝙪𝙢𝙗𝙚𝙧!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

        game.attempts++

        if (userAnswer === game.answer) {
            const time = ((Date.now() - game.startTime) / 1000).toFixed(1)
            const points = Math.max(1, Math.floor(50 - time * 5)) + (game.streak * 5)
            game.streak++
            
            const rating = time < 2 ? '🤯 𝙂𝙀𝙉𝙄𝙐𝙎!' : time < 5 ? '🚀 𝙁𝙖𝙨𝙩!' : '👌 𝙂𝙤𝙤𝙙!'
            
            const oldGame = games.get(chat)
            games.delete(chat)
            
            await react('✅')
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
✅ *${game.question} = ${game.answer}*
⚡ ${time}s — +${points} 𝙥𝙤𝙞𝙣𝙩𝙨
🔥 ${game.streak} 𝙨𝙩𝙧𝙚𝙖𝙠!
${rating}

💝 .math start 𝙛𝙤𝙧 𝙣𝙚𝙭𝙩!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            )
        }

        return reply(
            `｡ﾟ•┈୨💖୧┈•ﾟ｡
❌ 𝙒𝙧𝙤𝙣𝙜! 𝙏𝙧𝙮 𝙖𝙜𝙖𝙞𝙣...
🎯 𝘼𝙩𝙩𝙚𝙢𝙥𝙩: ${game.attempts}

💝 .math <answer>
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
        )
    }
}