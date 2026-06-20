import os from 'os'

export default {
  name: 'uptime',
  command: ['uptime', 'up'],
  desc: '⏳ 𝙎𝙚𝙧𝙫𝙚𝙧 𝙐𝙥𝙩𝙞𝙢𝙚',
  category: 'info',
  cooldown: 3,

  async run({ sock, msg, from, reply }) {
    const sysUptime = os.uptime()
    const d = Math.floor(sysUptime/86400), h = Math.floor((sysUptime%86400)/3600), m = Math.floor((sysUptime%3600)/60)
    const botUptime = process.uptime()
    const bd = Math.floor(botUptime/86400), bh = Math.floor((botUptime%86400)/3600), bm = Math.floor((botUptime%3600)/60)
    reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🖥️ 𝙎𝙚𝙧𝙫𝙚𝙧: ${d}d ${h}h ${m}m\n🤖 𝘽𝙤𝙩: ${bd}d ${bh}h ${bm}m\n🧁 𝙁𝙄𝙕𝘼 𝙞𝙨 𝙖𝙡𝙞𝙫𝙚!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
  }
}