import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import { connectRedis } from './utils/redis'
import { logger } from './utils/logger'
import healthRouter from './routes/health.routes'
import chatRouter from './routes/chat.routes'
import { globalRateLimit } from './middleware/rateLimit.middleware'
import { initSocket } from './socket/index'

dotenv.config()

// ✅ Danh sách domain được phép
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://relax-chill.vercel.app',
  process.env.FRONTEND_URL, // thêm env để linh hoạt sau này
].filter(Boolean) as string[]

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true
  }
})

app.use(helmet())
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true
}))
app.use(express.json())
app.use(globalRateLimit)

app.use('/health', healthRouter)
app.use('/api/v1/chat', chatRouter)

initSocket(io)

const PORT = process.env.PORT || 3001

const start = async () => {
  await connectRedis()
  httpServer.listen(PORT, () => {
    logger.info(`🌿 Server running on port ${PORT}`)
    logger.info(`✅ Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`)
  })
}

start()