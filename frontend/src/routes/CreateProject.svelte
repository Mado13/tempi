<script lang="ts">
  import { navigate } from '$router'

  import Accordion from '$lib/components/Accordion.svelte'
  import AddressPicker from '$lib/components/AddressPicker.svelte'
  import EmptyState from '$lib/components/EmptyState.svelte'
  import Input from '$lib/components/Input.svelte'
  import InputButton from '$lib/components/InputButton.svelte'
  import PrimaryButton from '$lib/components/PrimaryButton.svelte'
  import ProjectPosition from '$lib/components/ProjectPosition.svelte'
  import RangeDatePicker from '$lib/components/RangeDatePicker.svelte'
  import SecondaryButton from '$lib/components/SecondaryButton.svelte'
  import { createForm, createNestedField } from '$lib/forms'
  import { projectPositionCreateSchema } from '$lib/schemas/project-position.schema.svelte'
  import { projectCreateSchema } from '$lib/schemas/project.schema.svelte'
  import { useCompaniesStore } from '$lib/stores/resources/companies.store.svelte'
  import { useProjectsStore } from '$lib/stores/resources/projects.store.svelte'
  import { isEmpty } from '$lib/utils/utils'

  const projects = useProjectsStore()
  const companies = useCompaniesStore()

  let addressPickerOpen = $state(false)
  let dateRangePickerState = $state({
    open: false,
    display: 'Pick date placeholder',
  })

  const form = createForm({
    schema: projectCreateSchema,
    defaultValues: {
      companyProfileId: companies.items[0]?.id || '',
      positions: [],
      name: '',
      address: undefined,
      date: { start: '', end: '' },
      notes: '',
      meta: {},
    },
    async onSubmit(formData) {
      const created = await projects.create(formData)
      navigate('/app/employer/projects', {
        search: `?highlight=${created.id}`,
      })
    },
  })

  const positions = createNestedField(form, 'positions', {
    itemSchema: projectPositionCreateSchema,
    defaultValues: {
      jobClassification: {},
      numberOfEmployees: 1,
      payment: { rateType: 'hourly', rate: 0 },
      notes: '',
    },
  })

  const accordionItems = $derived(
    positions.items.map((position, index) => ({
      id: index,
      title: position.jobClassification.label || 'New position',
    })),
  )

  let placeHolderAddress = $derived.by(() => {
    if (!form.address) return 'Pick address'

    if (form.address?.formattedAddress.includes(form.address?.name)) {
      return form.address?.formattedAddress
    }

    return `${form.address?.name}, ${form.address?.formattedAddress}`
  })

  $inspect(form.name)
</script>

<!-- Create Project Form with Clear Visual Hierarchy -->
<div class="screen">
  <div class="form-container">
    <h1>Create project</h1>

    <form id="create-project-form" onsubmit={form.handleSubmit}>
      <Input label="Name" id="project-name" error={form.errors.name} bind:value={form.name} />

      {#if companies.items.length === 1}
        {@const company = companies.items[0]}
        <Input label="company" id="company" readonly placeholder={company.name} />
      {/if}

      <InputButton
        label="Date"
        class={{ placeholder: isEmpty(form.date) }}
        onclick={() => (dateRangePickerState.open = true)}
        error={form.errors.date}>
        {dateRangePickerState.display}
      </InputButton>

      <RangeDatePicker
        bind:value={form.date}
        bind:open={dateRangePickerState.open}
        bind:display={dateRangePickerState.display} />

      <InputButton
        label="Address"
        class={{ placeholder: !form.address }}
        onclick={() => (addressPickerOpen = true)}
        error={form.errors.address}>
        {placeHolderAddress}
      </InputButton>

      <AddressPicker bind:value={form.address} bind:open={addressPickerOpen} />

      {#if positions.items.length === 0}
        <EmptyState
          resource="positions"
          description="Add job positions to define roles for this project">
          {#snippet icon()}
            <IconTablerUsers />
          {/snippet}
        </EmptyState>
        <div class="positions-footer">
          <SecondaryButton onclick={positions.add}>Add position</SecondaryButton>
        </div>
      {:else}
        <Accordion items={accordionItems}>
          {#snippet children(index: number)}
            <ProjectPosition
              form={positions.getFormForIndex(index)}
              onRemove={() => positions.remove(index)} />
          {/snippet}
        </Accordion>

        <div class="positions-footer">
          <SecondaryButton onclick={positions.add}>Add position</SecondaryButton>
        </div>
      {/if}
    </form>
  </div>
</div>

<div class="form-actions glass">
  <PrimaryButton type="submit" form="create-project-form">Publish project</PrimaryButton>
</div>

<style>
  :root {
    --action-bar-height: 64px;
    --action-bar-gap: var(--space-3);
  }

  .screen {
    background: var(--color-background-screen);
    min-height: 100vh;
  }

  .form-container {
    min-height: 100vh;
    padding-bottom: calc(
      var(--bottom-nav-height) + var(--tap-comfortable) + var(--space-8) + var(--safe-bottom)
    );
  }

  h1 {
    font-size: var(--font-size-title);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0;
    padding: var(--space-6) var(--space-4) var(--space-4);
    background: var(--color-background-screen);
    border-bottom: 1px solid var(--color-border-default);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  form {
    padding: var(--space-5) var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .positions-footer {
    padding-block: var(--space-5);
    margin-top: var(--space-3);
  }

  .form-actions {
    position: fixed;
    bottom: calc(var(--bottom-nav-height) + var(--space-4));
    left: var(--space-4);
    right: var(--space-4);
    z-index: 900;

    background: none;
    border: none;
    box-shadow: none;
    backdrop-filter: none;

    display: block;
    padding: 0;
    height: auto;

    :global(button) {
      width: 100%;
      height: var(--tap-comfortable);
      box-shadow:
        0 2px 8px rgba(139, 92, 246, 0.24),
        0 1px 3px rgba(15, 23, 42, 0.08);
      transition: all var(--duration-fast) var(--ease-out);

      &:active {
        transform: scale(0.98);
      }
    }
  }

  :global(.bottom-nav) {
    z-index: 1000;
  }

  @media (max-height: 640px) {
    .form-container {
      padding-bottom: calc(
        var(--bottom-nav-height) + var(--action-bar-height) + var(--space-2) + var(--safe-bottom)
      );
    }

    h1 {
      padding-block: var(--space-4) var(--space-3);
    }

    form {
      padding-block: var(--space-4);
      gap: var(--space-4);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .form-actions {
      transition: none;
    }

    h1 {
      position: static;
    }
  }

  @media (prefers-contrast: high) {
    .empty-state {
      border: 2px solid var(--color-border-strong);
    }

    .form-actions.glass {
      background: var(--color-background-overlay);
      backdrop-filter: none;
      border-top: 2px solid var(--color-border-strong);
    }

    h1 {
      border-bottom: 2px solid var(--color-border-strong);
    }
  }

  :global([dir='rtl']) .form-container,
  :global([dir='rtl']) .form-actions,
  :global([dir='rtl']) .empty-state {
    direction: rtl;
  }
</style>
