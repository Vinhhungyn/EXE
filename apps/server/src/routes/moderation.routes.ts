import { Router, Request, Response } from 'express'
import { logger } from '../utils/logger'
import {
  warnUser,
  banUser,
  unbanUser,
  getUserStatus,
  getAllUserStatuses,
  getBanTTL,
} from '../utils/moderation'
import { getIO } from '../socket/ioInstance'

const router = Router()

/**
 * GET /api/v1/moderation/users
 */
router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await getAllUserStatuses()
    return res.json(users)
  } catch (err) {
    logger.error('GET /moderation/users error: ' + err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * GET /api/v1/moderation/users/:name
 */
router.get('/users/:name', async (req: Request, res: Response) => {
  try {
    const name = String(req.params.name)
    const status = await getUserStatus(name)
    return res.json(status)
  } catch (err) {
    logger.error(`GET /moderation/users/${req.params.name} error: ` + err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * PUT /api/v1/moderation/users/:name/warn
 */
router.put('/users/:name/warn', async (req: Request, res: Response) => {
  try {
    const name = String(req.params.name)
    const { reason, adminNote } = req.body
    if (!reason) return res.status(400).json({ error: 'Missing reason' })

    const result = await warnUser(name, reason, adminNote)

    // Emit cảnh cáo đến socket của user (nếu đang online)
    const io = getIO()
    if (io) {
      io.emit(`moderation:warn:${name}`, {
        message: 'Bạn đã bị cảnh cáo do vi phạm nội quy.',
        reason,
      })
    }

    logger.info(`User warned: ${name} — reason: ${reason}`)
    return res.json(result)
  } catch (err) {
    logger.error(`PUT /moderation/users/${req.params.name}/warn error: ` + err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * PUT /api/v1/moderation/users/:name/ban
 * Khóa user 10 phút — tự động mở sau khi TTL Redis hết
 */
router.put('/users/:name/ban', async (req: Request, res: Response) => {
  try {
    const name = String(req.params.name)
    const { reason, adminNote } = req.body
    if (!reason) return res.status(400).json({ error: 'Missing reason' })

    const result = await banUser(name, reason, adminNote)
    const ttl = await getBanTTL(name)

    // Emit kick event đến tất cả socket đang dùng displayName này
    const io = getIO()
    if (io) {
      io.emit(`moderation:ban:${name}`, {
        message: 'Bạn đã bị khóa 10 phút do vi phạm nội quy.',
        reason,
        banSeconds: ttl,
      })
    }

    logger.info(`User banned: ${name} — reason: ${reason}`)
    return res.json(result)
  } catch (err) {
    logger.error(`PUT /moderation/users/${req.params.name}/ban error: ` + err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * PUT /api/v1/moderation/users/:name/unban
 */
router.put('/users/:name/unban', async (req: Request, res: Response) => {
  try {
    const name = String(req.params.name)
    const result = await unbanUser(name)
    logger.info(`User unbanned: ${name}`)
    return res.json(result)
  } catch (err) {
    logger.error(`PUT /moderation/users/${req.params.name}/unban error: ` + err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
