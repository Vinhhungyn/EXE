import { createClient } from 'redis'
import { logger } from './logger'

export const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 10000, // 10s timeout, tránh treo vô hạn
    tls: process.env.REDIS_URL?.startsWith('rediss://') ? true : undefined
  }
})

redis.on('error', (err) => logger.error('Redis error: ' + err))
redis.on('connect', () => logger.info('✅ Redis connected'))

export const connectRedis = async () => {
  await redis.connect()
}