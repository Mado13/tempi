<script lang="ts">
  import * as v from 'valibot'

  import AddressPicker from '$lib/components/AddressPicker.svelte'
  import FormField from '$lib/components/FormField.svelte'
  import { createForm } from '$lib/forms.svelte'
  import { GoogleMapsFormLocationSchema } from '$lib/utils/google-maps/schema'

  const jobFormSchema = v.object({
    title: v.string(),
    address: GoogleMapsFormLocationSchema,
  })

  const form = createForm({
    schema: jobFormSchema,
    defaultValues: {
      title: '',
      address: undefined,
    },
    onSubmit: async () => {},
  })
</script>

<h1>Add Job</h1>
<form>
  <FormField id="title" label="title" bind:value={form.title} error={form.errors.title} />
  <AddressPicker required bind:value={form.address} error={form.errors.address} />
</form>
