import { describe, it, expect } from 'vitest'
import { calculateSaju, getSipsin, getOhaengCount, pillarName, pillarNameKo } from './saju'
import type { BirthInput } from '../types'

const BASE: BirthInput = { year: 1990, month: 5, day: 15, hour: 14, minute: 30, gender: 'male' }

describe('calculateSaju', () => {
  it('computes year/month/day/hour pillars for a known birth date', () => {
    const r = calculateSaju(BASE)
    expect(r.yearPillar).toMatchObject({ stemIndex: 6, branchIndex: 6 })
    expect(r.monthPillar).toMatchObject({ stemIndex: 7, branchIndex: 5 })
    expect(r.dayPillar).toMatchObject({ stemIndex: 6, branchIndex: 0 })
    expect(r.hourPillar).toMatchObject({ stemIndex: 9, branchIndex: 7 })
  })

  it('matches the documented 갑자(甲子) anchor for 1900-01-31', () => {
    const r = calculateSaju({ ...BASE, year: 1900, month: 1, day: 31 })
    expect(r.dayPillar).toMatchObject({ stemIndex: 0, branchIndex: 0 })
  })

  it('shifts the saju year back before 입춘 (Feb 4)', () => {
    const before = calculateSaju({ ...BASE, year: 2000, month: 2, day: 3 })
    const after  = calculateSaju({ ...BASE, year: 2000, month: 2, day: 4 })
    expect(before.yearPillar).not.toEqual(after.yearPillar)
  })

  it('omits hour/minute pillars when birth time is unknown', () => {
    const r = calculateSaju({ ...BASE, hour: null, minute: null })
    expect(r.hourPillar).toBeNull()
    expect(r.minutePillar).toBeNull()
  })

  it('produces minute pillar only when both hour and minute are known', () => {
    const r = calculateSaju({ ...BASE, hour: 14, minute: null })
    expect(r.hourPillar).not.toBeNull()
    expect(r.minutePillar).toBeNull()
  })

  it('generates 8 대운 entries 10 years apart', () => {
    const r = calculateSaju(BASE)
    expect(r.daun).toHaveLength(8)
    r.daun.forEach((d, i) => expect(d.age).toBe(r.daunStartAge + i * 10))
  })
})

describe('getSipsin', () => {
  it('is 비견 when the target stem matches the day stem', () => {
    expect(getSipsin(0, 0)).toBe('비견')
  })

  it('is symmetric between yang/yin variants of the same relation', () => {
    expect(getSipsin(0, 2)).toBe('식신')
    expect(getSipsin(0, 3)).toBe('상관')
  })
})

describe('getOhaengCount', () => {
  it('counts 10 elements when hour and minute pillars are present', () => {
    const r = calculateSaju(BASE)
    const count = getOhaengCount(r)
    const total = Object.values(count).reduce((a, b) => a + b, 0)
    expect(total).toBe(10)
  })

  it('counts 6 elements when only year/month/day pillars are present', () => {
    const r = calculateSaju({ ...BASE, hour: null, minute: null })
    const count = getOhaengCount(r)
    const total = Object.values(count).reduce((a, b) => a + b, 0)
    expect(total).toBe(6)
  })
})

describe('pillar naming', () => {
  it('renders hanja and Korean labels for the day pillar', () => {
    const r = calculateSaju(BASE)
    expect(pillarName(r.dayPillar)).toBe('庚子')
    expect(pillarNameKo(r.dayPillar)).toBe('경자')
  })
})
