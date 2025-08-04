<script lang="ts">
  import { createDateRangePicker, melt } from '@melt-ui/svelte'
  import { watch } from 'runed'

  import PrimaryButton from '$lib/components/PrimaryButton.svelte'
  import * as bottomSheet from '$lib/services/bottomsheet.service.svelte'
  import { formatHebrewDateRange, serializeDateRange } from '$lib/utils/dates'

  let { value = $bindable(), open = $bindable(false), display = $bindable('') } = $props()

  const {
    elements: { calendar, cell, grid, heading },
    states: { months, weekdays },
  } = createDateRangePicker({
    fixedWeeks: true,
    numberOfMonths: 12,
    locale: 'he',
    isDateDisabled: (date) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return date.toDate('UTC') < today
    },
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
          title: 'Pick address in picker',
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
  /* Mobile Calendar Range Picker - Clean Start */

  [data-melt-calendar] {
    display: flex;
    flex-direction: column;
    gap: 24px;
    background-color: var(--color-background-screen); /* Force white background */
    padding: 16px;
    border-radius: 12px; /* Your --radius-lg */
  }

  .month-section {
    width: 100%;
  }

  [data-melt-calendar-heading] {
    text-align: center;
    font-size: 20px; /* Your --font-size-subhead equivalent */
    font-weight: 600; /* Your --font-weight-semibold */
    color: var(--color-text-primary);
    padding: 16px 0;
    position: sticky;
    top: -16px;
    background-color: var(--color-background-screen); /* Your white background */
    z-index: 1;
    margin: 0 -16px;
    padding-left: 16px;
    padding-right: 16px;
  }

  [data-melt-calendar-grid] {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    table-layout: fixed;
  }

  [data-melt-calendar-grid] thead th {
    padding: 12px 0;
    text-align: center;
    font-size: 12px; /* Your --font-size-small */
    font-weight: 500; /* Your --font-weight-medium */
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
    width: 44px; /* Your --tap-min */
    height: 44px;
    border-radius: 8px; /* Your --radius-md */
    font-size: 16px; /* Your --font-size-body */
    font-weight: 500;
    color: var(--color-text-primary);
    background-color: transparent;
    transition: all 150ms cubic-bezier(0, 0, 0.2, 1); /* Your transition values */
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    position: relative;
    border: none;
  }

  [data-melt-calendar-cell][data-disabled] {
    color: var(--color-text-tertiary);
  }

  [data-melt-calendar-cell]:active {
    transform: scale(0.95);
  }

  /* RANGE SELECTION - Using your primary color */
  [data-melt-calendar-cell][data-selected]:not([data-outside-month]) {
    background-color: var(--color-primary); /* Your purple */
    color: var(--color-text-on-primary); /* Your white text on primary */
    font-weight: 600;
  }

  [data-melt-calendar-cell][data-selection-end]:not([data-outside-month]) {
    background-color: var(--color-primary);
    color: var(--color-text-on-primary);
    font-weight: 600;
    border-radius: 8px 0 0 8px;
  }

  [data-melt-calendar-cell][data-selection-start]:not([data-outside-month]) {
    background-color: var(--color-primary);
    color: var(--color-text-on-primary);
    font-weight: 600;
    border-radius: 0 8px 8px 0;
  }

  [data-melt-calendar-cell][data-selection-start][data-selection-end]:not([data-outside-month]) {
    border-radius: 8px;
  }

  /* In-between dates - lighter background */
  [data-melt-calendar-cell][data-selected]:not([data-selection-start]):not(
      [data-selection-end]
    ):not([data-outside-month]) {
    background-color: #ede9fe; /* Light purple background */
    color: var(--color-primary);
    border-radius: 0;
  }

  /* Today indicator */
  [data-melt-calendar-cell][data-today]:not([data-selected]):not([data-outside-month]) {
    font-weight: 600;
  }

  [data-melt-calendar-cell][data-today]:not([data-selected]):not([data-outside-month])::after {
    content: '';
    position: absolute;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: var(--color-primary);
  }

  [data-melt-calendar-cell][data-outside-month] {
    color: var(--color-text-tertiary);
    opacity: 0.5;
  }
</style>
