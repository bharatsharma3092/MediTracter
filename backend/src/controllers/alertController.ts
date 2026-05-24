import { Request, Response } from 'express'
import { evaluateAll, listAlerts } from '../services/alertService'
import { getAlerts } from '../services/memoryStore'
import { success } from '../utils/responseHelper'

export const alertController = {
  list(req: Request, res: Response) {
    return success(res, evaluateAll(req.user.id))
  },
  dismiss(req: Request, res: Response) {
    const alert = getAlerts(req.user.id).find((entry) => entry.id === req.params.id)
    if (alert) alert.dismissed = true
    return success(res, listAlerts(req.user.id))
  },
  dismissAll(req: Request, res: Response) {
    listAlerts(req.user.id).forEach((alert) => {
      const source = getAlerts(req.user.id).find((entry) => entry.id === alert.id)
      if (source) source.dismissed = true
    })
    return success(res, [])
  },
  runCheck(req: Request, res: Response) {
    return success(res, evaluateAll(req.user.id))
  }
}
