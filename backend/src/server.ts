import { app } from './app'
import { env } from './config/env'
import { registerAlertJob } from './jobs/alertJob'
import { initialize as initMedicineDataset } from './services/medicineDatasetService'

registerAlertJob()

// Pre-initialize / pre-download the Indian medicines dataset in the background
initMedicineDataset().catch((err) => {
  console.error('[server] Failed to pre-initialize medicine dataset:', err.message)
})

app.listen(env.PORT, () => {
  console.log(`MediTrack Pro API listening on http://localhost:${env.PORT}`)
})
