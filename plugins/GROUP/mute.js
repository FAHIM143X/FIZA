export default {
  name: 'mute',
  command: ['mute', 'unmute'],
  desc: '🔇 𝙈𝙪𝙩𝙚 / 𝙐𝙣𝙢𝙪𝙩𝙚 𝙩𝙝𝙚 𝙜𝙧𝙤𝙪𝙥',
  category: 'group',
  isGroup: true,
  isAdmin: true,
  botAdmin: true,

  async run({ sock, msg, from, args, reply }) {
    const action = args[0]?.toLowerCase()
    if (action === 'on' || action === 'mute') {
      await sock.groupSettingUpdate(from, 'announcement')
      return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🔇 𝙂𝙧𝙤𝙪𝙥 𝙢𝙪𝙩𝙚𝙙 — 𝙤𝙣𝙡𝙮 𝙖𝙙𝙢𝙞𝙣𝙨 𝙘𝙖𝙣 𝙨𝙚𝙣𝙙 𝙢𝙚𝙨𝙨𝙖𝙜𝙚𝙨\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    } else if (action === 'off' || action === 'unmute') {
      await sock.groupSettingUpdate(from, 'not_announcement')
      return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🔊 𝙂𝙧𝙤𝙪𝙥 𝙪𝙣𝙢𝙪𝙩𝙚𝙙 — 𝙖𝙡𝙡 𝙢𝙚𝙢𝙗𝙚𝙧𝙨 𝙘𝙖𝙣 𝙨𝙚𝙣𝙙 𝙢𝙚𝙨𝙨𝙖𝙜𝙚𝙨\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    } else {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n📌 .mute on / .mute off\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}