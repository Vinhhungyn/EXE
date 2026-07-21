import jwt from 'jsonwebtoken'
import { logger } from '../utils/logger'

const ADJECTIVES = ['Mây', 'Gió', 'Sao', 'Trăng', 'Nắng', 'Mưa', 'Biển', 'Núi', 'Hoa', 'Lá']
const NOUNS = ['Xanh', 'Vàng', 'Hồng', 'Tím', 'Trắng', 'Bạc', 'Vui', 'Hiền', 'Dịu', 'Nhẹ']

const generateDisplayName = () => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const num = Math.floor(1000 + Math.random() * 9000)
  return `${adj}${noun}#${num}`
}

// Không dùng Prisma để tránh DB cold start làm treo session
export const createAnonymousSession = async () => {
  const displayName = generateDisplayName()
  const sessionId = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

  const token = jwt.sign(
    { sessionId, displayName },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '24h' }
  )

  logger.info(`New session (no-db): ${displayName}`)
  return { token, displayName, sessionId, expiresAt }
}

// getSession vẫn giữ để không break các chỗ khác dùng
export const getSession = async (_sessionId: string) => {
  return null
}
