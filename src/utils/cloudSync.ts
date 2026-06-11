import { supabase } from './supabase'

const EMAIL_KEY = 'unmyeongbom_user_email'
const PREFIX    = 'unmyeongbom_'

export function getCurrentEmail(): string | null {
  return localStorage.getItem(EMAIL_KEY)
}

export function setCurrentEmail(email: string | null): void {
  if (email) localStorage.setItem(EMAIL_KEY, email)
  else localStorage.removeItem(EMAIL_KEY)
}

function collectLocalData(): Record<string, unknown> {
  const data: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith(PREFIX) || key === EMAIL_KEY) continue
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

let pushTimer: ReturnType<typeof setTimeout> | null = null

async function pushNow(email: string): Promise<void> {
  if (!supabase) return
  const data = collectLocalData()
  await supabase.from('user_data').upsert({ email, data, updated_at: new Date().toISOString() })
}

// 변경 사항을 잠시 모았다가 한 번에 클라우드로 저장
export function scheduleCloudPush(): void {
  const email = getCurrentEmail()
  if (!email || !supabase) return
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(() => { pushNow(email) }, 800)
}

// 로그인 시 클라우드 데이터를 로컬로 동기화 (없으면 현재 로컬 데이터를 업로드)
// 반환값 isNewUser: 클라우드에 기존 데이터가 전혀 없는 진짜 신규 가입자인 경우만 true
// (동기화 실패 시에는 중복 지급 방지를 위해 false로 보수적으로 처리)
export async function pullCloudData(email: string): Promise<{ isNewUser: boolean }> {
  if (!supabase) return { isNewUser: true }
  try {
    const { data: row, error } = await supabase
      .from('user_data')
      .select('data')
      .eq('email', email)
      .maybeSingle()

    if (error) throw error

    if (row?.data) {
      applyLocalData(row.data as Record<string, unknown>)
      return { isNewUser: false }
    } else {
      await pushNow(email)
      return { isNewUser: true }
    }
  } catch (e) {
    console.error('클라우드 동기화 실패:', e)
    return { isNewUser: false }
  }
}
