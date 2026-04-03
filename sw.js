// ══════════════════════════════════════════════════════════
// TALCO PWA - Service Worker
// Version: 1.0.0
// ══════════════════════════════════════════════════════════

const CACHE_NAME = 'talco-pwa-v1';
const OFFLINE_URL = './offline.html';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo-centre-talco-lr-seul.pdf.png',
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&display=swap',
  'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/ort.js',
  'https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.7/dist/bundle.min.js'
];

// ══════════════════════════════════════════════════════════
// INSTALL EVENT
// ══════════════════════════════════════════════════════════
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Install complete');
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] Precache failed:', err);
      })
  );
});

// ══════════════════════════════════════════════════════════
// ACTIVATE EVENT
// ══════════════════════════════════════════════════════════
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

// ══════════════════════════════════════════════════════════
// FETCH EVENT
// ══════════════════════════════════════════════════════════
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip Chrome extensions and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // API calls (n8n webhook) - Network only, no cache
  if (url.hostname.includes('n8n.talco-lr.com') || 
      url.hostname.includes('googleapis.com')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // Return error response for API failures
          return new Response(
            JSON.stringify({ error: 'Offline - Impossible de contacter le serveur' }),
            { 
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }
  
  // Static assets - Cache first, then network
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version and update cache in background
          event.waitUntil(
            fetch(request)
              .then((networkResponse) => {
                if (networkResponse.ok) {
                  caches.open(CACHE_NAME)
                    .then((cache) => cache.put(request, networkResponse));
                }
              })
              .catch(() => {})
          );
          return cachedResponse;
        }
        
        // Not in cache, fetch from network
        return fetch(request)
          .then((networkResponse) => {
            // Cache successful responses
            if (networkResponse.ok) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(request, responseClone));
            }
            return networkResponse;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match(OFFLINE_URL)
                .then((offlineResponse) => {
                  if (offlineResponse) {
                    return offlineResponse;
                  }
                  // Fallback inline offline page
                  return new Response(
                    `<!DOCTYPE html>
                    <html lang="fr">
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>TALCO - Hors ligne</title>
                      <style>
                        body {
                          font-family: -apple-system, sans-serif;
                          background: #050505;
                          color: #F5F3EF;
                          display: flex;
                          flex-direction: column;
                          align-items: center;
                          justify-content: center;
                          min-height: 100vh;
                          margin: 0;
                          padding: 20px;
                          text-align: center;
                        }
                        .icon {
                          font-size: 64px;
                          margin-bottom: 20px;
                        }
                        h1 {
                          font-size: 24px;
                          margin-bottom: 10px;
                          color: #E8A900;
                        }
                        p {
                          color: #8A8780;
                          margin-bottom: 30px;
                        }
                        button {
                          background: #E8A900;
                          color: #050505;
                          border: none;
                          padding: 14px 32px;
                          border-radius: 100px;
                          font-size: 16px;
                          font-weight: 600;
                          cursor: pointer;
                        }
                      </style>
                    </head>
                    <body>
                      <div class="icon">📡</div>
                      <h1>Hors ligne</h1>
                      <p>Connexion internet requise pour utiliser TALCO Agent Vocal.</p>
                      <button onclick="location.reload()">Réessayer</button>
                    </body>
                    </html>`,
                    { 
                      headers: { 'Content-Type': 'text/html; charset=utf-8' }
                    }
                  );
                });
            }
            
            // Return empty response for other failed requests
            return new Response('', { status: 408 });
          });
      })
  );
});

// ══════════════════════════════════════════════════════════
// BACKGROUND SYNC (for future use)
// ══════════════════════════════════════════════════════════
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-reports') {
    // Future: sync offline reports when back online
  }
});

// ══════════════════════════════════════════════════════════
// PUSH NOTIFICATIONS (for future use)
// ══════════════════════════════════════════════════════════
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body || 'Nouvelle notification TALCO',
    icon: './icon-192.png',
    badge: './icon-72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || './'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'TALCO', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || './')
  );
});

console.log('[SW] Service Worker loaded');
