<script lang="ts">
  import { navigate } from '$router'
  import * as v from 'valibot'

  import { api } from '$lib/api'
  import type { UserRole } from '$lib/stores/create-auth-store.svelte'

  import { createForm } from '../lib/forms'

  const selectRoleSchema = v.object({
    role: v.string(),
  })

  const form = createForm({
    schema: selectRoleSchema,
    defaultValues: {
      role: 'worker',
    },
    async onSubmit(data) {
      const res = await api.post('/user/profiles', data)
      const { currentRole } = res.data.user

      if (currentRole === 'worker') {
        navigate('/app/worker/opportunities', { replace: true })
      } else if (currentRole === 'employer') {
        navigate('/app/employer/projects', { replace: true })
      }
    },
  })

  function selectRole(role: string) {
    return (e: Event) => {
      form.setValue('role', role)
      form.handleSubmit(e)
    }
  }
</script>

<h1>SelectRole</h1>
<form>
  <button type="submit" onclick={selectRole('worker')}>Worker</button>
  <button type="submit" onclick={selectRole('both')}>Both</button>
  <button type="submit" onclick={selectRole('employer')}>Employer</button>
</form>
