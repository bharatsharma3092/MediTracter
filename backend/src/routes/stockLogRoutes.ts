import { Router } from 'express'
import { stockLogController } from '../controllers/stockLogController'

export const stockLogRoutes = Router()

stockLogRoutes.get('/:itemId', stockLogController.list)
stockLogRoutes.post('/', stockLogController.create)
stockLogRoutes.delete('/:id', stockLogController.remove)
