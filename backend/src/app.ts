import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { env } from './config/env'
import { errorHandler, notFound } from './middleware/errorHandler'
import { apiRoutes } from './routes'

export const app = express()

app.use(helmet())
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use('/api/v1', apiRoutes)
app.use(notFound)
app.use(errorHandler)
