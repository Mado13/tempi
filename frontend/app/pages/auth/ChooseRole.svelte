<script lang="ts">
import { m } from '$i18n/paraglide/messages'
import AuthLayout from './AuthLayout.svelte'
import { router } from '@inertiajs/svelte'

type Role = 'worker' | 'employer' | 'both' | undefined

function handleRoleSelect(role: Role) {
  router.post('/choose-role', { role })
}
</script>

<AuthLayout>
  <h1>{m.choose_role_title()}</h1>
  <button onclick={() => handleRoleSelect('worker')}>{m.choose_role_worker()}</button>
  <button onclick={() => handleRoleSelect('employer')}>{m.choose_role_employer()}</button>
  <button onclick={() => handleRoleSelect('both')}>{m.choose_role_both()}</button>
</AuthLayout>
