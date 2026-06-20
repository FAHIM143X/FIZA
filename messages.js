// ╔══════════════════════════════════════════════════════════════╗
// ║        💬  MESSAGES  —  Advanced Message Handler            ║
// ║   Serializer · Anti-Spam · Cooldown · Buttons · LID Fix    ║
// ╚══════════════════════════════════════════════════════════════╝

import fs   from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

// ── Button response extractor ─────────────────────────────────────────
function extractButtonResponse(rawMessage) {
    try {
        // Buttons response
        if (rawMessage?.buttonsResponseMessage) {
            const btn = rawMessage.buttonsResponseMessage
            return {
                id:   btn.selectedButtonId || btn.selectedDisplayText || '',
                text: btn.selectedDisplayText || btn.selectedButtonId || ''
            }
        }
        // List response
        if (rawMessage?.listResponseMessage) {
            const list = rawMessage.listResponseMessage
            return {
                id:   list.singleSelectReply?.selectedRowId || list.title || '',
                text: list.title || list.singleSelectReply?.selectedRowId || ''
            }
        }
        // Template button reply
        if (rawMessage?.templateButtonReplyMessage) {
            const tpl = rawMessage.templateButtonReplyMessage
            return {
                id:   tpl.selectedId || '',
                text: tpl.selectedDisplayText || tpl.selectedId || ''
            }
        }
        // Interactive response
        if (rawMessage?.interactiveResponseMessage) {
            const ir = rawMessage.interactiveResponseMessage
            return {
                id:   ir.body?.text || '',
                text: ir.body?.text || ''
            }
        }
    } catch {}
    return null
}

// ── LID Resolution Helper ─────────────────────────────────────────────
function resolveLidJid(jid) {
    if (!jid || !String(jid).endsWith('@lid')) return jid
    try {
        const lidNum   = String(jid).split('@')[0]
        const phoneNum = global.lidMap?.[lidNum]
        if (phoneNum) return phoneNum + '@s.whatsapp.net'
    } catch {}
    return jid
}

// ╔══════════════════════════════════════════════════════════════╗
// ║  🧠  MESSAGE HANDLER CLASS                                  ║
// ╚══════════════════════════════════════════════════════════════╝

class MessageHandler {
    constructor(config = {}) {
        this.config = config
        this.prefix = config.prefix || '.'
        this.cmdStats = new Map()
        this.toxicWords = []
    }

    // ═══════════════════════════════════════════════════════════════
    //  🛡️  SPAM DETECTION
    // ═══════════════════════════════════════════════════════════════

    #spamMap = new Map()
    #SPAM_MAX = 8
    #SPAM_WIN = 10_000
    #SPAM_JAIL = 30_000

    checkSpam(jid) {
        const now   = Date.now()
        const clean = jid.split('@')[0]
        const data  = this.#spamMap.get(clean) || { count: 0, resetAt: now + this.#SPAM_WIN, warnings: 0, jailedUntil: 0 }

        if (data.jailedUntil > now)
            return { isSpam: true, warning: false, jailed: true, remaining: Math.ceil((data.jailedUntil - now) / 1000) }

        if (now > data.resetAt) { data.count = 0; data.resetAt = now + this.#SPAM_WIN }
        data.count++
        this.#spamMap.set(clean, data)

        if (data.count === Math.floor(this.#SPAM_MAX * 0.7))
            return { isSpam: false, warning: true, jailed: false }

        if (data.count >= this.#SPAM_MAX) {
            data.jailedUntil = now + this.#SPAM_JAIL
            data.warnings++
            this.#spamMap.set(clean, data)
            return { isSpam: true, warning: false, jailed: true, remaining: Math.ceil(this.#SPAM_JAIL / 1000) }
        }

        return { isSpam: false, warning: false, jailed: false }
    }

    clearSpam(jid) { this.#spamMap.delete(jid.split('@')[0]) }

    getSpamStats() {
        const now = Date.now()
        const stats = []
        for (const [jid, data] of this.#spamMap) {
            stats.push({
                jid, count: data.count, warnings: data.warnings,
                jailed: data.jailedUntil > now,
                resetIn: Math.max(0, Math.ceil((data.resetAt - now) / 1000)),
            })
        }
        return stats
    }

    // ═══════════════════════════════════════════════════════════════
    //  ⏳  COOLDOWN MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    #cooldowns = new Map()

    checkCooldown(jid, commandName, cooldownSeconds = 0) {
        if (!cooldownSeconds || cooldownSeconds <= 0) return { onCooldown: false, remaining: 0 }
        const key    = `${jid.split('@')[0]}_${commandName}`
        const now    = Date.now()
        const expiry = this.#cooldowns.get(key) || 0
        if (expiry > now) return { onCooldown: true, remaining: Math.ceil((expiry - now) / 1000) }
        return { onCooldown: false, remaining: 0 }
    }

    setCooldown(jid, commandName, cooldownSeconds) {
        const key    = `${jid.split('@')[0]}_${commandName}`
        const expiry = Date.now() + (cooldownSeconds * 1000)
        this.#cooldowns.set(key, expiry)
        setTimeout(() => this.#cooldowns.delete(key), cooldownSeconds * 1000)
    }

    clearCooldowns(jid) {
        const prefix = jid.split('@')[0] + '_'
        for (const key of this.#cooldowns.keys()) if (key.startsWith(prefix)) this.#cooldowns.delete(key)
    }

    // ═══════════════════════════════════════════════════════════════
    //  📝  MESSAGE SERIALIZATION
    // ═══════════════════════════════════════════════════════════════

    extractText(message) {
        if (!message) return ''
        const msg = message.message || message
        if (!msg) return ''
        return (
            msg.conversation ||
            msg.extendedTextMessage?.text ||
            msg.imageMessage?.caption ||
            msg.videoMessage?.caption ||
            msg.documentMessage?.caption ||
            msg.audioMessage?.caption ||
            msg.buttonsResponseMessage?.selectedDisplayText ||
            msg.buttonsResponseMessage?.selectedButtonId ||
            msg.listResponseMessage?.singleSelectReply?.selectedRowId ||
            msg.listResponseMessage?.title ||
            msg.templateButtonReplyMessage?.selectedId ||
            msg.interactiveResponseMessage?.body?.text ||
            msg.viewOnceMessage?.message?.imageMessage?.caption ||
            msg.viewOnceMessage?.message?.videoMessage?.caption ||
            ''
        ).trim()
    }

    async serialize(sock, msg) {
        if (!msg) return null

        const m = { ...msg }
        const rawMessage = m.message

        m.remoteJid = m.key?.remoteJid
        m.fromMe    = m.key?.fromMe
        m.id        = m.key?.id
        m.isGroup   = m.remoteJid?.endsWith('@g.us')

        const rawSender = m.isGroup ? m.key?.participant : m.key?.remoteJid

        if (rawSender?.endsWith('@lid')) {
            m.senderLid = rawSender
            m.sender    = resolveLidJid(rawSender)
        } else {
            m.sender = rawSender
        }

        m.pushName = m.pushName || ''

        const types = [
            'conversation', 'extendedTextMessage', 'imageMessage',
            'videoMessage', 'documentMessage', 'audioMessage',
            'stickerMessage', 'locationMessage', 'contactMessage',
            'reactionMessage', 'buttonsResponseMessage',
            'listResponseMessage', 'templateButtonReplyMessage',
            'interactiveResponseMessage', 'viewOnceMessage',
            'pollCreationMessage', 'groupInviteMessage',
        ]
        m.type = types.find(t => rawMessage?.[t]) || 'unknown'
        m.body = this.extractText(m)

        // Button / list tap detection
        const btn = extractButtonResponse(rawMessage)
        if (btn) {
            m.buttonId   = btn.id
            m.buttonText = btn.text
            m.isButton   = true
        } else {
            m.isButton = false
        }

        // Quoted message
        m.quoted = null
        if (rawMessage?.extendedTextMessage?.contextInfo?.stanzaId) {
            try {
                const ctx = rawMessage.extendedTextMessage.contextInfo
                m.quoted = {
                    id:     ctx.stanzaId,
                    sender: ctx.participant || m.remoteJid,
                    text:   ctx.quotedMessage?.conversation ||
                            ctx.quotedMessage?.extendedTextMessage?.text || '',
                }
            } catch {}
        }

        m.isMedia    = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage'].includes(m.type)
        m.isViewOnce = m.type === 'viewOnceMessage'

        if (m.isMedia) {
            const media = rawMessage[m.type]
            m.mimetype = media?.mimetype || ''
            m.fileSize = media?.fileLength || 0
        }

        m.mentionedJid = []
        try {
            m.mentionedJid = rawMessage?.extendedTextMessage?.contextInfo?.mentionedJid || []
        } catch {}

        return m
    }

    // ═══════════════════════════════════════════════════════════════
    //  💾  MESSAGE CACHE
    // ═══════════════════════════════════════════════════════════════

    #messageCache = new Map()
    #MAX_CACHE = 200

    cacheMessage(m) {
        const jid = m.remoteJid || m.key?.remoteJid
        if (!jid) return
        if (!this.#messageCache.has(jid)) this.#messageCache.set(jid, [])
        const cache = this.#messageCache.get(jid)
        cache.push(m)
        if (cache.length > this.#MAX_CACHE) this.#messageCache.set(jid, cache.slice(-this.#MAX_CACHE))
    }

    getMessage(jid, messageId) {
        const cache = this.#messageCache.get(jid) || []
        return cache.find(m => (m.key?.id || m.id) === messageId)
    }

    getRecentMessages(jid, limit = 10) {
        const cache = this.#messageCache.get(jid) || []
        return cache.slice(-limit)
    }

    // ═══════════════════════════════════════════════════════════════
    //  📊  QUICK REPLY SHORTCUTS
    // ═══════════════════════════════════════════════════════════════

    createQuickReply(sock, msg) {
        const from = msg.remoteJid || msg.key?.remoteJid
        return {
            reply:      async (text) => sock.sendMessage(from, { text }, { quoted: msg }).catch(() => null),
            react:      async (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } }).catch(() => null),
            send:       async (content) => sock.sendMessage(from, content).catch(() => null),
            sendEphemeral: async (text, delayMs = 5000) => {
                const sent = await sock.sendMessage(from, { text }).catch(() => null)
                if (sent) setTimeout(() => sock.sendMessage(from, { delete: sent.key }).catch(() => {}), delayMs)
                return sent
            },
            deleteMsg:  async () => sock.sendMessage(from, { delete: msg.key }).catch(() => null),
            typing:     async () => sock.sendPresenceUpdate('composing', from).catch(() => null),
            stopTyping: async () => sock.sendPresenceUpdate('paused', from).catch(() => null),
            recording:  async () => sock.sendPresenceUpdate('recording', from).catch(() => null),
            read:       async () => sock.readMessages([msg.key]).catch(() => null),
            mention:    async (text, jids = []) => sock.sendMessage(from, { text, mentions: jids }, { quoted: msg }).catch(() => null),
            downloadQuoted: async () => {
                try {
                    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
                    if (!quoted) return null
                    let messageType = null
                    for (const type of ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage']) {
                        if (quoted[type]) { messageType = type; break }
                    }
                    if (!messageType) return null
                    const stream = await downloadContentFromMessage(quoted[messageType], messageType.replace('Message', ''))
                    let buffer = Buffer.from([])
                    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
                    return buffer
                } catch { return null }
            },
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  📊  COMMAND STATS
    // ═══════════════════════════════════════════════════════════════

    recordCommand(commandName, success = true) {
        const stat = this.cmdStats.get(commandName) || { calls: 0, errors: 0, lastUsed: null }
        stat.calls++
        if (!success) stat.errors++
        stat.lastUsed = new Date().toISOString()
        this.cmdStats.set(commandName, stat)
    }

    getCommandStats() {
        return [...this.cmdStats].map(([command, data]) => ({ command, ...data })).sort((a, b) => b.calls - a.calls)
    }

    getTopCommands(limit = 10) { return this.getCommandStats().slice(0, limit) }

    // ═══════════════════════════════════════════════════════════════
    //  🔗  LINK DETECTION
    // ═══════════════════════════════════════════════════════════════

    extractLinks(text) { return text.match(/(https?:\/\/[^\s]+)/gi) || [] }

    hasGroupLink(text) {
        const patterns = [
            /chat\.whatsapp\.com\/(invite\/)?[a-zA-Z0-9]+/gi,
            /whatsapp\.com\/channel\//gi,
            /wa\.me\//gi,
        ]
        return patterns.some(p => p.test(text))
    }

    extractGroupInviteCodes(text) {
        const pattern = /chat\.whatsapp\.com\/(?:invite\/)?([a-zA-Z0-9]+)/gi
        const matches = []
        let match
        while ((match = pattern.exec(text)) !== null) matches.push(match[1])
        return matches
    }

    // ═══════════════════════════════════════════════════════════════
    //  🗣️  MENTIONS
    // ═══════════════════════════════════════════════════════════════

    getMentionedJids(msg) {
        try { return msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [] } catch { return [] }
    }

    formatMentions(text, mentionedJids = []) {
        let formatted = text
        for (const jid of mentionedJids) {
            const num = jid.split('@')[0]
            formatted = formatted.replace(new RegExp(`@${num}`, 'g'), `@${num}`)
        }
        return formatted
    }

    // ═══════════════════════════════════════════════════════════════
    //  🧹  TOXIC FILTER
    // ═══════════════════════════════════════════════════════════════

    isToxic(text) {
        if (!text || this.toxicWords.length === 0) return false
        const lower = text.toLowerCase()
        return this.toxicWords.some(w => lower.includes(w))
    }

    addToxicWords(words) { this.toxicWords.push(...words) }

    // ═══════════════════════════════════════════════════════════════
    //  📦  BULK OPERATIONS
    // ═══════════════════════════════════════════════════════════════

    async deleteMessages(sock, from, messageKeys) {
        const results = []
        for (const key of messageKeys) {
            try { await sock.sendMessage(from, { delete: key }); results.push({ key, success: true }) }
            catch (err) { results.push({ key, success: false, error: err.message }) }
            await sleep(200)
        }
        return results
    }

    async forwardMessage(sock, msg, targetJids) {
        const results = []
        for (const jid of targetJids) {
            try { await sock.sendMessage(jid, { forward: msg }); results.push({ jid, success: true }) }
            catch (err) { results.push({ jid, success: false, error: err.message }) }
            await sleep(200)
        }
        return results
    }

    // ═══════════════════════════════════════════════════════════════
    //  🧵  CONVERSATION CONTEXT
    // ═══════════════════════════════════════════════════════════════

    async getConversationContext(store, chatJid, limit = 5) {
        const cache     = this.#messageCache.get(chatJid) || []
        const storeMsgs = store?.messages?.[chatJid] || []
        const allMsgs   = [...cache, ...storeMsgs]
        const seen      = new Set()
        const unique    = []

        for (const m of allMsgs.reverse()) {
            const id = m.key?.id || m.id
            if (id && !seen.has(id)) {
                seen.add(id)
                unique.unshift(m)
                if (unique.length >= limit) break
            }
        }

        return unique.map(m => ({
            sender: m.sender || m.key?.participant || m.key?.remoteJid,
            text:   this.extractText(m),
            time:   m.messageTimestamp || 0,
        }))
    }
}

// ╔══════════════════════════════════════════════════════════════╗
// ║  📤  EXPORT                                                 ║
// ╚══════════════════════════════════════════════════════════════╝

let instance = null

export function getMessageHandler(config = {}) {
    if (!instance) instance = new MessageHandler(config)
    if (config && Object.keys(config).length > 0) {
        instance.config = config
        instance.prefix = config.prefix || '.'
    }
    return instance
}

export { MessageHandler }
export default MessageHandler