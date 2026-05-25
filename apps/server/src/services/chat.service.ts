import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { logger } from '../utils/logger'

const prisma = new PrismaClient()

const ADJECTIVES = ['Mây', 'Gió', 'Sao', 'Trăng', 'Nắng', 'Mưa', 'Biển', 'Núi', 'Hoa', 'Lá']
const NOUNS = ['Xanh', 'Vàng', 'Hồng', 'Tím', 'Trắng', 'Bạc', 'Vui', 'Hiền', 'Dịu', 'Nhẹ']

const generateDisplayName = () => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const num = Math.floor(1000 + Math.random() * 9000)
  return `${adj}${noun}#${num}`
}

export const createAnonymousSession = async () => {
  const displayName = generateDisplayName()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

  const session = await prisma.anonymousSession.create({
    data: { displayName, expiresAt, sessionToken: 'temp' }
  })

  const token = jwt.sign(
    { sessionId: session.id, displayName },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '24h' }
  )

  await prisma.anonymousSession.update({
    where: { id: session.id },
    data: { sessionToken: token, isOnline: true }
  })

  logger.info(`New session: ${displayName}`)
  return { token, displayName, sessionId: session.id, expiresAt }
}

export const getSession = async (sessionId: string) => {
  return prisma.anonymousSession.findUnique({ where: { id: sessionId } })
}