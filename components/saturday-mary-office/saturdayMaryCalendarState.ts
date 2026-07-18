import { reactive } from 'vue'
import { formatDateInput, loadLiturgicalData, type LiturgicalData, type LiturgicalDataSource } from '../../features/martyrology/liturgicalCalendar'

type SaturdayMaryCalendarState = {
  selectedDate: Date
  selectedDateInput: string
  data: LiturgicalData | null
  source: LiturgicalDataSource | ''
  psalterWeek: number
  loading: boolean
  error: string
  initialized: boolean
}

export const saturdayMaryCalendarState = reactive<SaturdayMaryCalendarState>({
  selectedDate: new Date(),
  selectedDateInput: formatDateInput(new Date()),
  data: null,
  source: '',
  psalterWeek: 1,
  loading: false,
  error: '',
  initialized: false,
})

let requestId = 0

export async function setSaturdayMaryDate(value: string | Date) {
  const date = typeof value === 'string' ? parseDateInput(value) : value
  const currentRequest = ++requestId

  saturdayMaryCalendarState.selectedDate = date
  saturdayMaryCalendarState.selectedDateInput = formatDateInput(date)
  saturdayMaryCalendarState.loading = true
  saturdayMaryCalendarState.error = ''
  saturdayMaryCalendarState.initialized = true

  try {
    const result = await loadLiturgicalData(date)
    if (currentRequest !== requestId)
      return

    saturdayMaryCalendarState.data = result.data
    saturdayMaryCalendarState.source = result.source
    saturdayMaryCalendarState.psalterWeek = normalizePsalterWeek(result.data.psalterWeek)
  }
  catch {
    if (currentRequest !== requestId)
      return

    saturdayMaryCalendarState.error = '无法加载礼仪日历'
    saturdayMaryCalendarState.data = null
    saturdayMaryCalendarState.source = ''
  }
  finally {
    if (currentRequest === requestId)
      saturdayMaryCalendarState.loading = false
  }
}

export function ensureSaturdayMaryDateInitialized() {
  if (!saturdayMaryCalendarState.initialized)
    void setSaturdayMaryDate(new Date())
}

function parseDateInput(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day)
    return new Date()
  return new Date(year, month - 1, day)
}

function normalizePsalterWeek(value?: number) {
  return value && value >= 1 && value <= 4 ? value : 1
}
