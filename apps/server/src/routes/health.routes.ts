import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Relax&Chill API running 🌿', timestamp: new Date() })
})

export default router