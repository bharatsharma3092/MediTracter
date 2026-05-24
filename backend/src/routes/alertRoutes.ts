import { Router } from 'express'
import { alertController } from '../controllers/alertController'

export const alertRoutes = Router()

alertRoutes.get('/', alertController.list)
alertRoutes.put('/dismiss-all', alertController.dismissAll)
alertRoutes.post('/check', alertController.runCheck)
alertRoutes.put('/:id/dismiss', alertController.dismiss)
