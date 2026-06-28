import { Server, Socket } from 'socket.io'
import { logger } from '../utils/logger'
import { incrAiMessagesToday, incrVoiceNotesToday, createReport } from '../utils/analytics'

export const registerChatHandler = (io: Server, socket: Socket) => {
  // Thêm dòng này
  socket.on('join:room', ({ roomId }: { roomId: string }) => {
    socket.join(roomId)
    logger.info(`${socket.id} joined room ${roomId}`)
  })

  socket.on('chat:message', ({ roomId, message, displayName, type, audioData, duration }: {
    roomId: string
    message: string
    displayName: string
    type?: 'text' | 'voice'
    audioData?: string
    duration?: number
  }) => {
    logger.info(`[${roomId}] ${displayName}: ${type === 'voice' ? '[voice note]' : message}`)
    if (type === 'voice') {
      incrVoiceNotesToday()
    }
    io.to(roomId).emit('chat:message', {
      id: Date.now().toString(),
      message,
      displayName,
      type: type ?? 'text',
      audioData: audioData ?? null,
      duration: duration ?? null,
      timestamp: new Date().toISOString(),
      isSelf: false
    })
  })

  socket.on('chat:typing', ({ roomId, displayName }: { roomId: string; displayName: string }) => {
    socket.to(roomId).emit('chat:typing', { displayName })
  })

  socket.on('chat:reaction', ({ roomId, messageId, emoji, displayName }: {
    roomId: string
    messageId: string
    emoji: string
    displayName: string
  }) => {
    logger.info(`[${roomId}] ${displayName} reacted ${emoji} to ${messageId}`)
    io.to(roomId).emit('chat:reaction', { messageId, emoji, displayName })
  })

  socket.on('chat:report', async ({ roomId, reporterName, reportedName, reason }: {
    roomId: string
    reporterName: string
    reportedName: string
    reason: string
  }) => {
    logger.info(`[${roomId}] REPORT: ${reporterName} reported ${reportedName} for "${reason}"`)
    const entry = await createReport({ roomId, reporterName, reportedName, reason })
    socket.emit('chat:report_received', { ok: !!entry })
  })

  socket.on('chat:leave', ({ roomId }: { roomId: string }) => {
    socket.to(roomId).emit('chat:partner_left')
    socket.leave(roomId)
  })
}
