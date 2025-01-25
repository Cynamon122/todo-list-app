const CACHE_NAME = 'my-todo-app-cache-v2'; // Zmieniono wersję cache na v2
const URLS_TO_CACHE = [
    '/',                 // Strona główna aplikacji
    '/index.html',       // Główna strona HTML
    '/styles.css',       // Plik stylów CSS
    '/app.js',           // Główny skrypt aplikacji
    '/manifest.json',    // Plik manifestu dla PWA
    '/icon.png',         // Ikona aplikacji
    '/offline.html'      // Plik offline jako fallback
];

// Instalacja Service Workera
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            const fullUrlsToCache = URLS_TO_CACHE.map(path =>
                new URL(path, self.location.origin).href
            );
            return cache.addAll(fullUrlsToCache);
        })
    );
    self.skipWaiting(); // Natychmiastowe przejęcie kontroli
});


// Aktywacja Service Workera
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );

    // Powiadomienie klientów o aktualizacji
    self.clients.matchAll({ includeUncontrolled: true }).then(clients => {
        clients.forEach(client => {
            client.postMessage({ type: 'SERVICE_WORKER_UPDATED' });
        });
    });
});


// Obsługa żądań sieciowych
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Obsługa zasobów z URLS_TO_CACHE
    if (URLS_TO_CACHE.some(path => new URL(path, self.location.origin).href === url.href)) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(event.request).then(cachedResponse => {
                    const fetchPromise = fetch(event.request).then(networkResponse => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                    return cachedResponse || fetchPromise;
                });
            })
        );
    } else {
        // Network First dla innych zasobów
        event.respondWith(
            fetch(event.request).then(networkResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            }).catch(() => caches.match('/offline.html'))
        );
    }
});


// Obsługa komunikatów między Service Workerem a aplikacją
self.addEventListener('message', event => {
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
