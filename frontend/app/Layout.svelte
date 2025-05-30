<script lang="ts">
import BottomNavigation from '$components/layout/BottomNavigation.svelte'

let { children, activeRole } = $props()
</script>

<div class="main-content">
  {@render children()}
</div>
<BottomNavigation {activeRole} />
