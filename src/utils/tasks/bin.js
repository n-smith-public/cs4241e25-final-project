import { writable } from 'svelte/store';
import swal from 'sweetalert';

export const showBin = writable(false);
export const binItems = writable([]);
export const selectedItems = writable(new Set());

export async function loadBinItems() {
    try {
        const response = await fetch('/recycleBin');
        if (response.ok) {
            const data = await response.json();
            binItems.set(data);
        } else {
            console.error('Failed to load bin items:', response.statusText);
        }
    } catch (error) {
        console.error('Error loading bin items:', error);
    }
}

export function toggleBinSelect(itemId) {
    selectedItems.update(selected => {
        const newSelected = new Set(selected);
        if (newSelected.has(itemId)) {
            newSelected.delete(itemId);
        } else {
            newSelected.add(itemId);
        }
        return newSelected;
    });
}

export async function restoreSelectedItems() {
    selectedItems.update(selected => {
        if (selected.size === 0) {
            swal('No items selected', 'Please select items to restore.', 'warning');
            return selected;
        }

        const ids = Array.from(selected);

        fetch('/restoreTask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids })
        })
        .then(response => response.json())
        .then(result => {
            if (result.status === 'success') {
                swal('Restored', 'Selected items have been restored successfully.', 'success');
                loadBinItems(); // Reload bin items after restoration
                selectedItems.set(new Set()); // Clear selection
            } else {
                swal('Error', 'Failed to restore items: ' + result.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error restoring items:', error);
            swal('Error', 'An error occurred while restoring items.', 'error');
        });

        return selected;
    });
}

export async function yeetItem() {
    selectedItems.update(selected => {
        if (selected.size === 0) {
            swal('No items selected', 'Please select items to delete.', 'warning');
            return selected;
        }

        swal({
            title: 'Permanent Deletion',
            text: 'Are you sure you want to permanently delete the selected items? This action cannot be undone.',
            icon: 'warning',
            buttons: ['Cancel', 'Delete '],
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                const ids = Array.from(selected);

                fetch ('/deletePermanently', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ ids })
                })
                .then(response => response.json())
                .then(result => {
                    if (result.status === 'success') {
                        swal('Deleted', 'Selected items have been permanently deleted.', 'success');
                        loadBinItems();
                        selectedItems.set(new Set());
                    } else {
                        swal('Error', 'Failed to delete items: ' + result.message, 'error');
                    }
                })
                .catch(error => {
                    console.error('Error deleting items:', error);
                    swal('Error', 'An error occurred while deleting items.', 'error');
                });
            }
        });

        return selected;
    });
}

export function formatTimeRemaining(expiration) {
    const now = new Date();
    const expires = new Date(expiration);
    const diffMs = expires.getTime() - now.getTime();

    if (diffMs <= 0) {
        return 'Expired';
    }

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
        return `${days}d ${hours}h remaining`;
    } else {
        return `${hours}h remaining`;
    }
}