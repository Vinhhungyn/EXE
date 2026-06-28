'use client'
import { useEffect, useState } from 'react'

export type TrustBadge = {
  key: string
  emoji: string
  label: string
  description: string
  minPoints: number
}

export const TRUST_BADGES: TrustBadge[] = [
  { key: 'newcomer', emoji: '🌱', label: 'Người mới', description: 'Mới bắt đầu hành trình tại Relax&Chill', minPoints: 0 },
  { key: 'good_listener', emoji: '🌟', label: 'Người lắng nghe tốt', description: 'Đã dành thời gian tâm sự và check-in đều đặn', minPoints: 30 },
  { key: 'steady_companion', emoji: '🌿', label: 'Người bạn kiên định', description: 'Đồng hành lâu dài, luôn chia sẻ cảm xúc thật', minPoints: 70 },
  { key: 'trusted_soul', emoji: '💎', label: 'Tâm hồn tin cậy', description: 'Là điểm tựa đáng tin cậy trong cộng đồng ẩn danh', minPoints: 150 },
]

const POINTS_KEY = 'rc_trust_points'
const EVENTS_KEY = 'rc_trust_events'

type TrustEvent = {
  type: 'chat_completed' | 'mood_checkin' | 'end_checkin' | 'no_report' | 'voice_note_sent'
  points: number
  date: string
}

const POINT_VALUES: Record<TrustEvent['type'], number> = {
  chat_completed: 5,
  mood_checkin: 4,
  end_checkin: 6,
  no_report: 2,
  voice_note_sent: 3,
}

function readPoints(): number {
  if (typeof window === 'undefined') return 0
  const raw = localStorage.getItem(POINTS_KEY)
  return raw ? parseInt(raw, 10) || 0 : 0
}

function writePoints(points: number) {
  localStorage.setItem(POINTS_KEY, String(points))
}

/**
 * Cộng điểm tin cậy cho một hành vi tốt. Gọi từ bất kỳ trang nào
 * (mood check-in, end-of-chat check-in, hoàn thành cuộc chat, gửi voice note...).
 * Hoàn toàn ẩn danh — không gắn với danh tính thật, chỉ lưu local trên máy người dùng.
 */
export function addTrustPoints(type: TrustEvent['type']) {
  if (typeof window === 'undefined') return
  const points = readPoints() + POINT_VALUES[type]
  writePoints(points)
  try {
    const events: TrustEvent[] = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]')
    events.unshift({ type, points: POINT_VALUES[type], date: new Date().toISOString() })
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(0, 100)))
  } catch {
    // ignore corrupt event log, points already saved
  }
  return points
}

export function getCurrentBadge(points: number): TrustBadge {
  let current = TRUST_BADGES[0]
  for (const badge of TRUST_BADGES) {
    if (points >= badge.minPoints) current = badge
  }
  return current
}

export function getNextBadge(points: number): TrustBadge | null {
  return TRUST_BADGES.find(b => b.minPoints > points) ?? null
}

/**
 * Hook đọc điểm tin cậy + badge hiện tại của người dùng (ẩn danh, local-only).
 */
export function useTrustBadge() {
  const [points, setPoints] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setPoints(readPoints())
    setLoaded(true)
  }, [])

  const badge = getCurrentBadge(points)
  const next = getNextBadge(points)
  const progress = next ? Math.min(1, (points - badge.minPoints) / (next.minPoints - badge.minPoints)) : 1

  return { points, badge, next, progress, loaded }
}
