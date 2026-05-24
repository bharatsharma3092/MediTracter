import { Router } from 'express'
import { reportController } from '../controllers/reportController'

export const reportRoutes = Router()

reportRoutes.post('/reorder', reportController.reorder)
reportRoutes.post('/inventory', reportController.inventory)
reportRoutes.get('/history', reportController.history)
reportRoutes.get('/:id/pdf', reportController.getPdf)
