/// <reference types="node" />
import { createClient } from '@supabase/supabase-js'
import { verifyAuthToken, AuthProviderUnreachableError } from './_auth'

// 사주매칭: 옵트인한 사용자 풀에서 무작위로 한 명을 뽑아 닉네임 + 생년월일시 + (선택)프로필 사진을 돌려준다.
// 이메일/이름/계정 사진 등 실제 신원 정보는 절대 클라이언트에 노출하지 않는다.
// photo는 사용자가 매칭용으로 직접 업로드한 썸네일일 뿐, 구글/카카오 계정 사진이 아니다.
// 궁합 점수 계산(calcGunghab)은 클라이언트가 받은 생년월일시로 직접 수행한다.

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

// 사용자가 직접 업로드한 작은 썸네일(data URL)만 허용한다. 용량 제한으로 남용을 방지한다.
function isValidPhoto(p: unknown): p is string | null {
  if (p === null || p === undefined) return true
  return typeof p === 'string' && p.startsWith('data:image/') && p.length <= 300000
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { idToken, provider, action, nickname, birth, photo } = (req.body ?? {}) as {
    idToken?: string
    provider?: string
    action?: 'join' | 'leave' | 'draw'
    nickname?: string
    birth?: unknown
    photo?: string | null
  }

  if (!idToken || (action !== 'join' && action !== 'leave' && action !== 'draw')) {
    return res.status(400).json({ error: 'invalid request' })
  }

  let email: string | null
  try {
    email = await verifyAuthToken(idToken, provider)
  } catch (e) {
    if (e instanceof AuthProviderUnreachableError) {
      return res.status(503).json({ error: 'auth provider unreachable' })
    }
    console.error('인증 토큰 검증 중 오류:', e)
    return res.status(500).json({ error: 'auth verification failed' })
  }
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
    if (!isValidPhoto(photo)) return res.status(400).json({ error: 'invalid photo' })

    const { error } = await supabase.from('match_pool').upsert({
      email,
      nickname: nickname.trim(),
      year: birth.year, month: birth.month, day: birth.day,
      hour: birth.hour, minute: birth.minute, gender: birth.gender,
      photo: photo ?? null,
      updated_at: new Date().toISOString(),
    })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  // action === 'draw'
  const { data: rows, error } = await supabase
    .from('match_pool')
    .select('nickname, year, month, day, hour, minute, gender, photo')
    .neq('email', email)
    .limit(50)

  if (error) return res.status(500).json({ error: error.message })
  if (!rows || rows.length === 0) return res.status(200).json({ opponent: null })

  const pick = rows[Math.floor(Math.random() * rows.length)]
  return res.status(200).json({
    opponent: {
      nickname: pick.nickname,
      photo: pick.photo ?? null,
      birth: {
        year: pick.year, month: pick.month, day: pick.day,
        hour: pick.hour, minute: pick.minute, gender: pick.gender,
      },
    },
  })
}
