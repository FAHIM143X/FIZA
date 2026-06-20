const sentences = [
    'The quick brown fox jumps over the lazy dog',
    'Pack my box with five dozen liquor jugs',
    'How vexingly quick daft zebras jump',
    'The five boxing wizards jump quickly',
    'Sphinx of black quartz judge my vow',
    'Waltz bad nymph for quick jigs vex',
    'Glib jocks quiz nymph to vex dwarf',
    'Foxy diva Jennifer Lopez wasn\'t baking my quiche'
]

const games = new Map()

export default {
    name: 'typeracer',
    command: ['typeracer', 'type', 'race'],
    desc: '⌨️ 𝙏𝙮𝙥𝙚 𝙍𝙖𝙘𝙚𝙧 — 𝙎𝙥𝙚𝙚𝙙 𝙏𝙮𝙥𝙞𝙣𝙜!',
    category: 'games',
    cooldown: 2,

    async run({ sock, msg, from, args, reply, react, sender }) {
        const chat = from
        const input = args.join(' ')

        // Start
        if (!input || input === 'start') {
            if (games.has(chat)) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n⚠️ 𝙍𝙖𝙘𝙚 𝙞𝙣 𝙥𝙧𝙤𝙜𝙧𝙚𝙨𝙨!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

            const text = sentences[Math.floor(Math.random() * sentences.length)]
            games.set(chat, {
                text,
                startTime: Date.now(),
                player: sender,
                attempts: 0
            })

            await react('⌨️')
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
⌨️ *𝙏𝙔𝙋𝙀 𝙍𝘼𝘾𝙀𝙍*

📝 𝙏𝙮𝙥𝙚 𝙚𝙭𝙖𝙘𝙩𝙡𝙮:

*"${text}"*

💝 .race <your text>
⚡ 𝙁𝙖𝙨𝙩𝙚𝙧 = 𝙈𝙤𝙧𝙚 𝙥𝙤𝙞𝙣𝙩𝙨!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            )
        }

        // Check answer
        const game = games.get(chat)
        if (!game) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n⚠️ 𝙉𝙤 𝙧𝙖𝙘𝙚!\n💝 .race start\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

        game.attempts++
        const typed = input.trim()
        
        if (typed.toLowerCase() === game.text.toLowerCase()) {
            const time = ((Date.now() - game.startTime) / 1000).toFixed(2)
            const wpm = Math.floor((game.text.split(' ').length / (time / 60)))
            const accuracy = 100 // Perfect match
            
            let rating = ''
            if (wpm > 80) rating = '👑 𝙂𝙊𝘿 𝙎𝙋𝙀𝙀𝘿!'
            else if (wpm > 60) rating = '🚀 𝙎𝙪𝙥𝙚𝙧 𝙁𝙖𝙨𝙩!'
            else if (wpm > 40) rating = '⚡ 𝙂𝙧𝙚𝙖𝙩!'
            else if (wpm > 20) rating = '👌 𝙂𝙤𝙤𝙙!'
            else rating = '🐢 𝙆𝙚𝙚𝙥 𝙥𝙧𝙖𝙘𝙩𝙞𝙘𝙞𝙣𝙜!'

            games.delete(chat)
            await react('🎉')
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
🎉 *𝙍𝘼𝘾𝙀 𝘾𝙊𝙈𝙋𝙇𝙀𝙏𝙀!*

⏱️ ${time}s
⌨️ ${wpm} 𝙒𝙋𝙈
🎯 ${accuracy}% 𝘼𝙘𝙘𝙪𝙧𝙖𝙘𝙮
🏆 ${rating}

🧁 .race start 𝙩𝙤 𝙧𝙖𝙘𝙚 𝙖𝙜𝙖𝙞𝙣!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            )
        }

        // Show errors
        const errors = []
        for (let i = 0; i < Math.max(typed.length, game.text.length); i++) {
            if (typed[i]?.toLowerCase() !== game.text[i]?.toLowerCase()) errors.push(i)
        }

        await react('❌')
        return reply(
            `｡ﾟ•┈୨💖୧┈•ﾟ｡
❌ 𝙉𝙤𝙩 𝙦𝙪𝙞𝙩𝙚! ${errors.length} 𝙚𝙧𝙧𝙤𝙧𝙨

📝 𝙔𝙤𝙪: "${typed.slice(0, 30)}..."
💡 𝙏𝙖𝙧𝙜𝙚𝙩: "${game.text.slice(0, 30)}..."

🎯 𝘼𝙩𝙩𝙚𝙢𝙥𝙩: ${game.attempts}
💝 .race <text>
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
        )
    }
}