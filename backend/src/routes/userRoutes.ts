import { Router } from 'express'
import { userController } from '../controllers/userController'

export const userRoutes = Router()

userRoutes.get('/me', userController.getMe)
userRoutes.put('/settings', userController.updateSettings)
userRoutes.post('/push-subscribe', userController.subscribePush)
