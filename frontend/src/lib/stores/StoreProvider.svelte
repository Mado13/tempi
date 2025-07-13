<script lang="ts">
  import { initApi } from '$lib/api'
  import { syncService } from '$lib/services/sync.service'
  import { type Job, authStoreContext, jobsStoreContext } from '$lib/stores/contexts'
  import { createAuthStore } from '$lib/stores/create-auth-store.svelte'
  import { createCrudStore } from '$lib/stores/create-crud-store.svelte'

  let { children } = $props()

  const authStore = createAuthStore()
  const jobsStore = createCrudStore<Job>('jobs')

  initApi(authStore)

  authStoreContext.set(authStore)
  jobsStoreContext.set(jobsStore)

  const initializationPromise = (async () => {
    try {
      await syncService.init()
    } catch (error) {
      console.error('Critical Failure: Sync Service could not initialize.', error)
    }

    await authStore.init()

    try {
      await jobsStore.init({ authStore })
    } catch (error) {
      console.error('A non-critical store (jobsStore) failed to initialize:', error)
    }
  })()

  $effect(() => {
    return () => {
      syncService.destroy()
      authStore.destroy()
      jobsStore.destroy()
    }
  })
</script>

{#await initializationPromise}
  <p>Loading application...</p>
{:then}
  {@render children()}
{:catch error}
  <p style="color: red;">
    A critical error occurred while starting the application. Please restart.
  </p>
{/await}
