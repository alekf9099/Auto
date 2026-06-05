export type Element = 'wood' | 'fire' | 'earth' | 'metal' | 'water'
export type YinYang = 'yang' | 'yin'
export type Gender = 'male' | 'female'

export interface StemInfo {
  ko: string
  hanja: string
  element: Element
  yinYang: YinYang
}

export interface BranchInfo {
  ko: string
  hanja: string
  element: Element
  yinYang: YinYang
  animal: string
  hour: string
}

export interface Pillar {
  stemIndex: number
  branchIndex: number
  label: string
}

export interface SajuResult {
  yearPillar: Pillar
  monthPillar: Pillar
  dayPillar: Pillar
  hourPillar: Pillar | null
  minutePillar: Pillar | null
  daun: DaunEntry[]
  daunStartAge: number
  isForward: boolean
}

export interface DaunEntry {
  age: number
  pillar: Pillar
}

export interface OhaengCount {
  wood: number
  fire: number
  earth: number
  metal: number
  water: number
}

export interface SipsinEntry {
  pillarLabel: string
  position: string
  stemIndex: number
  sipsin: string | null
}

export interface BirthInput {
  year: number
  month: number
  day: number
  hour: number | null
  minute: number | null
  gender: Gender
}
