// ╔══════════════════════════════════════════════════════════════╗
// ║               👑  OWNER.JS  —  Permission Engine            ║
// ║   Persistent LID Map · Multi-Device · All JID Formats      ║
// ╚══════════════════════════════════════════════════════════════╝
//
// Single source of truth for ALL permission checks.
// Persists the LID map to disk — owner detection works even on
// cold start before contacts.upsert fires.

import fs   from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename  = fileURLToPath(import.meta.url)
const __dirname   = path.dirname(__filename)
const DB_DIR      = path.join(__dirname, 'database')
const LIDMAP_FILE = path.join(DB_DIR, 'lidmap.json')

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })

// ── JID UTILITIES (exported) ──────────────────────────────────────────

/** Strip everything except digits  e.g. "91728x:5@s.whatsapp.net" → "91728x" */
export const num = (jid = '') =>
    String(jid).split('@')[0].split(':')[0].replace(/[^0-9]/g, '')

/** True if two JIDs refer to the same number (handles country-code mismatches) */
export const sameNum = (a, b) => {
    const na = num(a), nb = num(b)
    if (!na || !nb) return false
    return na === nb || na.endsWith(nb) || nb.endsWith(na)
}

export const isGroupJid = (jid = '') => String(jid).endsWith('@g.us')
export const isLidJid   = (jid = '') => String(jid).endsWith('@lid')

// ── PRIVATE HELPERS ───────────────────────────────────────────────────

const _normalize = (val) =>
    (Array.isArray(val) ? val : val ? [val] : [])
        .map(n => String(n).replace(/[^0-9]/g, ''))
        .filter(Boolean)

const _match = (a, b) =>
    !!(a && b && (a === b || a.endsWith(b) || b.endsWith(a)))

// ╔══════════════════════════════════════════════════════════════╗
// ║  👑  OWNER MANAGER                                          ║
// ╚══════════════════════════════════════════════════════════════╝

class OwnerManager {
    constructor() {
        this._lid     = {}   // lid_number  → phone_number
        this._phone   = {}   // phone_number → lid_number  (reverse)
        this._loadLidMap()
    }

    // ── Persistent LID Map ────────────────────────────────────────────

    _loadLidMap() {
        try {
            const { lidMap = {}, phoneToLid = {} } = JSON.parse(fs.readFileSync(LIDMAP_FILE, 'utf8'))
            this._lid   = lidMap
            this._phone = phoneToLid
            this._sync()
            const n = Object.keys(this._lid).length
            if (n > 0) console.log(`[OWNER] ✅ Loaded ${n} LID mappings from disk`)
        } catch {
            this._lid   = {}
            this._phone = {}
        }
    }

    _saveLidMap() {
        try {
            const tmp = LIDMAP_FILE + '.tmp'
            fs.writeFileSync(tmp, JSON.stringify({
                lidMap:     this._lid,
                phoneToLid: this._phone,
                savedAt:    new Date().toISOString(),
                count:      Object.keys(this._lid).length,
            }, null, 2))
            fs.renameSync(tmp, LIDMAP_FILE)  // atomic write — no corruption
        } catch (e) {
            console.error('[OWNER] LID save failed:', e.message)
        }
    }

    _sync() {
        global.lidMap     = this._lid
        global.phoneToLid = this._phone
    }

    // ── LID Map API ───────────────────────────────────────────────────

    /**
     * Add a LID ↔ phone mapping.
     * Accepts any JID format or bare number.
     * Returns true if the map changed.
     */
    linkLid(lidJid, phoneJid) {
        const l = num(lidJid)
        const p = num(phoneJid)
        if (!l || !p || l.length < 7 || p.length < 7) return false
        if (this._lid[l] === p) return false

        this._lid[l]   = p
        this._phone[p] = l
        this._sync()
        this._saveLidMap()
        return true
    }

    /**
     * Process a contacts array from Baileys contacts.upsert / contacts.update.
     * Each entry: { id: '91xxx@s.whatsapp.net', lid: '179xxx@lid' }
     */
    processContacts(contacts = []) {
        let changed = false
        for (const c of contacts) {
            try {
                if (!c?.id || !c?.lid) continue
                const p = num(c.id)
                const l = num(c.lid)
                if (!p || !l || p.length < 7 || l.length < 7) continue
                if (this._lid[l] !== p) {
                    this._lid[l]   = p
                    this._phone[p] = l
                    changed = true
                }
            } catch {}
        }
        if (changed) { this._sync(); this._saveLidMap() }
    }

    /**
     * Called once on connection open.
     * Seeds the bot's own LID into the map.
     */
    autoDetect(sock) {
        try {
            if (sock?.user?.id && sock?.user?.lid) {
                const changed = this.linkLid(sock.user.lid, sock.user.id)
                if (changed)
                    console.log(`[OWNER] Bot LID mapped: ${num(sock.user.lid)} → ${num(sock.user.id)}`)
            }
        } catch {}
    }

    // ── LID Resolution ────────────────────────────────────────────────

    /** Resolve a @lid JID to a real phone JID. Returns original if unknown. */
    resolveLid(jid = '') {
        if (!isLidJid(jid)) return jid
        const l     = String(jid).split('@')[0]
        const phone = this._lid[l]
        return phone ? phone + '@s.whatsapp.net' : jid
    }

    /** Resolve ANY JID format to a phone JID */
    resolve(jid = '') {
        return isLidJid(jid) ? this.resolveLid(jid) : jid
    }

    // ── Owner lists (always fresh from global settings) ───────────────

    get owners()   { return _normalize(global.ownerNumber) }
    get creators() { return _normalize(global.creatorNumber) }
    get coOwners() { return _normalize(global.coOwner || []) }
    get mods()     { return _normalize(global.mods    || []) }

    // ── Permission Checks ─────────────────────────────────────────────

    isCreator(jid) {
        if (!jid) return false
        const n = num(this.resolve(jid))
        return this.creators.some(c => _match(n, c)) ||
               this._lidFallback(jid, this.creators)
    }

    /**
     * isOwner — the main check.
     * Handles: phone JID, LID JID, multi-device JID, partial numbers.
     * Falls back to persistent reverse map if LID not resolved yet.
     */
    isOwner(jid) {
        if (!jid) return false
        if (this.isCreator(jid)) return true
        const n = num(this.resolve(jid))
        if (this.owners.some(o => _match(n, o))) return true
        return this._lidFallback(jid, [...this.owners, ...this.creators])
    }

    isCoOwner(jid) {
        if (!jid) return false
        if (this.isOwner(jid)) return true
        const n = num(this.resolve(jid))
        return this.coOwners.some(c => _match(n, c))
    }

    isMod(jid) {
        if (!jid) return false
        if (this.isCoOwner(jid)) return true
        const n = num(this.resolve(jid))
        return this.mods.some(m => _match(n, m))
    }

    /**
     * Is this JID an admin in the given group?
     * Works in both regular and Community groups (LID participants).
     */
    async isAdmin(sock, store, groupJid, userJid) {
        if (!isGroupJid(groupJid) || !userJid) return false
        try {
            const meta   = store?.groupMetadata?.[groupJid] || await sock.groupMetadata(groupJid)
            const admins = (meta?.participants || []).filter(p => p.admin)
            const n      = num(this.resolve(userJid))
            const lidRaw = isLidJid(userJid) ? num(userJid) : null

            return admins.some(p => {
                const pr = num(p.id)
                const pn = num(this.resolve(p.id))
                return _match(pn, n) || _match(pr, n) || (lidRaw && pr === lidRaw)
            })
        } catch { return false }
    }

    /** Is the bot itself an admin in the group? */
    async isBotAdmin(sock, store, groupJid) {
        if (!isGroupJid(groupJid)) return false
        try {
            const meta   = store?.groupMetadata?.[groupJid] || await sock.groupMetadata(groupJid)
            const admins = (meta?.participants || []).filter(p => p.admin)
            const botN   = num(sock?.user?.id  || '')
            const botLid = sock?.user?.lid ? num(sock.user.lid) : null

            return admins.some(p => {
                const pr = num(p.id)
                return pr === botN || (botLid && pr === botLid)
            })
        } catch { return false }
    }

    /**
     * Full permission level for a JID.
     * Returns: 'creator' | 'owner' | 'coowner' | 'mod' | 'admin' | 'member'
     */
    async getLevel(sock, store, groupJid, jid) {
        if (!jid) return 'unknown'
        if (this.isCreator(jid))  return 'creator'
        if (this.isOwner(jid))    return 'owner'
        if (this.isCoOwner(jid))  return 'coowner'
        if (this.isMod(jid))      return 'mod'
        if (isGroupJid(groupJid) && await this.isAdmin(sock, store, groupJid, jid))
            return 'admin'
        return 'member'
    }

    // ── Debug ─────────────────────────────────────────────────────────

    /**
     * Full debug dump for a JID.
     * Use in a .ownercheck command to diagnose issues.
     */
    debug(jid) {
        const resolved  = this.resolve(jid)
        const n         = num(resolved)
        const lidRaw    = isLidJid(jid) ? num(jid) : null
        const mapResult = lidRaw ? this._lid[lidRaw] : null

        return {
            input:       jid,
            isLid:       isLidJid(jid),
            lidNumber:   lidRaw,
            mapResult,
            resolved,
            cleanNum:    n,
            ownerNums:   this.owners,
            creatorNums: this.creators,
            directMatch: this.owners.some(o => _match(n, o)),
            lidInMap:    lidRaw != null ? lidRaw in this._lid : null,
            lidFallback: this._lidFallback(jid, [...this.owners, ...this.creators]),
            isOwner:     this.isOwner(jid),
            lidMapSize:  Object.keys(this._lid).length,
        }
    }

    get lidMapSize() { return Object.keys(this._lid).length }

    // ── Private ───────────────────────────────────────────────────────

    _lidFallback(jid, numList) {
        if (!isLidJid(jid)) return false
        const lidRaw = num(jid)
        return numList.some(n => {
            if (!n) return false
            const knownLid = this._phone[n]
            return knownLid && _match(knownLid, lidRaw)
        })
    }
}

// ── Singleton ─────────────────────────────────────────────────────────

const owner = new OwnerManager()
export default owner
