<script lang="ts">
import { router } from '@inertiajs/svelte'

import BottomNavigation from './Components/Layout/BottomNavigation.svelte'

let { children, activeRole } = $props()
</script>

<div class="app-container">
  <div class="main-content">
    <div class="role-switch">
      <button onclick={() => router.post('/toggle-role')} type="button">Toggle Role</button>
    </div>
    <div class="content-wrapper">
      {@render children()}
    </div>
  </div>
  <BottomNavigation {activeRole} />
</div>

<style lang="scss">
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: env(safe-area-inset-top, 0) env(safe-area-inset-right, 0) 0 env(safe-area-inset-left, 0);
  scroll-padding-bottom: calc(3.5rem + env(safe-area-inset-bottom, 0));
}

.content-wrapper {
  padding-bottom: calc(3.5rem + env(safe-area-inset-bottom, 0));
}

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
