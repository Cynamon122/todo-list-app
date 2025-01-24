const CACHE_NAME = 'my-todo-app-cache-v1'; // Nazwa cache, aby umożliwić zarządzanie wersjami
const URLS_TO_CACHE = [
    '/',                 // Strona główna aplikacji
    '/index.html',       // Główna strona HTML
    '/styles.css',       // Plik stylów CSS
    '/app.js',           // Główny skrypt aplikacji
    '/manifest.json',    // Plik manifestu dla PWA
    '/icon.png',         // Ikona aplikacji
    '/offline.html'      // Dodano offline.html

];

// Instalacja Service Workera i dodanie zasobów do cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Otwieram cache i dodaję zasoby'); // Logowanie instalacji cache
            return cache.addAll(URLS_TO_CACHE); // Dodanie zasobów do cache
        })
    );
    self.skipWaiting(); // Umożliwia natychmiastowe przejęcie kontroli przez nowego Service Workera
});

// Aktywacja Service Workera i usuwanie starych cache
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Usuń cache, jeśli nazwa nie pasuje do aktualnej wersji
                    if (cacheName !== CACHE_NAME) {
                        console.log('Usuwam stary cache', cacheName); // Logowanie usuwania starych cache
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Przejęcie kontroli nad wszystkimi aktywnymi klientami (oknami przeglądarki)
});

// Obsługa żądań sieciowych z różnymi strategiami buforowania
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url); // Parsowanie URL żądania

    // Strategia Cache First dla statycznych zasobów
    if (URLS_TO_CACHE.includes(url.pathname)) {
        event.respondWith(
            caches.match(event.request).then(response => {
                // Jeśli zasób jest w cache, zwróć go
                return response || fetch(event.request).then(networkResponse => {
                    // Jeśli nie ma w cache, pobierz z sieci, a następnie zapisz w cache
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone()); // Skopiowanie odpowiedzi do cache
                        return networkResponse; // Zwrócenie odpowiedzi do użytkownika
                    });
                });
            }).catch(() => {
                // Fallback w przypadku braku sieci lub cache
                return caches.match('/offline.html'); // Plik offline jako zasób awaryjny
            })
        );
    } else {
        // Strategia Network First dla dynamicznych zasobów (np. API)
        event.respondWith(
            fetch(event.request).then(networkResponse => {
                // Pobierz z sieci i zapisz w cache
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse; // Zwrócenie odpowiedzi do użytkownika
                });
            }).catch(() => {
                // W przypadku błędu sieci, spróbuj znaleźć zasób w cache
                return caches.match(event.request);
            })
        );
    }
});
