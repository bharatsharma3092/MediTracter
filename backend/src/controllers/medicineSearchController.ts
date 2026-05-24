import { Request, Response } from 'express'
import { success, failure } from '../utils/responseHelper'

interface OpenFDAResult {
  openfda?: {
    brand_name?: string[]
    generic_name?: string[]
    substance_name?: string[]
    route?: string[]
  }
}

interface MedicineResult {
  name: string
  generic: string
  category: string
}

const OPENFDA_URL = 'https://api.fda.gov/drug/label.json'

export const medicineSearchController = {
  async search(req: Request, res: Response) {
    const q = String(req.query.q || '').trim()
    if (q.length < 2) {
      return success(res, [])
    }

    try {
      const searchQuery = `openfda.brand_name:"${q}"+openfda.generic_name:"${q}"`
      const url = `${OPENFDA_URL}?search=${encodeURIComponent(searchQuery)}&limit=10`

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(url, { signal: controller.signal })
      clearTimeout(timeout)

      if (!response.ok) {
        return success(res, [])
      }

      const data = await response.json()
      const results: MedicineResult[] = []
      const seen = new Set<string>()

      for (const item of (data.results || []) as OpenFDAResult[]) {
        const openfda = item.openfda
        if (!openfda) continue

        const brands = openfda.brand_name || []
        const generics = openfda.generic_name || []
        const substances = openfda.substance_name || []
        const routes = openfda.route || []

        const genericName = generics[0] || substances[0] || ''
        const category = routes[0] || 'Medicine'

        for (const brand of brands) {
          const key = brand.toLowerCase()
          if (!seen.has(key)) {
            seen.add(key)
            results.push({ name: brand, generic: genericName, category })
          }
        }

        // Also add generic name if not already present
        if (genericName && !seen.has(genericName.toLowerCase())) {
          seen.add(genericName.toLowerCase())
          results.push({ name: genericName, generic: genericName, category })
        }
      }

      return success(res, results.slice(0, 8))
    } catch {
      // API timeout or network error — return empty results gracefully
      return success(res, [])
    }
  }
}
