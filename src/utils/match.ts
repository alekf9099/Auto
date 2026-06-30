import type { BirthInput } from '../types'
import { getIdToken, getProvider, scheduleCloudPush } from './cloudSync'
import { loadProfilePhoto } from './profilePhoto'

// 사주매칭: 옵트인한 사용자끼리 무작위로 매칭해 닉네임 기반 궁합을 확인하는 기능.
// 실제 궁합 점수는 클라이언트가 calcGunghab으로 직접 계산하며, 서버는 닉네임+생년월일시+(선택)프로필 사진만 중개한다.

const OPT_IN_KEY  = 'unmyeongbom_match_opted_in'
const HISTORY_KEY = 'unmyeongbom_match_history'
const MAX_HISTORY = 30

export interface MatchOpponent {
  userId: string
  nickname: string
  photo: string | null
  birth: BirthInput
}

export interface MatchHistoryEntry {
  nickname: string
  photo: string | null
  score: number
  grade: string
  date: string
}

// 매칭 성사된 상대 (좋아요가 양쪽 다 모인 경우)
export interface MatchEntry {
  matchId: string
  createdAt: string
  opponent: { userId: string; nickname: string; photo: string | null }
}

async function callMatch(action: 'join' | 'leave' | 'draw' | 'like' | 'matches', extra?: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  const idToken = getIdToken()
  if (!idToken) return null
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10000)
    const res = await fetch('/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken, provider: getProvider(), action, ...extra }),
      signal: controller.signal,
    })
    clearTimeout(timer)
    const json = await res.json().catch(() => null)
    if (!res.ok) {
      console.error('매칭 요청 실패:', res.status, json)
      return json
    }
    return json
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

export async function joinMatchPool(nickname: string, birth: BirthInput): Promise<{ ok: boolean; error?: string }> {
  const result = await callMatch('join', { nickname, birth, photo: loadProfilePhoto() })
  const ok = !!result?.ok
  if (ok) setOptedIn(true)
  return { ok, error: typeof result?.error === 'string' ? result.error : undefined }
}

export async function leaveMatchPool(): Promise<{ ok: boolean; error?: string }> {
  const result = await callMatch('leave')
  const ok = !!result?.ok
  if (ok) setOptedIn(false)
  return { ok, error: typeof result?.error === 'string' ? result.error : undefined }
}

export async function drawMatch(): Promise<MatchOpponent | null> {
  const result = await callMatch('draw')
  const opponent = result?.opponent as MatchOpponent | null | undefined
  return opponent ?? null
}

// 상대에게 좋아요 전송. 상호 좋아요면 matched=true 로 매칭 성사.
// reason: 'limit'(하루 한도 초과) | 'gone'(상대가 풀에서 나감)
export async function sendLike(targetUserId: string): Promise<{ ok: boolean; matched: boolean; reason?: 'limit' | 'gone' }> {
  const result = await callMatch('like', { targetUserId })
  if (!result) return { ok: false, matched: false }
  return {
    ok: !!result.ok,
    matched: !!result.matched,
    reason: typeof result.reason === 'string' ? (result.reason as 'limit' | 'gone') : undefined,
  }
}

// 내 활성 매칭 목록
export async function loadMatches(): Promise<MatchEntry[]> {
  const result = await callMatch('matches')
  const list = result?.matches as MatchEntry[] | undefined
  return Array.isArray(list) ? list : []
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
