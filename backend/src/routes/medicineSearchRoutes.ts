import { Router } from 'express'
import { medicineSearchController } from '../controllers/medicineSearchController'

export const medicineSearchRoutes = Router()

medicineSearchRoutes.get('/search', medicineSearchController.search)
