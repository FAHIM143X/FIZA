import owner from '../../owner.js'

export default {
    name: 'tagall',
    command: ['tagall', 'all', 'everyone'],
    desc: '🍭 𝙎𝙪𝙢𝙢𝙤𝙣 𝙚𝙫𝙚𝙧𝙮𝙤𝙣𝙚',
    category: 'group',
    isGroup: true,
    cooldown: 8,

    async run({ msg, sock, args }) {
        const chatId = msg.key?.remoteJid

        try {
            const metadata = await sock.groupMetadata(chatId)
            const participants = metadata.participants || []
            const sender = msg.key?.participant || msg.key?.remoteJid
            const senderId = sender.split('@')[0]

            const admins = participants.filter(p => p.admin)
            const cleanSender = String(sender).split('@')[0].split(':')[0].replace(/[^0-9]/g, '')
            const isAdmin = admins.some(p => {
                const cleanAdmin = String(p.id).split('@')[0].split(':')[0].replace(/[^0-9]/g, '')
                return cleanAdmin === cleanSender
            })
            const isOwner = owner.isOwner(sender)

            if (!isAdmin && !isOwner) {
                return sock.sendMessage(chatId, {
                    text: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n🛡️ 𝙊𝙣𝙡𝙮 𝙖𝙙𝙢𝙞𝙣𝙨 𝙤𝙧 𝙤𝙬𝙣𝙚𝙧!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
                }, { quoted: msg })
            }

            const groupName = metadata.subject
            const memberCount = participants.length
            const adminCount = admins.length
            const botName = global.botname || 'FIZA'
            const ownerName = global.ownerName || global.ownername || 'Owner'

            const now = new Date()
            const time = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })
            const date = now.toLocaleDateString('en-IN')

            const softMsg = args.length > 0
                ? `💌 *𝙈𝙚𝙨𝙨𝙖𝙜𝙚:* ${args.join(' ')}`
                : '🍭 𝙀𝙑𝙀𝙍𝙔𝙊𝙉𝙀 𝘼𝙏𝙏𝙀𝙉𝙏𝙄𝙊𝙉 💕'

            const emojis = ['🍡', '🍭', '🧁', '🍬', '🍥', '🍩', '🍨', '🍫', '🍪', '🍧']

            let header = `｡ﾟ•┈୨💖୧┈•ﾟ｡
╭ 🍭 *𝙁𝙄𝙕𝘼 𝙎𝙐𝙈𝙈𝙊𝙉* ✨ ╮
│ 🌸 *𝙂𝙧𝙤𝙪𝙥:* ${groupName}
│ 👥 *𝙈𝙚𝙢𝙗𝙚𝙧𝙨:* ${memberCount}
│ 🔑 *𝘼𝙙𝙢𝙞𝙣𝙨:* ${adminCount}
│ 🕰️ *𝙏𝙞𝙢𝙚:* ${time}
│ 📆 *𝘿𝙖𝙩𝙚:* ${date}
│ 🤖 *𝘽𝙤𝙩:* ${botName}
│ 👑 *𝙊𝙬𝙣𝙚𝙧:* ${ownerName}
│ 💎 *𝙏𝙖𝙜𝙜𝙚𝙧:* @${senderId}
╰━━━━━━━━━━━━━━━━━━╯\n\n${softMsg}\n\n`

            let text = header
            let mentions = []

            participants.forEach((user, i) => {
                const jid = user.id
                mentions.push(jid)
                const emoji = emojis[i % emojis.length]
                text += `${emoji} @${jid.split('@')[0]}\n`
            })

            text += `\n🧁 𝙎𝙪𝙢𝙢𝙤𝙣𝙚𝙙 𝙬𝙞𝙩𝙝 𝙡𝙤𝙫𝙚~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`

            // Group pic for thumbnail
            let thumb
            try {
                const pp = await sock.profilePictureUrl(chatId, 'image')
                const res = await fetch(pp)
                thumb = Buffer.from(await res.arrayBuffer())
            } catch {}

            await sock.sendMessage(chatId, {
                text,
                mentions,
                contextInfo: thumb ? {
                    externalAdReply: {
                        title: '🍭 FIZA SUMMONING',
                        body: `TAGGING ${memberCount} members ✨`,
                        thumbnail: thumb,
                        mediaType: 1,
                        renderLargerThumbnail: true,
                        showAdAttribution: false
                    }
                } : {}
            }, { quoted: msg })

        } catch (err) {
            console.log('[TAGALL ERROR]', err)
            await sock.sendMessage(chatId, {
                text: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n💔 𝙁𝙖𝙞𝙡𝙚𝙙!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            }, { quoted: msg })
        }
    }
}