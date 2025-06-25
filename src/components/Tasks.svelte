<script>
  import { onMount } from 'svelte';
  import Header from './Header.svelte';
  import Footer from './Footer.svelte';
  import ImportModal from './ICAL.svelte';
  // Import all of the task functions from tasks.js, which is a feeder from utils/tasks/*.js
  import { 
    tasks, 
    selectedTasks, 
    showActionMenu, 
    showEditModal, 
    showDeleteModal, 
    selectAll, 
    deadlineMap,
    editTaskName,
    editTaskDescription,
    editTaskDueDate,
    editTaskPriority,
    loadTasks,
    handleSelectAll,
    handleTaskSelect,
    markComplete,
    editTask,
    saveEdit,
    deleteTask,
    confirmDelete,
    addNewTasks,
    sortedTasks,
    sortColumn,
    sortDirection,
    handleSort,
    getSortIcon,
    showImportModal,
    importEvents,
    selectedEvents,
    handleFileImport,
    toggleEventSelection,
    selectAllEvents,
    deselectAllEvents,
    importSelectedEvents,
    closeImportModal,
    updateEventPriority
  } from '../utils/tasks';

  export let navigateTo;

  let fileInput;

  // On mounting the component, load all of the tasks
  onMount(() => {
    loadTasks();
  });

  function handleAddNewTasks() {
    addNewTasks(navigateTo);
  }

  function closeEditModal() {
    showEditModal.set(false);
  }

  function closeDeleteModal() {
    showDeleteModal.set(false);
  }

  function onColClick(column) {
    handleSort(column);
  }

  function triggerFileImport() {
    fileInput.click();
  }

  function handleImportModalClose() {
    closeImportModal();
  }

  function handleToggleEvent(eventId) {
    toggleEventSelection(eventId);
  }

  function handleSelectAllEvents(events) {
    selectAllEvents(events);
  }

  function handleDeselectAllEvents() {
    deselectAllEvents();
  }

  function handleImportEvents(events, selected) {
    importSelectedEvents(events, selected);
  }

  function handleUpdatePriority(eventID, newPriority) {
    updateEventPriority(eventID, newPriority);
  }
</script>

<!-- Pull the Header component -->
<Header 
  greeting="Here are your tasks!" 
  showLogin={false} 
  showRegister={false} 
  showSettings={true}
  authRequired={true}
  {navigateTo} 
/>

<div class="import-section">
  <button class="import-button" on:click={triggerFileImport}>
    Import from Calendar
  </button>
  <input
    type="file"
    accept=".ics"
    bind:this={fileInput}
    on:change={handleFileImport}
    style="display: none;"
    >
</div>

<!-- Task List Table -->
<table class="pure-table pure-table-striped" id="taskList">
  <thead>
    <!-- Table Headers, will be adding sorting for final project -->
    <tr>
      <th><input type="checkbox" bind:checked={$selectAll} on:change={handleSelectAll}></th>
      <th class="sortable" on:click={() => onColClick('taskName')}>
        Task Name {getSortIcon('taskName', $sortColumn, $sortDirection)}
      </th>
      <th class="sortable" on:click={() => onColClick('taskDescription')}>
        Description {getSortIcon('taskDescription', $sortColumn, $sortDirection)}
      </th>
      <th class="sortable" on:click={() => onColClick('taskDueDate')}>
        Due Date {getSortIcon('taskDueDate', $sortColumn, $sortDirection)}
      </th>
      <th class="sortable" on:click={() => onColClick('taskPriority')}>
        Priority {getSortIcon('taskPriority', $sortColumn, $sortDirection)}
      </th>
      <th class="sortable" on:click={() => onColClick('deadline')}>
        Deadline {getSortIcon('deadline', $sortColumn, $sortDirection)}
      </th>
    </tr>
  </thead>
  <!-- Table body, dynamically import from database-->
  <tbody>
    {#each $sortedTasks as task (task._id)}
      <tr class:completed={task.completed}>
        <td>
          <input 
            type="checkbox" 
            checked={$selectedTasks.has(task._id)}
            on:change={() => handleTaskSelect(task._id)}
          >
        </td>
        <td class:urgent={task.taskPriority === 'high'}>{task.taskName}</td>
        <td>{task.taskDescription}</td>
        <td>{new Date(task.taskDueDate).toLocaleString()}</td>
        <td class:urgent={task.taskPriority === 'high'}>{task.taskPriority}</td>
        <td class:urgent={$deadlineMap[task._id] === 'Overdue'}>{$deadlineMap[task._id] || 'Calculating...'}</td>
      </tr>
    {/each}
  </tbody>
</table>

<!-- Action Menu -->
{#if $showActionMenu}
  <div id="actionMenu" style="display: flex;">
    <button id="markCompleteBtn" class="pure-button pure-button-primary" on:click={markComplete}>
      Mark Completed
    </button>
    <button id="editBtn" class="pure-button" on:click={editTask}>Edit</button>
    <button id="deleteBtn" class="button-error pure-button" on:click={deleteTask}>Delete</button>
  </div>
{/if}

<!-- Delete Modal -->
{#if $showDeleteModal}
  <div id="deleteModal" style="display: flex;">
    <div id="contents">
      <p>Are you sure you want to delete the selected task(s)?</p>
      <button id="confirmDeleteBtn" class="button-error pure-button" on:click={confirmDelete}>
        Yes, Delete
      </button>
      <button id="cancelDeleteBtn" class="pure-button" on:click={closeDeleteModal}>
        Cancel
      </button>
    </div>
  </div>
{/if}

<!-- Edit Modal -->
{#if $showEditModal}
  <div id="editModal" style="display: flex;">
    <div id="contents">
      <form on:submit={saveEdit}>
        <label>Task Name: <input type="text" bind:value={$editTaskName}></label><br>
        <label>Description: <input type="text" bind:value={$editTaskDescription}></label><br>
        <label>Due Date: <input type="datetime-local" bind:value={$editTaskDueDate}></label><br>
        <label>Priority:
          <select bind:value={$editTaskPriority}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label><br>
        <div class="buttons">
          <button type="submit" class="pure-button pure-button-primary">Save</button>
          <button type="button" class="pure-button" on:click={closeEditModal}>Cancel</button>
        </div>
      </form>
    </div>
  </div>
{/if}

{#if $showImportModal}
  <ImportModal
    events={$importEvents}
    selectedEvents={$selectedEvents}
    onToggleEvent={handleToggleEvent}
    onSelectAll={handleSelectAllEvents}
    onDeselectAll={handleDeselectAllEvents}
    onImport={handleImportEvents}
    onClose={handleImportModalClose}
    onUpdatePriority={handleUpdatePriority}
  />
{/if}

<!-- Pull the Footer component -->
<Footer
  navigateTo={navigateTo} 
  onHome={false}
  onTasks={true}
/>

<!-- CSS -->
<style>
  .completed {
    opacity: 0.6;
    text-decoration: line-through;
  }

  td {
    color: var(--option);
  }

  .sortable {
    cursor: pointer;
    user-select: none;
    transition: background-color 0.3s ease;
  }

  .sortable:hover {
    background-color: var(--highlight);
    color: var(--base);
  }

  .sortable:active {
    background-color: var(--links);
  }

  .import-section {
    margin-bottom: 1rem;
    display: flex;
    justify-content: flex-end;
  }

  .import-button {
    background-color: var(--links);
    color: var(--base);
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: bold;
    transition: all 0.2s ease;
  }

  .import-button:hover {
    background-color: var(--highlight);
    transform: translateY(-1px);
  }

  #editModal input {
    color: var(--option);
    background-color: var(--base);
  }

  #editModal select {
    color: var(--option);
    background-color: var(--base);
  }
</style>