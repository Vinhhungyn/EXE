import { Server, Socket } from 'socket.io'
import { logger } from '../utils/logger'

const waitingQueue: { socketId: string; displayName: string }[] = []

export const registerMatchHandler = (io: Server, socket: Socket) => {
  socket.on('match:find', ({ displayName }: { displayName: string }) => {
    logger.info(`${displayName} finding match...`)

    const existing = waitingQueue.findIndex(u => u.socketId !== socket.id)

    if (existing !== -1) {
      const partner = waitingQueue.splice(existing, 1)[0]
      const roomId = `room_${Date.now()}`

      socket.join(roomId)
      io.sockets.sockets.get(partner.socketId)?.join(roomId)

      io.to(roomId).emit('match:found', {
        roomId,
        users: [displayName, partner.displayName]
      })

      logger.info(`Matched: ${displayName} <-> ${partner.displayName} in ${roomId}`)
    } else {
      waitingQueue.push({ socketId: socket.id, displayName })
      socket.emit('match:waiting')
      logger.info(`${displayName} waiting in queue...`)
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