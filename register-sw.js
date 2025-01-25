// Sprawdź, czy przeglądarka obsługuje Service Workery
if ('serviceWorker' in navigator) {
    // Jeśli obsługuje, zarejestruj Service Workera
    navigator.serviceWorker.register('./service-worker.js') // Ścieżka do pliku Service Workera
        .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
            // registration.scope określa zakres URL-i, dla których Service Worker będzie działał
        })
        .catch((error) => {
            // Obsługa błędu w przypadku, gdy rejestracja nie powiedzie się
            console.error('Service Worker registration failed:', error);
        });
} else {
    // Jeśli przeglądarka nie obsługuje Service Workerów
    console.warn('Service Worker is not supported in this browser.');
}
