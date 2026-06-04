import type { BirthInput, SajuResult, Pillar, DaunEntry, OhaengCount, SipsinEntry } from '../types'
import { STEMS, BRANCHES } from './constants'

// Julian Day Number (proleptic Gregorian)
function jdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12)
  const y = year + 4800 - a
  const m = month + 12 * a - 3
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  )
}

// Approximate 절기 start dates for each lunar month branch
// Returns the branch index (0=子) for a given Gregorian month/day
function getMonthBranch(month: number, day: number): number {
  // Boundaries: [Gregorian month, day] that starts a new 지지 month
  const bounds: [number, number, number][] = [
    [1,  6,  1],  // 소한 → 丑月
    [2,  4,  2],  // 입춘 → 寅月
    [3,  6,  3],  // 경칩 → 卯月
    [4,  5,  4],  // 청명 → 辰月
    [5,  6,  5],  // 입하 → 巳月
    [6,  6,  6],  // 망종 → 午月
    [7,  7,  7],  // 소서 → 未月
    [8,  7,  8],  // 입추 → 申月
    [9,  8,  9],  // 백로 → 酉月
    [10, 8,  10], // 한로 → 戌月
    [11, 7,  11], // 입동 → 亥月
    [12, 7,  0],  // 대설 → 子月
  ]
  let branch = 0 // default: 子月 (late Dec / early Jan)
  for (const [bm, bd, idx] of bounds) {
    if (month > bm || (month === bm && day >= bd)) branch = idx
  }
  return branch
}

// In Korean saju, the year changes at 입춘 (~Feb 4)
function getSajuYear(year: number, month: number, day: number): number {
  if (month === 1 || (month === 2 && day < 4)) return year - 1
  return year
}

function makePillar(stemIndex: number, branchIndex: number, label: string): Pillar {
  return { stemIndex, branchIndex, label }
}

// Count days to the nearest forward/backward 절기 from a birth date
function daysToJieqi(year: number, month: number, day: number, forward: boolean): number {
  // Approximate 절기 dates per month (same bounds as getMonthBranch)
  const jieqiDates: [number, number][] = [
    [1, 6], [2, 4], [3, 6], [4, 5], [5, 6], [6, 6],
    [7, 7], [8, 7], [9, 8], [10, 8], [11, 7], [12, 7],
  ]
  const birthJd = jdn(year, month, day)

  if (forward) {
    // Find the next 절기 after the birthday
    for (let offset = 0; offset <= 2; offset++) {
      const y = year + offset
      for (const [m, d] of jieqiDates) {
        if (offset === 0 && (m < month || (m === month && d <= day))) continue
        const diff = jdn(y, m, d) - birthJd
        if (diff > 0) return diff
      }
    }
  } else {
    // Find the previous 절기 before the birthday
    for (let offset = 0; offset <= 2; offset++) {
      const y = year - offset
      for (let i = jieqiDates.length - 1; i >= 0; i--) {
        const [m, d] = jieqiDates[i]
        if (offset === 0 && (m > month || (m === month && d >= day))) continue
        const diff = birthJd - jdn(y, m, d)
        if (diff > 0) return diff
      }
    }
  }
  return 30 // fallback
}

export function calculateSaju(input: BirthInput): SajuResult {
  const { year, month, day, hour, gender } = input

  // ── 년주 (Year Pillar) ──────────────────────────────────────────────
  const sajuYear = getSajuYear(year, month, day)
  const yearStem   = ((sajuYear - 4) % 10 + 10) % 10
  const yearBranch = ((sajuYear - 4) % 12 + 12) % 12

  // ── 월주 (Month Pillar) ─────────────────────────────────────────────
  const monthBranch      = getMonthBranch(month, day)
  const monthStartStem   = (yearStem % 5 * 2 + 2) % 10
  const monthOffset      = (monthBranch - 2 + 12) % 12
  const monthStem        = (monthStartStem + monthOffset) % 10

  // ── 일주 (Day Pillar) ───────────────────────────────────────────────
  // Anchor: JD 2415051 (1900-01-31) = 甲子 → (JD + 9) % 10 for stem, % 12 for branch
  const dayJd     = jdn(year, month, day)
  const dayStem   = ((dayJd + 9) % 10 + 10) % 10
  const dayBranch = ((dayJd + 9) % 12 + 12) % 12

  // ── 시주 (Hour Pillar) ─────────────────────────────────────────────
  let hourPillar: Pillar | null = null
  if (hour !== null) {
    const hourBranch     = Math.floor(((hour + 1) % 24) / 2)
    const hourStartStem  = (dayStem % 5 * 2) % 10
    const hourStem       = (hourStartStem + hourBranch) % 10
    hourPillar = makePillar(hourStem, hourBranch, '시주')
  }

  // ── 대운 (Major Fortune) ───────────────────────────────────────────
  const isYangYear = yearStem % 2 === 0
  const isMale     = gender === 'male'
  const isForward  = (isYangYear && isMale) || (!isYangYear && !isMale)
  const daysCount  = daysToJieqi(year, month, day, isForward)
  const startAge   = Math.max(1, Math.round(daysCount / 3))

  const daun: DaunEntry[] = []
  for (let i = 0; i < 8; i++) {
    const offset = isForward ? i + 1 : -(i + 1)
    const stem   = ((monthStem   + offset) % 10 + 10) % 10
    const branch = ((monthBranch + offset) % 12 + 12) % 12
    daun.push({
      age: startAge + i * 10,
      pillar: makePillar(stem, branch, `${startAge + i * 10}세`),
    })
  }

  return {
    yearPillar:  makePillar(yearStem, yearBranch, '년주'),
    monthPillar: makePillar(monthStem, monthBranch, '월주'),
    dayPillar:   makePillar(dayStem, dayBranch, '일주'),
    hourPillar,
    daun,
    daunStartAge: startAge,
    isForward,
  }
}

// 십신 (Ten Gods): relative to 일간 (day stem)
export function getSipsin(dayStemIdx: number, targetStemIdx: number): string {
  const selfEl   = Math.floor(dayStemIdx / 2)
  const targetEl = Math.floor(targetStemIdx / 2)
  const sameYY   = dayStemIdx % 2 === targetStemIdx % 2
  const rel      = (targetEl - selfEl + 5) % 5
  if (rel === 0) return sameYY ? '비견' : '겁재'
  if (rel === 1) return sameYY ? '식신' : '상관'
  if (rel === 2) return sameYY ? '편재' : '정재'
  if (rel === 3) return sameYY ? '편관' : '정관'
  return sameYY ? '편인' : '정인'
}

export function getOhaengCount(result: SajuResult): OhaengCount {
  const count: OhaengCount = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }
  const pillars = [result.yearPillar, result.monthPillar, result.dayPillar]
  if (result.hourPillar) pillars.push(result.hourPillar)

  for (const p of pillars) {
    count[STEMS[p.stemIndex].element]++
    count[BRANCHES[p.branchIndex].element]++
  }
  return count
}

export function getSipsinList(result: SajuResult): SipsinEntry[] {
  const dayStem = result.dayPillar.stemIndex
  const pillars = [result.yearPillar, result.monthPillar, result.dayPillar]
  if (result.hourPillar) pillars.push(result.hourPillar)

  const entries: SipsinEntry[] = []
  for (const p of pillars) {
    if (p.label !== '일주') {
      entries.push({
        pillarLabel: p.label,
        position: '천간',
        stemIndex: p.stemIndex,
        sipsin: getSipsin(dayStem, p.stemIndex),
      })
    } else {
      entries.push({
        pillarLabel: p.label,
        position: '천간',
        stemIndex: p.stemIndex,
        sipsin: null,
      })
    }
  }
  return entries
}

export function pillarName(p: Pillar): string {
  return STEMS[p.stemIndex].hanja + BRANCHES[p.branchIndex].hanja
}

export function pillarNameKo(p: Pillar): string {
  return STEMS[p.stemIndex].ko + BRANCHES[p.branchIndex].ko
}
