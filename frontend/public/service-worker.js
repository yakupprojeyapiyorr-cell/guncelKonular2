self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: {
      url: data.url,
    },
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.notification.data?.url) {
    event.waitUntil(self.clients.openWindow(event.notification.data.url))
  }
})
