import security from '../../security.js'

export default {
    name: 'antilink',
    command: ['antilink'],
    desc: '🔗 𝙀𝙣𝙖𝙗𝙡𝙚/𝙙𝙞𝙨𝙖𝙗𝙡𝙚 𝙖𝙣𝙩𝙞-𝙡𝙞𝙣𝙠',
    category: 'group',
    isGroup: true,
    isAdmin: true,

    async run({ sock, msg, from, args, reply }) {
        const sub = args[0]?.toLowerCase()

        if (sub === 'on') {
            security.setAntilink(from, true)
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
🔗 *𝘼𝙉𝙏𝙄-𝙇𝙄𝙉𝙆 𝙊𝙉*

🚫 𝙇𝙞𝙣𝙠𝙨 𝙬𝙞𝙡𝙡 𝙗𝙚 𝙙𝙚𝙡𝙚𝙩𝙚𝙙
⚠️ 3 𝙬𝙖𝙧𝙣𝙨 = 𝙆𝙞𝙘𝙠

🧁 𝙂𝙧𝙤𝙪𝙥 𝙨𝙖𝙛𝙚 𝙣𝙤𝙬~
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            )
        }

        if (sub === 'off') {
            security.setAntilink(from, false)
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡\n🔗 *𝘼𝙉𝙏𝙄-𝙇𝙄𝙉𝙆 𝙊𝙁𝙁*\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            )
        }

        const status = security.isAntilink(from) ? '✅ 𝙀𝙣𝙖𝙗𝙡𝙚𝙙' : '❌ 𝘿𝙞𝙨𝙖𝙗𝙡𝙚𝙙'
        return reply(
            `｡ﾟ•┈୨💖୧┈•ﾟ｡
🔗 *𝘼𝙉𝙏𝙄-𝙇𝙄𝙉𝙆*

📌 𝙎𝙩𝙖𝙩𝙪𝙨: ${status}

💝 .antilink on | .antilink off
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
        )
    }
}