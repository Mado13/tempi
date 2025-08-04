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
  .app-layout {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 100vh;
    height: 100dvh;
    background: var(--color-background-app);
    overflow: hidden;
  }

  .main-content {
    position: absolute;
    top: env(safe-area-inset-top);
    left: env(safe-area-inset-left);
    right: env(safe-area-inset-right);
    bottom: calc(5rem + env(safe-area-inset-bottom));
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .main-content::-webkit-scrollbar {
    display: none;
  }

  .content-wrapper {
    min-height: 100%;
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

  /* Legacy iOS Safari fallback */
  @supports (-webkit-touch-callout: none) and (not (height: 100dvh)) {
    .app-layout {
      height: -webkit-fill-available;
    }
  }
</style>
