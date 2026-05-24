export async function sendNotification(_userId: string, _title: string, _body: string) {
  return { delivered: false, reason: 'Push provider is not configured in local demo mode.' }
}
