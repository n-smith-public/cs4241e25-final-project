import { writable, derived, get } from 'svelte/store';

export const selectedTasks = writable(new Set());
export const selectAll = writable(false);
export const showActionMenu = derived(selectedTasks, ($selectedTasks) => $selectedTasks.size > 0);

// Allows user to select checkbox in the header to select all tasks
export function handleSelectAll(tasks) {
    const currentSelectAll = get(selectAll);
    const currentTasks = get(tasks);

    // If all tasks are selected, deselect them; otherwise, select all
    if (currentSelectAll) {
      selectedTasks.set(new Set());
      selectAll.set(false);
    } else {
      const allTaskIds = new Set(currentTasks.map(task => task._id));
      selectedTasks.set(allTaskIds);
      selectAll.set(true);
    }
}

// Allows user to select individual tasks by clicking on the checkbox
export function handleTaskSelect(taskId, tasks) {
  selectedTasks.update(selected => {
    const newSelected = new Set(selected);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId); // Deselect the task if it was already selected
    } else {
      newSelected.add(taskId); // Select the task if it was not selected
    }
    
    const currentTasks = get(tasks);
    const allSelected = currentTasks.length > 0 && newSelected.size === currentTasks.length;
    selectAll.set(allSelected);

    return newSelected;
  })
}

export function clearSelections() {
  selectedTasks.set(new Set());
  selectAll.set(false);
}