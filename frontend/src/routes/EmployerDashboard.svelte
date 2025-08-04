<script lang="ts">
  import { onMount } from 'svelte'

  import { api } from '$lib/api'
  import {
    groupApplications,
    useApplicationsStore,
  } from '$lib/stores/resources/applications.store.svelte'

  const applicationsStore = useApplicationsStore()
  const groupedApplications = $derived(groupApplications(applicationsStore.items))

  onMount(() => {
    api.patch('/user/me', { user: { touchDashboardVisit: true } })
    applicationsStore.init()
  })
</script>

<h1>Dash</h1>
