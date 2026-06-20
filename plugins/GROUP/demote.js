// ╔══════════════════════════════════════════════════════════════╗
// ║          👎  DEMOTE  —  Remove Group Admin Rights           ║
// ║   Mention · Reply · Multi-demote · Auto-event log          ║
// ║   GC Picture via node-fetch · FIZA THEME                   ║
// ╚══════════════════════════════════════════════════════════════╝

import fetch from 'node-fetch'
import owner from '../../owner.js'

const plugin = {
    name:     'demote',
    command:  ['demote', 'unadmin', 'removeadmin'],
    desc:     '👎 𝘿𝙚𝙢𝙤𝙩𝙚 𝙖𝙙𝙢𝙞𝙣(𝙨) 𝙩𝙤 𝙢𝙚𝙢𝙗𝙚𝙧',
    usage:    '.demote @user  OR  reply + .demote',
    category: 'group',

    async run({ sock, msg, from, sender, args, reply, react, sleep }) {

        if (!from?.endsWith('@g.us'))
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡\n👥 𝙏𝙝𝙞𝙨 𝙘𝙤𝙢𝙢𝙖𝙣𝙙 𝙤𝙣𝙡𝙮 𝙬𝙤𝙧𝙠𝙨 𝙞𝙣 𝙖 𝙜𝙧𝙤𝙪𝙥!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            )

        let meta
        try { meta = await sock.groupMetadata(from) } catch {
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝘾𝙤𝙪𝙡𝙙 𝙣𝙤𝙩 𝙛𝙚𝙩𝙘𝙝 𝙜𝙧𝙤𝙪𝙥 𝙞𝙣𝙛𝙤.\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            )
        }

        const participants = meta.participants || []
        const memberJids   = participants.map(p => p.id)
        const adminJids    = participants.filter(p => p.admin).map(p => p.id)
        const ownerJid     = meta.owner

        const normalize = (j) =>
            String(j).split(':')[0].split('@')[0].replace(/[^0-9]/g, '')

        const senderIsOwner = owner.isOwner(sender)
        const senderIsAdmin = adminJids.some(a => normalize(a) === normalize(sender) ||
            normalize(owner.resolveLid(a)) === normalize(sender))

        if (!senderIsOwner && !senderIsAdmin)
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡\n🛡️ 𝙔𝙤𝙪 𝙣𝙚𝙚𝙙 𝙩𝙤 𝙗𝙚 𝙖 *𝙜𝙧𝙤𝙪𝙥 𝙖𝙙𝙢𝙞𝙣*!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            )

        const botN   = normalize(sock.user?.id || '')
        const botLid = sock.user?.lid ? normalize(sock.user.lid) : null
        const botIsAdmin = adminJids.some(a => {
            const ar = normalize(a)
            return ar === botN || (botLid && ar === botLid)
        })

        if (!botIsAdmin)
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡\n🤖 𝙈𝙖𝙠𝙚 𝙢𝙚 𝙖 𝙜𝙧𝙤𝙪𝙥 *𝙖𝙙𝙢𝙞𝙣* 𝙛𝙞𝙧𝙨𝙩!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            )

        // ── Collect targets ───────────────────────────────────────────
        const targets = new Set()

        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
        for (const j of mentioned) targets.add(j)

        const quotedSender = msg.message?.extendedTextMessage?.contextInfo?.participant
        if (quotedSender) targets.add(quotedSender)

        for (const arg of args) {
            const n = arg.replace(/[^0-9]/g, '')
            if (n.length >= 7) targets.add(n + '@s.whatsapp.net')
        }

        if (targets.size === 0)
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡\n` +
                `🍓 𝙉𝙤 𝙩𝙖𝙧𝙜𝙚𝙩!\n\n` +
                `💝 .demote @user\n` +
                `💫 𝙍𝙚𝙥𝙡𝙮 + .demote\n` +
                `🌸 .demote 917289881303\n` +
                `｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            )

        // ── Validate targets ──────────────────────────────────────────
        const toDemote = []
        const skipped  = []

        for (const target of targets) {
            const tn = normalize(target)

            // Can't demote yourself
            if (tn === normalize(sender)) {
                skipped.push({ jid: target, reason: "𝙏𝙝𝙖𝙩'𝙨 𝙮𝙤𝙪! 😅" }); continue
            }

            // Can't demote the bot
            if (tn === botN || (botLid && tn === botLid)) {
                skipped.push({ jid: target, reason: "𝙏𝙝𝙖𝙩'𝙨 𝙢𝙚! 🤖" }); continue
            }

            // Can't demote group owner (unless bot owner)
            if (normalize(target) === normalize(ownerJid) && !senderIsOwner) {
                skipped.push({ jid: target, reason: '𝙂𝙧𝙤𝙪𝙥 𝙊𝙬𝙣𝙚𝙧 👑' }); continue
            }

            // Must be in the group
            const inGroup = memberJids.some(m => normalize(m) === tn)
            if (!inGroup) {
                skipped.push({ jid: target, reason: '𝙉𝙤𝙩 𝙞𝙣 𝙜𝙧𝙤𝙪𝙥' }); continue
            }

            // Must be an admin to demote
            const isAdmin = adminJids.some(a => normalize(a) === tn)
            if (!isAdmin) {
                skipped.push({ jid: target, reason: '𝙉𝙤𝙩 𝙖𝙣 𝙖𝙙𝙢𝙞𝙣' }); continue
            }

            toDemote.push(target)
        }

        if (toDemote.length === 0) {
            const skipLines = skipped.map(s => `• @${s.jid.split('@')[0]} — ${s.reason}`).join('\n')
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡\n⚠️ 𝙉𝙤 𝙤𝙣𝙚 𝙩𝙤 𝙙𝙚𝙢𝙤𝙩𝙚!\n\n${skipLines}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            )
        }

        // ── Demote ────────────────────────────────────────────────────
        await react('⏳')

        const demoted = []
        const failed  = []

        for (const target of toDemote) {
            try {
                await sock.groupParticipantsUpdate(from, [target], 'demote')
                demoted.push(target)
                if (toDemote.length > 1) await sleep(600)
            } catch {
                failed.push(target)
            }
        }

        // 🔥 Get group picture using node-fetch
        let groupPfp = null
        try {
            const ppUrl = await sock.profilePictureUrl(from, 'image')
            const res = await fetch(ppUrl)
            if (res.ok) {
                const arrayBuffer = await res.arrayBuffer()
                groupPfp = Buffer.from(arrayBuffer)
            }
        } catch {}

        // ── Result message ────────────────────────────────────────────
        const demoterTag  = `@${normalize(sender)}`
        const demotedTags = demoted.map(j => `👎 @${j.split('@')[0]}`).join('\n')
        const date        = new Date().toLocaleString('en-IN', {
            timeZone:     global.timezone || 'Asia/Kolkata',
            dateStyle:    'medium',
            timeStyle:    'short',
        })

        const allMentions = [...demoted, ...failed, ...skipped.map(s => s.jid), sender]

        let text = ''
        if (demoted.length > 0) {
            text = `｡ﾟ•┈୨💖୧┈•ﾟ｡
╭── 👎 *𝘼𝘿𝙈𝙄𝙉 𝘿𝙀𝙈𝙊𝙏𝙀𝘿* 👎 ──╮

${demotedTags}

👤 *𝘿𝙚𝙢𝙤𝙩𝙚𝙙 𝘽𝙮:* ${demoterTag}
📅 *𝘿𝙖𝙩𝙚:* ${date}

╰── 🧁 𝘽𝙖𝙘𝙠 𝙩𝙤 𝙢𝙚𝙢𝙗𝙚𝙧~ ──╯
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
        }

        if (failed.length > 0) {
            text += `\n⚠️ 𝙁𝙖𝙞𝙡𝙚𝙙:\n${failed.map(j => `• @${j.split('@')[0]}`).join('\n')}`
        }

        if (skipped.length > 0) {
            text += `\n🚫 𝙎𝙠𝙞𝙥𝙥𝙚𝙙:\n${skipped.map(s => `• @${s.jid.split('@')[0]} — ${s.reason}`).join('\n')}`
        }

        await react(demoted.length > 0 ? '✅' : '❌')
        await sock.sendMessage(from, {
            text:     text.trim(),
            mentions: [...new Set(allMentions)],
            contextInfo: groupPfp ? {
                externalAdReply: {
                    title: `👎 ${meta.subject}`,
                    body: `🛡️ ${adminJids.length - demoted.length} admins | 👥 ${participants.length} members`,
                    thumbnail: groupPfp,
                    mediaType: 1,
                    renderLargerThumbnail: false,
                    showAdAttribution: false,
                }
            } : {}
        }, { quoted: msg })
    },

    // ── Auto-event hook ───────────────────────────────────────────────
    async onDemote({ sock, group, participants, author, meta }) {
        try {
            const groupName = meta?.subject || 'Group'
            const normalize = (j) => String(j).split(':')[0].split('@')[0].replace(/[^0-9]/g, '')

            const demotedTags = participants.map(j => `👎 @${normalize(j)}`).join('\n')
            const demotedBy   = author ? `@${normalize(author)}` : 'System'
            const mentionList = [...participants]
            if (author) mentionList.push(author)

            const date = new Date().toLocaleString('en-IN', {
                timeZone:  global.timezone || 'Asia/Kolkata',
                dateStyle: 'medium',
                timeStyle: 'short',
            })

            // 🔥 Get group picture using node-fetch
            let groupPfp = null
            try {
                const ppUrl = await sock.profilePictureUrl(group, 'image')
                const res = await fetch(ppUrl)
                if (res.ok) {
                    const arrayBuffer = await res.arrayBuffer()
                    groupPfp = Buffer.from(arrayBuffer)
                }
            } catch {}

            await sock.sendMessage(group, {
                text:
                    `｡ﾟ•┈୨💖୧┈•ﾟ｡\n` +
                    `╭── 👎 *𝘼𝘿𝙈𝙄𝙉 𝘿𝙀𝙈𝙊𝙏𝙀𝘿* 👎 ──╮\n\n` +
                    `${demotedTags}\n\n` +
                    `👤 *𝘿𝙚𝙢𝙤𝙩𝙚𝙙 𝘽𝙮:* ${demotedBy}\n` +
                    `📅 *𝘿𝙖𝙩𝙚:* ${date}\n\n` +
                    `╰── 🧁 𝘽𝙖𝙘𝙠 𝙩𝙤 𝙢𝙚𝙢𝙗𝙚𝙧~ ──╯\n` +
                    `｡ﾟ•┈୨🌸୧┈•ﾟ｡`,
                mentions: [...new Set(mentionList)],
                contextInfo: groupPfp ? {
                    externalAdReply: {
                        title: `👎 ${groupName}`,
                        body: `🛡️ Admin Demoted!`,
                        thumbnail: groupPfp,
                        mediaType: 1,
                        renderLargerThumbnail: false,
                        showAdAttribution: false,
                    }
                } : {}
            })
        } catch {}
    },
}

export default plugin