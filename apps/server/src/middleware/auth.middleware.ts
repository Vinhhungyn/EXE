import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AnonymousPayload {
  sessionId: string
  displayName: string
}

declare global {
  namespace Express {
    interface Request {
      session?: AnonymousPayload
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    res.status(401).json({ error: 'No token provided' })
    return
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as AnonymousPayload
    req.session = payload
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}