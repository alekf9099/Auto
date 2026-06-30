import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'

// 사주매칭 채팅 실시간 레이어 (Supabase Realtime 브로드캐스트).
// 인증 흐름은 건드리지 않는다 — anon 키로 채널만 구독하며, 메시지 본문은 항상
// 인증된 /api/match 로 재조회한다. 브로드캐스트는 "갱신해라" 신호 + 타이핑 표시용일 뿐이다.
// VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 없으면 null 을 반환해 폴링으로 폴백된다.

let clientPromise: Promise<SupabaseClient | null> | null = null

async function getClient(): Promise<SupabaseClient | null> {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return null
  if (!clientPromise) {
    // 채팅 진입 시에만 supabase-js 를 동적 로드 (메인 번들에서 분리)
    clientPromise = import('@supabase/supabase-js')
      .then(({ createClient }) => createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      }))
      .catch(() => null)
  }
  return clientPromise
}

export interface MatchChannel {
  sendTyping: () => void
  sendRead: () => void
  close: () => void
}

export interface MatchChannelHandlers {
  onNewMessage: () => void
  onRead: () => void
  onTyping: () => void
}

// 매칭 채널 구독. 실패(키 없음/네트워크)하면 null 을 돌려준다.
export async function subscribeToMatch(matchId: string, handlers: MatchChannelHandlers): Promise<MatchChannel | null> {
  const client = await getClient()
  if (!client) return null
  try {
    const topic = `match:${matchId}`
    const channel: RealtimeChannel = client.channel(topic, { config: { broadcast: { self: false } } })
    channel
      .on('broadcast', { event: 'new_message' }, () => handlers.onNewMessage())
      .on('broadcast', { event: 'read' }, () => handlers.onRead())
      .on('broadcast', { event: 'typing' }, () => handlers.onTyping())
      .subscribe()
    const send = (event: string) => { try { channel.send({ type: 'broadcast', event, payload: {} }) } catch { /* noop */ } }
    return {
      sendTyping: () => send('typing'),
      sendRead: () => send('read'),
      close: () => { try { client.removeChannel(channel) } catch { /* noop */ } },
    }
  } catch {
    return null
  }
}
