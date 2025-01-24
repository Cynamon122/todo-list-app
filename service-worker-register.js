if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
        .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);

            // Nasłuchiwanie zmian w Service Workerze
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('New Service Worker found:', newWorker);

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            // Nowy Service Worker gotowy do aktywacji
                            const updateBanner = document.createElement('div');
                            updateBanner.id = 'update-banner';
                            updateBanner.textContent = 'Nowa wersja aplikacji jest dostępna. Kliknij tutaj, aby ją aktywować.';
                            updateBanner.classList.add('update-banner');

                            updateBanner.addEventListener('click', () => {
                                location.reload(); // Odświeżenie strony
                            });

                            document.body.appendChild(updateBanner);
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
