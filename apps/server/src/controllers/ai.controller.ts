import { Request, Response } from 'express'
import { chatWithAI, Message } from '../services/ai.service'
import { logger } from '../utils/logger'

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { messages } = req.body as { messages: Message[] }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages không hợp lệ' })
    }

    const reply = await chatWithAI(messages)

    return res.json({ reply })
  } catch (error) {
    logger.error('AI chat error:', error)
    return res.status(500).json({ error: 'Lỗi server, thử lại sau' })
  }
}