<!-- DatePicker.svelte -->

<script lang="ts">
import { isSameDay, type DateValue } from '@internationalized/date'
import { createCalendar, melt } from '@melt-ui/svelte'
import { writable, type Writable } from 'svelte/store'

let { value = $bindable() as DateValue | undefined, placeholder = $bindable() as DateValue } = $props()
const internalValueStore: Writable<DateValue | undefined> = writable(value)
const internalPlaceholderStore: Writable<DateValue> = writable(placeholder)

$effect(() => {
  internalValueStore.set(value)
})

$effect(() => {
  internalPlaceholderStore.set(placeholder)
})

$effect(() => {
  const unsubscribe = internalPlaceholderStore.subscribe(newPlaceholder => {
    if (placeholder !== newPlaceholder) {
      placeholder = newPlaceholder
    }
  })
  return unsubscribe
})

$effect(() => {
  const unsubscribe = internalValueStore.subscribe(newValue => {
    if (!isSameDay(value as DateValue, newValue as DateValue)) {
      value = newValue
    }
  })

  return unsubscribe
})

const {
  elements: { calendar, heading, grid, cell, prevButton, nextButton },
  states: { months, headingValue, weekdays },
  helpers: { isDateDisabled, isDateUnavailable },
} = createCalendar({
  fixedWeeks: true,
  preventDeselect: true,
  value: internalValueStore,
  placeholder: internalPlaceholderStore,
})
</script>

<div use:melt={$calendar} class="calendar">
  <header>
    <button use:melt={$prevButton}>Prev</button>
    <div use:melt={$heading}>
      {$headingValue}
    </div>
    <button use:melt={$nextButton}>Next</button>
  </header>
  <div>
    {#each $months as month}
      <table use:melt={$grid}>
        <thead aria-hidden="true">
          <tr>
            {#each $weekdays as day}
              <th>
                <div>
                  {day}
                </div>
              </th>
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
</div>

<style lang="scss">
.calendar {
  color: red;
}
[data-melt-calendar] {
  position: absolute;
  top: 0;
  z-index: 100;
  background-color: white;
}
</style>
