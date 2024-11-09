// Funkcja otwierająca bazę danych
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("ToDoListDB", 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
            db.createObjectStore("voiceNotes", { keyPath: "id", autoIncrement: true });
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

// Funkcja dodająca zadanie do IndexedDB
function addTask(task) {
    return openDatabase().then(db => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction("tasks", "readwrite");
            const store = transaction.objectStore("tasks");
            const request = store.add({ content: task });

            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    });
}

// Funkcja pobierająca wszystkie zadania z IndexedDB
function getTasks() {
    return openDatabase().then(db => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction("tasks", "readonly");
            const store = transaction.objectStore("tasks");
            const request = store.getAll();

            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        });
    });
}

// Funkcja usuwająca zadanie z IndexedDB
function deleteTask(id) {
    return openDatabase().then(db => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction("tasks", "readwrite");
            const store = transaction.objectStore("tasks");
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    });
}

// Funkcja dodająca nową notatkę głosową do IndexedDB
function addVoiceNote(note) {
    return openDatabase().then(db => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction("voiceNotes", "readwrite");
            const store = transaction.objectStore("voiceNotes");
            const request = store.add({ content: note });

            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    });
}

// Funkcja pobierająca wszystkie notatki głosowe z IndexedDB
function getVoiceNotes() {
    return openDatabase().then(db => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction("voiceNotes", "readonly");
            const store = transaction.objectStore("voiceNotes");
            const request = store.getAll();

            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        });
    });
}

// Funkcja usuwająca notatkę głosową z IndexedDB
function deleteVoiceNote(id) {
    return openDatabase().then(db => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction("voiceNotes", "readwrite");
            const store = transaction.objectStore("voiceNotes");
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    });
}

// Funkcja do aktualizacji statusu połączenia w interfejsie użytkownika
function updateConnectionStatus() {
    const statusIndicator = document.getElementById('connection-status');
    if (navigator.onLine) {
        statusIndicator.textContent = 'Jesteś online';
        statusIndicator.style.color = 'green';
    } else {
        statusIndicator.textContent = 'Jesteś offline. Niektóre funkcje mogą być ograniczone.';
        statusIndicator.style.color = 'red';
    }
}

// Event listener, który sprawdza, czy użytkownik jest online czy offline
window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);

// Główna obsługa aplikacji
document.addEventListener('DOMContentLoaded', () => {
    // Tworzenie elementu wskaźnika statusu połączenia
    const statusIndicator = document.createElement('div');
    statusIndicator.id = 'connection-status';
    statusIndicator.style.position = 'fixed';
    statusIndicator.style.bottom = '10px';
    statusIndicator.style.right = '10px';
    statusIndicator.style.padding = '10px';
    statusIndicator.style.backgroundColor = '#f0f0f0';
    statusIndicator.style.borderRadius = '5px';
    document.body.appendChild(statusIndicator);

    // Ustaw początkowy status połączenia
    updateConnectionStatus();

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

    // Funkcja wyświetlania zadania w interfejsie użytkownika
    function displayTask(task) {
        const listItem = document.createElement('li');
        listItem.textContent = task.content;
        
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Usuń';
        deleteButton.addEventListener('click', () => {
            deleteTask(task.id).then(() => {
                taskList.removeChild(listItem);
            });
        });

        listItem.appendChild(deleteButton);
        taskList.appendChild(listItem);
    }

    // Pobieranie istniejących zadań z IndexedDB i wyświetlanie ich
    getTasks().then(tasks => {
        tasks.forEach(task => displayTask(task));
    });

    // Obsługa dodawania nowego zadania
    addTaskButton.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        if (taskText !== '') {
            addTask(taskText).then(() => {
                displayTask({ content: taskText });
                taskInput.value = '';
            });
        }
    });

    // Pobieranie elementów związanych z notatkami głosowymi
    const addVoiceNoteButton = document.getElementById('add-voice-note-button');
    const voiceNoteList = document.getElementById('voice-note-list');

    // Funkcja wyświetlania notatki głosowej w interfejsie użytkownika
    function displayVoiceNote(note) {
        const listItem = document.createElement('li');
        listItem.textContent = note.content;
        
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Usuń';
        deleteButton.addEventListener('click', () => {
            deleteVoiceNote(note.id).then(() => {
                voiceNoteList.removeChild(listItem);
            });
        });

        listItem.appendChild(deleteButton);
        voiceNoteList.appendChild(listItem);
    }

    // Pobieranie istniejących notatek głosowych z IndexedDB i wyświetlanie ich
    getVoiceNotes().then(notes => {
        notes.forEach(note => displayVoiceNote(note));
    });

    // Obsługa dodawania nowej notatki głosowej
    addVoiceNoteButton.addEventListener('click', () => {
        const noteText = 'Notatka głosowa (funkcjonalność do zaimplementowania)'; // Placeholder
        addVoiceNote(noteText).then(() => {
            displayVoiceNote({ content: noteText });
        });
    });
});
