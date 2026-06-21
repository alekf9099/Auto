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
          className="rounded-3xl p-5 border shadow-xl shadow-[#000]/40 transition-colors duration-500"
          style={{ background: 'linear-gradient(135deg, #1A0E30 0%, #100820 60%, #060410 100%)', borderColor: todayAccent + '40' }}
        >
          <div className="flex items-center justify-between gap-2 mb-1">
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
          <p className="text-base font-bold text-[#F5EDD4] mb-3" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            오늘의 한 줄 운세
          </p>
          <div
            className="flex gap-3 items-start rounded-2xl px-4 py-3.5 border transition-colors duration-500"
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
            className="mt-3 text-xs font-semibold transition"
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
          className="w-full overflow-hidden rounded-3xl shadow-[0_2px_16px_rgba(155,107,238,0.12)] active:scale-[0.99] transition-all"
        >
          <div className="relative bg-[#130E24] border border-[#9B6BEE40] rounded-3xl px-5 py-4 flex items-center gap-4">
            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-[0.08] select-none pointer-events-none text-[#9B6BEE] rotate-12">
              <IcTarot size={64}/>
            </div>
            <div className="shrink-0 w-12 h-12 rounded-2xl bg-[#9B6BEE15] border border-[#9B6BEE35] flex items-center justify-center">
              <IcTarot size={24} className="text-[#9B6BEE]"/>
            </div>
            <div className="flex-1 text-left">
              <p className="text-[10px] text-[#9B6BEE] font-bold mb-0.5">나만의 타로 상담</p>
              <p className="text-sm font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                오늘 어떤 카드가 나를 기다릴까?
              </p>
              <p className="text-[11px] text-[#7B6F9A] mt-0.5">
                AI가 풀어주는 과거 · 현재 · 미래 3카드 해석
              </p>
            </div>
            <span className="text-[11px] text-[#9B6BEE] font-semibold shrink-0">
              지금 시작하기 →
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

        {/* 오늘의 코디 프로모 카드 */}
        <div style={reveal(6)}>
        <button
          onClick={() => onNavigate('outfit')}
          className="w-full rounded-3xl overflow-hidden active:scale-[0.99] transition-all"
          style={{ background: 'linear-gradient(135deg, #1A0818 0%, #200D22 100%)' }}
        >
          <div className="relative p-5 border border-[rgba(224,82,130,0.25)] rounded-3xl transition-shadow duration-300 hover:border-[rgba(224,82,130,0.5)] hover:shadow-[0_0_24px_rgba(224,82,130,0.3)] active:shadow-[0_0_24px_rgba(224,82,130,0.35)]">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none">
              <IcOutfit size={80} className="text-[#E05282]"/>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#E0528220] text-[#E05282] border border-[#E0528240] px-3 py-1 rounded-full mb-3">
              오늘의 코디 ›
            </span>
            <p className="text-base font-bold text-[#F5EDD4] leading-snug mb-1" style={{ fontFamily: "'Noto Serif KR', serif" }}>
              오늘 뭐 입을까?<br/>사주로 보는 내 스타일
            </p>
            <p className="text-sm text-[#A89BC0]">오행 기반 컬러 & 아이템 추천</p>
          </div>
        </button>
        </div>

        {/* 취업운 프로모 카드 */}
        <div style={reveal(6)}>
        <button
          onClick={() => onNavigate('job')}
          className="w-full rounded-3xl overflow-hidden active:scale-[0.99] transition-all"
          style={{ background: 'linear-gradient(135deg, #0A1A12 0%, #0D2018 100%)' }}
        >
          <div className="relative p-5 border border-[rgba(75,191,126,0.25)] rounded-3xl transition-shadow duration-300 hover:border-[rgba(75,191,126,0.5)] hover:shadow-[0_0_24px_rgba(75,191,126,0.3)] active:shadow-[0_0_24px_rgba(75,191,126,0.35)]">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none">
              <IcJob size={80} className="text-[#4BBF7E]"/>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#4BBF7E20] text-[#4BBF7E] border border-[#4BBF7E40] px-3 py-1 rounded-full mb-3">
              취업운 ›
            </span>
            <p className="text-base font-bold text-[#F5EDD4] leading-snug mb-1" style={{ fontFamily: "'Noto Serif KR', serif" }}>
              지금 지원하면 합격할까?<br/>사주로 보는 취업·이직운
            </p>
            <p className="text-sm text-[#A89BC0]">십성 기반 커리어 운세 & 적성 직무</p>
          </div>
        </button>
        </div>

        {/* 신년운세 프로모 카드 */}
        <div style={reveal(6)}>
        <button
          onClick={() => onNavigate('sinnyeon')}
          className="w-full rounded-3xl overflow-hidden active:scale-[0.99] transition-all"
          style={{ background: 'linear-gradient(135deg, #0D1A16 0%, #0A1520 100%)' }}
        >
          <div className="relative p-5 border border-[rgba(201,150,42,0.2)] rounded-3xl transition-shadow duration-300 hover:border-[rgba(201,150,42,0.5)] hover:shadow-[0_0_24px_rgba(201,150,42,0.3)] active:shadow-[0_0_24px_rgba(201,150,42,0.35)]">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none text-[#C9962A]">
              <IcSinnyeon size={80}/>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#C9962A20] text-[#C9962A] border border-[#C9962A40] px-3 py-1 rounded-full mb-3">
              신년운세 ›
            </span>
            <p className="text-base font-bold text-[#F5EDD4] leading-snug mb-1" style={{ fontFamily: "'Noto Serif KR', serif" }}>
              미리보고 준비!<br/>{new Date().getFullYear()} 신년운세
            </p>
            <p className="text-sm text-[#A89BC0]">얼른 복 잡아가세요!</p>
          </div>
        </button>
        </div>

        {/* 토정비결 프로모 카드 */}
        <div style={reveal(6)}>
        <button
          onClick={() => onNavigate('tojeong')}
          className="w-full rounded-3xl overflow-hidden active:scale-[0.99] transition-all"
          style={{ background: 'linear-gradient(135deg, #13081C 0%, #190D2E 100%)' }}
        >
          <div className="relative p-5 border border-[rgba(201,150,42,0.2)] rounded-3xl transition-shadow duration-300 hover:border-[rgba(201,150,42,0.5)] hover:shadow-[0_0_24px_rgba(201,150,42,0.3)] active:shadow-[0_0_24px_rgba(201,150,42,0.35)]">
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#C9962A20] text-[#C9962A] border border-[#C9962A40] px-3 py-1 rounded-full mb-3">
              토정비결 ›
            </span>
            <p className="text-base font-bold text-[#F5EDD4] leading-snug mb-1" style={{ fontFamily: "'Noto Serif KR', serif" }}>
              {new Date().getFullYear()}년 나의<br/>한 해 운세는?
            </p>
            <p className="text-sm text-[#A89BC0]">이지함 선생의 전통 비결서</p>
          </div>
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
