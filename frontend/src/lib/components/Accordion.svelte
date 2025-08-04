<script lang="ts">
  import { Accordion } from 'melt/builders'

  let { children, items, multiple = false } = $props()

  const accordion = new Accordion({ multiple })
  let accordionItemRefs = $state<Record<string, HTMLElement>>({})

  $effect(() => {
    items.forEach((item) => {
      if (accordion.isExpanded(item.id)) {
        const element = accordionItemRefs[item.id]

        if (element) {
          // Wait for melt animation to complete
          setTimeout(() => {
            // Just scroll the element into view - let the browser figure it out
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'nearest',
            })
          }, 300) // Reduced timing to match typical animation
        }
      }
    })
  })
</script>

<div {...accordion.root}>
  {#each items as item, index}
    {@const accordionItem = accordion.getItem({ id: item.id })}
    <div bind:this={accordionItemRefs[item.id]}>
      <h2 {...accordionItem.heading}>
        <button
          type="button"
          class:expanded={accordion.isExpanded(item.id)}
          {...accordionItem.trigger}>
          <span>{item.title}</span>
          <svg
            class:rotated={accordion.isExpanded(item.id)}
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 256 256">
            <path
              fill="currentColor"
              d="m216.49 168.49l-80-80a12 12 0 0 0-17 0l-80 80a12 12 0 0 0 17 17L128 117l71.51 71.52a12 12 0 0 0 17-17Z"
            ></path>
          </svg>
        </button>
      </h2>
      <div class="accordion-content" {...accordionItem.content}>
        <div class="accordion-content-inner">
          {@render children(index)}
        </div>
      </div>
    </div>
  {/each}
</div>

<style>
  /* Accordion root */
  div {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    width: 100%;

    /* Styles for each accordion item */
    > div {
      background-color: var(--color-background-screen);
      border-radius: var(--radius-lg);
      overflow: hidden;
      contain: layout paint style;
      transition: box-shadow var(--duration-normal) var(--ease-out);
      &:has(button.expanded) {
        box-shadow: var(--shadow-elevated);

        &.accordion-content-inner {
          background-color: rgba(var(--primary-rgb), 0.05); /* NEW: Light purple tint */
        }
      }
    }
  }

  h2 {
    margin: 0;
  }

  button {
    /* Reset & Base */
    width: 100%;
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    font: inherit;
    cursor: pointer;
    border-bottom: 1px solid var(--color-border-default);

    /* Layout & Typography */
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    min-height: var(--tap-min);
    padding-inline: var(--space-4);
    padding-block: var(--space-3);
    font-size: var(--font-size-subhead);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    text-align: right;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;

    /* Transitions */
    transition:
      background-color var(--duration-fast) var(--ease-out),
      color var(--duration-fast) var(--ease-out),
      border-color var(--duration-fast) var(--ease-out);
  }

  button:active {
    background-color: rgba(var(--primary-rgb), 0.08);
  }

  button:focus-visible {
    outline: none;
    box-shadow: var(--ring);
  }

  /*
  * ====================================================================
  * MODIFIED: Expanded button state with brand colors
  * ====================================================================
  */
  button.expanded {
    background-color: rgba(var(--primary-rgb), 0.05); /* NEW: Light purple tint */
    color: var(--color-primary); /* NEW: Use primary color for text */
    border-bottom-color: transparent; /* Unifies header and content */
  }

  button.expanded > span {
    color: var(--color-primary); /* Ensures title text also becomes purple */
  }

  span {
    flex: 1 1 auto;
    line-height: var(--line-height-normal);
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color var(--duration-fast) var(--ease-out);
  }

  svg {
    flex: 0 0 auto;
    color: var(--color-text-secondary);
    transition: transform var(--duration-normal) var(--ease-out);
  }

  svg.rotated {
    transform: rotate(-180deg);
  }

  /* Content area styling */
  .accordion-content {
    overflow: hidden;
    transition: height var(--duration-normal) var(--ease-out);
  }

  .accordion-content[data-state='closed'] {
    display: none;
  }

  .accordion-content[data-state='open'] {
    display: block;
  }

  .accordion-content-inner {
    padding-inline: var(--space-4);
    padding-block: var(--space-3) var(--space-4);
    color: var(--color-text-secondary);
    font-size: var(--font-size-body);
    line-height: var(--line-height-loose);
    transition: background-color var(--duration-normal) var(--ease-out);
  }
</style>
