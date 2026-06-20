import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB = path.join(__dirname, '..', '..', 'database', 'ttt.json')

function load() { try { return JSON.parse(fs.readFileSync(DB, 'utf8')) } catch { return {} } }
function save(d) { fs.writeFileSync(DB, JSON.stringify(d, null, 2)) }

const games = new Map()

// AI Logic
function getEmptyCells(board) {
    return board.reduce((acc, cell, i) => cell === null ? [...acc, i] : acc, [])
}

function checkWin(board, player) {
    const wins = [
        [0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]
    ]
    return wins.some(w => w.every(i => board[i] === player))
}

function minimax(board, depth, isMax, aiPlayer, humanPlayer) {
    if (checkWin(board, aiPlayer)) return 10 - depth
    if (checkWin(board, humanPlayer)) return depth - 10
    const empty = getEmptyCells(board)
    if (empty.length === 0) return 0

    if (isMax) {
        let best = -Infinity
        for (const i of empty) {
            board[i] = aiPlayer
            best = Math.max(best, minimax(board, depth + 1, false, aiPlayer, humanPlayer))
            board[i] = null
        }
        return best
    } else {
        let best = Infinity
        for (const i of empty) {
            board[i] = humanPlayer
            best = Math.min(best, minimax(board, depth + 1, true, aiPlayer, humanPlayer))
            board[i] = null
        }
        return best
    }
}

function getBestMove(board, aiPlayer, humanPlayer, difficulty) {
    const empty = getEmptyCells(board)
    if (empty.length === 0) return -1
    if (empty.length === 9) return empty[Math.floor(Math.random() * empty.length)]

    if (difficulty === 'easy') {
        // Random move
        return empty[Math.floor(Math.random() * empty.length)]
    } else if (difficulty === 'hard') {
        // Minimax with depth limit
        let bestScore = -Infinity
        let bestMove = empty[0]
        for (const i of empty) {
            board[i] = aiPlayer
            const score = minimax(board, 0, false, aiPlayer, humanPlayer)
            board[i] = null
            if (score > bestScore) {
                bestScore = score
                bestMove = i
            }
        }
        return bestMove
    } else {
        // Impossible - full minimax
        let bestScore = -Infinity
        let bestMove = empty[0]
        for (const i of empty) {
            board[i] = aiPlayer
            const score = minimax(board, 0, false, aiPlayer, humanPlayer)
            board[i] = null
            if (score > bestScore) {
                bestScore = score
                bestMove = i
            }
        }
        return bestMove
    }
}

function renderBoard(board) {
    const cells = board.map((cell, i) => {
        if (cell === 'X') return '❌'
        if (cell === 'O') return '⭕'
        return ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣'][i]
    })
    
    return `┌─────┬─────┬─────┐
│  ${cells[0]}  │  ${cells[1]}  │  ${cells[2]}  │
├─────┼─────┼─────┤
│  ${cells[3]}  │  ${cells[4]}  │  ${cells[5]}  │
├─────┼─────┼─────┤
│  ${cells[6]}  │  ${cells[7]}  │  ${cells[8]}  │
└─────┴─────┴─────┘`
}

export default {
    name: 'tictactoe',
    command: ['ttt', 'tictactoe', 'xo'],
    desc: '🎮 𝙏𝙞𝙘‑𝙏𝙖𝙘‑𝙏𝙤𝙚 — 𝙈𝙪𝙡𝙩𝙞𝙥𝙡𝙖𝙮𝙚𝙧 & 𝘼𝙄!',
    category: 'games',
    cooldown: 2,

    async run({ sock, msg, from, args, reply, react, sender }) {
        const chat = from
        const input = args[0]?.toLowerCase()
        const db = load()

        // ═══════════════════════════════════════════════
        // 🆚 CHALLENGE PLAYER
        // ═══════════════════════════════════════════════
        if (input === 'challenge' || input === 'vs') {
            const opponent = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
            if (!opponent) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n👥 𝙏𝙖𝙜 𝙨𝙤𝙢𝙚𝙤𝙣𝙚 𝙩𝙤 𝙘𝙝𝙖𝙡𝙡𝙚𝙣𝙜𝙚!\n💝 .ttt vs @user\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
            if (opponent === sender) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙔𝙤𝙪 𝙘𝙖𝙣'𝙩 𝙥𝙡𝙖𝙮 𝙮𝙤𝙪𝙧𝙨𝙚𝙡𝙛!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
            if (games.has(chat)) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n⚠️ 𝙂𝙖𝙢𝙚 𝙖𝙡𝙧𝙚𝙖𝙙𝙮 𝙞𝙣 𝙥𝙧𝙤𝙜𝙧𝙚𝙨𝙨!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

            games.set(chat, {
                board: Array(9).fill(null),
                playerX: sender,
                playerO: opponent,
                currentPlayer: sender,
                moves: 0,
                state: 'playing'
            })

            await react('🎮')
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
🎮 *𝙏𝙄𝘾‑𝙏𝘼𝘾‑𝙏𝙊𝙀*

❌ @${sender.split('@')[0]} (X) 𝙫𝙨 ⭕ @${opponent.split('@')[0]} (O)

${renderBoard(Array(9).fill(null))}

🎯 @${sender.split('@')[0]}'𝙨 𝙩𝙪𝙧𝙣!
💝 .ttt <1‑9>

🧁 𝙂𝙚𝙩 3 𝙞𝙣 𝙖 𝙧𝙤𝙬!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`,
                { mentions: [sender, opponent] }
            )
        }

        // ═══════════════════════════════════════════════
        // 🤖 PLAY VS AI
        // ═══════════════════════════════════════════════
        if (input === 'ai' || input === 'bot') {
            const difficulty = args[1]?.toLowerCase() || 'easy'
            if (!['easy','hard','impossible'].includes(difficulty)) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n🤖 𝘿𝙞𝙛𝙛𝙞𝙘𝙪𝙡𝙩𝙮: easy | hard | impossible\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
            if (games.has(chat)) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n⚠️ 𝙂𝙖𝙢𝙚 𝙞𝙣 𝙥𝙧𝙤𝙜𝙧𝙚𝙨𝙨!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

            const playerFirst = Math.random() > 0.5
            const board = Array(9).fill(null)

            games.set(chat, {
                board,
                playerX: playerFirst ? sender : 'AI',
                playerO: playerFirst ? 'AI' : sender,
                currentPlayer: playerFirst ? sender : 'AI',
                moves: 0,
                state: 'playing',
                aiMode: true,
                difficulty
            })

            await react('🤖')

            let msg = `｡ﾟ•┈୨💖୧┈•ﾟ｡
🎮 *𝙏𝙄𝘾‑𝙏𝘼𝘾‑𝙏𝙊𝙀 𝙫𝙨 𝘼𝙄*
🤖 ${difficulty.toUpperCase()}

❌ @${sender.split('@')[0]} (X) 𝙫𝙨 ⭕ 𝘼𝙄 (O)

${renderBoard(board)}`

            if (playerFirst) {
                msg += `\n🎯 @${sender.split('@')[0]}'𝙨 𝙩𝙪𝙧𝙣!\n💝 .ttt <1‑9>`
            } else {
                // AI moves first
                const game = games.get(chat)
                const aiMove = getBestMove([...board], 'O', 'X', difficulty)
                if (aiMove >= 0) {
                    board[aiMove] = 'O'
                    game.currentPlayer = sender
                    game.moves++
                    msg += `\n🤖 𝘼𝙄 𝙥𝙡𝙖𝙮𝙚𝙙 ⭕ at ${aiMove + 1}`
                    msg += `\n\n${renderBoard(board)}`
                    msg += `\n🎯 @${sender.split('@')[0]}'𝙨 𝙩𝙪𝙧𝙣!\n💝 .ttt <1‑9>`
                }
            }

            msg += `\n🧁 𝙂𝙚𝙩 3 𝙞𝙣 𝙖 𝙧𝙤𝙬!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`

            return reply(msg, { mentions: [sender] })
        }

        // ═══════════════════════════════════════════════
        // 🎯 MAKE A MOVE
        // ═══════════════════════════════════════════════
        if (!isNaN(input) && input >= 1 && input <= 9) {
            const game = games.get(chat)
            if (!game || game.state !== 'playing') return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n⚠️ 𝙉𝙤 𝙖𝙘𝙩𝙞𝙫𝙚 𝙜𝙖𝙢𝙚!\n💝 .ttt vs @user or .ttt ai\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

            const pos = parseInt(input) - 1
            if (game.board[pos] !== null) return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n❌ 𝙏𝙝𝙖𝙩 𝙨𝙥𝙤𝙩 𝙞𝙨 𝙩𝙖𝙠𝙚𝙣!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)

            // Check turn
            if (!game.aiMode && game.currentPlayer !== sender) {
                return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n⏳ 𝙒𝙖𝙞𝙩 𝙛𝙤𝙧 @${game.currentPlayer.split('@')[0]}!\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`, { mentions: [game.currentPlayer] })
            }

            if (game.aiMode && game.currentPlayer !== sender) {
                return reply(`｡ﾟ•┈୨💖୧┈•ﾟ｡\n⏳ 𝙒𝙖𝙞𝙩 𝙛𝙤𝙧 𝘼𝙄...\n｡ﾟ•┈୨🌸୧┈•ﾟ｡`)
            }

            const symbol = game.playerX === sender ? 'X' : 'O'
            game.board[pos] = symbol
            game.moves++

            // Check win
            if (checkWin(game.board, symbol)) {
                const winner = symbol === 'X' ? game.playerX : game.playerO
                const loser = symbol === 'X' ? game.playerO : game.playerX
                
                // Update stats
                if (winner !== 'AI') {
                    if (!db[winner]) db[winner] = { wins: 0, losses: 0, draws: 0 }
                    db[winner].wins++
                }
                if (loser !== 'AI') {
                    if (!db[loser]) db[loser] = { wins: 0, losses: 0, draws: 0 }
                    db[loser].losses++
                }
                save(db)

                const winnerTag = winner === 'AI' ? '🤖 𝘼𝙄' : `@${winner.split('@')[0]}`
                games.delete(chat)
                await react('🎉')
                return reply(
                    `｡ﾟ•┈୨💖୧┈•ﾟ｡
🎉 *${winnerTag} 𝙒𝙄𝙉𝙎!*

${renderBoard(game.board)}

🧁 .ttt vs @user | .ttt ai
｡ﾟ•┈୨🌸୧┈•ﾟ｡`,
                    { mentions: [winner, loser].filter(j => j !== 'AI') }
                )
            }

            // Check draw
            if (getEmptyCells(game.board).length === 0) {
                if (game.playerX !== 'AI') { if (!db[game.playerX]) db[game.playerX] = { wins:0,losses:0,draws:0 }; db[game.playerX].draws++ }
                if (game.playerO !== 'AI') { if (!db[game.playerO]) db[game.playerO] = { wins:0,losses:0,draws:0 }; db[game.playerO].draws++ }
                save(db)
                games.delete(chat)
                await react('🤝')
                return reply(
                    `｡ﾟ•┈୨💖୧┈•ﾟ｡
🤝 *𝙄𝙩'𝙨 𝙖 𝘿𝙍𝘼𝙒!*

${renderBoard(game.board)}

🧁 .ttt vs @user | .ttt ai
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
                )
            }

            // Next turn
            game.currentPlayer = game.currentPlayer === game.playerX ? game.playerO : game.playerX

            // AI move
            if (game.aiMode && game.currentPlayer === 'AI') {
                await react('🤖')
                const aiSymbol = game.playerX === 'AI' ? 'X' : 'O'
                const humanSymbol = aiSymbol === 'X' ? 'O' : 'X'
                const aiMove = getBestMove([...game.board], aiSymbol, humanSymbol, game.difficulty)
                
                if (aiMove >= 0) {
                    game.board[aiMove] = aiSymbol
                    game.moves++
                }

                // Check AI win
                if (checkWin(game.board, aiSymbol)) {
                    games.delete(chat)
                    await sock.sendMessage(chat, {
                        text: `｡ﾟ•┈୨💖୧┈•ﾟ｡
🤖 *𝘼𝙄 𝙒𝙄𝙉𝙎!*

${renderBoard(game.board)}

🧁 .ttt ai easy | hard | impossible
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
                    }).catch(() => {})
                    return
                }

                // Check draw after AI move
                if (getEmptyCells(game.board).length === 0) {
                    games.delete(chat)
                    await sock.sendMessage(chat, {
                        text: `｡ﾟ•┈୨💖୧┈•ﾟ｡
🤝 *𝙄𝙩'𝙨 𝙖 𝘿𝙍𝘼𝙒!*

${renderBoard(game.board)}

🧁 .ttt ai easy | hard | impossible
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
                    }).catch(() => {})
                    return
                }

                game.currentPlayer = sender
            }

            await react(game.moves % 2 === 1 ? '❌' : '⭕')
            
            const nextPlayerTag = game.aiMode ? `@${sender.split('@')[0]}` : `@${game.currentPlayer.split('@')[0]}`
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
${renderBoard(game.board)}

🎯 ${nextPlayerTag}'𝙨 𝙩𝙪𝙧𝙣!
💝 .ttt <1‑9>
｡ﾟ•┈୨🌸୧┈•ﾟ｡`,
                { mentions: [game.currentPlayer].filter(j => j !== 'AI') }
            )
        }

        // ═══════════════════════════════════════════════
        // 📊 STATS
        // ═══════════════════════════════════════════════
        if (input === 'stats') {
            const stats = db[sender] || { wins: 0, losses: 0, draws: 0 }
            const total = stats.wins + stats.losses + stats.draws
            const winRate = total > 0 ? ((stats.wins / total) * 100).toFixed(1) : 0
            return reply(
                `｡ﾟ•┈୨💖୧┈•ﾟ｡
📊 *𝙏𝙏𝙏 𝙎𝙩𝙖𝙩𝙨*

🎉 𝙒𝙞𝙣𝙨: ${stats.wins}
😢 𝙇𝙤𝙨𝙨𝙚𝙨: ${stats.losses}
🤝 𝘿𝙧𝙖𝙬𝙨: ${stats.draws}
🎮 𝙏𝙤𝙩𝙖𝙡: ${total}
📈 𝙒𝙞𝙣 𝙍𝙖𝙩𝙚: ${winRate}%

🧁 𝙆𝙚𝙚𝙥 𝙥𝙡𝙖𝙮𝙞𝙣𝙜!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
            )
        }

        return reply(
            `｡ﾟ•┈୨💖୧┈•ﾟ｡
🎮 *𝙏𝙄𝘾‑𝙏𝘼𝘾‑𝙏𝙊𝙀*

🆚 .ttt vs @user — 𝙈𝙪𝙡𝙩𝙞𝙥𝙡𝙖𝙮𝙚𝙧
🤖 .ttt ai [easy/hard/impossible] — 𝘼𝙄 𝙈𝙖𝙩𝙘𝙝
📊 .ttt stats — 𝙔𝙤𝙪𝙧 𝙨𝙩𝙖𝙩𝙨

🧁 𝙂𝙚𝙩 3 𝙞𝙣 𝙖 𝙧𝙤𝙬!
｡ﾟ•┈୨🌸୧┈•ﾟ｡`
        )
    }
}