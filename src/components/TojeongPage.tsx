import { useState } from 'react'
import { calcTojeongGwe, getTojeongMonthly, getTojeongTotal } from '../utils/tojeong'

interface Props {
  onBack: () => void
}

function Stars({ n }: { n: number }) {
  return (
    <span>
      <span className="text-amber-400">{'★'.repeat(n)}</span>
      <span className="text-stone-200">{'★'.repeat(5 - n)}</span>
    </span>
  )
}

const SCORE_LABEL: Record<number, { label: string; color: string; bg: string }> = {
  5: { label: '대길', color: '#7C3AED', bg: '#F3F0FF' },
  4: { label: '길',   color: '#059669', bg: '#ECFDF5' },
  3: { label: '평',   color: '#6B7280', bg: '#F9FAFB' },
  2: { label: '주의', color: '#D97706', bg: '#FFFBEB' },
  1: { label: '흉',   color: '#DC2626', bg: '#FFF1F2' },
}

export default function TojeongPage({ onBack }: Props) {
  const [step, setStep] = useState<'form' | 'result'>('form')
  const [birth, setBirth] = useState({ year: '', month: '', day: '' })
  const [gwe, setGwe]     = useState({ sang: 1, jung: 1, ha: 1, gwe: 0 })
  const [monthly, setMonthly] = useState<{ month: number; score: number; text: string }[]>([])
  const [total, setTotal] = useState('')
  const [open, setOpen]   = useState<number | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const y = Number(birth.year), m = Number(birth.month), d = Number(birth.day)
    const g = calcTojeongGwe(y, m, d)
    setGwe(g)
    setMonthly(getTojeongMonthly(g.sang, g.jung, g.ha))
    setTotal(getTojeongTotal(g.sang))
    setStep('result')
    setOpen(null)
    window.scrollTo(0, 0)
  }

  const avgScore = monthly.length ? Math.round(monthly.reduce((s, m) => s + m.score, 0) / monthly.length) : 3

  return (
    <div className="min-h-screen bg-[#F4F2FF]">
      {/* 헤더 */}
      <div className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-stone-400 hover:text-stone-600 transition text-lg">←</button>
          <div>
            <h1 className="text-base font-bold text-stone-800" style={{ fontFamily: "'Noto Serif KR', serif" }}>토정비결</h1>
            <p className="text-xs text-stone-400">이지함 선생의 한 해 예언서</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {step === 'form' && (
          <>
            {/* 소개 배너 */}
            <div className="bg-gradient-to-br from-[#1E1152] via-[#2D1B69] to-[#160F3E] rounded-3xl p-6 shadow-xl shadow-violet-900/20">
              <p className="text-violet-300/70 text-xs mb-2">조선 시대의 지혜</p>
              <p className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                土亭秘訣
              </p>
              <p className="text-sm text-violet-300/80 leading-relaxed">
                조선 중기 이지함 선생이 저술한 비결서로,<br />
                생년월일로 그 해의 운세를 12달로 풀어냅니다.
              </p>
            </div>

            {/* 폼 */}
            <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_16px_rgba(124,58,237,0.07)] p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-5 bg-violet-500 rounded-full" />
                <h2 className="text-base font-bold text-stone-800">생년월일 입력</h2>
              </div>
              <p className="text-xs text-stone-400 mb-4 ml-3">양력 기준으로 입력하세요</p>
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
                  나의 토정비결 보기 →
                </button>
              </form>
            </div>
          </>
        )}

        {step === 'result' && (
          <>
            {/* 괘수 배너 */}
            <div className="bg-gradient-to-br from-[#1E1152] via-[#2D1B69] to-[#160F3E] rounded-3xl p-5 shadow-xl shadow-violet-900/20">
              <p className="text-violet-300/70 text-xs mb-3">2026년 토정비결 괘수</p>
              <div className="flex items-end gap-4 mb-3">
                {[
                  { label: '상괘', val: gwe.sang },
                  { label: '중괘', val: gwe.jung },
                  { label: '하괘', val: gwe.ha   },
                ].map(g => (
                  <div key={g.label} className="text-center">
                    <p className="text-3xl font-bold text-white" style={{ fontFamily: "'Noto Serif KR', serif" }}>{g.val}</p>
                    <p className="text-xs text-violet-300/60 mt-1">{g.label}</p>
                  </div>
                ))}
                <div className="ml-auto text-right">
                  <p className="text-xs text-violet-300/60 mb-1">종합</p>
                  <p className="text-2xl font-bold text-amber-400">{gwe.gwe}괘</p>
                </div>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`text-lg ${i < avgScore ? 'text-amber-400' : 'text-white/20'}`}>★</span>
                ))}
              </div>
            </div>

            {/* 총운 */}
            <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_16px_rgba(124,58,237,0.07)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-violet-500 rounded-full" />
                <h2 className="text-base font-bold text-stone-800" style={{ fontFamily: "'Noto Serif KR', serif" }}>2026년 총운</h2>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">{total}</p>
            </div>

            {/* 월별 운세 */}
            <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_16px_rgba(124,58,237,0.07)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-violet-500 rounded-full" />
                <h2 className="text-base font-bold text-stone-800" style={{ fontFamily: "'Noto Serif KR', serif" }}>월별 운세</h2>
              </div>
              <div className="space-y-2">
                {monthly.map(m => {
                  const meta = SCORE_LABEL[m.score]
                  const isOpen = open === m.month
                  return (
                    <div
                      key={m.month}
                      className="border border-stone-100 rounded-2xl overflow-hidden"
                    >
                      <button
                        className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-stone-50 transition"
                        onClick={() => setOpen(isOpen ? null : m.month)}
                      >
                        <span className="text-sm font-bold text-stone-500 w-8 shrink-0">{m.month}월</span>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                          style={{ color: meta.color, backgroundColor: meta.bg }}
                        >
                          {meta.label}
                        </span>
                        <span className="flex-1" />
                        <Stars n={m.score} />
                        <span className="text-stone-300 text-xs ml-1">{isOpen ? '▲' : '▼'}</span>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4">
                          <div className="h-px bg-stone-100 mb-3" />
                          <p className="text-sm text-stone-500 leading-relaxed">{m.text}</p>
                        </div>
                      )}
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
      <div className="text-center pb-8 text-xs text-stone-300">토정비결 — 참고용 · 전통 역술 기반</div>
    </div>
  )
}
