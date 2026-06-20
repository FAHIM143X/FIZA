// ╔══════════════════════════════════════════════════════════════╗
// ║               🔧  MODE  —  Bot Mode Control                 ║
// ║      Global Mode · Group Mode · Status Display             ║
// ╚══════════════════════════════════════════════════════════════╝

import security from '../../security.js'

// ── MODE DESCRIPTIONS ─────────────────────────────────────────────────
const GLOBAL_MODES = {
    public:  { icon: '🌍', label: 'Public',  desc: 'Everyone can use the bot' },
    private: { icon: '🔒', label: 'Private', desc: 'Only owners can use the bot' },
    group:   { icon: '👥', label: 'Group',   desc: 'Groups only (no DMs)' },
    inbox:   { icon: '📩', label: 'Inbox',   desc: 'DMs only (no groups)' },
    off:     { icon: '⛔', label: 'Off',     desc: 'Bot is completely disabled' },
}

const GROUP_MODES = {
    default:    { icon: '✅', label: 'Default',    desc: 'Follows global bot mode' },
    on:         { icon: '🟢', label: 'On',         desc: 'Always active in this group' },
    off:        { icon: '🔴', label: 'Off',        desc: 'Disabled in this group' },
    'admin-only': { icon: '🛡️', label: 'Admin Only', desc: 'Only admins can use commands' },
}

// ── HELPERS ───────────────────────────────────────────────────────────
function modeBar(current, modes) {
    return Object.entries(modes)
        .map(([key, { icon, label }]) =>
            key === current
                ? `▶ ${icon} *${label}*`
                : `  ${icon} ${label}`
        )
        .join('\n')
}

// ── PLUGIN ────────────────────────────────────────────────────────────
const modePlugin = {
    name:     'mode',
    command:  ['mode', 'setmode', 'botmode'],
    desc:     'View or change bot/group mode',
    usage:    '.mode [global/group] [mode_name]',
    isOwner:  false,   // handled manually below so admins can set group mode
    category: 'settings',

    async run({ sock, msg, from, sender, args, reply, react, isOwner, isAdmin, isGroup, prefix }) {

        const sub  = args[0]?.toLowerCase()  // e.g. "global" / "group" / mode name
        const val  = args[1]?.toLowerCase()  // mode value when sub is "global" or "group"

        const botJid      = sock.user?.id || ''
        const currentGlobal = security.getMode()
        const currentGroup  = isGroup ? security.getGroupMode(from) : null

        // ── No args → show current status ────────────────────────────
        if (!sub) {
            const gInfo  = GLOBAL_MODES[currentGlobal] || GLOBAL_MODES.public
            const grInfo = isGroup ? (GROUP_MODES[currentGroup] || GROUP_MODES.default) : null

            let text =
                `╔══════════════════════════╗\n` +
                `║   🔧  BOT MODE STATUS    ║\n` +
                `╚══════════════════════════╝\n\n` +
                `🌐 *Global Mode*\n` +
                `${gInfo.icon} *${gInfo.label}* — ${gInfo.desc}\n`

            if (isGroup && grInfo) {
                text +=
                    `\n👥 *This Group*\n` +
                    `${grInfo.icon} *${grInfo.label}* — ${grInfo.desc}\n`
            }

            text +=
                `\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `📌 *Commands*\n` +
                `${prefix}mode global <mode>  — change global\n` +
                (isGroup ? `${prefix}mode group <mode>   — change this group\n` : '') +
                `\n🌍 *Global options:*\n${modeBar(currentGlobal, GLOBAL_MODES)}`

            if (isGroup) {
                text += `\n\n👥 *Group options:*\n${modeBar(currentGroup, GROUP_MODES)}`
            }

            return reply(text)
        }

        // ── .mode global <value> ──────────────────────────────────────
        if (sub === 'global') {
            if (!isOwner) {
                return reply(`👑 Only owners can change the *global* mode.`)
            }

            if (!val) {
                const list = Object.entries(GLOBAL_MODES)
                    .map(([k, { icon, label, desc }]) =>
                        `${icon} *${k}* — ${desc}${k === currentGlobal ? ' ◀ current' : ''}`)
                    .join('\n')
                return reply(`🌍 *Global Mode Options*\n\n${list}\n\nUsage: ${prefix}mode global <name>`)
            }

            if (!GLOBAL_MODES[val]) {
                const validList = Object.keys(GLOBAL_MODES).join(' | ')
                return reply(`❌ Invalid mode: *${val}*\n\nValid options: ${validList}`)
            }

            if (val === currentGlobal) {
                return reply(`ℹ️ Global mode is already *${GLOBAL_MODES[val].label}*.`)
            }

            const ok = security.setMode(val)
            if (!ok) return reply(`⚠️ Failed to save mode. Check database directory.`)

            const info = GLOBAL_MODES[val]
            await react('✅')
            return reply(
                `✅ *Global mode changed!*\n\n` +
                `${info.icon} *${info.label}*\n` +
                `${info.desc}`
            )
        }

        // ── .mode group <value> ───────────────────────────────────────
        if (sub === 'group') {
            if (!isGroup) {
                return reply(`👥 Group mode can only be set inside a group.`)
            }

            if (!isOwner && !isAdmin) {
                return reply(`🛡️ Only *admins* or *owners* can change the group mode.`)
            }

            if (!val) {
                const list = Object.entries(GROUP_MODES)
                    .map(([k, { icon, label, desc }]) =>
                        `${icon} *${k}* — ${desc}${k === currentGroup ? ' ◀ current' : ''}`)
                    .join('\n')
                return reply(`👥 *Group Mode Options*\n\n${list}\n\nUsage: ${prefix}mode group <name>`)
            }

            if (!GROUP_MODES[val]) {
                const validList = Object.keys(GROUP_MODES).join(' | ')
                return reply(`❌ Invalid group mode: *${val}*\n\nValid options: ${validList}`)
            }

            if (val === currentGroup) {
                return reply(`ℹ️ Group mode is already *${GROUP_MODES[val].label}*.`)
            }

            const ok = security.setGroupMode(from, val)
            if (!ok) return reply(`⚠️ Failed to save group mode.`)

            const info = GROUP_MODES[val]
            await react('✅')
            return reply(
                `✅ *Group mode changed!*\n\n` +
                `${info.icon} *${info.label}*\n` +
                `${info.desc}`
            )
        }

        // ── Shorthand: .mode public / .mode off / .mode admin-only etc ─
        // Try global mode first (owner only), then group mode (admin+)
        const asGlobal = GLOBAL_MODES[sub]
        const asGroup  = GROUP_MODES[sub]

        if (asGlobal) {
            if (!isOwner) return reply(`👑 Only owners can change the *global* mode.`)
            if (sub === currentGlobal) return reply(`ℹ️ Already in *${asGlobal.label}* mode.`)
            const ok = security.setMode(sub)
            if (!ok) return reply(`⚠️ Failed to save.`)
            await react('✅')
            return reply(`✅ *Global → ${asGlobal.icon} ${asGlobal.label}*\n${asGlobal.desc}`)
        }

        if (asGroup && isGroup) {
            if (!isOwner && !isAdmin) return reply(`🛡️ Admins/owners only.`)
            if (sub === currentGroup) return reply(`ℹ️ Already in *${asGroup.label}* mode.`)
            const ok = security.setGroupMode(from, sub)
            if (!ok) return reply(`⚠️ Failed to save.`)
            await react('✅')
            return reply(`✅ *Group → ${asGroup.icon} ${asGroup.label}*\n${asGroup.desc}`)
        }

        // Unknown subcommand
        return reply(
            `❓ Unknown option: *${sub}*\n\n` +
            `Usage:\n` +
            `${prefix}mode               — show status\n` +
            `${prefix}mode global <mode> — set global mode\n` +
            (isGroup ? `${prefix}mode group <mode>  — set group mode\n` : '') +
            `\n🌍 Global: ${Object.keys(GLOBAL_MODES).join(' | ')}\n` +
            (isGroup ? `👥 Group:  ${Object.keys(GROUP_MODES).join(' | ')}` : '')
        )
    }
}

export default modePlugin
