import ICAL from 'ical.js';
import { writable } from 'svelte/store';
import swal from 'sweetalert';
import { loadTasks } from './fetchTask.js';
import { taskDueDate } from './newTask.js';

export const showImportModal = writable(false);
export const importEvents = writable([]);
export const selectedEvents = writable(new Set());

export function parseIcal(fileContent) {
    try {
        const jcalData = ICAL.parse(fileContent);
        const comp = new ICAL.Component(jcalData);
        const vevents = comp.getAllSubcomponents('vevent');

        const seenIds = new Set();
        let idCounter = 0;
        const now = new Date();

        const events = vevents.map(vevent => {
            const event = new ICAL.Event(vevent);
            const startDate = event.startDate ? event.startDate.toJSDate() : new Date();
            const endDate = event.endDate ? event.endDate.toJSDate() : new Date(startDate.getTime() + 60 * 60 * 1000);

            let eventId = event.uid || `event-${Date.now()}-${Math.random()}`;

            if (seenIds.has(eventId)) {
                eventId = `event-${Date.now()}-${++idCounter}`;
            }

            seenIds.add(eventId);

            return {
                id: eventId,
                summary: event.summary || 'Untitled Event',
                description: event.description || '',
                startDate: startDate,
                endDate: endDate,
                location: event.location || '',
                priority: determinePriority(event),
                dueDate: endDate
            };
        })
        .filter(event => event.startDate > now);

        return events;
    } catch (error) {
        console.error('Error parsing iCal file:', error);
        throw new Error('Invalid iCal file format');
    }
}

function determinePriority(event) {
    if (event.component && event.component.getFirstPropertyValue) {
        const priority = event.component.getFirstPropertyValue('priority');
        if (priority) {
            if (priority <= 4) return 'high';
            if (priority === 5) return 'medium';
            return 'low';
        }
    }

    const text = `${event.summary || ''} ${event.description || ''}`.toLowerCase();
    const highPriorityKeywords = ['urgent', 'important', 'asap', 'critical', 'deadline'];
    const lowPriorityKeywords = ['optional', 'nice to have', 'later', 'someday', 'low priority'];

    if (highPriorityKeywords.some(keyword => text.includes(keyword))) {
        return 'high';
    }

    if (lowPriorityKeywords.some(keyword => text.includes(keyword))) {
        return 'low';
    }

    return 'medium';
}

export async function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.ics')) {
        swal('Invalid File', 'Please upload a valid .ics file.', 'error');
        return;
    }

    try {
        const fileContent = await readFileContent(file);
        const events = parseIcal(fileContent);

        if (events.length === 0) {
            swal('No Events Found', 'The iCal file does not contain any valid events.', 'info');
            return;
        }

        events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        importEvents.set(events);
        selectedEvents.set(new Set());
        showImportModal.set(true);
    } catch (error) {
        console.error('Error importing file:', error);
        swal('Import Error', 'An error occurred while importing the file. Please try again.', 'error');
    }
}

function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('Failed to read file: ' + e.target.error.message));
        reader.readAsText(file);
    });
}

export function toggleEventSelection(eventID) {
    selectedEvents.update(selected => {
        const newSelected = new Set(selected);
        if (newSelected.has(eventID)) {
            newSelected.delete(eventID);
        } else {
            newSelected.add(eventID);
        }
        return newSelected;
    });
}

export function selectAllEvents(events) {
    selectedEvents.set(new Set(events.map(event => event.id)));
}

export function deselectAllEvents() {
    selectedEvents.set(new Set());
}

function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export async function importSelectedEvents(events, selected) {
    if (selected.size === 0) {
        swal('No Events Selected', 'Please select at least one event to import.', 'warning');
        return;
    }

    const eventsToImport = events.filter(event => selected.has(event.id));
    const tasksToCreate = eventsToImport.map(event => {
        const taskDueDate = formatDateForInput(new Date(event.dueDate));

        let description = event.description || '';
        if (event.location) {
            description += description ? `\nLocation: ${event.location}` : `Location: ${event.location}`;
        }

        if (!description.trim()) {
            description = 'Imported from iCal';
        }

        const task = {
            taskName: event.summary || 'Untitled Event',
            taskDescription: description,
            taskDueDate: taskDueDate,
            taskPriority: event.priority || 'medium',
        };

        if (!task.taskName || !task.taskDescription || !task.taskDueDate || !task.taskPriority) {
            console.error('Missing required task fields:', task);
        }

        return task;
    });

    try {
        let successCount = 0;
        let failCount = 0;

        for (const task of tasksToCreate) {
            try {
                const response = await fetch('/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(task)
                });

                const result = await response.json();
                if (result.status === 'success') {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (error) {
                failCount++;
            }
        }

        if (successCount > 0 && failCount === 0) {
            swal('Success', `Successfully imported ${successCount} task${successCount === 1 ? '' : 's'}!`, 'success');
        } else if (successCount > 0 && failCount > 0) {
            swal('Partial Success', `Imported ${successCount} task${successCount === 1 ? '' : 's'}, ${failCount} failed`, 'warning');
        } else {
            swal('Error', 'Failed to import any tasks', 'error');
        }

        if (successCount > 0) {
            await loadTasks();
        }
        showImportModal.set(false);
    } catch (error) {
        swal('Import Error', 'An error occurred while importing the tasks. Please try again.', 'error');
    }
}

export function closeImportModal() {
    showImportModal.set(false);
    importEvents.set([]);
    selectedEvents.set(new Set());
}

export function updateEventPriority(eventID, newPriority) {
    importEvents.update(events => {
        return events.map(event => 
            event.id === eventID ? { ...event, priority: newPriority } : event
        );
    });
}