<script lang="ts">
  import { onMount } from 'svelte'

  import OpportunityCard from '$lib/components/OpportunityCard.svelte'
  import { usePositionsStore } from '$lib/stores/resources/positions.store.svelte'

  const opportunities = usePositionsStore()
  onMount(() => opportunities.init())
</script>

<div class="opportunities-screen">
  <div class="opportunities-content">
    {#each opportunities.items as opportunity}
      <OpportunityCard {opportunity} />
    {/each}
  </div>
</div>

<style>
  .opportunities-screen {
    /* Use design system screen class behavior */
    height: 100%;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    background: var(--color-background-screen);
  }

  .opportunities-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-4); /* 16px - using design system spacing */
    padding: var(--space-4);

    /* Mobile safe area support */
    padding-bottom: calc(var(--bottom-nav-height) + var(--space-4));
    padding-left: calc(var(--space-4) + var(--safe-left));
    padding-right: calc(var(--space-4) + var(--safe-right));

    /* Container queries for responsive design */
    container-type: inline-size;
  }

  /* Mobile optimizations (default) */
  @media (max-width: 480px) {
    .opportunities-content {
      gap: var(--space-3); /* 12px - tighter on small screens */
      padding: var(--space-3);
      padding-bottom: calc(var(--bottom-nav-height) + var(--space-3));
    }
  }

  /* Tablet and larger screens */
  @media (min-width: 768px) {
    .opportunities-content {
      max-width: 600px;
      margin-inline: auto;
      padding-inline: var(--space-6); /* 24px */
      gap: var(--space-5); /* 20px - more breathing room */
    }
  }

  /* Large screens */
  @media (min-width: 1024px) {
    .opportunities-content {
      max-width: 640px;
      padding-inline: var(--space-8); /* 32px */
      gap: var(--space-6); /* 24px */
    }
  }
</style>
