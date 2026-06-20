import fetch from 'node-fetch'

const games = new Map()

export default {
    name: 'gfbf',
    command: ['gf', 'bf', 'findgf', 'findbf', 'girlfriend', 'boyfriend'],
    desc: '💑 𝙁𝙞𝙣𝙙 𝙮𝙤𝙪𝙧 𝙂𝙁/𝘽𝙁 𝙛𝙧𝙤𝙢 𝙩𝙝𝙚 𝙜𝙧𝙤𝙪𝙥!',
    category: 'fun',
    cooldown: 5,

    async run({ sock, msg, from, args, reply, react, sender, isGroup }) {
        if (!isGroup) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n👥 𝙂𝙧𝙤𝙪𝙥 𝙤𝙣𝙡𝙮!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

        const type = args[0]?.toLowerCase() || 'gf'
        const isGF = ['gf', 'girlfriend', 'findgf'].includes(type)
        const isBF = ['bf', 'boyfriend', 'findbf'].includes(type)

        if (!isGF && !isBF) {
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
💑 *𝙁𝙞𝙣𝙙 𝙔𝙤𝙪𝙧 𝙈𝙖𝙩𝙘𝙝*

💝 .gf — 𝙁𝙞𝙣𝙙 𝙖 𝙂𝙞𝙧𝙡𝙛𝙧𝙞𝙚𝙣𝙙
💙 .bf — 𝙁𝙞𝙣𝙙 𝙖 𝘽𝙤𝙮𝙛𝙧𝙞𝙚𝙣𝙙

🧁 𝙁𝙖𝙩𝙚 𝙬𝙞𝙡𝙡 𝙙𝙚𝙘𝙞𝙙𝙚!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            )
        }

        await react(isGF ? '💖' : '💙')

        try {
            const metadata = await sock.groupMetadata(from)
            const participants = metadata.participants || []
            
            // Filter bot out
            const botJid = sock.user?.id
            const members = participants.filter(p => p.id !== botJid && p.id !== sender)

            if (members.length === 0) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n😢 𝙉𝙤 𝙢𝙚𝙢𝙗𝙚𝙧𝙨 𝙩𝙤 𝙢𝙖𝙩𝙘𝙝!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

            // Pick random match
            const match = members[Math.floor(Math.random() * members.length)]
            
            // Get profile picture
            let pfp = null
            try {
                const ppUrl = await sock.profilePictureUrl(match.id, 'image')
                const res = await fetch(ppUrl)
                pfp = Buffer.from(await res.arrayBuffer())
            } catch {}

            // Compatibility score
            const compatibility = Math.floor(Math.random() * 51) + 50 // 50-100%

            const hearts = '💖'.repeat(Math.floor(compatibility / 10)) + '🖤'.repeat(10 - Math.floor(compatibility / 10))
            const loveEmoji = compatibility > 80 ? '💘' : compatibility > 60 ? '💕' : '💗'
            
            const title = isGF ? '𝙂𝙞𝙧𝙡𝙛𝙧𝙞𝙚𝙣𝙙' : '𝘽𝙤𝙮𝙛𝙧𝙞𝙚𝙣𝙙'
            const userTag = `@${sender.split('@')[0]}`
            const matchTag = `@${match.id.split('@')[0]}`
            const matchName = match.notify || match.name || match.id.split('@')[0]

            const messages = isGF ? [
                '𝙎𝙝𝙚 𝙞𝙨 𝙩𝙝𝙚 𝙤𝙣𝙚! 💖',
                '𝙔𝙤𝙪𝙧 𝙥𝙚𝙧𝙛𝙚𝙘𝙩 𝙢𝙖𝙩𝙘𝙝! 🌸',
                '𝙁𝙖𝙩𝙚 𝙝𝙖𝙨 𝙨𝙥𝙤𝙠𝙚𝙣! ✨',
                '𝘼 𝙢𝙖𝙩𝙘𝙝 𝙢𝙖𝙙𝙚 𝙞𝙣 𝙝𝙚𝙖𝙫𝙚𝙣! 💝'
            ] : [
                '𝙃𝙚 𝙞𝙨 𝙩𝙝𝙚 𝙤𝙣𝙚! 💙',
                '𝙔𝙤𝙪𝙧 𝙥𝙚𝙧𝙛𝙚𝙘𝙩 𝙢𝙖𝙩𝙘𝙝! ✨',
                '𝙁𝙖𝙩𝙚 𝙝𝙖𝙨 𝙨𝙥𝙤𝙠𝙚𝙣! 💫',
                '𝘼 𝙢𝙖𝙩𝙘𝙝 𝙢𝙖𝙙𝙚 𝙞𝙣 𝙝𝙚𝙖𝙫𝙚𝙣! 💝'
            ]
            const randomMsg = messages[Math.floor(Math.random() * messages.length)]

            const caption = `｡ﾟ•┈୨💖୧┈•ﾟ｡
${loveEmoji} *${userTag} 𝙁𝙤𝙪𝙣𝙙 ${title}!*

👤 *${matchName}* ${matchTag}
💕 *𝘾𝙤𝙢𝙥𝙖𝙩𝙞𝙗𝙞𝙡𝙞𝙩𝙮:* ${compatibility}%
${hearts}

💌 ${randomMsg}

🧁 .gf | .bf 𝙩𝙤 𝙩𝙧𝙮 𝙖𝙜𝙖𝙞𝙣!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`

            await sock.sendMessage(from, {
                image: pfp || undefined,
                caption,
                mentions: [sender, match.id]
            }, { quoted: msg })

        } catch (err) {
            console.log('[GFBF ERROR]', err.message)
            reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ ${err.message}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
        }
    }
}