import axios from 'axios'

export default {
  name: 'qr',
  command: ['qr', 'qrcode'],
  desc: '📱 𝙂𝙚𝙣𝙚𝙧𝙖𝙩𝙚 𝙌𝙍 𝙘𝙤𝙙𝙚',
  category: 'tools',
  cooldown: 5,

  async run({ sock, msg, from, args, reply }) {
    const text = args.join(' ')
    if (!text) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n📱 .qr <text/url>\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(text)}`
    await sock.sendMessage(from, {
      image: { url },
      caption: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n📱 *𝙌𝙍 𝙂𝙚𝙣𝙚𝙧𝙖𝙩𝙚𝙙*\n🔗 ${text.slice(0,50)}...\n🧁 𝙎𝙘𝙖𝙣 𝙢𝙚~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
    }, { quoted: msg })
  }
}