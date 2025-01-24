export function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("ToDoListDB", 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
            db.createObjectStore("voiceNotes", { keyPath: "id", autoIncrement: true });
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

export function addTask(task) {
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

export function getTasks() {
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

export function deleteTask(id) {
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

export function addVoiceNote(audioBlob) {
    return openDatabase().then(db => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction("voiceNotes", "readwrite");
            const store = transaction.objectStore("voiceNotes");
            const request = store.add({ content: audioBlob });

            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        });
    });
}

export function getVoiceNotes() {
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

export function deleteVoiceNote(id) {
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
