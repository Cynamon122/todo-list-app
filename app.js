// Funkcja otwierająca bazę danych
// Tworzy lub otwiera bazę IndexedDB o nazwie "ToDoListDB"
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("ToDoListDB", 1);

        // Wydarzenie na wypadek konieczności uaktualnienia bazy danych
        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Tworzenie magazynu dla zadań i notatek głosowych
            db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
            db.createObjectStore("voiceNotes", { keyPath: "id", autoIncrement: true });
        };

        // Wydarzenie przy pomyślnym otwarciu bazy danych
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        // Obsługa błędów podczas otwierania bazy danych
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

            // Dodanie zadania do magazynu "tasks"
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

            // Pobranie wszystkich zadań
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

            // Usunięcie zadania na podstawie ID
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

            // Dodanie notatki głosowej
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

            // Pobranie wszystkich notatek głosowych
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

            // Usunięcie notatki głosowej na podstawie ID
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = event => reject(event.target.error);
        });
    });
}

// Funkcja do aktualizacji statusu połączenia w interfejsie użytkownika
function updateConnectionStatus() {
    const statusIndicator = document.getElementById('connection-status');

    // Wyświetlenie statusu połączenia
    if (navigator.onLine) {
        statusIndicator.textContent = 'Jesteś online';
        statusIndicator.style.color = 'green';
    } else {
        statusIndicator.textContent = 'Jesteś offline. Niektóre funkcje mogą być ograniczone.';
        statusIndicator.style.color = 'red';
    }
}

// Obsługa zdarzeń zmiany statusu połączenia
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

    // Ustawienie początkowego statusu połączenia
    updateConnectionStatus();

    // Pobieranie widoków aplikacji
    const homeView = document.getElementById('home-view');
    const tasksView = document.getElementById('tasks-view');
    const voiceNotesView = document.getElementById('voice-notes-view');

    // Pobieranie elementów nawigacji
    const navHome = document.getElementById('nav-home');
    const navTasks = document.getElementById('nav-tasks');
    const navVoiceNotes = document.getElementById('nav-voice-notes');

    // Funkcja przełączania widoku aplikacji
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

    // Obsługa zadań
    const taskInput = document.getElementById('task-input');
    const addTaskButton = document.getElementById('add-task-button');
    const taskList = document.getElementById('task-list');

    // Funkcja wyświetlania zadania w interfejsie
    function displayTask(task) {
        const listItem = document.createElement('li');
        listItem.textContent = task.content;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Usuń';
        deleteButton.addEventListener('click', () => {
            deleteTask(task.id).then(() => {
                listItem.remove(); // Usunięcie elementu z DOM
                console.log(`Zadanie ${task.id} zostało usunięte.`);
            }).catch(error => {
                console.error("Błąd podczas usuwania zadania:", error);
            });
        });

        listItem.appendChild(deleteButton);
        document.getElementById('task-list').appendChild(listItem);
    }

    // Pobranie istniejących zadań z IndexedDB
    getTasks().then(tasks => {
        tasks.forEach(task => displayTask(task));
    });

    // Obsługa dodawania nowego zadania
    addTaskButton.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        if (taskText !== '') {
            addTask(taskText).then(() => {
                refreshTasks(); // Odświeżenie listy zadań
                taskInput.value = ''; // Wyczyszczenie pola tekstowego
            }).catch(error => {
                console.error("Błąd podczas dodawania zadania:", error);
            });
        }
    });

    // Obsługa notatek głosowych
    const startRecordingButton = document.getElementById('start-recording-button');
    const stopRecordingButton = document.getElementById('stop-recording-button');
    const recordingIndicator = document.getElementById('recording-indicator');

    let mediaRecorder;
    let audioChunks = [];

    // Rozpoczęcie nagrywania
    startRecordingButton.addEventListener('click', () => {
        // Sprawdzenie obsługi MediaRecorder
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Twoja przeglądarka nie obsługuje API MediaRecorder.');
            return;
        }
    
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                // Sprawdzenie dostępnych MIME typów
                let mimeType = 'audio/webm;codecs=opus';
                if (!MediaRecorder.isTypeSupported(mimeType)) {
                    mimeType = 'audio/webm';
                }
                if (!MediaRecorder.isTypeSupported(mimeType)) {
                    mimeType = 'audio/mp4'; // Dla Safari
                }
                if (!MediaRecorder.isTypeSupported(mimeType)) {
                    mimeType = ''; // Użyj domyślnego, jeśli żaden typ nie jest obsługiwany
                }
    
                try {
                    mediaRecorder = new MediaRecorder(stream, { mimeType });
                    audioChunks = [];
    
                    mediaRecorder.start();
                    console.log('Recording started with MIME type:', mimeType);
    
                    // Aktualizacja interfejsu
                    recordingIndicator.textContent = "Recording...";
                    recordingIndicator.classList.remove('hidden');
                    startRecordingButton.classList.add('hidden');
                    stopRecordingButton.classList.remove('hidden');
    
                    mediaRecorder.ondataavailable = event => {
                        if (event.data.size > 0) {
                            audioChunks.push(event.data);
                            console.log('Audio chunk received:', event.data);
                        }
                    };
    
                    mediaRecorder.onerror = event => {
                        console.error('Błąd MediaRecorder:', event.error);
                    };
                } catch (error) {
                    console.error('Błąd podczas tworzenia MediaRecorder:', error);
                    alert('Twoja przeglądarka nie obsługuje wybranego formatu audio.');
                }
            })
            .catch(error => {
                console.error('Błąd podczas uzyskiwania dostępu do mikrofonu:', error);
                alert('Nie udało się uzyskać dostępu do mikrofonu.');
            });
    });
    

    // Zatrzymanie nagrywania
    stopRecordingButton.addEventListener('click', () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
    
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                console.log('Generated audio Blob:', audioBlob);
    
                addVoiceNote(audioBlob).then(noteId => {
                    const audioUrl = URL.createObjectURL(audioBlob);
                    displayVoiceNote({ id: noteId, audioUrl });
                }).catch(error => {
                    console.error('Błąd podczas zapisu notatki głosowej:', error);
                });
    
                // Aktualizacja interfejsu
                recordingIndicator.textContent = "";
                recordingIndicator.classList.add('hidden');
                startRecordingButton.classList.remove('hidden');
                stopRecordingButton.classList.add('hidden');
            };
        } else {
            alert('Nagrywanie jeszcze się nie rozpoczęło!');
        }
    });
    

    // Funkcja wyświetlania notatki głosowej
    function displayVoiceNote(note) {
        const listItem = document.createElement('li');

        const audio = document.createElement('audio');
        audio.controls = true;
        audio.src = note.audioUrl;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Usuń';
        deleteButton.addEventListener('click', () => {
            deleteVoiceNote(note.id).then(() => {
                listItem.remove();
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
        document.getElementById('voice-note-list').innerHTML = '';
        getVoiceNotes().then(notes => {
            notes.forEach(note => displayVoiceNote(note));
        }).catch(error => {
            console.error("Błąd podczas odświeżania notatek głosowych:", error);
        });
    }

    // Pobierz zadania po dodaniu nowego
    function refreshTasks() {
        document.getElementById('task-list').innerHTML = '';
        getTasks().then(tasks => {
            tasks.forEach(task => displayTask(task));
        }).catch(error => {
            console.error("Błąd podczas odświeżania zadań:", error);
        });
    }

    // Pobranie istniejących notatek głosowych
    getVoiceNotes().then(notes => {
        notes.forEach(note => displayVoiceNote(note));
    });
});
