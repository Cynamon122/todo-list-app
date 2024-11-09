const CACHE_NAME = 'my-todo-app-cache-v1';
const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    '/icon.png'
];

// Instalacja i dodanie zasobów do cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Otwieram cache i dodaję zasoby');
            return cache.addAll(URLS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Aktywacja i usuwanie starych cache
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Usuwam stary cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch z różnymi strategiami buforowania
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Strategia Cache First dla statycznych zasobów
    if (URLS_TO_CACHE.includes(url.pathname)) {
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request).then(networkResponse => {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            }).catch(() => {
                return caches.match('/offline.html'); // fallback dla zasobu offline, jeśli brak sieci
            })
        );
    } else {
        // Strategia Network First dla dynamicznych zasobów
        event.respondWith(
            fetch(event.request).then(networkResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            }).catch(() => {
                return caches.match(event.request); // Jeśli brak sieci, sprawdź cache
            })
        );
    }
});
