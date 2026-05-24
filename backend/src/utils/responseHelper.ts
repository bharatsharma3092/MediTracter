import { Response } from 'express'

export function success<T>(res: Response, data: T, message?: string, status = 200) {
  return res.status(status).json({ success: true, data, message })
}

export function failure(res: Response, message: string, status = 400) {
  return res.status(status).json({ success: false, error: message })
}
