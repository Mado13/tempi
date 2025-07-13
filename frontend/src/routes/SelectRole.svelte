<script lang="ts">
  import * as v from 'valibot'

  import { api } from '$lib/api'

  import { createForm } from '../lib/forms'

  const selectRoleSchema = v.object({
    currentRole: v.string(),
  })

  const form = createForm({
    schema: selectRoleSchema,
    defaultValues: {
      currentRole: 'worker',
    },
    onSubmit(data) {
      api.post('/role', data)
    },
  })

  function selectRole(role: string) {
    return (e: Event) => {
      form.currentRole = role
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
