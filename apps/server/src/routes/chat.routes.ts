import { Router } from 'express'
import { createSession, getMe } from '../controllers/chat.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.post('/session', createSession)       // Tạo session ẩn danh
router.get('/me', authMiddleware, getMe)     // Lấy thông tin session

export default router