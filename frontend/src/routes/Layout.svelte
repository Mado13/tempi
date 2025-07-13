<script lang="ts">
  import { navigate } from '$router'
  import type { Snippet } from 'svelte'

  import BottomNavigation from '$lib/components/BottomNavigation.svelte'
  import SnackbarContainer from '$lib/components/SnackbarContainer.svelte'
  import { authStoreContext } from '$lib/stores/contexts'

  let { children }: { children: Snippet } = $props()
  const authStore = authStoreContext.get()

  $effect(() => {
    if (!authStore.isLoading && !authStore.isAuthenticated) {
      navigate('/auth/login', { replace: true })
    }
  })
</script>

{#if authStore.isAuthenticated}
  <main>
    <div>
      {@render children()}
      <BottomNavigation />
      <SnackbarContainer />
    </div>
  </main>
{:else}
  <p>Authenticating...</p>
{/if}
