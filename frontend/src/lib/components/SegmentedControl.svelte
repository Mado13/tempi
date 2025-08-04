<script lang="ts">
  import { Tabs } from 'melt/builders'
  import type { Snippet } from 'svelte'

  interface Tab {
    id: string
    label: string
    content: Snippet
  }
  interface Props {
    tabs: Tab[]
    defaultValue?: string
  }
  let { tabs, defaultValue }: Props = $props()
  const tabBuilder = new Tabs<string>({
    value: defaultValue || tabs[0]?.id,
  })
</script>

<div class="segmented-control">
  <div {...tabBuilder.triggerList} class="segment-container">
    {#each tabs as tab}
      <button {...tabBuilder.getTrigger(tab.id)} class="segment-button">
        <span class="segment-label">{tab.label}</span>
      </button>
    {/each}
  </div>
  <!-- Content Area -->
  {#each tabs as tab}
    <div {...tabBuilder.getContent(tab.id)} class="segment-content">
      {@render tab.content()}
    </div>
  {/each}
</div>

<style>
  .segmented-control {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }
  .segment-container {
    position: relative;
    display: flex;
    background: var(--color-background-elevated);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-xl);
    padding: var(--space-1);
    box-shadow: var(--shadow-subtle);
    overflow: hidden;
  }
  .segment-button {
    flex: 1;
    position: relative;
    background: transparent;
    border: none;
    border-radius: calc(var(--radius-xl) - var(--space-1));
    min-height: var(--tap-min);
    padding: var(--space-3) var(--space-4);
    font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    font-size: 1rem;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    touch-action: manipulation;
    transition: all var(--duration-normal) var(--ease-out);
    z-index: 1;
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    display: flex;
    align-items: center;
    justify-content: center;
    &[data-active] {
      color: var(--color-text-primary);
      background: var(--color-background-screen);
      box-shadow: var(--shadow-elevated);
      font-weight: var(--font-weight-semibold);
    }
    &:focus-visible {
      outline: none;
      box-shadow: var(--ring);
      z-index: 2;
    }
    &:active {
      transform: scale(0.98);
    }
  }
  .segment-label {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: var(--line-height-normal);
  }
  .segment-content {
    /* Borderless 2025 trend */
    background: transparent;
    border: none;
    border-radius: 0;
    padding: 0;
    box-shadow: none;
    &[hidden] {
      display: none;
    }
  }
</style>
