import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const schema = z.object({
  PORT: z.coerce.number().default(4000),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
})

export const env = schema.parse(process.env)
