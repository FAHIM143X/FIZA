import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB = path.join(__dirname, '..', '..', 'database', 'crushes.json')

function load() { try { return JSON.parse(fs.readFileSync(DB, 'utf8')) } catch { return {} } }
function save(d) { fs.writeFileSync(DB, JSON.stringify(d, null, 2)) }

export default {
    name: 'crush',
    command: ['crush', 'secret', 'confess', 'admire'],
    desc: '💘 𝙎𝙚𝙘𝙧𝙚𝙩 𝘾𝙧𝙪𝙨𝙝 — 𝙎𝙚𝙘𝙧𝙚𝙩 𝘼𝙙𝙢𝙞𝙧𝙚𝙧',
    category: 'fun',
    cooldown: 5,

    async run({ sock, msg, from, args, reply, react, sender, isGroup }) {
        const db = load()
        const input = args[0]?.toLowerCase()

        // ── CONFESS ─────────────────────────────────────
        if (input === 'confess' || input === 'send') {
            if (!isGroup) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n👥 𝙂𝙧𝙤𝙪𝙥 𝙤𝙣𝙡𝙮!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

            const crush = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
            if (!crush) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n💘 𝙏𝙖𝙜 𝙮𝙤𝙪𝙧 𝙘𝙧𝙪𝙨𝙝!\n💝 .crush confess @user\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
            if (crush === sender) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙏𝙝𝙖𝙩'𝙨 𝙮𝙤𝙪!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

            const message = args.slice(1).join(' ') || '𝙄 𝙝𝙖𝙫𝙚 𝙖 𝙘𝙧𝙪𝙨𝙝 𝙤𝙣 𝙮𝙤𝙪... 💘'

            // Store crush
            if (!db[crush]) db[crush] = []
            db[crush].push({
                from: sender,
                message,
                time: Date.now()
            })
            save(db)

            await react('💘')
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
💘 *𝙎𝙀𝘾𝙍𝙀𝙏 𝘼𝘿𝙈𝙄𝙍𝙀𝙍*

💌 @${crush.split('@')[0]}, 𝙨𝙤𝙢𝙚𝙤𝙣𝙚 𝙝𝙖𝙨 𝙖 𝙘𝙧𝙪𝙨𝙝 𝙤𝙣 𝙮𝙤𝙪!

💬 "${message}"

🤫 𝙄𝙩'𝙨 𝙖 𝙨𝙚𝙘𝙧𝙚𝙩!
💝 .crush check 𝙩𝙤 𝙨𝙚𝙚 𝙬𝙝𝙤!

🧁 𝙇𝙤𝙫𝙚 𝙞𝙨 𝙞𝙣 𝙩𝙝𝙚 𝙖𝙞𝙧~
｡ﾟ•┈୨🌸୧┈•ﾟ｡`,
                { mentions: [crush] }
            )
        }

        // ── CHECK WHO HAS CRUSH ON YOU ─────────────────
        if (input === 'check' || input === 'who') {
            const crushers = db[sender]
            if (!crushers || crushers.length === 0) {
                return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n😢 𝙉𝙤 𝙘𝙧𝙪𝙨𝙝𝙚𝙨 𝙮𝙚𝙩...\n💝 .crush confess @user\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
            }

            const crushCount = crushers.length
            const latest = crushers[crushers.length - 1]
            const timeAgo = Math.floor((Date.now() - latest.time) / (1000 * 60))

            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
💘 *𝙔𝙊𝙐𝙍 𝘾𝙍𝙐𝙎𝙃𝙀𝙎*

📊 𝙏𝙤𝙩𝙖𝙡: ${crushCount} 𝙨𝙚𝙘𝙧𝙚𝙩 𝙖𝙙𝙢𝙞𝙧𝙚𝙧𝙨

💌 𝙇𝙖𝙩𝙚𝙨𝙩: "${latest.message}"
⏰ ${timeAgo} 𝙢𝙞𝙣𝙪𝙩𝙚𝙨 𝙖𝙜𝙤

🤫 𝙄𝙙𝙚𝙣𝙩𝙞𝙩𝙮 𝙞𝙨 𝙨𝙚𝙘𝙧𝙚𝙩!
🧁 𝙎𝙤𝙢𝙚𝙤𝙣𝙚 𝙡𝙞𝙠𝙚𝙨 𝙮𝙤𝙪~
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            )
        }

        // ── REVEAL ALL CRUSHES ─────────────────────────
        if (input === 'reveal' || input === 'all') {
            const crushers = db[sender]
            if (!crushers || crushers.length === 0) {
                return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n😢 𝙉𝙤 𝙘𝙧𝙪𝙨𝙝𝙚𝙨!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
            }

            // ⚠️ This reveals identities!
            const list = crushers.map((c, i) => 
                `${i + 1}. @${c.from.split('@')[0]} — "${c.message.slice(0, 30)}..."`
            ).join('\n')

            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
💘 *𝙍𝙀𝙑𝙀𝘼𝙇𝙀𝘿 𝘾𝙍𝙐𝙎𝙃𝙀𝙎*

${list}

🧁 𝙏𝙝𝙚 𝙨𝙚𝙘𝙧𝙚𝙩 𝙞𝙨 𝙤𝙪𝙩!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`,
                { mentions: crushers.map(c => c.from) }
            )
        }

        return reply(
            `｡ﾟ•┈୨💖୧┈•ﾟ｡
💘 *𝙎𝙀𝘾𝙍𝙀𝙏 𝘾𝙍𝙐𝙎𝙃*

💝 .crush confess @user <msg>
🔍 .crush check
👁️ .crush reveal

🧁 𝙇𝙤𝙫𝙚 𝙞𝙨 𝙗𝙧𝙖𝙫𝙚!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
        )
    }
}