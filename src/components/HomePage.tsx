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

function CornerOrnament({ className = '', size = 30 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill="none" className={className}>
      <path d="M2 22V6Q2 2 6 2H22" stroke="#C9962A" strokeWidth="1.3" opacity="0.65"/>
      <path d="M7 26V10Q7 7 10 7H26" stroke="#C9962A" strokeWidth="1" opacity="0.4"/>
      <circle cx="6" cy="2" r="1.4" fill="#E8C75C" opacity="0.8"/>
    </svg>
  )
}

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
      className="relative overflow-hidden rounded-3xl border p-5 flex flex-col text-left active:scale-[0.97] transition-all min-h-[135px] bg-[#130E24]/40 backdrop-blur-xl group hover:border-[#C9962A]/40"
      style={{
        borderColor: accent + '25',
        boxShadow: `0 4px 20px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.05)`,
      }}
    >
      <div
        className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl pointer-events-none transition-transform duration-500 group-hover:scale-125"
        style={{ background: `radial-gradient(circle, ${accent}30, transparent 75%)` }}
      />
      <span className="absolute pointer-events-none" style={{ right: '14%', top: '18%', color: accent, fontSize: 9, opacity: 0.6 }}>✦</span>

      <span
        className="relative shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:-translate-y-0.5"
        style={{ background: accent + '12', border: `1px solid ${accent}35`, color: accent, boxShadow: `0 0 12px ${accent}20 inset` }}
      >
        <Icon size={24} />
      </span>

      <p className="relative text-[14px] font-bold text-[#F5EDD4] tracking-wide" style={{ fontFamily: "'Gowun Batang', serif" }}>{title}</p>
      <p className="relative text-[11px] text-[#A79CC2] mt-1 leading-snug font-medium">{subtitle}</p>
    </button>
  )
}

function MatchHeroCard({
  summary, onOpen, delay,
}: {
  summary: { matches: number; unread: number; likes: number }
  onOpen: () => void; delay: React.CSSProperties
}) {
  const { matches, unread, likes } = summary
  let title: string, sub: string, badge = 0
  
  if (likes > 0)        { title = `${likes}명의 인연이 시그널을 보냈어요`; sub = '나의 사주와 이어진 비밀 인연을 확인하세요'; badge = likes }
  else if (unread > 0)  { title = `새로운 운명의 메세지 ${unread}개`;      sub = '은밀하게 연결된 대화방이 열려있습니다'; badge = unread }
  else if (matches > 0) { title = `연결된 인연 ${matches}명`;           sub = '천생연분의 사주 호흡을 마저 이어가 보세요' }
  else                  { title = '천상의 요람 · 실시간 사주 매칭';       sub = '현재 12명의 익명 인연들이 당신의 사주를 기다리고 있어요' }

  return (
    <div style={delay}>
      <button
        onClick={onOpen}
        className="w-full relative overflow-hidden rounded-3xl border p-5 flex items-center gap-4 active:scale-[0.98] transition-all bg-gradient-to-br from-[#1C1438]/70 via-[#130E24]/90 to-[#0A0714] hover:shadow-[0_0_25px_rgba(201,150,42,0.15)] hover:border-[#C9962A]/40 group"
        style={{ borderColor: 'rgba(201,150,42,0.25)', boxShadow: `0 10px 30px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255,255,255,0.05)` }}
      >
        {/* 우주적인 오로라 빛 번짐 연출 */}
        <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-44 h-44 rounded-full bg-[#C9962A]/10 blur-3xl pointer-events-none" />
        
        <span className="absolute pointer-events-none animate-pulse" style={{ right: '18%', top: '22%', color: '#C9962A', fontSize: 11, opacity: 0.8 }}>✦</span>

        <span className="relative shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center bg-[#1A0E30] border border-[#C9962A]/40 shadow-[0_0_15px_rgba(201,150,42,0.2)] text-[#C9962A] group-hover:scale-105 transition-transform duration-300">
          <IcMatch size={28} className="animate-[spin_40s_linear_infinite]" />
          {badge > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center border-2 border-[#1A0E30] animate-bounce">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </span>

        <div className="relative flex-1 text-left min-w-0">
          {/* 실시간 라이브 인원 펄스 배너 */}
          {matches === 0 && likes === 0 && unread === 0 && (
            <div className="inline-flex items-center gap-1.5 bg-[#C9962A]/10 border border-[#C9962A]/30 px-2 py-0.5 rounded-full mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-bold text-[#E8C75C] tracking-tight uppercase">LIVE MATCHING</span>
            </div>
          )}
          <p className="text-[15px] font-bold text-[#F5EDD4] tracking-wide truncate" style={{ fontFamily: "'Gowun Batang', serif" }}>{title}</p>
          <p className="text-[11px] text-[#BCB1D4] mt-0.5 leading-snug font-medium truncate">{sub}</p>
        </div>

        <span className="relative text-xs font-bold shrink-0 bg-[#C9962A]/10 px-3 py-1.5 rounded-xl border border-[#C9962A]/20 text-[#E8C75C] group-hover:bg-[#C9962A]/20 transition-colors">
          {matches > 0 || likes > 0 ? '입장' : '탐색'}
        </span>
      </button>
    </div>
  )
}

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
    <div className="flex items-center justify-between bg-[#130E24]/50 backdrop-blur-md rounded-3xl border border-[#2A1F4A] px-4 py-3.5 shadow-inner">
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 rounded-full bg-[#C9962A10] border border-[#C9962A20] flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 3a5 5 0 0 0-5 5v3.5L5.5 15h13L17 11.5V8a5 5 0 0 0-5-5z" stroke="#C9962A" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M10 18a2 2 0 0 0 4 0" stroke="#C9962A" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
        <div>
          <p className="text-sm font-semibold text-[#F5EDD4]">매일 아침 서신 알림</p>
          <p className={`text-[11px] ${msg ? 'text-rose-400' : 'text-[#A79CC2]'}`}>
            {busy ? '처리 중…' : msg ?? '오전 8시, 하늘이 전하는 오늘의 운세 서신'}
          </p>
        </div>
      </div>
      <button
        onClick={toggle}
        disabled={busy}
        aria-label="매일 운세 알림 토글"
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 disabled:opacity-60 ${enabled ? 'bg-[#C9962A]' : 'bg-[#2A1F4A]'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${enabled ? 'left-[22px]' : 'left-0.5'}`} />
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
  { Icon: IcTodayFortune, label: '오늘운세',  dest: 'today',     sub: '하루 기운' },
  { Icon: IcSaju,         label: '정통사주',  dest: 'saju',      sub: '명리 분석' },
  { Icon: IcTarot,        label: '타로상담',  dest: 'tarot',     sub: 'AI 비전' },
  { Icon: IcBattle,       label: '운세대결',  dest: 'battle',    sub: '인연 전장' },
  { Icon: IcMatch,        label: '사주매칭',  dest: 'match',     sub: '비밀 인연' },
  { Icon: IcDaun,         label: '대운분석',  dest: 'daun',      sub: '10년 평생' },
  { Icon: IcGunghab,      label: '궁합보기',  dest: 'gunghab',   sub: '상성 조화' },
  { Icon: IcDream,        label: '꿈해몽',    dest: 'dream',     sub: '전통 무속' },
  { Icon: IcDeepSaju,     label: '심층해석',  dest: 'deepsaju',  sub: '일간 본질' },
  { Icon: IcOutfit,       label: '오늘코디',  dest: 'outfit',    sub: '색채 비책' },
  { Icon: IcJob,          label: '취업운',    dest: 'job',       sub: '명예 관운' },
]

const ELEMENT_TO_CHIP: Record<string, typeof CHIPS[number]['dest']> = {
  wood:  'daun',
  fire:  'outfit',
  earth: 'saju',
  metal: 'job',
  water: 'dream',
}

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

  const reveal = (i: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(14px)',
    transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
    transitionDelay: `${Math.min(i, 6) * 70}ms`,
  })

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
    if (isGuest) return
    const { next, claimed, milestone } = tryClaimDaily(points)
    if (claimed) {
      onPointsUpdate(next)
      setDailyToast(milestone ? { milestone: milestone.days, bonus: milestone.bonus } : true)
      setTimeout(() => setDailyToast(false), milestone ? 3600 : 2800)
    }
  }, [])

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
    <div className="min-h-screen relative bg-[#090614]">

      {/* 배경 장식 (블롭 + 오행 격자) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#C9962A]/5 blur-[120px]" />
        <div className="absolute top-1/4 -left-40 w-96 h-96 rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full bg-indigo-900/10 blur-[130px]" />
        {[
          { ch: '木', x: '6%',  y: '8%',  c: '#86EFAC', s: '12px' },
          { ch: '火', x: '91%', y: '14%', c: '#FCA5A5', s: '11px' },
          { ch: '水', x: '4%',  y: '46%', c: '#93C5FD', s: '12px' },
          { ch: '金', x: '92%', y: '52%', c: '#D1D5DB', s: '11px' },
          { ch: '土', x: '8%',  y: '86%', c: '#FCD34D', s: '11px' },
          { ch: '✦',  x: '85%', y: '34%', c: '#C4B5FD', s: '11px' },
          { ch: '✦',  x: '12%', y: '28%', c: '#C4B5FD', s: '9px'  },
          { ch: '⋆',  x: '78%', y: '78%', c: '#DDD6FE', s: '14px' },
        ].map((d, i) => (
          <span key={i} className="absolute select-none font-bold opacity-40"
            style={{ left: d.x, top: d.y, color: d.c, fontSize: d.s }}>
            {d.ch}
          </span>
        ))}
      </div>

      {dailyToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#C9962A] text-[#0D0A1A] text-xs font-bold px-6 py-3 rounded-full shadow-2xl animate-bounce text-center tracking-wide">
          {dailyToast === true ? '✦ 출석 보너스 +10P 정산완료' : `✦ ${dailyToast.milestone}일 연속 서신 보너스 +${10 + dailyToast.bonus}P`}
        </div>
      )}
      {showPoints && <PointsModal points={points} onClose={() => setShowPoints(false)} onPointsUpdate={onPointsUpdate} />}

      {/* 상단 바 헤더 */}
      <div className="bg-[#130E24]/60 backdrop-blur-xl border-b border-[#2A1F4A]/60 sticky top-0 z-30 shadow-[0_1px_15px_rgba(0,0,0,0.2)]">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-wider text-[#F5EDD4] drop-shadow-md" style={{ fontFamily: "'Gowun Batang', serif" }}>운명봄</h1>
          <div className="flex items-center gap-3">
            {!isGuest && (
              <button
                onClick={() => setShowPoints(true)}
                className="flex items-center gap-1.5 bg-[#C9962A12] border border-[#C9962A35] px-3.5 py-1.5 rounded-full hover:bg-[#C9962A20] transition-all active:scale-95 shadow-md shadow-[#000]/20"
              >
                <IcGem size={13} className="text-[#C9962A]"/>
                <span className="text-xs font-bold tracking-tight text-[#E8C75C]">{animatedBalance.toLocaleString()}P</span>
              </button>
            )}
            {isGuest
              ? <button onClick={onRequestLogin} className="text-xs font-bold text-[#C9962A] bg-[#C9962A15] border border-[#C9962A30] rounded-full px-3 py-1.5 hover:bg-[#C9962A25] transition">로그인</button>
              : <button onClick={onLogout} className="text-xs font-medium text-[#A79CC2] hover:text-rose-400 transition-colors px-1 py-1">로그아웃</button>
            }
            {photo || user.picture
              ? <img src={photo ?? user.picture} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-[#2A1F4A] shadow-inner"/>
              : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md"><span className="text-white text-xs font-bold">{user.name[0]}</span></div>
            }
          </div>
        </div>
      </div>

      {isGuest && (
        <div className="max-w-2xl mx-auto px-4 pt-4 z-10 relative">
          <button
            onClick={onRequestLogin}
            className="w-full flex items-center justify-between gap-3 bg-gradient-to-r from-[#C9962A15] to-[#130E24] border border-[#C9962A30] rounded-2xl px-4 py-3 text-left active:scale-[0.99] transition shadow-md"
          >
            <p className="text-xs text-[#E8DFC8]">
              <span className="font-bold text-[#C9962A]">임시 게스트 관람 모드</span> · 회원가입 시 오늘의 행운 지표를 매일 누적할 수 있어요.
            </p>
            <span className="text-xs text-[#C9962A] font-bold shrink-0">가입 →</span>
          </button>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5 relative z-10">

        {/* 인사 + 한줄운세 카드 (유리 글래스모피즘 효과 고도화) */}
        <div style={reveal(0)}>
          <div
            className="relative overflow-hidden rounded-3xl p-6 border shadow-2xl shadow-black/50 transition-all duration-500 bg-[#16102E]/40 backdrop-blur-xl"
            style={{ borderColor: todayAccent + '30', boxShadow: `0 15px 35px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.04)` }}
          >
            {/* 상단 오라 장식 */}
            <div className="absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: todayAccent }} />

            <div className="relative flex items-center justify-between gap-2 mb-2">
              <p className="text-[#A79CC2] text-xs font-medium">
                {todayDate.getFullYear()}년 {month}월 {day}일 · 반가운 기운이 감도는 {user.name}님
              </p>
              {todayFortune.element && (
                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase shadow-sm"
                  style={{ color: todayAccent, borderColor: todayAccent + '40', backgroundColor: todayAccent + '10' }}
                >
                  {ELEMENT_LABELS[todayFortune.element]} 기운 가득
                </span>
              )}
            </div>
            
            <p className="relative text-base font-bold text-[#F5EDD4] mb-3.5 tracking-wide" style={{ fontFamily: "'Gowun Batang', serif" }}>
              오늘의 독조(讀兆) 한 줄 평
            </p>

            {/* 3D 운세 카드 뒤집기 */}
            <div className="relative" style={{ perspective: '1200px' }}>
              <div
                className="grid transition-transform duration-700 ease-out"
                style={{ transformStyle: 'preserve-3d', transform: fortuneRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
              >
                {/* 뒷면 카드 */}
                <button
                  onClick={revealTodayFortune}
                  aria-label="오늘의 운세 서신 펼치기"
                  className="[grid-area:1/1] w-full flex items-center gap-4 rounded-2xl px-5 py-4 border text-left active:scale-[0.99] transition-transform bg-[#1C1438]/60 hover:bg-[#1C1438]/80 group"
                  style={{ borderColor: todayAccent + '30', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.05)' }}
                >
                  <span
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center animate-pulse shadow-md transition-colors"
                    style={{ backgroundColor: todayAccent + '15', color: todayAccent, border: `1px solid ${todayAccent}40` }}
                  >
                    <IcSaju size={22} />
                  </span>
                  <span className="flex-1">
                    <p className="text-sm font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>오늘 도래한 운명 카드</p>
                    <p className="text-[11px] font-bold mt-0.5" style={{ color: todayAccent }}>기운을 밀어 장막 걷기 (탭) ✦</p>
                  </span>
                </button>

                {/* 앞면 카드 */}
                <div
                  className="[grid-area:1/1] flex gap-4 items-center rounded-2xl px-5 py-4 border bg-gradient-to-r from-[#130E24]/90 to-[#1F173A]/90 backdrop-blur-xl shadow-inner"
                  style={{ borderColor: todayAccent + '35', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <span
                    className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border"
                    style={{ backgroundColor: todayAccent + '15', color: todayAccent, borderColor: todayAccent + '30' }}
                  >
                    <IcSparkleKeyword size={16} />
                  </span>
                  <p className="text-[13px] leading-relaxed font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>{todayFortune.text}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('today')}
              className="relative mt-3.5 text-xs font-bold hover:underline transition flex items-center gap-1"
              style={{ color: todayAccent }}
            >
              오늘 전체 운세 리포트 확인하기 →
            </button>
          </div>
        </div>

        {/* 🧭 고급형 럭셔리 라이브 매칭 배너 */}
        <MatchHeroCard summary={matchSummary} onOpen={() => onNavigate('match')} delay={reveal(1)} />

        {/* 아이콘 메뉴 판넬 (Glassmorphism 투명 격자 그리드 구조) */}
        <div style={reveal(2)} className="bg-[#130E24]/40 backdrop-blur-xl rounded-3xl border border-[#2A1F4A]/60 shadow-[0_10px_30px_rgba(0,0,0,0.3)] p-5">
          <p className="text-xs font-bold tracking-wider text-[#A79CC2] mb-4 px-1 uppercase">천기누설 메뉴 조합</p>
          <div className="grid grid-cols-4 gap-x-2 gap-y-5">
            {CHIPS.map(chip => {
              const recommended = chip.dest === recommendedChip
              return (
                <button
                  key={chip.dest}
                  onClick={() => onNavigate(chip.dest)}
                  className="relative flex flex-col items-center gap-2.5 active:scale-90 transition-transform group"
                >
                  {recommended && (
                    <span
                      className="absolute -top-1.5 -right-0.5 z-10 text-[8px] font-extrabold text-white px-1.5 py-0.5 rounded-full shadow-md whitespace-nowrap tracking-tighter uppercase scale-90 animate-pulse"
                      style={{ backgroundColor: todayAccent }}
                    >
                      추천
                    </span>
                  )}
                  <div
                    className="relative w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden backdrop-blur-md transition-all duration-300 shadow-md group-hover:scale-105"
                    style={recommended
                      ? { background: 'rgba(201,150,42,0.12)', border: `1.5px solid ${todayAccent}`, boxShadow: `0 0 15px ${todayAccent}33` }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,150,42,0.25)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.02)' }}
                  >
                    <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                    <span className="relative group-hover:rotate-6 transition-transform duration-300" style={recommended ? { color: todayAccent } : undefined}>
                      <chip.Icon size={25} className={recommended ? '' : 'text-[#E8C75C]'}/>
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-[#F5EDD4] font-bold tracking-tight leading-tight group-hover:text-[#E8C75C] transition-colors">{chip.label}</p>
                    <p className="text-[9px] mt-0.5 font-medium" style={{ color: recommended ? todayAccent : '#A79CC2' }}>{chip.sub}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 매일 알림 */}
        {!isGuest && (
          <div style={reveal(2)}>
            <NotifyToggle />
          </div>
        )}

        {/* 사주 정보 등록 상태 배너 */}
        {birthProfile && (
          <div style={reveal(2)} className="flex items-center justify-between bg-[#C9962A0c] border border-[#C9962A25] rounded-2xl px-4 py-3 shadow-inner">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-[#C9962A] text-xs font-bold shrink-0">✓ 명식조율 완료</span>
              <p className="text-xs text-[#BCB1D4] font-medium truncate">
                {nickname && <span className="font-bold text-[#F5EDD4]">{nickname}</span>}
                {nickname && <span className="text-[#2A1F4A] mx-1.5">|</span>}
                <span>{birthProfile.year}.{String(birthProfile.month).padStart(2,'0')}.{String(birthProfile.day).padStart(2,'0')}</span>
                <span className="opacity-60 ml-1">({birthProfile.gender === 'male' ? '乾' : '坤'})</span>
              </p>
            </div>
            <button onClick={onEditProfile} className="text-xs text-[#C9962A] font-bold hover:text-[#E8B84B] transition-colors shrink-0 pl-2">변경</button>
          </div>
        )}

        {/* 프로필 미설정 고지 */}
        {!birthProfile && (
          <button
            onClick={onEditProfile}
            style={reveal(2)}
            className="w-full flex items-center justify-between gap-3 bg-gradient-to-r from-[#1F143A]/60 to-[#0A0714] border border-[#C9962A35] rounded-3xl px-5 py-4 text-left active:scale-[0.99] transition shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
          >
            <div className="flex items-center gap-3.5">
              <span className="w-10 h-10 rounded-xl bg-[#C9962A15] border border-[#C9962A25] flex items-center justify-center text-[#C9962A] shrink-0 shadow-md"><IcProfile size={18} /></span>
              <div>
                <p className="text-sm font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>생년월시(사주명식) 미등록</p>
                <p className="text-xs text-[#A79CC2] mt-0.5">정확한 사주가 등록되어야 맞춤형 리포트 개방이 가능합니다.</p>
              </div>
            </div>
            <span className="text-xs text-[#C9962A] font-bold shrink-0 bg-[#C9962A]/10 px-2.5 py-1.5 rounded-xl border border-[#C9962A]/20">등록</span>
          </button>
        )}

        {/* 대운 카드 */}
        {daunInfo && (
          <div style={reveal(2)}>
            <button
              onClick={() => onNavigate('daun')}
              className="w-full bg-[#130E24]/30 rounded-3xl border border-[#2A1F4A]/70 p-5 text-left hover:border-[#C9962A35] active:scale-[0.99] transition-all shadow-[0_10px_25px_rgba(0,0,0,0.4)] relative overflow-hidden group"
            >
              <div className="absolute right-0 bottom-0 w-24 h-24 bg-[#C9962A]/2 blur-xl pointer-events-none group-hover:bg-[#C9962A]/5 transition-colors" />
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#C9962A10] border border-[#C9962A25] flex items-center justify-center flex-shrink-0 shadow-sm text-[#C9962A]">
                  <IcDaun size={22}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className="text-xs font-bold text-[#C9962A] uppercase tracking-wide">현시대 대운흐름</p>
                    <span className="text-[10px] bg-amber-950/40 text-amber-300 border border-amber-900/40 px-2.5 py-0.5 rounded-full font-bold">
                      {daunInfo.pillarStr} · {daunInfo.sipsin}運
                    </span>
                  </div>
                  <p className="text-[14px] font-bold text-[#F5EDD4] mb-1 leading-snug flex items-start gap-1.5" style={{ fontFamily: "'Gowun Batang', serif" }}>
                    <span className="text-[#C9962A] shrink-0 mt-0.5"><IcSparkleKeyword size={12} /></span>
                    <span>
                      {daunInfo.sipsin === '정관' ? '조직에서 명예와 지위가 곧게 서는 대운의 시기' :
                       daunInfo.sipsin === '편관' ? '막중한 중책을 이겨내고 권위를 쟁취하는 시기' :
                       daunInfo.sipsin === '식신' ? '스스로의 전문성을 발휘해 식록을 넓히는 시기' :
                       daunInfo.sipsin === '정재' ? '규칙적인 자산과 견고한 안정이 형성되는 시기' :
                       daunInfo.sipsin === '편재' ? '큰 무대의 재물과 과감한 기회가 도래하는 시기' :
                       daunInfo.sipsin === '상관' ? '규율을 타파하고 독창적 돌파구를 여는 시기' :
                       daunInfo.sipsin === '비견' ? '주체성이 고조되며 자립 기반을 세우는 시기' :
                       daunInfo.sipsin === '겁재' ? '경쟁을 헤쳐나가며 판도를 크게 바꾸는 시기' :
                       daunInfo.sipsin === '정인' ? '귀인의 전폭적 조력과 학업 문서운이 따르는 시기' :
                       daunInfo.sipsin === '편인' ? '비범한 지혜와 예리한 전환점을 마주하는 시기' :
                       `${daunInfo.meaning}의 기운이 지배하는 거대한 흐름의 장`}
                    </span>
                  </p>
                  <p className="text-[11px] text-[#A79CC2] font-medium">{daunInfo.ageRange} 사주 주기 · 정밀 대운분석 보기 →</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* ── 이벤트 대문 ── */}
        <p style={reveal(3)} className="text-xs font-bold tracking-wider text-[#A79CC2] px-1 pt-2 uppercase">시공간 이벤트</p>

        {/* 타로 배너 */}
        <div style={reveal(3)}>
          <button
            onClick={() => onNavigate('tarot')}
            className="w-full text-left relative overflow-hidden rounded-3xl border border-[#d4af37]/25 bg-gradient-to-b from-[#19112F]/80 to-[#0A0714] p-6 shadow-2xl active:scale-[0.98] transition-all group hover:border-[#d4af37]/50"
            style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.03)' }}
          >
            <div className="flex items-center justify-center mb-6 h-28 relative">
              <div className="absolute inset-x-0 top-0 h-full flex items-center justify-center pointer-events-none">
                <div className="w-48 h-24 rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(circle, rgba(232,199,92,0.4), transparent 70%)' }} />
              </div>

              <div className="flex justify-center items-center -space-x-4 relative z-10">
                {TAROT_CARD_IMAGES.map((card, i) => (
                  <div
                    key={card.src}
                    className={`w-15 h-24 rounded-lg border border-[#d4af37]/40 overflow-hidden shadow-2xl transition-all duration-300 group-hover:translate-y-[-4px] ${card.rotate} ${i === 1 || i === 2 ? 'z-20 border-[#d4af37]/60' : 'z-10'}`}
                  >
                    <img src={card.src} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#2A1F4A]/60">
              <div>
                <h3 className="text-base font-bold text-[#e8c75c] tracking-wide" style={{ fontFamily: "'Gowun Batang', serif" }}>
                  AI 차원 서양 타로 오라클
                </h3>
                <p className="text-xs text-[#A79CC2] mt-0.5 font-medium">풀리지 않는 당면 과제를 무의식의 카드로 점칩니다.</p>
              </div>
              <span className="flex items-center space-x-1 px-4 py-1.5 rounded-full border border-[#d4af37]/60 bg-[#d4af37]/5 text-[11px] font-bold text-[#e8c75c] group-hover:bg-[#d4af37]/15 transition-colors">
                <span>점성 개시</span>
                <span>→</span>
              </span>
            </div>
          </button>
        </div>

        {/* 출석체크 (보라/진홍빛 톤 세련화) */}
        {!isGuest && (() => {
          const checked = points.lastDaily === new Date().toISOString().slice(0, 10)
          const TOTAL_DAYS = 7
          const completed = streak >= TOTAL_DAYS
          return (
            <div style={reveal(3)}>
              <button
                onClick={onAttendance}
                className="w-full overflow-hidden rounded-3xl active:scale-[0.98] transition-all shadow-xl"
              >
                <div
                  className={`relative overflow-hidden border rounded-3xl px-5 py-4 ${completed ? 'border-amber-500/40' : 'border-[#2A1F4A]'}`}
                  style={{ background: 'linear-gradient(135deg, #130E24/90 0%, #0A0714 100%)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.03)' }}
                >
                  <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none bg-rose-500" />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-[0.06] select-none pointer-events-none text-rose-500 rotate-12">
                    <IcStamp size={70}/>
                  </div>
                  <CornerOrnament size={16} className="absolute top-2 left-2 pointer-events-none opacity-40"/>
                  <CornerOrnament size={16} className="absolute top-2 right-2 -scale-x-100 pointer-events-none opacity-40"/>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <div className="relative shrink-0 w-11 h-11 flex items-center justify-center">
                      <div className={`absolute inset-0 rounded-full border-2 transition-all ${checked ? 'border-rose-900/40 bg-rose-950/20' : 'border-rose-600 animate-pulse'}`}/>
                      {checked
                        ? <div className="flex flex-col items-center"><span className="text-rose-400 text-sm font-bold">✓</span><span className="text-[8px] text-rose-500 font-extrabold -mt-0.5">완료</span></div>
                        : <div className="flex flex-col items-center"><span className="text-[9px] font-extrabold text-rose-400 leading-tight text-center" style={{ fontFamily: "'Gowun Batang', serif" }}>출석<br/>도장</span></div>
                      }
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold leading-tight" style={{ fontFamily: "'Gowun Batang', serif", color: checked ? '#A79CC2' : '#F5EDD4' }}>
                        {checked ? '오늘의 출석 증명을 완료했습니다.' : '일일 출석각인 및 포인트 적립'}
                      </p>
                      <p className="text-[11px] text-[#BCB1D4] mt-0.5 font-medium">
                        {checked ? `${streak}일 연속 달성 중 · 통장 귀속 완료` : `매일 명식 조율 참여 시 +10P 확정 지급`}
                      </p>
                    </div>
                    {!checked
                      ? <div className="shrink-0 px-3 py-1.5 rounded-xl bg-rose-600/20 border border-rose-500/40 text-white text-[10px] font-bold shadow-sm">+10P</div>
                      : <span className="text-[11px] text-[#A79CC2] font-semibold shrink-0 pr-1">확인 →</span>
                    }
                  </div>

                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: TOTAL_DAYS }).map((_, i) => {
                      const filled = i < streak
                      const isToday = checked && i === streak - 1
                      return (
                        <div
                          key={i}
                          className={`flex-1 h-6 rounded-lg border flex items-center justify-center transition-all duration-300 text-[9px] font-bold ${filled ? (isToday ? 'border-rose-500 bg-rose-600 text-white shadow-sm' : 'border-rose-950/60 bg-rose-950/30 text-rose-400') : 'border-[#2A1F4A] bg-[#16102E]/60 text-[#857AA0]'}`}
                          style={{
                            transform: streakMounted ? 'scale(1)' : 'scale(0)',
                            transitionDelay: streakMounted ? `${i * 50}ms` : '0ms',
                          }}
                        >
                          {i + 1}일
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="mt-3 pt-2 border-t border-[#2A1F4A]/50 flex items-center justify-between text-[10px] font-medium">
                    {completed
                      ? <span className="text-amber-400 font-bold">✦ 7일 만개 보너스 +50P가 누적되었습니다.</span>
                      : <span className="text-[#857AA0]">{TOTAL_DAYS - streak}일 더 연속 도장 완료 시 +50P 추가 정산</span>
                    }
                    <span className="text-rose-400 font-bold">자세히 보기 →</span>
                  </div>
                </div>
              </button>
            </div>
          )
        })()}

        {/* 기회 잡기 이벤트 배너 */}
        {!isGuest && (() => {
          const remaining = LUCKY_TIMER_MAX_ATTEMPTS - getLuckyTimerAttempts()
          return (
            <div style={reveal(4)}>
              <button
                onClick={onLuckyTimer}
                className="w-full overflow-hidden rounded-3xl shadow-lg active:scale-[0.98] transition-all"
              >
                <div
                  className="relative overflow-hidden border border-[#C9962A]/30 rounded-3xl px-5 py-4 flex items-center gap-4 bg-[#130E24]/60 backdrop-blur-sm shadow-inner"
                >
                  <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-[#C9962A]/5 blur-2xl pointer-events-none" />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-[0.05] select-none pointer-events-none text-[#C9962A] rotate-6">
                    <IcLucky size={60}/>
                  </div>
                  <CornerOrnament size={16} className="absolute top-2 left-2 pointer-events-none opacity-30"/>
                  <CornerOrnament size={16} className="absolute top-2 right-2 -scale-x-100 pointer-events-none opacity-30"/>
                  
                  <div className="shrink-0 w-11 h-11 rounded-xl bg-[#C9962A]08 border border-[#C9962A]30 flex items-center justify-center">
                    <span className="text-lg font-bold text-[#E8C75C]" style={{ fontFamily: "'Gowun Batang', serif" }}>7</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[10px] text-[#C9962A] font-extrabold tracking-wider uppercase mb-0.5">찰나의 기운</p>
                    <p className="text-sm font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>
                      협시 정밀 타이머 — 7.00초 저격
                    </p>
                    <p className="text-[11px] text-[#A79CC2] mt-0.5 font-medium">
                      {remaining > 0 ? `성공 시 +20P 보상 · 오늘 잔여 조율 행운 ${remaining}/${LUCKY_TIMER_MAX_ATTEMPTS}` : '금일 배정된 타이머 행운 소진 · 내일 다시 도래'}
                    </p>
                  </div>
                  <span className="text-[11px] text-[#C9962A] font-bold shrink-0 bg-[#C9962A]/5 border border-[#C9962A]/20 px-2.5 py-1.5 rounded-xl">
                    {remaining > 0 ? '도전' : '봉인'}
                  </span>
                </div>
              </button>
            </div>
          )
        })()}

        {/* ── 추천 콘텐츠 (투명 유리 격자 그리드) ── */}
        <p style={reveal(5)} className="text-xs font-bold tracking-wider text-[#A79CC2] px-1 pt-2 uppercase">궁극의 비책 리포트</p>

        <div style={reveal(5)} className="grid grid-cols-2 gap-3">
          <PromoCard Icon={IcOutfit}   title="의복 색채 매칭"   subtitle="오행 기반 스타일 비책"    accent="#E05282" onClick={() => onNavigate('outfit')}   />
          <PromoCard Icon={IcJob}      title="공명 취업 청사진"  subtitle="합격 관운의 사주 전략"     accent="#4BBF7E" onClick={() => onNavigate('job')}      />
          <PromoCard Icon={IcSinnyeon} title="신년 대운 로드맵"  subtitle="새해 기회와 성취 요약"      accent="#C9962A" onClick={() => onNavigate('sinnyeon')} />
          <PromoCard Icon={IcTojeong}  title="평생 토정비결"    subtitle="삶의 화를 피하는 이정표"    accent="#A78BFA" onClick={() => onNavigate('tojeong')}  />
        </div>

      </div>

      <AdBanner />

      <div className="text-center pb-2 text-xs text-[#857AA0] relative z-10 tracking-tight">정통 명리학 기준 역법 산출 · 절기 입절 시각 근사값 반영</div>
      <div className="text-center pb-4 text-xs text-[#857AA0] relative z-10 font-medium">
        <button onClick={onShowPrivacy} className="underline hover:text-[#C4B8D8] transition-colors">개인정보처리방침</button>
        <span className="mx-2.5 text-[#2A1F4A]">|</span>
        <button onClick={onShowTerms} className="underline hover:text-[#C4B8D8] transition-colors">이용약관</button>
        {!isGuest && (
          <>
            <span className="mx-2.5 text-[#2A1F4A]">|</span>
            <button onClick={onDeleteAccount} className="underline hover:text-rose-400 transition-colors">회원탈퇴</button>
          </>
        )}
      </div>
    </div>
  )
}
