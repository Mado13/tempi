<script lang="ts">
  import { createDateRangePicker, melt } from '@melt-ui/svelte'
  import { watch } from 'runed'

  import PrimaryButton from '$lib/components/PrimaryButton.svelte'
  import * as bottomSheet from '$lib/services/bottomsheet.service.svelte'
  import { formatHebrewDateRange, serializeDateRange } from '$lib/utils/dates'

  let { value = $bindable(), open = $bindable(false), display = $bindable('') } = $props()

  // All your Melt UI logic for creating the calendar remains unchanged.
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

  watch(
    () => open,
    (isOpen) => {
      if (isOpen) {
        bottomSheet.show({
          id: 'range-date-picker',
          title: 'Pick Address',
          content: pickerContent,
          footer: footerContent,
          fullHeight: true,
          onClose: () => {
            open = false
          },
        })
      } else {
        if (bottomSheet.bottomSheetState.current?.id === 'range-date-picker') {
          bottomSheet.close()
        }
      }
    },
  )
</script>

{#snippet pickerContent()}
  <div use:melt={$calendar} data-melt-calendar>
    {#each $months as month}
      <div class="month-section">
        <div use:melt={$heading} data-melt-calendar-heading>
          {month.value.toDate('UTC').toLocaleString('he-IL', { month: 'long', year: 'numeric' })}
        </div>

        <table use:melt={$grid} data-melt-calendar-grid>
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
                    <div
                      use:melt={$cell(date, month.value)}
                      class="calendar-day"
                      data-melt-calendar-cell>
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
{/snippet}

{#snippet footerContent()}
  <PrimaryButton onclick={() => (open = false)}>Apply</PrimaryButton>
{/snippet}

<style>
  /* All of your original calendar styles go here */
  [data-melt-calendar] {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
  }

  .month-section {
    width: 100%;
  }

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
  }

  [data-melt-calendar-grid] thead th {
    padding: var(--spacing-s) 0;
    text-align: center;
    font-size: var(--font-size-label-s);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  [data-melt-calendar-grid] tbody td {
    padding: 2px;
    text-align: center;
    position: relative;
  }

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
  }

  [data-melt-calendar-cell]:active {
    transform: scale(0.95);
  }

  [data-melt-calendar-cell][data-selected]:not([data-outside-month]) {
    background-color: var(--color-interactive-accent-default);
    color: var(--color-text-on-accent);
    font-weight: var(--font-weight-semibold);
  }

  [data-melt-calendar-cell][data-selection-end]:not([data-outside-month]) {
    background-color: var(--color-interactive-accent-default);
    color: var(--color-text-on-accent);
    font-weight: var(--font-weight-semibold);
    border-radius: var(--radius-m) 0 0 var(--radius-m);
  }

  [data-melt-calendar-cell][data-selection-start]:not([data-outside-month]) {
    background-color: var(--color-interactive-accent-default);
    color: var(--color-text-on-accent);
    font-weight: var(--font-weight-semibold);
    border-radius: 0 var(--radius-m) var(--radius-m) 0;
  }

  [data-melt-calendar-cell][data-selection-start][data-selection-end]:not([data-outside-month]) {
    border-radius: var(--radius-m);
  }

  [data-melt-calendar-cell][data-selected]:not([data-selection-start]):not(
      [data-selection-end]
    ):not([data-outside-month]) {
    background-color: var(--color-background-surface-active);
    color: var(--color-interactive-accent-default);
    border-radius: 0;
  }

  [data-melt-calendar-cell][data-today]:not([data-selected]):not([data-outside-month]) {
    font-weight: var(--font-weight-semibold);
  }

  [data-melt-calendar-cell][data-today]:not([data-selected]):not([data-outside-month])::after {
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

  [data-melt-calendar-cell][data-outside-month] {
    color: var(--color-text-placeholder);
    opacity: 0.5;
  }
</style>
