// AgentApply Service Worker
// PWA çevrimdışı destek ve önbellek yönetimi

const CACHE_NAME = 'agentapply-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
]

// Kurulum — Statik dosyaları önbelleğe al
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Statik dosyalar önbelleğe alınıyor...')
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Aktivasyon — Eski önbellekleri temizle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch — Network-first stratejisi
self.addEventListener('fetch', (event) => {
  // API isteklerini önbelleğe alma
  if (event.request.url.includes('/api/')) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Başarılı yanıtı önbelleğe al
        const responseClone = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone)
        })
        return response
      })
      .catch(() => {
        // Ağ hatası — önbellekten dön
        return caches.match(event.request)
      })
  )
})
