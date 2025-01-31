const CACHE_NAME = 'my-todo-app-cache-v2'; // Nazwa cache, aby zarządzać wersjami
const URLS_TO_CACHE = [
    './',                 // Strona główna aplikacji
    './index.html',       // Główna strona HTML
    './styles.css',       // Plik stylów CSS
    './app.js',           // Główny skrypt aplikacji
    './manifest.json',    // Plik manifestu dla PWA
    './icon.png',         // Ikona aplikacji
    './offline.html'      // Plik offline jako fallback
];

// Instalacja Service Workera
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(URLS_TO_CACHE)
                    .catch(error => {
                        console.error('Błąd podczas cachowania:', error);
                    });
            })
    );
});


// Aktywacja Service Workera
self.addEventListener('activate', event => {
    // Usuwanie starego cache
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Jeśli cache jest innej wersji, usuń go
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Przejęcie kontroli nad aplikacją
    );

    // Powiadomienie klientów o aktualizacji Service Workera
    self.clients.matchAll({ includeUncontrolled: true }).then(clients => {
        clients.forEach(client => {
            // Wyślij wiadomość do aplikacji o aktualizacji
            client.postMessage({ type: 'SERVICE_WORKER_UPDATED' });
        });
    });
});

// Obsługa żądań sieciowych
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(cachedResponse => {
                const fetchPromise = fetch(event.request)
                    .then(networkResponse => {
                        cache.put(event.request, networkResponse.clone()); // Aktualizacja cache
                        return networkResponse;
                    })
                    .catch(() => {
                        console.warn("⚠️ Brak dostępu do sieci i brak w cache:", event.request.url);
                        return cachedResponse || handleOfflineResponse(event);
                    });

                return cachedResponse || fetchPromise;
            });
        })
    );
});


// Obsługa komunikatów między Service Workerem a aplikacją
self.addEventListener('message', event => {
    if (event.data.type === 'SKIP_WAITING') {
        // Natychmiast aktywuj nowego Service Workera
        self.skipWaiting();
    }
});
