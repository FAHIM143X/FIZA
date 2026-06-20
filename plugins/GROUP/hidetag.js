import owner from '../../owner.js'

export default {
    name: 'hidetag',
    command: ['hidetag', 'ht'],
    desc: '👻 𝙄𝙣𝙫𝙞𝙨𝙞𝙗𝙡𝙚 𝙩𝙖𝙜 𝙖𝙡𝙡',
    category: 'group',
    isGroup: true,
    cooldown: 5,

    async run({ msg, sock, args }) {
        const chatId = msg.key?.remoteJid

        try {
            const metadata = await sock.groupMetadata(chatId)
            const participants = metadata.participants || []
            const sender = msg.key?.participant || msg.key?.remoteJid

            // Admin / Owner check
            const cleanSender = String(sender).split('@')[0].split(':')[0].replace(/[^0-9]/g, '')
            const admins = participants.filter(p => p.admin)
            const isAdmin = admins.some(p => {
                const cleanAdmin = String(p.id).split('@')[0].split(':')[0].replace(/[^0-9]/g, '')
                return cleanAdmin === cleanSender
            })
            const isOwner = owner.isOwner(sender)

            if (!isAdmin && !isOwner) {
                return sock.sendMessage(chatId, {
                    text: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n🛡️ 𝙊𝙣𝙡𝙮 𝙖𝙙𝙢𝙞𝙣𝙨 𝙤𝙧 𝙤𝙬𝙣𝙚𝙧 𝙘𝙖𝙣 𝙪𝙨𝙚 𝙩𝙝𝙞𝙨!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
                }, { quoted: msg })
            }

            // Hidden mentions
            const mentions = participants.map(p => p.id)
            const text = args.length > 0
                ? `👻 ${args.join(' ')}`
                : `｡ﾟ•┈୨💖୧┈•ﾟ｡\n🍭 𝙃𝙚𝙮 𝙚𝙫𝙚𝙧𝙮𝙤𝙣𝙚~ 💖\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`

            await sock.sendMessage(chatId, { text, mentions }, { quoted: msg })

        } catch (err) {
            console.log('[HIDETAG ERROR]', err)
            await sock.sendMessage(chatId, {
                text: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n💔 𝙁𝙖𝙞𝙡𝙚𝙙!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            }, { quoted: msg })
        }
    }
}