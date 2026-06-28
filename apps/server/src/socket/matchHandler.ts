import { Server, Socket } from 'socket.io'
import { logger } from '../utils/logger'
import { incrTotalUsers, incrChatSessionsToday, trackRecentUser } from '../utils/analytics'

interface WaitingUser {
  socketId: string
  displayName: string
  topics: string[]
  job: string
  waitingSince: number
}

const waitingQueue: WaitingUser[] = []
const WAIT_TIMEOUT = 60000 // 60 giây chờ cùng chủ đề

const findBestMatch = (user: WaitingUser): number => {
  const now = Date.now()
  let bestIdx = -1
  let bestScore = -1

  waitingQueue.forEach((other, idx) => {
    if (other.socketId === user.socketId) return

    const commonTopics = user.topics.filter(t => other.topics.includes(t))
    const commonJob = user.job && other.job && user.job === other.job
    const waitedLong = (now - other.waitingSince) > WAIT_TIMEOUT

    let score = 0
    score += commonTopics.length * 10  // ưu tiên chủ đề cao nhất
    if (commonJob) score += 3
    if (waitedLong) score += 1  // chờ lâu thì chấp nhận match khác chủ đề

    // Chỉ match nếu có điểm chung HOẶC đã chờ quá lâu
    const canMatch = commonTopics.length > 0 || commonJob || waitedLong
    
    if (canMatch && score > bestScore) {
      bestScore = score
      bestIdx = idx
    }
  })

  return bestIdx
}

export const registerMatchHandler = (io: Server, socket: Socket) => {
  socket.on('match:find', ({ displayName, topics, job }: {
    displayName: string
    topics: string[]
    job: string
  }) => {
    logger.info(`${displayName} finding match... topics: ${topics}`)

    // Mỗi lượt tìm match là một người dùng ẩn danh hoạt động -> đếm vào tổng
    incrTotalUsers()
    trackRecentUser({ name: displayName, joinedAt: new Date().toISOString(), mode: 'Người dùng' })

    const user: WaitingUser = {
      socketId: socket.id,
      displayName,
      topics: topics || [],
      job: job || '',
      waitingSince: Date.now()
    }

    const matchIdx = findBestMatch(user)

    if (matchIdx !== -1) {
      const partner = waitingQueue.splice(matchIdx, 1)[0]
      const roomId = `room_${Date.now()}`

      socket.join(roomId)
      io.sockets.sockets.get(partner.socketId)?.join(roomId)

      incrChatSessionsToday()

      const commonTopics = user.topics.filter(t => partner.topics.includes(t))
      const matchReason = commonTopics.length > 0
        ? `Cùng quan tâm: ${commonTopics.map(t => {
            const labels: Record<string, string> = {
              love: 'Tình yêu', study: 'Học tập', family: 'Gia đình',
              money: 'Tài chính', work: 'Công việc', health: 'Sức khỏe',
              friend: 'Bạn bè', other: 'Khác'
            }
            return labels[t] || t
          }).join(', ')}`
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
      logger.info(`${displayName} waiting... queue: ${waitingQueue.length}`)

      // Sau 60s thử match lại kể cả khác chủ đề
      setTimeout(() => {
        const stillWaiting = waitingQueue.find(u => u.socketId === socket.id)
        if (!stillWaiting) return

        const anyIdx = waitingQueue.findIndex(u => u.socketId !== socket.id)
        if (anyIdx !== -1) {
          const partner = waitingQueue.splice(anyIdx, 1)[0]
          const myIdx = waitingQueue.findIndex(u => u.socketId === socket.id)
          if (myIdx !== -1) waitingQueue.splice(myIdx, 1)

          const roomId = `room_${Date.now()}`
          socket.join(roomId)
          io.sockets.sockets.get(partner.socketId)?.join(roomId)

          incrChatSessionsToday()

          io.to(roomId).emit('match:found', {
            roomId,
            users: [displayName, partner.displayName],
            matchReason: 'Kết nối ngẫu nhiên'
          })

          logger.info(`Timeout match: ${displayName} <-> ${partner.displayName}`)
        }
      }, WAIT_TIMEOUT)
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
