<script lang="ts">
import { createDateRangePicker, melt } from '@melt-ui/svelte'
import { type DateRange } from '@melt-ui/svelte'

import BottomSheet from './BottomSheet.svelte'

let {
  title,
  value = $bindable(),
  open = $bindable(),
  startName,
  endName,
}: {
  title: string
  value: DateRange
  startName: string
  endName: string
  open: () => void
} = $props()

const {
  elements: { calendar, cell, field, grid, heading, label, startSegment, endSegment },
  states: { months, weekdays, segmentContents },
  helpers: { isDateDisabled, isDateUnavailable },
} = createDateRangePicker({
  defaultValue: value,
  onValueChange: ({ next }) => {
    value = next
    return next
  },
  fixedWeeks: true,
  startName,
  endName,
  numberOfMonths: 12,
  locale: 'he',
})
</script>

<span use:melt={$label}>{title}</span>
<div use:melt={$field}>
  <div class="date-segments">
    {#each $segmentContents.start as seg}
      <div use:melt={$startSegment(seg.part)}>
        {seg.value}
      </div>
    {/each}
    <div aria-hidden="true" class="date-separator">-</div>
    {#each $segmentContents.end as seg}
      <div use:melt={$endSegment(seg.part)}>
        {seg.value}
      </div>
    {/each}
  </div>
  <button
    onclick={(e: MouseEvent) => {
      e.preventDefault()
      open()
    }}
    type="button"
    aria-label="Open calendar"
  >
    <span><IconPhCalendarDots /></span>
  </button>
</div>

<BottomSheet bind:open>
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
                  <td
                    role="gridcell"
                    aria-disabled={$isDateDisabled(date) || $isDateUnavailable(date)}
                  >
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
</BottomSheet>

<style lang="scss">
@use 'sass:color';

[data-melt-datefield-label] {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

[data-melt-datefield-field] {
  display: flex;
  align-items: center;
  min-height: 44px;
  font-size: 16px;
  padding: 6px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  background: white;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
  cursor: pointer;

  /* iOS specific optimizations */
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;

  &:focus-within {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:active {
    border-color: #d1d5db;
  }

  button {
    span {
      font-size: 18px;
    }
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    min-width: 44px;
    min-height: 44px;
    background: none;
    border: none;
    border-radius: 4px;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.15s ease;

    /* Touch optimizations */
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;

    &:active {
      background-color: #f3f4f6;
      color: #374151;
    }

    &:focus {
      outline: none;
      background-color: #e5e7eb;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }
  }
}

.date-segments {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 4px;

  [data-melt-datefield-segment] {
    padding: 2px 4px;
    border-radius: 4px;
    transition: background-color 0.15s ease;

    /* Touch optimizations */
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;

    &:focus {
      outline: none;
      background-color: #f3f4f6;
    }

    &:active {
      background-color: #f9fafb;
    }
  }
}

.date-separator {
  color: #6b7280;
  margin: 0 4px;
}

.selected-range__text {
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  display: block;
}

/* Scrollable Calendar Container */
[data-melt-calendar] {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  padding: 0 24px;

  /* Smooth scrolling on mobile */
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

.month-section {
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 16px;
  }
}

[data-melt-calendar-heading] {
  position: sticky;
  top: 0;
  background: white;
  z-index: 5;
  padding: 16px 0 8px;
  margin-bottom: 8px;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  color: #111827;
}

[data-melt-calendar-grid] {
  width: 100%;
  border-collapse: collapse;
  thead tr th {
    padding: 8px 4px;
    text-align: center;
    font-size: 14px;
    font-weight: 500;
    color: #6b7280;
  }
  tbody tr td {
    padding: 2px;
    text-align: center;
    div {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      min-height: 44px; /* Mobile touch target */
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 14px;

      /* Touch optimizations */
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;

      /* Active state for touch instead of hover */
      &:active {
        background: #f3f4f6;
      }

      &:focus {
        outline: none;
        background: #e5e7eb;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
      }
    }
  }
}

/* Your existing calendar selection styles - adapted for bottom sheet */

[data-selected][data-outside-month],
[data-selection-start][data-outside-month],
[data-selection-end][data-outside-month] {
  .calendar-day {
    background-color: unset;
  }
}

[data-disabled] {
  .calendar-day {
    color: grey;
    cursor: not-allowed;

    /* No hover state on disabled items */
    &:active {
      background: none;
    }
  }
}

/* Mobile optimizations for smaller screens */
@media (max-width: 480px) {
  .bottom-sheet {
    max-height: 90vh;

    &__header {
      padding: 12px 16px 8px;
    }

    &__selected-range {
      padding: 8px 16px;
    }

    &__footer {
      padding: 12px 16px;
    }
  }

  [data-melt-calendar] {
    padding: 0 16px;
  }

  .calendar-day {
    min-height: 40px;
    font-size: 13px;
  }

  .weekday-header {
    font-size: 12px;
  }

  .date-field {
    font-size: 16px; /* Maintain to prevent zoom */
    padding: 6px 14px;
  }
}

/* iOS specific optimizations */
@supports (-webkit-touch-callout: none) {
  .date-field,
  .calendar-trigger-btn,
  .calendar-day,
  .approve-button {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }
}

/* Accessibility: Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  .date-field,
  .date-segment,
  .calendar-trigger-btn,
  .calendar-day,
  .approve-button {
    transition: none;
  }
}

/* Dark mode support for PWAs */
@media (prefers-color-scheme: dark) {
  .field-label {
    color: #d1d5db;
  }

  .date-field {
    background: #1f2937;
    border-color: #374151;
    color: #f9fafb;
  }

  .date-field:focus-within {
    border-color: #60a5fa;
  }

  .bottom-sheet {
    background: #1f2937;

    &__header {
      border-bottom-color: #374151;
    }

    &__title {
      color: #f9fafb;
    }

    &__close {
      color: #9ca3af;

      &:active {
        background: #374151;
        color: #f9fafb;
      }
    }

    &__selected-range {
      background: #374151;
      border-bottom-color: #4b5563;
    }

    &__footer {
      background: #1f2937;
      border-top-color: #374151;
    }
  }

  .month-header {
    background: #1f2937;
  }

  .month-title {
    color: #f9fafb;
  }

  .weekday-header {
    color: #9ca3af;
  }

  .calendar-day {
    color: #f9fafb;

    &:active {
      background: #374151;
    }
  }

  .selected-range__text {
    color: #9ca3af;
  }
}
</style>
