import rateLimit from 'express-rate-limit'

export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100,
  message: { error: 'Too many requests, please try again later' }
})

export const chatRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 30,
  message: { error: 'Too many messages' }
})