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
    max-width: 400px;
    margin: 1rem auto;
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
      padding: var(--spacing-m);
      background-color: var(--color-background-surface);
      border-bottom: 1px solid var(--color-border-default);
      [data-melt-calendar-nextbutton],
      [data-melt-calendar-prevbutton] {
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--size-tap-target);
        height: var(--size-tap-target);
        min-height: var(--size-tap-target);
        background-color: transparent;
        border: 1px solid var(--color-border-default);
        border-radius: var(--radius-m);
        color: var(--color-text-secondary);
        transition: all var(--transition-fast);
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;

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
        font-size: var(--font-size-headline-s);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
        padding: 0 var(--spacing-s);
      }
    }

    [data-melt-calendar-grid] {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      thead {
        th {
          padding: var(--spacing-s) 0;
          text-align: center;
          font-size: var(--font-size-label-s);
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
          padding: 2px;
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
          width: var(--size-tap-target);
          height: var(--size-tap-target);
          min-height: var(--size-tap-target);
          border-radius: var(--radius-m);
          font-size: var(--font-size-body-r);
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
            bottom: 4px;
            left: 50%;
            transform: translateX(-50%);
            width: 4px;
            height: 4px;
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

  @media (orientation: landscape) and (max-height: 500px) {
    [data-melt-calendar] {
      table {
        tbody {
          td {
            padding: 1px;

            div {
              width: calc(var(--size-tap-target) * 0.85);
              height: calc(var(--size-tap-target) * 0.85);
              min-height: calc(var(--size-tap-target) * 0.85);
              font-size: var(--font-size-label-m);
            }
          }
        }
      }
    }
  }
</style>
