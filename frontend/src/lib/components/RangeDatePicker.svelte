<script lang="ts">
  import { createDateRangePicker, melt } from '@melt-ui/svelte'

  import BottomSheet from '$lib/components/BottomSheet.svelte'
  import PrimaryButton from '$lib/components/PrimaryButton.svelte'
  import { formatHebrewDateRange, serializeDateRange } from '$lib/utils/dates'

  let { value = $bindable(), open = $bindable(), display = $bindable() } = $props()

  const {
    elements: { calendar, cell, grid, heading },
    states: { months, weekdays },
  } = createDateRangePicker({
    fixedWeeks: true,
    numberOfMonths: 12,
    locale: 'he',
    onValueChange: ({ next }) => {
      display = formatHebrewDateRange(next)
      value = serializeDateRange(next)
      return next
    },
  })
</script>

<BottomSheet fullHeight bind:open>
  {#snippet header()}
    <h1>Blat</h1>
  {/snippet}
  <div use:melt={$calendar}>
    {#each $months as month}
      <div class="month-section">
        <div use:melt={$heading}>
          {month.value.toDate('UTC').toLocaleString('he-IL', { month: 'long', year: 'numeric' })}
        </div>

        <table use:melt={$grid}>
          <thead aria-hidden="true">
            <tr>
              {#each $weekdays as day}
                <th>{day}</th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each month.weeks as days}
              <tr>
                {#each days as date}
                  <td role="gridcell">
                    <div use:melt={$cell(date, month.value)} class="calendar-day">
                      {date.day}
                    </div>
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/each}
  </div>
  {#snippet footer()}
    <PrimaryButton onclick={() => (open = false)}>Apply</PrimaryButton>
  {/snippet}
</BottomSheet>

<style>
  .date-range-picker {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-s);
    padding: 0 var(--spacing-m);

    > span[data-melt-datefield-label] {
      display: block;
      font-size: var(--font-size-label-m);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
      line-height: 1.4;
      margin-bottom: var(--spacing-s);
    }

    [data-melt-datefield-field] {
      [data-melt-popover-trigger] {
        display: flex;
        align-items: center;
        width: 100%;
        min-height: var(--size-tap-target);
        padding: 0 var(--spacing-m);
        font-size: 16px !important;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        font-family: var(--font-family-base);
        color: var(--color-text-primary);
        background-color: var(--color-background-surface);
        border: 1px solid var(--color-border-default);
        border-radius: var(--radius-m);
        transition:
          border-color var(--transition-fast),
          box-shadow var(--transition-fast);
        touch-action: manipulation;
        cursor: pointer;

        &:focus {
          outline: none;
          border-color: var(--color-border-focused);
          box-shadow: 0 0 0 3px rgba(108, 98, 208, 0.25);
        }

        .date-segments {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);

          [data-melt-datefield-segment] {
            padding: 0;
            color: var(--color-text-placeholder);
            min-width: auto;
            border-radius: 0;

            &:not([data-placeholder]) {
              color: var(--color-text-primary);
            }

            &:focus {
              background-color: transparent;
              outline: none;
            }
          }

          .date-separator {
            color: var(--color-text-placeholder);
            padding: 0 var(--spacing-xs);
          }
        }
      }
    }
  }

  /* Calendar styles */
  [data-melt-calendar] {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);

    .month-section {
      width: 100%;

      [data-melt-calendar-heading] {
        text-align: center;
        font-size: var(--font-size-headline-s);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
        padding: var(--spacing-m) 0;
        position: sticky;
        top: calc(var(--spacing-m) * -1);
        background-color: var(--color-background-surface);
        z-index: 1;
        margin: 0 calc(var(--spacing-m) * -1);
        padding-left: var(--spacing-m);
        padding-right: var(--spacing-m);
      }

      [data-melt-calendar-grid] {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        table-layout: fixed;

        thead {
          th {
            padding: var(--spacing-s) 0;
            text-align: center;
            font-size: var(--font-size-label-s);
            font-weight: var(--font-weight-medium);
            color: var(--color-text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        }

        tbody {
          td {
            padding: 2px;
            text-align: center;
            position: relative;
          }

          /* The actual clickable calendar cell from melt-ui */
          [data-melt-calendar-cell] {
            display: flex;
            align-items: center;
            justify-content: center;
            width: var(--size-tap-target);
            height: var(--size-tap-target);
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
            border: none;

            &:active {
              transform: scale(0.95);
            }

            /* Selected states from melt-ui */
            &[data-selected]:not([data-outside-month]) {
              background-color: var(--color-interactive-accent-default);
              color: var(--color-text-on-accent);
              font-weight: var(--font-weight-semibold);
            }

            &[data-selection-end]:not([data-outside-month]) {
              background-color: var(--color-interactive-accent-default);
              color: var(--color-text-on-accent);
              font-weight: var(--font-weight-semibold);
              border-radius: var(--radius-m) 0 0 var(--radius-m);
            }

            &[data-selection-start]:not([data-outside-month]) {
              background-color: var(--color-interactive-accent-default);
              color: var(--color-text-on-accent);
              font-weight: var(--font-weight-semibold);
              border-radius: 0 var(--radius-m) var(--radius-m) 0;
            }

            /* Single date (start and end are same) */
            &[data-selection-start][data-selection-end]:not([data-outside-month]) {
              border-radius: var(--radius-m);
            }

            /* Dates in range */
            &[data-selected]:not([data-selection-start]):not([data-selection-end]):not(
                [data-outside-month]
              ) {
              background-color: var(--color-background-surface-active);
              color: var(--color-interactive-accent-default);
              border-radius: 0;
            }

            /* Today */
            &[data-today]:not([data-selected]):not([data-outside-month]) {
              font-weight: var(--font-weight-semibold);

              &::after {
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
            }

            /* Outside current month */
            &[data-outside-month] {
              color: var(--color-text-placeholder);
              opacity: 0.5;
            }
          }
        }
      }
    }
  }
</style>
