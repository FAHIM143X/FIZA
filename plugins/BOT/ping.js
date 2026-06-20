import '../../settings.js'

export default {
    name: 'ping',
    command: ['ping', 'test', 'speed'],
    desc: '⚡ 𝘽𝙤𝙩 𝙧𝙚𝙨𝙥𝙤𝙣𝙨𝙚 𝙨𝙥𝙚𝙚𝙙 𝙩𝙚𝙨𝙩',
    category: 'info',
    cooldown: 2,

    async run({ msg, sock, reply, react }) {
        const start = Date.now()
        const botName = global.botname || 'FIZA'
        
        await react('⚡')
        
        const latency = Date.now() - start
        
        let speedEmoji, speedText
        if (latency < 100) { speedEmoji = '⚡'; speedText = '𝙂𝙤𝙙 𝙎𝙥𝙚𝙚𝙙!' }
        else if (latency < 300) { speedEmoji = '🚀'; speedText = '𝙎𝙪𝙥𝙚𝙧 𝙁𝙖𝙨𝙩!' }
        else if (latency < 600) { speedEmoji = '👌'; speedText = '𝙂𝙤𝙤𝙙!' }
        else { speedEmoji = '🐢'; speedText = '𝙎𝙡𝙤𝙬 𝙣𝙚𝙩𝙬𝙤𝙧𝙠' }

        await reply(
            `｡ﾟ•┈୨💖୧┈•ﾟ｡
⚡ *𝙎𝙋𝙀𝙀𝘿 𝙏𝙀𝙎𝙏*

🤖 *${botName}*
⏱️ *𝙇𝙖𝙩𝙚𝙣𝙘𝙮:* ${latency}ms
📡 *𝙎𝙩𝙖𝙩𝙪𝙨:* ${latency < 500 ? '🟢 𝙁𝙖𝙨𝙩' : latency < 1000 ? '🟡 𝙉𝙤𝙧𝙢𝙖𝙡' : '🔴 𝙎𝙡𝙤𝙬'}
🧁 ${speedEmoji} ${speedText}
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
        )
        
        await react('✅')
    }
}