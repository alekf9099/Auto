/// <reference types="node" />
import { createClient } from '@supabase/supabase-js'

// 구글 ID 토큰을 서버에서 검증한 뒤, service_role 키로만 사용자 데이터에 접근한다.
// 클라이언트(anon 키)는 user_data 테이블에 직접 접근할 수 없다.

interface GoogleTokenInfo {
  aud: string
  email: string
  email_verified: string | boolean
  exp: string
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

  const { idToken, action, data } = (req.body ?? {}) as {
    idToken?: string
    action?: 'pull' | 'push'
    data?: Record<string, unknown>
  }

  if (!idToken || (action !== 'pull' && action !== 'push')) {
    return res.status(400).json({ error: 'invalid request' })
  }

  const email = await verifyGoogleToken(idToken)
  if (!email) return res.status(401).json({ error: 'invalid token' })

  const supabaseUrl  = process.env.VITE_SUPABASE_URL
  const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'server not configured' })
  }
  const supabase = createClient(supabaseUrl, serviceKey)

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
  const { error } = await supabase
    .from('user_data')
    .upsert({ email, data: data ?? {}, updated_at: new Date().toISOString() })

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ ok: true })
}
