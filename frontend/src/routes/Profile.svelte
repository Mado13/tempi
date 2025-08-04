<!-- src/lib/components/RoleSwitch.svelte -->
<script lang="ts">
  import { navigate } from '$router'

  import { invalidateAllStores } from '$lib/stores/create-crud-store.svelte'
  import { authStoreContext } from '$lib/stores/registry.store.svelte'

  const authStore = authStoreContext.get()

  const availableSwitch = $derived.by(() => {
    if (!authStore.hasMultipleRoles || !authStore.currentUser) return null
    return authStore.currentUser.currentRole === 'worker'
      ? { role: 'employer' as const, label: 'Switch to Employer View' }
      : { role: 'worker' as const, label: 'Switch to Worker View' }
  })

  async function handleRoleSwitch(role: 'worker' | 'employer') {
    await authStore.switchRole(role)
  }
</script>

{#if availableSwitch}
  <div class="role-switcher-container">
    <button class="role-switch-button" onclick={() => handleRoleSwitch(availableSwitch.role)}>
      {availableSwitch.label}
    </button>
  </div>
{/if}

<style>
  .role-switcher-container {
    padding: 8px 16px;
    background-color: #f0f0f0;
    text-align: center;
    border-bottom: 1px solid #e0e0e0;
  }
  .role-switch-button {
    background-color: var(--color-primary-accent, #eef4ff);
    color: var(--color-primary, #007bff);
    border: 1px solid var(--color-primary-border, #b3d7ff);
    padding: 10px 15px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
  }
</style>
