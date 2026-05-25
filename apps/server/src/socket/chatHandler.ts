import { Server, Socket } from 'socket.io'
import { logger } from '../utils/logger'

export const registerChatHandler = (io: Server, socket: Socket) => {
  // Thêm dòng này
  socket.on('join:room', ({ roomId }: { roomId: string }) => {
    socket.join(roomId)
    logger.info(`${socket.id} joined room ${roomId}`)
  })

  socket.on('chat:message', ({ roomId, message, displayName }: {
    roomId: string
    message: string
    displayName: string
  }) => {
    logger.info(`[${roomId}] ${displayName}: ${message}`)
    io.to(roomId).emit('chat:message', {
      id: Date.now().toString(),
      message,
      displayName,
      timestamp: new Date().toISOString(),
      isSelf: false
    })
  })

  socket.on('chat:typing', ({ roomId, displayName }: { roomId: string; displayName: string }) => {
    socket.to(roomId).emit('chat:typing', { displayName })
  })

  socket.on('chat:leave', ({ roomId }: { roomId: string }) => {
    socket.to(roomId).emit('chat:partner_left')
    socket.leave(roomId)
  })
}