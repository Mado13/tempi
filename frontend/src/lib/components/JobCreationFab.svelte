<script lang="ts">
  import { p } from '$router'
  import type { Snippet } from 'svelte'

  import * as bottomSheet from '$lib/services/bottom_sheet.service.svelte'
  import { useCompaniesStore } from '$lib/stores/resources/companies.store.svelte'

  import CreateCompanyProfile from './CreateCompanyProfile.svelte'
  import PrimaryButton from './PrimaryButton.svelte'

  type FabProps = {
    href?: string
    onclick?: () => void
    disabled?: boolean
  }

  type Props = { children: Snippet<[FabProps]>; role: 'worker' | 'employer' }

  let { children, role }: Props = $props()

  const companyStore = useCompaniesStore()

  function showCreateCompanySheet() {
    bottomSheet.show({
      id: 'create-company',
      title: "First, Let's Set Up Your Company",
      fullHeight: true,
      swipeToClose: false,
      backdropClose: false,
      content: createCompanyContent,
      footer: createCompanyFooter,
    })
  }

  const fabProps = $derived.by((): FabProps => {
    if (companyStore.isLoading) {
      return { onclick: () => {}, disabled: true }
    }
    if (companyStore.size === 0) {
      return { onclick: showCreateCompanySheet }
    }
    return { href: p('/app/:role/job/new', { role }) }
  })
</script>

{#snippet createCompanyContent()}
  <CreateCompanyProfile />
{/snippet}

{#snippet createCompanyFooter()}
  <PrimaryButton type="submit" form="create-company-profile-form">
    Save and Continue to Post Job
  </PrimaryButton>
{/snippet}

{@render children(fabProps)}
