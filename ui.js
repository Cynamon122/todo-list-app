// Funkcja do aktualizacji statusu połączenia w interfejsie użytkownika
export function updateConnectionStatus() {
    const statusIndicator = document.getElementById('connection-status');

    if (navigator.onLine) {
        statusIndicator.textContent = 'Jesteś online';
        statusIndicator.style.color = 'green';
    } else {
        statusIndicator.textContent = 'Jesteś offline. Niektóre funkcje mogą być ograniczone.';
        statusIndicator.style.color = 'red';
    }
}

// Funkcja do przełączania widoków aplikacji
export function showView(view) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    view.classList.remove('hidden');
}


