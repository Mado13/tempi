<script lang="ts">
import { createDateRangePicker, melt } from '@melt-ui/svelte'
import { type DateRange } from '@melt-ui/svelte'
import { writable, type Writable } from 'svelte/store'

let {
  title,
  value = $bindable(),
  startName,
  endName,
}: { title: string; value: DateRange; startName: string; endName: string } = $props()
let showDatePicker = $state(false)

const internalValueStore: Writable<DateRange> = writable(value)

$effect(() => {
  internalValueStore.set(value as DateRange)
})

$effect(() => {
  const unsubscribe = internalValueStore.subscribe(newValue => {
    if (value !== newValue) {
      value = newValue
    }
  })

  return unsubscribe
})

const {
  elements: { calendar, cell, field, grid, heading, label, startSegment, endSegment },
  states: { months, weekdays, segmentContents },
  helpers: { isDateDisabled, isDateUnavailable },
} = createDateRangePicker({
  value: internalValueStore,
  fixedWeeks: true,
  startName,
  endName,
  numberOfMonths: 12,
  locale: 'he',
})
</script>

<span use:melt={$label}>{title}</span>
<div use:melt={$field}>
  {#each $segmentContents.start as seg}
    <div use:melt={$startSegment(seg.part)}>
      {seg.value}
    </div>
  {/each}
  <div aria-hidden="true">-</div>
  {#each $segmentContents.end as seg}
    <div use:melt={$endSegment(seg.part)}>
      {seg.value}
    </div>
  {/each}
  <div>
    <button
      onclick={(e: MouseEvent) => {
        e.preventDefault()
        showDatePicker = true
      }}
    >
      <span><IconPhCalendarDots /></span>
    </button>
  </div>
</div>

{#if showDatePicker}
  <div use:melt={$calendar}>
    <span>{value?.start?.toLocaleString()}-{value?.end}</span>
    {#each $months as month}
      <header>
        <div use:melt={$heading}>
          {month.value.toDate('UTC').toLocaleString('he-IL', { month: 'long', year: 'numeric' })}
        </div>
      </header>
      <table use:melt={$grid}>
        <thead aria-hidden="true">
          <tr>
            {#each $weekdays as day}
              <th>
                {day}
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each month.weeks as days}
            <tr>
              {#each days as date}
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
    <button
      onclick={(e: MouseEvent) => {
        e.preventDefault()
        showDatePicker = false
      }}
    >
      Approve
    </button>
  </div>
{/if}

<style lang="scss">
@use 'sass:color';

div {
  display: flex;
  div:last-child {
    margin-left: auto;
  }
}

[data-melt-calendar] {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  z-index: 105;
  background-color: white;
  width: 100%;
  overflow-y: auto;
  max-height: 100vh;
  header {
    align-self: center;
    margin: 1rem 0;
  }
  button {
    color: red;
    position: sticky;
    bottom: 0;
    z-index: 101;
    background-color: inherit;
    padding: 1rem;
  }
  [data-selection-start],
  [data-selection-end] {
    background-color: red;
  }

  [data-selected]:not([data-selection-start]):not([data-selection-end]):not([data-outside-month]) {
    background-color: color.scale(red, $lightness: 60%);
  }

  [data-selected][data-outside-month],
  [data-selection-start][data-outside-month],
  [data-selection-end][data-outside-month] {
    background-color: unset;
  }
  [data-disabled] {
    color: grey;
  }
}
</style>
