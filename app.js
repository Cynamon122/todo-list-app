// Globalna instancja bazy danych
let dbInstance = null;

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').then(registration => {
        console.log('Service Worker zarejestrowany:', registration);

        // Nasłuchiwanie wiadomości od Service Workera
        navigator.serviceWorker.addEventListener('message', event => {
            if (event.data.type === 'SERVICE_WORKER_UPDATED') {
                const updateNotification = document.createElement('div');
                updateNotification.textContent = 'Nowa wersja aplikacji jest dostępna. Kliknij, aby odświeżyć.';
                updateNotification.classList.add('update-notification'); // Dodaj klasę CSS

                updateNotification.addEventListener('click', () => {
                    window.location.reload();
                });

                document.body.appendChild(updateNotification);
            }
        });
    }).catch(error => {
        console.error('Rejestracja Service Workera nie powiodła się:', error);
    });
}

// Funkcja otwierająca bazę danych
// Tworzy lub otwiera bazę IndexedDB o nazwie "ToDoListDB"
function openDatabase() {
    if (dbInstance) return Promise.resolve(dbInstance);

    return new Promise((resolve, reject) => {
        const request = indexedDB.open("ToDoListDB", 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("tasks")) {
                db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
            }
            if (!db.objectStoreNames.contains("voiceNotes")) {
                db.createObjectStore("voiceNotes", { keyPath: "id", autoIncrement: true });
            }
        };

        request.onsuccess = (event) => {
            dbInstance = event.target.result; // Zapisz instancję w zmiennej globalnej
            resolve(dbInstance);
        };

        request.onerror = (event) => reject(event.target.error);
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

            // Dodanie notatki głosowej
            const request = store.add({ content: audioBlob });

            request.onsuccess = (event) => {
                console.log('Notatka głosowa dodana do IndexedDB:', event.target.result);
                resolve(event.target.result);
            };
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

function isActuallyOnline() {
    return new Promise(resolve => {
        console.log("🔍 Sprawdzanie rzeczywistego połączenia...");

        if (!navigator.onLine) {
            console.log("`navigator.onLine` zwrócił false → Brak internetu.");
            resolve(false);
            return;
        }

        fetch("https://cynamon122.github.io/todo-list-app/test-connection.txt?nocache=" + Date.now(), { cache: "no-store" })
            .then(response => {
                if (response.ok) {
                    console.log("Test połączenia powiódł się → Online!");
                    resolve(true);
                } else {
                    console.log("`404 Not Found` - Test połączenia NIE powiódł się");
                    resolve(false);
                }
            })
            .catch(error => {
                console.log("Błąd podczas testowania połączenia:", error);
                resolve(false);
            });
    });
}




function updateConnectionStatus() {
    console.log("Aktualizacja statusu połączenia...");

    const statusIndicator = document.getElementById('connection-status');

    if (!statusIndicator) {
        console.warn('⚠️ Element #connection-status nie został znaleziony.');
        return;
    }

    isActuallyOnline().then(isOnline => {
        if (isOnline) {
            console.log(" Połączenie online!");
            statusIndicator.textContent = 'Jesteś online';
            statusIndicator.classList.add('online');
            statusIndicator.classList.remove('offline');
        } else {
            console.log(" Brak internetu!");
            statusIndicator.textContent = 'Jesteś offline. Niektóre funkcje mogą być ograniczone.';
            statusIndicator.classList.add('offline');
            statusIndicator.classList.remove('online');
        }
    });
}

// Uruchom funkcję od razu po załadowaniu strony
document.addEventListener('DOMContentLoaded', updateConnectionStatus);
window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);

function requestNotificationPermission() {
    if ('Notification' in window) {
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log("Status zgody na powiadomienia:", permission);
            });
        }
    }
}

function sendNotification(taskContent) {
    console.log("Próba wysłania powiadomienia...");

    if ('Notification' in window && Notification.permission === 'granted') {
        console.log("Tworzenie powiadomienia...");
        new Notification("Nowe zadanie dodane!", {
            body: taskContent,
            icon: './icon-192x192.png'
        });
    } else {
        console.warn("Brak zgody na powiadomienia lub funkcja nieobsługiwana.");
    }
}

document.addEventListener('DOMContentLoaded', requestNotificationPermission);


// Główna obsługa aplikacji
document.addEventListener('DOMContentLoaded', () => {

    updateSummary(); // Aktualizacja liczb zadań i notatek
    refreshTasks();
    refreshVoiceNotes();

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
        if (view === homeView) {
            updateSummary();
        }
    
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
    
        // Kontener na przyciski
        const buttonGroup = document.createElement('div');
        buttonGroup.classList.add('button-group');
    
        // Przycisk "Usuń"
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Usuń';
        deleteButton.classList.add('delete');
        deleteButton.addEventListener('click', () => {
            deleteTask(task.id).then(() => listItem.remove());
        });
    
        // Przycisk "Edytuj"
        const editButton = document.createElement('button');
        editButton.textContent = 'Edytuj';
        editButton.classList.add('edit');
        editButton.addEventListener('click', () => {
            const newContent = prompt('Edytuj zadanie:', task.content);
            if (newContent) {
                updateTask(task.id, newContent).then(() => {
                    refreshTasks();
                });
            }
        });
    
        // Dodanie przycisków do kontenera
        buttonGroup.appendChild(editButton);
        buttonGroup.appendChild(deleteButton);
    
        // Dodanie treści i przycisków do elementu listy
        listItem.appendChild(buttonGroup);
        document.getElementById('task-list').appendChild(listItem);
    }
    
    

    function updateTask(id, newContent) {
        return openDatabase().then(db => {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction("tasks", "readwrite");
                const store = transaction.objectStore("tasks");
                const request = store.put({ id, content: newContent }); // Aktualizacja zadania
    
                request.onsuccess = () => resolve();
                request.onerror = (event) => reject(event.target.error);
            });
        });
    }

    // Obsługa dodawania nowego zadania
    addTaskButton.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        if (taskText !== '') {
            addTask(taskText).then(() => {
                refreshTasks(); // Odświeżenie listy zadań
                taskInput.value = ''; // Wyczyszczenie pola tekstowego
                sendNotification(taskText); // Wysyłamy powiadomienie
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

    // Aktualizacja podsumowania
    function updateSummary() {
        getTasks().then(tasks => {
            document.getElementById('task-count').textContent = tasks.length;
        });

        getVoiceNotes().then(notes => {
            document.getElementById('voice-note-count').textContent = notes.length;
        });
    }

    

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
                URL.revokeObjectURL(note.audioUrl); // Usunięcie URL
                listItem.remove();
            });
        });
    
        listItem.appendChild(audio);
        listItem.appendChild(deleteButton);
        document.getElementById('voice-note-list').appendChild(listItem);
    }

    // Pobierz notatki głosowe po dodaniu nowej
    function refreshVoiceNotes() {
        const voiceNoteList = document.getElementById('voice-note-list');
        voiceNoteList.innerHTML = ''; // Czyści listę przed dodaniem nowych elementów
    
        getVoiceNotes().then(notes => {
            notes.forEach(note => displayVoiceNote(note));
        }).catch(error => {
            console.error("Błąd podczas odświeżania notatek głosowych:", error);
        });
    }
    
    

    // Pobierz zadania po dodaniu nowego
    function refreshTasks() {
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = ''; // Czyści listę przed dodaniem nowych elementów
    
        getTasks().then(tasks => {
            tasks.forEach(task => displayTask(task));
        }).catch(error => {
            console.error("Błąd podczas odświeżania zadań:", error);
        });
    }
    
});
