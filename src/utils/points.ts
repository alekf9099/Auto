import { scheduleCloudPush } from './cloudSync'

export interface PointsState {
  balance: number
  lastDaily: string  // 'YYYY-MM-DD'
  history: { date: string; amount: number; label: string }[]
}

const KEY = 'unmyeongbom_points'
const today = () => new Date().toISOString().slice(0, 10)

export function loadPoints(): PointsState {
  try {
    const s = localStorage.getItem(KEY)
    return s ? (JSON.parse(s) as PointsState) : { balance: 0, lastDaily: '', history: [] }
  } catch { return { balance: 0, lastDaily: '', history: [] } }
}

export function savePoints(p: PointsState): void {
  localStorage.setItem(KEY, JSON.stringify(p))
  scheduleCloudPush()
}

export function awardPoints(p: PointsState, amount: number, label: string): PointsState {
  const next: PointsState = {
    balance: p.balance + amount,
    lastDaily: p.lastDaily,
    history: [{ date: today(), amount, label }, ...p.history].slice(0, 60),
  }
  savePoints(next)
  return next
}

// 연속 출석 마일스톤 — 도달 시 1회성 추가 보너스 지급
export const STREAK_MILESTONES = [
  { days: 7,  bonus: 50  },
  { days: 30, bonus: 200 },
] as const

function computeStreak(history: PointsState['history']): number {
  const dates = new Set(history.filter(h => h.label === '매일 출석 보너스').map(h => h.date))
  let count = 0
  const d = new Date()
  while (dates.has(d.toISOString().slice(0, 10))) {
    count++
    d.setDate(d.getDate() - 1)
  }
  return count
}

export function tryClaimDaily(
  p: PointsState
): { next: PointsState; claimed: boolean; milestone: { days: number; bonus: number } | null } {
  if (p.lastDaily === today()) return { next: p, claimed: false, milestone: null }
  let next = awardPoints(p, 10, '매일 출석 보너스')
  next.lastDaily = today()
  savePoints(next)

  const streak = computeStreak(next.history)
  const milestone = STREAK_MILESTONES.find(m => m.days === streak) ?? null
  if (milestone) {
    next = awardPoints(next, milestone.bonus, `${milestone.days}일 연속 출석 보너스 🎉`)
    next.lastDaily = today()
    savePoints(next)
  }
  return { next, claimed: true, milestone }
}

// 행운의 숫자 잡기 — 하루 3회
export const LUCKY_TIMER_MAX_ATTEMPTS = 3

export function getLuckyTimerAttempts(): number {
  const n = Number(localStorage.getItem(`${KEY}_lucky_${today()}`) ?? '0')
  return Number.isFinite(n) ? n : 0
}

export function claimLuckyTimer(p: PointsState, success: boolean): { next: PointsState; attempts: number } {
  const attempts = getLuckyTimerAttempts() + 1
  localStorage.setItem(`${KEY}_lucky_${today()}`, String(attempts))
  scheduleCloudPush()
  const next = awardPoints(p, success ? 20 : 5, success ? '행운의 숫자 적중! 🎯' : '행운의 숫자 도전 ⏱️')
  return { next, attempts }
}

// 심층 사주 잠금 해제에 필요한 포인트
export const DEEP_SAJU_UNLOCK_COST = 50

export function spendPoints(p: PointsState, amount: number, label: string): { next: PointsState; success: boolean } {
  if (p.balance < amount) return { next: p, success: false }
  const next: PointsState = {
    balance: p.balance - amount,
    lastDaily: p.lastDaily,
    history: [{ date: today(), amount: -amount, label }, ...p.history].slice(0, 60),
  }
  savePoints(next)
  return { next, success: true }
}

// 기능별 하루 1회 보너스 — featureKey ex) 'today', 'sinnyeon'
export function tryFeatureBonus(
  p: PointsState, featureKey: string, label: string
): { next: PointsState; claimed: boolean } {
  const storageKey = `${KEY}_feat_${featureKey}_${today()}`
  if (localStorage.getItem(storageKey)) return { next: p, claimed: false }
  localStorage.setItem(storageKey, '1')
  scheduleCloudPush()
  const next = awardPoints(p, 5, label)
  return { next, claimed: true }
}
