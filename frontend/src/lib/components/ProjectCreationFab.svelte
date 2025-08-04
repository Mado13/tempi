<script lang="ts">
  import { p } from '$router'
  import { type Snippet, onMount } from 'svelte'

  import * as bottomSheet from '$lib/services/bottomsheet.service.svelte'
  import { useCompaniesStore } from '$lib/stores/resources/companies.store.svelte'

  import CreateCompanyProfile from './CreateCompanyProfile.svelte'
  import PrimaryButton from './PrimaryButton.svelte'

  type FabProps = {
    href?: string
    onclick?: () => void
    disabled?: boolean
  }

  type Props = { children: Snippet<[FabProps]> }

  onMount(() => companies.init())
  let { children }: Props = $props()

  const companies = useCompaniesStore()

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
    if (companies.isLoading) {
      return { onclick: () => {}, disabled: true }
    }
    if (companies.items.length === 0) {
      return { onclick: showCreateCompanySheet }
    }
    return { href: p('/app/employer/projects/new') }
  })
</script>

{#snippet createCompanyContent()}
  <CreateCompanyProfile />
{/snippet}

{#snippet createCompanyFooter()}
  <PrimaryButton type="submit" form="create-company">Save and Continue to Post Job</PrimaryButton>
{/snippet}

{@render children(fabProps)}
