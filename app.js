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
            request.onerror = event => reject(event.target.error);
        });
    });
}

// Funkcja dodająca notatkę głosową do IndexedDB
function addVoiceNote(audioBlob) {
    return openDatabase().then(db => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction("voiceNotes", "readwrite");
            const store = transaction.objectStore("voiceNotes");
            const request = store.add({ content: audioBlob });

            request.onsuccess = (event) => {
                console.log('Notatka głosowa dodana do IndexedDB:', event.target.result); // Debug
                resolve(event.target.result); // Zwróć ID dodanej notatki
            };
            request.onerror = (event) => {
                console.error("Błąd podczas dodawania notatki głosowej:", event.target.error); // Debug
                reject(event.target.error);
            };
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

            request.onsuccess = (event) => {
                const notes = event.target.result.map(note => {
                    const audioUrl = URL.createObjectURL(note.content);
                    return { id: note.id, audioUrl: audioUrl };
                });
                resolve(notes);
            };

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
            request.onerror = event => reject(event.target.error);
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
                listItem.remove(); // Usuń zadanie z DOM
                console.log(`Zadanie ${task.id} zostało usunięte.`);
            }).catch(error => {
                console.error("Błąd podczas usuwania zadania:", error);
            });
        });
    
        listItem.appendChild(deleteButton);
        document.getElementById('task-list').appendChild(listItem);
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
                refreshTasks(); // Odśwież listę zadań po dodaniu nowego
                taskInput.value = ''; // Wyczyszczenie pola tekstowego
            }).catch(error => {
                console.error("Błąd podczas dodawania zadania:", error);
            });
        }
    });
    
    

    // Pobieranie elementów związanych z notatkami głosowymi
    const startRecordingButton = document.getElementById('start-recording-button');
    const stopRecordingButton = document.getElementById('stop-recording-button');
    const recordingIndicator = document.getElementById('recording-indicator');
    const voiceNoteList = document.getElementById('voice-note-list');

    let mediaRecorder;
    let audioChunks = [];

    // Rozpoczęcie nagrywania
    startRecordingButton.addEventListener('click', () => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];
    
                mediaRecorder.start();
                console.log('Recording started');
    
                // Pokazanie napisu "Recording..."
                recordingIndicator.textContent = "Recording...";
                recordingIndicator.classList.remove('hidden');
    
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };
    
                startRecordingButton.classList.add('hidden');
                stopRecordingButton.classList.remove('hidden');
            })
            .catch(error => {
                console.error("Błąd podczas uzyskiwania dostępu do mikrofonu:", error);
            });
    });
    

    // Zatrzymanie nagrywania
    stopRecordingButton.addEventListener('click', () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
    
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                addVoiceNote(audioBlob).then(noteId => {
                    const audioUrl = URL.createObjectURL(audioBlob);
                    displayVoiceNote({ id: noteId, audioUrl }); // Natychmiastowe wyświetlenie nowej notatki
                }).catch(error => {
                    console.error("Błąd podczas dodawania notatki głosowej:", error);
                });
    
                recordingIndicator.textContent = "";
                recordingIndicator.classList.add('hidden');
                startRecordingButton.classList.remove('hidden');
                stopRecordingButton.classList.add('hidden');
            };
        }
    });

    // Funkcja wyświetlania notatki głosowej w interfejsie użytkownika
    function displayVoiceNote(note) {
        const listItem = document.createElement('li');
    
        const audio = document.createElement('audio');
        audio.controls = true;
        audio.src = note.audioUrl;
    
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Usuń';
        deleteButton.addEventListener('click', () => {
            deleteVoiceNote(note.id).then(() => {
                console.log('Notatka głosowa usunięta:', note.id); // Debug
                listItem.remove(); // Usuń element z DOM
            }).catch(error => {
                console.error("Błąd podczas usuwania notatki głosowej:", error);
            });
        });
    
        listItem.appendChild(audio);
        listItem.appendChild(deleteButton);
        document.getElementById('voice-note-list').appendChild(listItem);
    }

    // Pobierz notatki głosowe po dodaniu nowej
    function refreshVoiceNotes() {
        document.getElementById('voice-note-list').innerHTML = ''; // Wyczyść istniejące elementy
        getVoiceNotes().then(notes => {
            notes.forEach(note => displayVoiceNote(note)); // Odtwórz notatki z bazy
        }).catch(error => {
            console.error("Błąd podczas odświeżania notatek głosowych:", error);
        });
    }
    
    // Pobierz zadania po dodaniu nowego
    function refreshTasks() {
        document.getElementById('task-list').innerHTML = ''; // Wyczyść istniejące elementy
        getTasks().then(tasks => {
            tasks.forEach(task => displayTask(task)); // Odtwórz zadania z bazy
        }).catch(error => {
            console.error("Błąd podczas odświeżania zadań:", error);
        });
    }

    

    // Pobieranie istniejących notatek głosowych z IndexedDB i wyświetlanie ich
    getVoiceNotes().then(notes => {
        notes.forEach(note => displayVoiceNote(note));
    });
});
