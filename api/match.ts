/// <reference types="node" />
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import webpush from 'web-push'
import { verifyAuthToken, AuthProviderUnreachableError } from '../lib/auth.js'

// 하루에 보낼 수 있는 좋아요 수 (스팸/어뷰징 방지)
const DAILY_LIKE_LIMIT = 10
// 메시지 1건 최대 길이
const MESSAGE_MAX_LEN = 1000

// 매칭 성사 시 상대에게 보내는 푸시. VAPID/구독이 없으면 조용히 건너뛴다.
async function notifyMatch(supabase: SupabaseClient, email: string, partnerNick: string): Promise<void> {
  const vapidPublic = process.env.VITE_VAPID_PUBLIC_KEY
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@unmyeongbom.app'
  if (!vapidPublic || !vapidPrivate) return
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate)
    const { data: sub } = await supabase
      .from('push_subscriptions').select('subscription').eq('email', email).eq('enabled', true).maybeSingle()
    if (!sub?.subscription) return
    const payload = JSON.stringify({
      title: '💞 새로운 인연과 매칭됐어요!',
      body: `${partnerNick}님과 서로 좋아요를 보냈어요. 지금 대화를 시작해보세요`,
      url: '/?go=match',
    })
    await webpush.sendNotification(sub.subscription as webpush.PushSubscription, payload)
  } catch { /* 푸시는 부가 기능이라 실패해도 매칭 자체엔 영향 없음 */ }
}

// 새 메시지 도착 푸시
async function notifyMessage(supabase: SupabaseClient, email: string, senderNick: string, preview: string): Promise<void> {
  const vapidPublic = process.env.VITE_VAPID_PUBLIC_KEY
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@unmyeongbom.app'
  if (!vapidPublic || !vapidPrivate) return
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate)
    const { data: sub } = await supabase
      .from('push_subscriptions').select('subscription').eq('email', email).eq('enabled', true).maybeSingle()
    if (!sub?.subscription) return
    const payload = JSON.stringify({
      title: `💬 ${senderNick}님의 메시지`,
      body: preview.length > 40 ? preview.slice(0, 40) + '…' : preview,
      url: '/?go=match',
    })
    await webpush.sendNotification(sub.subscription as webpush.PushSubscription, payload)
  } catch { /* 푸시 실패는 무시 */ }
}

// 매칭 채널에 실시간 신호를 보낸다 (Realtime 브로드캐스트 REST API).
// 본문은 싣지 않는다 — 클라이언트가 받으면 인증된 경로로 재조회한다. 실패해도 폴링이 대체.
async function broadcastMatchEvent(matchId: string, event: string): Promise<void> {
  const url = process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return
  try {
    await fetch(`${url}/realtime/v1/api/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      body: JSON.stringify({ messages: [{ topic: `match:${matchId}`, event, payload: {}, private: false }] }),
    })
  } catch { /* 실시간 실패는 무시 */ }
}

// 두 사용자 사이에 차단이 존재하는지 (어느 방향이든)
async function isBlockedBetween(supabase: SupabaseClient, a: string, b: string): Promise<boolean> {
  const { data } = await supabase
    .from('blocks').select('blocker')
    .or(`and(blocker.eq.${a},blocked.eq.${b}),and(blocker.eq.${b},blocked.eq.${a})`)
    .limit(1)
  return !!(data && data.length > 0)
}

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

  const { idToken, provider, action, nickname, birth, photo, targetUserId, matchId, body, reason, score, grade } = (req.body ?? {}) as {
    idToken?: string
    provider?: string
    action?: 'join' | 'leave' | 'draw' | 'like' | 'matches' | 'messages' | 'send' | 'block' | 'report'
    nickname?: string
    birth?: unknown
    photo?: string | null
    targetUserId?: string
    matchId?: string
    body?: string
    reason?: string
    score?: number
    grade?: string
  }

  const VALID_ACTIONS = ['join', 'leave', 'draw', 'like', 'matches', 'messages', 'send', 'block', 'report']
  if (!idToken || !action || !VALID_ACTIONS.includes(action)) {
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
    }, { onConflict: 'email' })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  if (action === 'draw') {
    const { data: rows, error } = await supabase
      .from('match_pool')
      .select('user_id, nickname, year, month, day, hour, minute, gender, photo')
      .neq('email', email)
      .limit(50)

    if (error) return res.status(500).json({ error: error.message })
    if (!rows || rows.length === 0) return res.status(200).json({ opponent: null })

    // 내가 차단했거나 나를 차단한 상대는 후보에서 제외한다
    const { data: myRow } = await supabase
      .from('match_pool').select('user_id').eq('email', email).maybeSingle()
    let candidates = rows
    if (myRow?.user_id) {
      const { data: blockRows } = await supabase
        .from('blocks').select('blocker, blocked')
        .or(`blocker.eq.${myRow.user_id},blocked.eq.${myRow.user_id}`)
      const blockedIds = new Set((blockRows ?? []).flatMap(b => [b.blocker, b.blocked]))
      const filtered = rows.filter(r => !blockedIds.has(r.user_id))
      if (filtered.length > 0) candidates = filtered
      else return res.status(200).json({ opponent: null })
    }

    const pick = candidates[Math.floor(Math.random() * candidates.length)]
    return res.status(200).json({
      opponent: {
        userId: pick.user_id,
        nickname: pick.nickname,
        photo: pick.photo ?? null,
        birth: {
          year: pick.year, month: pick.month, day: pick.day,
          hour: pick.hour, minute: pick.minute, gender: pick.gender,
        },
      },
    })
  }

  // 내 익명 핸들(user_id) 조회 — 매칭 풀에 참여(join)한 상태여야 한다.
  const { data: me } = await supabase
    .from('match_pool').select('user_id, nickname').eq('email', email).maybeSingle()
  if (!me?.user_id) return res.status(400).json({ error: 'not in pool' })

  if (action === 'like') {
    if (typeof targetUserId !== 'string' || !/^[0-9a-f-]{36}$/i.test(targetUserId)) {
      return res.status(400).json({ error: 'invalid target' })
    }
    if (targetUserId === me.user_id) return res.status(400).json({ error: 'self like' })

    // 상대가 풀에 실재하는지 확인 + 이메일/닉네임 확보(푸시·정규화용)
    const { data: target } = await supabase
      .from('match_pool').select('email, nickname').eq('user_id', targetUserId).maybeSingle()
    if (!target?.email) return res.status(200).json({ ok: false, reason: 'gone' })

    // 하루 좋아요 한도 체크
    const todayStart = new Date(); todayStart.setUTCHours(0, 0, 0, 0)
    const { count } = await supabase
      .from('likes').select('*', { count: 'exact', head: true })
      .eq('from_user', me.user_id).gte('created_at', todayStart.toISOString())
    if ((count ?? 0) >= DAILY_LIKE_LIMIT) return res.status(200).json({ ok: false, reason: 'limit' })

    // 좋아요 기록 (중복이면 무시)
    const { error: likeErr } = await supabase
      .from('likes').upsert({ from_user: me.user_id, to_user: targetUserId }, { onConflict: 'from_user,to_user' })
    if (likeErr) return res.status(500).json({ error: likeErr.message })

    // 상대도 나를 좋아요 했는지 확인
    const { data: reciprocal } = await supabase
      .from('likes').select('from_user').eq('from_user', targetUserId).eq('to_user', me.user_id).maybeSingle()
    if (!reciprocal) return res.status(200).json({ ok: true, matched: false })

    // 상호 좋아요 → 매칭 성사 (user_a < user_b 정규화)
    const [ua, ub] = me.user_id < targetUserId ? [me.user_id, targetUserId] : [targetUserId, me.user_id]
    const { data: existing } = await supabase
      .from('matches').select('id').eq('user_a', ua).eq('user_b', ub).maybeSingle()
    if (existing) return res.status(200).json({ ok: true, matched: true, matchId: existing.id })

    const safeScore = typeof score === 'number' && score >= 0 && score <= 100 ? Math.round(score) : null
    const safeGrade = typeof grade === 'string' && grade.length <= 20 ? grade : null
    const { data: created, error: matchErr } = await supabase
      .from('matches').insert({ user_a: ua, user_b: ub, score: safeScore, grade: safeGrade }).select('id').single()
    if (matchErr) return res.status(500).json({ error: matchErr.message })

    // 양쪽에 매칭 푸시 (실패해도 매칭 자체엔 영향 없음)
    await Promise.allSettled([
      notifyMatch(supabase, target.email, me.nickname ?? '상대'),
      notifyMatch(supabase, email, target.nickname ?? '상대'),
    ])
    return res.status(200).json({ ok: true, matched: true, matchId: created.id })
  }

  if (action === 'matches') {
    // 내 활성 매칭 목록 (상대 닉네임/사진 + 안 읽은 메시지 수 포함)
    const { data: myMatches } = await supabase
      .from('matches').select('id, user_a, user_b, created_at, last_read_a, last_read_b, score, grade')
      .or(`user_a.eq.${me.user_id},user_b.eq.${me.user_id}`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (!myMatches || myMatches.length === 0) return res.status(200).json({ matches: [] })

    const partnerIds = myMatches.map(m => (m.user_a === me.user_id ? m.user_b : m.user_a))
    const { data: partners } = await supabase
      .from('match_pool').select('user_id, nickname, photo').in('user_id', partnerIds)
    const byId = new Map((partners ?? []).map(p => [p.user_id, p]))

    const matches = await Promise.all(myMatches.map(async m => {
      const iAmA = m.user_a === me.user_id
      const pid = iAmA ? m.user_b : m.user_a
      const p = byId.get(pid)
      // 안 읽은 수 = 내 마지막 읽음 이후 상대가 보낸 메시지
      const myLastRead = iAmA ? m.last_read_a : m.last_read_b
      let q = supabase.from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('match_id', m.id).neq('sender', me.user_id)
      if (myLastRead) q = q.gt('created_at', myLastRead)
      const { count } = await q
      return {
        matchId: m.id,
        createdAt: m.created_at,
        unread: count ?? 0,
        score: m.score ?? null,
        grade: m.grade ?? null,
        opponent: { userId: pid, nickname: p?.nickname ?? '알 수 없음', photo: p?.photo ?? null },
      }
    }))
    return res.status(200).json({ matches })
  }

  // ── 채팅/안전 액션 공용: 매칭 멤버십 확인 → 상대 user_id 반환 ──
  async function matchPartner(mid: unknown, requireActive: boolean): Promise<string | null> {
    if (typeof mid !== 'string' || !/^[0-9a-f-]{36}$/i.test(mid)) return null
    const { data: m } = await supabase
      .from('matches').select('user_a, user_b, status').eq('id', mid).maybeSingle()
    if (!m) return null
    if (requireActive && m.status !== 'active') return null
    if (m.user_a !== me.user_id && m.user_b !== me.user_id) return null
    return m.user_a === me.user_id ? m.user_b : m.user_a
  }

  if (action === 'messages') {
    if (typeof matchId !== 'string' || !/^[0-9a-f-]{36}$/i.test(matchId)) {
      return res.status(200).json({ messages: [], closed: true })
    }
    const { data: mrow } = await supabase
      .from('matches').select('user_a, user_b, status, last_read_a, last_read_b').eq('id', matchId).maybeSingle()
    if (!mrow || mrow.status !== 'active' || (mrow.user_a !== me.user_id && mrow.user_b !== me.user_id)) {
      return res.status(200).json({ messages: [], closed: true })
    }
    const iAmA = mrow.user_a === me.user_id
    const partnerLastRead = (iAmA ? mrow.last_read_b : mrow.last_read_a) ?? null

    const { data: rows, error } = await supabase
      .from('messages').select('id, sender, body, created_at')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true })
      .limit(300)
    if (error) return res.status(500).json({ error: error.message })

    // 대화를 보는 중 = 읽음. 내 쪽 읽음 시각을 현재로 갱신한다.
    const now = new Date().toISOString()
    await supabase.from('matches')
      .update(iAmA ? { last_read_a: now } : { last_read_b: now }).eq('id', matchId)

    const messages = (rows ?? []).map(r => ({
      id: r.id, body: r.body, mine: r.sender === me.user_id, createdAt: r.created_at,
    }))
    return res.status(200).json({ messages, closed: false, partnerLastRead })
  }

  if (action === 'send') {
    const text = typeof body === 'string' ? body.trim() : ''
    if (!text) return res.status(400).json({ error: 'empty message' })
    if (text.length > MESSAGE_MAX_LEN) return res.status(400).json({ error: 'message too long' })

    const partnerId = await matchPartner(matchId, true)
    if (!partnerId) return res.status(200).json({ ok: false, reason: 'closed' })
    if (await isBlockedBetween(supabase, me.user_id, partnerId)) {
      return res.status(200).json({ ok: false, reason: 'blocked' })
    }

    const { data: created, error } = await supabase
      .from('messages').insert({ match_id: matchId, sender: me.user_id, body: text })
      .select('id, created_at').single()
    if (error) return res.status(500).json({ error: error.message })

    // 실시간 신호(앱이 켜져 있으면 즉시 갱신) + 푸시(백그라운드). 둘 다 실패해도 전송엔 영향 없음.
    await broadcastMatchEvent(matchId as string, 'new_message')
    const { data: partner } = await supabase
      .from('match_pool').select('email').eq('user_id', partnerId).maybeSingle()
    if (partner?.email) await notifyMessage(supabase, partner.email, me.nickname ?? '상대', text)

    return res.status(200).json({
      ok: true,
      message: { id: created.id, body: text, mine: true, createdAt: created.created_at },
    })
  }

  if (action === 'block' || action === 'report') {
    const partnerId = await matchPartner(matchId, false)
    if (!partnerId) return res.status(400).json({ error: 'no match' })

    if (action === 'report') {
      await supabase.from('reports').insert({
        reporter: me.user_id, target: partnerId, match_id: matchId,
        reason: typeof reason === 'string' ? reason.slice(0, 500) : null,
      })
    }
    // 신고/차단 모두: 차단 기록 + 해당 매칭 종료
    await supabase.from('blocks').upsert(
      { blocker: me.user_id, blocked: partnerId }, { onConflict: 'blocker,blocked' }
    )
    await supabase.from('matches').update({ status: 'closed' }).eq('id', matchId)
    return res.status(200).json({ ok: true })
  }

  return res.status(400).json({ error: 'invalid request' })
}
