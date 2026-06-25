// 게스트(비로그인) 정책 유틸.
// - 게스트는 포인트가 없다(적립/표시 안 함).
// - 게스트는 각 분석 기능을 1회만 열람할 수 있고, 그 다음엔 로그인을 유도한다.
import { getProvider } from './cloudSync'

const USED_KEY = 'unmyeongbom_guest_used'

export function isGuest(): boolean {
  return getProvider() === 'guest'
}

export function getGuestUsed(): string[] {
  try {
    const raw = localStorage.getItem(USED_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function isGuestUsed(feature: string): boolean {
  return getGuestUsed().includes(feature)
}

export function markGuestUsed(feature: string): void {
  const used = getGuestUsed()
  if (used.includes(feature)) return
  used.push(feature)
  localStorage.setItem(USED_KEY, JSON.stringify(used))
}

// 분석 페이지의 "다시 하기" 버튼처럼, App 바깥(개별 페이지)에서 로그인 유도 모달을 띄우기 위한 다리.
// App이 마운트 시 핸들러를 등록한다.
let promptHandler: ((msg: string) => void) | null = null

export function registerGuestPrompt(fn: (msg: string) => void): () => void {
  promptHandler = fn
  return () => { if (promptHandler === fn) promptHandler = null }
}

// 게스트가 재분석("다시 하기")을 시도하면 로그인 모달을 띄우고 true를 반환한다.
// 게스트가 아니면 false(정상 진행).
export function blockGuestRetry(): boolean {
  if (!isGuest()) return false
  promptHandler?.('게스트는 분석을 1회만 볼 수 있어요. 다시 보려면 로그인하세요.')
  return true
}

