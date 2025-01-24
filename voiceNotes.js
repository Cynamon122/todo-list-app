import { addVoiceNote as addVoiceNoteToDB, getVoiceNotes as getVoiceNotesFromDB, deleteVoiceNote as deleteVoiceNoteFromDB } from './database.js';

// Funkcja wyświetlania notatki głosowej w interfejsie
export function displayVoiceNote(note) {
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

// Funkcja dodawania notatki głosowej
export function addVoiceNote(audioBlob) {
    return addVoiceNoteToDB(audioBlob).then(noteId => {
        const audioUrl = URL.createObjectURL(audioBlob);
        displayVoiceNote({ id: noteId, audioUrl });
    }).catch(error => {
        console.error("Błąd podczas dodawania notatki głosowej:", error);
    });
}

// Funkcja odświeżania listy notatek głosowych
export function refreshVoiceNotes() {
    document.getElementById('voice-note-list').innerHTML = '';
    getVoiceNotesFromDB().then(notes => {
        notes.forEach(note => {
            const audioUrl = URL.createObjectURL(note.content);
            displayVoiceNote({ id: note.id, audioUrl });
        });
    }).catch(error => {
        console.error("Błąd podczas odświeżania notatek głosowych:", error);
    });
}

// Funkcja usuwania notatki głosowej
export function deleteVoiceNote(noteId) {
    return deleteVoiceNoteFromDB(noteId).then(() => {
        refreshVoiceNotes();
    });
}

// Funkcja usuwania wszystkich notatek głosowych
export function deleteAllVoiceNotes() {
    getVoiceNotesFromDB().then(notes => {
        const deletePromises = notes.map(note => deleteVoiceNoteFromDB(note.id));
        Promise.all(deletePromises).then(refreshVoiceNotes).catch(error => {
            console.error("Błąd podczas usuwania wszystkich notatek głosowych:", error);
        });
    });
}

// Dodanie przycisku "Usuń wszystkie" do interfejsu
export function addDeleteAllButton() {
    const deleteAllButton = document.createElement('button');
    deleteAllButton.textContent = 'Usuń wszystkie';
    deleteAllButton.addEventListener('click', deleteAllVoiceNotes);
    document.getElementById('voice-notes-view').appendChild(deleteAllButton);
}
