<script lang="ts">
  import Input from '$lib/components/Input.svelte'
  import LogoUploader from '$lib/components/LogoUploader.svelte'
  import { createForm } from '$lib/forms'
  import { companyCreateSchema } from '$lib/schemas/company.schema.svelte'
  import * as bottomSheet from '$lib/services/bottomsheet.service.svelte'
  import { useCompaniesStore } from '$lib/stores/resources/companies.store.svelte'

  const companies = useCompaniesStore()

  const form = createForm({
    schema: companyCreateSchema,
    defaultValues: {
      name: '',
      businessNumber: '',
      logoKey: '',
    },
    async onSubmit(formData) {
      await companies.create(formData)
      bottomSheet.close()
    },
  })
</script>

<form id="create-company" onsubmit={form.handleSubmit}>
  <Input
    label="Company name"
    id="company"
    required
    bind:value={form.name}
    error={form.errors.name} />
  <Input
    label="Business number"
    id="business-number"
    required
    bind:value={form.businessNumber}
    error={form.errors.businessNumber} />
  <LogoUploader bind:value={form.logoKey} />
</form>
