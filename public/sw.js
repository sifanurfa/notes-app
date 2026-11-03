const CACHE_NAME = 'notes-app-v1'
const APP_SHELL_URL = new URL('./', self.registration.scope).href
const MANIFEST_URL = new URL('./manifest.webmanifest', self.registration.scope).href
const ICON_URLS = [
  new URL('./icons/icon-192.png', self.registration.scope).href,
  new URL('./icons/icon-512.png', self.registration.scope).href,
  new URL('./favicon.svg', self.registration.scope).href,
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      const response = await fetch(APP_SHELL_URL, { cache: 'reload' })
      if (!response.ok) {
        throw new Error(`Failed to cache app shell: ${response.status}`)
      }

      const html = await response.text()
      await cache.put(APP_SHELL_URL, new Response(html, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      }))

      const assetUrls = Array.from(
        html.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css))(?:\?[^"']*)?["']/g),
        (match) => new URL(match[1], APP_SHELL_URL).href,
      )
      await cache.addAll([MANIFEST_URL, ...ICON_URLS, ...assetUrls])
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('notes-app-') && cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      )
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url)
  if (event.request.method !== 'GET' || requestUrl.origin !== self.location.origin) {
    return
  }

  if (!requestUrl.href.startsWith(self.registration.scope)) {
    return
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      const cachedResponse = await cache.match(event.request, { ignoreVary: true })
      if (cachedResponse) {
        return cachedResponse
      }

      if (event.request.mode === 'navigate') {
        const appShell = await cache.match(APP_SHELL_URL, { ignoreVary: true })
        if (appShell) {
          return appShell
        }
      }

      return fetch(event.request)
    })(),
  )
})
