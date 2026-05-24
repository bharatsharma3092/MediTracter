import cron from 'node-cron'

export function registerAlertJob() {
  cron.schedule('0 8 * * *', () => {
    // Alerts are now user-scoped and evaluated on-demand via the API
  })
}
