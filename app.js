document.addEventListener('DOMContentLoaded', () => {
    const homeView = document.getElementById('home-view');
    const tasksView = document.getElementById('tasks-view');
    const voiceNotesView = document.getElementById('voice-notes-view');

    const navHome = document.getElementById('nav-home');
    const navTasks = document.getElementById('nav-tasks');
    const navVoiceNotes = document.getElementById('nav-voice-notes');

    function showView(view) {
        homeView.classList.add('hidden');
        tasksView.classList.add('hidden');
        voiceNotesView.classList.add('hidden');
        view.classList.remove('hidden');
    }

    navHome.addEventListener('click', () => showView(homeView));
    navTasks.addEventListener('click', () => showView(tasksView));
    navVoiceNotes.addEventListener('click', () => showView(voiceNotesView));

    const taskInput = document.getElementById('task-input');
    const addTaskButton = document.getElementById('add-task-button');
    const taskList = document.getElementById('task-list');

    addTaskButton.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        if (taskText !== '') {
            const listItem = document.createElement('li');
            listItem.textContent = taskText;
            taskList.appendChild(listItem);
            taskInput.value = '';
        }
    });

    const addVoiceNoteButton = document.getElementById('add-voice-note-button');
    const voiceNoteList = document.getElementById('voice-note-list');

    addVoiceNoteButton.addEventListener('click', () => {
        // Placeholder for adding voice note functionality
        const listItem = document.createElement('li');
        listItem.textContent = 'Voice note (feature to be implemented)';
        voiceNoteList.appendChild(listItem);
    });
});