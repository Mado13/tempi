<script lang="ts">
import { createDialog, melt } from '@melt-ui/svelte'
import { fade } from 'svelte/transition'

import { m } from '$i18n/paraglide/messages'

let {
  job,
  show = $bindable(),
}: {
  job: any
  show: () => void
} = $props()

show = () => {
  $open = true
}

const {
  elements: { trigger, overlay, content, title, description, close, portalled },
  states: { open },
} = createDialog({ forceVisible: true, role: 'alertdialog' })
</script>

{#if $open}
  <div use:melt={$portalled}>
    <div use:melt={$overlay} transition:fade={{ duration: 150 }}>
      <div use:melt={$content}>
        <h2 use:melt={$title}>{m['deleteJob.title']()}</h2>
        <p use:melt={$description}>{m['deleteJob.workersAssigned']({ assignedWorkers: 3 })}</p>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
[data-melt-dialog-overlay] {
  position: fixed;
  inset: 0;
  z-index: 50;
  background-color: rgba(0, 0, 0, 0.5);

  [data-melt-dialog-content] {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 50;
    max-height: 80vh;
    width: 95vw;
    max-width: 400px;
    min-width: 280px;
    border-radius: 0.375rem;
    background-color: white;
    padding: 1rem;

    @media (max-width: 640px) {
      width: 92vw;
      max-height: 75vh;
      padding: 1rem;
    }
  }
}
</style>
