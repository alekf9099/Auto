/// <reference types="node" />
import { randomBytes } from 'crypto'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { verifyAuthToken } from '../lib/auth.js'

// 친구 초대: 사용자마다 추천 코드를 하나씩 발급하고, 다른 사람이 그 코드를 입력하면
// 둘 다 포인트를 받는다. 포인트는 클라이언트가 스스로 지급할 수 없도록 서버가 직접
// user_data.data를 갱신해 지급한다 (api/sync.ts의 POINT_RULES에도 같은 라벨/금액을 등록해야
// 클라이언트가 이후 동기화할 때 이 내역이 위조로 간주돼 사라지지 않는다).

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 헷갈리는 0/O, 1/I는 뺀다
const CODE_LENGTH = 6
const REFERRER_BONUS = { amount: 50, label: '친구 초대 보너스 🎁' }
const REFEREE_BONUS = { amount: 30, label: '추천 코드 사용 보너스 🎁' }
const MAX_HISTORY = 60

interface PointsHistoryEntry { date: string; amount: number; label: string }
interface PointsState { balance: number; lastDaily: string; history: PointsHistoryEntry[] }

function generateCode(): string {
  const bytes = randomBytes(CODE_LENGTH)
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i++) code += CODE_CHARS[bytes[i] % CODE_CHARS.length]
  return code
}

function loadPoints(data: Record<string, unknown>): PointsState {
  const p = data['unmyeongbom_points'] as Partial<PointsState> | undefined
  if (!p || typeof p !== 'object' || !Array.isArray(p.history)) {
    return { balance: 0, lastDaily: '', history: [] }
  }
  return { balance: typeof p.balance === 'number' ? p.balance : 0, lastDaily: p.lastDaily ?? '', history: p.history }
}

async function awardBonus(supabase: SupabaseClient, email: string, amount: number, label: string): Promise<void> {
  const { data: row } = await supabase.from('user_data').select('data').eq('email', email).maybeSingle()
  const current = (row?.data ?? {}) as Record<string, unknown>
  const points = loadPoints(current)
  const history = [{ date: new Date().toISOString().slice(0, 10), amount, label }, ...points.history].slice(0, MAX_HISTORY)
  const balance = history.reduce((sum, h) => sum + h.amount, 0)
  const nextData = { ...current, unmyeongbom_points: { balance, lastDaily: points.lastDaily, history } }
  await supabase.from('user_data').upsert({ email, data: nextData, updated_at: new Date().toISOString() })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { idToken, provider, action, code } = (req.body ?? {}) as {
    idToken?: string
    provider?: string
    action?: 'code' | 'redeem'
    code?: string
  }

  if (!idToken || (action !== 'code' && action !== 'redeem')) {
    return res.status(400).json({ error: 'invalid request' })
  }

  const email = await verifyAuthToken(idToken, provider)
  if (!email) return res.status(401).json({ error: 'invalid token' })

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'server not configured' })
  }
  const supabase = createClient(supabaseUrl, serviceKey)

  const { data: existingReferral } = await supabase
    .from('referrals').select('referee_email').eq('referee_email', email).maybeSingle()
  const alreadyRedeemed = !!existingReferral

  if (action === 'code') {
    const { data: row } = await supabase.from('user_data').select('referral_code').eq('email', email).maybeSingle()
    if (row?.referral_code) return res.status(200).json({ code: row.referral_code, alreadyRedeemed })

    for (let i = 0; i < 5; i++) {
      const candidate = generateCode()
      const { error } = await supabase.from('user_data').upsert({ email, referral_code: candidate })
      if (!error) return res.status(200).json({ code: candidate, alreadyRedeemed })
      if (error.code !== '23505') return res.status(500).json({ error: error.message })
    }
    return res.status(500).json({ error: 'failed to generate referral code' })
  }

  // action === 'redeem'
  if (alreadyRedeemed) return res.status(200).json({ ok: false, reason: 'already_redeemed' })

  const trimmedCode = typeof code === 'string' ? code.trim().toUpperCase() : ''
  if (!trimmedCode || trimmedCode.length > 12) return res.status(400).json({ error: 'invalid code' })

  const { data: referrerRow, error: lookupError } = await supabase
    .from('user_data').select('email').eq('referral_code', trimmedCode).maybeSingle()
  if (lookupError) return res.status(500).json({ error: lookupError.message })
  if (!referrerRow) return res.status(200).json({ ok: false, reason: 'invalid_code' })
  if (referrerRow.email === email) return res.status(200).json({ ok: false, reason: 'self_referral' })

  const { error: insertError } = await supabase
    .from('referrals').insert({ referee_email: email, referrer_email: referrerRow.email, code: trimmedCode })
  if (insertError) {
    if (insertError.code === '23505') return res.status(200).json({ ok: false, reason: 'already_redeemed' })
    return res.status(500).json({ error: insertError.message })
  }

  await awardBonus(supabase, referrerRow.email, REFERRER_BONUS.amount, REFERRER_BONUS.label)
  await awardBonus(supabase, email, REFEREE_BONUS.amount, REFEREE_BONUS.label)

  return res.status(200).json({ ok: true })
}
