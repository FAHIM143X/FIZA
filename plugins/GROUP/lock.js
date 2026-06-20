export default {
  name: 'lock',
  command: ['lock', 'unlock'],
  desc: '🔒 𝙇𝙤𝙘𝙠 / 𝙐𝙣𝙡𝙤𝙘𝙠 𝙜𝙧𝙤𝙪𝙥 𝙨𝙚𝙩𝙩𝙞𝙣𝙜𝙨',
  category: 'group',
  isGroup: true,
  isAdmin: true,
  botAdmin: true,

  async run({ sock, msg, from, args, reply }) {
    const action = args[0]?.toLowerCase()
    if (action === 'lock') {
      await sock.groupSettingUpdate(from, 'locked')
      return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🔒 𝙂𝙧𝙤𝙪𝙥 𝙡𝙤𝙘𝙠𝙚𝙙 — 𝙤𝙣𝙡𝙮 𝙖𝙙𝙢𝙞𝙣𝙨 𝙘𝙖𝙣 𝙘𝙝𝙖𝙣𝙜𝙚 𝙞𝙣𝙛𝙤\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    } else if (action === 'unlock') {
      await sock.groupSettingUpdate(from, 'unlocked')
      return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🔓 𝙂𝙧𝙤𝙪𝙥 𝙪𝙣𝙡𝙤𝙘𝙠𝙚𝙙\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    } else {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n📌 .lock / .unlock\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}