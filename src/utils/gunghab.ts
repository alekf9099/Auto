import { calculateSaju } from './saju'
import { STEMS } from './constants'
import type { BirthInput } from '../types'

export type GunghabRelation = 'couple' | 'friend' | 'work'

export interface GunghabResult {
  total: number
  emotion: number
  personality: number
  future: number
  grade: string
  gradeColor: string
  gradeBg: string
  headline: string
  summary: string
  tips: { text: string; good: boolean }[]
}

const STEM_HAP: [number, number][] = [[0,5],[1,6],[2,7],[3,8],[4,9]]
const SAMHAP = [[2,6,10],[8,0,4],[11,3,7],[5,9,1]]
const YUKHAP: [number,number][] = [[0,1],[2,11],[3,10],[4,9],[5,8],[6,7]]
const CHUNG:  [number,number][] = [[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]]

const GENERATES: Record<string,string> = { wood:'fire', fire:'earth', earth:'metal', metal:'water', water:'wood' }
const CONTROLS:  Record<string,string> = { wood:'earth', earth:'water', water:'fire', fire:'metal', metal:'wood' }

function hasPair(pairs: [number,number][], a: number, b: number): boolean {
  return pairs.some(([x,y]) => (a===x&&b===y)||(a===y&&b===x))
}
function inGroup(groups: number[][], a: number, b: number): boolean {
  return groups.some(g => g.includes(a) && g.includes(b))
}
function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}
function subScore(flags: boolean[], bonus: number): number {
  const count = flags.filter(Boolean).length
  return clamp(Math.round(30 + (count / flags.length) * 58 + bonus), 24, 96)
}

export function calcGunghab(a: BirthInput, b: BirthInput, rel: GunghabRelation): GunghabResult {
  const sa = calculateSaju(a)
  const sb = calculateSaju(b)

  const dsA = sa.dayPillar.stemIndex,   dbA = sa.dayPillar.branchIndex
  const dsB = sb.dayPillar.stemIndex,   dbB = sb.dayPillar.branchIndex
  const ysA = sa.yearPillar.stemIndex,  ybA = sa.yearPillar.branchIndex
  const ysB = sb.yearPillar.stemIndex,  ybB = sb.yearPillar.branchIndex
  const msA = sa.monthPillar.stemIndex, msB = sb.monthPillar.stemIndex

  const eA = STEMS[dsA].element, eB = STEMS[dsB].element
  const yangA = STEMS[dsA].yinYang === 'yang'
  const yangB = STEMS[dsB].yinYang === 'yang'

  const stemHap   = hasPair(STEM_HAP, dsA, dsB)
  const generates = GENERATES[eA] === eB || GENERATES[eB] === eA
  const controls  = CONTROLS[eA]  === eB || CONTROLS[eB]  === eA
  const sameElem  = eA === eB
  const yyComp    = yangA !== yangB

  const samhap = inGroup(SAMHAP, dbA, dbB)
  const yukhap = hasPair(YUKHAP, dbA, dbB)
  const chung  = hasPair(CHUNG,  dbA, dbB)

  const yStemHap  = hasPair(STEM_HAP, ysA, ysB)
  const yBrSamhap = inGroup(SAMHAP, ybA, ybB)
  const yBrYukhap = hasPair(YUKHAP, ybA, ybB)
  const yBrChung  = hasPair(CHUNG, ybA, ybB)
  const mStemHap  = hasPair(STEM_HAP, msA, msB)

  let stemScore = 0
  if (stemHap)                  stemScore = 30
  else if (generates && yyComp) stemScore = 24
  else if (generates)           stemScore = 20
  else if (sameElem && yyComp)  stemScore = 18
  else if (yyComp)              stemScore = 15
  else if (sameElem)            stemScore = 12
  else if (controls)            stemScore = 5

  let branchScore = 15
  if (samhap)      branchScore = 30
  else if (yukhap) branchScore = 26
  else if (chung)  branchScore = 3

  let bonus = 0
  if (yStemHap)        bonus += 9
  if (yBrSamhap)       bonus += 7
  else if (yBrYukhap)  bonus += 5
  else if (yBrChung)   bonus -= 4
  if (mStemHap)        bonus += 6

  let total = 20 + stemScore + branchScore + bonus
  if (rel === 'couple') { if (stemHap) total += 3; if (!yyComp) total -= 4 }
  if (rel === 'work' && generates) total += 4
  total = clamp(total, 22, 97)

  const emotion     = subScore([stemHap, yyComp, samhap || yukhap, !chung], rel === 'couple' ? 6 : 0)
  const personality = subScore([generates || sameElem, yyComp, samhap, !controls], rel === 'friend' ? 6 : 0)
  const future      = subScore([yStemHap || mStemHap, generates, !chung, yBrSamhap || yBrYukhap], rel === 'work' ? 6 : 0)

  const meta = gradeInfo(total, rel, stemHap, samhap, chung, generates, controls)
  const tips = buildTips(stemHap, samhap, yukhap, chung, generates, controls, yyComp, rel)

  return { total, emotion, personality, future, tips, ...meta }
}

function gradeInfo(
  total: number, rel: GunghabRelation,
  stemHap: boolean, samhap: boolean, chung: boolean,
  generates: boolean, controls: boolean,
) {
  const label = { couple: '연인', friend: '친구', work: '직장동료' }[rel]
  if (total >= 88) return {
    grade: '천생연분', gradeColor: '#7C3AED', gradeBg: '#F3F0FF',
    headline: stemHap ? '하늘이 맺어준 운명의 인연' : '타고난 완벽한 궁합',
    summary: `${label}으로서 가장 이상적인 사주 조합입니다. ${stemHap ? '일간이 천간합을 이루어 본능적으로 강하게 끌리는 에너지가 형성되며, ' : samhap ? '사주의 지지가 삼합을 이루어 뜻이 잘 맞고, ' : ''}서로의 기운이 완벽하게 보완되어 함께할수록 더욱 빛나는 관계입니다.`,
  }
  if (total >= 75) return {
    grade: '찰떡궁합', gradeColor: '#059669', gradeBg: '#ECFDF5',
    headline: '서로를 성장시키는 최고의 파트너',
    summary: `${generates ? '오행이 서로 상생하여 ' : ''}두 분의 사주가 조화롭게 어우러집니다. 함께 있을 때 자연스럽게 좋은 에너지가 흐르고, 서로의 장점을 끌어내주는 ${label} 관계입니다.`,
  }
  if (total >= 62) return {
    grade: '좋은 인연', gradeColor: '#2563EB', gradeBg: '#EFF6FF',
    headline: '편안하고 자연스러운 관계',
    summary: `무리 없이 잘 맞는 ${label} 사이입니다. ${generates ? '오행이 상생하는 면이 있어 함께할 때 시너지가 생깁니다. ' : ''}서로를 이해하려는 노력이 더해지면 더욱 깊은 인연으로 발전합니다.`,
  }
  if (total >= 50) return {
    grade: '무난한 인연', gradeColor: '#6B7280', gradeBg: '#F9FAFB',
    headline: '노력으로 만들어가는 인연',
    summary: `서로 다른 에너지를 가졌지만 ${controls ? '오행이 서로 제어하는 관계로 충돌이 생길 수 있습니다. 그러나 ' : ''}상대방의 다름을 인정하고 배려한다면 오히려 부족한 점을 채워주는 관계가 됩니다.`,
  }
  return {
    grade: '주의 필요', gradeColor: '#DC2626', gradeBg: '#FFF1F2',
    headline: chung ? '충돌하는 에너지, 깊은 이해가 필요합니다' : '다소 어려운 인연입니다',
    summary: `사주 에너지가 충돌하는 면이 있습니다. ${chung ? '지지가 충(衝)을 이루어 갑작스러운 마찰이 생길 수 있습니다. ' : ''}서로를 깊이 이해하고 배려하는 자세가 있다면 노력으로 극복할 수 있습니다.`,
  }
}

function buildTips(
  stemHap: boolean, samhap: boolean, yukhap: boolean,
  chung: boolean, generates: boolean, controls: boolean,
  yyComp: boolean, rel: GunghabRelation,
): { text: string; good: boolean }[] {
  const t: { text: string; good: boolean }[] = []
  if (stemHap)   t.push({ text: '일간 천간합 — 본능적으로 강하게 끌리는 에너지', good: true })
  if (samhap)    t.push({ text: '지지 삼합 — 같은 방향을 바라보며 함께 성장하는 사이', good: true })
  if (yukhap)    t.push({ text: '지지 육합 — 자연스럽게 가까워지는 인연의 기운', good: true })
  if (generates) t.push({ text: '오행 상생 — 서로의 기운을 끌어올려 주는 관계', good: true })
  if (yyComp)    t.push({ text: '음양 조화 — 서로의 부족함을 자연스럽게 채워주는 사이', good: true })
  if (chung)     t.push({ text: '지지 충(衝) — 에너지가 충돌해 갈등이 생길 수 있어요', good: false })
  if (controls)  t.push({ text: '오행 상극 — 서로 제어하려는 기운이 충돌할 수 있어요', good: false })
  if (!yyComp && rel === 'couple') t.push({ text: '같은 음양 — 비슷한 성향으로 서로 양보가 더 필요해요', good: false })
  return t.slice(0, 4)
}
