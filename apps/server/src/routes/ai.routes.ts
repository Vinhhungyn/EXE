import { Router } from 'express'
import { sendMessage } from '../controllers/ai.controller'

const router = Router()

router.post('/message', sendMessage)

export default router