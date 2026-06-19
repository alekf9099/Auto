declare module 'solarlunar' {
  interface LunarToSolarResult {
    cYear: number
    cMonth: number
    cDay: number
    gzYear: string
    gzMonth: string
    gzDay: string
    isLeap: boolean
    isToday: boolean
    nWeek: number
    ncWeek: string
    term: string
    astro: string
  }

  function lunar2solar(
    year: number, month: number, day: number, isLeapMonth?: boolean
  ): LunarToSolarResult | -1

  function solar2lunar(year: number, month: number, day: number): unknown

  const solarLunar: { lunar2solar: typeof lunar2solar; solar2lunar: typeof solar2lunar }
  export default solarLunar
}
