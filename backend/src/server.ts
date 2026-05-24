import { app } from './app'
import { env } from './config/env'
import { registerAlertJob } from './jobs/alertJob'

registerAlertJob()

app.listen(env.PORT, () => {
  console.log(`MediTrack Pro API listening on http://localhost:${env.PORT}`)
})
