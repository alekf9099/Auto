import { captureException } from './sentry'

interface NoticeConfig {
  id: string
  message: string
}

interface RemoteConfig {
  notice?: NoticeConfig
}

const DISMISSED_KEY = 'unmyeongbom_notice_dismissed'

// 공지/점검 메시지를 가져온다. 서버나 네트워크 문제로 실패해도 앱 동작에는 영향이 없도록
// 항상 빈 설정({})으로 안전하게 폴백한다.
export async function fetchRemoteConfig(): Promise<RemoteConfig> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    const res = await fetch('/api/config', { signal: controller.signal })
    clearTimeout(timer)
    if (!res.ok) return {}
    return (await res.json()) as RemoteConfig
  } catch (e) {
    captureException(e)
    return {}
  }
}

export function isNoticeDismissed(id: string): boolean {
  return localStorage.getItem(DISMISSED_KEY) === id
}

export function dismissNotice(id: string): void {
  localStorage.setItem(DISMISSED_KEY, id)
}
