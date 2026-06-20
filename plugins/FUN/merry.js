import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB = path.join(__dirname, '..', '..', 'database', 'marriages.json')

function load() { try { return JSON.parse(fs.readFileSync(DB, 'utf8')) } catch { return {} } }
function save(d) { fs.writeFileSync(DB, JSON.stringify(d, null, 2)) }

export default {
    name: 'marry',
    command: ['marry', 'husband', 'wife', 'divorce', 'marriage'],
    desc: '💍 𝙈𝙖𝙧𝙧𝙮, 𝘿𝙞𝙫𝙤𝙧𝙘𝙚 & 𝙍𝙚𝙡𝙖𝙩𝙞𝙤𝙣𝙨𝙝𝙞𝙥 𝙎𝙩𝙖𝙩𝙪𝙨',
    category: 'fun',
    cooldown: 5,

    async run({ sock, msg, from, args, reply, react, sender, isGroup }) {
        const db = load()
        const input = args[0]?.toLowerCase()

        // ── MARRY ──────────────────────────────────────
        if (input === 'marry' || input === 'propose') {
            if (!isGroup) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n👥 𝙂𝙧𝙤𝙪𝙥 𝙤𝙣𝙡𝙮!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

            const partner = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
            if (!partner) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n💍 𝙏𝙖𝙜 𝙨𝙤𝙢𝙚𝙤𝙣𝙚 𝙩𝙤 𝙢𝙖𝙧𝙧𝙮!\n💝 .marry @user\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
            if (partner === sender) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙔𝙤𝙪 𝙘𝙖𝙣'𝙩 𝙢𝙖𝙧𝙧𝙮 𝙮𝙤𝙪𝙧𝙨𝙚𝙡𝙛!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

            // Check if already married
            if (db[sender]) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n💍 𝙔𝙤𝙪'𝙧𝙚 𝙖𝙡𝙧𝙚𝙖𝙙𝙮 𝙢𝙖𝙧𝙧𝙞𝙚𝙙 𝙩𝙤 @${db[sender].partner.split('@')[0]}!\n💔 .divorce 𝙩𝙤 𝙚𝙣𝙙 𝙞𝙩\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`, { mentions: [db[sender].partner] })
            if (db[partner]) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n💍 @${partner.split('@')[0]} 𝙞𝙨 𝙖𝙡𝙧𝙚𝙖𝙙𝙮 𝙢𝙖𝙧𝙧𝙞𝙚𝙙!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`, { mentions: [partner] })

            // Marry them
            const now = Date.now()
            db[sender] = { partner, marriedAt: now, love: 100 }
            db[partner] = { partner: sender, marriedAt: now, love: 100 }
            save(db)

            await react('💍')
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
💍 *𝙈𝘼𝙍𝙍𝙄𝙀𝘿!*

👰 @${sender.split('@')[0]} 🤵 @${partner.split('@')[0]}

💕 𝙔𝙤𝙪 𝙖𝙧𝙚 𝙣𝙤𝙬 𝙃𝙪𝙨𝙗𝙖𝙣𝙙 & 𝙒𝙞𝙛𝙚!

🧁 𝙈𝙖𝙮 𝙮𝙤𝙪𝙧 𝙡𝙤𝙫𝙚 𝙡𝙖𝙨𝙩 𝙛𝙤𝙧𝙚𝙫𝙚𝙧~
｡ﾟ•┈୨🌸୧┈•ﾟ｡`,
                { mentions: [sender, partner] }
            )
        }

        // ── DIVORCE ────────────────────────────────────
        if (input === 'divorce' || input === 'breakup') {
            if (!db[sender]) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n💔 𝙔𝙤𝙪'𝙧𝙚 𝙣𝙤𝙩 𝙢𝙖𝙧𝙧𝙞𝙚𝙙!\n💍 .marry @user\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

            const partner = db[sender].partner
            const marriageDate = new Date(db[sender].marriedAt).toLocaleDateString()
            
            delete db[sender]
            delete db[partner]
            save(db)

            await react('💔')
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
💔 *𝘿𝙄𝙑𝙊𝙍𝘾𝙀𝘿*

😢 @${sender.split('@')[0]} & @${partner.split('@')[0]}
📅 𝙈𝙖𝙧𝙧𝙞𝙚𝙙: ${marriageDate}

🧁 𝙎𝙤𝙢𝙚𝙩𝙞𝙢𝙚𝙨 𝙡𝙤𝙫𝙚 𝙚𝙣𝙙𝙨...
｡ﾟ•┈୨🌸୧┈•ﾟ｡`,
                { mentions: [sender, partner] }
            )
        }

        // ── STATUS ─────────────────────────────────────
        if (input === 'status' || !input) {
            if (!db[sender]) {
                return reply(
                    `｡ﾟ•┈୨💖୧┈•ﾟ｡
💔 *𝙎𝙞𝙣𝙜𝙡𝙚*

😢 𝙔𝙤𝙪 𝙖𝙧𝙚 𝙣𝙤𝙩 𝙢𝙖𝙧𝙧𝙞𝙚𝙙

💍 .marry @user 𝙩𝙤 𝙛𝙞𝙣𝙙 𝙡𝙤𝙫𝙚!
🧁 𝙇𝙤𝙫𝙚 𝙞𝙨 𝙞𝙣 𝙩𝙝𝙚 𝙖𝙞𝙧~
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
                )
            }

            const partner = db[sender].partner
            const marriedAt = new Date(db[sender].marriedAt)
            const days = Math.floor((Date.now() - marriedAt) / (1000 * 60 * 60 * 24))
            const love = db[sender].love

            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
💍 *𝙈𝘼𝙍𝙍𝙄𝘼𝙂𝙀 𝙎𝙏𝘼𝙏𝙐𝙎*

💑 @${sender.split('@')[0]} 💍 @${partner.split('@')[0]}
📅 𝙈𝙖𝙧𝙧𝙞𝙚𝙙: ${marriedAt.toLocaleDateString()}
⏳ ${days} 𝙙𝙖𝙮𝙨 𝙤𝙛 𝙢𝙖𝙧𝙧𝙞𝙖𝙜𝙚
💕 𝙇𝙤𝙫𝙚: ${love}%

💔 .divorce 𝙩𝙤 𝙚𝙣𝙙

🧁 𝙇𝙤𝙫𝙚 𝙞𝙨 𝙗𝙚𝙖𝙪𝙩𝙞𝙛𝙪𝙡~
｡ﾟ•┈୨🌸୧┈•ﾟ｡`,
                { mentions: [sender, partner] }
            )
        }

        // ── LIST ───────────────────────────────────────
        if (input === 'list' || input === 'couples') {
            const couples = Object.entries(db)
                .filter(([jid]) => !Object.entries(db).some(([j, d]) => d.partner === jid && jid > jid)) // Deduplicate
                
            if (couples.length === 0) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n😢 𝙉𝙤 𝙘𝙤𝙪𝙥𝙡𝙚𝙨 𝙮𝙚𝙩!\n💍 .marry @user\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

            const list = couples.map(([jid, data]) => {
                const days = Math.floor((Date.now() - data.marriedAt) / (1000 * 60 * 60 * 24))
                return `💑 @${jid.split('@')[0]} 💍 @${data.partner.split('@')[0]} — ${days}𝙙`
            }).join('\n')

            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
💑 *𝙈𝘼𝙍𝙍𝙄𝙀𝘿 𝘾𝙊𝙐𝙋𝙇𝙀𝙎*

${list}

🧁 ${couples.length} 𝙘𝙤𝙪𝙥𝙡𝙚𝙨 𝙞𝙣 𝙡𝙤𝙫𝙚!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`,
                { mentions: couples.flatMap(c => [c[0], c[1].partner]) }
            )
        }

        // ── LOVE (increase love) ───────────────────────
        if (input === 'love' || input === 'romance') {
            if (!db[sender]) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n💔 𝙔𝙤𝙪'𝙧𝙚 𝙣𝙤𝙩 𝙢𝙖𝙧𝙧𝙞𝙚𝙙!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

            const increase = Math.floor(Math.random() * 10) + 1
            db[sender].love = Math.min(100, db[sender].love + increase)
            const partner = db[sender].partner
            if (db[partner]) db[partner].love = db[sender].love
            save(db)

            await react('💕')
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
💕 *𝙇𝙤𝙫𝙚 𝙂𝙧𝙚𝙬!* +${increase}%

💑 @${sender.split('@')[0]} & @${partner.split('@')[0]}
💖 𝙇𝙤𝙫𝙚: ${db[sender].love}%

🧁 𝙆𝙚𝙚𝙥 𝙩𝙝𝙚 𝙡𝙤𝙫𝙚 𝙖𝙡𝙞𝙫𝙚!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`,
                { mentions: [sender, partner] }
            )
        }

        return reply(
            `｡ﾟ•┈୨💖୧┈•ﾟ｡
💍 *𝙈𝘼𝙍𝙍𝙄𝘼𝙂𝙀 𝙎𝙔𝙎𝙏𝙀𝙈*

💝 .marry @user — 𝙋𝙧𝙤𝙥𝙤𝙨𝙚
💔 .divorce — 𝙀𝙣𝙙 𝙢𝙖𝙧𝙧𝙞𝙖𝙜𝙚
📊 .marry status — 𝙎𝙚𝙚 𝙨𝙩𝙖𝙩𝙪𝙨
📋 .marry list — 𝘼𝙡𝙡 𝙘𝙤𝙪𝙥𝙡𝙚𝙨
💕 .marry love — 𝙄𝙣𝙘𝙧𝙚𝙖𝙨𝙚 𝙡𝙤𝙫𝙚

🧁 𝙇𝙤𝙫𝙚 𝙞𝙨 𝙞𝙣 𝙩𝙝𝙚 𝙖𝙞𝙧!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
        )
    }
}