<script lang="ts">
  import { createCalendar, melt } from '@melt-ui/svelte'

  let { value = $bindable(), placeholder = $bindable() } = $props()

  const {
    elements: { calendar, heading, grid, cell, prevButton, nextButton },
    states: { months, headingValue, weekdays },
    helpers: { isDateDisabled, isDateUnavailable },
  } = createCalendar({
    locale: 'he',
    fixedWeeks: true,
    defaultValue: value,
    onValueChange: ({ next }) => {
      value = next
      return next
    },
    onPlaceholderChange: ({ curr, next }) => {
      if (curr.month !== next.month) {
        placeholder = next
      }
      return next
    },
  })
</script>

<div use:melt={$calendar}>
  <header>
    <button use:melt={$prevButton}><IconPhCaretRight /></button>
    <div use:melt={$heading}>{$headingValue}</div>
    <button use:melt={$nextButton}><IconPhCaretLeft /></button>
  </header>
  {#each $months as month}
    <table use:melt={$grid}>
      <thead aria-hidden="true">
        <tr>
          {#each $weekdays as day}
            <th>{day}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each month.weeks as weekDates}
          <tr>
            {#each weekDates as date}
              <td role="gridcell" aria-disabled={$isDateDisabled(date) || $isDateUnavailable(date)}>
                <div use:melt={$cell(date, month.value)}>
                  {date.day}
                </div>
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {/each}
</div>

<style>
  [data-melt-calendar] {
    width: 100%;
    max-width: min(400px, calc(100vw - 2rem)); /* Responsive max-width */
    margin: 0 auto;
    background-color: var(--color-background-surface);
    border-radius: var(--radius-l);
    box-shadow: var(--shadow-card);
    overflow: hidden;

    &[data-disabled] {
      opacity: 0.6;
      pointer-events: none;
    }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: clamp(0.75rem, 3vw, 1rem); /* Dynamic padding */
      background-color: var(--color-background-surface);
      border-bottom: 1px solid var(--color-border-default);
      gap: 0.5rem; /* Prevent button/text collision */

      [data-melt-calendar-nextbutton],
      [data-melt-calendar-prevbutton] {
        display: flex;
        align-items: center;
        justify-content: center;
        /* Dynamic sizing based on viewport */
        width: clamp(2.5rem, 10vw, 3rem);
        height: clamp(2.5rem, 10vw, 3rem);
        min-height: 44px; /* iOS minimum tap target */
        min-width: 44px;
        background-color: transparent;
        border: 1px solid var(--color-border-default);
        border-radius: var(--radius-m);
        color: var(--color-text-secondary);
        transition: all var(--transition-fast);
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        flex-shrink: 0;

        &:active {
          background-color: var(--color-background-surface-active);
          transform: scale(0.95);
        }

        &:focus-visible {
          outline: 2px solid var(--color-interactive-accent-default);
          outline-offset: 2px;
        }
      }

      [data-melt-calendar-heading] {
        flex: 1;
        text-align: center;
        font-size: clamp(1rem, 4vw, 1.125rem); /* Responsive font size */
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
        padding: 0 clamp(0.25rem, 2vw, 0.5rem);
        min-width: 0; /* Allow text truncation if needed */
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    [data-melt-calendar-grid] {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      table-layout: fixed; /* Equal column widths */

      thead {
        th {
          padding: clamp(0.375rem, 2vw, 0.5rem) 0;
          text-align: center;
          font-size: clamp(0.625rem, 2.5vw, 0.75rem); /* Responsive font */
          font-weight: var(--font-weight-medium);
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background-color: var(--color-background-page);
          border-bottom: 1px solid var(--color-border-default);
        }
      }

      tbody {
        td {
          padding: 1px; /* Minimal padding for mobile */
          text-align: center;
          position: relative;

          &[aria-disabled='true'] {
            pointer-events: none;

            div {
              color: var(--color-text-placeholder);
              background-color: transparent;

              &:active {
                transform: none;
                background-color: transparent;
              }
            }
          }
        }

        [data-melt-calendar-cell] {
          display: flex;
          align-items: center;
          justify-content: center;
          /* Dynamic sizing with minimum for touch */
          width: clamp(2.25rem, calc((100vw - 3rem) / 7), 3rem);
          height: clamp(2.25rem, calc((100vw - 3rem) / 7), 3rem);
          min-height: 36px; /* Smaller than header buttons but still tappable */
          min-width: 36px;
          border-radius: var(--radius-m);
          font-size: clamp(0.875rem, 3vw, 1rem); /* Responsive font */
          font-weight: var(--font-weight-medium);
          color: var(--color-text-primary);
          background-color: transparent;
          transition: all var(--transition-fast);
          cursor: pointer;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          position: relative;

          &:active {
            transform: scale(0.9);
            background-color: var(--color-interactive-accent-default);
            color: var(--color-text-on-accent);
          }

          &:focus-visible {
            outline: 2px solid var(--color-interactive-accent-default);
            outline-offset: 2px;
          }

          &[data-selected] {
            background-color: var(--color-interactive-accent-default);
            color: var(--color-text-on-accent);
            font-weight: var(--font-weight-semibold);
            box-shadow: 0 2px 8px rgba(108, 98, 208, 0.3);

            &:active {
              background-color: var(--color-interactive-accent-active);
              transform: scale(0.9);
            }
          }

          &[data-today]:not([data-selected])::after {
            content: '';
            position: absolute;
            bottom: clamp(2px, 0.5vw, 4px);
            left: 50%;
            transform: translateX(-50%);
            width: clamp(3px, 0.8vw, 4px);
            height: clamp(3px, 0.8vw, 4px);
            border-radius: var(--radius-full);
            background-color: var(--color-interactive-accent-default);
          }

          &[data-today][data-selected]::after {
            background-color: var(--color-text-on-accent);
          }

          &[data-outside-month] {
            color: var(--color-text-placeholder);
          }
        }
      }
    }
  }

  /* RTL support remains the same */
  [dir='rtl'] [data-melt-calendar] {
    header {
      direction: rtl;

      button:first-child {
        order: 1;
      }

      button:last-child {
        order: -1;
      }
    }
  }

  /* Small phones (< 360px width) */
  @media (max-width: 359px) {
    [data-melt-calendar] {
      [data-melt-calendar-grid] {
        thead th {
          font-size: 0.625rem;
          padding: 0.25rem 0;
        }

        tbody [data-melt-calendar-cell] {
          font-size: 0.75rem;
        }
      }
    }
  }

  /* Landscape orientation handling */
  @media (orientation: landscape) {
    [data-melt-calendar] {
      max-width: min(400px, 60vh); /* Limit width in landscape */

      header {
        padding: 0.75rem;
      }

      [data-melt-calendar-grid] {
        tbody [data-melt-calendar-cell] {
          /* Adjust size based on viewport height in landscape */
          width: clamp(2rem, 8vh, 2.5rem);
          height: clamp(2rem, 8vh, 2.5rem);
        }
      }
    }
  }

  /* Very small landscape (like iPhone SE landscape) */
  @media (orientation: landscape) and (max-height: 400px) {
    [data-melt-calendar] {
      header {
        padding: 0.5rem;

        [data-melt-calendar-heading] {
          font-size: 0.875rem;
        }
      }

      [data-melt-calendar-grid] {
        thead th {
          padding: 0.25rem 0;
          font-size: 0.5rem;
        }

        tbody [data-melt-calendar-cell] {
          width: 1.75rem;
          height: 1.75rem;
          min-height: 28px;
          font-size: 0.75rem;
        }
      }
    }
  }
</style>
