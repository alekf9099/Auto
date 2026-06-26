import { useState } from 'react'
import { blockGuestRetry } from '../utils/guestGate'
import type { BirthInput } from '../types'
import { calculateSaju, getSipsin } from '../utils/saju'
import { STEMS, BRANCHES, ELEMENT_COLORS } from '../utils/constants'
import { DAY_FORTUNE, LUCKY_COLOR_MAP, LUCKY_COLOR_NAME, LUCKY_NUM, LUCKY_DIR, LUCKY_FOOD } from '../utils/fortuneData'
import PointsClaimButton from './PointsClaimButton'
import ShareCardModal from './ShareCardModal'
import {
  IcTodayFortune,
  IcGeneralLuck,
  IcWealthLuck,
  IcLoveLuck,
  IcHealthLuck,
  IcCareerLuck,
  IcMorning,
  IcAfternoon,
  IcEvening,
  IcCloverLucky,
} from './icons/SajuIcons'

interface Props {
  dayOffset: 0 | 1   // 0 = 오늘, 1 = 내일
  savedBirth?: BirthInput | null
  onSave?: (b: BirthInput) => void
  onBack: () => void
}

function calcResult(birth: BirthInput, dayOffset: number) {
  const userResult = calculateSaju(birth)
  const userDayIdx = userResult.dayPillar.stemIndex
  const target = new Date()
  target.setDate(target.getDate() + dayOffset)
  const targetResult = calculateSaju({
    year: target.getFullYear(), month: target.getMonth() + 1,
    day: target.getDate(), hour: 12, minute: null, gender: 'male',
  })
  return {
    sipsin:       getSipsin(userDayIdx, targetResult.dayPillar.stemIndex) ?? '비견',
    dayStemIdx:   userDayIdx,
    luckyEl:      STEMS[userDayIdx].element,
    targetDate:   target,
    targetStem:   targetResult.dayPillar.stemIndex,
    targetBranch: targetResult.dayPillar.branchIndex,
  }
}

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-base ${i < n ? 'text-[#E8B84B]' : 'text-[#3D3358]'}`}>★</span>
      ))}
    </div>
  )
}

// 시계 모양 12시간 다이얼에서 중심 기준 각도(angleDeg, 0=12시 방향, 시계방향)의 좌표를 구한다
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function luckLabel(percent: number) {
  if (percent >= 90) return '매우 좋음'
  if (percent >= 75) return '좋음'
  if (percent >= 60) return '보통'
  return '주의'
}

// 행운 지수에 따른 강조색 (빨강=주의 → 초록=최고)
function luckColor(percent: number) {
  if (percent >= 90) return '#4BBF7E'
  if (percent >= 75) return '#F5DA8B'
  if (percent >= 60) return '#E8B84B'
  return '#E0524D'
}

function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const p1 = polar(cx, cy, r, startDeg)
  const p2 = polar(cx, cy, r, endDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`
}

// 점성반(public/gauge-dial.png)을 은은한 배경으로 깔고, 빨강(주의)→초록(최고) 색 스케일 위에
// 바늘이 종합 행운 지수를 가리키는 "운명의 나침반" 게이지. 한눈에 좋고 나쁨이 보이게 한다.
function DayLuckGauge({ percent, star }: { percent: number; star: number }) {
  const size = 240
  const cx = size / 2, cy = size / 2
  const r = 90
  const START = 225, SWEEP = 270            // 아래쪽이 트인 270° 게이지 (좌하단=주의 → 우하단=최고)
  const p = Math.max(0, Math.min(100, percent))
  const markerAngle = START + SWEEP * (p / 100)
  const marker = polar(cx, cy, r, markerAngle)
  const accent = luckColor(percent)
  const track = describeArc(cx, cy, r, START, START + SWEEP)

  return (
    <div className="flex items-center justify-center py-2">
      <div className="relative" style={{ width: size, height: size }}>
        {/* 점성반 배경 (은은하게) + 가독성용 중앙 비네팅 */}
        <img src="/gauge-dial.png" alt="" width={size} height={size} className="absolute inset-0 w-full h-full opacity-40 select-none pointer-events-none" style={{ clipPath: 'circle(50%)' }} draggable={false} />
        <div className="absolute inset-0" style={{ clipPath: 'circle(50%)', background: 'radial-gradient(circle, rgba(13,10,26,0.88) 36%, rgba(13,10,26,0.25) 68%, transparent 100%)' }} />

        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="absolute inset-0">
          <defs>
            <linearGradient id="luckScale" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E0524D" />
              <stop offset="45%" stopColor="#E8B84B" />
              <stop offset="72%" stopColor="#F5DA8B" />
              <stop offset="100%" stopColor="#4BBF7E" />
            </linearGradient>
          </defs>
          {/* 트랙(색 스케일): 빨강→초록 */}
          <path d={track} fill="none" stroke="#2A1F4A" strokeWidth="13" strokeLinecap="round" />
          <path d={track} fill="none" stroke="url(#luckScale)" strokeWidth="9" strokeLinecap="round" opacity="0.9" />
          {/* 바늘 (중심 → 현재 값) */}
          <line x1={cx} y1={cy} x2={marker.x} y2={marker.y} stroke={accent} strokeWidth="3" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="6" fill="#130E24" stroke={accent} strokeWidth="2" />
          {/* 현재 위치 마커 + 글로우 */}
          <circle cx={marker.x} cy={marker.y} r="11" fill={accent} opacity="0.25" />
          <circle cx={marker.x} cy={marker.y} r="5.5" fill={accent} stroke="#FFF8E6" strokeWidth="1.5" />
        </svg>

        {/* 양끝 안내 라벨 */}
        <span className="absolute text-[10px] font-semibold text-[#E0524D]" style={{ left: 26, bottom: 30 }}>주의</span>
        <span className="absolute text-[10px] font-semibold text-[#4BBF7E]" style={{ right: 26, bottom: 30 }}>최고</span>

        {/* 중앙 수치 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[11px] text-[#A89BC0] mb-0.5">종합 행운 지수</p>
          <p className="font-bold leading-none" style={{ color: accent, fontFamily: "'Gowun Batang', serif", textShadow: '0 1px 8px rgba(0,0,0,0.75)' }}>
            <span className="text-4xl">{percent}</span><span className="text-xl">%</span>
          </p>
          <p className="text-sm font-bold mt-1" style={{ color: accent }}>{luckLabel(percent)}</p>
          <div className="mt-1 scale-90"><Stars n={star} /></div>
        </div>
      </div>
    </div>
  )
}

function GoldBadge({ children, size = 'w-7 h-7 text-sm' }: { children: React.ReactNode; size?: string }) {
  return (
    <span
      className={`${size} rounded-full flex items-center justify-center shrink-0`}
      style={{ background: 'radial-gradient(circle, rgba(201,150,42,0.30), rgba(201,150,42,0.06))' }}
    >
      {children}
    </span>
  )
}

function CategoryRow({ icon, label, text, star }: { icon: React.ReactNode; label: string; text: string; star: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-[#C9962A20] rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center gap-2.5 p-3.5 text-left hover:bg-[#1C1438] transition"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-label={`${label} ${open ? '접기' : '펼치기'}`}
      >
        <GoldBadge><span className="text-[#C9962A]">{icon}</span></GoldBadge>
        <span className="text-sm font-semibold text-[#E8DFC8]">{label}</span>
        <span className="text-xs text-[#7B6F9A] flex-1 truncate">{text.slice(0, 18)}…</span>
        <Stars n={star} />
        <span className="text-[#4A4060] text-xs ml-1">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <div className="h-px bg-[#C9962A20] mb-3" />
          <p className="text-sm text-[#A89BC0] leading-relaxed">{text}</p>
        </div>
      )}
    </div>
  )
}

export default function DayFortunePage({ dayOffset, savedBirth, onSave, onBack }: Props) {
  const init = savedBirth ? calcResult(savedBirth, dayOffset) : null

  const [step,        setStep]        = useState<'form' | 'loading' | 'result'>('form')
  const [activeOffset, setActiveOffset] = useState<0|1>(dayOffset)
  const [birth, setBirth] = useState({
    year:  savedBirth ? String(savedBirth.year)  : '',
    month: savedBirth ? String(savedBirth.month) : '',
    day:   savedBirth ? String(savedBirth.day)   : '',
    hour:  savedBirth?.hour != null ? String(savedBirth.hour) : '',
    minute: savedBirth?.minute != null ? String(savedBirth.minute) : '',
  })
  const [sipsin,     setSipsin]     = useState(init?.sipsin       ?? '')
  const [dayStemIdx, setDayStemIdx] = useState(init?.dayStemIdx   ?? 0)
  const [luckyEl,    setLuckyEl]    = useState(init?.luckyEl      ?? 'wood')
  const [targetDate, setTargetDate] = useState<Date>(init?.targetDate ?? new Date())
  const [targetStem,   setTargetStem]   = useState(init?.targetStem   ?? 0)
  const [targetBranch, setTargetBranch] = useState(init?.targetBranch ?? 0)

  const isToday  = activeOffset === 0
  const title    = isToday ? '오늘의 운세' : '내일의 운세'
  const featKey  = isToday ? 'today' : 'tomorrow'

  const [showShare, setShowShare] = useState(false)

  function applyResult(inp: BirthInput, offset: 0|1) {
    const r = calcResult(inp, offset)
    setSipsin(r.sipsin)
    setDayStemIdx(r.dayStemIdx)
    setLuckyEl(r.luckyEl)
    setTargetDate(r.targetDate)
    setTargetStem(r.targetStem)
    setTargetBranch(r.targetBranch)
  }

  function handleTabChange(offset: 0|1) {
    if (step !== 'result') return
    setActiveOffset(offset)
    const inp: BirthInput = {
      year: Number(birth.year), month: Number(birth.month),
      day: Number(birth.day),
      hour: birth.hour !== '' ? Number(birth.hour) : null,
      minute: birth.hour !== '' && birth.minute !== '' ? Number(birth.minute) : null,
      gender: 'male',
    }
    applyResult(inp, offset)
    window.scrollTo(0, 0)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const inp: BirthInput = {
      year: Number(birth.year), month: Number(birth.month),
      day: Number(birth.day),
      hour: birth.hour !== '' ? Number(birth.hour) : null,
      minute: birth.hour !== '' && birth.minute !== '' ? Number(birth.minute) : null,
      gender: 'male',
    }
    onSave?.(inp)
    applyResult(inp, activeOffset)
    setStep('loading')
    window.scrollTo(0, 0)
    setTimeout(() => { setStep('result'); window.scrollTo(0, 0) }, 2500)
  }

  const fortune    = DAY_FORTUNE[sipsin] ?? DAY_FORTUNE['비견']
  const tStem      = STEMS[targetStem]
  const tBranch    = BRANCHES[targetBranch]
  const dateLabel  = `${targetDate.getMonth() + 1}/${targetDate.getDate()}`
  const luckPercent = Math.min(99, 60 + fortune.star * 8)

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <div className="bg-[#130E24] border-b border-[#2A1F4A] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} aria-label="뒤로 가기" className="text-[#7B6F9A] hover:text-[#C4B8D8] transition text-lg flex-shrink-0">←</button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>{title}</h1>
            <p className="text-xs text-[#7B6F9A]">사주 기반 일일 운세 분석</p>
          </div>
          {step === 'result' && (
            <div className="flex bg-[#1C1438] rounded-2xl p-1 gap-1 border border-[#2A1F4A] flex-shrink-0">
              {([{ label: '오늘', offset: 0 }, { label: '내일', offset: 1 }] as const).map(({ label, offset }) => (
                <button
                  key={label}
                  onClick={() => handleTabChange(offset)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                    activeOffset === offset
                      ? 'bg-[#C9962A] text-[#0D0A1A]'
                      : 'text-[#6B5F8A] hover:text-[#C4B8D8]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {step === 'form' && (
          <>
            {/* 배너 */}
            <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-5 shadow-xl shadow-[#000]/40 border border-[#C9962A25]">
              <p className="text-violet-300/70 text-xs mb-2">{isToday ? '🔮 오늘' : '⏰ 내일'} · {new Date(Date.now() + activeOffset * 86400000).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}</p>
              <p className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Gowun Batang', serif" }}>{title}</p>
              <p className="text-violet-300/60 text-sm">생년월일로 나만의 {isToday ? '오늘' : '내일'} 운세를 확인하세요</p>
            </div>

            {/* 입력 폼 */}
            <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-5 bg-[#C9962A] rounded-full" />
                <h2 className="text-base font-bold text-[#F5EDD4]">생년월일 입력</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: '출생년도', name: 'year',  placeholder: '1990', min: 1900, max: 2010 },
                    { label: '월',       name: 'month', placeholder: '1',    min: 1,    max: 12 },
                    { label: '일',       name: 'day',   placeholder: '1',    min: 1,    max: 31 },
                  ].map(f => (
                    <div key={f.name}>
                      <label className="block text-xs font-semibold text-[#A89BC0] mb-1.5">{f.label}</label>
                      <input
                        type="number" required placeholder={f.placeholder}
                        min={f.min} max={f.max}
                        value={birth[f.name as keyof typeof birth]}
                        onChange={e => setBirth(p => ({ ...p, [f.name]: e.target.value }))}
                        className="w-full bg-[#1C1438] border border-[#2A1F4A] rounded-2xl px-3 py-3 text-sm text-[#F5EDD4] placeholder:text-[#4A4060] focus:outline-none focus:border-[#C9962A] focus:ring-2 focus:ring-[#C9962A20] transition text-center"
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#A89BC0] mb-1.5">출생 시간 <span className="text-[#4A4060] font-normal">(선택, 0~23시)</span></label>
                    <input
                      type="number" placeholder="예: 14"
                      min={0} max={23}
                      value={birth.hour}
                      onChange={e => setBirth(p => ({ ...p, hour: e.target.value }))}
                      className="w-full bg-[#1C1438] border border-[#2A1F4A] rounded-2xl px-3 py-3 text-sm text-[#F5EDD4] placeholder:text-[#4A4060] focus:outline-none focus:border-[#C9962A] focus:ring-2 focus:ring-[#C9962A20] transition text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#A89BC0] mb-1.5">분 <span className="text-[#4A4060] font-normal">(선택, 0~59분)</span></label>
                    <input
                      type="number" placeholder="예: 30"
                      min={0} max={59}
                      disabled={birth.hour === ''}
                      value={birth.minute}
                      onChange={e => setBirth(p => ({ ...p, minute: e.target.value }))}
                      className="w-full bg-[#1C1438] border border-[#2A1F4A] rounded-2xl px-3 py-3 text-sm text-[#F5EDD4] placeholder:text-[#4A4060] focus:outline-none focus:border-[#C9962A] focus:ring-2 focus:ring-[#C9962A20] transition text-center disabled:opacity-40"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-[#C9962A] to-[#E8B84B] text-[#0D0A1A] font-bold rounded-2xl shadow-lg shadow-[#C9962A30] text-sm active:scale-[0.98] transition-all"
                >
                  {title} 확인하기 →
                </button>
              </form>
            </div>
          </>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-2 border-[#C9962A20] animate-ping"/>
              <div className="absolute inset-2 rounded-full border-2 border-[#C9962A40] animate-ping" style={{ animationDelay: '0.3s' }}/>
              <div className="absolute inset-4 rounded-full border-2 border-[#C9962A60] animate-ping" style={{ animationDelay: '0.6s' }}/>
              <div className="absolute inset-0 flex items-center justify-center"><IcTodayFortune size={32} className="text-[#C9962A]"/></div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>운세 분석 중...</p>
              <p className="text-sm text-[#7B6F9A]">사주를 풀이하고 있습니다</p>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className="space-y-4 animate-fade-in-up">
            {/* 종합 행운 게이지 */}
            <div
              className="rounded-3xl border border-[#C9962A30] shadow-[0_2px_24px_rgba(201,150,42,0.14)] p-5 space-y-4"
              style={{ background: 'linear-gradient(160deg, #1C1438 0%, #150D28 55%, #0D0A1A 100%)' }}
            >
              <DayLuckGauge percent={luckPercent} star={fortune.star} />
              <div
                className="border border-[#C9962A20] rounded-2xl p-4 flex items-center gap-3"
                style={{ background: 'linear-gradient(135deg, #201A3A 0%, #160F2C 100%)' }}
              >
                <GoldBadge size="w-9 h-9 text-lg">✨</GoldBadge>
                <div>
                  <p className="text-sm font-semibold text-[#F5EDD4]">{isToday ? '오늘' : '내일'}의 전체 운세</p>
                  <p className="text-xs text-[#A89BC0] mt-0.5">⭐ 종합 행운 지수: {luckPercent}%</p>
                </div>
              </div>
            </div>

            {/* 일주 배지 */}
            <div
              className="rounded-3xl p-5 border"
              style={{ background: `linear-gradient(135deg, ${fortune.color}1c 0%, ${fortune.color}08 100%)`, borderColor: fortune.color + '30' }}
            >
              <p className="text-xs text-stone-400 mb-2">{isToday ? '오늘' : '내일'} 일주 · {dateLabel}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-bold" style={{ color: ELEMENT_COLORS[tStem.element] }}>{tStem.hanja}</span>
                  <span className="text-4xl font-bold" style={{ color: ELEMENT_COLORS[tBranch.element] }}>{tBranch.hanja}</span>
                  <div className="ml-1">
                    <p className="text-sm text-[#A89BC0]">{tStem.ko}{tBranch.ko} · {tBranch.animal}</p>
                    <p className="text-xs text-[#7B6F9A]">{STEMS[dayStemIdx].hanja}일간 기준</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className="text-lg font-bold px-3 py-1.5 rounded-xl"
                    style={{ backgroundColor: fortune.color + '20', color: fortune.color }}
                  >
                    {sipsin}
                  </span>
                  <div className="mt-1.5 flex justify-end"><Stars n={fortune.star} /></div>
                </div>
              </div>
            </div>

            {/* 조언 + 주의 */}
            <div className="border border-[#C9962A30] rounded-3xl p-4" style={{ background: 'linear-gradient(135deg, #C9962A22 0%, #C9962A0A 100%)' }}>
              <p className="text-xs font-semibold text-[#C9962A] mb-1.5">✨ {isToday ? '오늘의' : '내일의'} 조언</p>
              <p className="text-sm text-[#C4B8D8] leading-relaxed">{fortune.조언}</p>
            </div>
            <div className="border border-red-900/40 rounded-2xl px-4 py-3 flex items-start gap-2" style={{ background: 'linear-gradient(135deg, rgba(127,29,29,0.28) 0%, rgba(127,29,29,0.10) 100%)' }}>
              <span className="shrink-0 mt-0.5">⚠️</span>
              <p className="text-xs text-[#A89BC0] leading-relaxed">
                <span className="font-semibold text-red-400">주의 </span>{fortune.주의}
              </p>
            </div>

            {/* 분야별 */}
            <div className="rounded-3xl border border-[#C9962A20] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-5" style={{ background: 'linear-gradient(160deg, #1C1438 0%, #130E24 100%)' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-[#C9962A] rounded-full" />
                <h2 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>분야별 운세</h2>
              </div>
              <div className="space-y-2">
                <CategoryRow icon={<IcGeneralLuck size={18} />} label="총운"  text={fortune.총평} star={fortune.star} />
                <CategoryRow icon={<IcWealthLuck size={18} />} label="재물운" text={fortune.재물} star={Math.max(1, fortune.star - 1)} />
                <CategoryRow icon={<IcLoveLuck size={18} />} label="애정운" text={fortune.애정} star={fortune.star} />
                <CategoryRow icon={<IcHealthLuck size={18} />} label="건강운" text={fortune.건강} star={fortune.star} />
                <CategoryRow icon={<IcCareerLuck size={18} />} label="직장운" text={fortune.직업} star={Math.min(5, fortune.star + 1)} />
              </div>
            </div>

            {/* 시간대별 */}
            <div className="rounded-3xl border border-[#C9962A20] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-5" style={{ background: 'linear-gradient(160deg, #1C1438 0%, #130E24 100%)' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-[#C9962A] rounded-full" />
                <h2 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>🕐 시간대별</h2>
              </div>
              <div className="space-y-2">
                {[
                  { icon: <IcMorning size={18} />, label: '오전 06~12시', text: fortune.시간오전 },
                  { icon: <IcAfternoon size={18} />,  label: '오후 12~18시', text: fortune.시간오후 },
                  { icon: <IcEvening size={18} />, label: '저녁 18~24시', text: fortune.시간저녁 },
                ].map(t => (
                  <div key={t.label} className="flex gap-3 border border-[#C9962A20] rounded-2xl px-4 py-3" style={{ background: 'linear-gradient(135deg, #201A3A 0%, #160F2C 100%)' }}>
                    <GoldBadge><span className="text-[#C9962A]">{t.icon}</span></GoldBadge>
                    <div>
                      <p className="text-xs font-semibold text-[#7B6F9A] mb-0.5">{t.label}</p>
                      <p className="text-sm text-[#C4B8D8]">{t.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 행운 아이템 */}
            <div className="rounded-3xl border border-[#C9962A20] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-5" style={{ background: 'linear-gradient(160deg, #1C1438 0%, #130E24 100%)' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-[#C9962A] rounded-full" />
                <h2 className="flex items-center gap-1.5 text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}><IcCloverLucky size={18} className="text-[#C9962A]" /> 행운 아이템</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '행운 색상', value: LUCKY_COLOR_NAME[luckyEl], dot: LUCKY_COLOR_MAP[luckyEl] },
                  { label: '행운 숫자', value: LUCKY_NUM[luckyEl],        dot: null },
                  { label: '행운 방향', value: LUCKY_DIR[luckyEl],        dot: null },
                  { label: '행운 음식', value: LUCKY_FOOD[luckyEl],       dot: null },
                ].map(item => (
                  <div key={item.label} className="border border-[#C9962A30] rounded-2xl p-3" style={{ background: 'linear-gradient(135deg, #C9962A22 0%, #C9962A0A 100%)' }}>
                    <p className="text-xs text-[#7B6F9A] mb-1">{item.label}</p>
                    <div className="flex items-center gap-1.5">
                      {item.dot && <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.dot }} />}
                      <p className="text-sm font-semibold text-[#E8DFC8]">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowShare(true)}
              className="w-full py-3.5 text-[#F5EDD4] font-semibold rounded-2xl text-sm border border-[#C9962A40] shadow-[0_2px_20px_rgba(201,150,42,0.10)] transition active:scale-[0.98] flex items-center justify-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #2A1F4A 0%, #1C1438 100%)' }}
            >
              📤 운세 카드 공유하기
            </button>
            <PointsClaimButton key={featKey} featureKey={featKey} label={`${title} 확인 🔮`} />
            <button
              onClick={() => { if (blockGuestRetry()) return; setStep('form'); window.scrollTo(0, 0) }}
              className="w-full py-3.5 text-[#C4B8D8] font-semibold rounded-2xl text-sm border border-[#C9962A20] transition active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #2A1F4A 0%, #1C1438 100%)' }}
            >
              다시 조회하기
            </button>
          </div>
        )}
      </div>

      {showShare && (
        <ShareCardModal
          onClose={() => setShowShare(false)}
          data={{
            badge: title,
            emoji: fortune.star >= 4 ? '✨' : fortune.star === 3 ? '🌟' : fortune.star === 2 ? '🍀' : '⚡',
            title: `${tStem.ko}${tBranch.ko}일 · ${sipsin}`,
            date: targetDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }),
            highlight: fortune.총평.split('.')[0] + '.',
            items: [
              { label: '행운 색상', value: LUCKY_COLOR_NAME[luckyEl] },
              { label: '행운 숫자', value: LUCKY_NUM[luckyEl] },
              { label: '행운 방향', value: LUCKY_DIR[luckyEl] },
              { label: '행운 음식', value: LUCKY_FOOD[luckyEl] },
            ],
            accent: fortune.color,
            footer: '운명봄 · AI 사주 운세',
          }}
        />
      )}
      <div className="text-center pb-8 text-xs text-[#4A4060]">운명봄 — 양력 기준 · 사주 기반 일운</div>
    </div>
  )
}
