import { useState, useEffect } from 'react'
import type { BirthInput } from '../types'
import { calcGunghab, type GunghabResult } from '../utils/gunghab'
import { ELEMENT_LABELS, ELEMENT_COLORS } from '../utils/constants'
import { isOptedIn, joinMatchPool, leaveMatchPool, drawMatch, loadDailyPick, sendLike, loadMatches, loadMatchHistory, addMatchHistory, type MatchOpponent, type MatchHistoryEntry, type MatchEntry } from '../utils/match'
import { loadProfilePhoto } from '../utils/profilePhoto'
import { isPushSupported, isPushEnabled, enablePush } from '../utils/pushNotify'
import PointsClaimButton from './PointsClaimButton'
import ChatView from './ChatView'
import AnonAvatar from './AnonAvatar'
import ShareCardModal from './ShareCardModal'
import type { ShareCardData } from './ShareCardModal'
import { IcMatch, IcDraw, IcLoveLuck, IcLock, IcShare } from './icons/SajuIcons'

interface Props {
  nickname: string
  birthProfile: BirthInput
  onBack: () => void
  onInvite: () => void
}

const RANK_BADGE = ['#C9962A', '#BCB1D4', '#A79CC2']

// 두 일간 오행의 관계 — 사주매칭다움을 살리는 근거 배지
const OHAENG_REL = {
  '생': { label: '상생', sub: '서로를 살려주는 기운', color: '#4BBF7E' },
  '극': { label: '상극', sub: '부딪히며 배우는 기운', color: '#E0738A' },
  '동': { label: '비화', sub: '같은 기운, 닮은 결',   color: '#C9962A' },
} as const

function OhaengMatchBadge({ result }: { result: GunghabResult }) {
  const rel = OHAENG_REL[result.elementRelation]
  const ca = ELEMENT_COLORS[result.elementA]
  const cb = ELEMENT_COLORS[result.elementB]
  const pill = (color: string, label: string) => (
    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap"
      style={{ color, backgroundColor: color + '1F', border: `1px solid ${color}55` }}>
      {label}
    </span>
  )
  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      <div className="flex items-center justify-center gap-2">
        {pill(ca, ELEMENT_LABELS[result.elementA])}
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color: rel.color, backgroundColor: rel.color + '1A' }}>
          {result.elementRelation === '동' ? '=' : '↔'} {rel.label}
        </span>
        {pill(cb, ELEMENT_LABELS[result.elementB])}
      </div>
      <p className="text-center text-[11px] text-violet-200/70 mt-2">일간 오행 {rel.label} · {rel.sub}</p>
    </div>
  )
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}


export default function MatchPage({ nickname, birthProfile, onBack, onInvite }: Props) {
  const [myPhoto] = useState<string | null>(loadProfilePhoto)
  const [optedIn, setOptedInState] = useState(isOptedIn)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [poolEmpty, setPoolEmpty] = useState(false)
  const [notifyOn, setNotifyOn] = useState(() => (typeof window !== 'undefined' ? isPushEnabled() : false))
  const [opponent, setOpponent] = useState<MatchOpponent | null>(null)
  const [result, setResult] = useState<GunghabResult | null>(null)
  const [history, setHistory] = useState<MatchHistoryEntry[]>(loadMatchHistory)
  const [matchRevealed, setMatchRevealed] = useState(false)

  // 좋아요 / 매칭 성사 상태 (현재 뽑은 상대 기준)
  const [liked, setLiked] = useState(false)
  const [likeBusy, setLikeBusy] = useState(false)
  const [likeMsg, setLikeMsg] = useState<string | null>(null)
  const [matchedNow, setMatchedNow] = useState(false)
  const [matches, setMatches] = useState<MatchEntry[]>([])
  const [chatMatch, setChatMatch] = useState<MatchEntry | null>(null)
  const [showShare, setShowShare] = useState(false)
  const [dailyPick, setDailyPick] = useState<MatchOpponent | null>(null)
  const [dailyViewed, setDailyViewed] = useState(() => { try { return localStorage.getItem('unmyeongbom_daily_viewed') === today() } catch { return false } })

  // 궁합 결과 공유 카드 데이터 (상대 닉네임은 넣지 않아 익명 유지)
  const shareData: ShareCardData | null = result ? {
    badge: '사주궁합',
    Icon: IcMatch,
    iconColor: '#E05282',
    title: result.grade,
    date: (() => { const n = new Date(); return `${n.getFullYear()}.${String(n.getMonth() + 1).padStart(2, '0')}.${String(n.getDate()).padStart(2, '0')}` })(),
    highlight: result.headline,
    items: [
      { label: '궁합 점수', value: `${result.total}%` },
      { label: '오행 관계', value: `${ELEMENT_LABELS[result.elementA]} ${OHAENG_REL[result.elementRelation].label} ${ELEMENT_LABELS[result.elementB]}` },
    ],
    accent: '#E05282',
    footer: '사주매칭 · 운명봄',
  } : null

  useEffect(() => {
    setError(null)
  }, [optedIn])

  // 참여 중이면 내 매칭 목록 + 오늘의 추천 인연을 불러온다
  useEffect(() => {
    if (optedIn) {
      loadMatches().then(setMatches)
      loadDailyPick().then(setDailyPick)
    }
  }, [optedIn])

  // 뽑을 때마다 카드를 엎었다가 3D로 뒤집어 매칭 상대를 공개
  useEffect(() => {
    if (!result || !opponent) return
    setMatchRevealed(false)
    const t = setTimeout(() => setMatchRevealed(true), 480)
    return () => clearTimeout(t)
  }, [opponent, result])

  async function handleJoin() {
    setBusy(true)
    setError(null)
    const { ok, error: serverError } = await joinMatchPool(nickname, birthProfile)
    setBusy(false)
    if (ok) setOptedInState(true)
    else setError(`참여에 실패했어요. 잠시 후 다시 시도해주세요.${serverError ? ` (${serverError})` : ''}`)
  }

  async function handleLeave() {
    setBusy(true)
    setError(null)
    const { ok, error: serverError } = await leaveMatchPool()
    setBusy(false)
    if (ok) {
      setOptedInState(false)
      setOpponent(null)
      setResult(null)
    } else {
      setError(`나가기에 실패했어요. 잠시 후 다시 시도해주세요.${serverError ? ` (${serverError})` : ''}`)
    }
  }

  async function handleDraw() {
    setBusy(true)
    setError(null)
    setPoolEmpty(false)
    setOpponent(null)
    setResult(null)
    setLiked(false)
    setLikeMsg(null)
    setMatchedNow(false)
    const opp = await drawMatch()
    setBusy(false)
    if (!opp) {
      setPoolEmpty(true)   // 에러가 아니라 "아직 인연을 기다리는 중" 상태로 안내
      return
    }
    const r = calcGunghab(birthProfile, opp.birth, 'friend')
    setOpponent(opp)
    setResult(r)
    setHistory(addMatchHistory({ nickname: opp.nickname, photo: opp.photo, score: r.total, grade: r.grade, date: today() }))
    window.scrollTo(0, 0)
  }

  // 오늘의 추천 인연 궁합 열어보기
  function openDaily() {
    if (!dailyPick) return
    const r = calcGunghab(birthProfile, dailyPick.birth, 'friend')
    setOpponent(dailyPick)
    setResult(r)
    setPoolEmpty(false)
    setLiked(false)
    setLikeMsg(null)
    setMatchedNow(false)
    setHistory(addMatchHistory({ nickname: dailyPick.nickname, photo: dailyPick.photo, score: r.total, grade: r.grade, date: today() }))
    try { localStorage.setItem('unmyeongbom_daily_viewed', today()) } catch { /* noop */ }
    setDailyViewed(true)
    window.scrollTo(0, 0)
  }

  async function handleLike() {
    if (!opponent || likeBusy || liked) return
    setLikeBusy(true)
    setLikeMsg(null)
    const res = await sendLike(opponent.userId, result?.total, result?.grade)
    setLikeBusy(false)
    if (!res.ok) {
      if (res.reason === 'limit') setLikeMsg(`오늘 좋아요를 모두 사용했어요. 내일 다시 보낼 수 있어요`)
      else if (res.reason === 'gone') setLikeMsg('상대가 매칭 풀에서 나갔어요')
      else setLikeMsg('좋아요 전송에 실패했어요. 잠시 후 다시 시도해주세요')
      return
    }
    setLiked(true)
    if (res.matched) {
      setMatchedNow(true)
      loadMatches().then(setMatches) // 매칭 목록 갱신
    }
  }

  async function handleEnableNotify() {
    if (notifyOn) return
    const r = await enablePush()
    if (r.ok) setNotifyOn(true)
  }

  const ranking = [...history].sort((a, b) => b.score - a.score).slice(0, 10)

  return (
    <div className="min-h-screen">
      {chatMatch && (
        <ChatView
          match={chatMatch}
          onBack={() => { setChatMatch(null); loadMatches().then(setMatches) }}
          onEnded={() => loadMatches().then(setMatches)}
        />
      )}
      {showShare && shareData && <ShareCardModal data={shareData} onClose={() => setShowShare(false)} />}
      <div className="bg-[#130E24] border-b border-[#2A1F4A] sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} aria-label="뒤로 가기" className="text-[#A79CC2] hover:text-[#C4B8D8] transition text-lg">←</button>
          <div>
            <h1 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>사주매칭</h1>
            <p className="text-xs text-[#A79CC2]">익명의 인연과 닉네임으로 궁합을 확인해보세요</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* 히어로 배너 — 참여 중일 때만 (미참여 시엔 아래 온보딩이 히어로 역할) */}
        {optedIn && (
        <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-6 shadow-xl shadow-[#000]/40 border border-[#C9962A25] relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-violet-400/15 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-rose-500/15 blur-2xl" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-violet-300/85 text-xs mb-2">옵트인 사용자 풀 · 무작위 매칭</p>
              <p className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Gowun Batang', serif" }}>사주매칭</p>
              <p className="text-sm text-violet-300/80 leading-relaxed">닉네임으로만 만나는<br/>무작위 인연과의 궁합</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-[#C9962A15] border border-[#C9962A30] flex items-center justify-center shrink-0">
              <IcMatch size={32} className="text-[#C9962A]" />
            </div>
          </div>
        </div>
        )}

        {/* 오늘의 추천 인연 — 하루 1명, 재방문 후크 */}
        {optedIn && dailyPick && !result && (
          <button
            onClick={openDaily}
            className="w-full relative overflow-hidden rounded-3xl border p-4 flex items-center gap-3.5 active:scale-[0.99] transition-all"
            style={{ borderColor: '#C9962A55', background: 'linear-gradient(135deg, #2A1F10 0%, #1A0E30 55%, #120A22 100%)', boxShadow: '0 2px 22px rgba(201,150,42,0.18)' }}
          >
            <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(201,150,42,0.4), transparent 70%)' }} />
            <AnonAvatar seed={dailyPick.userId} photo={dailyPick.photo} size={48} />
            <div className="relative flex-1 text-left min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[#E8C75C] text-[10px]">✦</span>
                <p className="text-[10px] font-bold text-[#E8C75C] tracking-wide">오늘의 추천 인연</p>
                {!dailyViewed && <span className="text-[8px] font-bold text-white bg-[#E05282] px-1.5 py-0.5 rounded-full">NEW</span>}
              </div>
              <p className="text-[15px] font-bold text-[#F5EDD4] mt-0.5 truncate" style={{ fontFamily: "'Gowun Batang', serif" }}>{dailyPick.nickname}</p>
              <p className="text-[11px] text-[#BCB1D4] truncate">오늘 당신과 이어진 사주, 궁합을 확인해보세요</p>
            </div>
            <span className="relative text-xs font-bold text-[#E8C75C] shrink-0">{dailyViewed ? '다시 보기' : '확인 →'}</span>
          </button>
        )}

        {/* 참여 전 — 컨셉 온보딩 */}
        {!optedIn ? (
          <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(224,82,130,0.10)] p-6">
            <div className="text-center">
              <span className="inline-flex w-14 h-14 rounded-2xl items-center justify-center bg-[#E0528218] border border-[#E0528240] text-[#E05282] mb-3">
                <IcMatch size={30} />
              </span>
              <h2 className="text-lg font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>사주로 만나는 익명의 인연</h2>
              <p className="text-xs text-[#BCB1D4] mt-2 leading-relaxed">이름도 얼굴도 몰라도 괜찮아요.<br/>사주 궁합으로 먼저 통하는 사람을 만나보세요.</p>
            </div>

            <div className="mt-5 space-y-2">
              {[
                { n: 1, t: '매칭 뽑기',          s: '익명의 인연을 뽑고 사주 궁합을 확인' },
                { n: 2, t: '마음에 들면 좋아요',  s: '호감이 가면 좋아요를 보내요' },
                { n: 3, t: '서로 좋아요면 채팅',  s: '양쪽 다 좋아요하면 대화가 열려요' },
              ].map(step => (
                <div key={step.n} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-[#1C1438]">
                  <span className="w-7 h-7 rounded-full bg-[#E0528222] border border-[#E0528266] text-[#E05282] text-sm font-bold flex items-center justify-center shrink-0">{step.n}</span>
                  <div>
                    <p className="text-sm font-semibold text-[#F5EDD4]">{step.t}</p>
                    <p className="text-[11px] text-[#A79CC2] mt-0.5">{step.s}</p>
                  </div>
                </div>
              ))}
            </div>

            {error && <p className="text-xs text-rose-400 mt-3 text-center">{error}</p>}
            <button onClick={handleJoin} disabled={busy || !nickname} className="w-full mt-5 py-4 rounded-2xl font-bold text-white text-sm bg-gradient-to-r from-[#E05282] to-[#C9962A] shadow-lg shadow-[#E0528230] active:scale-[0.98] transition-all disabled:opacity-50">
              {busy ? '시작하는 중...' : '매칭 시작하기'}
            </button>
            {!nickname && <p className="text-[11px] text-center text-[#857AA0] mt-2">프로필에 닉네임을 먼저 등록해주세요</p>}
            <p className="text-[11px] text-[#857AA0] text-center mt-3 leading-relaxed flex items-center justify-center gap-1.5">
              <IcLock size={12} /> 이메일·실명·계정 사진은 공개되지 않아요 · 언제든 나갈 수 있어요
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-2">
            {/* 🔮 천상의 요람(Celestial Cradle) 반투명 오로라 박스 */}
            <div className="relative w-full rounded-3xl bg-[#130E24]/60 backdrop-blur-xl border border-[#C9962A]/30 p-8 flex flex-col items-center justify-center text-center overflow-hidden shadow-[0_0_30px_rgba(201,150,42,0.15)]">
              
              {/* 박스 내부 은은한 오로라 광채 이펙트 */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#C9962A]/10 rounded-full blur-3xl pointer-events-none" />

              {/* 🧭 실시간 탐색 동심원 펄스 애니메이션 */}
              <div className="relative flex items-center justify-center w-28 h-28 mb-6">
                <div className="absolute inset-0 rounded-full border border-[#C9962A]/40 animate-ping opacity-25" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-3 rounded-full border border-[#C9962A]/30 animate-ping opacity-40" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-6 rounded-full border border-violet-400/20 animate-pulse" />
                
                {/* 내부 아이콘 (천천히 회전) */}
                <div className="relative z-10 p-4 bg-[#1A0E30] rounded-full border border-[#C9962A]/40 shadow-[0_0_15px_rgba(201,150,42,0.2)] animate-[spin_20s_linear_infinite] flex items-center justify-center">
                  <IcMatch size={28} className="text-[#C9962A]" />
                </div>
              </div>

              {/* 텍스트 상태 영역 */}
              <div className="space-y-2.5 z-10 mb-6 w-full">
                <div className="flex items-center justify-center gap-2 text-base font-medium tracking-wide text-[#F5EDD4]">
                  <span className="text-[#C9962A]">✦</span>
                  <span>매칭 풀 참여 중</span>
                  <span className="text-[#A79CC2]">·</span>
                  <span className="font-semibold text-white">{nickname}</span>
                </div>
                
                <p className="text-xs text-[#BCB1D4]/70 animate-pulse" style={{ animationDuration: '2.5s' }}>
                  현재 12명의 인연이 운명을 기다리고 있어요
                </p>
                
                <button onClick={handleLeave} disabled={busy} className="text-[11px] text-[#A79CC2] hover:text-rose-400 transition underline decoration-dotted mt-1 block mx-auto">
                  매칭 풀에서 나가기
                </button>
              </div>

              {error && (
                <div className="bg-rose-900/20 border border-rose-900/40 rounded-2xl px-4 py-2.5 mb-4 w-full">
                  <p className="text-xs text-rose-300">{error}</p>
                </div>
              )}

              {/* 풀에 상대가 없을 때 — 에러가 아니라 설레는 대기 상태로 안내 */}
              {poolEmpty && (
                <div className="w-full bg-[#1A0E30]/70 border border-[#C9962A30] rounded-2xl px-4 py-5 mb-4 text-center">
                  <p className="text-3xl mb-2">🌙</p>
                  <p className="text-sm font-bold text-[#F5EDD4]">아직 인연을 기다리는 중이에요</p>
                  <p className="text-[11px] text-[#A79CC2] mt-1.5 leading-relaxed">새 인연이 매칭 풀에 들어오면 바로 알려드릴게요</p>
                  <div className="flex gap-2 mt-4">
                    {isPushSupported() && (
                      <button
                        onClick={handleEnableNotify}
                        disabled={notifyOn}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold text-[#0D0A1A] bg-gradient-to-r from-[#C9962A] to-[#E8B84B] active:scale-[0.98] transition disabled:opacity-70"
                      >
                        {notifyOn ? '🔔 알림 켜짐 ✓' : '🔔 알림 켜기'}
                      </button>
                    )}
                    <button
                      onClick={onInvite}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold text-[#E05282] border border-[#E0528266] active:scale-[0.98] transition"
                    >
                      친구 초대하기
                    </button>
                  </div>
                </div>
              )}

              {/* ✨ 랜덤 매칭 뽑기 버튼 */}
              <button onClick={handleDraw} disabled={busy} className="relative z-10 w-full py-4 bg-gradient-to-r from-[#C9962A] to-[#E8B84B] text-[#0D0A1A] font-bold rounded-2xl shadow-lg shadow-[#C9962A30] hover:shadow-[#C9962A50] transition-all text-sm active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2" >
                {busy ? '매칭 상대를 찾는 중...' : <><IcDraw size={17} /> {poolEmpty ? '다시 찾아보기' : '랜덤 매칭 뽑기'}</>}
              </button>

            </div>
          </div>
        )}

        {/* 결과 — 카드를 뒤집어 매칭 상대 공개 */}
        {result && opponent && (
          <div className="relative animate-fade-in-up" style={{ perspective: '1200px' }}>
            <div className="grid transition-transform duration-700 ease-out" style={{ transformStyle: 'preserve-3d', transform: matchRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)' }} >
              {/* 뒷면 — 엎어둔 운명의 상대 카드 */}
              <div className="[grid-area:1/1] bg-gradient-to-br from-[#2A1F4A] to-[#1A0E30] rounded-3xl border border-[#C9962A40] flex flex-col items-center justify-center gap-3 p-10 overflow-hidden relative" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }} >
                <div className="absolute inset-3 rounded-2xl border border-[#C9962A20]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(201,150,42,0.08) 0px, rgba(201,150,42,0.08) 1px, transparent 1px, transparent 8px)' }} />
                <span className="relative w-14 h-14 rounded-full bg-[#C9962A18] border border-[#C9962A40] flex items-center justify-center animate-pulse">
                  <IcMatch size={26} className="text-[#C9962A]" />
                </span>
                <p className="relative text-sm font-bold text-[#F5EDD4]">운명의 상대를 뽑는 중...</p>
              </div>

              {/* 앞면 — 매칭 결과 */}
              <div className="[grid-area:1/1] bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl overflow-hidden shadow-xl shadow-[#000]/40 border border-[#C9962A25] relative" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }} >
                <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-violet-500/10 blur-3xl" />
                <div className="relative z-10 p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center gap-1.5 bg-violet-400/20 border border-violet-400/30 rounded-full px-2.5 py-1.5">
                      <AnonAvatar seed={nickname} photo={myPhoto} element={result.elementA} size={20} />
                      <span className="text-xs text-violet-200 font-medium">{nickname}</span>
                    </div>
                    <span className="text-violet-400/80 text-sm">✕</span>
                    <div className="flex items-center gap-1.5 bg-rose-400/20 border border-rose-400/30 rounded-full px-2.5 py-1.5">
                      <AnonAvatar seed={opponent.userId} photo={opponent.photo} element={result.elementB} size={20} />
                      <span className="text-xs text-rose-200 font-medium">{opponent.nickname}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-center shrink-0 w-20">
                      <p className="text-4xl font-bold text-white leading-none tabular-nums">{result.total}</p>
                      <p className="text-sm font-bold text-violet-300">%</p>
                    </div>
                    <div className="flex-1 space-y-2">
                      <span className="inline-block text-xs font-bold px-3 py-1.5 rounded-full" style={{ color: result.gradeColor, backgroundColor: result.gradeBg, boxShadow: `0 0 12px ${result.gradeColor}30` }} >
                        {result.grade}
                      </span>
                      <p className="text-base font-bold text-white leading-snug" style={{ fontFamily: "'Gowun Batang', serif" }}>
                        {result.headline}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-violet-200/85 leading-relaxed mt-4">{result.summary}</p>
                  <OhaengMatchBadge result={result} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 궁합 결과 공유 (익명 — 상대 닉네임 없이 내 궁합만) */}
        {result && matchRevealed && (
          <button
            onClick={() => setShowShare(true)}
            className="w-full py-3 rounded-2xl text-sm font-bold text-[#E05282] border border-[#E0528240] bg-[#E0528210] active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            <IcShare size={15} /> 궁합 결과 공유하기
          </button>
        )}

        {/* 좋아요 / 매칭 성사 */}
        {result && opponent && matchRevealed && (
          matchedNow ? (
            <div className="rounded-2xl border border-[#E0528255] bg-gradient-to-br from-[#2A1230] to-[#1A0E30] px-5 py-4 text-center animate-fade-in-up">
              <p className="text-2xl mb-1">💞</p>
              <p className="text-sm font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>
                {opponent.nickname}님과 매칭됐어요!
              </p>
              <p className="text-[11px] text-[#BCB1D4] mt-1">서로 좋아요를 보냈어요 · 아래 ‘내 매칭’에서 확인할 수 있어요</p>
            </div>
          ) : liked ? (
            <div className="rounded-2xl border border-[#2A1F4A] bg-[#130E24] px-5 py-3.5 text-center">
              <p className="text-sm font-semibold text-[#E05282] flex items-center justify-center gap-1.5">
                <IcLoveLuck size={16} /> 좋아요 보냄
              </p>
              <p className="text-[11px] text-[#A79CC2] mt-1">상대도 좋아요하면 매칭돼요</p>
            </div>
          ) : (
            <div>
              <button
                onClick={handleLike}
                disabled={likeBusy}
                className="w-full py-4 rounded-2xl font-bold text-white text-sm bg-gradient-to-r from-[#E05282] to-[#C9962A] shadow-lg shadow-[#E0528230] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <IcLoveLuck size={18} /> {likeBusy ? '보내는 중...' : '좋아요 보내기'}
              </button>
              {likeMsg && <p className="text-[11px] text-center text-[#A79CC2] mt-2">{likeMsg}</p>}
            </div>
          )
        )}

        {result && <PointsClaimButton featureKey="match" label="사주매칭 🎲" />}

        {/* 내 매칭 — 상호 좋아요로 성사된 인연 */}
        {optedIn && matches.length > 0 && (
          <div className="bg-[#130E24] rounded-3xl border border-[#E0528233] shadow-[0_2px_20px_rgba(224,82,130,0.08)] p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-[#E05282] rounded-full" />
              <h2 className="text-sm font-bold text-[#F5EDD4]">내 매칭</h2>
              <span className="text-[10px] text-[#A79CC2]">서로 좋아요한 인연</span>
            </div>
            <div className="space-y-2">
              {matches.map(m => (
                <button
                  key={m.matchId}
                  onClick={() => setChatMatch(m)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-[#1C1438] hover:bg-[#241a44] active:scale-[0.99] transition text-left"
                >
                  <AnonAvatar seed={m.opponent.userId} photo={m.opponent.photo} size={28} />
                  <p className="text-sm font-semibold text-[#F5EDD4] flex-1 truncate">{m.opponent.nickname}</p>
                  {m.unread > 0 ? (
                    <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-[#E05282] text-white text-[10px] font-bold flex items-center justify-center">
                      {m.unread > 99 ? '99+' : m.unread}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#E05282] font-semibold">대화하기 →</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 나의 매칭 랭킹 */}
        {optedIn && ranking.length > 0 && (
          <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-[#C9962A] rounded-full" />
              <h2 className="text-sm font-bold text-[#F5EDD4]">나의 매칭 랭킹</h2>
            </div>
            <div className="space-y-2">
              {ranking.map((entry, i) => (
                <div key={`${entry.nickname}-${entry.date}-${i}`} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-[#1C1438]">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-[#0D0A1A] shrink-0" style={{ backgroundColor: RANK_BADGE[i] ?? '#3A2F55', color: i < 3 ? '#0D0A1A' : '#C4B8D8' }} >
                    {i + 1}
                  </span>
                  <AnonAvatar seed={entry.nickname} photo={entry.photo} size={24} />
                  <p className="text-xs font-semibold text-[#C4B8D8] flex-1 truncate">{entry.nickname}</p>
                  <span className="text-[11px] text-[#A79CC2]">{entry.grade}</span>
                  <span className="text-xs font-bold text-[#C9962A] tabular-nums">{entry.score}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="text-center pb-28 text-xs text-[#857AA0]">사주매칭 — 참고용 · 닉네임 기반 익명 매칭</div>
    </div>
  )
}
