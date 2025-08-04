<script lang="ts">
  import { navigate } from '$router'
  import { type Snippet, onMount } from 'svelte'

  import { keyboardManager } from '$lib/actions/keyboard-manager'
  import BottomNavigation from '$lib/components/BottomNavigation.svelte'
  import BottomSheetContainer from '$lib/components/BottomSheetContainer.svelte'
  import Snackbar from '$lib/components/Snackbar.svelte'
  import SnackbarContainer from '$lib/components/SnackbarContainer.svelte'
  import { initStorageServices } from '$lib/services/storage'
  import {
    supabaseAuthContext,
    supabaseAuthService,
  } from '$lib/services/supabase-auth.service.svelte'
  import { authStore } from '$lib/stores/auth.store.svelte'

  let { children }: { children: Snippet } = $props()

  supabaseAuthContext.set(supabaseAuthService)

  // Initialize storage services with the auth store (safe here)
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
  <div class="app-layout container">
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
      <p class="text-body">Authenticating...</p>
    </div>
  </div>
{/if}

<style>
  /* App layout container */
  .app-layout {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--color-background-app);
    contain: layout paint style;
    transform: translateZ(0); /* Create compositing layer */
  }

  /* Main content area - custom class to avoid design system conflicts */
  .main-content {
    flex: 1;
    height: 100%;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    background: var(--color-background-screen);
    position: relative;
  }

  /* Content wrapper - NO padding here, let individual pages/components handle it */
  .content-wrapper {
    min-height: 100%;
    /* Reserve space for bottom nav - this is the ONLY bottom padding */
    padding-bottom: calc(var(--bottom-nav-height) + var(--safe-bottom));
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
    text-align: center;
    padding: var(--space-6);
  }

  /* Loading spinner */
  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 2px solid var(--color-border-default);
    border-top-color: var(--color-primary);
    border-radius: var(--radius-full);
    animation: spin 1s linear infinite;
  }

  .loading-content p {
    margin: 0;
    color: var(--color-text-secondary);
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Keyboard handling */
  :global(.keyboard-visible) .main-content {
    /* Content area adjusts, nav hides automatically */
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .loading-spinner {
      animation: none;
      border-top-color: var(--color-primary);
    }

    .app-layout {
      transform: none;
    }
  }

  /* High contrast support */
  @media (prefers-contrast: high) {
    .loading-spinner {
      border-width: 3px;
    }
  }
</style>
