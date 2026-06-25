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

// 리워드 광고 보상 — 광고 1회 시청당 지급 / 하루 상한.
// 라벨·금액은 서버 검증(api/sync.ts POINT_RULES)과 반드시 일치해야 한다.
export const REWARDED_AD_REWARD = 20
export const REWARDED_AD_DAILY_CAP = 5
export const REWARDED_AD_LABEL = '광고 보상 🎬'

export function getRewardedAdCountToday(p: PointsState): number {
  return p.history.filter(h => h.date === today() && h.label === REWARDED_AD_LABEL).length
}

export function claimRewardedAd(p: PointsState): { next: PointsState; ok: boolean } {
  if (getRewardedAdCountToday(p) >= REWARDED_AD_DAILY_CAP) return { next: p, ok: false }
  return { next: awardPoints(p, REWARDED_AD_REWARD, REWARDED_AD_LABEL), ok: true }
}

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

// 오행 룰렛 — 하루 1회
export interface RouletteSegment {
  key: string
  label: string
  amount: number
  weight: number  // 100분율 가중치, 합계 100
  color: string
}

export const ROULETTE_SEGMENTS: RouletteSegment[] = [
  { key: 'wood',    label: '목(木)',  amount: 10,  weight: 16, color: '#4ADE80' },
  { key: 'fire',    label: '화(火)',  amount: 10,  weight: 16, color: '#F87171' },
  { key: 'earth',   label: '토(土)',  amount: 10,  weight: 16, color: '#D9A552' },
  { key: 'metal',   label: '금(金)',  amount: 15,  weight: 13, color: '#CBD5E1' },
  { key: 'water',   label: '수(水)',  amount: 15,  weight: 13, color: '#60A5FA' },
  { key: 'blank',   label: '꽝',      amount: 5,   weight: 15, color: '#6B6280' },
  { key: 'great',   label: '대길',    amount: 30,  weight: 9,  color: '#A78BFA' },
  { key: 'jackpot', label: '잭폿',    amount: 100, weight: 2,  color: '#C9962A' },
]

export function hasSpunRouletteToday(): boolean {
  return localStorage.getItem(`${KEY}_roulette`) === today()
}

export function pickRouletteSegment(): RouletteSegment {
  const total = ROULETTE_SEGMENTS.reduce((sum, seg) => sum + seg.weight, 0)
  let r = Math.random() * total
  for (const seg of ROULETTE_SEGMENTS) {
    if (r < seg.weight) return seg
    r -= seg.weight
  }
  return ROULETTE_SEGMENTS[0]
}

export function claimRoulette(p: PointsState, segment: RouletteSegment): PointsState {
  localStorage.setItem(`${KEY}_roulette`, today())
  scheduleCloudPush()
  return awardPoints(p, segment.amount, `오행 룰렛 — ${segment.label} 적중! 🎡`)
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
