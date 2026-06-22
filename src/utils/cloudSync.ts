import { captureException } from './sentry'

const EMAIL_KEY    = 'unmyeongbom_user_email'
const TOKEN_KEY    = 'unmyeongbom_id_token'
const NAME_KEY     = 'unmyeongbom_user_name'
const PICTURE_KEY  = 'unmyeongbom_user_picture'
const PROVIDER_KEY = 'unmyeongbom_provider'
const PREFIX       = 'unmyeongbom_'
const NON_SYNC_KEYS = new Set([EMAIL_KEY, TOKEN_KEY, NAME_KEY, PICTURE_KEY, PROVIDER_KEY])

export type AuthProvider = 'google' | 'kakao'

export function getCurrentEmail(): string | null {
  return localStorage.getItem(EMAIL_KEY)
}

export function setCurrentEmail(email: string | null): void {
  if (email) localStorage.setItem(EMAIL_KEY, email)
  else localStorage.removeItem(EMAIL_KEY)
}

export function getCurrentName(): string | null {
  return localStorage.getItem(NAME_KEY)
}

export function setCurrentName(name: string | null): void {
  if (name) localStorage.setItem(NAME_KEY, name)
  else localStorage.removeItem(NAME_KEY)
}

export function getCurrentPicture(): string | null {
  return localStorage.getItem(PICTURE_KEY)
}

export function setCurrentPicture(picture: string | null): void {
  if (picture) localStorage.setItem(PICTURE_KEY, picture)
  else localStorage.removeItem(PICTURE_KEY)
}

export function getProvider(): AuthProvider | null {
  const v = localStorage.getItem(PROVIDER_KEY)
  return v === 'google' || v === 'kakao' ? v : null
}

export function setProvider(provider: AuthProvider | null): void {
  if (provider) localStorage.setItem(PROVIDER_KEY, provider)
  else localStorage.removeItem(PROVIDER_KEY)
}

// 구글/카카오 로그인 시 받은 인증 토큰. 서버(/api/sync)가 이 토큰을 검증해 본인 확인 후
// 클라우드 데이터를 읽고/쓴다 — 클라이언트는 더 이상 DB에 직접 접근하지 않는다.
export function setIdToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function getIdToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

// 구글 ID 토큰(JWT)의 payload만 디코딩한다 (서명 검증은 서버가 /api/sync, /api/match에서 수행).
// 카카오는 액세스 토큰이 JWT가 아니라 디코딩할 수 없으므로, 로그인 시점에 받은 이름/사진을
// 별도로(getCurrentName/getCurrentPicture) 저장해 세션 복원에 쓴다.
export function decodeIdToken(token: string): { name: string; email: string; picture?: string } | null {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(b64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    )
    const payload = JSON.parse(json)
    if (typeof payload.name !== 'string' || typeof payload.email !== 'string') return null
    return { name: payload.name, email: payload.email, picture: payload.picture }
  } catch { return null }
}

function collectLocalData(): Record<string, unknown> {
  const data: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith(PREFIX) || NON_SYNC_KEYS.has(key)) continue
    const raw = localStorage.getItem(key)
    if (raw === null) continue
    try { data[key] = JSON.parse(raw) }
    catch { data[key] = raw }
  }
  return data
}

function applyLocalData(data: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(data)) {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
  }
}

type SyncStatus = 'ok' | 'error' | 'expired'
type SyncListener = (status: SyncStatus) => void
const syncListeners = new Set<SyncListener>()

// App 등에서 동기화 성패를 구독해 사용자에게 알릴 수 있도록 한다.
export function onSyncStatusChange(fn: SyncListener): () => void {
  syncListeners.add(fn)
  return () => syncListeners.delete(fn)
}

function notifySyncStatus(status: SyncStatus): void {
  syncListeners.forEach(fn => fn(status))
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function attemptSync(idToken: string, action: 'pull' | 'push', data?: Record<string, unknown>): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10000)
  try {
    return await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken, provider: getProvider(), action, data }),
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }
}

async function callSync(action: 'pull' | 'push', data?: Record<string, unknown>): Promise<{ data: Record<string, unknown> | null } | null> {
  const idToken = getIdToken()
  if (!idToken) return null

  // 홈 화면에 추가된 PWA를 막 열었을 때는 네트워크 스택이 아직 준비되지 않아 첫 요청이
  // 일시적으로 실패할 수 있다. 토큰 만료(401)가 아닌 실패는 한 번 더 재시도해, 이런
  // 일시적인 오류 때문에 매번 동기화 실패 배너가 뜨는 것을 막는다.
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await attemptSync(idToken, action, data)
      // 구글 ID 토큰은 발급 후 약 1시간이면 만료된다. 갱신 로직이 없으므로
      // 401을 받으면 더 이상 재시도하지 않도록 토큰을 비우고 재로그인을 유도한다.
      if (res.status === 401) {
        setIdToken(null)
        notifySyncStatus('expired')
        return null
      }
      if (!res.ok) throw new Error(`동기화 실패: ${res.status}`)
      const json = await res.json()
      notifySyncStatus('ok')
      return json
    } catch (e) {
      if (attempt === 0) { await delay(1500); continue }
      console.error('클라우드 동기화 실패:', e)
      captureException(e)
      notifySyncStatus('error')
      return null
    }
  }
}

let pushTimer: ReturnType<typeof setTimeout> | null = null

// 변경 사항을 잠시 모았다가 한 번에 클라우드로 저장
export function scheduleCloudPush(): void {
  if (!getIdToken()) return
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(() => { callSync('push', collectLocalData()) }, 800)
}

// 로그인 시 클라우드 데이터를 로컬로 동기화 (없으면 현재 로컬 데이터를 업로드)
// 반환값 isNewUser: 클라우드에 기존 데이터가 전혀 없는 진짜 신규 가입자인 경우만 true
// (동기화 실패 시에는 중복 지급 방지를 위해 false로 보수적으로 처리)
export async function pullCloudData(): Promise<{ isNewUser: boolean }> {
  const result = await callSync('pull')
  if (!result) return { isNewUser: false }

  if (result.data) {
    applyLocalData(result.data)
    return { isNewUser: false }
  } else {
    await callSync('push', collectLocalData())
    return { isNewUser: true }
  }
}
