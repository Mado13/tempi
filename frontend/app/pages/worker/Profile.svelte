<script lang="ts">
import { useForm } from '@inertiajs/svelte'

import FormField from '@/components/ui/FormField.svelte'

const { user } = $props()
const { worker } = user

const form = useForm({
  firstName: worker.firstName,
  lastName: worker.lastName,
  address: worker.address,
})

const onsubmit = (e: SubmitEvent) => {
  e.preventDefault()

  $form.patch('/worker/profile')
}
</script>

<h1>Profile Page</h1>
<form {onsubmit}>
  <FormField
    id="first-name"
    label="first-name"
    bind:value={$form.firstName}
    error={$form.errors.firstName}
  />

  <FormField
    id="last-name"
    label="last-name"
    bind:value={$form.lastName}
    error={$form.errors.lastName}
  />
  <button type="submit">Submit</button>
</form>
