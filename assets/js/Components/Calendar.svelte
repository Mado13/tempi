<script lang="ts">
import { Calendar } from 'bits-ui'

let { value = $bindable(), placeholder = $bindable() } = $props()
</script>

<div class="calendar">
  <Calendar.Root
    weekdayFormat="narrow"
    fixedWeeks={true}
    type="single"
    locale="he"
    weekStartsOn={0}
    bind:value
    bind:placeholder
  >
    {#snippet children({ months, weekdays })}
      <div class="calendar-header">
        <Calendar.PrevButton>
          {#snippet child({ props })}
            <button {...props}><IconPhCaretLeft /></button>
          {/snippet}
        </Calendar.PrevButton>
        <Calendar.Heading />
        <Calendar.NextButton>
          {#snippet child({ props })}
            <button {...props}><IconPhCaretRight /></button>
          {/snippet}
        </Calendar.NextButton>
      </div>
      <div class="calendar-body">
        {#each months as month, i (i)}
          <Calendar.Grid>
            <Calendar.GridHead>
              <Calendar.GridRow>
                {#each weekdays as day}
                  <Calendar.HeadCell>
                    <div>{day.slice(0, 2)}</div>
                  </Calendar.HeadCell>
                {/each}
              </Calendar.GridRow>
            </Calendar.GridHead>
            <Calendar.GridBody>
              {#each month.weeks as weekDates}
                <Calendar.GridRow>
                  {#each weekDates as date}
                    <Calendar.Cell {date} month={month.value}>
                      <Calendar.Day>
                        <div>
                          {date.day}
                        </div>
                      </Calendar.Day>
                    </Calendar.Cell>
                  {/each}
                </Calendar.GridRow>
              {/each}
            </Calendar.GridBody>
          </Calendar.Grid>
        {/each}
      </div>
    {/snippet}
  </Calendar.Root>
</div>

<style lang="scss">
$base-font-size: 16px;

.calendar {
  background-color: white;
  margin: 0 auto;
  width: 100%;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.3125rem rgba(0, 0, 0, 0.1);
  overflow: hidden;

  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
  }

  [data-bits-calendar-next-button],
  [data-bits-calendar-prev-button] {
    background-color: #f0f0f0;
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

    &:hover {
      background-color: #e0e0e0;
    }
  }
}

:global {
  [data-bits-calendar-heading] {
    display: flex;
    color: #555;
    font-size: 1.1rem;
    font-weight: 500;
    padding: 0.625rem 0;
    text-align: center;
  }

  [data-bits-calendar-grid-head-row] {
    th {
      color: #777;
      font-size: 0.8rem;
      font-weight: 400;
      padding: 0.375rem;
      text-align: center;
    }
  }

  [data-bits-calendar-grid-body-row] {
    td {
      padding: 1px;
    }
  }

  [data-bits-calendar-cell] {
    [data-bits-calendar-day] {
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

      &:hover {
        color: #007bff;
        background-color: #e6f7ff;
      }

      &[data-disabled] {
        color: #ccc;
        cursor: not-allowed;
      }

      &[data-selected] {
        background-color: #007bff;
        color: #fff;
      }

      &[data-state='unavailable'] {
        background-color: #f9f9f9;
        color: #ccc;
        cursor: default;
      }
    }
  }

  [data-bits-calendar-grid] {
    border-spacing: 0.25rem;
    color: #333;
    width: 100%;
  }

  [data-bits-calendar-day] {
    justify-self: center;
    padding: 0.2rem;
  }
}

@media (max-width: 768px) {
  :global {
    [data-bits-calendar-heading] {
      font-size: 1rem;
    }

    [data-bits-calendar-grid-head-row] {
      th {
        font-size: 0.7rem;
        padding: 0.25rem;
      }
    }

    [data-bits-calendar-cell] {
      button[data-bits-calendar-day] {
        font-size: 0.9rem;
        height: 2rem;
        width: 2rem;
        margin: 0.0625rem;
        border-radius: 0.375rem;
      }
    }

    [data-bits-calendar-grid] {
      border-spacing: 0.125rem;
    }
  }
}

@media (max-width: 375px) {
  :global {
    [data-bits-calendar-heading] {
      padding: 0.5rem 0;
    }

    [data-bits-calendar-cell] {
      button[data-bits-calendar-day] {
        font-size: 0.85rem;
        height: 1.75rem;
        width: 1.75rem;
      }
    }
  }
}
</style>
