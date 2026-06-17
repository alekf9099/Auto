import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadPoints, savePoints, awardPoints, tryClaimDaily, spendPoints, tryFeatureBonus,
  getLuckyTimerAttempts, claimLuckyTimer, LUCKY_TIMER_MAX_ATTEMPTS,
} from './points'

beforeEach(() => {
  localStorage.clear()
})

describe('loadPoints', () => {
  it('returns a fresh zero-balance state when nothing is stored', () => {
    expect(loadPoints()).toEqual({ balance: 0, lastDaily: '', history: [] })
  })

  it('falls back to a fresh state when the stored value is corrupted JSON', () => {
    localStorage.setItem('unmyeongbom_points', '{not valid json')
    expect(loadPoints()).toEqual({ balance: 0, lastDaily: '', history: [] })
  })

  it('round-trips a saved state', () => {
    const saved = awardPoints(loadPoints(), 5, '테스트')
    expect(loadPoints()).toEqual(saved)
  })
})

describe('awardPoints / spendPoints', () => {
  it('increases balance and prepends a history entry', () => {
    const next = awardPoints(loadPoints(), 5, '출석')
    expect(next.balance).toBe(5)
    expect(next.history[0]).toMatchObject({ amount: 5, label: '출석' })
  })

  it('caps history at 60 entries', () => {
    let p = loadPoints()
    for (let i = 0; i < 65; i++) p = awardPoints(p, 1, `이벤트${i}`)
    expect(p.history).toHaveLength(60)
  })

  it('refuses to spend more than the current balance', () => {
    const funded = awardPoints(loadPoints(), 10, '충전')
    const { next, success } = spendPoints(funded, 50, '잠금 해제')
    expect(success).toBe(false)
    expect(next).toBe(funded)
  })

  it('deducts balance and records a negative history entry on success', () => {
    const funded = awardPoints(loadPoints(), 50, '충전')
    const { next, success } = spendPoints(funded, 50, '잠금 해제')
    expect(success).toBe(true)
    expect(next.balance).toBe(0)
    expect(next.history[0]).toMatchObject({ amount: -50, label: '잠금 해제' })
  })
})

describe('tryClaimDaily', () => {
  it('awards the bonus once per day and blocks a second claim', () => {
    const first = tryClaimDaily(loadPoints())
    expect(first.claimed).toBe(true)
    expect(first.next.balance).toBe(10)

    const second = tryClaimDaily(first.next)
    expect(second.claimed).toBe(false)
    expect(second.next.balance).toBe(10)
  })
})

describe('tryFeatureBonus', () => {
  it('awards a feature bonus once per day per feature, independently per key', () => {
    const first = tryFeatureBonus(loadPoints(), 'saju', '사주 확인')
    expect(first.claimed).toBe(true)
    expect(first.next.balance).toBe(5)

    const repeat = tryFeatureBonus(first.next, 'saju', '사주 확인')
    expect(repeat.claimed).toBe(false)
    expect(repeat.next.balance).toBe(5)

    const otherFeature = tryFeatureBonus(repeat.next, 'gunghab', '궁합 확인')
    expect(otherFeature.claimed).toBe(true)
    expect(otherFeature.next.balance).toBe(10)
  })
})

describe('lucky timer attempts', () => {
  it('starts at zero and increments with each claim', () => {
    expect(getLuckyTimerAttempts()).toBe(0)
    const { attempts } = claimLuckyTimer(loadPoints(), false)
    expect(attempts).toBe(1)
    expect(getLuckyTimerAttempts()).toBe(1)
  })

  it('falls back to 0 instead of NaN when the stored count is corrupted', () => {
    const today = new Date().toISOString().slice(0, 10)
    localStorage.setItem(`unmyeongbom_points_lucky_${today}`, 'not-a-number')
    expect(getLuckyTimerAttempts()).toBe(0)
  })

  it('reaches the max attempts after repeated claims', () => {
    for (let i = 0; i < LUCKY_TIMER_MAX_ATTEMPTS; i++) claimLuckyTimer(loadPoints(), false)
    expect(getLuckyTimerAttempts()).toBe(LUCKY_TIMER_MAX_ATTEMPTS)
  })
})

describe('savePoints', () => {
  it('persists state under the points storage key', () => {
    savePoints({ balance: 42, lastDaily: '2024-01-01', history: [] })
    expect(JSON.parse(localStorage.getItem('unmyeongbom_points')!)).toEqual({
      balance: 42, lastDaily: '2024-01-01', history: [],
    })
  })
})
