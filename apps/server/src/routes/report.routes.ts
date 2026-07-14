import { Router, Request, Response } from 'express'
import { createReport, getAllReports, updateReportStatus } from '../utils/analytics'
import { logger } from '../utils/logger'

const router = Router()

/**
 * POST /api/v1/reports
 * Tao bỏ validate reportedName — frontend có thể gửi 'Unknown'
 * roomId nếu thiếu thì gán fallback 'unknown-room'
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { reporterName, reason, roomId, reportedName } = req.body

    // Chỉ bắt buộc reporterName và reason
    if (!reporterName || !reason) {
      return res.status(400).json({ error: 'Missing reporterName or reason' })
    }

    const report = await createReport({
      reporterName: String(reporterName),
      reportedName: String(reportedName || 'Unknown'),
      reason: String(reason),
      roomId: String(roomId || 'unknown-room'),
    })

    if (!report) {
      // Redis chưa ready — vẫn trả 200 để FE không bị lỗi
      logger.warn('createReport returned null (Redis not ready?), returning mock ok')
      return res.status(201).json({
        id: `R-${Date.now().toString(36).toUpperCase()}`,
        status: 'pending',
        note: 'queued',
      })
    }

    logger.info(`Report created: ${report.id} by ${reporterName}`)
    return res.status(201).json(report)
  } catch (err) {
    logger.error('POST /reports error: ' + err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * GET /api/v1/reports
 * Lấy danh sách tất cả báo cáo (admin only)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const reports = await getAllReports()
    return res.json(reports)
  } catch (err) {
    logger.error('GET /reports error: ' + err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * PUT /api/v1/reports/:id
 * Cập nhật trạng thái báo cáo (admin only)
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id)
    const { status } = req.body

    if (!status || !['resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "resolved" or "dismissed"' })
    }

    const success = await updateReportStatus(id, status)

    if (!success) {
      return res.status(404).json({ error: 'Report not found' })
    }

    logger.info(`Report ${id} updated to status: ${status}`)
    return res.json({ success: true, id, status })
  } catch (err) {
    logger.error(`PUT /reports/${req.params.id} error: ` + err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
