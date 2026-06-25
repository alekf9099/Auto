// 웹 푸시(매일 운세 알림) 구독 관리.
import { getIdToken, getProvider } from './cloudSync'

const VAPID_PUBLIC = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined
const ENABLED_KEY = 'unmyeongbom_push_enabled'

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window &&
    !!VAPID_PUBLIC
  )
}

export function isPushEnabled(): boolean {
  return localStorage.getItem(ENABLED_KEY) === '1' && Notification.permission === 'granted'
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

async function postSubscription(action: 'subscribe' | 'unsubscribe', subscription: PushSubscription | null): Promise<boolean> {
  const idToken = getIdToken()
  if (!idToken) return false
  try {
    const res = await fetch('/api/push-subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken, provider: getProvider(), action, subscription }),
    })
    return res.ok
  } catch {
    return false
  }
}

// 알림 켜기: 권한 요청 → 푸시 구독 → 서버 저장. 성공 시 true.
export async function enablePush(): Promise<{ ok: boolean; reason?: string }> {
  if (!isPushSupported()) return { ok: false, reason: 'unsupported' }
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return { ok: false, reason: 'denied' }

  const reg = await navigator.serviceWorker.ready
  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC as string) as unknown as BufferSource,
    })
  }
  const saved = await postSubscription('subscribe', sub)
  if (!saved) return { ok: false, reason: 'server' }
  localStorage.setItem(ENABLED_KEY, '1')
  return { ok: true }
}

// 알림 끄기: 구독 해제 + 서버 비활성화.
export async function disablePush(): Promise<boolean> {
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    await postSubscription('unsubscribe', sub)
    if (sub) await sub.unsubscribe()
  } catch {
    // 무시 — 로컬 플래그는 끈다
  }
  localStorage.removeItem(ENABLED_KEY)
  return true
}
