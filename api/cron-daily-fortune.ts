/// <reference types="node" />
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

// 매일 1회(Vercel Cron) 실행되어 알림을 켠 사용자에게 "오늘의 운세" 푸시를 보낸다.
// 상세 운세는 알림을 눌러 앱에서 확인하도록 유도한다(눌렀을 때 /?go=today 로 진입).

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  // Vercel Cron은 Authorization: Bearer <CRON_SECRET> 헤더를 보낸다.
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  const vapidPublic = process.env.VITE_VAPID_PUBLIC_KEY
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@unmyeongbom.app'
  if (!supabaseUrl || !serviceKey) return res.status(500).json({ error: 'server not configured' })
  if (!vapidPublic || !vapidPrivate) return res.status(500).json({ error: 'vapid not configured' })

  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate)
  const supabase = createClient(supabaseUrl, serviceKey)

  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('email, subscription')
    .eq('enabled', true)
  if (error) return res.status(500).json({ error: error.message })
  if (!subs || subs.length === 0) return res.status(200).json({ sent: 0 })

  // 닉네임으로 개인화 (있으면 "○○님, ...")
  const emails = subs.map(s => s.email)
  const nickById = new Map<string, string>()
  const { data: profiles } = await supabase.from('user_data').select('email, data').in('email', emails)
  for (const row of profiles ?? []) {
    const nick = (row.data && (row.data as Record<string, unknown>)['unmyeongbom_nickname']) as string | undefined
    if (nick) nickById.set(row.email, nick)
  }

  let sent = 0
  let removed = 0
  await Promise.allSettled(
    subs.map(async (s) => {
      const nick = nickById.get(s.email)
      const payload = JSON.stringify({
        title: '🔮 오늘의 운세가 도착했어요',
        body: `${nick ? nick + '님, ' : ''}오늘 하루는 어떤 기운일까요? 눌러서 자세히 확인하세요`,
        url: '/?go=today',
      })
      try {
        await webpush.sendNotification(s.subscription as webpush.PushSubscription, payload)
        sent++
      } catch (e: unknown) {
        const code = (e as { statusCode?: number }).statusCode
        // 만료/삭제된 구독은 정리한다.
        if (code === 404 || code === 410) {
          await supabase.from('push_subscriptions').delete().eq('email', s.email)
          removed++
        }
      }
    })
  )

  return res.status(200).json({ sent, removed, total: subs.length })
}
