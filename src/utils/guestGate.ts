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
