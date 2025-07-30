<script lang="ts">
  import { navigate } from '$router'
  import type { Snippet } from 'svelte'

  import { keyboardManager } from '$lib/actions/keyboard-manager'
  import BottomNavigation from '$lib/components/BottomNavigation.svelte'
  import BottomSheetContainer from '$lib/components/BottomSheetContainer.svelte'
  import SnackbarContainer from '$lib/components/SnackbarContainer.svelte'
  import { authStoreContext } from '$lib/stores/registry.store.svelte'

  let { children }: { children: Snippet } = $props()
  const authStore = authStoreContext.get()

  $effect(() => {
    if (!authStore.isLoading && !authStore.isAuthenticated) {
      navigate('/auth/login', { replace: true })
    }
  })
</script>

{#if authStore.isAuthenticated}
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
