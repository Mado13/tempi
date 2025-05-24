<script lang="ts">
import { createSelect, melt } from '@melt-ui/svelte'

import { m } from '$paraglide/messages'

let { value = $bindable() } = $props()

const options = {
  morning: [m['add_job.shifts.morning']()],
  evening: [m['add_job.shifts.evening']()],
  flex: [m['add_job.shifts.flex']()],
  weekend: [m['add_job.shifts.weekend']()],
}

const {
  elements: { trigger, menu, option, group, label },
  states: { selectedLabel, open },
} = createSelect<string>({
  forceVisible: true,
  onSelectedChange: ({ next }) => {
    value = next?.value
    return next
  },
  positioning: {
    strategy: 'fixed',
  },
})
</script>

<!-- svelte-ignore a11y_label_has_associated_control - $label contains the 'for' attribute -->
<label use:melt={$label}>{m['add_job.shifts.label']()}</label>
<button use:melt={$trigger}>{$selectedLabel || m['add_job.shifts.label']()}</button>
{#if $open}
  <div use:melt={$menu}>
    {#each Object.entries(options) as [key, arr]}
      <div use:melt={$group(key)}>
        {#each arr as item}
          <div use:melt={$option({ value: key, label: item })}>{item}</div>
        {/each}
      </div>
    {/each}
  </div>
{/if}

<style lang="scss">
[data-melt-select-menu] {
  position: fixed;
  top: 0 !important;
  left: 0 !important;
  width: 100vw;
  height: 100vh;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);

  > div {
    background: white;
    padding: 1rem;
    border-radius: 0.5rem;
    width: 90%;
    max-width: 400px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

    display: flex;
    flex-direction: column;
    gap: 0;

    [data-melt-select-option] {
      padding: 1rem;
      font-size: 1rem;
      text-align: center;
      cursor: pointer;
      &:not(:last-child) {
        border-bottom: 1px solid #e5e5e5;
      }
    }
  }
}
</style>
