<script lang="ts">
  import { navigate } from '$router'

  import { authStoreContext } from '$lib/stores/contexts'

  const authStore = authStoreContext.get()

  $effect(() => {
    // This effect runs after the StoreProvider has initialized the authStore.
    // We can now safely check the authentication status.

    if (authStore.isLoading) {
      // Still waiting for the initial auth check, do nothing yet.
      return
    }

    if (!authStore.isAuthenticated) {
      navigate('/auth/login', { replace: true })
      return
    }

    const currentUser = authStore.currentUser
    const entryPoint = currentUser?.currentRole
      ? `/app/${currentUser.currentRole}/agenda`
      : '/app/select-role'

    navigate(entryPoint, { replace: true })
  })
</script>

<p>Loading...</p>
