const express      = require('express')
const { createServer } = require('http')
const { Server }   = require('socket.io')
const cors         = require('cors')
const cookieParser = require('cookie-parser')
const authRouter      = require('./routes/auth')
const childrenRouter  = require('./routes/children')
const progressRouter  = require('./routes/progress')
const commBoardRouter = require('./routes/commBoard')
const ttsRouter       = require('./routes/tts')

const app  = express()
const PORT = process.env.PORT || 3001
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

app.use(cors({ origin: CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth',       authRouter)
app.use('/api/children',   childrenRouter)
app.use('/api/progress',   progressRouter)
app.use('/api/comm-board', commBoardRouter)
app.use('/api/tts',        ttsRouter)

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

// ---------------------------------------------------------------------------
// Socket.io — multiplayer room system
// ---------------------------------------------------------------------------

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: CLIENT_URL, credentials: true },
})

/**
 * Room shape:
 *   { code, p1: socketId|null, p2: socketId|null, state: 'waiting'|'ready'|'playing' }
 */
const rooms = new Map()

/**
 * Storytime room shape:
 *   { code, storyId, narratorId, listeners: Set<socketId>, pageIndex, ttl }
 */
const storytimeRooms = new Map()

function genCode() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

function makeUniqueCode(map) {
  let code
  do { code = genCode() } while (map.has(code))
  return code
}

io.on('connection', (socket) => {
  let myRoomCode = null

  // ── Create room ──────────────────────────────────────
  socket.on('create-room', (cb) => {
    const code = makeUniqueCode(rooms)
    rooms.set(code, { code, p1: socket.id, p2: null, state: 'waiting' })
    myRoomCode = code
    socket.join(code)
    cb({ code })
  })

  // ── Join room ────────────────────────────────────────
  socket.on('join-room', (code, cb) => {
    const room = rooms.get(code)
    if (!room)   return cb({ error: 'Room not found. Check the code and try again.' })
    if (room.p2) return cb({ error: 'Room is already full.' })

    room.p2    = socket.id
    room.state = 'ready'
    myRoomCode = code
    socket.join(code)
    cb({ ok: true })

    // Notify both players
    io.to(code).emit('room-ready', { code })
  })

  // ── Relay generic game events ────────────────────────
  // Clients send { type, payload } and the server relays to the other player.
  // The server also handles Reaction Race authoritative timing.
  socket.on('game-event', (event) => {
    if (!myRoomCode) return
    socket.to(myRoomCode).emit('game-event', event)
  })

  // ── Reaction Race — server-authoritative flash timing ─
  // Host emits 'start-reaction-round'; server decides when to flash.
  socket.on('start-reaction-round', () => {
    if (!myRoomCode) return
    const room = rooms.get(myRoomCode)
    if (!room || room.p1 !== socket.id) return   // only host can trigger

    room.state          = 'playing'
    room.roundFlashTime = null
    room.roundWinner    = null
    room.roundPressers  = []

    io.to(myRoomCode).emit('round-get-ready')

    const delay = 1800 + Math.random() * 2700   // 1.8 – 4.5 s
    room._flashTimeout = setTimeout(() => {
      room.roundFlashTime = Date.now()
      io.to(myRoomCode).emit('round-flash')
    }, delay)
  })

  // Client pressed during flash
  socket.on('reaction-press', () => {
    if (!myRoomCode) return
    const room = rooms.get(myRoomCode)
    if (!room || !room.roundFlashTime) {
      // Pressed before flash — too early, penalise sender; award point to other player
      socket.emit('round-result', { winner: 'opponent', reason: 'too-early' })
      socket.to(myRoomCode).emit('round-result', { winner: 'self', reason: 'opponent-too-early' })
      return
    }
    if (room.roundWinner) return   // already resolved

    room.roundWinner = socket.id
    const reactionMs = Date.now() - room.roundFlashTime
    const isP1Won    = socket.id === room.p1

    socket.emit('round-result', { winner: 'self',     reactionMs })
    socket.to(myRoomCode).emit('round-result', { winner: 'opponent', reactionMs })
  })

  // ── Storytime: create session ─────────────────────────
  socket.on('create-story-room', (storyId, cb) => {
    const code = makeUniqueCode(storytimeRooms)
    const ttl  = setTimeout(() => {
      io.to(code).emit('story-ended')
      storytimeRooms.delete(code)
    }, 2 * 60 * 60 * 1000)   // auto-expire after 2 hours

    storytimeRooms.set(code, {
      code,
      storyId,
      narratorId:   socket.id,
      listeners:    new Set([socket.id]),
      currentState: null,
      _ttl:         ttl,
    })
    socket.join(code)
    myRoomCode = code
    cb({ code })
  })

  // ── Storytime: join as listener ───────────────────────
  socket.on('join-story-room', (code, cb) => {
    const room = storytimeRooms.get(code)
    if (!room) return cb({ error: 'Room not found. Check the code and try again.' })

    room.listeners.add(socket.id)
    socket.join(code)
    myRoomCode = code
    cb({ ok: true, currentState: room.currentState || null })
  })

  // ── Storytime: narrator changes page ─────────────────
  socket.on('story-page-change', (stateData) => {
    if (!myRoomCode) return
    const room = storytimeRooms.get(myRoomCode)
    if (!room || room.narratorId !== socket.id) return
    room.currentState = stateData
    io.to(myRoomCode).emit('story-state', stateData)
  })

  // ── Storytime: narrator ends session ─────────────────
  socket.on('end-story-room', () => {
    if (!myRoomCode) return
    const room = storytimeRooms.get(myRoomCode)
    if (!room || room.narratorId !== socket.id) return
    clearTimeout(room._ttl)
    io.to(myRoomCode).emit('story-ended')
    storytimeRooms.delete(myRoomCode)
  })

  // ── Storytime: listener count request ────────────────
  socket.on('listener-count', (cb) => {
    if (!myRoomCode) return cb(0)
    const room = storytimeRooms.get(myRoomCode)
    cb(room ? room.listeners.size - 1 : 0)   // subtract narrator
  })

  // ── Disconnect ───────────────────────────────────────
  socket.on('disconnect', () => {
    if (!myRoomCode) return

    // Game room cleanup
    const room = rooms.get(myRoomCode)
    if (room) {
      clearTimeout(room._flashTimeout)
      io.to(myRoomCode).emit('player-disconnected')
      rooms.delete(myRoomCode)
    }

    // Storytime room cleanup
    const stRoom = storytimeRooms.get(myRoomCode)
    if (stRoom) {
      stRoom.listeners.delete(socket.id)
      if (socket.id === stRoom.narratorId) {
        clearTimeout(stRoom._ttl)
        io.to(myRoomCode).emit('story-ended')
        storytimeRooms.delete(myRoomCode)
      }
    }
  })
})

// ---------------------------------------------------------------------------

httpServer.listen(PORT, () => {
  console.log(`AssistiveGames server running on port ${PORT}`)
})
