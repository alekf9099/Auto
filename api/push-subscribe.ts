/// <reference types="node" />
import { createClient } from '@supabase/supabase-js'
import { verifyAuthToken, AuthProviderUnreachableError } from './_auth'

// 웹 푸시 구독 저장/해제. 본인 인증 토큰을 검증한 뒤 service_role 키로 push_subscriptions에 기록한다.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { idToken, provider, action, subscription } = (req.body ?? {}) as {
    idToken?: string
    provider?: string
    action?: 'subscribe' | 'unsubscribe'
    subscription?: unknown
  }

  if (!idToken || (action !== 'subscribe' && action !== 'unsubscribe')) {
    return res.status(400).json({ error: 'invalid request' })
  }

  let email: string | null
  try {
    email = await verifyAuthToken(idToken, provider)
  } catch (e) {
    if (e instanceof AuthProviderUnreachableError) return res.status(503).json({ error: 'auth provider unreachable' })
    return res.status(500).json({ error: 'auth verification failed' })
  }
  if (!email) return res.status(401).json({ error: 'invalid token' })

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) return res.status(500).json({ error: 'server not configured' })
  const supabase = createClient(supabaseUrl, serviceKey)

  if (action === 'unsubscribe') {
    const { error } = await supabase.from('push_subscriptions').update({ enabled: false, updated_at: new Date().toISOString() }).eq('email', email)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  // subscribe
  if (!subscription || typeof subscription !== 'object') return res.status(400).json({ error: 'invalid subscription' })
  const { error } = await supabase.from('push_subscriptions').upsert({
    email, subscription, enabled: true, updated_at: new Date().toISOString(),
  })
  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ ok: true })
}
