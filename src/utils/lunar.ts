import solarLunar from 'solarlunar'

export function lunarToSolar(
  year: number, month: number, day: number, isLeapMonth: boolean
): { year: number; month: number; day: number } | null {
  const result = solarLunar.lunar2solar(year, month, day, isLeapMonth)
  if (result === -1) return null
  return { year: result.cYear, month: result.cMonth, day: result.cDay }
}
