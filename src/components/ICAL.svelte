<script>
    import { createEventDispatcher } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    
    export let events = [];
    export let selectedEvents = new Set();
    export let onToggleEvent;
    export let onSelectAll;
    export let onDeselectAll;
    export let onImport;
    export let onClose;
    export let onUpdatePriority;
    
    const dispatch = createEventDispatcher();
    
    function formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
    
    function getPriorityColor(priority) {
        switch(priority) {
            case 'high': return 'var(--highlight)';
            case 'medium': return 'var(--links)';
            case 'low': return 'var(--option)';
            default: return 'var(--option)';
        }
    }

    function capitalisePriority(priority) {
        return priority.charAt(0).toUpperCase() + priority.slice(1);
    }

    function handlePriorityChange(eventID, newPriority) {
        onUpdatePriority(eventID, newPriority);
    }

    function handleSelectChange(eventID, event) {
        const target = event.target;
        if (target instanceof HTMLSelectElement) {
            handlePriorityChange(eventID, target.value);
        }
    }
    
    function handleImport() {
        onImport(events, selectedEvents);
    }
    
    function handleToggleEvent(eventId) {
        onToggleEvent(eventId);
    }
    
    function handleSelectAll() {
        onSelectAll(events);
    }
    
    function handleDeselectAll() {
        onDeselectAll();
    }
</script>

<div 
    class="modal-backdrop" 
    role="dialog" 
    aria-modal="true" 
    aria-labelledby="import-title"
    tabindex="-1"
    transition:fade="{{ duration: 300 }}"
    on:click={onClose}
>
    <div 
        class="modal-content" 
        role="document"
        transition:fly="{{ y: -50, duration: 300 }}"
        on:click|stopPropagation
    >
        <div class="modal-header">
            <h2 id="import-title">Import Calendar Events</h2>
            <button 
                type="button" 
                class="close-button" 
                on:click={onClose}
                aria-label="Close import modal"
            >
                &times;
            </button>
        </div>
        
        <div class="modal-body">
            <p class="import-info">
                Found {events.length} event{events.length === 1 ? '' : 's'} in your calendar file. 
                Select which events you'd like to import as tasks:
            </p>
            
            <div class="selection-controls">
                <button 
                    type="button" 
                    class="btn-secondary small" 
                    on:click={handleSelectAll}
                >
                    Select All
                </button>
                <button 
                    type="button" 
                    class="btn-secondary small" 
                    on:click={handleDeselectAll}
                >
                    Deselect All
                </button>
                <span class="selection-count">
                    {selectedEvents.size} of {events.length} selected
                </span>
            </div>
            
            <div class="events-list">
                {#each events as event (event.id)}
                    <div class="event-item" class:selected={selectedEvents.has(event.id)}>
                        <label class="event-checkbox">
                            <input 
                                type="checkbox" 
                                checked={selectedEvents.has(event.id)}
                                on:change={() => handleToggleEvent(event.id)}
                            >
                            <div class="event-details">
                                <div class="event-summary">{event.summary}</div>
                                <div class="event-meta">
                                    <span class="event-date">{formatDate(event.startDate)}</span>
                                    <div class="priority-container">
                                        <select
                                        class="priority-select field"
                                        value={event.priority}
                                        on:change={(e) => handleSelectChange(event.id, e)}
                                        style="color: {getPriorityColor(event.priority)}"
                                    >
                                            <option value="high" style="color: var(--highlight)">High</option>
                                            <option value="medium" style="color: var(--links)">Medium</option>
                                            <option value="low" style="color: var(--option)">Low</option>
                                        </select>
                                    </div>
                                </div>
                                {#if event.description}
                                    <div class="event-description">{event.description}</div>
                                {/if}
                                {#if event.location}
                                    <div class="event-location">📍 {event.location}</div>
                                {/if}
                            </div>
                        </label>
                    </div>
                {/each}
            </div>
        </div>
        
        <div class="modal-footer">
            <button 
                type="button" 
                class="btn-primary" 
                on:click={handleImport}
                disabled={selectedEvents.size === 0}
            >
                Import {selectedEvents.size} Task{selectedEvents.size === 1 ? '' : 's'}
            </button>
            <button 
                type="button" 
                class="btn-secondary" 
                on:click={onClose}
            >
                Cancel
            </button>
        </div>
    </div>
</div>

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
    }
    
    .modal-content {
        background: var(--base);
        border-radius: 8px;
        max-width: 800px;
        width: 90%;
        max-height: 90vh;
        border: 1px solid var(--option);
        display: flex;
        flex-direction: column;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border-bottom: 1px solid var(--option);
    }
    
    .modal-header h2 {
        margin: 0;
        color: var(--option);
    }
    
    .close-button {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: var(--option);
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .close-button:hover {
        color: var(--highlight);
    }
    
    .modal-body {
        padding: 1rem;
        flex: 1;
        overflow-y: auto;
    }
    
    .import-info {
        margin-bottom: 1rem;
        color: var(--option);
    }
    
    .selection-controls {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--option);
    }
    
    .selection-count {
        margin-left: auto;
        color: var(--option);
        font-size: 0.9rem;
    }
    
    .btn-secondary.small {
        padding: 0.25rem 0.5rem;
        font-size: 0.85rem;
    }
    
    .events-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-height: 400px;
        overflow-y: auto;
    }
    
    .event-item {
        border: 1px solid var(--option);
        border-radius: 4px;
        transition: all 0.2s ease;
    }
    
    .event-item:hover {
        background-color: rgba(0, 0, 0, 0.05);
    }
    
    .event-item.selected {
        border-color: var(--links);
        background-color: rgba(17, 77, 156, 0.1);
    }
    
    .event-checkbox {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.75rem;
        cursor: pointer;
        width: 100%;
    }
    
    .event-checkbox input[type="checkbox"] {
        margin-top: 0.2rem;
        flex-shrink: 0;
    }
    
    .event-details {
        flex: 1;
    }
    
    .event-summary {
        font-weight: bold;
        color: var(--option);
        margin-bottom: 0.25rem;
    }
    
    .event-meta {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin-bottom: 0.25rem;
        font-size: 0.9rem;
    }

    .priority-container {
        display: flex;
        align-items: center;
    }

    .priority-select.field {
        width: auto;
        min-width: 120px;
        padding: 0.5rem;
        margin-bottom: 0;
        font-size: 0.85rem;
        font-weight: bold;
        border: 1px solid var(--option);
        border-radius: 0.25rem;
        background-color: var(--base);
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .event-date {
        color: var(--option);
    }
    
    .event-priority {
        font-weight: bold;
    }
    
    .event-description, .event-location {
        font-size: 0.85rem;
        color: var(--option);
        margin-top: 0.25rem;
        opacity: 0.8;
    }
    
    .event-location {
        font-style: italic;
    }
    
    .modal-footer {
        display: flex;
        justify-content: space-between;
        padding: 1rem;
        border-top: 1px solid var(--option);
        gap: 0.5rem;
    }
    
    .btn-primary, .btn-secondary {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s ease;
    }
    
    .btn-primary {
        background-color: var(--links);
        color: var(--base);
    }
    
    .btn-primary:hover:not(:disabled) {
        background-color: var(--highlight);
    }
    
    .btn-primary:disabled {
        background-color: var(--option);
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .btn-secondary {
        background-color: transparent;
        color: var(--option);
        border: 1px solid var(--option);
    }
    
    .btn-secondary:hover {
        background-color: var(--highlight);
        color: var(--base);
        border-color: var(--highlight);
    }
</style>