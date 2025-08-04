<script lang="ts">
  import { navigate } from '$router'
  import { watch } from 'runed'

  import Accordion from '$lib/components/Accordion.svelte'
  import AddressPicker from '$lib/components/AddressPicker.svelte'
  import Input from '$lib/components/Input.svelte'
  import InputButton from '$lib/components/InputButton.svelte'
  import PrimaryButton from '$lib/components/PrimaryButton.svelte'
  import ProjectPosition from '$lib/components/ProjectPosition.svelte'
  import RangeDatePicker from '$lib/components/RangeDatePicker.svelte'
  import SecondaryButton from '$lib/components/SecondaryButton.svelte'
  import { createForm, createNestedField } from '$lib/forms'
  import { projectCreateSchema } from '$lib/schemas/project.schema.svelte'
  import { projectPositionCreateSchema } from '$lib/schemas/project_position.schema.svelte'
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
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p class="empty-title">No positions added yet</p>
          <p class="empty-subtitle">Add job positions to define roles for this project</p>
        </div>

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

<!-- Fixed publish bar with enhanced glass effect -->
<div class="form-actions glass">
  <PrimaryButton type="submit" form="create-project-form">Publish project</PrimaryButton>
</div>

<style>
  :root {
    /* Enhanced action bar tokens */
    --action-bar-height: 64px; /* Slightly taller for better proportion */
    --action-bar-gap: var(--space-3); /* Tighter gap */
  }

  /* Screen wrapper - now has background */
  .screen {
    background: var(--color-background-screen);
    min-height: 100vh;
  }

  /* Form container with subtle background differentiation */
  .form-container {
    background: var(--color-background-app);
    min-height: 100vh;
    padding-bottom: calc(
      var(--bottom-nav-height) + var(--action-bar-height) + var(--action-bar-gap) +
        var(--safe-bottom) + var(--space-4)
    );
  }

  /* Title with better spacing */
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

  /* Form content area */
  form {
    padding: var(--space-5) var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  /* Enhanced empty state */
  .empty-state {
    text-align: center;
    padding: var(--space-8) var(--space-6);
    background: var(--color-background-elevated);
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-elevated);
    margin: var(--space-4) 0;
    box-shadow: var(--shadow-subtle);
  }

  .empty-state-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    background: var(--color-background-screen);
    border-radius: var(--radius-full);
    margin-bottom: var(--space-5);
    box-shadow: var(--shadow-subtle);
  }

  .empty-state-icon svg {
    width: 24px;
    height: 24px;
    color: var(--color-text-tertiary);
  }

  .empty-title {
    font-size: var(--font-size-subhead);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-2) 0;
  }

  .empty-subtitle {
    font-size: var(--font-size-caption);
    color: var(--color-text-secondary);
    margin: 0;
    line-height: var(--line-height-loose);
  }

  /* Positions footer spacing */
  .positions-footer {
    padding-block: var(--space-5);
    margin-top: var(--space-3);
  }

  /* Enhanced fixed publish bar */
  .form-actions {
    position: fixed;
    left: 0;
    right: 0;
    bottom: calc(var(--bottom-nav-height) + var(--safe-bottom));

    height: var(--action-bar-height);
    display: grid;
    place-items: center;
    padding: 0 var(--space-4);

    /* Enhanced glass effect */
    background: var(--glass-bg-heavy);
    backdrop-filter: blur(var(--glass-blur));
    border-top: 1px solid var(--glass-border);
    box-shadow: var(--shadow-overlay);

    z-index: 900;
  }

  /* Better glass fallback for older devices */
  .form-actions:not(.glass) {
    background: var(--color-background-overlay);
    border-top: 1px solid var(--color-border-strong);
    box-shadow: var(--shadow-elevated);
  }

  /* Platform-specific optimizations */
  .platform-android .form-actions.glass {
    backdrop-filter: none;
    background: var(--color-background-overlay);
    border-top: 1px solid var(--color-border-strong);
    box-shadow: var(--shadow-elevated);
  }

  /* Ensure nav stays above everything */
  :global(.bottom-nav) {
    z-index: 1000;
  }

  /* Enhanced responsive behavior */
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

  /* Accessibility improvements */
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

  /* RTL support */
  :global([dir='rtl']) .form-container,
  :global([dir='rtl']) .form-actions,
  :global([dir='rtl']) .empty-state {
    direction: rtl;
  }
</style>
