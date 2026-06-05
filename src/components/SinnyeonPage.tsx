import { useState } from 'react'
import type { BirthInput } from '../types'
import { calculateSaju, getSipsin } from '../utils/saju'
import { STEMS, ELEMENT_COLORS } from '../utils/constants'
import { YEARLY_FORTUNE, MONTHLY_FORTUNE } from '../utils/fortuneData'
import { loadPoints, tryFeatureBonus } from '../utils/points'
import PointsToast from './PointsToast'

interface Props {
  savedBirth?: BirthInput | null
  onSave?: (b: BirthInput) => void
  onBack: () => void
}

// 2026 = 병오년 (丙午) — stemIndex 2
const YEAR_2026_STEM = 2

// 2026년 각 월의 월간(月干) — 해당 월 15일 기준 계산
const MONTH_STEMS_2026 = Array.from({ length: 12 }, (_, i) =>
  calculateSaju({ year: 2026, month: i + 1, day: 15, hour: 12, minute: null, gender: 'male' }).monthPillar.stemIndex
)

function Stars({ n }: { n: number }) {
  return (
    <span className="text-amber-400">{'★'.repeat(n)}<span className="text-stone-200">{'★'.repeat(5 - n)}</span></span>
  )
}

function MonthlySection({ dayStemIdx }: { dayStemIdx: number }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_16px_rgba(124,58,237,0.07)] p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 bg-violet-500 rounded-full" />
        <h2 className="text-base font-bold text-stone-800" style={{ fontFamily: "'Noto Serif KR', serif" }}>월별 운세 흐름</h2>
        <span className="text-xs text-stone-400 ml-1">사주 기반 · 2026년</span>
      </div>
      <div className="space-y-2">
        {MONTH_STEMS_2026.map((stemIdx, i) => {
          const sipsin  = getSipsin(dayStemIdx, stemIdx) ?? '비견'
          const data    = MONTHLY_FORTUNE[sipsin] ?? MONTHLY_FORTUNE['비견']
          const monthStem = STEMS[stemIdx]
          const isOpen  = open === i
          return (
            <div key={i} className="border border-stone-100 rounded-2xl overflow-hidden">
              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 transition"
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span className="text-xs font-bold text-stone-400 w-6 shrink-0">{i + 1}월</span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                  style={{ color: ELEMENT_COLORS[monthStem.element], backgroundColor: ELEMENT_COLORS[monthStem.element] + '18' }}
                >
                  {sipsin}
                </span>
                <span className="flex-1 text-xs text-stone-400 truncate">{data.조언.slice(0, 20)}…</span>
                <Stars n={data.star} />
                <span className="text-stone-300 text-xs ml-1">{isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4">
                  <div className="h-px bg-stone-100 mb-3" />
                  <p className="text-xs font-semibold text-violet-600 mb-1.5">✨ {i + 1}월 조언</p>
                  <p className="text-sm text-stone-500 leading-relaxed mb-3">{data.조언}</p>
                  <p className="text-sm text-stone-500 leading-relaxed">{data.총평}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function calcSinnyeon(birth: BirthInput) {
  const res = calculateSaju(birth)
  const idx = res.dayPillar.stemIndex
  return { dayStemIdx: idx, sipsin: getSipsin(idx, YEAR_2026_STEM) ?? '비견' }
}

export default function SinnyeonPage({ savedBirth, onSave, onBack }: Props) {
  const init = savedBirth ? calcSinnyeon(savedBirth) : null

  const [step, setStep]   = useState<'form' | 'result'>(init ? 'result' : 'form')
  const [birth, setBirth] = useState({
    year:  savedBirth ? String(savedBirth.year)  : '',
    month: savedBirth ? String(savedBirth.month) : '',
    day:   savedBirth ? String(savedBirth.day)   : '',
  })
  const [sipsin, setSipsin]       = useState<string>(init?.sipsin ?? '')
  const [dayStemIdx, setDayStemIdx] = useState(init?.dayStemIdx ?? 0)

  const yearStem = STEMS[YEAR_2026_STEM]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const inp: BirthInput = {
      year: Number(birth.year), month: Number(birth.month),
      day: Number(birth.day), hour: 12, minute: null, gender: 'male',
    }
    onSave?.(inp)
    const r = calcSinnyeon(inp)
    setDayStemIdx(r.dayStemIdx)
    setSipsin(r.sipsin)
    setStep('result')
    window.scrollTo(0, 0)
  }

  const fortune  = YEARLY_FORTUNE[sipsin] ?? YEARLY_FORTUNE['비견']
  const dayStem  = STEMS[dayStemIdx]
  const yc       = ELEMENT_COLORS[yearStem.element]

  const [toast, setToast] = useState<{ amount: number; total: number } | null>(null)
  function handlePointsClaim() {
    const { next, claimed } = tryFeatureBonus(loadPoints(), 'sinnyeon', '신년운세 확인 🗓️')
    if (claimed) setToast({ amount: 5, total: next.balance })
    else setToast({ amount: 0, total: loadPoints().balance })
  }

  return (
    <div className="min-h-screen bg-[#F4F2FF]">
      {/* 헤더 */}
      <div className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-stone-400 hover:text-stone-600 transition text-lg">←</button>
          <div>
            <h1 className="text-base font-bold text-stone-800" style={{ fontFamily: "'Noto Serif KR', serif" }}>2026 신년운세</h1>
            <p className="text-xs text-stone-400">병오년(丙午) 한 해 운세</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {step === 'form' && (
          <>
            {/* 배너 */}
            <div className="rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #e8f4f0 0%, #ddeef8 100%)' }}>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl font-bold" style={{ color: yc }}>丙</span>
                  <span className="text-2xl font-bold" style={{ color: yc }}>午</span>
                  <span className="text-sm text-stone-500 ml-1">병오년 · 말띠의 해</span>
                </div>
                <p className="text-2xl font-bold text-stone-800 mb-1" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                  2026 신년운세
                </p>
                <p className="text-sm text-stone-500">생년월일을 입력하면 나만의 2026 한 해 운세를 알려드립니다</p>
              </div>
            </div>

            {/* 폼 */}
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
                  className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-violet-200 hover:from-violet-500 hover:to-purple-500 transition-all text-sm active:scale-[0.98]"
                >
                  2026 신년운세 확인하기 →
                </button>
              </form>
            </div>
          </>
        )}

        {step === 'result' && (
          <>
            {/* 결과 배너 */}
            <div className="bg-gradient-to-br from-[#1E1152] via-[#2D1B69] to-[#160F3E] rounded-3xl p-5 shadow-xl shadow-violet-900/20">
              <p className="text-violet-300/70 text-xs mb-2">2026 병오년(丙午) 운세</p>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-bold text-white" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                  {dayStem?.hanja}일간
                </span>
                <span className="text-violet-300">×</span>
                <span className="text-3xl font-bold" style={{ color: yc }}>丙午</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm bg-violet-400/20 text-violet-200 border border-violet-400/30 px-2.5 py-1 rounded-full font-medium">
                  {sipsin}
                </span>
                <span className="text-sm text-violet-300">운의 해</span>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`text-lg ${i < fortune.star ? 'text-amber-400' : 'text-white/20'}`}>★</span>
                ))}
              </div>
            </div>

            {/* 총운 */}
            <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_16px_rgba(124,58,237,0.07)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-violet-500 rounded-full" />
                <h2 className="text-base font-bold text-stone-800" style={{ fontFamily: "'Noto Serif KR', serif" }}>2026년 총운</h2>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">{fortune.총평}</p>
            </div>

            {/* 분야별 운세 */}
            <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_16px_rgba(124,58,237,0.07)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-violet-500 rounded-full" />
                <h2 className="text-base font-bold text-stone-800" style={{ fontFamily: "'Noto Serif KR', serif" }}>분야별 운세</h2>
              </div>
              <div className="space-y-4">
                {[
                  { icon: '💰', label: '재물운', text: fortune.재물 },
                  { icon: '💕', label: '애정운', text: fortune.애정 },
                  { icon: '💪', label: '건강운', text: fortune.건강 },
                  { icon: '💼', label: '직업운', text: fortune.직업 },
                ].map(item => (
                  <div key={item.label} className="flex gap-3 bg-stone-50 border border-stone-100 rounded-2xl p-4">
                    <span className="text-xl shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-stone-500 mb-1">{item.label}</p>
                      <p className="text-sm text-stone-600 leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 올해의 조언 */}
            <div className="bg-violet-50 border border-violet-100 rounded-3xl p-5">
              <p className="text-xs font-semibold text-violet-600 mb-2">✨ 2026년 핵심 조언</p>
              <p className="text-sm text-stone-600 leading-relaxed">{fortune.조언}</p>
            </div>

            {/* 월별 운세 — 사주 십신 기반 */}
            <MonthlySection dayStemIdx={dayStemIdx} />

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
      <div className="text-center pb-8 text-xs text-stone-300">사주팔자 — 양력 기준 · 절기 근사값 적용</div>
    </div>
  )
}
