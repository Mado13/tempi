<script lang="ts">
  import { navigate } from '$router'
  import { type Snippet, onMount } from 'svelte'

  import { keyboardManager } from '$lib/actions/keyboard-manager'
  import BottomNavigation from '$lib/components/BottomNavigation.svelte'
  import BottomSheetContainer from '$lib/components/BottomSheetContainer.svelte'
  import SnackbarContainer from '$lib/components/SnackbarContainer.svelte'
  // NEW: init storage registry here (component init)
  import { initStorageServices } from '$lib/services/storage'
  import {
    supabaseAuthContext,
    supabaseAuthService,
  } from '$lib/services/supabase-auth.service.svelte'
  import { authStoreContext } from '$lib/stores/registry.store.svelte'

  let { children }: { children: Snippet } = $props()

  // Set context once
  supabaseAuthContext.set(supabaseAuthService)
  const authStore = authStoreContext.get()

  // Initialize storage services with the auth store (safe here)
  initStorageServices(authStore)

  let supabaseReady = $state(false)

  onMount(async () => {
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
  <main use:keyboardManager>
    {@render children()}
  </main>
  <BottomNavigation />
  <SnackbarContainer />
  <BottomSheetContainer />
{:else}
  <div class="loading-container">
    <p>Authenticating...</p>
  </div>
{/if}

<style>
  main {
    flex: 1;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }
  .loading-container {
    display: grid;
    place-items: center;
    height: 100vh;
  }
</style>
