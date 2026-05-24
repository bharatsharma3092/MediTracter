import { NextFunction, Request, Response } from 'express'

function userIdFromEmail(email: string): string {
  return 'user_' + email.toLowerCase().replace(/[^a-z0-9]/g, '_')
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const email = req.header('x-demo-email') ?? 'demo@meditrack.local'
  req.user = {
    id: userIdFromEmail(email),
    email
  }
  next()
}
