import { Server, Socket } from 'socket.io'
import { logger } from '../utils/logger'

interface WaitingUser {
  socketId: string
  displayName: string
  topics: string[]
  job: string
}

const waitingQueue: WaitingUser[] = []

const findBestMatch = (user: WaitingUser): number => {
  let bestIdx = -1
  let bestScore = -1

  waitingQueue.forEach((other, idx) => {
    if (other.socketId === user.socketId) return

    let score = 0

    // Match theo topic
    const commonTopics = user.topics.filter(t => other.topics.includes(t))
    score += commonTopics.length * 2

    // Match theo job
    if (user.job && other.job && user.job === other.job) {
      score += 1
    }

    if (score > bestScore) {
      bestScore = score
      bestIdx = idx
    }
  })

  // Nếu không có match tốt thì lấy người đầu tiên trong queue
  if (bestIdx === -1 && waitingQueue.length > 0) {
    bestIdx = waitingQueue.findIndex(u => u.socketId !== user.socketId)
  }

  return bestIdx
}

export const registerMatchHandler = (io: Server, socket: Socket) => {
  socket.on('match:find', ({ displayName, topics, job }: {
    displayName: string
    topics: string[]
    job: string
  }) => {
    logger.info(`${displayName} finding match... topics: ${topics} job: ${job}`)

    const user: WaitingUser = {
      socketId: socket.id,
      displayName,
      topics: topics || [],
      job: job || ''
    }

    const matchIdx = findBestMatch(user)

    if (matchIdx !== -1) {
      const partner = waitingQueue.splice(matchIdx, 1)[0]
      const roomId = `room_${Date.now()}`

      socket.join(roomId)
      io.sockets.sockets.get(partner.socketId)?.join(roomId)

      // Tìm topic chung
      const commonTopics = user.topics.filter(t => partner.topics.includes(t))
      const matchReason = commonTopics.length > 0
        ? `Cùng quan tâm: ${commonTopics.join(', ')}`
        : 'Kết nối ngẫu nhiên'

      io.to(roomId).emit('match:found', {
        roomId,
        users: [displayName, partner.displayName],
        matchReason
      })

      logger.info(`Matched: ${displayName} <-> ${partner.displayName} | ${matchReason}`)
    } else {
      waitingQueue.push(user)
      socket.emit('match:waiting')
      logger.info(`${displayName} waiting... queue size: ${waitingQueue.length}`)
    }
  })

  socket.on('match:cancel', () => {
    const idx = waitingQueue.findIndex(u => u.socketId === socket.id)
    if (idx !== -1) waitingQueue.splice(idx, 1)
    socket.emit('match:cancelled')
  })

  socket.on('disconnect', () => {
    const idx = waitingQueue.findIndex(u => u.socketId === socket.id)
    if (idx !== -1) waitingQueue.splice(idx, 1)
  })
}