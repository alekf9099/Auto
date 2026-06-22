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
import {
  IcSaju, IcTodayFortune, IcDaun, IcGunghab, IcDeepSaju, IcDream, IcTarot, IcOutfit, IcJob, IcGem, IcStamp, IcSinnyeon, IcLucky, IcBattle, IcMatch,
} from './icons/SajuIcons'

interface Props {
  user: UserInfo
  nickname: string
  birthProfile: BirthInput | null
  points: PointsState
  onPointsUpdate: (p: PointsState) => void
  onNavigate: (dest: 'saju' | 'sinnyeon' | 'tojeong' | 'today' | 'daun' | 'gunghab' | 'deepsaju' | 'dream' | 'tarot' | 'outfit' | 'job' | 'battle' | 'match') => void
  onAttendance: () => void
  onLuckyTimer: () => void
  onEditProfile: () => void
  onLogout: () => void
  onShowPrivacy: () => void
  onShowTerms: () => void
}

// 배너 모서리를 장식하는 금색 이중선 브래킷 (전통 한지 액자 느낌)
function CornerOrnament({ className = '' }: { className?: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" className={className}>
      <path d="M2 22V6Q2 2 6 2H22" stroke="#C9962A" strokeWidth="1.3" opacity="0.65"/>
      <path d="M7 26V10Q7 7 10 7H26" stroke="#C9962A" strokeWidth="1" opacity="0.4"/>
      <circle cx="6" cy="2" r="1.4" fill="#E8C75C" opacity="0.8"/>
    </svg>
  )
}

// 카드 배경에 흩뿌려진 작은 별빛 — 은하수 같은 깊이감을 더함
const BANNER_STARS = [
  { top: '14%', left: '9%',  size: 2.5, opacity: 0.7 },
  { top: '24%', left: '92%', size: 2,   opacity: 0.5 },
  { top: '55%', left: '4%',  size: 1.8, opacity: 0.45 },
  { top: '70%', left: '88%', size: 2.4, opacity: 0.6 },
  { top: '8%',  left: '55%', size: 1.6, opacity: 0.4 },
  { top: '85%', left: '40%', size: 2,   opacity: 0.5 },
]

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

export default function HomePage({ user, nickname, birthProfile, points, onPointsUpdate, onNavigate, onAttendance, onLuckyTimer, onEditProfile, onLogout, onShowPrivacy, onShowTerms }: Props) {
  const todayDate = new Date()
  const month = todayDate.getMonth() + 1
  const day   = todayDate.getDate()

  const [photo] = useState<string | null>(loadProfilePhoto)
  const [showPoints, setShowPoints] = useState(false)
  const [dailyToast, setDailyToast] = useState<{ milestone: number; bonus: number } | true | false>(false)
  const [mounted, setMounted] = useState(false)
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
    <div className="min-h-screen bg-[#0D0A1A]">

      {dailyToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#C9962A] text-[#0D0A1A] text-xs font-semibold px-5 py-2.5 rounded-full shadow-lg animate-bounce text-center">
          {dailyToast === true
            ? '🎉 출석 보너스 +10P 지급!'
            : `🎉 ${dailyToast.milestone}일 연속 출석 달성! +${10 + dailyToast.bonus}P 지급!`}
        </div>
      )}
      {showPoints && <PointsModal points={points} onClose={() => setShowPoints(false)} />}

      {/* 상단 바 */}
      <div className="bg-[#130E24] border-b border-[#2A1F4A] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>운명봄</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPoints(true)}
              className="flex items-center gap-1 bg-[#C9962A15] border border-[#C9962A30] px-3 py-1.5 rounded-full hover:bg-[#C9962A25] transition"
            >
              <IcGem size={14} className="text-[#C9962A]"/>
              <span className="text-xs font-bold text-[#C9962A]">{animatedBalance.toLocaleString()}P</span>
            </button>
            <button onClick={onLogout} className="text-xs text-[#A89BC0] hover:text-[#C4B8D8] transition px-2 py-1">로그아웃</button>
            {photo || user.picture
              ? <img src={photo ?? user.picture} alt={user.name} className="w-8 h-8 rounded-full object-cover"/>
              : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"><span className="text-white text-xs font-bold">{user.name[0]}</span></div>
            }
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* 인사 + 오늘 운세 한 줄 */}
        <div style={reveal(0)}>
        <div
          className="relative overflow-hidden rounded-3xl p-5 border shadow-xl shadow-[#000]/40 transition-colors duration-500"
          style={{ background: 'linear-gradient(135deg, #1A0E30 0%, #100820 60%, #060410 100%)', borderColor: todayAccent + '40' }}
        >
          {/* 은하수 별빛 */}
          <div className="absolute inset-0 pointer-events-none">
            {BANNER_STARS.map((star, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-[#E8C75C]"
                style={{ top: star.top, left: star.left, width: star.size, height: star.size, opacity: star.opacity }}
              />
            ))}
          </div>

          {/* 금색 액자 모서리 장식 */}
          <CornerOrnament className="absolute top-2 left-2 pointer-events-none"/>
          <CornerOrnament className="absolute top-2 right-2 -scale-x-100 pointer-events-none"/>
          <CornerOrnament className="absolute bottom-2 left-2 -scale-y-100 pointer-events-none"/>
          <CornerOrnament className="absolute bottom-2 right-2 -scale-x-100 -scale-y-100 pointer-events-none"/>

          <div className="relative flex items-center justify-between gap-2 mb-1">
            <p className="text-violet-300/70 text-xs">
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
          <p className="relative text-base font-bold text-[#F5EDD4] mb-3" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            오늘의 한 줄 운세
          </p>
          <div
            className="relative flex gap-3 items-start rounded-2xl px-4 py-3.5 border transition-colors duration-500"
            style={{ backgroundColor: todayAccent + '12', borderColor: todayAccent + '35' }}
          >
            <span
              className="text-base flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: todayAccent + '20' }}
            >
              💬
            </span>
            <p className="text-sm leading-relaxed font-semibold" style={{ color: '#F5EDD4' }}>{todayFortune.text}</p>
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

        {/* 가로 스크롤 칩 메뉴 */}
        <div style={reveal(1)} className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-4">
          <p className="text-xs text-[#7B6F9A] mb-3 px-1">기능 바로가기</p>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
            {CHIPS.map(chip => {
              const recommended = chip.dest === recommendedChip
              return (
                <button
                  key={chip.dest}
                  onClick={() => onNavigate(chip.dest)}
                  className="relative flex flex-col items-center gap-2 flex-shrink-0 active:scale-95 transition-transform"
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
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition"
                    style={recommended
                      ? { backgroundColor: todayAccent + '20', border: `1.5px solid ${todayAccent}80`, color: todayAccent }
                      : { backgroundColor: '#C9962A10', border: '1px solid #C9962A28' }}
                  >
                    <chip.Icon size={26} className={recommended ? '' : 'text-[#C9962A]'}/>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-[#C4B8D8] font-semibold leading-tight">{chip.label}</p>
                    <p className="text-[9px] mt-0.5" style={{ color: recommended ? todayAccent : '#7B6F9A' }}>{chip.sub}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 나만의 타로 상담 배너 */}
        <div style={reveal(2)}>
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
              <span>➔</span>
            </span>
          </div>
        </button>
        </div>

        {/* 출석체크 배너 */}
        {(() => {
          const checked = points.lastDaily === new Date().toISOString().slice(0, 10)
          const TOTAL_DAYS = 7
          const completed = streak >= TOTAL_DAYS
          return (
            <div style={reveal(2)}>
            <button
              onClick={onAttendance}
              className={`w-full overflow-hidden rounded-3xl active:scale-[0.99] transition-all ${completed ? 'shadow-[0_2px_20px_rgba(201,150,42,0.25)]' : 'shadow-[0_2px_16px_rgba(180,30,30,0.10)]'}`}
            >
              <div className={`relative bg-[#130E24] border rounded-3xl px-5 pt-4 pb-3 ${completed ? 'border-amber-500/50' : 'border-red-900/40'}`}>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-[0.06] select-none pointer-events-none text-red-800 rotate-12">
                  <IcStamp size={72}/>
                </div>
                <div className="absolute right-16 bottom-3 opacity-[0.04] select-none pointer-events-none text-red-700 -rotate-6">
                  <IcSinnyeon size={32}/>
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="relative shrink-0 w-[56px] h-[56px] flex items-center justify-center">
                    <div className={`absolute inset-0 rounded-full border-[3px] transition-all ${checked ? 'border-red-300' : 'border-red-500'}`}/>
                    <div className="absolute inset-[5px] rounded-full border border-red-300 opacity-40"/>
                    {checked
                      ? <div className="flex flex-col items-center"><span className="text-red-500 text-xl font-bold leading-none">✓</span><span className="text-[9px] text-red-400 font-bold mt-0.5">완료</span></div>
                      : <div className="flex flex-col items-center"><span className="text-[11px] font-bold text-red-600 leading-tight text-center" style={{ fontFamily: "'Noto Serif KR', serif" }}>출석<br/>도장</span></div>
                    }
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[10px] text-[#7B6F9A] mb-0.5 font-medium">출석체크하고</p>
                    <p className="text-base font-bold leading-tight" style={{ fontFamily: "'Noto Serif KR', serif", color: checked ? '#A89BC0' : '#F5EDD4' }}>
                      {checked ? '오늘 도장 찍었어요!' : '포인트 받아가세요!'}
                    </p>
                    <p className="text-[11px] text-[#7B6F9A] mt-0.5">
                      {checked
                        ? `${streak}일 연속 출석 중 · 누적 ${animatedBalance.toLocaleString()}P`
                        : `${streak > 0 ? `${streak}일 연속 출석 중 · ` : ''}매일 +10P 지급`}
                    </p>
                  </div>
                  {!checked
                    ? <div className="shrink-0 w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-md shadow-red-900/30"><span className="text-white text-[10px] font-bold">+10P</span></div>
                    : <span className="text-[11px] text-[#7B6F9A] font-medium shrink-0">내역 →</span>
                  }
                </div>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: TOTAL_DAYS }).map((_, i) => {
                    const filled = i < streak
                    const isToday = checked && i === streak - 1
                    return (
                      <div
                        key={i}
                        className={`flex-1 aspect-square rounded-full border-2 flex items-center justify-center transition-all duration-300 ${filled ? (isToday ? 'border-red-500 bg-red-500 shadow-sm shadow-red-900/30' : 'border-red-900/50 bg-red-900/30') : 'border-[#2A1F4A] bg-[#1C1438]'}`}
                        style={{
                          transform: streakMounted ? 'scale(1)' : 'scale(0)',
                          transitionDelay: streakMounted ? `${i * 60}ms` : '0ms',
                        }}
                      >
                        {filled && <span className={`text-[8px] font-bold ${isToday ? 'text-white' : 'text-red-400'}`}>{i + 1}일</span>}
                        {!filled && <span className="text-[8px] text-[#4A4060]">{i + 1}</span>}
                      </div>
                    )
                  })}
                </div>
                <div className={`mt-2.5 pt-2 border-t flex items-center justify-between ${completed ? 'border-amber-500/30' : 'border-red-900/30'}`}>
                  {completed
                    ? <span className="text-[10px] font-bold text-amber-400">🎉 7일 연속 보너스 +50P 받았어요!</span>
                    : <span className="text-[10px] text-[#4A4060]">{TOTAL_DAYS - streak}일 더 출석하면 보너스 +50P</span>
                  }
                  <span className={`text-[10px] font-semibold ${completed ? 'text-amber-400' : 'text-red-400'}`}>자세히 보기 →</span>
                </div>
              </div>
            </button>
            </div>
          )
        })()}

        {/* 행운의 숫자 잡기 이벤트 배너 */}
        {(() => {
          const remaining = LUCKY_TIMER_MAX_ATTEMPTS - getLuckyTimerAttempts()
          return (
            <div style={reveal(3)}>
            <button
              onClick={onLuckyTimer}
              className="w-full overflow-hidden rounded-3xl shadow-[0_2px_16px_rgba(201,150,42,0.10)] active:scale-[0.99] transition-all"
            >
              <div className="relative bg-[#130E24] border border-[#C9962A40] rounded-3xl px-5 py-4 flex items-center gap-4">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-[0.06] select-none pointer-events-none text-[#C9962A] rotate-12">
                  <IcLucky size={64}/>
                </div>
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-[#C9962A15] border border-[#C9962A35] flex items-center justify-center">
                  <span className="text-xl font-bold text-[#C9962A]" style={{ fontFamily: "'Noto Serif KR', serif" }}>7</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[10px] text-[#C9962A] font-bold mb-0.5">오늘의 이벤트</p>
                  <p className="text-sm font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                    행운의 숫자 잡기 — 7초에 도전!
                  </p>
                  <p className="text-[11px] text-[#7B6F9A] mt-0.5">
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

        {/* 저장된 프로필 배지 */}
        {birthProfile && (
          <div style={reveal(4)} className="flex items-center justify-between bg-[#C9962A15] border border-[#C9962A30] rounded-2xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[#C9962A] text-sm">✓</span>
              <p className="text-xs text-[#C4B8D8]">
                {nickname && <span className="font-semibold">{nickname}</span>}
                {nickname && <span className="text-[#7B6F9A] mx-1">·</span>}
                <span className="font-semibold">{birthProfile.year}.{String(birthProfile.month).padStart(2,'0')}.{String(birthProfile.day).padStart(2,'0')}</span>
                <span className="text-[#7B6F9A] ml-1">· {birthProfile.gender === 'male' ? '남성' : '여성'}</span>
                {birthProfile.hour !== null && <span className="text-[#7B6F9A] ml-1">· {birthProfile.hour}시</span>}
              </p>
            </div>
            <button onClick={onEditProfile} className="text-xs text-[#C9962A] font-semibold hover:text-[#E8B84B] transition">수정</button>
          </div>
        )}

        {/* 프로필 미설정 CTA */}
        {!birthProfile && (
          <button
            onClick={onEditProfile}
            style={reveal(4)}
            className="w-full flex items-center justify-between gap-3 bg-gradient-to-r from-[#1A0E30] to-[#100820] border border-[#C9962A40] rounded-2xl px-4 py-3.5 text-left active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-[#C9962A20] flex items-center justify-center text-base shrink-0">🎂</span>
              <p className="text-xs text-[#E8DFC8]">
                <span className="font-semibold">생년월일을 등록</span>하면<br/>
                <span className="text-[#7B6F9A]">나만의 사주 풀이를 볼 수 있어요</span>
              </p>
            </div>
            <span className="text-xs text-[#C9962A] font-semibold shrink-0">등록 →</span>
          </button>
        )}

        {/* ── 피드 카드 ── */}

        {/* 현재 대운 요약 */}
        {daunInfo && (
          <div style={reveal(5)}>
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
                <p className="text-sm font-bold text-[#F5EDD4] mb-0.5" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                  💬 {daunInfo.sipsin === '정관' ? '조직에서 인정받고 명예가 따르는 시기입니다' :
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
                <p className="text-xs text-[#7B6F9A]">{daunInfo.ageRange} · 자세히 보기 →</p>
              </div>
            </div>
          </button>
          </div>
        )}

        {/* 오늘의 코디 프로모 카드 — 디자인 이미지를 그대로 사용 */}
        <div style={reveal(6)}>
        <button
          onClick={() => onNavigate('outfit')}
          className="w-full rounded-3xl overflow-hidden active:scale-[0.99] transition-all border border-[rgba(224,82,130,0.25)] hover:border-[rgba(224,82,130,0.5)] hover:shadow-[0_0_24px_rgba(224,82,130,0.3)] active:shadow-[0_0_24px_rgba(224,82,130,0.35)]"
        >
          <img src="/promo-outfit.png" alt="오늘의 코디 — 오행 기반 스타일링" className="w-full h-auto block" />
        </button>
        </div>

        {/* 취업운 프로모 카드 — 디자인 이미지를 그대로 사용 */}
        <div style={reveal(6)}>
        <button
          onClick={() => onNavigate('job')}
          className="w-full rounded-3xl overflow-hidden active:scale-[0.99] transition-all border border-[rgba(75,191,126,0.25)] hover:border-[rgba(75,191,126,0.5)] hover:shadow-[0_0_24px_rgba(75,191,126,0.3)] active:shadow-[0_0_24px_rgba(75,191,126,0.35)]"
        >
          <img src="/promo-job.png" alt="합격·승진운 — 성공을 위한 운세, 사주로 보는 취업·이직운" className="w-full h-auto block" />
        </button>
        </div>

        {/* 신년운세 프로모 카드 — 디자인 이미지를 그대로 사용 */}
        <div style={reveal(6)}>
        <button
          onClick={() => onNavigate('sinnyeon')}
          className="w-full rounded-3xl overflow-hidden active:scale-[0.99] transition-all border border-[rgba(201,150,42,0.2)] hover:border-[rgba(201,150,42,0.5)] hover:shadow-[0_0_24px_rgba(201,150,42,0.3)] active:shadow-[0_0_24px_rgba(201,150,42,0.35)]"
        >
          <img src="/promo-sinnyeon.png" alt="신년 대박 운세 — 새로운 기회·성취 대박, 사주로 보는 신년 로드맵" className="w-full h-auto block" />
        </button>
        </div>

        {/* 토정비결 프로모 카드 — 디자인 이미지를 그대로 사용 (연도가 바뀌면 이미지 교체 필요) */}
        <div style={reveal(6)}>
        <button
          onClick={() => onNavigate('tojeong')}
          className="w-full rounded-3xl overflow-hidden active:scale-[0.99] transition-all border border-[rgba(201,150,42,0.2)] hover:border-[rgba(201,150,42,0.5)] hover:shadow-[0_0_24px_rgba(201,150,42,0.3)] active:shadow-[0_0_24px_rgba(201,150,42,0.35)]"
        >
          <img src="/promo-tojeong-2027.png" alt="토정비결 — 지혜로운 삶의 이정표, 나의 운세 흐름과 비결" className="w-full h-auto block" />
        </button>
        </div>

      </div>

      <AdBanner />

      <div className="text-center pb-2 text-xs text-[#4A4060]">사주팔자 — 양력 기준 · 절기 근사값 적용</div>
      <div className="text-center pb-8 text-xs text-[#4A4060]">
        <button onClick={onShowPrivacy} className="underline hover:text-[#7B6F9A] transition">개인정보처리방침</button>
        <span className="mx-2">·</span>
        <button onClick={onShowTerms} className="underline hover:text-[#7B6F9A] transition">이용약관</button>
      </div>
    </div>
  )
}
