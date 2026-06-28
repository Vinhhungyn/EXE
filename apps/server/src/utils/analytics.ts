import { redis } from './redis'
import { logger } from './logger'

/**
 * Số liệu thống kê thật, lưu qua Redis trên server (Render).
 * Không lưu danh tính thật của ai — chỉ đếm số liệu tổng hợp + nickname ẩn danh
 * (Mây#4821...) vốn đã được dùng làm display name trong toàn app.
 */

const todayKey = (prefix: string) => {
  const d = new Date().toISOString().slice(0, 10) // YYYY-MM-DD (UTC)
  return `${prefix}:${d}`
}

const safe = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    if (!redis.isOpen) return fallback
    return await fn()
  } catch (err) {
    logger.error('Analytics redis error: ' + err)
    return fallback
  }
}

// ---- Counters ----

export const incrTotalUsers = () => safe(() => redis.incr('rc:stats:total_users'), 0)

export const incrChatSessionsToday = () => safe(() => redis.incr(todayKey('rc:stats:chat_sessions')), 0)

export const incrAiMessagesToday = () => safe(() => redis.incr(todayKey('rc:stats:ai_messages')), 0)

export const incrVoiceNotesToday = () => safe(() => redis.incr(todayKey('rc:stats:voice_notes')), 0)

export const getStatsSnapshot = () => safe(async () => {
  const [totalUsers, chatSessionsToday, aiMessagesToday, pendingReports] = await Promise.all([
    redis.get('rc:stats:total_users'),
    redis.get(todayKey('rc:stats:chat_sessions')),
    redis.get(todayKey('rc:stats:ai_messages')),
    redis.lLen('rc:reports:pending'),
  ])
  return {
    totalUsers: parseInt(totalUsers || '0', 10),
    chatSessionsToday: parseInt(chatSessionsToday || '0', 10),
    aiMessagesToday: parseInt(aiMessagesToday || '0', 10),
    pendingReports,
  }
}, { totalUsers: 0, chatSessionsToday: 0, aiMessagesToday: 0, pendingReports: 0 })

// ---- Recent anonymous users (display-name only, no PII) ----

export type RecentUserEntry = {
  name: string
  joinedAt: string
  mode: 'AI Chat' | 'Người dùng'
}

export const trackRecentUser = (entry: RecentUserEntry) => safe(async () => {
  await redis.lPush('rc:recent_users', JSON.stringify(entry))
  await redis.lTrim('rc:recent_users', 0, 49)
  return true
}, false)

export const getRecentUsers = (limit = 10) => safe(async () => {
  const raw = await redis.lRange('rc:recent_users', 0, limit - 1)
  return raw.map(r => JSON.parse(r) as RecentUserEntry)
}, [] as RecentUserEntry[])

// ---- Reports ----

export type ReportEntry = {
  id: string
  reporterName: string
  reportedName: string
  reason: string
  roomId: string
  createdAt: string
  status: 'pending' | 'resolved' | 'dismissed'
}

export const createReport = (report: Omit<ReportEntry, 'id' | 'createdAt' | 'status'>) => safe(async () => {
  const entry: ReportEntry = {
    ...report,
    id: `R-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
  }
  await redis.lPush('rc:reports:pending', JSON.stringify(entry))
  await redis.lTrim('rc:reports:pending', 0, 199)
  return entry
}, null)

export const getAllReports = () => safe(async () => {
  const raw = await redis.lRange('rc:reports:pending', 0, -1)
  return raw.map(r => JSON.parse(r) as ReportEntry)
}, [] as ReportEntry[])

export const updateReportStatus = (id: string, status: 'resolved' | 'dismissed') => safe(async () => {
  const raw = await redis.lRange('rc:reports:pending', 0, -1)
  const idx = raw.findIndex(r => (JSON.parse(r) as ReportEntry).id === id)
  if (idx === -1) return false
  const entry = JSON.parse(raw[idx]) as ReportEntry
  entry.status = status
  await redis.lSet('rc:reports:pending', idx, JSON.stringify(entry))
  return true
}, false)
