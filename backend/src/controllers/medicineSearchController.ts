import { Request, Response } from 'express'
import { success } from '../utils/responseHelper'
import { search } from '../services/medicineDatasetService'

export const medicineSearchController = {
  async search(req: Request, res: Response) {
    const q = String(req.query.q || '').trim()
    if (q.length < 2) {
      return success(res, [])
    }

    try {
      const results = await search(q)
      return success(res, results)
    } catch {
      // In case of any error, gracefully return empty results
      return success(res, [])
    }
  }
}
