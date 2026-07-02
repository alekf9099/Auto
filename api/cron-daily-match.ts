/// <reference types="node" />
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

// 매일 1회(Vercel Cron) 매칭 풀에 참여 중이고 알림을 켠 사용자에게
// "오늘의 추천 인연이 도착했어요" 푸시를 보낸다. 실제 추천 상대는 앱에서
// /api/match(daily)로 조회하므로, 이 크론은 재방문을 유도하는 알림만 담당한다.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
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

  // 매칭 풀 참여자 (추천할 상대가 최소 2명 이상 있어야 의미가 있다)
  const { data: pool } = await supabase.from('match_pool').select('email, nickname')
  if (!pool || pool.length <= 1) return res.status(200).json({ sent: 0, reason: 'pool too small' })
  const optedEmails = new Set(pool.map(p => p.email))
  const nickByEmail = new Map(pool.map(p => [p.email, p.nickname as string | null]))

  // 알림 켠 구독자 중 매칭 풀 참여자에게만 발송
  const { data: subs, error } = await supabase
    .from('push_subscriptions').select('email, subscription').eq('enabled', true)
  if (error) return res.status(500).json({ error: error.message })
  const targets = (subs ?? []).filter(s => optedEmails.has(s.email))
  if (targets.length === 0) return res.status(200).json({ sent: 0 })

  let sent = 0
  let removed = 0
  await Promise.allSettled(
    targets.map(async (s) => {
      const nick = nickByEmail.get(s.email)
      const payload = JSON.stringify({
        title: '💞 오늘의 추천 인연이 도착했어요',
        body: `${nick ? nick + '님, ' : ''}오늘 당신과 이어진 사주는? 지금 궁합을 확인해보세요`,
        url: '/?go=match',
      })
      try {
        await webpush.sendNotification(s.subscription as webpush.PushSubscription, payload)
        sent++
      } catch (e: unknown) {
        const code = (e as { statusCode?: number }).statusCode
        if (code === 404 || code === 410) {
          await supabase.from('push_subscriptions').delete().eq('email', s.email)
          removed++
        }
      }
    })
  )

  return res.status(200).json({ sent, removed, total: targets.length })
}
