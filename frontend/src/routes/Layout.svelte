<script lang="ts">
  import type { Snippet } from 'svelte'

  import BottomNavigation from '../lib/components/BottomNavigation.svelte'

  let { children }: { children: Snippet } = $props()
</script>

<div class="wrapper">
  {@render children()}
  <BottomNavigation />
</div>
