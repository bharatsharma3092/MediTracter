import { Request, Response } from 'express'
import { z } from 'zod'
import { settings } from '../services/memoryStore'
import { success } from '../utils/responseHelper'

const settingsSchema = z.object({
  coverMonths: z.coerce.number().min(1).optional(),
  consumptionWindow: z.coerce.number().refine((value) => [30, 60, 90].includes(value)).optional(),
  leadTimeDays: z.coerce.number().min(0).optional(),
  bufferDays: z.coerce.number().min(0).optional(),
  pushEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional()
})

export const userController = {
  getMe(req: Request, res: Response) {
    return success(res, { user: req.user, settings })
  },
  updateSettings(req: Request, res: Response) {
    Object.assign(settings, settingsSchema.parse(req.body))
    return success(res, settings, 'Settings updated')
  },
  subscribePush(_req: Request, res: Response) {
    return success(res, { subscribed: false, mode: 'local-demo' })
  }
}
