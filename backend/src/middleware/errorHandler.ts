import { NextFunction, Request, Response } from 'express'
import { failure } from '../utils/responseHelper'

export function notFound(_req: Request, res: Response) {
  return failure(res, 'Route not found', 404)
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  const message = error instanceof Error ? error.message : 'Unexpected server error'
  return failure(res, message, 500)
}
