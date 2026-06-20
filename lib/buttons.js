// ╔══════════════════════════════════════════════════════════════╗
// ║              🔘  BUTTONS  —  Interactive Button Helper      ║
// ║   Quick Reply · CTA URL · CTA Call · CTA Copy · List        ║
// ╚══════════════════════════════════════════════════════════════╝

import {
    generateWAMessageFromContent,
    proto,
    prepareWAMessageMedia,
    generateWAMessageContent
} from '@whiskeysockets/baileys'

// ── Button builders ───────────────────────────────────────────────────

/** A tappable button that sends back an id when pressed */
export function quickReply(id, displayText) {
    return {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({ display_text: displayText, id }),
    }
}

/** A button that opens a URL */
export function ctaUrl(displayText, url) {
    return {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
            display_text: displayText,
            url,
            merchant_url: url,
        }),
    }
}

/** A button that starts a phone call */
export function ctaCall(displayText, phoneNumber) {
    return {
        name: 'cta_call',
        buttonParamsJson: JSON.stringify({ display_text: displayText, id: phoneNumber }),
    }
}

/** A button that copies text to clipboard */
export function ctaCopy(displayText, copyText) {
    return {
        name: 'cta_copy',
        buttonParamsJson: JSON.stringify({
            display_text: displayText,
            id: 'copy_id',
            copy_code: copyText,
        }),
    }
}

/** A button that opens a single-select list of rows */
export function singleSelect(displayText, sections) {
    return {
        name: 'single_select',
        buttonParamsJson: JSON.stringify({
            title: displayText,
            sections,
        }),
    }
}

// ── Native Flow Sender (v7+) ──────────────────────────────────────────

/**
 * Send interactive buttons using native flow (WhatsApp v7+)
 */
export async function sendNativeFlow(sock, jid, opts = {}, options = {}) {
    const { text = '', footer = '', title, image, buttons = [] } = opts

    // Build header
    let headerMessage = {}
    if (image) {
        const media = await prepareWAMessageMedia(
            { image: typeof image === 'string' ? { url: image } : image },
            { upload: sock.waUploadToServer }
        )
        headerMessage = { imageMessage: media.imageMessage }
    }

    const header = proto.Message.InteractiveMessage.Header.create({
        title: title || undefined,
        hasMediaAttachment: !!image,
        ...headerMessage,
    })

    const content = {
        interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({ text }),
            footer: footer ? proto.Message.InteractiveMessage.Footer.create({ text: footer }) : undefined,
            header: title || image ? header : undefined,
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                buttons: buttons.map(b =>
                    proto.Message.InteractiveMessage.NativeFlowMessage.NativeFlowButton.create({
                        name: b.name,
                        buttonParamsJson: b.buttonParamsJson,
                    })
                ),
            }),
        }),
    }

    const waMsg = generateWAMessageFromContent(jid, { viewOnceMessage: { message: content } }, {
        userJid: sock.user.id,
        quoted: options.quoted,
    })

    await sock.relayMessage(jid, waMsg.message, { messageId: waMsg.key.id })
    return waMsg
}

// ── Template Buttons Sender (Fallback for older clients) ──────────────

/**
 * Send buttons using templateButtons (older format, wider support)
 */
export async function sendTemplateButtons(sock, jid, text, buttons, options = {}) {
    await sock.sendMessage(jid, {
        text: text,
        footer: '🌸 FIZA Bot',
        templateButtons: buttons.map((b, i) => ({
            index: i + 1,
            quickReplyButton: {
                displayText: b.displayText || b.text || 'Button',
                id: b.id || `btn_${i}`,
            },
        })),
    }, { quoted: options.quoted })
}

// ── Hybrid Sender (Tries native, falls back to template) ──────────────

/**
 * Send buttons — tries native flow first, falls back to template buttons
 */
export async function sendButtons(sock, jid, opts = {}, options = {}) {
    const { text = '', buttons = [] } = opts

    // Convert buttons to template format for fallback
    const templateBtns = buttons.map((b, i) => {
        let parsed = {}
        try { parsed = JSON.parse(b.buttonParamsJson) } catch {}
        return {
            id: parsed.id || `btn_${i}`,
            displayText: parsed.display_text || 'Button',
        }
    })

    try {
        // Try native flow first
        return await sendNativeFlow(sock, jid, opts, options)
    } catch (err) {
        console.log('[BUTTONS] Native flow failed, using template fallback:', err.message)
        // Fallback to template buttons
        return await sendTemplateButtons(sock, jid, text, templateBtns, options)
    }
}

// ── Extraction helper (used by messages.js) ────────────────────────────

/**
 * Extract a button tap from a raw Baileys message.
 * Returns { id, text } or null if the message isn't a button response.
 */
export function extractButtonResponse(rawMessage) {
    try {
        // Native flow response (v7+)
        const nfr = rawMessage?.interactiveResponseMessage?.nativeFlowResponseMessage
        if (nfr?.paramsJson) {
            const parsed = JSON.parse(nfr.paramsJson)
            return {
                id: parsed.id ?? null,
                text: rawMessage.interactiveResponseMessage?.body?.text ?? null,
            }
        }

        // Template button response
        const tbr = rawMessage?.templateButtonReplyMessage
        if (tbr?.selectedId) {
            return {
                id: tbr.selectedId,
                text: tbr.selectedDisplayText ?? null,
            }
        }

        // Legacy buttonsResponseMessage
        const brm = rawMessage?.buttonsResponseMessage
        if (brm?.selectedButtonId) {
            return { id: brm.selectedButtonId, text: brm.selectedDisplayText ?? null }
        }

        // Legacy listResponseMessage
        const lrm = rawMessage?.listResponseMessage
        if (lrm?.singleSelectReply?.selectedRowId) {
            return { id: lrm.singleSelectReply.selectedRowId, text: lrm.title ?? null }
        }

        return null
    } catch {
        return null
    }
}