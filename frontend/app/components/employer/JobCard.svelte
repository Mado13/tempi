<script lang="ts">
import { tick } from 'svelte'

let { job } = $props()

let openDeleteDialog = $state<() => void>(() => {})

let DeleteDialogComponent = $state<any>(null)
const handleDeleteJob = async () => {
  if (!DeleteDialogComponent) {
    const m = await import('$components/ui/DeleteDialog.svelte')
    DeleteDialogComponent = m.default
  }
  tick().then(() => openDeleteDialog())
}
</script>

<div class="job-card">
  <div class="info">
    <span>{job.title}</span>
    <span>{job.address.formattedAddress}</span>
  </div>
  <div class="icons">
    <button><IconPhPencilCircleDuotone /></button>
    <button onclick={handleDeleteJob}><IconPhXCircleBold /></button>
  </div>
</div>

{#if DeleteDialogComponent}
  <DeleteDialogComponent bind:show={openDeleteDialog} />
{/if}

<style lang="scss">
.job-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  .info {
    span {
      display: block;
    }
  }
  .icons {
    display: flex;
    button {
      min-height: 48px;
      min-width: 48px;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      :global {
        svg {
          width: 24px;
          height: 24px;
          pointer-events: none;
        }
      }
    }
  }
}
</style>
