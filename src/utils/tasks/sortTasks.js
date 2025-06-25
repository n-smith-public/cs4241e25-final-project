import { tasks, deadlineMap } from '../tasks.js';
import { writable, derived } from 'svelte/store';

export let sortColumn = writable(null);
export let sortDirection = writable('asc');
export let origOrder = writable([]);

tasks.subscribe($tasks => {
    if ($tasks.length > 0) {
        origOrder.update(order => {
            if (order.length === 0) {
                return $tasks.map(task => task._id);
            }
            return order;
        });
    }
});

export const sortedTasks = derived(
    [tasks, sortColumn, sortDirection, origOrder, deadlineMap],
    ([$tasks, $sortColumn, $sortDirection, $origOrder, $deadlineMap]) => {
        return getSortedTasks($tasks, $sortColumn, $sortDirection, $origOrder, $deadlineMap);
    }
)

function getSortedTasks(tasks, column, direction, origOrder, deadlineMap) {
    if (!column || direction === 'default') {
        const orderedTasks = [];
        origOrder.forEach(id => {
            const task = tasks.find(t => t._id === id);
            if (task) {
                orderedTasks.push(task);
            }
        });

        tasks.forEach(task => {
            if (!origOrder.includes(task._id)) {
                orderedTasks.push(task);
            }
        });
        return orderedTasks;
    }

    const sorted = [...tasks].sort((a, b) => {
        let aVal, bVal;

        switch (column) {
            case 'taskName':
                aVal = a.taskName.toLowerCase();
                bVal = b.taskName.toLowerCase();
                break;
            case 'taskDescription':
                aVal = a.taskDescription.toLowerCase();
                bVal = b.taskDescription.toLowerCase();
                break;
            case 'taskDueDate':
                aVal = new Date(a.taskDueDate);
                bVal = new Date(b.taskDueDate);
                break;
            case 'taskPriority':
                const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                aVal = priorityOrder[a.taskPriority] || 0;
                bVal = priorityOrder[b.taskPriority] || 0;
                break;
            case 'deadline':
                const aDeadline = deadlineMap[a._id];
                const bDeadline = deadlineMap[b._id];

                if (aDeadline === 'Overdue' && bDeadline === 'Overdue' ) return 0;
                if (aDeadline === 'Overdue' ) return direction === 'asc' ? -1 : 1;
                if (bDeadline === 'Overdue' ) return direction === 'asc' ? -1 : 1;

                aVal = parseDeadlineToMin(aDeadline);
                bVal = parseDeadlineToMin(bDeadline);
                break;
            default:
                return 0; 
        }

        if (typeof aVal === 'string' && typeof bVal === 'string') {
            return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        } else {
            return direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
    });

    return sorted;
}

function parseDeadlineToMin(deadline) {
    if (!deadline || deadline === 'Calculating...' ) return Infinity;

    const parts = deadline.match(/(\d+)([dhm])/g);
    if (!parts) return Infinity;

    let totalMinutes = 0;
    for (const part of parts) {
        const match = part.match(/(\d+)([dhm])/);
        if (match) {
            const val = parseInt(match[1]);
            const unit = match[2];
            
            switch (unit) {
                case 'd': totalMinutes += val * 24 * 60; break;
                case 'h': totalMinutes += val * 60; break;
                case 'm': totalMinutes += val; break;
            }
        }
    }
    return totalMinutes;
}

export function handleSort(column) {
    sortColumn.update(currentColumn => {
        sortDirection.update(currentDirection => {
            if (currentColumn === column) {
                if (currentDirection === 'asc') {
                    return 'desc';
                } else if (currentDirection === 'desc') {
                    sortColumn.set(null);
                    return 'default';
                } else {
                    sortColumn.set(column);
                    return 'asc';
                }
            } else {
                sortColumn.set(column);
                return 'asc';
            }
        });
        return column;
    });
}

export function getSortIcon(column, currentColumn, currentDirection) {
    if (currentColumn !== column) return '';
    if (currentDirection === 'asc') return '▲';
    if (currentDirection === 'desc') return '▼';
    return '';
}