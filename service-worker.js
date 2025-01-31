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
    const url = new URL(event.request.url); // Pobierz pełny URL żądania

    // Obsługa zasobów z listy URLS_TO_CACHE
    if (URLS_TO_CACHE.some(path => new URL(path, self.location.origin).href === url.href)) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(event.request).then(cachedResponse => {
                    // Pobierz zasób z cache lub sieci (i zapisz go w cache)
                    const fetchPromise = fetch(event.request).then(networkResponse => {
                        cache.put(event.request, networkResponse.clone()); // Zaktualizuj cache
                        return networkResponse; // Zwróć zasób z sieci
                    });
                    // Jeśli zasób jest w cache, zwróć go natychmiast
                    return cachedResponse || fetchPromise;
                });
            })
        );
    } else {
        // Dla innych zasobów użyj strategii Network First
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(event.request).then(cachedResponse => {
                    return cachedResponse || fetch(event.request)
                        .then(networkResponse => {
                            cache.put(event.request, networkResponse.clone());
                            return networkResponse;
                        })
                        .catch(() => handleOfflineResponse(event)); // 🔹 Poprawiona obsługa offline
                });
            })
        );
    }
});

function handleOfflineResponse(event) {
    if (event.request.destination === 'document') {
        return caches.match('/offline.html').then(response => {
            return response || new Response("Offline page not available", { status: 503, statusText: "Service Unavailable" });
        });
    } else {
        return new Response("Resource not found", { status: 404, statusText: "Not Found" });
    }
}

// Obsługa komunikatów między Service Workerem a aplikacją
self.addEventListener('message', event => {
    if (event.data.type === 'SKIP_WAITING') {
        // Natychmiast aktywuj nowego Service Workera
        self.skipWaiting();
    }
});
