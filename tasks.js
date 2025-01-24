import { addTask as addTaskToDB, getTasks as getTasksFromDB, deleteTask as deleteTaskFromDB } from './database.js';

// Funkcja wyświetlania zadania w interfejsie
export function displayTask(task) {
    const listItem = document.createElement('li');
    
    const taskContent = document.createElement('span');
    taskContent.textContent = task.content;
    taskContent.contentEditable = false; // Początkowo edycja wyłączona

    const editButton = document.createElement('button');
    editButton.textContent = 'Edytuj';
    editButton.addEventListener('click', () => {
        if (taskContent.contentEditable === 'true') {
            // Zapisz zmiany
            taskContent.contentEditable = false;
            editButton.textContent = 'Edytuj';
            const updatedContent = taskContent.textContent;

            // Zaktualizuj zadanie w IndexedDB
            deleteTaskFromDB(task.id).then(() => addTaskToDB(updatedContent)).then(refreshTasks).catch(console.error);
        } else {
            // Włącz tryb edycji
            taskContent.contentEditable = true;
            editButton.textContent = 'Zapisz';
        }
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Usuń';
    deleteButton.addEventListener('click', () => {
        deleteTask(task.id).then(() => {
            listItem.remove();
            console.log(`Zadanie ${task.id} zostało usunięte.`);
        }).catch(error => {
            console.error("Błąd podczas usuwania zadania:", error);
        });
    });

    listItem.appendChild(taskContent);
    listItem.appendChild(editButton);
    listItem.appendChild(deleteButton);
    document.getElementById('task-list').appendChild(listItem);
}

// Funkcja dodawania zadania
export function addTask(taskText) {
    return addTaskToDB(taskText).then(() => {
        refreshTasks();
    });
}

// Funkcja odświeżania listy zadań
export function refreshTasks() {
    document.getElementById('task-list').innerHTML = '';
    getTasksFromDB().then(tasks => {
        tasks.forEach(task => displayTask(task));
    }).catch(error => {
        console.error("Błąd podczas odświeżania zadań:", error);
    });
}

// Funkcja usuwania zadania
export function deleteTask(taskId) {
    return deleteTaskFromDB(taskId).then(() => {
        refreshTasks();
    });
}

// Funkcja usuwania wszystkich zadań
export function deleteAllTasks() {
    getTasksFromDB().then(tasks => {
        const deletePromises = tasks.map(task => deleteTaskFromDB(task.id));
        Promise.all(deletePromises).then(refreshTasks).catch(error => {
            console.error("Błąd podczas usuwania wszystkich zadań:", error);
        });
    });
}

// Dodanie przycisku "Usuń wszystkie" do interfejsu
export function addDeleteAllButton() {
    const deleteAllButton = document.createElement('button');
    deleteAllButton.textContent = 'Usuń wszystkie';
    deleteAllButton.addEventListener('click', deleteAllTasks);
    document.getElementById('tasks-view').appendChild(deleteAllButton);
}
