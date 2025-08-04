<script lang="ts">
  import { navigate } from '$router'
  import { type Snippet, onMount } from 'svelte'

  import BottomNavigation from '$lib/components/BottomNavigation.svelte'
  import BottomSheetContainer from '$lib/components/BottomSheetContainer.svelte'
  import Snackbar from '$lib/components/Snackbar.svelte'
  import { initStorageServices } from '$lib/services/storage'
  import {
    supabaseAuthContext,
    supabaseAuthService,
  } from '$lib/services/supabase-auth.service.svelte'
  import { authStore } from '$lib/stores/auth.store.svelte'

  let { children }: { children: Snippet } = $props()

  supabaseAuthContext.set(supabaseAuthService)
  initStorageServices(authStore)

  let supabaseReady = $state(false)

  onMount(async () => {
    if (!authStore.isInitialized) {
      await authStore.init().catch(() => {})
    }
    if (!supabaseAuthService.isAuthenticated) {
      const ok = await supabaseAuthService.initialize()
      if (!ok) console.error('Supabase auth failed')
    }
    supabaseReady = true
  })

  $effect(() => {
    if (!authStore.isLoading && !authStore.isAuthenticated) {
      navigate('/auth/login', { replace: true })
    }
  })

  const showApp = $derived(
    authStore.isAuthenticated && (supabaseReady || supabaseAuthService.isAuthenticated),
  )
</script>

{#if showApp}
  <div class="app-layout">
    <main class="main-content">
      <div class="content-wrapper">
        {@render children()}
        <Snackbar />
      </div>
    </main>
    <BottomNavigation />
    <BottomSheetContainer />
  </div>
{:else}
  <div class="loading-screen">
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <p>Authenticating...</p>
    </div>
  </div>
{/if}

<style>
  /* SIMPLE FIXED LAYOUT - NO FLEX CONFUSION */

  .app-layout {
    position: fixed;
    top: var(--safe-top);
    left: var(--safe-left);
    right: var(--safe-right);
    bottom: 0;
    background: var(--color-background-app);
    overflow: hidden;
  }

  .main-content {
    position: fixed;
    top: var(--safe-top);
    left: var(--safe-left);
    right: var(--safe-right);
    bottom: var(--bottom-nav-height);
    background: var(--color-background-app); /* Same as page background */
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .main-content::-webkit-scrollbar {
    display: none;
  }

  .content-wrapper {
    min-height: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  /* Loading screen */
  .loading-screen {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    background: var(--color-background-app);
    z-index: 9999;
  }

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
  }

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 2px solid var(--color-border-default);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
