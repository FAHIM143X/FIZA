import axios from 'axios'

export default {
  name: 'randomuser',
  command: ['randomuser', 'fakeuser'],
  desc: '👤 𝙂𝙚𝙣𝙚𝙧𝙖𝙩𝙚 𝙛𝙖𝙠𝙚 𝙪𝙨𝙚𝙧',
  category: 'tools',
  cooldown: 4,

  async run({ sock, msg, from, reply }) {
    try {
      const { data } = await axios.get('https://randomuser.me/api/', { timeout: 8000 })
      const user = data.results[0]
      const info = {
        '👤 𝙽𝚊𝚖𝚎': `${user.name.first} ${user.name.last}`,
        '📍 𝙻𝚘𝚌𝚊𝚝𝚒𝚘𝚗': `${user.location.city}, ${user.location.country}`,
        '📧 𝙴𝚖𝚊𝚒𝚕': user.email,
        '📞 𝙿𝚑𝚘𝚗𝚎': user.phone,
        '🎂 𝙰𝚐𝚎': user.dob.age
      }
      const txt = Object.entries(info).map(([k,v]) => `${k}: ${v}`).join('\n')
      await sock.sendMessage(from, {
        image: { url: user.picture.large },
        caption: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n${txt}\n🧁 𝙁𝙖𝙠𝙚 𝙗𝙪𝙩 𝙘𝙤𝙤𝙡~\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
      }, { quoted: msg })
    } catch {
      reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙁𝙖𝙞𝙡𝙚𝙙\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
    }
  }
}