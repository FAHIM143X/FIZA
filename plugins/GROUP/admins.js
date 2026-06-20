export default {
    name: 'admins',
    command: ['admins', 'adminlist', 'staff'],
    desc: '🛡️ 𝙎𝙝𝙤𝙬 𝙜𝙧𝙤𝙪𝙥 𝙖𝙙𝙢𝙞𝙣𝙨',
    category: 'group',
    isGroup: true,
    cooldown: 5,

    async run({ msg, sock }) {
        const chatId = msg.key?.remoteJid

        try {
            const metadata = await sock.groupMetadata(chatId)
            const participants = metadata.participants || []
            
            // Get admins
            const admins = participants.filter(p => p.admin)
            const owner = participants.find(p => p.id === metadata.owner)
            
            // Get group picture
            let groupPfp = null
            try {
                const pp = await sock.profilePictureUrl(chatId, 'image')
                const res = await fetch(pp)
                groupPfp = Buffer.from(await res.arrayBuffer())
            } catch {}

            // Build admin list
            let text = `｡ﾟ•┈୨💖୧┈•ﾟ｡
🛡️ *𝙂𝙍𝙊𝙐𝙋 𝘼𝘿𝙈𝙄𝙉𝙎*

🌸 *𝙂𝙧𝙤𝙪𝙥:* ${metadata.subject}
👥 *𝙈𝙚𝙢𝙗𝙚𝙧𝙨:* ${participants.length}
👑 *𝘼𝙙𝙢𝙞𝙣𝙨:* ${admins.length}

${'─'.repeat(25)}
`

            if (owner) {
                text += `\n👑 *𝙊𝙬𝙣𝙚𝙧:*\n  @${owner.id.split('@')[0]}\n`
            }

            const regularAdmins = admins.filter(a => a.id !== metadata.owner)
            if (regularAdmins.length > 0) {
                text += `\n🛡️ *𝘼𝙙𝙢𝙞𝙣𝙨:*\n`
                regularAdmins.forEach((admin, i) => {
                    text += `  ${i + 1}. @${admin.id.split('@')[0]} ${admin.admin === 'superadmin' ? '⭐' : ''}\n`
                })
            }

            text += `\n${'─'.repeat(25)}`
            text += `\n🧁 𝙂𝙧𝙤𝙪𝙥 𝙨𝙩𝙖𝙛𝙛 𝙡𝙞𝙨𝙩~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`

            // Mentions for all admins
            const mentions = admins.map(a => a.id)

            await sock.sendMessage(chatId, {
                text,
                mentions,
                contextInfo: groupPfp ? {
                    externalAdReply: {
                        title: `🛡️ ${metadata.subject}`,
                        body: `👑 ${admins.length} admins | 👥 ${participants.length} members`,
                        thumbnail: groupPfp,
                        mediaType: 1,
                        renderLargerThumbnail: false,
                        showAdAttribution: false,
                    }
                } : {}
            }, { quoted: msg })

        } catch (err) {
            console.log('[ADMINS ERROR]', err)
            await sock.sendMessage(chatId, {
                text: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙁𝙖𝙞𝙡𝙚𝙙 𝙩𝙤 𝙜𝙚𝙩 𝙖𝙙𝙢𝙞𝙣𝙨!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            }, { quoted: msg })
        }
    }
}