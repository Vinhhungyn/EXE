import { Request, Response } from 'express'
import { createAnonymousSession } from '../services/chat.service'

export const createSession = async (req: Request, res: Response) => {
  try {
    const session = await createAnonymousSession()
    res.status(201).json(session)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create session' })
  }
}

// Session không còn lưu DB — getMe luôn trả 404
export const getMe = async (req: Request, res: Response) => {
  res.status(404).json({ error: 'Session not found' })
}
