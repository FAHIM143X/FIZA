// ╔══════════════════════════════════════════════════════════════╗
// ║                  🔐 FIZA SECURITY SYSTEM                    ║
// ║     Modes · Group Control · Ban · Whitelist · Warnings     ║
// ║     Identity checks → owner.js (with backwards compat)    ║
// ╚══════════════════════════════════════════════════════════════╝

import fs    from 'fs'
import path  from 'path'
import { fileURLToPath } from 'url'
import owner, { isGroupJid, num } from './owner.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const DB_DIR   = path.join(__dirname, 'database')
const MODE_DB  = path.join(DB_DIR, 'mode.json')
const GROUP_DB = path.join(DB_DIR, 'groups.json')
const BAN_DB   = path.join(DB_DIR, 'bans.json')
const WL_DB    = path.join(DB_DIR, 'whitelist.json')

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })

function ensureFile(file, fallback) {
    if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(fallback, null, 2))
}
ensureFile(MODE_DB,  { mode: 'public' })
ensureFile(GROUP_DB, {})
ensureFile(BAN_DB,   [])
ensureFile(WL_DB,    [])

function readJSON(file)     { try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return null } }
function writeJSON(file, d) { try { fs.writeFileSync(file, JSON.stringify(d, null, 2)); return true } catch { return false } }

// ── Named exports (for import { isOwner } from './security.js') ───────
export const isOwner    = (jid)  => owner.isOwner(jid)
export const isCreator  = (jid)  => owner.isCreator(jid)
export const isCoOwner  = (jid)  => owner.isCoOwner(jid)
export const isMod      = (jid)  => owner.isMod(jid)
export const isAdmin    = (...a) => owner.isAdmin(...a)
export const isBotAdmin = (...a) => owner.isBotAdmin(...a)
export const getLevel   = (...a) => owner.getLevel(...a)
export const resolveLid = (jid)  => owner.resolveLid(jid)
export { isGroupJid, num as cleanJid, owner }

// ╔══════════════════════════════════════════════════════════════╗
// ║  🔒  SECURITY CLASS                                         ║
// ╚══════════════════════════════════════════════════════════════╝

class Security {

    // ── Identity delegation → owner.js ────────────────────────────────
    // These methods exist on the class so that any code doing
    // security.isOwner() / security.isAdmin() still works.

    isOwner(jid)        { return owner.isOwner(jid) }
    isCreator(jid)      { return owner.isCreator(jid) }
    isCoOwner(jid)      { return owner.isCoOwner(jid) }
    isMod(jid)          { return owner.isMod(jid) }
    isAdmin(...a)       { return owner.isAdmin(...a) }
    isBotAdmin(...a)    { return owner.isBotAdmin(...a) }
    getLevel(...a)      { return owner.getLevel(...a) }
    resolveLid(jid)     { return owner.resolveLid(jid) }
    resolve(jid)        { return owner.resolve(jid) }
    refresh()           {} // no-op — owner.js reads globals directly

    // ── Global Mode ───────────────────────────────────────────────────

    getMode() {
        return readJSON(MODE_DB)?.mode || global.workMode || 'public'
    }
    setMode(mode) {
        const valid = ['public', 'private', 'group', 'inbox', 'off']
        if (!valid.includes(mode)) return false
        return writeJSON(MODE_DB, { mode })
    }
    canUseBot(jid) {
        if (owner.isOwner(jid)) return true
        const m = this.getMode()
        return !(m === 'off' || m === 'private')
    }
    canUseInChat(chatJid) {
        const m = this.getMode()
        if (m === 'off') return false
        if (m === 'group' && !isGroupJid(chatJid)) return false
        if (m === 'inbox' &&  isGroupJid(chatJid)) return false
        return true
    }

    // ── Group Management ──────────────────────────────────────────────

    getGroups()      { return readJSON(GROUP_DB) || {} }
    saveGroups(data) { return writeJSON(GROUP_DB, data) }

    getGroupData(groupJid) {
        const gid = num(groupJid)
        return this.getGroups()[gid] || {
            mode: 'default', muted: false, antilink: false,
            antitoxic: false, welcome: true, goodbye: true,
            chatBot: false, blacklist: [], warnings: {},
            welcometext: '', goodbyetext: '',
        }
    }
    setGroupData(groupJid, updates = {}) {
        const groups = this.getGroups()
        const gid    = num(groupJid)
        groups[gid]  = { ...this.getGroupData(groupJid), ...updates }
        return this.saveGroups(groups)
    }

    getGroupMode(g)       { return this.getGroupData(g).mode || 'default' }
    setGroupMode(g, mode) { return this.setGroupData(g, { mode }) }

    isGroupMuted(g)  { return !!this.getGroupData(g).muted }
    muteGroup(g)     { return this.setGroupData(g, { muted: true  }) }
    unmuteGroup(g)   { return this.setGroupData(g, { muted: false }) }

    isAntilink(g)            { return !!this.getGroupData(g).antilink }
    setAntilink(g, v = true) { return this.setGroupData(g, { antilink: v }) }

    isAntitoxic(g)             { return !!this.getGroupData(g).antitoxic }
    setAntitoxic(g, v = true)  { return this.setGroupData(g, { antitoxic: v }) }

    isChatBot(g)             { return !!this.getGroupData(g).chatBot }
    setChatBot(g, v = true)  { return this.setGroupData(g, { chatBot: v }) }

    isWelcome(g) { return this.getGroupData(g).welcome !== false }
    isGoodbye(g) { return this.getGroupData(g).goodbye !== false }

    setWelcome(g, enabled, text = '') { return this.setGroupData(g, { welcome: enabled, welcometext: text }) }
    setGoodbye(g, enabled, text = '') { return this.setGroupData(g, { goodbye: enabled, goodbyetext: text }) }

    // ── Ban System ────────────────────────────────────────────────────

    getBans()   { return readJSON(BAN_DB) || [] }
    saveBans(d) { return writeJSON(BAN_DB, d) }

    banUser(jid) {
        const bans = this.getBans()
        const n    = num(owner.resolve(jid))
        if (!bans.includes(n)) bans.push(n)
        return this.saveBans(bans)
    }
    unbanUser(jid) {
        const n = num(owner.resolve(jid))
        return this.saveBans(this.getBans().filter(b => b !== n))
    }
    isBanned(jid) { return this.getBans().includes(num(owner.resolve(jid))) }

    // ── Whitelist ─────────────────────────────────────────────────────

    getWhitelist()      { return readJSON(WL_DB) || [] }
    saveWhitelist(d)    { return writeJSON(WL_DB, d) }

    addWhitelist(jid) {
        const wl = this.getWhitelist()
        const n  = num(owner.resolve(jid))
        if (!wl.includes(n)) wl.push(n)
        return this.saveWhitelist(wl)
    }
    removeWhitelist(jid) {
        const n = num(owner.resolve(jid))
        return this.saveWhitelist(this.getWhitelist().filter(w => w !== n))
    }
    isWhitelisted(jid) { return this.getWhitelist().includes(num(owner.resolve(jid))) }

    // ── Warnings ──────────────────────────────────────────────────────

    warnUser(groupJid, userJid) {
        const data = this.getGroupData(groupJid)
        const n    = num(owner.resolve(userJid))
        if (!data.warnings[n]) data.warnings[n] = 0
        data.warnings[n]++
        this.setGroupData(groupJid, data)
        return data.warnings[n]
    }
    getWarnings(groupJid, userJid) {
        return this.getGroupData(groupJid).warnings[num(owner.resolve(userJid))] || 0
    }
    resetWarnings(groupJid, userJid) {
        const data = this.getGroupData(groupJid)
        delete data.warnings[num(owner.resolve(userJid))]
        return this.setGroupData(groupJid, data)
    }

    // ── Command Blacklist ─────────────────────────────────────────────

    blacklistCommand(groupJid, cmd) {
        const data = this.getGroupData(groupJid)
        const c    = cmd.toLowerCase()
        if (!data.blacklist.includes(c)) data.blacklist.push(c)
        return this.setGroupData(groupJid, data)
    }
    unblacklistCommand(groupJid, cmd) {
        const data     = this.getGroupData(groupJid)
        data.blacklist = data.blacklist.filter(c => c !== cmd.toLowerCase())
        return this.setGroupData(groupJid, data)
    }
    isCommandBlacklisted(groupJid, cmd) {
        return this.getGroupData(groupJid).blacklist.includes(cmd.toLowerCase())
    }

    // ── Master Access Check ───────────────────────────────────────────

    async checkAccess(sock, store, groupJid, senderJid, command = '') {
        if (this.isBanned(senderJid))
            return { allowed: false, reason: 'banned' }

        if (this.isWhitelisted(senderJid))
            return { allowed: true, reason: 'whitelisted' }

        if (owner.isOwner(senderJid))
            return { allowed: true, reason: 'owner' }

        if (this.getMode() === 'off')
            return { allowed: false, reason: 'global_off' }

        if (isGroupJid(groupJid)) {
            if (this.isGroupMuted(groupJid))
                return { allowed: false, reason: 'group_muted' }

            const gMode = this.getGroupMode(groupJid)

            if (gMode === 'off')
                return { allowed: false, reason: 'group_off' }

            if (command && this.isCommandBlacklisted(groupJid, command)) {
                const isAdm = await owner.isAdmin(sock, store, groupJid, senderJid)
                if (!isAdm) return { allowed: false, reason: 'command_blacklisted' }
            }

            if (gMode === 'admin-only') {
                const isAdm = await owner.isAdmin(sock, store, groupJid, senderJid)
                if (!isAdm) return { allowed: false, reason: 'admin_only' }
            }
        }

        if (!this.canUseBot(senderJid))
            return { allowed: false, reason: 'global_mode' }

        if (!this.canUseInChat(groupJid))
            return { allowed: false, reason: 'global_chat_restriction' }

        return { allowed: true, reason: 'ok' }
    }

    // ── Stats ─────────────────────────────────────────────────────────

    getStats() {
        const groups = this.getGroups()
        return {
            mode:             this.getMode(),
            owners:           owner.owners.length,
            creators:         owner.creators.length,
            coOwners:         owner.coOwners.length,
            mods:             owner.mods.length,
            bannedUsers:      this.getBans().length,
            whitelistedUsers: this.getWhitelist().length,
            groups:           Object.keys(groups).length,
            lidMapSize:       owner.lidMapSize,
            groupsData: Object.entries(groups).map(([jid, data]) => ({
                jid:      jid + '@g.us',
                mode:     data.mode     || 'default',
                muted:    !!data.muted,
                antilink: !!data.antilink,
            })),
        }
    }
}

const security = new Security()
export default security
