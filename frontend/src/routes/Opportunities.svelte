<script lang="ts">
  import { onMount } from 'svelte'
  import * as v from 'valibot'

  import { api } from '$lib/api'
  import Input from '$lib/components/Input.svelte'
  import OpportunityCard from '$lib/components/OpportunityCard.svelte'
  import PrimaryButton from '$lib/components/PrimaryButton.svelte'
  import { createForm } from '$lib/forms'
  import { workerProfileSchema } from '$lib/schemas/worker-profile.schema.svelte'
  import * as bottomSheet from '$lib/services/bottomsheet.service.svelte'
  import { useCompaniesStore } from '$lib/stores/resources/companies.store.svelte'
  import { useMyWorkerProfileStore } from '$lib/stores/resources/my-worker-profile.svelte'
  import { usePositionApplicationsStore } from '$lib/stores/resources/position-applications-store.svelte'
  import { usePositionsStore } from '$lib/stores/resources/positions.store.svelte'
  import { useProjectsStore } from '$lib/stores/resources/projects.store.svelte'

  let awaitingApplication = $state<string | null>(null)

  const opportunities = usePositionsStore()
  const projects = useProjectsStore()
  const companies = useCompaniesStore()
  const myWorkerProfile = useMyWorkerProfileStore()

  onMount(async () => {
    await Promise.all([
      myWorkerProfile.init(),
      opportunities.init(),
      projects.init(),
      companies.init(),
    ])
  })

  const form = createForm({
    schema: v.pick(workerProfileSchema, ['fullName']),
    defaultValues: {
      fullName: '',
    },
    async onSubmit(formData) {
      await myWorkerProfile.update(myWorkerProfile.items[0].id, formData)
      bottomSheet.close()

      if (awaitingApplication) {
        await api.post(`/positions/${awaitingApplication}/applications`)
        awaitingApplication = null
      }
    },
  })

  const handleJobApplication = async (opportunityId: string) => {
    const fullName = myWorkerProfile.items[0].fullName
    if (fullName) {
      //NOTE: if i dont need this store for the future just use api module here
      const applicationsStore = usePositionApplicationsStore(opportunityId)()
      await applicationsStore.create({})
    } else {
      awaitingApplication = opportunityId
      bottomSheet.show({
        id: 'profile-incomplete',
        title: 'Complete your profile',
        content: completeProfile,
        backdropClose: true,
        swipeToClose: true,
      })
    }
  }
</script>

{#snippet completeProfile()}
  <form onsubmit={form.handleSubmit}>
    <Input id="full-name" label="Full name" bind:value={form.fullName} />
    <PrimaryButton type="submit">Update and apply for job</PrimaryButton>
  </form>
{/snippet}

<div>
  <div>
    {#each opportunities.items as opportunity}
      {@const project = projects.getById(opportunity.projectId)}
      {@const company = project ? companies.getById(project.companyId) : undefined}
      <OpportunityCard {opportunity} {project} {company} onApply={handleJobApplication} />
    {/each}
  </div>
</div>

<style>
  div {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;

    > div {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      padding: var(--space-4);
      padding-bottom: calc(var(--bottom-nav-height) + var(--space-4));
      padding-left: calc(var(--space-4) + var(--safe-left));
      padding-right: calc(var(--space-4) + var(--safe-right));
      container-type: inline-size;
    }
  }
</style>
