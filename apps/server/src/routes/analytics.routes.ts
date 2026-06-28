import { Router } from 'express'
import { getStatsSnapshot, getRecentUsers } from '../utils/analytics'

const router = Router()

router.get('/overview', async (req, res) => {
  const stats = await getStatsSnapshot()
  const recentUsers = await getRecentUsers(10)
  res.json({ stats, recentUsers })
})

export default router
