import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware'
import { alertRoutes } from './alertRoutes'
import { itemRoutes } from './itemRoutes'
import { medicineSearchRoutes } from './medicineSearchRoutes'
import { reportRoutes } from './reportRoutes'
import { stockLogRoutes } from './stockLogRoutes'
import { userRoutes } from './userRoutes'

export const apiRoutes = Router()

apiRoutes.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }))
apiRoutes.use(authMiddleware)
apiRoutes.use('/items', itemRoutes)
apiRoutes.use('/medicines', medicineSearchRoutes)
apiRoutes.use('/stock-logs', stockLogRoutes)
apiRoutes.use('/alerts', alertRoutes)
apiRoutes.use('/reports', reportRoutes)
apiRoutes.use('/users', userRoutes)
