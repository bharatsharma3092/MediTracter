import { RequestUser } from './domain'

declare global {
  namespace Express {
    interface Request {
      user: RequestUser
    }
  }
}
