<script>
    import { fade, fly } from 'svelte/transition';
    import {
        binItems,
        selectedItems,
        toggleBinSelect,
        restoreSelectedItems,
        yeetItem,
        formatTimeRemaining
    } from '../utils/tasks/bin.js';

    export let onClose;

    function handleItemSelect(itemID) {
        toggleBinSelect(itemID);
    }

    function handleRestore() {
        restoreSelectedItems();
    }

    function handlePermDelete() {
        yeetItem();
    }

    function handleSelectAll() {
        if ($selectedItems.size === $binItems.length) {
            selectedItems.set(new Set());
        } else {
            selectedItems.set(new Set($binItems.map(item => item._id)));
        }
    }
</script>

<div
    class="modal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="bin-title"
    transition:fade="{{ duration: 300 }}"
    on:click={(e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }}

    on:keydown={(e) => e.key === 'Escape' && onClose()}
>
    <div class="modal-content" transition:fly="{{ y: -50, duration: 300 }}" on:click|stopPropagation>
        <div class="modal-header">
            <h2>Recycle Bin</h2>
            <button class="close-button" on:click={onClose} aria-label="Close Recycle Bin">&times;</button>
        </div>
        <div class="bin-note">
            <p>All tasks will automatically delete after seven (7) days in the Bin.</p>
        </div>
        
        <div class="modal-body">
            {#if $binItems.length === 0}
                <p class="empty-message">Your bin is empty.</p>
            {:else}
                <div class="actions">
                    <button class="select-all-btn" on:click={handleSelectAll} aria-label="{$selectedItems.size === $binItems.length ? 'Deselect All' : 'Select All'}">
                        {$selectedItems.size === $binItems.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <div class="action-buttons">
                        <button class="restore-btn" on:click={handleRestore} disabled={$selectedItems.size === 0} aria-label="Restore {$selectedItems.size} selected item{$selectedItems.size > 1 ? 's' : ''}">
                            Restore Selected
                        </button>
                        <button class="delete-btn" on:click={handlePermDelete} disabled={$selectedItems.size === 0} aria-label="Permanently delete {$selectedItems.size} selected item{$selectedItems.size > 1 ? 's' : ''}">
                            Permanently Delete
                        </button>
                    </div>
                </div>

                <div class="bin-items" role="list" aria-label="Deleted Tasks">
                    {#each $binItems as item (item._id)}
                        <label class="item-checkbox" class:selected={$selectedItems.has(item._id)} role="listitem">
                            <input type="checkbox"
                                checked={$selectedItems.has(item._id)}
                                on:change|stopPropagation={() => handleItemSelect(item._id)}
                                aria-describedby="item-info-{item._id}"
                                aria-label="Select {item.taskName}">
                            <div class="item-info" id="item-desc-{item._id}">
                                <div class="item-name">{item.taskName}</div>
                                <div class="item-desc">{item.taskDescription}</div>
                                <div class="item-meta">
                                    <span class="deleted-date">
                                        Deleted: {new Date(item.deletedAt).toLocaleString()}
                                    </span>
                                    <span class="expires-date" class:urgent={formatTimeRemaining(item.expiresAt).includes('h')} aria-label="Expires {formatTimeRemaining(item.expiresAt)}">
                                        Expires: {formatTimeRemaining(item.expiresAt)}
                                    </span>
                                </div>
                            </div>
                        </label>
                    {/each}
                </div>
            {/if}
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
        z-index: 1000;
    }

    .modal-content {
        background-color: var(--base);
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border-bottom: 1px solid var(--option);
        background-color: var(--links);
        color: var(--base);
    }

    .modal-header h2 {
        margin: 0;
        font-size: 1.5rem;
    }

    .bin-note {
        padding: 0.75rem 1rem;
        background-color: var(--highlight);
        border-bottom: 1px solid var(--option);
        margin-bottom: -0.5rem;
    }

    .bin-note p {
        margin: 0;
        color: var(--option);
        font-size: 0.9rem;
        font-style: italic;
        text-align: center;
    }

    .close-button {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--base);
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .close-button:hover {
        opacity: 0.7;
    }

    .modal-body {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
    }

    .empty-message {
        text-align: center;
        color: var(--option);
        font-style: italic;
        margin: 2rem 0;
    }

    .actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--option);
    }

    .action-buttons {
        display: flex;
        gap: 0.5rem;
    }

    .select-all-btn, .restore-btn, .delete-btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.2s ease;
    }

    .select-all-btn {
        background-color: var(--highlight);
        color: var(--base);
    }

    .restore-btn {
        background-color: #28a745;
        color: white;
    }

    .delete-btn {
        background-color: var(--warning);
        color: var(--base);
    }

    .select-all-btn:hover, .restore-btn:hover, .delete-btn:hover {
        opacity: 0.8;
        transform: translateY(-1px);
    }

    .restore-btn:disabled, .delete-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    .bin-items {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .item-checkbox {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        cursor: pointer;
        width: 100%;
    }

    .item-checkbox input[type="checkbox"] {
        margin-top: 0.25rem;
    }

    .item-info {
        flex: 1;
    }

    .item-name {
        font-weight: bold;
        font-size: 1rem;
        margin-bottom: 0.25rem;
        color: var(--option);
    }

    .item-desc {
        font-size: 0.9rem;
        color: var(--option);
        margin-bottom: 0.5rem;
    }

    .item-meta {
        display: flex;
        gap: 1rem;
        font-size: 0.8rem;
        color: var(--option);
    }

    .expires-date.urgent {
        color: var(--highlight);
        font-weight: bold;
    }
</style>