import { writable } from 'svelte/store';

export const authState = writable(false);

// Gets a cookie from the browser, used for authentication and display name purposes
export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    return null;
}

// Checks if the user is currently authenticated
export function isAuthenticated() {
    return getCookie('auth') === 'true';
}

// Redirects to the login page if the user is not authenticated
export function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/login';
        return false;
    }
    return true;
}

// Retrieves the user's email from cookies
export function getUserEmail() {
    return getCookie('email') || '';
}

// Retrieves the user's display name from cookies
export function getUserDisplayName() {
    return getCookie('displayName') || '';
}

export function checkAuthStatus() {
    const authenticated = isAuthenticated();
    authState.set(authenticated);
    return authenticated;
}

export function startAuth() {
    checkAuthStatus();

    const interval = setInterval(() => {
        const wasAuthenticated = authState;
        const isCurrentlyAuthenticated = checkAuthStatus();

        if (!isCurrentlyAuthenticated) {
            console.log('Authenticated expired, redirecting to login...');
            clearInterval(interval);
            window.location.href = '/login';
        }
    }, 30000);

    return interval;
}

export function stopAuth(interval) {
    if (interval) {
        clearInterval(interval);
    }
}