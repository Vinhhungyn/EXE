import { Request, Response } from 'express'
import { createAnonymousSession, getSession } from '../services/chat.service'

export const createSession = async (req: Request, res: Response) => {
  try {
    const session = await createAnonymousSession()
    res.status(201).json(session)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create session' })
  }
}

export const getMe = async (req: Request, res: Response) => {
  try {
    const session = await getSession(req.session!.sessionId)
    if (!session) {
      res.status(404).json({ error: 'Session not found' })
      return
    }
    res.json({ sessionId: session.id, displayName: session.displayName, isOnline: session.isOnline })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
}