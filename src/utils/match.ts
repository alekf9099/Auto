import type { BirthInput } from '../types'
import { getIdToken, scheduleCloudPush } from './cloudSync'

// 사주매칭: 옵트인한 사용자끼리 무작위로 매칭해 닉네임 기반 궁합을 확인하는 기능.
// 실제 궁합 점수는 클라이언트가 calcGunghab으로 직접 계산하며, 서버는 닉네임+생년월일시만 중개한다.

const OPT_IN_KEY  = 'unmyeongbom_match_opted_in'
const HISTORY_KEY = 'unmyeongbom_match_history'
const MAX_HISTORY = 30

export interface MatchOpponent {
  nickname: string
  birth: BirthInput
}

export interface MatchHistoryEntry {
  nickname: string
  score: number
  grade: string
  date: string
}

async function callMatch(action: 'join' | 'leave' | 'draw', extra?: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  const idToken = getIdToken()
  if (!idToken) return null
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10000)
    const res = await fetch('/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken, action, ...extra }),
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) return null
    return await res.json()
  } catch (e) {
    console.error('매칭 요청 실패:', e)
    return null
  }
}

export function isOptedIn(): boolean {
  return localStorage.getItem(OPT_IN_KEY) === 'true'
}

function setOptedIn(v: boolean): void {
  localStorage.setItem(OPT_IN_KEY, v ? 'true' : 'false')
  scheduleCloudPush()
}

export async function joinMatchPool(nickname: string, birth: BirthInput): Promise<boolean> {
  const result = await callMatch('join', { nickname, birth })
  const ok = !!result?.ok
  if (ok) setOptedIn(true)
  return ok
}

export async function leaveMatchPool(): Promise<boolean> {
  const result = await callMatch('leave')
  const ok = !!result?.ok
  if (ok) setOptedIn(false)
  return ok
}

export async function drawMatch(): Promise<MatchOpponent | null> {
  const result = await callMatch('draw')
  const opponent = result?.opponent as MatchOpponent | null | undefined
  return opponent ?? null
}

export function loadMatchHistory(): MatchHistoryEntry[] {
  try {
    const s = localStorage.getItem(HISTORY_KEY)
    return s ? (JSON.parse(s) as MatchHistoryEntry[]) : []
  } catch { return [] }
}

export function addMatchHistory(entry: MatchHistoryEntry): MatchHistoryEntry[] {
  const next = [entry, ...loadMatchHistory()].slice(0, MAX_HISTORY)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
  scheduleCloudPush()
  return next
}
