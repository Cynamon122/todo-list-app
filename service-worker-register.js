if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
        .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);

            // Nasłuchiwanie zmian w Service Workerze
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // Wyświetl komunikat i przeładuj stronę
                        if (confirm('Nowa wersja aplikacji jest dostępna. Czy chcesz odświeżyć?')) {
                            location.reload();
                        }
                    }
                });
            });
        })
        .catch(error => {
            console.error('Service Worker registration failed:', error);
        });
} else {
    console.warn('Service Worker is not supported in this browser.');
}
