import { useState } from 'react'
import type { BirthInput } from '../types'
import { calcTojeongGwe, getTojeongMonthly, getTojeongTotal } from '../utils/tojeong'
import { loadPoints, tryFeatureBonus } from '../utils/points'
import PointsToast from './PointsToast'

interface Props {
  savedBirth?: BirthInput | null
  onSave?: (b: BirthInput) => void
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

function calcTojeong(birth: BirthInput) {
  const g = calcTojeongGwe(birth.year, birth.month, birth.day)
  return { gwe: g, monthly: getTojeongMonthly(g.sang, g.jung, g.ha), total: getTojeongTotal(g.sang) }
}

export default function TojeongPage({ savedBirth, onSave, onBack }: Props) {
  const init = savedBirth ? calcTojeong(savedBirth) : null

  const [step, setStep] = useState<'form' | 'result'>(init ? 'result' : 'form')
  const [birth, setBirth] = useState({
    year:  savedBirth ? String(savedBirth.year)  : '',
    month: savedBirth ? String(savedBirth.month) : '',
    day:   savedBirth ? String(savedBirth.day)   : '',
  })
  const [gwe, setGwe]         = useState(init?.gwe     ?? { sang: 1, jung: 1, ha: 1, gwe: 0 })
  const [monthly, setMonthly] = useState(init?.monthly ?? [] as { month: number; score: number; text: string }[])
  const [total, setTotal]     = useState(init?.total   ?? '')
  const [open, setOpen]       = useState<number | null>(null)
  const [toast, setToast]     = useState<{ amount: number; total: number } | null>(null)
  function handlePointsClaim() {
    const { next, claimed } = tryFeatureBonus(loadPoints(), 'tojeong', '토정비결 확인 📖')
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
    const r = calcTojeong(inp)
    setGwe(r.gwe)
    setMonthly(r.monthly)
    setTotal(r.total)
    setStep('result')
    setOpen(null)
    window.scrollTo(0, 0)
  }

  const avgScore = monthly.length ? Math.round(monthly.reduce((s, m) => s + m.score, 0) / monthly.length) : 3

  return (
    <div className="min-h-screen bg-[#0D0A1A]">
      {/* 헤더 */}
      <div className="bg-[#130E24] border-b border-[#2A1F4A] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-[#7B6F9A] hover:text-[#C4B8D8] transition text-lg">←</button>
          <div>
            <h1 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>토정비결</h1>
            <p className="text-xs text-[#7B6F9A]">이지함 선생의 한 해 예언서</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {step === 'form' && (
          <>
            {/* 소개 배너 */}
            <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-6 shadow-xl shadow-[#000]/40 border border-[#C9962A25]">
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
            <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-5 bg-[#C9962A] rounded-full" />
                <h2 className="text-base font-bold text-[#F5EDD4]">생년월일 입력</h2>
              </div>
              <p className="text-xs text-[#7B6F9A] mb-4 ml-3">양력 기준으로 입력하세요</p>
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
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-[#C9962A] to-[#E8B84B] text-[#0D0A1A] font-bold rounded-2xl shadow-lg shadow-[#C9962A30] hover:from-[#B8871F] hover:to-[#D4A030] transition-all text-sm active:scale-[0.98]"
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
            <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-5 shadow-xl shadow-[#000]/40 border border-[#C9962A25]">
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
            <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-[#C9962A] rounded-full" />
                <h2 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>2026년 총운</h2>
              </div>
              <p className="text-sm text-[#C4B8D8] leading-relaxed">{total}</p>
            </div>

            {/* 월별 운세 */}
            <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-[#C9962A] rounded-full" />
                <h2 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>월별 운세</h2>
              </div>
              <div className="space-y-2">
                {monthly.map(m => {
                  const meta = SCORE_LABEL[m.score]
                  const isOpen = open === m.month
                  return (
                    <div
                      key={m.month}
                      className="border border-[#2A1F4A] rounded-2xl overflow-hidden"
                    >
                      <button
                        className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-[#1C1438] transition"
                        onClick={() => setOpen(isOpen ? null : m.month)}
                      >
                        <span className="text-sm font-bold text-[#A89BC0] w-8 shrink-0">{m.month}월</span>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                          style={{ color: meta.color, backgroundColor: meta.bg }}
                        >
                          {meta.label}
                        </span>
                        <span className="flex-1" />
                        <Stars n={m.score} />
                        <span className="text-[#4A4060] text-xs ml-1">{isOpen ? '▲' : '▼'}</span>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4">
                          <div className="h-px bg-[#2A1F4A] mb-3" />
                          <p className="text-sm text-[#A89BC0] leading-relaxed">{m.text}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {toast && toast.amount > 0 && (
              <PointsToast amount={toast.amount} total={toast.total} onClose={() => setToast(null)} />
            )}
            <button
              onClick={handlePointsClaim}
              className="w-full py-3.5 bg-gradient-to-r from-[#C9962A] to-[#E8B84B] text-[#0D0A1A] font-bold rounded-2xl text-sm shadow-md shadow-[#C9962A30] active:scale-[0.98] transition-all"
            >
              {toast !== null && toast.amount === 0 ? '✓ 오늘 포인트 이미 받음' : '💎 포인트 받기 +5P'}
            </button>
            <button
              onClick={() => { setStep('form'); window.scrollTo(0, 0) }}
              className="w-full py-3.5 bg-[#231844] text-[#C4B8D8] font-semibold rounded-2xl text-sm hover:bg-[#2A1F4A] transition active:scale-[0.98]"
            >
              다시 조회하기
            </button>
          </>
        )}
      </div>
      <div className="text-center pb-8 text-xs text-[#4A4060]">토정비결 — 참고용 · 전통 역술 기반</div>
    </div>
  )
}
