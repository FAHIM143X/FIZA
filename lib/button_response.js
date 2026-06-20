// ╔══════════════════════════════════════════════════════════════╗
// ║     🔘  BUTTON RESPONSE HANDLER  —  Tap → Command           ║
// ║   Converts button clicks into synthetic command messages    ║
// ╚══════════════════════════════════════════════════════════════╝

/**
 * Extract button response from raw message
 * @param {object} msg - Raw Baileys message
 * @returns {object|null} { id, text, type } or null
 */
export function extractButtonResponse(msg) {
    try {
        const m = msg.message || msg

        // Native Flow Response (v7+)
        const nfr = m?.interactiveResponseMessage?.nativeFlowResponseMessage
        if (nfr?.paramsJson) {
            const parsed = JSON.parse(nfr.paramsJson)
            return {
                id: parsed.id || null,
                text: parsed.display_text || m.interactiveResponseMessage?.body?.text || null,
                type: 'native_flow'
            }
        }

        // Template Button Reply
        const tbr = m?.templateButtonReplyMessage
        if (tbr?.selectedId) {
            return {
                id: tbr.selectedId,
                text: tbr.selectedDisplayText || null,
                type: 'template_button'
            }
        }

        // Legacy Buttons Response
        const brm = m?.buttonsResponseMessage
        if (brm?.selectedButtonId) {
            return {
                id: brm.selectedButtonId,
                text: brm.selectedDisplayText || null,
                type: 'legacy_button'
            }
        }

        // List Response
        const lrm = m?.listResponseMessage
        if (lrm?.singleSelectReply?.selectedRowId) {
            return {
                id: lrm.singleSelectReply.selectedRowId,
                text: lrm.title || lrm.singleSelectReply?.description || null,
                type: 'list'
            }
        }

        return null
    } catch {
        return null
    }
}

/**
 * Check if a button ID matches a plugin command
 * @param {string} buttonId - The button ID
 * @param {Map} plugins - Plugins map
 * @param {string|array} prefix - Bot prefix(es)
 * @returns {object|null} { plugin, command, prefix } or null
 */
export function matchButtonToCommand(buttonId, plugins, prefix = '.') {
    if (!buttonId) return null

    const prefixes = Array.isArray(prefix) ? prefix : [prefix]

    for (const [name, plugin] of plugins) {
        const cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command]
        const pluginPrefix = plugin.customPrefix || ''

        for (const cmd of cmds) {
            if (!cmd) continue

            // Check exact match
            if (buttonId === cmd) {
                return { plugin, command: cmd, prefix: prefixes[0] }
            }

            // Check with prefixes
            for (const p of prefixes) {
                if (buttonId === p + cmd) {
                    return { plugin, command: p + cmd, prefix: p }
                }
            }

            // Check with plugin custom prefix
            if (pluginPrefix && buttonId === pluginPrefix + cmd) {
                return { plugin, command: pluginPrefix + cmd, prefix: pluginPrefix }
            }
        }
    }

    return null
}

/**
 * Create a synthetic message from a button tap
 * @param {object} msg - Original message
 * @param {string} command - Full command string (e.g., ".menu")
 * @param {object} buttonInfo - { id, text, type }
 * @returns {object} Synthetic message object
 */
export function createSyntheticMessage(msg, command, buttonInfo = {}) {
    const sender = msg.key?.participant || msg.key?.remoteJid
    const chatId = msg.key?.remoteJid

    return {
        key: {
            remoteJid: chatId,
            fromMe: false,
            id: msg.key?.id || '',
            participant: sender,
        },
        message: {
            extendedTextMessage: {
                text: command,
            },
        },
        // Metadata for plugins
        _buttonInfo: {
            originalId: buttonInfo.id,
            originalText: buttonInfo.text,
            buttonType: buttonInfo.type,
            isButtonResponse: true,
        },
        // Preserve original sender
        sender: sender,
        chat: chatId,
        isButtonResponse: true,
    }
}

/**
 * Process a button tap as a command
 * This creates a synthetic message and emits it as messages.upsert
 * 
 * @param {object} sock - Baileys socket
 * @param {object} msg - Original button message
 * @param {object} buttonInfo - Extracted button info
 * @param {Map} plugins - Plugins map
 * @param {string|array} prefix - Bot prefix
 * @returns {boolean} true if handled, false if no match
 */
export function handleButtonAsCommand(sock, msg, buttonInfo, plugins, prefix = '.') {
    const match = matchButtonToCommand(buttonInfo.id, plugins, prefix)

    if (!match) return false

    const synthetic = createSyntheticMessage(msg, match.command, buttonInfo)

    // Emit as if user typed the command
    sock.ev.emit('messages.upsert', {
        messages: [synthetic],
        type: 'notify'
    })

    console.log(`[BTN→CMD] ${buttonInfo.id} → ${match.command} | ${msg.key?.participant?.split('@')[0] || '?'}`)
    return true
}