import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import axios from 'axios'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB = path.join(__dirname, '..', '..', 'database', 'wordbuilder.json')

function load() { try { return JSON.parse(fs.readFileSync(DB, 'utf8')) } catch { return {} } }
function save(d) { fs.writeFileSync(DB, JSON.stringify(d, null, 2)) }

// Word banks
const WORD_BANK = {
    3: ['cat','dog','car','hat','run','sun','cup','bed','pen','map','bus','egg','fox','ice','jam','key','log','net','owl','pig','red','sit','top','van','win','yes','zip','arm','bat','cow','sky','fly','dry'],
    4: ['fish','bird','tree','book','moon','star','cake','door','fire','game','hand','king','lamp','milk','nose','park','rain','snow','time','wave','wind','yard','zone','ball','cold','dark','east','fast','gold','hair','love'],
    5: ['apple','beach','brain','chair','dance','eagle','flame','grape','heart','house','juice','knife','lemon','magic','night','ocean','piano','queen','river','stone','table','unity','voice','water','world','young','zebra','angel','black','cloud'],
    6: ['banana','bridge','castle','desert','forest','garden','heaven','island','jungle','kitten','laptop','market','nature','orange','planet','rabbit','school','temple','winter','summer','spring','autumn','cheese','dragon','energy','flower'],
    7: ['chicken','diamond','eclipse','freedom','giraffe','hamster','jackpot','kitchen','lantern','monster','network','octopus','penguin','quarter','rainbow','soldier','thunder','uniform','village','whisper','battery','cabinet','dolphin'],
    8: ['airplane','birthday','champion','dinosaur','elephant','football','homework','icecream','jellyfish','kingfish','language','mountain','necklace','painting','question','reindeer','triangle','umbrella','vacation','wildlife','backpack'],
    9: ['adventure','butterfly','chocolate','discovery','education','fireworks','graceful','happiness','incredible','knowledge','landscape','milkshake','operation','pineapple','raspberry','strawberry','technique','universal','wonderland','beautiful'],
    10: ['absolutely','basketball','collection','dictionary','everything','friendship','government','historical','impossible','leadership','meditation','navigation','occupation','photograph','suggestion','technology','understand','volleyball','watermelon']
}

// Sentence templates for higher levels
const SENTENCE_TEMPLATES = [
    { prompt: 'A *_____* ran across the field', length: 3, hint: 'animal' },
    { prompt: 'The *_____* shines bright today', length: 3, hint: 'sky' },
    { prompt: 'I love to eat *_____* for breakfast', length: 3, hint: 'food' },
    { prompt: 'The *_____* is very beautiful', length: 4, hint: 'nature' },
    { prompt: 'My favorite *_____* is on the table', length: 4, hint: 'object' },
    { prompt: 'She bought a new *_____* yesterday', length: 4, hint: 'item' },
    { prompt: 'The *_____* was absolutely delicious', length: 4, hint: 'food' },
    { prompt: 'We went to the *_____* last weekend', length: 5, hint: 'place' },
    { prompt: 'The *_____* in the garden is blooming', length: 6, hint: 'plant' },
    { prompt: 'She is the most *_____* person I know', length: 8, hint: 'adjective' },
    { prompt: 'The *_____* was an amazing experience', length: 9, hint: 'event' },
    { prompt: 'Their *_____* has lasted for many years', length: 10, hint: 'relationship' }
]

const LOBBY_TIME = 30000
const TURN_TIME = 12000  // 12 seconds per turn
const MAX_FAILS = 2       // Fails before skip
const TOTAL_ROUNDS = 5
const POINTS_CORRECT = 15
const POINTS_BONUS_SPEED = 10
const POINTS_BONUS_EXACT = 25

const games = new Map()

// ═══════════════════════════════════════════════════════════
// API WORD VALIDATION
// ═══════════════════════════════════════════════════════════
async function isValidWordAPI(word) {
    try {
        const { data } = await axios.get(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
            { timeout: 3000 }
        )
        return data && data.length > 0
    } catch {
        return false
    }
}

// ═══════════════════════════════════════════════════════════
// LOCAL WORD BANK CHECK
// ═══════════════════════════════════════════════════════════
function isInWordBank(word) {
    for (const words of Object.values(WORD_BANK)) {
        if (words.includes(word.toLowerCase())) return true
    }
    return false
}

// ═══════════════════════════════════════════════════════════
// GENERATE CHALLENGE
// ═══════════════════════════════════════════════════════════
function generateChallenge(roundNum) {
    // Progressive difficulty
    if (roundNum >= 4 && Math.random() < 0.5) {
        // Sentence mode for later rounds
        const template = SENTENCE_TEMPLATES[Math.floor(Math.random() * SENTENCE_TEMPLATES.length)]
        const words = WORD_BANK[template.length]
        if (words) {
            const word = words[Math.floor(Math.random() * words.length)]
            return {
                type: 'sentence',
                prompt: template.prompt,
                answer: word,
                length: template.length,
                hint: template.hint,
                letters: [...new Set(word.split(''))].sort(() => Math.random() - 0.5).slice(0, Math.min(4, word.length))
            }
        }
    }

    // Word mode
    const lengths = roundNum <= 1 ? [3] : 
                   roundNum <= 2 ? [3, 4] :
                   roundNum <= 3 ? [4, 5] :
                   roundNum <= 4 ? [5, 6] :
                   [6, 7, 8]

    const length = lengths[Math.floor(Math.random() * lengths.length)]
    const words = WORD_BANK[length] || WORD_BANK[4]
    const word = words[Math.floor(Math.random() * words.length)]
    const uniqueLetters = [...new Set(word.split(''))]
    const letters = uniqueLetters.sort(() => Math.random() - 0.5).slice(0, Math.min(Math.floor(length * 0.6), 5))

    return {
        type: 'word',
        prompt: null,
        answer: word,
        length,
        letters,
        hint: `starts with "${word[0].toUpperCase()}"`
    }
}

// ═══════════════════════════════════════════════════════════
// START NEXT TURN
// ═══════════════════════════════════════════════════════════
async function startNextTurn(chat, sock) {
    const game = games.get(chat)
    if (!game || game.state !== 'playing') return

    // Move to next player
    game.currentPlayerIndex++
    if (game.currentPlayerIndex >= game.playerOrder.length) {
        // All players had their turn → next round
        game.currentRound++
        game.currentPlayerIndex = 0

        if (game.currentRound >= TOTAL_ROUNDS) {
            await endGame(chat, sock)
            return
        }

        // Reset fails for new round
        game.playerFails = {}
        game.playerOrder.forEach(jid => { game.playerFails[jid] = 0 })

        // New challenge
        game.currentChallenge = generateChallenge(game.currentRound)
        game.challengeStartedAt = Date.now()
        game.challengeAnswered = false

        // Announce new round
        await announceRound(chat, sock)
        await new Promise(r => setTimeout(r, 2000))
    }

    // Get current player
    const currentPlayer = game.playerOrder[game.currentPlayerIndex]
    if (!currentPlayer) {
        await startNextTurn(chat, sock)
        return
    }

    // Skip players who maxed out fails
    if ((game.playerFails[currentPlayer] || 0) >= MAX_FAILS) {
        await sock.sendMessage(chat, {
            text: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n⏭️ @${currentPlayer.split('@')[0]} 𝙨𝙠𝙞𝙥𝙥𝙚𝙙 (${MAX_FAILS} 𝙛𝙖𝙞𝙡𝙨)!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`,
            mentions: [currentPlayer]
        }).catch(() => {})
        await new Promise(r => setTimeout(r, 1500))
        await startNextTurn(chat, sock)
        return
    }

    // Set current player
    game.currentPlayer = currentPlayer
    game.turnStartedAt = Date.now()

    // Clear old timer
    if (game.turnTimer) clearTimeout(game.turnTimer)

    // Set turn timer
    game.turnTimer = setTimeout(async () => {
        const g = games.get(chat)
        if (!g || g.currentPlayer !== currentPlayer) return

        // Auto-fail on timeout
        g.playerFails[currentPlayer] = (g.playerFails[currentPlayer] || 0) + 1
        const playerData = g.players.get(currentPlayer)
        if (playerData) playerData.streak = 0

        await sock.sendMessage(chat, {
            text: `｡ﾟ•┈୨💖୧┈•ﾟ｡
⏰ @${currentPlayer.split('@')[0]} 𝙩𝙞𝙢𝙚𝙙 𝙤𝙪𝙩!
❌ 𝙁𝙖𝙞𝙡𝙨: ${g.playerFails[currentPlayer]}/${MAX_FAILS}
💡 𝘼𝙣𝙨𝙬𝙚𝙧: *${g.currentChallenge.answer.toUpperCase()}*
｡ﾟ•┈୨🌸୧┈•ﾟ｡`,
            mentions: [currentPlayer]
        }).catch(() => {})

        await new Promise(r => setTimeout(r, 2000))
        await startNextTurn(chat, sock)
    }, TURN_TIME)

    // Announce whose turn
    const isNewRound = game.currentPlayerIndex === 0
    if (isNewRound && game.currentRound > 0) {
        // Already announced in announceRound
    } else {
        await announceTurn(chat, sock, currentPlayer)
    }
}

// ═══════════════════════════════════════════════════════════
// ANNOUNCE NEW ROUND
// ═══════════════════════════════════════════════════════════
async function announceRound(chat, sock) {
    const game = games.get(chat)
    if (!game) return

    const challenge = game.currentChallenge

    if (challenge.type === 'sentence') {
        await sock.sendMessage(chat, {
            text: `｡ﾟ•┈୨💖୧┈•ﾟ｡
🔄 *𝙍𝙊𝙐𝙉𝘿 ${game.currentRound + 1}/${TOTAL_ROUNDS}*

📝 *𝙁𝙞𝙡𝙡 𝙩𝙝𝙚 𝙗𝙡𝙖𝙣𝙠:*
"${challenge.prompt}"

📏 *${challenge.length}* 𝙡𝙚𝙩𝙩𝙚𝙧𝙨
💡 𝙃𝙞𝙣𝙩: ${challenge.hint}

👥 𝙋𝙡𝙖𝙮𝙚𝙧𝙨 𝙩𝙖𝙠𝙚 𝙩𝙪𝙧𝙣𝙨!
⏱️ ${TURN_TIME/1000}s 𝙥𝙚𝙧 𝙩𝙪𝙧𝙣
❌ ${MAX_FAILS} 𝙛𝙖𝙞𝙡𝙨 = 𝙎𝙠𝙞𝙥

🧁 𝙇𝙚𝙩'𝙨 𝙜𝙤!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
        }).catch(() => {})
    } else {
        await sock.sendMessage(chat, {
            text: `｡ﾟ•┈୨💖୧┈•ﾟ｡
🔄 *𝙍𝙊𝙐𝙉𝘿 ${game.currentRound + 1}/${TOTAL_ROUNDS}*

📏 𝙈𝙖𝙠𝙚 𝙖 *${challenge.length}* 𝙡𝙚𝙩𝙩𝙚𝙧 𝙬𝙤𝙧𝙙
🔠 𝙐𝙨𝙞𝙣𝙜: *${challenge.letters.map(l => l.toUpperCase()).join(', ')}*
💡 𝙃𝙞𝙣𝙩: ${challenge.hint}

👥 𝙋𝙡𝙖𝙮𝙚𝙧𝙨 𝙩𝙖𝙠𝙚 𝙩𝙪𝙧𝙣𝙨!
⏱️ ${TURN_TIME/1000}s 𝙥𝙚𝙧 𝙩𝙪𝙧𝙣
❌ ${MAX_FAILS} 𝙛𝙖𝙞𝙡𝙨 = 𝙎𝙠𝙞𝙥

🧁 𝙒𝙝𝙤 𝙬𝙞𝙡𝙡 𝙜𝙪𝙚𝙨𝙨 𝙛𝙞𝙧𝙨𝙩?
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
        }).catch(() => {})
    }
}

// ═══════════════════════════════════════════════════════════
// ANNOUNCE TURN
// ═══════════════════════════════════════════════════════════
async function announceTurn(chat, sock, playerJid) {
    const game = games.get(chat)
    if (!game) return

    const challenge = game.currentChallenge
    const fails = game.playerFails[playerJid] || 0
    const playerData = game.players.get(playerJid)
    const score = playerData?.score || 0

    await sock.sendMessage(chat, {
        text: `｡ﾟ•┈୨💖୧┈•ﾟ｡
🎯 @${playerJid.split('@')[0]}'𝙨 𝙏𝙐𝙍𝙉!

💰 𝙎𝙘𝙤𝙧𝙚: ${score} | ❌ 𝙁𝙖𝙞𝙡𝙨: ${fails}/${MAX_FAILS}
⏱️ ${TURN_TIME/1000}s

💝 .wb <your answer>
🧁 𝙂𝙤!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`,
        mentions: [playerJid]
    }).catch(() => {})
}

// ═══════════════════════════════════════════════════════════
// END GAME
// ═══════════════════════════════════════════════════════════
async function endGame(chat, sock) {
    const game = games.get(chat)
    if (!game) return

    clearTimeout(game.turnTimer)
    game.state = 'finished'

    const sorted = [...game.players.entries()]
        .sort(([,a], [,b]) => b.score - a.score)

    const winner = sorted[0]
    const db = load()

    for (const [jid, data] of sorted) {
        if (!db[jid]) db[jid] = { games: 0, wins: 0, totalScore: 0, bestScore: 0 }
        db[jid].games++
        db[jid].totalScore += data.score
        if (data.score > db[jid].bestScore) db[jid].bestScore = data.score
    }
    if (winner) db[winner[0]].wins++
    save(db)

    await sock.sendMessage(chat, {
        text: `｡ﾟ•┈୨💖୧┈•ﾟ｡
🏆 *𝙂𝘼𝙈𝙀 𝙊𝙑𝙀𝙍!*

🥇 @${winner[0].split('@')[0]}: ${winner[1].score} 𝙥𝙤𝙞𝙣𝙩𝙨 👑

📊 *𝙁𝙞𝙣𝙖𝙡 𝙎𝙘𝙤𝙧𝙚𝙨:*
${sorted.map(([jid, data], i) => 
    `${['🥇','🥈','🥉'][i] || '👤'} @${jid.split('@')[0]}: ${data.score} 𝙥𝙩𝙨`
).join('\n')}

💝 .wb host 𝙩𝙤 𝙥𝙡𝙖𝙮 𝙖𝙜𝙖𝙞𝙣!
🧁 @${winner[0].split('@')[0]} 𝙞𝙨 𝙩𝙝𝙚 𝙒𝙞𝙣𝙣𝙚𝙧!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`,
        mentions: sorted.map(s => s[0])
    }).catch(() => {})

    games.delete(chat)
}

// ═══════════════════════════════════════════════════════════
// MAIN PLUGIN
// ═══════════════════════════════════════════════════════════

export default {
    name: 'wordbuilder',
    command: ['wordbuilder', 'wb', 'buildword'],
    desc: '🔤 𝙒𝙤𝙧𝙙 𝘽𝙪𝙞𝙡𝙙𝙚𝙧 — 𝙏𝙪𝙧𝙣‑𝘽𝙖𝙨𝙚𝙙 𝙈𝙪𝙡𝙩𝙞𝙥𝙡𝙖𝙮𝙚𝙧!',
    category: 'games',
    cooldown: 1,

    async run({ sock, msg, from, args, reply, react, sender }) {
        const chat = from
        const input = args[0]?.toLowerCase()
        const rest = args.slice(1).join(' ')

        // ═══════════════════════════════════════════════
        // 🏠 HOST
        // ═══════════════════════════════════════════════
        if (input === 'host' || input === 'start') {
            if (games.has(chat)) {
                const g = games.get(chat)
                if (g.state === 'lobby') return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n⚠️ 𝙇𝙤𝙗𝙗𝙮 𝙤𝙥𝙚𝙣!\n💝 .wb join\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
                if (g.state === 'playing') return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n⚠️ 𝙂𝙖𝙢𝙚 𝙞𝙣 𝙥𝙧𝙤𝙜𝙧𝙚𝙨𝙨! 𝙒𝙖𝙞𝙩...\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
            }

            games.set(chat, {
                state: 'lobby',
                host: sender,
                players: new Map(),
                playerOrder: [],
                playerFails: {},
                currentPlayer: null,
                currentPlayerIndex: -1,
                currentRound: -1,
                currentChallenge: null,
                challengeStartedAt: null,
                challengeAnswered: false,
                turnStartedAt: null,
                turnTimer: null,
                startedAt: Date.now(),
                totalRounds: TOTAL_ROUNDS
            })

            const game = games.get(chat)
            game.players.set(sender, { 
                score: 0, 
                streak: 0, 
                bestStreak: 0, 
                wordsFound: 0, 
                fails: 0 
            })
            game.playerOrder.push(sender)
            game.playerFails[sender] = 0

            // Auto-start after lobby
            const lobbyTimer = setTimeout(async () => {
                const g = games.get(chat)
                if (!g || g.state !== 'lobby') return

                if (g.players.size < 1) {
                    games.delete(chat)
                    await sock.sendMessage(chat, { text: `｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙉𝙤 𝙥𝙡𝙖𝙮𝙚𝙧𝙨!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡` }).catch(() => {})
                    return
                }

                g.state = 'playing'
                g.currentRound = 0
                g.currentPlayerIndex = -1
                g.playerFails = {}
                g.playerOrder.forEach(jid => { g.playerFails[jid] = 0 })
                g.currentChallenge = generateChallenge(0)
                g.challengeStartedAt = Date.now()

                const playerList = g.playerOrder.map(j => `@${j.split('@')[0]}`).join(', ')
                await sock.sendMessage(chat, {
                    text: `｡ﾟ•┈୨💖୧┈•ﾟ｡
🎮 *𝙂𝘼𝙈𝙀 𝙎𝙏𝘼𝙍𝙏𝙀𝘿!*

👥 𝙋𝙡𝙖𝙮𝙚𝙧𝙨: ${playerList}
🔄 ${TOTAL_ROUNDS} 𝙧𝙤𝙪𝙣𝙙𝙨
⏱️ ${TURN_TIME/1000}s 𝙥𝙚𝙧 𝙩𝙪𝙧𝙣
❌ ${MAX_FAILS} 𝙛𝙖𝙞𝙡𝙨 = 𝙎𝙠𝙞𝙥

🧁 𝙀𝙖𝙘𝙝 𝙥𝙡𝙖𝙮𝙚𝙧 𝙜𝙚𝙩𝙨 𝙖 𝙩𝙪𝙧𝙣!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`,
                    mentions: g.playerOrder
                }).catch(() => {})

                await new Promise(r => setTimeout(r, 3000))
                await announceRound(chat, sock)
                await new Promise(r => setTimeout(r, 2000))
                await startNextTurn(chat, sock)
            }, LOBBY_TIME)

            game._lobbyTimer = lobbyTimer

            await react('🔤')
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
🔤 *𝙒𝙊𝙍𝘿 𝘽𝙐𝙄𝙇𝘿𝙀𝙍*

👑 𝙃𝙤𝙨𝙩: @${sender.split('@')[0]}
⏰ 𝙇𝙤𝙗𝙗𝙮: ${LOBBY_TIME/1000}s

💝 .wb join
🧁 𝙅𝙤𝙞𝙣 𝙣𝙤𝙬!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`,
                { mentions: [sender] }
            )
        }

        // ═══════════════════════════════════════════════
        // 👥 JOIN (also mid-game!)
        // ═══════════════════════════════════════════════
        if (input === 'join') {
            const game = games.get(chat)
            if (!game) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n⚠️ 𝙉𝙤 𝙜𝙖𝙢𝙚!\n💝 .wb host\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
            if (game.players.has(sender)) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n⚠️ 𝘼𝙡𝙧𝙚𝙖𝙙𝙮 𝙞𝙣!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

            game.players.set(sender, { 
                score: 0, 
                streak: 0, 
                bestStreak: 0, 
                wordsFound: 0, 
                fails: 0 
            })

            if (game.state === 'lobby') {
                game.playerOrder.push(sender)
                game.playerFails[sender] = 0
            } else if (game.state === 'playing') {
                // 🔥 MID-GAME JOIN!
                game.playerOrder.push(sender)
                game.playerFails[sender] = 0
            }

            await react('👋')
            
            const joinMsg = game.state === 'playing' 
                ? `🔥 *𝙈𝙄𝘿‑𝙂𝘼𝙈𝙀 𝙅𝙊𝙄𝙉!*` 
                : `👋 𝙅𝙤𝙞𝙣𝙚𝙙!`

            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
${joinMsg}

👤 @${sender.split('@')[0]}
👥 𝙋𝙡𝙖𝙮𝙚𝙧𝙨: ${game.players.size}

🧁 ${game.state === 'playing' ? '𝙔𝙤𝙪𝙧 𝙩𝙪𝙧𝙣 𝙬𝙞𝙡𝙡 𝙘𝙤𝙢𝙚!' : '𝙒𝙖𝙞𝙩𝙞𝙣𝙜 𝙛𝙤𝙧 𝙨𝙩𝙖𝙧𝙩...'}
｡ﾟ•┈୨🌸୧┈•ﾟ｡`,
                { mentions: [sender] }
            )
        }

        // ═══════════════════════════════════════════════
        // 🎮 PLAY (Your Turn Only)
        // ═══════════════════════════════════════════════
        if (!input || (input.length >= 1 && !['host','start','join','scores','stop','end'].includes(input))) {
            const game = games.get(chat)
            if (!game || game.state !== 'playing') return
            if (!game.players.has(sender)) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n⚠️ 𝙔𝙤𝙪'𝙧𝙚 𝙣𝙤𝙩 𝙞𝙣 𝙩𝙝𝙞𝙨 𝙜𝙖𝙢𝙚!\n💝 .wb join\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

            // 🔥 CHECK IF IT'S YOUR TURN
            if (game.currentPlayer !== sender) {
                const currentTag = game.currentPlayer ? `@${game.currentPlayer.split('@')[0]}` : '?'
                return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n⏳ 𝙒𝙖𝙞𝙩! 𝙄𝙩'𝙨 ${currentTag}'𝙨 𝙩𝙪𝙧𝙣!\n🧁 𝙔𝙤𝙪𝙧 𝙩𝙪𝙧𝙣 𝙘𝙤𝙢𝙞𝙣𝙜 𝙨𝙤𝙤𝙣...\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`, { mentions: [game.currentPlayer].filter(Boolean) })
            }

            const challenge = game.currentChallenge
            if (!challenge) return

            const guess = (input + (rest ? ' ' + rest : '')).toLowerCase()
            const player = game.players.get(sender)

            // Validate answer
            let correct = false
            let points = 0

            if (challenge.type === 'sentence') {
                correct = guess === challenge.answer
                if (correct) {
                    const timeTaken = (Date.now() - game.turnStartedAt) / 1000
                    const speedBonus = timeTaken < 3 ? POINTS_BONUS_SPEED : timeTaken < 6 ? Math.floor(POINTS_BONUS_SPEED / 2) : 0
                    points = POINTS_CORRECT + speedBonus + (player.streak * 3)
                }
            } else {
                if (guess.length === challenge.length) {
                    const hasLetters = challenge.letters.every(l => guess.includes(l))
                    if (hasLetters) {
                        const valid = isInWordBank(guess) || await isValidWordAPI(guess)
                        if (valid) {
                            correct = true
                            const timeTaken = (Date.now() - game.turnStartedAt) / 1000
                            const speedBonus = timeTaken < 3 ? POINTS_BONUS_SPEED : timeTaken < 6 ? Math.floor(POINTS_BONUS_SPEED / 2) : 0
                            points = POINTS_CORRECT + speedBonus + (player.streak * 2)
                            if (guess === challenge.answer) points += POINTS_BONUS_EXACT
                        }
                    }
                }
            }

            if (correct) {
                // ✅ CORRECT!
                clearTimeout(game.turnTimer)
                player.score += points
                player.streak++
                if (player.streak > player.bestStreak) player.bestStreak = player.streak
                player.wordsFound++
                game.playerFails[sender] = 0

                await react('✅')

                await sock.sendMessage(chat, {
                    text: `｡ﾟ•┈୨💖୧┈•ﾟ｡
✅ @${sender.split('@')[0]} *${guess.toUpperCase()}*! +${points}
🔥 𝙎𝙩𝙧𝙚𝙖𝙠: ${player.streak} | 💰 𝙎𝙘𝙤𝙧𝙚: ${player.score}
${guess === challenge.answer ? '🎯 𝙋𝙀𝙍𝙁𝙀𝘾𝙏 𝙈𝘼𝙏𝘾𝙃!' : ''}
⏭️ 𝙉𝙚𝙭𝙩 𝙥𝙡𝙖𝙮𝙚𝙧...
｡ﾟ•┈୨🌸୧┈•ﾟ｡`,
                    mentions: [sender]
                }).catch(() => {})

                await new Promise(r => setTimeout(r, 2000))
                await startNextTurn(chat, sock)
                return
            }

            // ❌ WRONG!
            player.streak = 0
            game.playerFails[sender] = (game.playerFails[sender] || 0) + 1
            const failsLeft = MAX_FAILS - game.playerFails[sender]

            await react('❌')

            if (game.playerFails[sender] >= MAX_FAILS) {
                // Max fails → skip
                clearTimeout(game.turnTimer)
                await sock.sendMessage(chat, {
                    text: `｡ﾟ•┈୨💖୧┈•ﾟ｡
❌ @${sender.split('@')[0]} — ${MAX_FAILS} 𝙛𝙖𝙞𝙡𝙨!
⏭️ 𝙎𝙠𝙞𝙥𝙥𝙚𝙙 𝙛𝙤𝙧 𝙩𝙝𝙞𝙨 𝙧𝙤𝙪𝙣𝙙.
💡 𝘼𝙣𝙨𝙬𝙚𝙧: *${challenge.answer.toUpperCase()}*
｡ﾟ•┈୨🌸୧┈•ﾟ｡`,
                    mentions: [sender]
                }).catch(() => {})

                await new Promise(r => setTimeout(r, 2000))
                await startNextTurn(chat, sock)
                return
            }

            // Still has chances
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
❌ 𝙒𝙧𝙤𝙣𝙜! 𝙏𝙧𝙮 𝙖𝙜𝙖𝙞𝙣...
⚠️ 𝙁𝙖𝙞𝙡𝙨: ${game.playerFails[sender]}/${MAX_FAILS} (${failsLeft} 𝙡𝙚𝙛𝙩)

💡 𝙃𝙞𝙣𝙩: ${challenge.hint}
💝 .wb <word>
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            )
        }

        // ═══════════════════════════════════════════════
        // 📊 SCORES
        // ═══════════════════════════════════════════════
        if (input === 'scores') {
            const game = games.get(chat)
            if (!game || game.state !== 'playing') return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n⚠️ 𝙉𝙤 𝙖𝙘𝙩𝙞𝙫𝙚 𝙜𝙖𝙢𝙚!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

            const sorted = [...game.players.entries()].sort(([,a], [,b]) => b.score - a.score)
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
📊 *𝙎𝘾𝙊𝙍𝙀𝙎 — 𝙍𝙤𝙪𝙣𝙙 ${game.currentRound + 1}/${TOTAL_ROUNDS}*

${sorted.map(([jid, data], i) => {
    const fails = game.playerFails[jid] || 0
    return `${['🥇','🥈','🥉'][i] || '👤'} @${jid.split('@')[0]}: ${data.score} (${fails}/${MAX_FAILS})`
}).join('\n')}

🎯 𝙉𝙤𝙬: @${(game.currentPlayer || '?').split('@')[0]}'𝙨 𝙩𝙪𝙧𝙣
🧁 𝙆𝙚𝙚𝙥 𝙜𝙤𝙞𝙣𝙜!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`,
                { mentions: sorted.map(s => s[0]) }
            )
        }

        return reply(
            `｡ﾟ•┈୨💖୧┈•ﾟ｡
🔤 *𝙒𝙊𝙍𝘿 𝘽𝙐𝙄𝙇𝘿𝙀𝙍*

💝 .wb host
👋 .wb join
🎮 .wb <word>
📊 .wb scores

🧁 𝙏𝙪𝙧𝙣‑𝙗𝙖𝙨𝙚𝙙 𝙢𝙪𝙡𝙩𝙞𝙥𝙡𝙖𝙮𝙚𝙧!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
        )
    }
}