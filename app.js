document.addEventListener('DOMContentLoaded', () => {
    // Pobieranie widoków: ekranu głównego, listy zadań oraz notatek głosowych
    const homeView = document.getElementById('home-view');
    const tasksView = document.getElementById('tasks-view');
    const voiceNotesView = document.getElementById('voice-notes-view');

    // Pobieranie elementów nawigacji
    const navHome = document.getElementById('nav-home');
    const navTasks = document.getElementById('nav-tasks');
    const navVoiceNotes = document.getElementById('nav-voice-notes');

    // Funkcja do przełączania widoku aplikacji
    function showView(view) {
        homeView.classList.add('hidden');
        tasksView.classList.add('hidden');
        voiceNotesView.classList.add('hidden');
        view.classList.remove('hidden');
    }

    // Obsługa kliknięć w elementy nawigacji
    navHome.addEventListener('click', () => showView(homeView));
    navTasks.addEventListener('click', () => showView(tasksView));
    navVoiceNotes.addEventListener('click', () => showView(voiceNotesView));

    // Pobieranie elementów związanych z zadaniami
    const taskInput = document.getElementById('task-input');
    const addTaskButton = document.getElementById('add-task-button');
    const taskList = document.getElementById('task-list');

    // Obsługa dodawania nowego zadania
    addTaskButton.addEventListener('click', () => {
        const taskText = taskInput.value.trim(); // Pobieranie tekstu zadania i usunięcie białych znaków
        if (taskText !== '') { // Sprawdzenie, czy pole nie jest puste
            const listItem = document.createElement('li'); // Utworzenie nowego elementu listy
            listItem.textContent = taskText; // Ustawienie tekstu zadania
            taskList.appendChild(listItem); // Dodanie nowego zadania do listy zadań
            taskInput.value = ''; // Wyczyść pole tekstowe po dodaniu zadania
        }
    });

    // Pobieranie elementów związanych z notatkami głosowymi
    const addVoiceNoteButton = document.getElementById('add-voice-note-button');
    const voiceNoteList = document.getElementById('voice-note-list');

    // Obsługa dodawania nowej notatki głosowej
    addVoiceNoteButton.addEventListener('click', () => {
        // Placeholder - funkcjonalność dodawania notatek głosowych do zaimplementowania
        const listItem = document.createElement('li'); 
        listItem.textContent = 'Notatka głosowa (funkcjonalność do zaimplementowania)'; 
        voiceNoteList.appendChild(listItem); 
    });
});