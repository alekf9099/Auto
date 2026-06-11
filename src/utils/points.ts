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

export function tryClaimDaily(p: PointsState): { next: PointsState; claimed: boolean } {
  if (p.lastDaily === today()) return { next: p, claimed: false }
  const next = awardPoints(p, 10, '매일 출석 보너스')
  next.lastDaily = today()
  savePoints(next)
  return { next, claimed: true }
}

// 행운의 숫자 잡기 — 하루 3회
export const LUCKY_TIMER_MAX_ATTEMPTS = 3

export function getLuckyTimerAttempts(): number {
  return Number(localStorage.getItem(`${KEY}_lucky_${today()}`) ?? '0')
}

export function claimLuckyTimer(p: PointsState, success: boolean): { next: PointsState; attempts: number } {
  const attempts = getLuckyTimerAttempts() + 1
  localStorage.setItem(`${KEY}_lucky_${today()}`, String(attempts))
  scheduleCloudPush()
  const next = awardPoints(p, success ? 20 : 5, success ? '행운의 숫자 적중! 🎯' : '행운의 숫자 도전 ⏱️')
  return { next, attempts }
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
