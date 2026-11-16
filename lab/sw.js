/* 实验版「站在星空里」已收掉（2026-11-16）：清掉自己的离线缓存、注销自己，把页面送回正式版 */
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.includes('/lab/')).map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((cs) => cs.forEach((c) => c.navigate(new URL('../', self.registration.scope).href))),
  )
})
