<script>
  import { onMount, onDestroy } from 'svelte';
  import { isAuthenticated, startAuth, stopAuth, authState } from './utils/auth.js';
  import Login from './components/Login.svelte'
  import Register from './components/Register.svelte';
  import Home from './components/Home.svelte';
  import Tasks from './components/Tasks.svelte';
  import Contact from './components/Contact.svelte';

  let currentRoute = '';
  let authWatchInterval = null;

  // On mounting the app, determine the current route and start auth watching
  onMount(() => {
    // Determine initial route
    const path = window.location.pathname;
    currentRoute = path === '/' ? (isAuthenticated() ? 'home' : 'login') : path.slice(1);

    // Start authentication watcher for protected pages
    const protectedPages = ['home', 'tasks'];
    if (protectedPages.includes(currentRoute)) {
      authWatchInterval = startAuth();
    }

    // Listen for popstate events to handle browser navigation
    window.addEventListener('popstate', handleRouteChange);
    
    // Listen for authentication state changes
    const unsubscribe = authState.subscribe(authenticated => {
      // If user becomes unauthenticated while on a protected page, redirect
      const protectedPages = ['home', 'tasks'];
      if (!authenticated && protectedPages.includes(currentRoute)) {
        navigateTo('login');
      }
    });

    // Return cleanup function
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      unsubscribe();
    };
  });

  // Cleanup on component destroy
  onDestroy(() => {
    if (authWatchInterval) {
      stopAuth(authWatchInterval);
    }
  });

  function handleRouteChange() {
    const path = window.location.pathname;
    const newRoute = path === '/' ? (isAuthenticated() ? 'home' : 'login') : path.slice(1);
    navigateTo(newRoute);
  }

  // Function to navigate to a specific route
  function navigateTo(route) {
    // Stop existing auth watcher
    if (authWatchInterval) {
      stopAuth(authWatchInterval);
      authWatchInterval = null;
    }

    currentRoute = route;
    window.history.pushState({}, '', `/${route === 'login' ? '' : route}`);

    // Start auth watcher for protected pages
    const protectedPages = ['home', 'tasks'];
    if (protectedPages.includes(route) && isAuthenticated()) {
      authWatchInterval = startAuth();
    }
  }
</script>

<!-- Route Navigation Tree -->
{#if currentRoute === 'login'}
  <Login {navigateTo} />
{:else if currentRoute === 'register'}  
  <Register {navigateTo} />
{:else if currentRoute === 'home'}
  <Home {navigateTo} />
{:else if currentRoute === 'tasks'}
  <Tasks {navigateTo} />
{:else if currentRoute === 'contact'}
  <Contact {navigateTo} />
{/if}