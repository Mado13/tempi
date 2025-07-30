import { CalendarDate, DateFormatter } from '@internationalized/date'
import { type DateRange } from '@melt-ui/svelte'

// For Hebrew display in your UI
export function formatHebrewDateRange(dateRange: DateRange): string {
  if (!dateRange?.start || !dateRange?.end) return ''

  const formatter = new DateFormatter('he', { dateStyle: 'medium' })
  return formatter.formatRange(dateRange.start.toDate('UTC'), dateRange.end.toDate('UTC'))
}

export function formatHebrewDateRangeFromStrings(startString?: string, endString?: string): string {
  if (!startString || !endString) return ''

  const [startYear, startMonth, startDay] = startString.split('-').map(Number)
  const [endYear, endMonth, endDay] = endString.split('-').map(Number)

  const dateRange: DateRange = {
    start: new CalendarDate(startYear, startMonth, startDay),
    end: new CalendarDate(endYear, endMonth, endDay),
  }

  return formatHebrewDateRange(dateRange)
}

// For database/API submission
export function serializeDateRange(dateRange: DateRange): Record<string, string> {
  if (!dateRange?.start || !dateRange?.end) {
    return { start: '', end: '' }
  }

  return {
    start: dateRange.start.toString(), // ISO format: "2025-07-13"
    end: dateRange.end.toString(),
  }
}

// For deserializing from database back to calendar
export function deserializeDateRange(record: Record<string, string>): DateRange | null {
  if (!record.start || !record.end) return null

  const [startYear, startMonth, startDay] = record.start.split('-').map(Number)
  const [endYear, endMonth, endDay] = record.end.split('-').map(Number)

  return {
    start: new CalendarDate(startYear, startMonth, startDay),
    end: new CalendarDate(endYear, endMonth, endDay),
  }
}
