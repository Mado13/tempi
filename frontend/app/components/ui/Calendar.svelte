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
  onPlaceholderChange: ({ next }) => {
    placeholder = next
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

<style lang="scss">
[data-melt-calendar] {
  background-color: white;
  margin: 0 auto;
  width: 100%;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.3125rem rgba(0, 0, 0, 0.1);
  overflow: hidden;
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    [data-melt-calendar-heading] {
      display: flex;
      color: #555;
      font-size: 1.1rem;
      font-weight: 500;
      padding: 0.625rem 0;
      text-align: center;
    }
    [data-melt-calendar-nextbutton],
    [data-melt-calendar-prevbutton] {
      background-color: #f0f0f0;
      padding: 1rem;
      border: none;
      border-radius: 0.5rem;
      color: #333;
      cursor: pointer;
      padding: 0.625rem;
      transition: background-color 0.2s ease-in-out;
      font-size: 0.9rem;

      svg {
        height: 1.125rem;
        width: 1.125rem;
      }
    }
  }
  [data-melt-calendar-grid] {
    width: 100%;
    border-spacing: 0.25rem;
    color: #333;
    th {
      color: #777;
      font-size: 0.8rem;
      font-weight: 400;
      padding: 0.375rem;
      text-align: center;
    }
    tbody {
      tr {
        td {
          div {
            align-items: center;
            border: none;
            border-radius: 0.5rem;
            color: #333;
            cursor: pointer;
            display: flex;
            font-size: 1rem;
            height: 2.25rem;
            justify-content: center;
            transition:
              background-color 0.2s ease-in-out,
              color 0.2s ease-in-out;
            width: 2.25rem;
            margin: 0.125rem;
            &[data-selected] {
              background-color: #007bff;
              color: #fff;
            }
            &[data-disabled] {
              color: #ccc;
              cursor: not-allowed;
            }
            &[data-state='unavailable'] {
              background-color: #f9f9f9;
              color: #ccc;
              cursor: default;
            }
          }
        }
      }
    }
  }
}
</style>
