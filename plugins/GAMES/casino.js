import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createHash } from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, '..', '..', 'database', 'casino.json')
const REG_DB = path.join(__dirname, '..', '..', 'database', 'casino_reg.json')

// ── Database ──────────────────────────────────────────────────
function loadDB(file) {
    if (!fs.existsSync(file)) fs.writeFileSync(file, '{}')
    try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return {} }
}
function saveDB(file, data) { fs.writeFileSync(file, JSON.stringify(data, null, 2)) }

// ── Registration System ──────────────────────────────────────
function generateSN(jid) {
    return createHash('md5').update(jid).digest('hex').slice(0, 8).toUpperCase()
}

function isRegistered(jid) {
    const reg = loadDB(REG_DB)
    return !!reg[jid]
}

function register(jid, name) {
    const reg = loadDB(REG_DB)
    if (reg[jid]) return false
    reg[jid] = {
        name: name || jid.split('@')[0],
        sn: generateSN(jid),
        registeredAt: Date.now(),
        refBy: null
    }
    saveDB(REG_DB, reg)
    return reg[jid]
}

// ── Game Constants ───────────────────────────────────────────
const FRUITS = ['🍒','🍋','🍊','🍇','🍓','💎','7️⃣','🌟']
const CARD_VALUES = ['A','2','3','4','5','6','7','8','9','10','J','Q','K']

const LEVELS = [
    { level: 1,  xp: 0,     title: '🟢 𝙉𝙚𝙬𝙗𝙞𝙚',     bonus: 0 },
    { level: 5,  xp: 500,   title: '🔵 𝙋𝙡𝙖𝙮𝙚𝙧',     bonus: 5 },
    { level: 10, xp: 1500,  title: '🟣 𝙋𝙧𝙤',         bonus: 10 },
    { level: 20, xp: 5000,  title: '🟡 𝙑𝙄𝙋',         bonus: 25 },
    { level: 35, xp: 12000, title: '🔴 𝙀𝙡𝙞𝙩𝙚',       bonus: 50 },
    { level: 50, xp: 25000, title: '👑 𝙇𝙚𝙜𝙚𝙣𝙙',     bonus: 100 }
]

const ACHIEVEMENTS = [
    { id: 'first_win',   name: '🌟 𝙁𝙞𝙧𝙨𝙩 𝙒𝙞𝙣',      desc: 'Win your first game',        reward: 100, emoji: '🌟' },
    { id: 'gambler',     name: '🎰 𝙂𝙖𝙢𝙗𝙡𝙚𝙧',         desc: 'Play 50 games',               reward: 250, emoji: '🎰' },
    { id: 'high_roller', name: '💎 𝙃𝙞𝙜𝙝 𝙍𝙤𝙡𝙡𝙚𝙧',  desc: 'Accumulate 10,000 coins',     reward: 500, emoji: '💎' },
    { id: 'jackpot',     name: '👑 𝙅𝙖𝙘𝙠𝙥𝙤𝙩 𝙆𝙞𝙣𝙜',desc: 'Hit a jackpot',               reward: 1000, emoji: '👑' },
    { id: 'bj_master',   name: '🃏 𝘽𝙅 𝙈𝙖𝙨𝙩𝙚𝙧',     desc: 'Win 20 blackjack games',      reward: 300, emoji: '🃏' },
    { id: 'roulette_pro',name: '🎯 𝙍𝙤𝙪𝙡𝙚𝙩𝙩𝙚 𝙋𝙧𝙤', desc: 'Win 15 roulette rounds',       reward: 200, emoji: '🎯' },
    { id: 'millionaire', name: '💰 𝙈𝙞𝙡𝙡𝙞𝙤𝙣𝙖𝙞𝙧𝙚',   desc: 'Earn 100,000 coins total',    reward: 5000, emoji: '💰' },
    { id: 'lucky7',      name: '🍀 𝙇𝙪𝙘𝙠𝙮 7',        desc: 'Roll 777 on slots',           reward: 777, emoji: '🍀' }
]

const SHOP_ITEMS = [
    { id: 'lucky_charm', name: '🍀 𝙇𝙪𝙘𝙠𝙮 𝘾𝙝𝙖𝙧𝙢',     desc: '+5% win chance', price: 500, type: 'buff' },
    { id: 'xp_boost',    name: '⚡ 𝙓𝙋 𝘽𝙤𝙤𝙨𝙩',         desc: '2x XP for 1 hour', price: 300, type: 'boost' },
    { id: 'coin_mult',   name: '💎 𝘾𝙤𝙞𝙣 𝙈𝙪𝙡𝙩𝙞𝙥𝙡𝙞𝙚𝙧', desc: '+25% coin rewards', price: 800, type: 'buff' },
    { id: 'title_color', name: '🎨 𝙏𝙞𝙩𝙡𝙚 𝘾𝙤𝙡𝙤𝙧',      desc: 'Custom name color', price: 1000, type: 'cosmetic' }
]

// ── Helper Functions ─────────────────────────────────────────
function getUser(db, jid) {
    if (!db[jid]) {
        db[jid] = {
            coins: 500,
            bank: 0,
            xp: 0,
            wins: 0,
            losses: 0,
            gamesPlayed: 0,
            achievements: [],
            inventory: [],
            lastDaily: null,
            totalEarned: 0,
            stats: { slots: 0, bj: 0, roulette: 0, jackpots: 0 },
            activeBuffs: {}
        }
    }
    return db[jid]
}

function getLevel(xp) {
    let current = LEVELS[0]
    for (const l of LEVELS) {
        if (xp >= l.xp) current = l
    }
    return current
}

function addXP(db, jid, amount) {
    const user = getUser(db, jid)
    // Check for XP boost
    if (user.activeBuffs?.xp_boost && user.activeBuffs.xp_boost > Date.now()) {
        amount *= 2
    }
    user.xp += amount
}

function checkAchievements(db, jid) {
    const user = getUser(db, jid)
    const newAch = []
    
    for (const ach of ACHIEVEMENTS) {
        if (user.achievements.includes(ach.id)) continue
        
        let earned = false
        if (ach.id === 'first_win' && user.wins >= 1) earned = true
        if (ach.id === 'gambler' && user.gamesPlayed >= 50) earned = true
        if (ach.id === 'high_roller' && user.coins + user.bank >= 10000) earned = true
        if (ach.id === 'jackpot' && user.stats.jackpots >= 1) earned = true
        if (ach.id === 'bj_master' && user.stats.bj >= 20) earned = true
        if (ach.id === 'roulette_pro' && user.stats.roulette >= 15) earned = true
        if (ach.id === 'millionaire' && user.totalEarned >= 100000) earned = true
        
        if (earned) {
            user.achievements.push(ach.id)
            user.coins += ach.reward
            newAch.push(ach)
        }
    }
    return newAch
}

function spinSlots(bet, luckyCharm = false) {
    const winChance = luckyCharm ? 0.35 : 0.3
    const results = []
    
    for (let i = 0; i < 3; i++) {
        if (Math.random() < winChance) {
            // Higher chance of matching
            const pool = ['💎','7️⃣','🍒','🍓','🍊','🍇','🍋','🌟']
            results.push(pool[Math.floor(Math.random() * (luckyCharm ? 4 : 6))])
        } else {
            results.push(FRUITS[Math.floor(Math.random() * FRUITS.length)])
        }
    }
    
    const counts = {}
    results.forEach(f => counts[f] = (counts[f] || 0) + 1)
    const maxCount = Math.max(...Object.values(counts))
    const maxFruit = Object.entries(counts).find(([, c]) => c === maxCount)?.[0]
    
    let win = 0
    let jackpot = false
    
    if (maxCount === 3) {
        if (maxFruit === '💎') { win = bet * 50; jackpot = true }
        else if (maxFruit === '7️⃣') { win = bet * 30; jackpot = true }
        else if (maxFruit === '🌟') { win = bet * 20; jackpot = true }
        else win = bet * 10
    } else if (maxCount === 2 && maxFruit === '💎') win = bet * 5
    else if (maxCount === 2 && maxFruit === '7️⃣') win = bet * 3
    
    return { results, win, jackpot }
}

function playBlackjack() {
    function draw() {
        const val = CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)]
        let num
        if (val === 'A') num = 11
        else if (['K', 'Q', 'J'].includes(val)) num = 10
        else num = parseInt(val)
        return { val, num }
    }
    
    function total(hand) {
        let sum = hand.reduce((a, c) => a + c.num, 0)
        let aces = hand.filter(c => c.val === 'A').length
        while (sum > 21 && aces > 0) { sum -= 10; aces-- }
        return sum
    }
    
    const player = [draw(), draw()]
    const dealer = [draw(), draw()]
    
    while (total(player) < 17) player.push(draw())
    while (total(dealer) < 17) dealer.push(draw())
    
    const pTotal = total(player)
    const dTotal = total(dealer)
    
    let result
    if (pTotal > 21) result = 'bust'
    else if (dTotal > 21 || pTotal > dTotal) result = 'win'
    else if (pTotal === dTotal) result = 'push'
    else result = 'lose'
    
    return { player: player.map(c => c.val), dealer: dealer.map(c => c.val), pTotal, dTotal, result }
}

function playRoulette(bet, choice) {
    const num = Math.floor(Math.random() * 37)
    let win = 0
    let multiplier = 0
    
    const redNums = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]
    const isRed = redNums.includes(num)
    
    if (choice === 'even' && num % 2 === 0 && num !== 0) { win = bet * 2; multiplier = 2 }
    else if (choice === 'odd' && num % 2 === 1) { win = bet * 2; multiplier = 2 }
    else if (choice === 'red' && isRed) { win = bet * 2; multiplier = 2 }
    else if (choice === 'black' && !isRed && num !== 0) { win = bet * 2; multiplier = 2 }
    else if (!isNaN(parseInt(choice)) && parseInt(choice) === num) { win = bet * 36; multiplier = 36 }
    
    return { num, isRed, win, multiplier }
}

// ╔══════════════════════════════════════════════════════════╗
// ║  MAIN PLUGIN                                            ║
// ╚══════════════════════════════════════════════════════════╝

export default {
    name: 'casino',
    command: ['casino', 'gamble', 'game'],
    desc: '🎰 𝙐𝙡𝙩𝙞𝙢𝙖𝙩𝙚 𝘾𝙖𝙨𝙞𝙣𝙤 𝙍𝙤𝙮𝙖𝙡𝙚',
    category: 'games',
    cooldown: 2,

    async run({ sock, msg, from, args, reply, react, sender, prefix }) {
        const regDB = loadDB(REG_DB)
        const db = loadDB(DB_PATH)
        const sub = args[0]?.toLowerCase()
        const userTag = '@' + sender.split('@')[0]

        // ═══════════════════════════════════════════════
        // 📝 REGISTRATION REQUIRED FOR ALL ACTIONS
        // ═══════════════════════════════════════════════
        const needsRegistration = ['profile','me','daily','slots','slot','bj','blackjack','roulette','roul','top','leaderboard','shop','buy','bank','deposit','withdraw','refer']
        
        if (needsRegistration.includes(sub) || !sub) {
            if (!isRegistered(sender)) {
                const name = args.slice(1).join(' ') || sender.split('@')[0]
                if (sub === 'register' || sub === 'reg') {
                    const regData = register(sender, name)
                    return reply(
                        `｡ﾟ•┈୨💖୧┈•ﾟ｡
🎰 *𝙒𝙀𝙇𝘾𝙊𝙈𝙀 𝙏𝙊 𝘾𝘼𝙎𝙄𝙉𝙊 𝙍𝙊𝙔𝘼𝙇𝙀!*

👤 *${regData.name}*
🔑 𝙎𝙉: ${regData.sn}
💰 𝙎𝙩𝙖𝙧𝙩𝙞𝙣𝙜: 🪙500

🎁 𝙐𝙨𝙚 .casino daily 𝙛𝙤𝙧 𝙮𝙤𝙪𝙧 𝙗𝙤𝙣𝙪𝙨!
🧁 𝙂𝙤𝙤𝙙 𝙡𝙪𝙘𝙠~
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
                    )
                }
                
                return reply(
                    `｡ﾟ•┈୨💖୧┈•ﾟ｡
🎰 *𝘾𝘼𝙎𝙄𝙉𝙊 𝙍𝙊𝙔𝘼𝙇𝙀*

🍓 𝙔𝙤𝙪 𝙣𝙚𝙚𝙙 𝙩𝙤 𝙧𝙚𝙜𝙞𝙨𝙩𝙚𝙧!

💝 ${prefix}casino register <name>
🌸 ${prefix}casino register ${sender.split('@')[0]}

🧁 𝙅𝙤𝙞𝙣 𝙩𝙝𝙚 𝙢𝙤𝙨𝙩 𝙚𝙭𝙘𝙡𝙪𝙨𝙞𝙫𝙚 𝙘𝙖𝙨𝙞𝙣𝙤!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
                )
            }
        }

        const user = getUser(db, sender)
        const level = getLevel(user.xp)

        // ═══════════════════════════════════════════════
        // 👤 PROFILE
        // ═══════════════════════════════════════════════
        if (!sub || sub === 'profile' || sub === 'me') {
            const regInfo = regDB[sender]
            const nextLevel = LEVELS.find(l => l.xp > user.xp) || LEVELS[LEVELS.length - 1]
            const xpNeeded = nextLevel.xp - user.xp
            const achList = user.achievements.length > 0
                ? user.achievements.map(a => ACHIEVEMENTS.find(ac => ac.id === a)?.emoji).join(' ')
                : 'None'
            const winRate = user.gamesPlayed > 0 ? ((user.wins / user.gamesPlayed) * 100).toFixed(1) : '0'
            const totalCoins = user.coins + user.bank

            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
🎰 *𝘾𝘼𝙎𝙄𝙉𝙊 𝙍𝙊𝙔𝘼𝙇𝙀*

👤 ${userTag}
🔑 𝙎𝙉: ${regInfo.sn}
🏆 ${level.title} (Lvl ${level.level})
⭐ 𝙓𝙋: ${user.xp} / ${nextLevel.xp} (${xpNeeded} to next)

💰 𝘾𝙖𝙨𝙝: 🪙${user.coins.toLocaleString()}
🏦 𝘽𝙖𝙣𝙠: 🪙${user.bank.toLocaleString()}
💵 𝙏𝙤𝙩𝙖𝙡: 🪙${totalCoins.toLocaleString()}

🎯 𝙒𝙞𝙣𝙨: ${user.wins} | 😢 𝙇𝙤𝙨𝙨𝙚𝙨: ${user.losses}
📊 𝙒𝙞𝙣 𝙍𝙖𝙩𝙚: ${winRate}%
🎮 𝙂𝙖𝙢𝙚𝙨: ${user.gamesPlayed}

🏅 𝘼𝙘𝙝𝙞𝙚𝙫𝙚𝙢𝙚𝙣𝙩𝙨: ${achList}
💎 𝙏𝙤𝙩𝙖𝙡 𝙀𝙖𝙧𝙣𝙚𝙙: 🪙${user.totalEarned.toLocaleString()}

🎰 .casino slots 100
🃏 .casino bj 50
🎯 .casino roulette 50 red
🎁 .casino daily
🛒 .casino shop
🏦 .casino bank

🧁 𝙋𝙡𝙖𝙮 & 𝙀𝙖𝙧𝙣!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`,
                { mentions: [sender] }
            )
        }

        // ═══════════════════════════════════════════════
        // 🎁 DAILY
        // ═══════════════════════════════════════════════
        if (sub === 'daily') {
            const today = new Date().toDateString()
            if (user.lastDaily === today) {
                return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🎁 𝙔𝙤𝙪 𝙖𝙡𝙧𝙚𝙖𝙙𝙮 𝙘𝙡𝙖𝙞𝙢𝙚𝙙 𝙩𝙤𝙙𝙖𝙮!\n⏰ 𝘾𝙤𝙢𝙚 𝙗𝙖𝙘𝙠 𝙞𝙣 24𝙝\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
            }
            const baseBonus = 100
            const levelBonus = level.bonus
            const totalBonus = baseBonus + levelBonus + Math.floor(Math.random() * 100)
            user.coins += totalBonus
            user.lastDaily = today
            saveDB(DB_PATH, db)
            await react('🎁')
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
🎁 *𝘿𝘼𝙄𝙇𝙔 𝘽𝙊𝙉𝙐𝙎!*

💰 𝘽𝙖𝙨𝙚: +🪙${baseBonus}
⭐ 𝙇𝙚𝙫𝙚𝙡 𝘽𝙤𝙣𝙪𝙨: +🪙${levelBonus}
🎲 𝙍𝙖𝙣𝙙𝙤𝙢: +🪙${totalBonus - baseBonus - levelBonus}
💵 𝙏𝙤𝙩𝙖𝙡: +🪙${totalBonus}

💰 𝙉𝙚𝙬 𝘽𝙖𝙡𝙖𝙣𝙘𝙚: 🪙${user.coins.toLocaleString()}
🧁 𝙎𝙚𝙚 𝙮𝙤𝙪 𝙩𝙤𝙢𝙤𝙧𝙧𝙤𝙬!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            )
        }

        // ═══════════════════════════════════════════════
        // 🎰 SLOTS
        // ═══════════════════════════════════════════════
        if (sub === 'slots' || sub === 'slot') {
            const bet = parseInt(args[1]) || 10
            if (bet < 10) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙈𝙞𝙣 𝙗𝙚𝙩: 🪙10\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
            if (bet > user.coins) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙉𝙤𝙩 𝙚𝙣𝙤𝙪𝙜𝙝!\n💰 𝘽𝙖𝙡: 🪙${user.coins}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

            const hasCharm = user.inventory.includes('lucky_charm')
            const { results, win, jackpot } = spinSlots(bet, hasCharm)
            const coinMult = user.inventory.includes('coin_mult') ? 1.25 : 1
            const finalWin = Math.floor(win * coinMult)
            
            user.coins += finalWin - bet
            user.gamesPlayed++
            user.stats.slots++
            if (jackpot) user.stats.jackpots++
            if (finalWin > bet) { user.wins++; user.totalEarned += finalWin }
            else user.losses++
            
            addXP(db, sender, finalWin > bet ? 50 : 10)
            const newAch = checkAchievements(db, sender)
            saveDB(DB_PATH, db)
            
            await react(jackpot ? '🌟' : '🎰')

            let msg = `｡ﾟ•┈୨💖୧┈•ﾟ｡\n🎰 *𝙎𝙇𝙊𝙏𝙎*\n\n`
            msg += `┌──────────┐\n│ ${results[0]} │ ${results[1]} │ ${results[2]} │\n└──────────┘\n\n`
            
            if (jackpot) msg += `🌟 *𝙅𝘼𝘾𝙆𝙋𝙊𝙏!!!* 🌟\n`
            msg += finalWin > bet ? `🎉 𝙔𝙤𝙪 𝙬𝙤𝙣 🪙${finalWin}!\n` : `😢 𝙉𝙤 𝙡𝙪𝙘𝙠...\n`
            msg += `💰 𝘽𝙖𝙡: 🪙${user.coins.toLocaleString()}\n`
            if (coinMult > 1) msg += `💎 𝘾𝙤𝙞𝙣 𝙈𝙪𝙡𝙩𝙞𝙥𝙡𝙞𝙚𝙧 𝘼𝙘𝙩𝙞𝙫𝙚!\n`
            if (hasCharm) msg += `🍀 𝙇𝙪𝙘𝙠𝙮 𝘾𝙝𝙖𝙧𝙢 𝘼𝙘𝙩𝙞𝙫𝙚!\n`
            if (newAch.length > 0) msg += `\n🏅 *𝙉𝙚𝙬 𝘼𝙘𝙝𝙞𝙚𝙫𝙚𝙢𝙚𝙣𝙩!*\n${newAch.map(a => `${a.emoji} ${a.name} (+${a.reward}🪙)`).join('\n')}\n`
            msg += `🧁 .casino slots 50\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            return reply(msg)
        }

        // ═══════════════════════════════════════════════
        // 🃏 BLACKJACK
        // ═══════════════════════════════════════════════
        if (sub === 'bj' || sub === 'blackjack') {
            const bet = parseInt(args[1]) || 10
            if (bet < 10) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙈𝙞𝙣 𝙗𝙚𝙩: 🪙10\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
            if (bet > user.coins) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙉𝙤𝙩 𝙚𝙣𝙤𝙪𝙜𝙝!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

            const { player, dealer, pTotal, dTotal, result } = playBlackjack()
            
            let winAmount = 0
            if (result === 'win') winAmount = bet * 2
            else if (result === 'push') winAmount = bet
            else if (result === 'blackjack') winAmount = Math.floor(bet * 2.5)
            
            user.coins += winAmount - bet
            user.gamesPlayed++
            user.stats.bj++
            if (winAmount > bet) { user.wins++; user.totalEarned += winAmount }
            else user.losses++
            
            addXP(db, sender, winAmount > bet ? 75 : 15)
            const newAch = checkAchievements(db, sender)
            saveDB(DB_PATH, db)
            
            await react('🃏')

            let msg = `｡ﾟ•┈୨💖୧┈•ﾟ｡\n🃏 *𝘽𝙇𝘼𝘾𝙆𝙅𝘼𝘾𝙆*\n\n`
            msg += `👤 𝙔𝙤𝙪 (${pTotal}): ${player.join(' ')}\n`
            msg += `🤖 𝘿𝙚𝙖𝙡𝙚𝙧 (${dTotal}): ${dealer.join(' ')}\n\n`
            
            if (result === 'win') msg += `🎉 *𝙒𝙄𝙉!* +🪙${winAmount}\n`
            else if (result === 'push') msg += `🤝 *𝙋𝙐𝙎𝙃!* +🪙${bet}\n`
            else msg += `😢 *𝙇𝙊𝙎𝙎!*\n`
            
            msg += `💰 𝘽𝙖𝙡: 🪙${user.coins.toLocaleString()}\n`
            if (newAch.length > 0) msg += `\n🏅 *𝙉𝙚𝙬 𝘼𝙘𝙝𝙞𝙚𝙫𝙚𝙢𝙚𝙣𝙩!*\n${newAch.map(a => `${a.emoji} ${a.name}`).join('\n')}\n`
            msg += `🧁 .casino bj 100\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            return reply(msg)
        }

        // ═══════════════════════════════════════════════
        // 🎯 ROULETTE
        // ═══════════════════════════════════════════════
        if (sub === 'roulette' || sub === 'roul') {
            const bet = parseInt(args[1]) || 10
            const choice = args[2]?.toLowerCase()
            
            if (!choice) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🎯 .casino roulette 50 red\n💝 Options: red/black/even/odd/0-36\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
            if (bet < 10) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙈𝙞𝙣 𝙗𝙚𝙩: 🪙10\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
            if (bet > user.coins) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙉𝙤𝙩 𝙚𝙣𝙤𝙪𝙜𝙝!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

            const { num, isRed, win, multiplier } = playRoulette(bet, choice)
            
            user.coins += win - bet
            user.gamesPlayed++
            user.stats.roulette++
            if (win > bet) { user.wins++; user.totalEarned += win }
            else user.losses++
            
            addXP(db, sender, win > bet ? 100 : 10)
            const newAch = checkAchievements(db, sender)
            saveDB(DB_PATH, db)
            
            const color = num === 0 ? '🟢' : isRed ? '🔴' : '⚫'
            await react('🎯')

            let msg = `｡ﾟ•┈୨💖୧┈•ﾟ｡\n🎯 *𝙍𝙊𝙐𝙇𝙀𝙏𝙏𝙀*\n\n`
            msg += `🎡 𝙎𝙥𝙞𝙣: ${color} *${num}*\n`
            msg += `🎯 𝙔𝙤𝙪𝙧 𝙥𝙞𝙘𝙠: ${choice}\n\n`
            
            if (win > 0) {
                msg += `🎉 *𝙒𝙄𝙉!* +🪙${win}\n📈 ${multiplier}x 𝙥𝙖𝙮𝙤𝙪𝙩!\n`
            } else {
                msg += `😢 𝙉𝙤 𝙡𝙪𝙘𝙠...\n`
            }
            
            msg += `💰 𝘽𝙖𝙡: 🪙${user.coins.toLocaleString()}\n`
            msg += `🧁 .casino roulette 50 even\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            return reply(msg)
        }

        // ═══════════════════════════════════════════════
        // 📊 LEADERBOARD
        // ═══════════════════════════════════════════════
        if (sub === 'top' || sub === 'leaderboard') {
            const sorted = Object.entries(db)
                .sort(([, a], [, b]) => (b.coins + b.bank) - (a.coins + a.bank))
                .slice(0, 10)
            
            if (sorted.length === 0) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n📊 𝙉𝙤 𝙥𝙡𝙖𝙮𝙚𝙧𝙨 𝙮𝙚𝙩!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
            
            const medals = ['🥇','🥈','🥉','4','5','6','7','8','9','10']
            const board = sorted.map(([jid, data], i) => {
                const lvl = getLevel(data.xp)
                return `${medals[i]} @${jid.split('@')[0]}: 🪙${(data.coins + data.bank).toLocaleString()} | ${lvl.title}`
            }).join('\n')

            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡\n🏆 *𝙇𝙀𝘼𝘿𝙀𝙍𝘽𝙊𝘼𝙍𝘿*\n\n${board}\n🧁 𝙋𝙡𝙖𝙮 𝙩𝙤 𝙘𝙡𝙞𝙢𝙗!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`,
                { mentions: sorted.map(s => s[0]) }
            )
        }

        // ═══════════════════════════════════════════════
        // 🛒 SHOP
        // ═══════════════════════════════════════════════
        if (sub === 'shop') {
            const items = SHOP_ITEMS.map(item => 
                `${item.id === 'lucky_charm' ? '🍀' : item.id === 'xp_boost' ? '⚡' : item.id === 'coin_mult' ? '💎' : '🎨'} *${item.name}* — 🪙${item.price}\n  ${item.desc}`
            ).join('\n\n')

            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
🛒 *𝙎𝙃𝙊𝙋*

${items}

💝 .casino buy <item>

🧁 𝙐𝙥𝙜𝙧𝙖𝙙𝙚 𝙮𝙤𝙪𝙧 𝙜𝙖𝙢𝙚!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            )
        }

        // ═══════════════════════════════════════════════
        // 💰 BUY
        // ═══════════════════════════════════════════════
        if (sub === 'buy') {
            const itemId = args[1]
            const item = SHOP_ITEMS.find(i => i.id === itemId)
            if (!item) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙄𝙩𝙚𝙢 𝙣𝙤𝙩 𝙛𝙤𝙪𝙣𝙙\n🛒 .casino shop\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
            if (user.coins < item.price) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙉𝙤𝙩 𝙚𝙣𝙤𝙪𝙜𝙝 𝙘𝙤𝙞𝙣𝙨!\n💰 𝙉𝙚𝙚𝙙: 🪙${item.price}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
            if (user.inventory.includes(itemId)) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝘼𝙡𝙧𝙚𝙖𝙙𝙮 𝙤𝙬𝙣𝙚𝙙!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

            user.coins -= item.price
            user.inventory.push(itemId)
            saveDB(DB_PATH, db)
            await react('🛒')
            return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n✅ 𝙋𝙪𝙧𝙘𝙝𝙖𝙨𝙚𝙙 *${item.name}*!\n💰 𝙍𝙚𝙢𝙖𝙞𝙣𝙞𝙣𝙜: 🪙${user.coins.toLocaleString()}\n🧁 𝙀𝙦𝙪𝙞𝙥𝙥𝙚𝙙 𝙛𝙤𝙧 𝙨𝙪𝙘𝙘𝙚𝙨𝙨!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
        }

        // ═══════════════════════════════════════════════
        // 🏦 BANK
        // ═══════════════════════════════════════════════
        if (sub === 'bank') {
            const action = args[1]?.toLowerCase()
            const amount = parseInt(args[2])
            
            if (action === 'deposit') {
                if (!amount || amount < 100) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙈𝙞𝙣 𝙙𝙚𝙥𝙤𝙨𝙞𝙩: 🪙100\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
                if (amount > user.coins) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙉𝙤𝙩 𝙚𝙣𝙤𝙪𝙜𝙝 𝙘𝙖𝙨𝙝!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
                user.coins -= amount
                user.bank += amount
                saveDB(DB_PATH, db)
                return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🏦 𝘿𝙚𝙥𝙤𝙨𝙞𝙩𝙚𝙙 🪙${amount}\n💰 𝘾𝙖𝙨𝙝: 🪙${user.coins}\n🏦 𝘽𝙖𝙣𝙠: 🪙${user.bank}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
            }
            
            if (action === 'withdraw') {
                if (!amount || amount < 100) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙈𝙞𝙣 𝙬𝙞𝙩𝙝𝙙𝙧𝙖𝙬: 🪙100\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
                if (amount > user.bank) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙉𝙤𝙩 𝙚𝙣𝙤𝙪𝙜𝙝 𝙞𝙣 𝙗𝙖𝙣𝙠!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
                user.bank -= amount
                user.coins += amount
                saveDB(DB_PATH, db)
                return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🏦 𝙒𝙞𝙩𝙝𝙙𝙧𝙚𝙬 🪙${amount}\n💰 𝘾𝙖𝙨𝙝: 🪙${user.coins}\n🏦 𝘽𝙖𝙣𝙠: 🪙${user.bank}\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
            }
            
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
🏦 *𝘽𝘼𝙉𝙆*

💰 𝘾𝙖𝙨𝙝: 🪙${user.coins.toLocaleString()}
🏦 𝘽𝙖𝙣𝙠: 🪙${user.bank.toLocaleString()}

💝 .casino bank deposit 100
💝 .casino bank withdraw 100

🧁 𝙎𝙖𝙛𝙚 & 𝙎𝙤𝙪𝙣𝙙!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            )
        }

        // ═══════════════════════════════════════════════
        // 🎮 HELP
        // ═══════════════════════════════════════════════
        return reply(
            `｡ﾟ•┈୨💖୧┈•ﾟ｡
🎰 *𝘾𝘼𝙎𝙄𝙉𝙊 𝙍𝙊𝙔𝘼𝙇𝙀*

🎰 .casino slots <bet>
🃏 .casino bj <bet>
🎯 .casino roulette <bet> <choice>
🎁 .casino daily
👤 .casino profile
📊 .casino top
🛒 .casino shop
🏦 .casino bank

🧁 𝙍𝙚𝙜𝙞𝙨𝙩𝙚𝙧, 𝙋𝙡𝙖𝙮, 𝙀𝙖𝙧𝙣 & 𝘿𝙤𝙢𝙞𝙣𝙖𝙩𝙚!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
        )
    }
}