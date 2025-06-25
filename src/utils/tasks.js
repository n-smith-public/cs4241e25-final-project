export * from './tasks/newTask.js';
export * from './tasks/fetchTask.js';
export * from './tasks/selectTasks.js';
export * from './tasks/taskActions.js';
export * from './tasks/sortTasks.js';
export * from './tasks/importCal.js';
export * from './tasks/bin.js';

import { get } from 'svelte/store';
// Import all of the functions from utils/tasks/*.js
import { tasks, loadTasks as loadTasksOriginal } from './tasks/fetchTask.js';
import { selectedTasks, selectAll, handleSelectAll as handleSelectAllOriginal, handleTaskSelect as handleTaskSelectOriginal } from './tasks/selectTasks.js';
import { 
    markComplete as markCompleteOriginal, 
    editTask as editTaskOriginal, 
    saveEdit as saveEditOriginal,
    deleteTask as deleteTaskOriginal,
    confirmDelete as confirmDeleteOriginal
} from './tasks/taskActions.js';

export const loadTasks = loadTasksOriginal;

/*
    Allow of the below functions are wrappers that handle dependencies needed for the original functions.
    This is only required because functions are not in the same file anymore.
*/
export function handleSelectAll() {
    return handleSelectAllOriginal(tasks);
}

export function handleTaskSelect(taskId) {
    return handleTaskSelectOriginal(taskId, tasks);
}

export function markComplete() {
    return markCompleteOriginal(selectedTasks, tasks, loadTasksOriginal);
}

export function editTask() {
    return editTaskOriginal(selectedTasks, tasks);
}

export function saveEdit(event) {
    return saveEditOriginal(event, loadTasksOriginal, selectedTasks);
}

export function deleteTask() {
    return deleteTaskOriginal(selectedTasks);
}

export function confirmDelete() {
    return confirmDeleteOriginal(selectedTasks, loadTasksOriginal, selectAll);
}

export function addNewTasks(navigateTo) {
    navigateTo('home');
}