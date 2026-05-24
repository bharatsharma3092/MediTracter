import { Router } from 'express'
import { itemController } from '../controllers/itemController'

export const itemRoutes = Router()

itemRoutes.get('/', itemController.list)
itemRoutes.post('/', itemController.create)
itemRoutes.post('/import-local', itemController.importLocal)
itemRoutes.get('/:id', itemController.getOne)
itemRoutes.put('/:id', itemController.update)
itemRoutes.delete('/:id', itemController.remove)
itemRoutes.get('/:id/reorder', itemController.reorderCalc)
