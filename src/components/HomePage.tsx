import { useState, useEffect, useMemo, useRef } from 'react'
import type { UserInfo, BirthInput } from '../types'
import type { PointsState } from '../utils/points'
import { tryClaimDaily, getLuckyTimerAttempts, LUCKY_TIMER_MAX_ATTEMPTS } from '../utils/points'
import { loadProfilePhoto } from '../utils/profilePhoto'
import { calculateSaju, getSipsin, pillarName } from '../utils/saju'
import { SIPSIN_DESC, STEMS, ELEMENT_COLORS, ELEMENT_LABELS } from '../utils/constants'
import { DAY_FORTUNE } from '../utils/fortuneData'
import PointsModal from './PointsModal'
import AdBanner from './AdBanner'
import { isPushSupported, isPushEnabled, enablePush, disablePush } from '../utils/pushNotify'
import {
  IcSaju, IcTodayFortune, IcDaun, IcGunghab, IcDeepSaju, IcDream, IcTarot, IcOutfit, IcJob, IcGem, IcStamp, IcSinnyeon, IcTojeong, IcLucky, IcBattle, IcMatch, IcProfile, IcSparkleKeyword,
} from './icons/SajuIcons'

interface Props {
  user: UserInfo
  nickname: string
  birthProfile: BirthInput | null
  points: PointsState
  onPointsUpdate: (p: PointsState) => void
  onNavigate: (dest: 'saju' | 'sinnyeon' | 'tojeong' | 'today' | 'daun' | 'gunghab' | 'deepsaju' | 'dream' | 'tarot' | 'outfit' | 'job' | 'battle' | 'match') => void
  matchSummary: { matches: number; unread: number; likes: number }
  onAttendance: () => void
  onLuckyTimer: () => void
  onEditProfile: () => void
  onLogout: () => void
  onShowPrivacy: () => void
  onShowTerms: () => void
  onDeleteAccount: () => void
  isGuest: boolean
  onRequestLogin: () => void
}

// 배너 모서리를 장식하는 금색 이중선 브래킷 (전통 한지 액자 느낌)
function CornerOrnament({ className = '', size = 30 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill="none" className={className}>
      <path d="M2 22V6Q2 2 6 2H22" stroke="#C9962A" strokeWidth="1.3" opacity="0.65"/>
      <path d="M7 26V10Q7 7 10 7H26" stroke="#C9962A" strokeWidth="1" opacity="0.4"/>
      <circle cx="6" cy="2" r="1.4" fill="#E8C75C" opacity="0.8"/>
    </svg>
  )
}

// 추천 콘텐츠용 코드 카드 — 다크/별자리 테마에 맞춘 한땀한땀 제작 카드.
// 2열 그리드 셀로 배치되며, 이미지 대신 그라데이션 + 글로우 + 별 장식 + SVG 아이콘으로 구성한다.
function PromoCard({
  Icon, title, subtitle, accent, onClick,
}: {
  Icon: React.FC<{ size?: number; className?: string }>
  title: string; subtitle: string; accent: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl border p-4 flex flex-col text-left active:scale-[0.98] transition-all min-h-[124px]"
      style={{
        borderColor: accent + '40',
        background: 'linear-gradient(135deg, #1B1036 0%, #0C091A 100%)',
        boxShadow: `0 2px 16px ${accent}14`,
      }}
    >
      {/* 포인트 글로우 */}
      <div
        className="absolute -right-5 top-1/2 -translate-y-1/2 w-28 h-28 rounded-full blur-3xl pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accent}40, transparent 70%)` }}
      />
      {/* 별 장식 */}
      <span className="absolute pointer-events-none" style={{ right: '14%', top: '20%', color: accent, fontSize: 9, opacity: 0.7 }}>✦</span>
      <span className="absolute pointer-events-none" style={{ right: '8%', bottom: '30%', color: '#F5EDD4', fontSize: 6, opacity: 0.4 }}>⋆</span>

      {/* 아이콘 타일 */}
      <span
        className="relative shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center mb-2.5"
        style={{ background: accent + '1F', border: `1px solid ${accent}55`, color: accent, boxShadow: `0 0 14px ${accent}33 inset` }}
      >
        <Icon size={26} />
      </span>

      <p className="relative text-sm font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>{title}</p>
      <p className="relative text-[11px] text-[#BCB1D4] mt-0.5 leading-snug">{subtitle}</p>
    </button>
  )
}

// 사주매칭 홈 히어로 — 메인 기능이라 홈 최상단에서 바로 유입시킨다.
// 받은 좋아요 > 안읽음 > 매칭수 > 신규 순으로 가장 강한 후크를 보여준다.
function MatchHeroCard({
  summary, onOpen, delay,
}: {
  summary: { matches: number; unread: number; likes: number }
  onOpen: () => void; delay: React.CSSProperties
}) {
  const { matches, unread, likes } = summary
  const accent = '#E05282'
  let title: string, sub: string, badge = 0
  if (likes > 0)        { title = `${likes}명이 좋아요를 보냈어요`; sub = '누가 나를 마음에 들어했는지 확인해보세요'; badge = likes }
  else if (unread > 0)  { title = `새 메시지 ${unread}개`;          sub = '매칭된 인연과의 대화가 기다리고 있어요'; badge = unread }
  else if (matches > 0) { title = `내 매칭 ${matches}명`;           sub = '대화를 이어가 인연을 키워보세요' }
  else                  { title = '운명의 인연, 사주로 찾기';       sub = '나와 잘 맞는 사주의 익명 인연을 만나보세요' }

  return (
    <div style={delay}>
      <button
        onClick={onOpen}
        className="w-full relative overflow-hidden rounded-3xl border p-4 flex items-center gap-3.5 active:scale-[0.99] transition-all"
        style={{ borderColor: accent + '55', background: 'linear-gradient(135deg, #2A1230 0%, #1A0E30 55%, #120A22 100%)', boxShadow: `0 2px 22px ${accent}22` }}
      >
        <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-3xl pointer-events-none"
          style={{ background: `radial-gradient(circle, ${accent}40, transparent 70%)` }} />
        <span className="absolute pointer-events-none" style={{ right: '18%', top: '22%', color: accent, fontSize: 10, opacity: 0.7 }}>✦</span>

        <span className="relative shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: accent + '22', border: `1px solid ${accent}66`, color: accent }}>
          <IcMatch size={30} />
          {badge > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full bg-[#E05282] text-white text-[11px] font-bold flex items-center justify-center border-2 border-[#1A0E30]">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </span>

        <div className="relative flex-1 text-left">
          <p className="text-[15px] font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>{title}</p>
          <p className="text-[11px] text-[#D3A9C0] mt-0.5 leading-snug">{sub}</p>
        </div>

        <span className="relative text-xs font-bold shrink-0" style={{ color: accent }}>
          {matches > 0 || likes > 0 ? '확인 →' : '시작 →'}
        </span>
      </button>
    </div>
  )
}

// 매일 운세 알림 on/off 토글 (로그인 사용자 전용, 브라우저가 푸시를 지원할 때만 표시)
function NotifyToggle() {
  const [enabled, setEnabled] = useState(() => (typeof window !== 'undefined' ? isPushEnabled() : false))
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  if (!isPushSupported()) return null

  async function toggle() {
    if (busy) return
    setBusy(true)
    setMsg(null)
    try {
      if (enabled) {
        await disablePush()
        setEnabled(false)
      } else {
        const r = await enablePush()
        if (r.ok) setEnabled(true)
        else if (r.reason === 'denied') setMsg('브라우저 알림이 차단돼 있어요. 설정 → 알림에서 허용해주세요')
        else if (r.reason === 'unsupported') setMsg('이 브라우저는 알림을 지원하지 않아요 (iOS는 홈화면 추가 PWA만)')
        else setMsg('알림 등록에 실패했어요. 잠시 후 다시 시도해주세요')
      }
    } catch (e) {
      setMsg('알림 처리 중 오류가 발생했어요')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center justify-between bg-[#130E24] rounded-3xl border border-[#2A1F4A] px-4 py-3.5">
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 rounded-full bg-[#C9962A15] border border-[#C9962A30] flex items-center justify-center shrink-0">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M12 3a5 5 0 0 0-5 5v3.5L5.5 15h13L17 11.5V8a5 5 0 0 0-5-5z" stroke="#C9962A" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M10 18a2 2 0 0 0 4 0" stroke="#C9962A" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
        <div>
          <p className="text-sm font-semibold text-[#F5EDD4]">매일 운세 알림</p>
          <p className={`text-[11px] ${msg ? 'text-[#E05252]' : 'text-[#A79CC2]'}`}>
            {busy ? '처리 중…' : msg ?? '매일 아침 8시, 오늘의 운세를 보내드려요'}
          </p>
        </div>
      </div>
      <button
        onClick={toggle}
        disabled={busy}
        aria-label="매일 운세 알림 토글"
        className={`relative w-12 h-7 rounded-full transition-colors shrink-0 disabled:opacity-60 ${enabled ? 'bg-[#C9962A]' : 'bg-[#2A1F4A]'}`}
      >
        <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${enabled ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  )
}

const DAILY_FALLBACK = [
  '하늘의 기운이 오늘 당신 편입니다. 새로운 도전에 과감히 나서보세요.',
  '작은 실천이 큰 변화를 만드는 날입니다. 미루던 일을 시작하세요.',
  '균형과 조화를 중심에 두면 좋은 결과가 따르는 날입니다.',
  '오늘은 내면의 목소리에 귀 기울여 보세요. 직감이 맞습니다.',
  '주변 사람들과의 소통이 행운을 불러오는 날입니다.',
  '차분한 마음으로 결정하면 후회 없는 선택이 됩니다.',
  '주말의 여유로 내일을 위한 에너지를 충전하는 날입니다.',
]

const CHIPS: { Icon: React.FC<{ size?: number; className?: string }>; label: string; dest: 'today' | 'saju' | 'daun' | 'gunghab' | 'dream' | 'tarot' | 'deepsaju' | 'outfit' | 'job' | 'battle' | 'match'; sub: string }[] = [
  { Icon: IcTodayFortune, label: '오늘운세',  dest: 'today',     sub: '오늘 · 내일' },
  { Icon: IcSaju,         label: '정통사주',  dest: 'saju',      sub: '사주팔자' },
  { Icon: IcTarot,        label: '타로상담',  dest: 'tarot',     sub: 'AI 카드 해석' },
  { Icon: IcBattle,       label: '운세대결',  dest: 'battle',    sub: '친구와 대결' },
  { Icon: IcMatch,        label: '사주매칭',  dest: 'match',     sub: '익명 인연 매칭' },
  { Icon: IcDaun,         label: '대운분석',  dest: 'daun',      sub: '10년 흐름' },
  { Icon: IcGunghab,      label: '궁합보기',  dest: 'gunghab',   sub: '사주 궁합' },
  { Icon: IcDream,        label: '꿈해몽',    dest: 'dream',     sub: '전통 풀이' },
  { Icon: IcDeepSaju,     label: '심층해석',  dest: 'deepsaju',  sub: '일간 분석' },
  { Icon: IcOutfit,       label: '오늘코디',  dest: 'outfit',    sub: '스타일 추천' },
  { Icon: IcJob,          label: '취업운',    dest: 'job',       sub: '커리어 운세' },
]

// 오늘의 오행에 따라 가장 어울리는 기능 하나를 추천 뱃지로 표시
const ELEMENT_TO_CHIP: Record<string, typeof CHIPS[number]['dest']> = {
  wood:  'daun',
  fire:  'outfit',
  earth: 'saju',
  metal: 'job',
  water: 'dream',
}

// 값이 바뀔 때 숫자가 부드럽게 증가/감소하는 카운트업 애니메이션
function useCountUp(value: number, duration = 700) {
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(value)

  useEffect(() => {
    const from = prevRef.current
    const to = value
    if (from === to) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(from + (to - from) * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
      else prevRef.current = to
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return display
}

// 타로 배너 카드 4장에 사용하는 AI 생성 일러스트 (태양 / 천리안 눈 / 수정구슬 / 손바닥)
const TAROT_CARD_IMAGES = [
  { src: '/images/tarot/sun.webp',        rotate: '-rotate-[14deg]' },
  { src: '/images/tarot/eye.webp',        rotate: '-rotate-[4deg] -translate-y-1' },
  { src: '/images/tarot/crystalball.webp', rotate: 'rotate-[4deg] -translate-y-1' },
  { src: '/images/tarot/hand.webp',       rotate: 'rotate-[14deg]' },
]

export default function HomePage({ user, nickname, birthProfile, points, onPointsUpdate, onNavigate, matchSummary, onAttendance, onLuckyTimer, onEditProfile, onLogout, onShowPrivacy, onShowTerms, onDeleteAccount, isGuest, onRequestLogin }: Props) {
  const todayDate = new Date()
  const month = todayDate.getMonth() + 1
  const day   = todayDate.getDate()

  const [photo] = useState<string | null>(loadProfilePhoto)
  const [showPoints, setShowPoints] = useState(false)
  const [dailyToast, setDailyToast] = useState<{ milestone: number; bonus: number } | true | false>(false)
  const [mounted, setMounted] = useState(false)

  // 오늘의 운세 — 하루 1번 카드 뒤집어 펼치기 (펼친 상태는 그날 동안 유지)
  const todayKey = `${todayDate.getFullYear()}-${month}-${day}`
  const [fortuneRevealed, setFortuneRevealed] = useState(false)
  useEffect(() => {
    try { setFortuneRevealed(localStorage.getItem('todayFortuneRevealed') === todayKey) } catch { /* noop */ }
  }, [todayKey])
  function revealTodayFortune() {
    setFortuneRevealed(true)
    try { localStorage.setItem('todayFortuneRevealed', todayKey) } catch { /* noop */ }
  }
  const streakMounted = mounted
  const animatedBalance = useCountUp(points.balance)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  // 섹션이 순차적으로 페이드인 + 슬라이드업 되며 등장하는 효과
  const reveal = (i: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(14px)',
    transition: 'opacity 0.5s ease, transform 0.5s ease',
    transitionDelay: `${Math.min(i, 6) * 70}ms`,
  })

  // 연속 출석 스트릭
  const streak = (() => {
    const dailyDates = new Set(
      points.history.filter(h => h.label === '매일 출석 보너스').map(h => h.date)
    )
    const todayStr = new Date().toISOString().slice(0, 10)
    let count = 0
    const d = new Date()
    if (!dailyDates.has(todayStr)) d.setDate(d.getDate() - 1)
    while (dailyDates.has(d.toISOString().slice(0, 10))) {
      count++
      d.setDate(d.getDate() - 1)
    }
    return count
  })()

  useEffect(() => {
    if (isGuest) return  // 게스트는 포인트가 없으므로 출석 보너스도 적립하지 않는다
    const { next, claimed, milestone } = tryClaimDaily(points)
    if (claimed) {
      onPointsUpdate(next)
      setDailyToast(milestone ? { milestone: milestone.days, bonus: milestone.bonus } : true)
      setTimeout(() => setDailyToast(false), milestone ? 3600 : 2800)
    }
  }, [])

  // 오늘 한 줄 운세
  const todayFortune = useMemo(() => {
    const fallback = { text: DAILY_FALLBACK[todayDate.getDay()], element: null as string | null }
    if (!birthProfile) return fallback
    try {
      const userResult = calculateSaju(birthProfile)
      const todayResult = calculateSaju({
        year: todayDate.getFullYear(), month: todayDate.getMonth() + 1,
        day: todayDate.getDate(), hour: 12, minute: null, gender: 'male',
      })
      const sipsin = getSipsin(userResult.dayPillar.stemIndex, todayResult.dayPillar.stemIndex) ?? '비견'
      const fortune = DAY_FORTUNE[sipsin]
      const element = STEMS[todayResult.dayPillar.stemIndex].element
      const text = fortune?.총평 ? fortune.총평.split('.')[0] + '.' : fallback.text
      return { text, element }
    } catch {
      return fallback
    }
  }, [birthProfile])
  const todayAccent = todayFortune.element ? ELEMENT_COLORS[todayFortune.element] : '#C9962A'
  const recommendedChip = todayFortune.element ? ELEMENT_TO_CHIP[todayFortune.element] : null

  // 현재 대운 요약
  const daunInfo = useMemo(() => {
    if (!birthProfile) return null
    try {
      const result = calculateSaju(birthProfile)
      const currentYear = new Date().getFullYear()
      const dayStemIdx = result.dayPillar.stemIndex
      const currentDaun = result.daun.find(entry => {
        const ageYear = birthProfile.year + entry.age
        return ageYear <= currentYear && currentYear < ageYear + 10
      })
      if (!currentDaun) return null
      const sipsin = getSipsin(dayStemIdx, currentDaun.pillar.stemIndex) ?? '비견'
      const desc = SIPSIN_DESC[sipsin]
      return {
        sipsin,
        pillarStr: pillarName(currentDaun.pillar),
        meaning: desc?.meaning ?? '',
        ageRange: `${currentDaun.age}~${currentDaun.age + 9}세`,
      }
    } catch { return null }
  }, [birthProfile])

  return (
    <div className="min-h-screen relative">

      {/* ── 배경 색감 장식 (블롭 + 오행 산점) ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#C9962A]/8 blur-3xl" />
        <div className="absolute top-1/3 -left-24 w-72 h-72 rounded-full bg-violet-900/15 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-[#C9962A]/5 blur-3xl" />
        <div className="absolute bottom-1/4 -left-16 w-56 h-56 rounded-full bg-violet-900/10 blur-3xl" />
        {[
          { ch: '木', x: '6%',  y: '6%',  c: '#86EFAC', s: '12px' },
          { ch: '火', x: '91%', y: '14%', c: '#FCA5A5', s: '11px' },
          { ch: '水', x: '4%',  y: '46%', c: '#93C5FD', s: '12px' },
          { ch: '金', x: '92%', y: '52%', c: '#D1D5DB', s: '11px' },
          { ch: '土', x: '8%',  y: '86%', c: '#FCD34D', s: '11px' },
          { ch: '✦',  x: '85%', y: '34%', c: '#C4B5FD', s: '10px' },
          { ch: '✦',  x: '12%', y: '28%', c: '#C4B5FD', s: '8px'  },
          { ch: '⋆',  x: '78%', y: '78%', c: '#DDD6FE', s: '15px' },
          { ch: '⋆',  x: '90%', y: '92%', c: '#DDD6FE', s: '13px' },
        ].map((d, i) => (
          <span key={i} className="absolute select-none font-bold"
            style={{ left: d.x, top: d.y, color: d.c, fontSize: d.s, opacity: 0.6 }}>
            {d.ch}
          </span>
        ))}
      </div>

      {dailyToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#C9962A] text-[#0D0A1A] text-xs font-semibold px-5 py-2.5 rounded-full shadow-lg animate-bounce text-center">
          {dailyToast === true
            ? '출석 보너스 +10P 지급!'
            : `${dailyToast.milestone}일 연속 출석 달성! +${10 + dailyToast.bonus}P 지급!`}
        </div>
      )}
      {showPoints && <PointsModal points={points} onClose={() => setShowPoints(false)} onPointsUpdate={onPointsUpdate} />}

      {/* 상단 바 */}
      <div className="bg-[#130E24] border-b border-[#2A1F4A] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>운명봄</h1>
          <div className="flex items-center gap-2">
            {!isGuest && (
              <button
                onClick={() => setShowPoints(true)}
                className="flex items-center gap-1 bg-[#C9962A15] border border-[#C9962A30] px-3 py-1.5 rounded-full hover:bg-[#C9962A25] transition"
              >
                <IcGem size={14} className="text-[#C9962A]"/>
                <span className="text-xs font-bold text-[#C9962A]">{animatedBalance.toLocaleString()}P</span>
              </button>
            )}
            {isGuest
              ? <button onClick={onRequestLogin} className="text-xs font-semibold text-[#C9962A] hover:text-[#E8B84B] transition px-2 py-1">로그인</button>
              : <button onClick={onLogout} className="text-xs text-[#BCB1D4] hover:text-[#C4B8D8] transition px-2 py-1">로그아웃</button>
            }
            {photo || user.picture
              ? <img src={photo ?? user.picture} alt={user.name} className="w-8 h-8 rounded-full object-cover"/>
              : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"><span className="text-white text-xs font-bold">{user.name[0]}</span></div>
            }
          </div>
        </div>
      </div>

      {/* 게스트 안내 배너 — 로그인 유도 */}
      {isGuest && (
        <div className="max-w-2xl mx-auto px-4 pt-3">
          <button
            onClick={onRequestLogin}
            className="w-full flex items-center justify-between gap-3 bg-gradient-to-r from-[#C9962A18] to-[#1A0E30] border border-[#C9962A40] rounded-2xl px-4 py-2.5 text-left active:scale-[0.99] transition"
          >
            <p className="text-xs text-[#E8DFC8]">
              <span className="font-semibold text-[#C9962A]">게스트로 둘러보는 중</span> · 로그인하면 데이터가 안전하게 저장돼요
            </p>
            <span className="text-xs text-[#C9962A] font-semibold shrink-0">로그인 →</span>
          </button>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* 인사 + 오늘 운세 한 줄 */}
        <div style={reveal(0)}>
        <div
          className="relative overflow-hidden rounded-3xl p-5 border shadow-xl shadow-[#000]/40 transition-colors duration-500"
          style={{
            backgroundImage: 'linear-gradient(180deg, rgba(6,4,16,0.15) 0%, rgba(6,4,16,0.55) 100%), url(/today-hero-bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderColor: todayAccent + '40',
          }}
        >
          <div className="relative flex items-center justify-between gap-2 mb-1">
            <p className="text-violet-300/85 text-xs">
              {todayDate.getFullYear()}년 {month}월 {day}일 · 안녕하세요, {user.name}님
            </p>
            {todayFortune.element && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap flex-shrink-0"
                style={{ color: todayAccent, borderColor: todayAccent + '50', backgroundColor: todayAccent + '15' }}
              >
                오늘은 {ELEMENT_LABELS[todayFortune.element]} 기운
              </span>
            )}
          </div>
          <p className="relative text-base font-bold text-[#F5EDD4] mb-3" style={{ fontFamily: "'Gowun Batang', serif" }}>
            오늘의 한 줄 운세
          </p>
          {/* 오늘의 운세 카드 — 탭하면 3D로 뒤집혀 펼쳐짐 (하루 1번) */}
          <div className="relative" style={{ perspective: '1000px' }}>
            <div
              className="grid transition-transform duration-700 ease-out"
              style={{
                transformStyle: 'preserve-3d',
                transform: fortuneRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* 뒷면 — 엎어둔 운세 카드 */}
              <button
                onClick={revealTodayFortune}
                aria-label="오늘의 운세 펼치기"
                className="[grid-area:1/1] w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 border text-left active:scale-[0.99] transition-transform"
                style={{ backgroundColor: todayAccent + '12', borderColor: todayAccent + '35', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                <span
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center animate-pulse"
                  style={{ backgroundColor: todayAccent + '20', color: todayAccent }}
                >
                  <IcSaju size={20} />
                </span>
                <span className="flex-1">
                  <p className="text-sm font-bold" style={{ color: '#F5EDD4' }}>오늘의 운세 카드</p>
                  <p className="text-[11px] font-semibold" style={{ color: todayAccent }}>탭하여 펼쳐보기 →</p>
                </span>
              </button>

              {/* 앞면 — 펼쳐진 운세 */}
              <div
                className="[grid-area:1/1] flex gap-3 items-start rounded-2xl px-4 py-3.5 border"
                style={{ backgroundColor: todayAccent + '12', borderColor: todayAccent + '35', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <span
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: todayAccent + '20', color: todayAccent }}
                >
                  <IcSparkleKeyword size={16} />
                </span>
                <p className="text-sm leading-relaxed font-semibold" style={{ color: '#F5EDD4' }}>{todayFortune.text}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('today')}
            className="relative mt-3 text-xs font-semibold transition"
            style={{ color: todayAccent }}
          >
            오늘 전체 운세 보기 →
          </button>
        </div>
        </div>

        {/* 사주매칭 히어로 — 메인 기능, 홈 최상단 유입 */}
        <MatchHeroCard summary={matchSummary} onOpen={() => onNavigate('match')} delay={reveal(1)} />

        {/* 가로 스크롤 칩 메뉴 */}
        <div style={reveal(2)} className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-4">
          <p className="text-xs text-[#A79CC2] mb-3 px-1">기능 바로가기</p>
          <div className="grid grid-cols-4 gap-x-2 gap-y-4">
            {CHIPS.map(chip => {
              const recommended = chip.dest === recommendedChip
              return (
                <button
                  key={chip.dest}
                  onClick={() => onNavigate(chip.dest)}
                  className="relative flex flex-col items-center gap-2 active:scale-95 transition-transform"
                >
                  {recommended && (
                    <span
                      className="absolute -top-1 right-1 z-10 text-[8px] font-bold text-white px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap"
                      style={{ backgroundColor: todayAccent }}
                    >
                      추천
                    </span>
                  )}
                  <div
                    className="relative w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden backdrop-blur-sm transition"
                    style={recommended
                      ? { background: 'rgba(255,255,255,0.10)', border: `1.5px solid ${todayAccent}AA`, boxShadow: `0 0 14px ${todayAccent}40` }
                      : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,150,42,0.45)' }}
                  >
                    <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
                    <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />
                    <span className="relative" style={recommended ? { color: todayAccent } : undefined}>
                      <chip.Icon size={26} className={recommended ? '' : 'text-[#E8C75C]'}/>
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-[#C4B8D8] font-semibold leading-tight">{chip.label}</p>
                    <p className="text-[9px] mt-0.5" style={{ color: recommended ? todayAccent : '#A79CC2' }}>{chip.sub}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 매일 운세 알림 토글 (로그인 사용자 전용) */}
        {!isGuest && (
          <div style={reveal(2)}>
            <NotifyToggle />
          </div>
        )}

        {/* 저장된 프로필 배지 */}
        {birthProfile && (
          <div style={reveal(2)} className="flex items-center justify-between bg-[#C9962A15] border border-[#C9962A30] rounded-2xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[#C9962A] text-sm">✓</span>
              <p className="text-xs text-[#C4B8D8]">
                {nickname && <span className="font-semibold">{nickname}</span>}
                {nickname && <span className="text-[#A79CC2] mx-1">·</span>}
                <span className="font-semibold">{birthProfile.year}.{String(birthProfile.month).padStart(2,'0')}.{String(birthProfile.day).padStart(2,'0')}</span>
                <span className="text-[#A79CC2] ml-1">· {birthProfile.gender === 'male' ? '남성' : '여성'}</span>
                {birthProfile.hour !== null && <span className="text-[#A79CC2] ml-1">· {birthProfile.hour}시</span>}
              </p>
            </div>
            <button onClick={onEditProfile} className="text-xs text-[#C9962A] font-semibold hover:text-[#E8B84B] transition">수정</button>
          </div>
        )}

        {/* 프로필 미설정 CTA */}
        {!birthProfile && (
          <button
            onClick={onEditProfile}
            style={reveal(2)}
            className="w-full flex items-center justify-between gap-3 bg-gradient-to-r from-[#1A0E30] to-[#100820] border border-[#C9962A40] rounded-2xl px-4 py-3.5 text-left active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-[#C9962A20] flex items-center justify-center text-[#C9962A] shrink-0"><IcProfile size={18} /></span>
              <p className="text-xs text-[#E8DFC8]">
                <span className="font-semibold">생년월일을 등록</span>하면<br/>
                <span className="text-[#A79CC2]">나만의 사주 풀이를 볼 수 있어요</span>
              </p>
            </div>
            <span className="text-xs text-[#C9962A] font-semibold shrink-0">등록 →</span>
          </button>
        )}

        {/* 현재 대운 요약 */}
        {daunInfo && (
          <div style={reveal(2)}>
          <button
            onClick={() => onNavigate('daun')}
            className="w-full bg-[#130E24] rounded-3xl border border-[#2A1F4A] p-5 text-left hover:border-[#C9962A40] active:scale-[0.99] transition-all shadow-[0_2px_20px_rgba(0,0,0,0.3)]"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#C9962A12] border border-[#C9962A30] flex items-center justify-center flex-shrink-0">
                <IcDaun size={20} className="text-[#C9962A]"/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-bold text-[#C9962A]">현재 대운</p>
                  <span className="text-xs bg-amber-900/30 text-amber-400 border border-amber-900/50 px-2 py-0.5 rounded-full font-bold">
                    {daunInfo.pillarStr} · {daunInfo.sipsin}
                  </span>
                </div>
                <p className="text-sm font-bold text-[#F5EDD4] mb-0.5 flex items-start gap-1.5" style={{ fontFamily: "'Gowun Batang', serif" }}>
                  <span className="text-[#C9962A] shrink-0 mt-0.5"><IcSparkleKeyword size={13} /></span>{daunInfo.sipsin === '정관' ? '조직에서 인정받고 명예가 따르는 시기입니다' :
                      daunInfo.sipsin === '편관' ? '강한 압박이 있지만 이겨내면 도약하는 시기입니다' :
                      daunInfo.sipsin === '식신' ? '재능을 펼치고 풍요를 누리는 여유로운 시기입니다' :
                      daunInfo.sipsin === '정재' ? '꾸준한 노력이 결실로 돌아오는 안정의 시기입니다' :
                      daunInfo.sipsin === '편재' ? '돈이 크게 움직이는 투자와 기회의 시기입니다' :
                      daunInfo.sipsin === '상관' ? '창의력이 폭발하고 변화가 일어나는 시기입니다' :
                      daunInfo.sipsin === '비견' ? '독립심이 강해지고 경쟁이 심화되는 시기입니다' :
                      daunInfo.sipsin === '겁재' ? '변동과 충동을 조심해야 하는 시기입니다' :
                      daunInfo.sipsin === '정인' ? '배움과 안정, 귀인의 도움이 찾아오는 시기입니다' :
                      daunInfo.sipsin === '편인' ? '새 학문과 이동이 잦아지는 역마의 시기입니다' :
                      `${daunInfo.meaning}의 기운이 흐르는 시기입니다`}
                </p>
                <p className="text-xs text-[#A79CC2]">{daunInfo.ageRange} · 자세히 보기 →</p>
              </div>
            </div>
          </button>
          </div>
        )}

        {/* ── 오늘의 이벤트 ── */}
        <p style={reveal(3)} className="text-xs font-semibold text-[#A79CC2] px-1 pt-2">오늘의 이벤트</p>

        {/* 나만의 타로 상담 배너 */}
        <div style={reveal(3)}>
        <button
          onClick={() => onNavigate('tarot')}
          className="w-full text-left relative overflow-hidden rounded-2xl border border-[#d4af37]/30 bg-gradient-to-b from-[#1a1026] to-[#120a1c] p-6 shadow-[0_0_20px_rgba(212,175,55,0.1)] active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center justify-center mb-6 h-32 relative">
            <div className="absolute inset-x-0 top-0 h-32 flex items-center justify-center pointer-events-none">
              <div className="w-44 h-28 rounded-full blur-2xl opacity-40" style={{ background: 'radial-gradient(circle, rgba(232,199,92,0.35), transparent 70%)' }} />
            </div>

            <div className="flex justify-center items-center -space-x-5 relative z-10">
              {TAROT_CARD_IMAGES.map((card, i) => (
                <div
                  key={card.src}
                  className={`w-16 h-[104px] rounded-md border border-[#d4af37]/60 overflow-hidden shadow-lg ${card.rotate} ${i === 1 || i === 2 ? 'z-20 shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'z-10'}`}
                >
                  <img src={card.src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#2d1b46]">
            <div>
              <h3 className="text-lg font-bold text-[#e8c75c] tracking-wide">
                나만의 타로 상담
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">오늘의 고민을 카드로 풀어보세요</p>
            </div>
            <span className="flex items-center space-x-1 px-4 py-1.5 rounded-full border border-[#d4af37] bg-transparent text-xs text-[#e8c75c]">
              <span>지금 시작하기</span>
              <span>→</span>
            </span>
          </div>
        </button>
        </div>

        {/* 출석체크 배너 — 게스트는 포인트가 없어 숨김 */}
        {!isGuest && (() => {
          const checked = points.lastDaily === new Date().toISOString().slice(0, 10)
          const TOTAL_DAYS = 7
          const completed = streak >= TOTAL_DAYS
          return (
            <div style={reveal(3)}>
            <button
              onClick={onAttendance}
              className={`w-full overflow-hidden rounded-3xl active:scale-[0.99] transition-all ${completed ? 'shadow-[0_2px_20px_rgba(201,150,42,0.25)]' : 'shadow-[0_2px_16px_rgba(180,30,30,0.10)]'}`}
            >
              <div
                className={`relative overflow-hidden border rounded-3xl px-4 py-3 ${completed ? 'border-amber-500/50' : 'border-red-900/40'}`}
                style={{ background: 'linear-gradient(135deg, #1A0E30 0%, #100820 60%, #060410 100%)' }}
              >
                {/* 도장 뒤 은은한 빛 번짐 */}
                <div
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-2xl pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${completed ? 'rgba(201,150,42,0.22)' : 'rgba(200,40,40,0.2)'}, transparent 70%)` }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-[0.09] select-none pointer-events-none text-red-700 rotate-12">
                  <IcStamp size={76}/>
                </div>
                <div className="absolute right-16 bottom-3 opacity-[0.06] select-none pointer-events-none text-[#C9962A] -rotate-6">
                  <IcSinnyeon size={32}/>
                </div>
                <CornerOrnament size={20} className="absolute top-1.5 left-1.5 pointer-events-none opacity-70"/>
                <CornerOrnament size={20} className="absolute top-1.5 right-1.5 -scale-x-100 pointer-events-none opacity-70"/>
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="relative shrink-0 w-12 h-12 flex items-center justify-center">
                    <div className={`absolute inset-0 rounded-full border-[3px] transition-all ${checked ? 'border-red-300' : 'border-red-500'}`}/>
                    <div className="absolute inset-[4px] rounded-full border border-red-300 opacity-40"/>
                    {checked
                      ? <div className="flex flex-col items-center"><span className="text-red-500 text-lg font-bold leading-none">✓</span><span className="text-[8px] text-red-400 font-bold mt-0.5">완료</span></div>
                      : <div className="flex flex-col items-center"><span className="text-[10px] font-bold text-red-600 leading-tight text-center" style={{ fontFamily: "'Gowun Batang', serif" }}>출석<br/>도장</span></div>
                    }
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[15px] font-bold leading-tight" style={{ fontFamily: "'Gowun Batang', serif", color: checked ? '#BCB1D4' : '#F5EDD4' }}>
                      {checked ? '오늘 도장 찍었어요!' : '출석체크하고 포인트 받기'}
                    </p>
                    <p className="text-[11px] text-[#A79CC2] mt-0.5">
                      {checked
                        ? `${streak}일 연속 출석 중 · 누적 ${animatedBalance.toLocaleString()}P`
                        : `${streak > 0 ? `${streak}일 연속 출석 중 · ` : ''}매일 +10P 지급`}
                    </p>
                  </div>
                  {!checked
                    ? <div className="shrink-0 w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-md shadow-red-900/30"><span className="text-white text-[10px] font-bold">+10P</span></div>
                    : <span className="text-[11px] text-[#A79CC2] font-medium shrink-0">내역 →</span>
                  }
                </div>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: TOTAL_DAYS }).map((_, i) => {
                    const filled = i < streak
                    const isToday = checked && i === streak - 1
                    return (
                      <div
                        key={i}
                        className={`flex-1 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${filled ? (isToday ? 'border-red-500 bg-red-500 shadow-sm shadow-red-900/30' : 'border-red-900/50 bg-red-900/30') : 'border-[#2A1F4A] bg-[#1C1438]'}`}
                        style={{
                          transform: streakMounted ? 'scale(1)' : 'scale(0)',
                          transitionDelay: streakMounted ? `${i * 60}ms` : '0ms',
                        }}
                      >
                        {filled && <span className={`text-[8px] font-bold ${isToday ? 'text-white' : 'text-red-400'}`}>{i + 1}일</span>}
                        {!filled && <span className="text-[8px] text-[#857AA0]">{i + 1}</span>}
                      </div>
                    )
                  })}
                </div>
                <div className={`mt-2 pt-1.5 border-t flex items-center justify-between ${completed ? 'border-amber-500/30' : 'border-red-900/30'}`}>
                  {completed
                    ? <span className="text-[10px] font-bold text-amber-400">7일 연속 보너스 +50P 받았어요!</span>
                    : <span className="text-[10px] text-[#857AA0]">{TOTAL_DAYS - streak}일 더 출석하면 보너스 +50P</span>
                  }
                  <span className={`text-[10px] font-semibold ${completed ? 'text-amber-400' : 'text-red-400'}`}>자세히 보기 →</span>
                </div>
              </div>
            </button>
            </div>
          )
        })()}

        {/* 행운의 숫자 잡기 이벤트 배너 — 게스트는 포인트가 없어 숨김 */}
        {!isGuest && (() => {
          const remaining = LUCKY_TIMER_MAX_ATTEMPTS - getLuckyTimerAttempts()
          return (
            <div style={reveal(4)}>
            <button
              onClick={onLuckyTimer}
              className="w-full overflow-hidden rounded-3xl shadow-[0_2px_16px_rgba(201,150,42,0.10)] active:scale-[0.99] transition-all"
            >
              <div
                className="relative overflow-hidden border border-[#C9962A40] rounded-3xl px-5 py-4 flex items-center gap-4"
                style={{ background: 'linear-gradient(135deg, #1A0E30 0%, #100820 60%, #060410 100%)' }}
              >
                <div
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-28 h-28 rounded-full blur-2xl pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(201,150,42,0.22), transparent 70%)' }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-[0.09] select-none pointer-events-none text-[#C9962A] rotate-12">
                  <IcLucky size={68}/>
                </div>
                <CornerOrnament size={20} className="absolute top-1.5 left-1.5 pointer-events-none opacity-70"/>
                <CornerOrnament size={20} className="absolute top-1.5 right-1.5 -scale-x-100 pointer-events-none opacity-70"/>
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-[#C9962A15] border border-[#C9962A35] flex items-center justify-center">
                  <span className="text-xl font-bold text-[#C9962A]" style={{ fontFamily: "'Gowun Batang', serif" }}>7</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[10px] text-[#C9962A] font-bold mb-0.5">오늘의 이벤트</p>
                  <p className="text-sm font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>
                    행운의 숫자 잡기 — 7초에 도전!
                  </p>
                  <p className="text-[11px] text-[#A79CC2] mt-0.5">
                    {remaining > 0 ? `성공 시 +20P, 참가만 해도 +5P · 남은 기회 ${remaining}/${LUCKY_TIMER_MAX_ATTEMPTS}` : '오늘 참여 완료 · 내일 다시 도전'}
                  </p>
                </div>
                <span className="text-[11px] text-[#C9962A] font-semibold shrink-0">
                  {remaining > 0 ? '도전 →' : '완료 ✓'}
                </span>
              </div>
            </button>
            </div>
          )
        })()}

        {/* ── 추천 콘텐츠 ── */}
        <p style={reveal(5)} className="text-xs font-semibold text-[#A79CC2] px-1 pt-2">추천 콘텐츠</p>

        {/* 추천 콘텐츠 프로모 카드 — 2열 그리드, 코드로 제작 (다크/별자리 테마) */}
        <div style={reveal(5)} className="grid grid-cols-2 gap-3">
          <PromoCard Icon={IcOutfit}   title="오늘의 코디"     subtitle="오행 기반 데일리 스타일링"    accent="#E05282" onClick={() => onNavigate('outfit')}   />
          <PromoCard Icon={IcJob}      title="취업운"          subtitle="합격·취업을 위한 사주 전략"     accent="#4BBF7E" onClick={() => onNavigate('job')}      />
          <PromoCard Icon={IcSinnyeon} title="신년 대박 운세"  subtitle="새해 기회와 성취 로드맵"        accent="#C9962A" onClick={() => onNavigate('sinnyeon')} />
          <PromoCard Icon={IcTojeong}  title="토정비결"        subtitle="지혜로운 삶의 이정표"           accent="#A78BFA" onClick={() => onNavigate('tojeong')}  />
        </div>

      </div>

      <AdBanner />

      <div className="text-center pb-2 text-xs text-[#857AA0]">사주팔자 — 양력 기준 · 절기 근사값 적용</div>
      <div className="text-center pb-3 text-xs text-[#857AA0]">
        <button onClick={onShowPrivacy} className="underline hover:text-[#A79CC2] transition">개인정보처리방침</button>
        <span className="mx-2">·</span>
        <button onClick={onShowTerms} className="underline hover:text-[#A79CC2] transition">이용약관</button>
        {!isGuest && (
          <>
            <span className="mx-2">·</span>
            <button onClick={onDeleteAccount} className="underline hover:text-[#E05252] transition">회원탈퇴</button>
          </>
        )}
      </div>
    </div>
  )
}
