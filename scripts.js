import { getTasks } from './database.js';
import { getVoiceNotes } from './database.js';

document.addEventListener('DOMContentLoaded', () => {
    // Inicjalizacja wskaźnika połączenia
    const statusIndicator = document.createElement('div');
    statusIndicator.id = 'connection-status';
    statusIndicator.classList.add('status-indicator');
    document.body.appendChild(statusIndicator);

    // Funkcje obsługujące różne widoki aplikacji
    const showView = (viewId) => {
        document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
        document.getElementById(viewId).classList.remove('hidden');
    };

    function updateStats() {
        getTasks().then(tasks => {
            document.getElementById('total-tasks').textContent = tasks.length;
        });
    
        getVoiceNotes().then(voiceNotes => {
            document.getElementById('total-voice-notes').textContent = voiceNotes.length;
        });
    }
    
    document.addEventListener('DOMContentLoaded', () => {
        // Inicjalizacja statystyk
        updateStats();
    
        // Aktualizacja statystyk przy przełączaniu na widok home
        document.getElementById('nav-home').addEventListener('click', updateStats);
    });

    document.getElementById('nav-home').addEventListener('click', () => showView('home-view'));
    document.getElementById('nav-tasks').addEventListener('click', () => showView('tasks-view'));
    document.getElementById('nav-voice-notes').addEventListener('click', () => showView('voice-notes-view'));
});
