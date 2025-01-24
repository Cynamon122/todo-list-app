// Główna obsługa aplikacji
import { addTask, getTasks, deleteTask, refreshTasks } from './database.js';
import { addVoiceNote, getVoiceNotes, deleteVoiceNote, refreshVoiceNotes } from './database.js';
import { updateConnectionStatus, showView } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // Status połączenia
    updateConnectionStatus();
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);

    // Widoki aplikacji
    const homeView = document.getElementById('home-view');
    const tasksView = document.getElementById('tasks-view');
    const voiceNotesView = document.getElementById('voice-notes-view');

    // Nawigacja
    document.getElementById('nav-home').addEventListener('click', () => showView(homeView));
    document.getElementById('nav-tasks').addEventListener('click', () => showView(tasksView));
    document.getElementById('nav-voice-notes').addEventListener('click', () => showView(voiceNotesView));

    // Zadania
    const taskInput = document.getElementById('task-input');
    const addTaskButton = document.getElementById('add-task-button');

    addTaskButton.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        if (taskText !== '') {
            addTask(taskText).then(() => {
                refreshTasks();
                taskInput.value = '';
            }).catch(console.error);
        }
    });

    refreshTasks();

    // Notatki głosowe
    refreshVoiceNotes();
    const startRecordingButton = document.getElementById('start-recording-button');
    const stopRecordingButton = document.getElementById('stop-recording-button');

    let mediaRecorder;
    let audioChunks = [];

    startRecordingButton.addEventListener('click', () => {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            mediaRecorder.start();

            mediaRecorder.ondataavailable = event => audioChunks.push(event.data);

            startRecordingButton.classList.add('hidden');
            stopRecordingButton.classList.remove('hidden');
        }).catch(console.error);
    });

    stopRecordingButton.addEventListener('click', () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                addVoiceNote(audioBlob).then(refreshVoiceNotes).catch(console.error);

                startRecordingButton.classList.remove('hidden');
                stopRecordingButton.classList.add('hidden');
            };
        }
    });
});
