<script lang="ts">
  import { onMount } from 'svelte'

  import { api } from '$lib/api'
  import { dashboardCards } from '$lib/components/dashboard/registry.svelte'
  import { useApplicationsStore } from '$lib/stores/resources/applications.store.svelte'
  import { usePositionsStore } from '$lib/stores/resources/positions.store.svelte'
  import { useProjectsStore } from '$lib/stores/resources/projects.store.svelte'

  const applicationsStore = useApplicationsStore()
  const projectsStore = useProjectsStore()
  const positionsStore = usePositionsStore()

  onMount(async () => {
    // api.patch('/user/me', { user: { touchDashboardVisit: true } })
    await Promise.all([projectsStore.init(), applicationsStore.init(), positionsStore.init()])
  })
</script>

<h1>Dash</h1>

<div>
  {#each dashboardCards as Card}
    <Card />
  {/each}
</div>
