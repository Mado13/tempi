<script lang="ts">
  import { route } from '$router'

  import Calendar from '$lib/components/Calendar.svelte'

  const role = route.params.role
</script>

<Calendar />

{#if role === 'worker'}
  <h1>Worker cards</h1>
{:else}
  <h1>Employer cards</h1>
{/if}
