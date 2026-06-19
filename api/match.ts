/// <reference types="node" />
import { createClient } from '@supabase/supabase-js'

// 사주매칭: 옵트인한 사용자 풀에서 무작위로 한 명을 뽑아 닉네임 + 생년월일시만 돌려준다.
// 이메일/이름/사진 등 신원 정보는 절대 클라이언트에 노출하지 않는다.
// 궁합 점수 계산(calcGunghab)은 클라이언트가 받은 생년월일시로 직접 수행한다.

interface GoogleTokenInfo {
  aud: string
  email: string
  email_verified: string | boolean
  exp: string
}

interface MatchBirth {
  year: number
  month: number
  day: number
  hour: number | null
  minute: number | null
  gender: 'male' | 'female'
}

function isValidBirth(b: unknown): b is MatchBirth {
  if (!b || typeof b !== 'object') return false
  const v = b as Record<string, unknown>
  if (typeof v.year !== 'number' || v.year < 1900 || v.year > 2100) return false
  if (typeof v.month !== 'number' || v.month < 1 || v.month > 12) return false
  if (typeof v.day !== 'number' || v.day < 1 || v.day > 31) return false
  if (v.hour !== null && (typeof v.hour !== 'number' || v.hour < 0 || v.hour > 23)) return false
  if (v.minute !== null && (typeof v.minute !== 'number' || v.minute < 0 || v.minute > 59)) return false
  if (v.gender !== 'male' && v.gender !== 'female') return false
  return true
}

function isValidNickname(n: unknown): n is string {
  return typeof n === 'string' && n.trim().length >= 2 && n.trim().length <= 10
}

async function verifyGoogleToken(idToken: string): Promise<string | null> {
  const clientId = process.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) return null

  const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`)
  if (!resp.ok) return null

  const info = (await resp.json()) as GoogleTokenInfo
  if (info.aud !== clientId) return null
  if (info.email_verified !== 'true' && info.email_verified !== true) return null
  if (!info.email) return null

  return info.email
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { idToken, action, nickname, birth } = (req.body ?? {}) as {
    idToken?: string
    action?: 'join' | 'leave' | 'draw'
    nickname?: string
    birth?: unknown
  }

  if (!idToken || (action !== 'join' && action !== 'leave' && action !== 'draw')) {
    return res.status(400).json({ error: 'invalid request' })
  }

  const email = await verifyGoogleToken(idToken)
  if (!email) return res.status(401).json({ error: 'invalid token' })

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'server not configured' })
  }
  const supabase = createClient(supabaseUrl, serviceKey)

  if (action === 'leave') {
    const { error } = await supabase.from('match_pool').delete().eq('email', email)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  if (action === 'join') {
    if (!isValidNickname(nickname)) return res.status(400).json({ error: 'invalid nickname' })
    if (!isValidBirth(birth)) return res.status(400).json({ error: 'invalid birth' })

    const { error } = await supabase.from('match_pool').upsert({
      email,
      nickname: nickname.trim(),
      year: birth.year, month: birth.month, day: birth.day,
      hour: birth.hour, minute: birth.minute, gender: birth.gender,
      updated_at: new Date().toISOString(),
    })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  // action === 'draw'
  const { data: rows, error } = await supabase
    .from('match_pool')
    .select('nickname, year, month, day, hour, minute, gender')
    .neq('email', email)
    .limit(50)

  if (error) return res.status(500).json({ error: error.message })
  if (!rows || rows.length === 0) return res.status(200).json({ opponent: null })

  const pick = rows[Math.floor(Math.random() * rows.length)]
  return res.status(200).json({
    opponent: {
      nickname: pick.nickname,
      birth: {
        year: pick.year, month: pick.month, day: pick.day,
        hour: pick.hour, minute: pick.minute, gender: pick.gender,
      },
    },
  })
}
