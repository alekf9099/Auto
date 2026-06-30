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
  unread: number
  opponent: { userId: string; nickname: string; photo: string | null }
}

// 채팅 메시지 (mine: 내가 보낸 것인지 서버가 판정)
export interface ChatMessage {
  id: string
  body: string
  mine: boolean
  createdAt: string
}

async function callMatch(action: 'join' | 'leave' | 'draw' | 'like' | 'matches' | 'messages' | 'send' | 'block' | 'report', extra?: Record<string, unknown>): Promise<Record<string, unknown> | null> {
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

// 대화 메시지 불러오기. closed=true 면 상대가 나갔거나 차단/종료된 매칭.
// partnerLastRead: 상대가 마지막으로 대화를 읽은 시각(ISO) — 내 메시지의 '읽음' 표시에 사용.
export async function loadMessages(matchId: string): Promise<{ messages: ChatMessage[]; closed: boolean; partnerLastRead: string | null }> {
  const result = await callMatch('messages', { matchId })
  if (!result) return { messages: [], closed: false, partnerLastRead: null }
  const list = result.messages as ChatMessage[] | undefined
  return {
    messages: Array.isArray(list) ? list : [],
    closed: !!result.closed,
    partnerLastRead: typeof result.partnerLastRead === 'string' ? result.partnerLastRead : null,
  }
}

// 메시지 전송. 성공 시 생성된 메시지를 반환. reason: 'closed' | 'blocked'
export async function sendMessage(matchId: string, body: string): Promise<{ ok: boolean; message?: ChatMessage; reason?: 'closed' | 'blocked' }> {
  const result = await callMatch('send', { matchId, body })
  if (!result) return { ok: false }
  return {
    ok: !!result.ok,
    message: result.message as ChatMessage | undefined,
    reason: typeof result.reason === 'string' ? (result.reason as 'closed' | 'blocked') : undefined,
  }
}

// 상대 차단 (해당 매칭 종료)
export async function blockMatch(matchId: string): Promise<boolean> {
  const result = await callMatch('block', { matchId })
  return !!result?.ok
}

// 상대 신고 (신고 + 차단 + 매칭 종료)
export async function reportMatch(matchId: string, reason: string): Promise<boolean> {
  const result = await callMatch('report', { matchId, reason })
  return !!result?.ok
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
