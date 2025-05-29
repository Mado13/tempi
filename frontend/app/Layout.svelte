<script lang="ts">
import { router } from '@inertiajs/svelte'

import BottomNavigation from '$components/layout/BottomNavigation.svelte'

let { children, activeRole } = $props()
</script>

<div class="main-content">
  <div class="content-wrapper">
    <div class="role-switch">
      <button onclick={() => router.post('/toggle-role')} type="button">Toggle Role</button>
    </div>
    {@render children()}
  </div>
</div>
<BottomNavigation {activeRole} />

<style lang="scss">
.role-switch {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  margin: 0.5rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}
</style>
