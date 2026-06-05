import { useState } from 'react'
import type { BirthInput } from '../types'
import { calculateSaju, getSipsin } from '../utils/saju'
import { STEMS, ELEMENT_COLORS } from '../utils/constants'
import { YEARLY_FORTUNE } from '../utils/fortuneData'

interface Props {
  onBack: () => void
}

// 2026 = 병오년 (丙午) — stemIndex 2
const YEAR_2026_STEM = 2   // 丙 fire yang

const MONTH_LUCK: string[] = [
  '변화의 기운이 강합니다. 새로운 계획을 구체화하기 좋은 달입니다.',
  '인내가 필요한 달입니다. 조용히 실력을 쌓으세요.',
  '봄의 기운과 함께 활력이 넘치는 달입니다. 적극적으로 행동하세요.',
  '귀인의 도움이 따르는 달입니다. 주변과의 협력이 빛납니다.',
  '재물운이 상승하는 달입니다. 기회를 놓치지 마세요.',
  '애정운이 좋아지는 달입니다. 소중한 사람에게 마음을 표현하세요.',
  '직업·사업에서 성과가 나타나는 달입니다. 자신감을 가지세요.',
  '건강 관리에 집중하는 달입니다. 무리하지 않고 충전하세요.',
  '마무리를 잘 해야 하는 달입니다. 주변 정리와 계획 점검이 중요합니다.',
  '새로운 도전의 싹이 트는 달입니다. 내년을 위한 준비를 시작하세요.',
  '인간관계에서 기쁜 소식이 있는 달입니다. 사교 활동을 즐기세요.',
  '한 해를 마무리하며 복이 모이는 달입니다. 감사한 마음으로 정리하세요.',
]

function Stars({ n }: { n: number }) {
  return (
    <span className="text-amber-400">{'★'.repeat(n)}<span className="text-stone-200">{'★'.repeat(5 - n)}</span></span>
  )
}

export default function SinnyeonPage({ onBack }: Props) {
  const [step, setStep]   = useState<'form' | 'result'>('form')
  const [birth, setBirth] = useState({ year: '', month: '', day: '' })
  const [sipsin, setSipsin] = useState<string>('')
  const [dayStemIdx, setDayStemIdx] = useState(0)

  const yearStem = STEMS[YEAR_2026_STEM]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const inp: BirthInput = {
      year: Number(birth.year), month: Number(birth.month),
      day: Number(birth.day), hour: 12, minute: null, gender: 'male',
    }
    const res    = calculateSaju(inp)
    const idx    = res.dayPillar.stemIndex
    const s      = getSipsin(idx, YEAR_2026_STEM)
    setDayStemIdx(idx)
    setSipsin(s ?? '비견')
    setStep('result')
    window.scrollTo(0, 0)
  }

  const fortune  = YEARLY_FORTUNE[sipsin] ?? YEARLY_FORTUNE['비견']
  const dayStem  = STEMS[dayStemIdx]
  const yc       = ELEMENT_COLORS[yearStem.element]

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

            {/* 월별 운세 */}
            <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_16px_rgba(124,58,237,0.07)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-violet-500 rounded-full" />
                <h2 className="text-base font-bold text-stone-800" style={{ fontFamily: "'Noto Serif KR', serif" }}>월별 운세 흐름</h2>
              </div>
              <div className="space-y-2">
                {MONTH_LUCK.map((text, i) => {
                  const score = Math.min(5, Math.max(1, fortune.star + (([1,2,-1,0,1,-1,2,0,1,-1,0,1][i] ?? 0))))
                  return (
                    <div key={i} className="flex gap-3 items-start py-2.5 border-b border-stone-50 last:border-0">
                      <span className="text-xs font-bold text-stone-400 w-8 shrink-0 pt-0.5">{i + 1}월</span>
                      <div className="flex-1">
                        <p className="text-xs text-stone-500 leading-relaxed">{text}</p>
                      </div>
                      <div className="shrink-0 text-xs"><Stars n={score} /></div>
                    </div>
                  )
                })}
              </div>
            </div>

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
