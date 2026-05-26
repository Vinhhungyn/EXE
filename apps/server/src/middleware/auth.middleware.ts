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
    // ✅ FIX BUG 4 — Throw nếu không có JWT_SECRET thay vì fallback 'secret'
    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET is not set in .env')

    const payload = jwt.verify(token, secret) as AnonymousPayload
    req.session = payload
    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
}