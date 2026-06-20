// lib/msglogger.js
import chalk from 'chalk'

export function logMessage(msg, serialized) {
    const s = serialized
    if (!s) return

    const time = chalk.hex('#FFB6C1')(`[${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}]`)
    const sender = chalk.hex('#FF69B4')(s.sender?.split('@')[0] || '?')
    const chat = s.isGroup 
        ? chalk.hex('#FF1493')(`🌸 ${s.remoteJid?.split('@')[0]}`) 
        : chalk.hex('#FFB6C1')('💌 PM')

    // Message type detection with FIZA colors
    let type, content = s.body || ''

    if (msg.message?.imageMessage) {
        type = chalk.hex('#FF69B4')('📷 IMG')
        content = msg.message.imageMessage.caption || chalk.italic.gray('[Image]')
    } else if (msg.message?.videoMessage) {
        type = chalk.hex('#FF1493')('🎬 VID')
        content = msg.message.videoMessage.caption || chalk.italic.gray('[Video]')
    } else if (msg.message?.audioMessage) {
        type = chalk.hex('#DB7093')('🎵 AUD')
        content = msg.message.audioMessage.ptt ? chalk.italic.gray('[Voice Note]') : chalk.italic.gray('[Audio]')
    } else if (msg.message?.stickerMessage) {
        type = chalk.hex('#FFB6C1')('🌟 STK')
        content = chalk.italic.gray('[Sticker]')
    } else if (msg.message?.documentMessage) {
        type = chalk.hex('#FFC0CB')('📄 DOC')
        content = msg.message.documentMessage.fileName || chalk.italic.gray('[Document]')
    } else if (msg.message?.contactMessage) {
        type = chalk.hex('#FF69B4')('👤 CTC')
        content = chalk.italic.gray('[Contact]')
    } else if (msg.message?.locationMessage) {
        type = chalk.hex('#FF1493')('📍 LOC')
        content = chalk.italic.gray('[Location]')
    } else if (msg.message?.reactionMessage) {
        type = chalk.hex('#FFB6C1')('💬 RCT')
        content = msg.message.reactionMessage.text || chalk.italic.gray('[Reaction]')
    } else if (msg.message?.protocolMessage) {
        type = chalk.hex('#FF69B4')('🗑️ DEL')
        content = chalk.italic.gray('[Deleted]')
    } else if (s.body?.startsWith('.')) {
        type = chalk.hex('#FF1493')('⚡ CMD')
    } else {
        type = chalk.hex('#FFB6C1')('💬 TXT')
    }

    // Truncate
    if (content.length > 40) content = content.slice(0, 37) + '...'

    // Main log line
    console.log(
        `｡ﾟ•┈${time}┈•ﾟ｡`,
        chat,
        type,
        sender,
        chalk.hex('#FFC0CB')('→'),
        chalk.white(content)
    )

    // Command detail
    if (s.body?.startsWith('.')) {
        const cmd = s.body.split(' ')[0].slice(1)
        console.log(
            chalk.hex('#FFB6C1')('       ╰┈') +
            chalk.hex('#FF69B4')(` .${cmd}`) +
            chalk.hex('#FFB6C1')(' ┈╯')
        )
    }

    // Media size
    const media = msg.message?.imageMessage || msg.message?.videoMessage || msg.message?.audioMessage
    if (media?.fileLength) {
        const sizeKB = (media.fileLength / 1024).toFixed(1)
        console.log(
            chalk.hex('#FFC0CB')(`       ╰┈ 📦 ${sizeKB} KB ┈╯`)
        )
    }
}

// Bot startup banner
export function showBanner(botName = 'FIZA') {
    console.log(chalk.hex('#FF1493')(`
  ╔══════════════════════════════════════╗
  ║                                      ║
  ║   ｡ﾟ•┈୨💖୧┈•ﾟ｡                     ║
  ║                                      ║`))
    console.log(chalk.hex('#FF69B4')(`  ║      🌸  ${botName}  IS  ONLINE  🌸        ║`))
    console.log(chalk.hex('#FF1493')(`  ║                                      ║
  ║   ｡ﾟ•┈୨🌸୧┈•ﾟ｡                     ║
  ║                                      ║
  ╚══════════════════════════════════════╝
`))
    console.log(chalk.hex('#FFB6C1')('  🧁 Terminal Logger Active...\n'))
}

// Connection status
export function logConnection(status) {
    const icons = {
        connecting: '🔄', open: '✅', close: '❌'
    }
    const colors = {
        connecting: '#FFB6C1', open: '#FF69B4', close: '#FF1493'
    }
    console.log(
        chalk.hex(colors[status] || '#FFB6C1')(
            `  ${icons[status] || '•'} ${status.toUpperCase()}`
        )
    )
}

// Plugin loaded
export function logPlugin(name, category) {
    console.log(
        chalk.hex('#FFB6C1')('  📂 ') +
        chalk.hex('#FF69B4')(category) +
        chalk.hex('#FFB6C1')(' / ') +
        chalk.hex('#FF1493')(name) +
        chalk.hex('#FFC0CB')(' ✓')
    )
}

export default { logMessage, showBanner, logConnection, logPlugin }