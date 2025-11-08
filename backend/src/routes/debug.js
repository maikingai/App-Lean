import express from 'express'
import pbAdmin from '../pbAdminClient.js'
import pbAuth from '../middlewares/pbAuth.js'

const router = express.Router()

// POST /api/debug/seed-classes
// Create 3 sample classes for the authenticated teacher user.
router.post('/seed-classes', pbAuth, async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(400).json({ success: false, message: 'User id missing' })

    const samples = [
      { name: 'Math', section: 'M4/1', teacher: userId },
      { name: 'Math', section: 'M4/2', teacher: userId },
      { name: 'Math', section: 'M4/3', teacher: userId },
    ]

    const created = []
    for (const s of samples) {
      try {
        const r = await pbAdmin.collection('classes').create(s)
        created.push(r)
      } catch (e) {
        // continue on error but record it
        created.push({ error: String(e), input: s })
      }
    }

    return res.json({ success: true, created })
  } catch (e) {
    return res.status(500).json({ success: false, message: e?.message || String(e) })
  }
})

export default router
