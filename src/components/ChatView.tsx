import { useEffect, useRef, useState } from 'react'
import { loadMessages, sendMessage, blockMatch, reportMatch, type MatchEntry, type ChatMessage } from '../utils/match'

interface Props {
  match: MatchEntry
  onBack: () => void
  onEnded: () => void   // 차단/신고/종료로 매칭이 끝났을 때 (목록 갱신용)
}

const POLL_ACTIVE_MS = 1500  // 대화 활성 중 (거의 즉답 느낌)
const POLL_IDLE_MS = 4000    // 잠잠할 때 (부하 절감)

function MiniAvatar({ photo, label }: { photo: string | null; label: string }) {
  return photo ? (
    <img src={photo} alt={label} className="w-8 h-8 rounded-full object-cover shrink-0" />
  ) : (
    <div className="w-8 h-8 rounded-full bg-rose-400 flex items-center justify-center text-xs text-white font-bold shrink-0">
      {label[0] ?? '?'}
    </div>
  )
}

function timeLabel(iso: string): string {
  try {
    const d = new Date(iso)
    const h = d.getHours()
    const m = d.getMinutes().toString().padStart(2, '0')
    const ampm = h < 12 ? '오전' : '오후'
    const h12 = h % 12 === 0 ? 12 : h % 12
    return `${ampm} ${h12}:${m}`
  } catch { return '' }
}

export default function ChatView({ match, onBack, onEnded }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [closed, setClosed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [partnerLastRead, setPartnerLastRead] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const fetchingRef = useRef(false)
  const atBottomRef = useRef(true)
  const lastActivityRef = useRef(Date.now()) // 최근 활동(전송/수신) 시각 — 폴링 주기 조절용
  const lastMsgIdRef = useRef<string | null>(null)

  // 적응형 폴링: 최근 활동 후 잠시는 빠르게(1.5초), 잠잠하면 느리게(4초)
  useEffect(() => {
    let alive = true
    let timer: ReturnType<typeof setTimeout>
    async function poll() {
      if (!fetchingRef.current) {
        fetchingRef.current = true
        const { messages: msgs, closed: isClosed, partnerLastRead: plr } = await loadMessages(match.matchId)
        fetchingRef.current = false
        if (!alive) return
        const newest = msgs.length ? msgs[msgs.length - 1].id : null
        if (newest && newest !== lastMsgIdRef.current) {
          lastMsgIdRef.current = newest
          lastActivityRef.current = Date.now()
        }
        setMessages(msgs)
        setPartnerLastRead(plr)
        setClosed(isClosed)
        setLoading(false)
      }
      if (!alive) return
      const idle = Date.now() - lastActivityRef.current > 15000
      timer = setTimeout(poll, idle ? POLL_IDLE_MS : POLL_ACTIVE_MS)
    }
    poll()
    return () => { alive = false; clearTimeout(timer) }
  }, [match.matchId])

  // 내 메시지 중 상대가 읽은 가장 최근 것 (그 아래에 '읽음' 표시)
  const lastReadMineId = (() => {
    if (!partnerLastRead) return null
    const t = new Date(partnerLastRead).getTime()
    let id: string | null = null
    for (const m of messages) if (m.mine && new Date(m.createdAt).getTime() <= t) id = m.id
    return id
  })()

  // 새 메시지 도착 시 하단에 있었으면 자동 스크롤
  useEffect(() => {
    if (atBottomRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  function onScroll() {
    const el = scrollRef.current
    if (!el) return
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || sending || closed) return
    setSending(true)
    const res = await sendMessage(match.matchId, text)
    setSending(false)
    if (!res.ok) {
      if (res.reason === 'blocked' || res.reason === 'closed') {
        setClosed(true); setNotice('이 대화는 더 이상 메시지를 보낼 수 없어요'); onEnded()
      } else {
        setNotice('전송에 실패했어요. 잠시 후 다시 시도해주세요')
      }
      return
    }
    setInput('')
    atBottomRef.current = true
    lastActivityRef.current = Date.now() // 보낸 직후엔 빠른 폴링 유지
    if (res.message) {
      lastMsgIdRef.current = res.message.id
      setMessages(prev => [...prev.filter(m => m.id !== res.message!.id), res.message!])
    }
  }

  async function handleBlock() {
    setMenuOpen(false)
    if (!window.confirm(`${match.opponent.nickname}님을 차단할까요? 대화가 종료되고 다시 매칭되지 않아요.`)) return
    await blockMatch(match.matchId)
    onEnded()
    onBack()
  }

  async function handleReport() {
    setMenuOpen(false)
    const reason = window.prompt('신고 사유를 입력해주세요 (선택). 신고 시 상대는 차단되고 대화가 종료돼요.')
    if (reason === null) return // 취소
    await reportMatch(match.matchId, reason)
    onEnded()
    onBack()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0D0A1A]">
      {/* 헤더 */}
      <div className="bg-[#130E24] border-b border-[#2A1F4A] shrink-0">
        <div className="max-w-2xl mx-auto px-3 py-2.5 flex items-center gap-2">
          <button onClick={onBack} aria-label="뒤로 가기" className="text-[#A79CC2] hover:text-[#C4B8D8] transition text-lg px-1">←</button>
          <MiniAvatar photo={match.opponent.photo} label={match.opponent.nickname} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#F5EDD4] truncate">{match.opponent.nickname}</p>
            <p className="text-[10px] text-[#857AA0]">사주매칭으로 만난 익명의 인연</p>
          </div>
          <div className="relative">
            <button onClick={() => setMenuOpen(o => !o)} aria-label="더보기" className="text-[#A79CC2] hover:text-[#C4B8D8] transition px-2 text-lg">⋯</button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-9 z-20 w-32 bg-[#1C1438] border border-[#2A1F4A] rounded-xl overflow-hidden shadow-xl">
                  <button onClick={handleReport} className="w-full text-left px-4 py-2.5 text-xs text-[#E0A0A0] hover:bg-[#2A1F4A] transition">신고하기</button>
                  <button onClick={handleBlock} className="w-full text-left px-4 py-2.5 text-xs text-[#E05252] hover:bg-[#2A1F4A] transition border-t border-[#2A1F4A]">차단하기</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-5 h-5 rounded-full border-2 border-[#2A1F4A] border-t-[#C9962A] animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-3xl mb-3">💞</p>
              <p className="text-sm font-semibold text-[#F5EDD4]">{match.opponent.nickname}님과 매칭됐어요</p>
              <p className="text-xs text-[#A79CC2] mt-1.5">먼저 인사를 건네 대화를 시작해보세요</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {messages.map(m => (
                <div key={m.id}>
                  <div className={`flex items-end gap-1.5 ${m.mine ? 'justify-end' : 'justify-start'}`}>
                    {!m.mine && <span className="text-[9px] text-[#6E6489] mb-0.5">{timeLabel(m.createdAt)}</span>}
                    <div
                      className={`max-w-[72%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                        m.mine
                          ? 'bg-gradient-to-br from-[#C9962A] to-[#E8B84B] text-[#1A0E30] rounded-2xl rounded-br-md font-medium'
                          : 'bg-[#1C1438] text-[#E8DFF5] rounded-2xl rounded-bl-md border border-[#2A1F4A]'
                      }`}
                    >
                      {m.body}
                    </div>
                    {m.mine && <span className="text-[9px] text-[#6E6489] mb-0.5">{timeLabel(m.createdAt)}</span>}
                  </div>
                  {m.id === lastReadMineId && (
                    <p className="text-[9px] text-[#C9962A] text-right mt-0.5 pr-1">읽음</p>
                  )}
                </div>
              ))}
            </div>
          )}
          {closed && (
            <p className="text-center text-[11px] text-[#857AA0] mt-6">이 대화는 종료되었어요</p>
          )}
        </div>
      </div>

      {/* 입력창 */}
      <div className="shrink-0 bg-[#130E24] border-t border-[#2A1F4A] px-3 py-2.5">
        <div className="max-w-2xl mx-auto">
          {notice && <p className="text-[11px] text-[#E0A0A0] mb-1.5 px-1">{notice}</p>}
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={e => { setInput(e.target.value); setNotice(null) }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder={closed ? '종료된 대화예요' : '메시지를 입력하세요'}
              disabled={closed}
              rows={1}
              maxLength={1000}
              className="flex-1 resize-none max-h-28 px-4 py-2.5 rounded-2xl bg-[#1C1438] border border-[#2A1F4A] text-sm text-[#F5EDD4] placeholder-[#857AA0] focus:outline-none focus:border-[#C9962A] transition disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending || closed}
              className="shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-[#C9962A] to-[#E8B84B] text-[#1A0E30] flex items-center justify-center disabled:opacity-40 active:scale-95 transition"
              aria-label="전송"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 12l16-8-6 8 6 8-16-8z" fill="currentColor"/></svg>
            </button>
          </div>
          <p className="text-[10px] text-[#6E6489] mt-1.5 px-1 text-center">상대를 존중해주세요 · 불쾌한 행동은 ⋯ 메뉴에서 신고·차단할 수 있어요</p>
        </div>
      </div>
    </div>
  )
}
