<script lang="ts">
  import { navigate } from '$router'
  import { onMount } from 'svelte'

  import { authStore } from '$lib/stores/auth.store.svelte'

  async function routeUser() {
    if (!authStore.isInitialized) {
      await authStore.init().catch(() => {})
    }
    if (!authStore.isAuthenticated) {
      navigate('/auth/login', { replace: true })
      return
    }
    const u = authStore.currentUser
    const entry = u?.currentRole ? `/app/${u.currentRole}/agenda` : '/app/select-role'
    navigate(entry, { replace: true })
  }

  onMount(routeUser)

  $effect(() => {
    // when loading finishes, decide
    if (!authStore.isLoading) routeUser()
  })
</script>

<p>Loading...</p>
