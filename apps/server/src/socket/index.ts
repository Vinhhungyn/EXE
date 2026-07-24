import { Server, Socket } from 'socket.io'
import { logger } from '../utils/logger'
import { registerChatHandler } from './chatHandler'
import { registerMatchHandler } from './matchHandler'
import { setIO } from './ioInstance'

export const initSocket = (io: Server) => {
  setIO(io)

  io.on('connection', (socket: Socket) => {
    logger.info(`Connected: ${socket.id}`)

    registerMatchHandler(io, socket)
    registerChatHandler(io, socket)

    socket.on('disconnect', () => {
      logger.info(`Disconnected: ${socket.id}`)
    })
  })
}
