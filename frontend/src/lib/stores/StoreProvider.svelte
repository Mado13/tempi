<script lang="ts">
  import { createAuthStore } from './create-auth-store.svelte'
  import { authStoreContext } from './registry.store.svelte'
  import { destroyAllStores, initializeAllStores } from './registry.store.svelte'

  let { children } = $props()

  // Only create auth store - CRUD stores created on-demand
  const authStore = createAuthStore()
  authStoreContext.set(authStore)

  const initPromise = authStore.init()

  // Auto-manage all registered stores based on auth
  $effect(() => {
    if (authStore.isAuthenticated) {
      initializeAllStores(authStore)
    } else {
      destroyAllStores()
    }
  })

  // Cleanup on unmount
  $effect(() => {
    return () => {
      authStore.destroy()
      destroyAllStores()
    }
  })
</script>

{#await initPromise}
  <div class="loading-screen">
    <p>Initializing application...</p>
  </div>
{:then}
  {@render children()}
{:catch error}
  <div class="error-screen">
    <h2>Failed to start application</h2>
    <p>{error.message}</p>
    <button onclick={() => window.location.reload()}> Retry </button>
  </div>
{/await}

<style>
  .loading-screen,
  .error-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
  }

  .error-screen {
    color: #dc2626;
  }
</style>
