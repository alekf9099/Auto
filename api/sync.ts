/// <reference types="node" />
import { createClient } from '@supabase/supabase-js'
import { verifyAuthToken, AuthProviderUnreachableError } from './_auth'

// 구글/카카오 인증 토큰을 서버에서 검증한 뒤, service_role 키로만 사용자 데이터에 접근한다.
// 클라이언트(anon 키)는 user_data 테이블에 직접 접근할 수 없다.

interface PointsHistoryEntry { date: string; amount: number; label: string }
interface PointsState { balance: number; lastDaily: string; history: PointsHistoryEntry[] }

const POINTS_KEY = 'unmyeongbom_points'
const MAX_HISTORY = 60

// 클라이언트(src/utils/points.ts)에서 실제로 지급/차감하는 (라벨, 금액) 조합과 동일하게 유지해야 한다.
// 클라이언트는 모든 포인트 계산을 직접 수행해 localStorage에 저장하므로, 여기서 다시 검증하지 않으면
// 누구나 devtools로 balance/history를 조작해 무제한 포인트를 만들 수 있다.
// dailyCap: 같은 날짜에 이 라벨이 나타날 수 있는 최대 횟수 / totalCap: 전체 히스토리에서의 누적 최대 횟수.
const POINT_RULES: Record<string, { amount: number; dailyCap?: number; totalCap?: number }> = {
  '가입 보너스 🎉':           { amount: 100, totalCap: 1 },
  '매일 출석 보너스':         { amount: 10,  dailyCap: 1 },
  '행운의 숫자 적중! 🎯':     { amount: 20,  dailyCap: 3 },
  '행운의 숫자 도전 ⏱️':      { amount: 5,   dailyCap: 3 },
  '정통사주 확인 ☯':         { amount: 5,   dailyCap: 1 },
  '심층 사주 해석 🔮':        { amount: 5,   dailyCap: 1 },
  '신년운세 확인 🗓️':        { amount: 5,   dailyCap: 1 },
  '오늘의 운세 확인 🔮':      { amount: 5,   dailyCap: 1 },
  '내일의 운세 확인 🔮':      { amount: 5,   dailyCap: 1 },
  '궁합 확인 💕':             { amount: 5,   dailyCap: 1 },
  '오늘의 코디 확인 👗':      { amount: 5,   dailyCap: 1 },
  '토정비결 확인 📖':         { amount: 5,   dailyCap: 1 },
  '대운 분석 확인 📊':        { amount: 5,   dailyCap: 1 },
  '취업운 확인 💼':           { amount: 5,   dailyCap: 1 },
  '꿈해몽 확인 💭':           { amount: 5,   dailyCap: 1 },
  '타로 상담 확인 🔮':        { amount: 5,   dailyCap: 1 },
  '심층 사주 전체 잠금 해제':  { amount: -50 },
  // 친구 초대(api/referral.ts)가 직접 지급하는 보너스. 라벨/금액이 여기 등록돼 있지 않으면
  // 다음 동기화 때 위조로 간주돼 history에서 사라진다.
  '친구 초대 보너스 🎁':       { amount: 50,  totalCap: 10 },
  '추천 코드 사용 보너스 🎁':   { amount: 30,  totalCap: 1 },
}

// 행운의 숫자 잡기는 적중/실패 라벨을 합쳐 하루 3회(LUCKY_TIMER_MAX_ATTEMPTS)까지만 허용된다.
const LUCKY_TIMER_LABELS = new Set(['행운의 숫자 적중! 🎯', '행운의 숫자 도전 ⏱️'])

function sanitizePointsHistory(rawHistory: unknown): PointsHistoryEntry[] {
  if (!Array.isArray(rawHistory)) return []

  const perDayLabelCount = new Map<string, number>()
  const totalLabelCount  = new Map<string, number>()
  const luckyTimerCount  = new Map<string, number>() // date -> count
  const clean: PointsHistoryEntry[] = []

  for (const raw of rawHistory) {
    if (clean.length >= MAX_HISTORY) break
    if (!raw || typeof raw !== 'object') continue
    const { date, amount, label } = raw as Record<string, unknown>
    if (typeof date !== 'string' || typeof amount !== 'number' || typeof label !== 'string') continue

    const rule = POINT_RULES[label]
    if (!rule || rule.amount !== amount) continue // 알려진 (라벨, 금액) 조합이 아니면 위조로 간주해 버린다

    const dayKey = `${date}__${label}`
    const dayCount = (perDayLabelCount.get(dayKey) ?? 0) + 1
    if (rule.dailyCap && dayCount > rule.dailyCap) continue

    const totalCount = (totalLabelCount.get(label) ?? 0) + 1
    if (rule.totalCap && totalCount > rule.totalCap) continue

    if (LUCKY_TIMER_LABELS.has(label)) {
      const lc = (luckyTimerCount.get(date) ?? 0) + 1
      if (lc > 3) continue
      luckyTimerCount.set(date, lc)
    }

    perDayLabelCount.set(dayKey, dayCount)
    totalLabelCount.set(label, totalCount)
    clean.push({ date, amount, label })
  }

  return clean
}

// balance는 클라이언트가 보낸 값을 신뢰하지 않고 검증된 history의 합으로 다시 계산한다.
function sanitizePointsData(raw: unknown): PointsState | null {
  if (!raw || typeof raw !== 'object') return null
  const p = raw as Partial<PointsState>
  if (typeof p.lastDaily !== 'string') return null

  const history = sanitizePointsHistory(p.history)
  const balance = history.reduce((sum, h) => sum + h.amount, 0)
  if (balance < 0) return null

  return { balance, lastDaily: p.lastDaily, history }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { idToken, provider, action, data } = (req.body ?? {}) as {
    idToken?: string
    provider?: string
    action?: 'pull' | 'push' | 'delete'
    data?: Record<string, unknown>
  }

  if (!idToken || (action !== 'pull' && action !== 'push' && action !== 'delete')) {
    return res.status(400).json({ error: 'invalid request' })
  }

  let email: string | null
  try {
    email = await verifyAuthToken(idToken, provider)
  } catch (e) {
    if (e instanceof AuthProviderUnreachableError) {
      // 구글/카카오 인증 서버에 일시적으로 닿지 않은 경우다. 토큰이 무효라고 단정할 수 없으므로
      // 401로 처리해 강제 로그아웃시키지 않고, 클라이언트가 재시도할 수 있는 503으로 응답한다.
      return res.status(503).json({ error: 'auth provider unreachable' })
    }
    console.error('인증 토큰 검증 중 오류:', e)
    return res.status(500).json({ error: 'auth verification failed' })
  }
  if (!email) return res.status(401).json({ error: 'invalid token' })

  const supabaseUrl  = process.env.VITE_SUPABASE_URL
  const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'server not configured' })
  }
  const supabase = createClient(supabaseUrl, serviceKey)

  // 회원 탈퇴: 본인 인증된 email에 연결된 모든 서버 데이터를 영구 삭제한다.
  // (Google Play "앱 내 계정/데이터 삭제" 정책 충족)
  if (action === 'delete') {
    const { error: e1 } = await supabase.from('user_data').delete().eq('email', email)
    if (e1) return res.status(500).json({ error: e1.message })

    const { error: e2 } = await supabase.from('match_pool').delete().eq('email', email)
    if (e2) return res.status(500).json({ error: e2.message })

    const { error: e3 } = await supabase.from('referrals').delete().eq('referee_email', email)
    if (e3) return res.status(500).json({ error: e3.message })

    const { error: e4 } = await supabase.from('referrals').delete().eq('referrer_email', email)
    if (e4) return res.status(500).json({ error: e4.message })

    return res.status(200).json({ ok: true })
  }

  if (action === 'pull') {
    const { data: row, error } = await supabase
      .from('user_data')
      .select('data')
      .eq('email', email)
      .maybeSingle()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ data: row?.data ?? null })
  }

  // action === 'push'
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return res.status(400).json({ error: 'invalid data' })
  }

  const sanitized: Record<string, unknown> = { ...data }
  if (POINTS_KEY in sanitized) {
    const cleanPoints = sanitizePointsData(sanitized[POINTS_KEY])
    if (!cleanPoints) return res.status(400).json({ error: 'invalid points data' })
    sanitized[POINTS_KEY] = cleanPoints
  }

  const { error } = await supabase
    .from('user_data')
    .upsert({ email, data: sanitized, updated_at: new Date().toISOString() })

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ ok: true })
}
