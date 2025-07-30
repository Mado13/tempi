<script lang="ts">
  import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

  import Input from '$lib/components/Input.svelte'
  import PrimaryButton from '$lib/components/PrimaryButton.svelte'
  import { createForm } from '$lib/forms'
  import { fullCompanyCreateSchema } from '$lib/schemas/company.schema.svelte'
  import * as bottomSheet from '$lib/services/bottom_sheet.service.svelte'
  import { useCompaniesStore } from '$lib/stores/resources/companies.store.svelte'
  import { supabase } from '$lib/supabase'

  export function showCreateCompanySheet() {
    bottomSheet.show({
      id: 'create-company',
      title: "First, Let's Set Up Your Company",
      fullHeight: true,
      content: content,
      footer: footer,
    })
  }

  async function selectPhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos, // Gallery only
      })

      await uploadPhoto(image.webPath)
    } catch (error) {
      console.error('Photo selection failed:', error)
    }
  }

  async function uploadPhoto(imagePath: any) {
    // Convert to blob for upload
    const response = await fetch(imagePath)
    const blob = await response.blob()

    const fileName = `photo-${Date.now()}.jpg`
    const { data, error } = await supabase.storage.from('photos').upload(fileName, blob)

    if (error) console.error('Upload failed:', error)
  }

  const companiesStore = useCompaniesStore()

  const form = createForm({
    schema: fullCompanyCreateSchema,
    defaultValues: {
      name: '',
      businessNumber: '',
    },
    async onSubmit(formData) {
      const result = await companiesStore.create(formData, { snackbar: false })

      if (result.success) {
        console.log('Company created:', result.data)
      } else {
        console.error('Failed to create company:', result.error)
      }
    },
  })
</script>

{#snippet content()}
  <form id="create-company" onsubmit={form.handleSubmit}>
    <Input label="Company name" id="company" bind:value={form.name} error={form.errors.name} />
    <Input
      label="Business number"
      id="business-number"
      bind:value={form.businessNumber}
      error={form.errors.businessNumber} />
    <button onclick={selectPhoto}>Choose Photo</button>
  </form>
{/snippet}

{#snippet footer()}
  <PrimaryButton type="submit" form="create-company">Save and Continue</PrimaryButton>
{/snippet}
