import { redis } from './redis'
import { logger } from './logger'

/**
 * Hệ thống moderation cho Relax&Chill.
 * Lưu trạng thái user (normal / warned / banned) vào Redis.
 * Dùng nickname ẩn danh làm key — không lưu PII.
 */

export type UserModerationStatus = {
  name: string
  status: 'normal' | 'warned' | 'banned'
  reason?: string
  adminNote?: string
  warnCount: number
  updatedAt: string
}

const safe = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    if (!redis.isOpen) return fallback
    return await fn()
  } catch (err) {
    logger.error('Moderation redis error: ' + err)
    return fallback
  }
}

const userKey = (name: string) => `rc:moderation:user:${name}`

export const getUserStatus = (name: string) =>
  safe(async () => {
    const raw = await redis.get(userKey(name))
    if (!raw) {
      return {
        name,
        status: 'normal' as const,
        warnCount: 0,
        updatedAt: new Date().toISOString(),
      }
    }
    return JSON.parse(raw) as UserModerationStatus
  }, { name, status: 'normal' as const, warnCount: 0, updatedAt: new Date().toISOString() })

export const warnUser = (name: string, reason: string, adminNote?: string) =>
  safe(async () => {
    const existing = await getUserStatus(name)
    const updated: UserModerationStatus = {
      ...existing,
      name,
      status: 'warned',
      reason,
      adminNote,
      warnCount: (existing.warnCount || 0) + 1,
      updatedAt: new Date().toISOString(),
    }
    await redis.set(userKey(name), JSON.stringify(updated))
    // track vào danh sách user bị xử lý
    await redis.sAdd('rc:moderation:tracked_users', name)
    return updated
  }, null)

export const banUser = (name: string, reason: string, adminNote?: string) =>
  safe(async () => {
    const existing = await getUserStatus(name)
    const updated: UserModerationStatus = {
      ...existing,
      name,
      status: 'banned',
      reason,
      adminNote,
      warnCount: existing.warnCount || 0,
      updatedAt: new Date().toISOString(),
    }
    await redis.set(userKey(name), JSON.stringify(updated))
    await redis.sAdd('rc:moderation:tracked_users', name)
    return updated
  }, null)

export const unbanUser = (name: string) =>
  safe(async () => {
    const existing = await getUserStatus(name)
    const updated: UserModerationStatus = {
      ...existing,
      name,
      status: 'normal',
      reason: undefined,
      adminNote: undefined,
      updatedAt: new Date().toISOString(),
    }
    await redis.set(userKey(name), JSON.stringify(updated))
    return updated
  }, null)

export const getAllUserStatuses = () =>
  safe(async () => {
    const names = await redis.sMembers('rc:moderation:tracked_users')
    if (!names.length) return []
    const statuses = await Promise.all(names.map(n => getUserStatus(n)))
    return statuses.sort((a, b) => {
      // banned trước, warned sau, normal cuối
      const order = { banned: 0, warned: 1, normal: 2 }
      return order[a.status] - order[b.status]
    })
  }, [] as UserModerationStatus[])

/**
 * Check nhanh user có bị ban không — dùng trong socket khi user join
 */
export const isUserBanned = (name: string) =>
  safe(async () => {
    const status = await getUserStatus(name)
    return status.status === 'banned'
  }, false)
