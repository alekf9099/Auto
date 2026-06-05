import { useState } from 'react'
import type { BirthInput } from '../types'
import { calculateSaju, getSipsin } from '../utils/saju'
import { STEMS, BRANCHES, ELEMENT_COLORS } from '../utils/constants'
import { DAY_FORTUNE, LUCKY_COLOR_MAP, LUCKY_COLOR_NAME, LUCKY_NUM, LUCKY_DIR, LUCKY_FOOD } from '../utils/fortuneData'
import { loadPoints, tryFeatureBonus } from '../utils/points'
import PointsToast from './PointsToast'

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
        <span key={i} className={`text-base ${i < n ? 'text-amber-400' : 'text-stone-200'}`}>★</span>
      ))}
    </div>
  )
}

function CategoryRow({ emoji, label, text, star }: { emoji: string; label: string; text: string; star: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-stone-100 rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center gap-2 p-3.5 text-left hover:bg-stone-50 transition"
        onClick={() => setOpen(o => !o)}
      >
        <span>{emoji}</span>
        <span className="text-sm font-semibold text-stone-700">{label}</span>
        <span className="text-xs text-stone-400 flex-1 truncate">{text.slice(0, 18)}…</span>
        <Stars n={star} />
        <span className="text-stone-300 text-xs ml-1">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <div className="h-px bg-stone-100 mb-3" />
          <p className="text-sm text-stone-500 leading-relaxed">{text}</p>
        </div>
      )}
    </div>
  )
}

export default function DayFortunePage({ dayOffset, savedBirth, onSave, onBack }: Props) {
  const init = savedBirth ? calcResult(savedBirth, dayOffset) : null

  const [step,  setStep]  = useState<'form' | 'result'>(init ? 'result' : 'form')
  const [birth, setBirth] = useState({
    year:  savedBirth ? String(savedBirth.year)  : '',
    month: savedBirth ? String(savedBirth.month) : '',
    day:   savedBirth ? String(savedBirth.day)   : '',
  })
  const [sipsin,     setSipsin]     = useState(init?.sipsin       ?? '')
  const [dayStemIdx, setDayStemIdx] = useState(init?.dayStemIdx   ?? 0)
  const [luckyEl,    setLuckyEl]    = useState(init?.luckyEl      ?? 'wood')
  const [targetDate, setTargetDate] = useState<Date>(init?.targetDate ?? new Date())
  const [targetStem,   setTargetStem]   = useState(init?.targetStem   ?? 0)
  const [targetBranch, setTargetBranch] = useState(init?.targetBranch ?? 0)

  const isToday  = dayOffset === 0
  const title    = isToday ? '오늘의 운세' : '내일의 운세'
  const featKey  = isToday ? 'today' : 'tomorrow'

  const [toast, setToast] = useState<{ amount: number; total: number } | null>(null)
  function handlePointsClaim() {
    const { next, claimed } = tryFeatureBonus(loadPoints(), featKey, `${title} 확인 🔮`)
    if (claimed) setToast({ amount: 5, total: next.balance })
    else setToast({ amount: 0, total: loadPoints().balance })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const inp: BirthInput = {
      year: Number(birth.year), month: Number(birth.month),
      day: Number(birth.day), hour: 12, minute: null, gender: 'male',
    }
    onSave?.(inp)
    const r = calcResult(inp, dayOffset)
    setSipsin(r.sipsin)
    setDayStemIdx(r.dayStemIdx)
    setLuckyEl(r.luckyEl)
    setTargetDate(r.targetDate)
    setTargetStem(r.targetStem)
    setTargetBranch(r.targetBranch)
    setStep('result')
    window.scrollTo(0, 0)
  }

  const fortune    = DAY_FORTUNE[sipsin] ?? DAY_FORTUNE['비견']
  const tStem      = STEMS[targetStem]
  const tBranch    = BRANCHES[targetBranch]
  const dateLabel  = `${targetDate.getMonth() + 1}/${targetDate.getDate()}`

  return (
    <div className="min-h-screen bg-[#F4F2FF]">
      {/* 헤더 */}
      <div className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-stone-400 hover:text-stone-600 transition text-lg">←</button>
          <div>
            <h1 className="text-base font-bold text-stone-800" style={{ fontFamily: "'Noto Serif KR', serif" }}>{title}</h1>
            <p className="text-xs text-stone-400">사주 기반 일일 운세 분석</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {step === 'form' && (
          <>
            {/* 배너 */}
            <div className="bg-gradient-to-br from-[#1E1152] via-[#2D1B69] to-[#160F3E] rounded-3xl p-5 shadow-xl shadow-violet-900/20">
              <p className="text-violet-300/70 text-xs mb-2">{isToday ? '🔮 오늘' : '⏰ 내일'} · {new Date(Date.now() + dayOffset * 86400000).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}</p>
              <p className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Noto Serif KR', serif" }}>{title}</p>
              <p className="text-violet-300/60 text-sm">생년월일로 나만의 {isToday ? '오늘' : '내일'} 운세를 확인하세요</p>
            </div>

            {/* 입력 폼 */}
            <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_16px_rgba(124,58,237,0.07)] p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-5 bg-violet-500 rounded-full" />
                <h2 className="text-base font-bold text-stone-800">생년월일 입력</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: '출생년도', name: 'year',  placeholder: '1990', min: 1900, max: 2010 },
                    { label: '월',       name: 'month', placeholder: '1',    min: 1,    max: 12 },
                    { label: '일',       name: 'day',   placeholder: '1',    min: 1,    max: 31 },
                  ].map(f => (
                    <div key={f.name}>
                      <label className="block text-xs font-semibold text-stone-500 mb-1.5">{f.label}</label>
                      <input
                        type="number" required placeholder={f.placeholder}
                        min={f.min} max={f.max}
                        value={birth[f.name as keyof typeof birth]}
                        onChange={e => setBirth(p => ({ ...p, [f.name]: e.target.value }))}
                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-3 py-3 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition text-center"
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-violet-200 text-sm active:scale-[0.98] transition-all"
                >
                  {title} 확인하기 →
                </button>
              </form>
            </div>
          </>
        )}

        {step === 'result' && (
          <>
            {/* 일주 배지 */}
            <div
              className="rounded-3xl p-5 border"
              style={{ backgroundColor: fortune.color + '10', borderColor: fortune.color + '30' }}
            >
              <p className="text-xs text-stone-400 mb-2">{isToday ? '오늘' : '내일'} 일주 · {dateLabel}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-bold" style={{ color: ELEMENT_COLORS[tStem.element] }}>{tStem.hanja}</span>
                  <span className="text-4xl font-bold" style={{ color: ELEMENT_COLORS[tBranch.element] }}>{tBranch.hanja}</span>
                  <div className="ml-1">
                    <p className="text-sm text-stone-500">{tStem.ko}{tBranch.ko} · {tBranch.animal}</p>
                    <p className="text-xs text-stone-400">{STEMS[dayStemIdx].hanja}일간 기준</p>
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
            <div className="bg-violet-50 border border-violet-100 rounded-3xl p-4">
              <p className="text-xs font-semibold text-violet-600 mb-1.5">✨ {isToday ? '오늘의' : '내일의'} 조언</p>
              <p className="text-sm text-stone-600 leading-relaxed">{fortune.조언}</p>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 flex items-start gap-2">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <p className="text-xs text-stone-500 leading-relaxed">
                <span className="font-semibold text-red-500">주의 </span>{fortune.주의}
              </p>
            </div>

            {/* 분야별 */}
            <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_16px_rgba(124,58,237,0.07)] p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-violet-500 rounded-full" />
                <h2 className="text-base font-bold text-stone-800" style={{ fontFamily: "'Noto Serif KR', serif" }}>분야별 운세</h2>
              </div>
              <div className="space-y-2">
                <CategoryRow emoji="🔮" label="총운"  text={fortune.총평} star={fortune.star} />
                <CategoryRow emoji="💰" label="재물운" text={fortune.재물} star={Math.max(1, fortune.star - 1)} />
                <CategoryRow emoji="💕" label="애정운" text={fortune.애정} star={fortune.star} />
                <CategoryRow emoji="💪" label="건강운" text={fortune.건강} star={fortune.star} />
                <CategoryRow emoji="💼" label="직장운" text={fortune.직업} star={Math.min(5, fortune.star + 1)} />
              </div>
            </div>

            {/* 시간대별 */}
            <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_16px_rgba(124,58,237,0.07)] p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-violet-500 rounded-full" />
                <h2 className="text-base font-bold text-stone-800" style={{ fontFamily: "'Noto Serif KR', serif" }}>🕐 시간대별</h2>
              </div>
              <div className="space-y-2">
                {[
                  { icon: '🌅', label: '오전 06~12시', text: fortune.시간오전 },
                  { icon: '☀️',  label: '오후 12~18시', text: fortune.시간오후 },
                  { icon: '🌙', label: '저녁 18~24시', text: fortune.시간저녁 },
                ].map(t => (
                  <div key={t.label} className="flex gap-3 bg-stone-50 border border-stone-100 rounded-2xl px-4 py-3">
                    <span className="shrink-0">{t.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-stone-400 mb-0.5">{t.label}</p>
                      <p className="text-sm text-stone-600">{t.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 행운 아이템 */}
            <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_16px_rgba(124,58,237,0.07)] p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-violet-500 rounded-full" />
                <h2 className="text-base font-bold text-stone-800" style={{ fontFamily: "'Noto Serif KR', serif" }}>🍀 행운 아이템</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '행운 색상', value: LUCKY_COLOR_NAME[luckyEl], dot: LUCKY_COLOR_MAP[luckyEl] },
                  { label: '행운 숫자', value: LUCKY_NUM[luckyEl],        dot: null },
                  { label: '행운 방향', value: LUCKY_DIR[luckyEl],        dot: null },
                  { label: '행운 음식', value: LUCKY_FOOD[luckyEl],       dot: null },
                ].map(item => (
                  <div key={item.label} className="bg-violet-50 border border-violet-100 rounded-2xl p-3">
                    <p className="text-xs text-stone-400 mb-1">{item.label}</p>
                    <div className="flex items-center gap-1.5">
                      {item.dot && <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.dot }} />}
                      <p className="text-sm font-semibold text-stone-700">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {toast && toast.amount > 0 && (
              <PointsToast amount={toast.amount} total={toast.total} onClose={() => setToast(null)} />
            )}
            <button
              onClick={handlePointsClaim}
              className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold rounded-2xl text-sm shadow-md shadow-violet-200 active:scale-[0.98] transition-all"
            >
              {toast !== null && toast.amount === 0 ? '✓ 오늘 포인트 이미 받음' : '💎 포인트 받기 +5P'}
            </button>
            <button
              onClick={() => { setStep('form'); window.scrollTo(0, 0) }}
              className="w-full py-3.5 bg-stone-100 text-stone-600 font-semibold rounded-2xl text-sm hover:bg-stone-200 transition active:scale-[0.98]"
            >
              다시 조회하기
            </button>
          </>
        )}
      </div>
      <div className="text-center pb-8 text-xs text-stone-300">운명봄 — 양력 기준 · 사주 기반 일운</div>
    </div>
  )
}
