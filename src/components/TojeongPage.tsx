import { useState } from 'react'
import type { BirthInput } from '../types'
import { calcTojeongGwe, getTojeongMonthly, getTojeongTotal } from '../utils/tojeong'
import PointsClaimButton from './PointsClaimButton'

const CURR_YEAR = new Date().getFullYear()
import { IcTojeong } from './icons/SajuIcons'

interface Props {
  savedBirth?: BirthInput | null
  onSave?: (b: BirthInput) => void
  onBack: () => void
}

function Stars({ n }: { n: number }) {
  return (
    <span>
      <span className="text-[#9A6A12]">{'★'.repeat(n)}</span>
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

  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form')
  const [birth, setBirth] = useState({
    year:  savedBirth ? String(savedBirth.year)  : '',
    month: savedBirth ? String(savedBirth.month) : '',
    day:   savedBirth ? String(savedBirth.day)   : '',
    hour:  savedBirth?.hour != null ? String(savedBirth.hour) : '',
    minute: savedBirth?.minute != null ? String(savedBirth.minute) : '',
  })
  const [gwe, setGwe]         = useState(init?.gwe     ?? { sang: 1, jung: 1, ha: 1, gwe: 0 })
  const [monthly, setMonthly] = useState(init?.monthly ?? [] as { month: number; score: number; text: string }[])
  const [total, setTotal]     = useState(init?.total   ?? '')
  const [open, setOpen]       = useState<number | null>(null)

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
    const r = calcTojeong(inp)
    setGwe(r.gwe)
    setMonthly(r.monthly)
    setTotal(r.total)
    setOpen(null)
    setStep('loading')
    window.scrollTo(0, 0)
    setTimeout(() => { setStep('result'); window.scrollTo(0, 0) }, 2500)
  }

  const avgScore = monthly.length ? Math.round(monthly.reduce((s, m) => s + m.score, 0) / monthly.length) : 3

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <div className="bg-[#FBF4E2] border-b border-[#D8C290] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} aria-label="뒤로 가기" className="text-[#9A8155] hover:text-[#5C4A2E] transition text-lg">←</button>
          <div>
            <h1 className="text-base font-bold text-[#3B2A16]" style={{ fontFamily: "'Gowun Batang', serif" }}>토정비결</h1>
            <p className="text-xs text-[#9A8155]">이지함 선생의 한 해 예언서</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {step === 'form' && (
          <>
            {/* 소개 배너 */}
            <div className="bg-gradient-to-br from-[#FBF4E2] via-[#F3E7C8] to-[#EAD9B0] rounded-3xl p-6 shadow-xl shadow-[#000]/40 border border-[#9A6A1225]">
              <p className="text-[#9A8155] text-xs mb-2">조선 시대의 지혜</p>
              <p className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Gowun Batang', serif" }}>
                土亭秘訣
              </p>
              <p className="text-sm text-[#9A8155]/80 leading-relaxed">
                조선 중기 이지함 선생이 저술한 비결서로,<br />
                생년월일로 그 해의 운세를 12달로 풀어냅니다.
              </p>
            </div>

            {/* 폼 */}
            <div className="bg-[#FBF4E2] rounded-3xl border border-[#D8C290] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-5 bg-[#9A6A12] rounded-full" />
                <h2 className="text-base font-bold text-[#3B2A16]">생년월일 입력</h2>
              </div>
              <p className="text-xs text-[#9A8155] mb-4 ml-3">양력 기준으로 입력하세요</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: '출생년도', name: 'year',  placeholder: '1990', min: 1900, max: 2010 },
                    { label: '월',       name: 'month', placeholder: '1',    min: 1,    max: 12 },
                    { label: '일',       name: 'day',   placeholder: '1',    min: 1,    max: 31 },
                  ].map(f => (
                    <div key={f.name}>
                      <label className="block text-xs font-semibold text-[#6E5836] mb-1.5">{f.label}</label>
                      <input
                        type="number" required placeholder={f.placeholder}
                        min={f.min} max={f.max}
                        value={birth[f.name as keyof typeof birth]}
                        onChange={e => setBirth(p => ({ ...p, [f.name]: e.target.value }))}
                        className="w-full bg-[#E9DAB8] border border-[#D8C290] rounded-2xl px-3 py-3 text-sm text-[#3B2A16] placeholder:text-[#A89167] focus:outline-none focus:border-[#9A6A12] focus:ring-2 focus:ring-[#9A6A1220] transition text-center"
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#6E5836] mb-1.5">출생 시간 <span className="text-[#A89167] font-normal">(선택, 0~23시)</span></label>
                    <input
                      type="number" placeholder="예: 14"
                      min={0} max={23}
                      value={birth.hour}
                      onChange={e => setBirth(p => ({ ...p, hour: e.target.value }))}
                      className="w-full bg-[#E9DAB8] border border-[#D8C290] rounded-2xl px-3 py-3 text-sm text-[#3B2A16] placeholder:text-[#A89167] focus:outline-none focus:border-[#9A6A12] focus:ring-2 focus:ring-[#9A6A1220] transition text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6E5836] mb-1.5">분 <span className="text-[#A89167] font-normal">(선택, 0~59분)</span></label>
                    <input
                      type="number" placeholder="예: 30"
                      min={0} max={59}
                      disabled={birth.hour === ''}
                      value={birth.minute}
                      onChange={e => setBirth(p => ({ ...p, minute: e.target.value }))}
                      className="w-full bg-[#E9DAB8] border border-[#D8C290] rounded-2xl px-3 py-3 text-sm text-[#3B2A16] placeholder:text-[#A89167] focus:outline-none focus:border-[#9A6A12] focus:ring-2 focus:ring-[#9A6A1220] transition text-center disabled:opacity-40"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-[#9A6A12] to-[#B5841C] text-[#0D0A1A] font-bold rounded-2xl shadow-lg shadow-[#9A6A1230] hover:from-[#9A6A12] hover:to-[#B5841C] transition-all text-sm active:scale-[0.98]"
                >
                  나의 토정비결 보기 →
                </button>
              </form>
            </div>
          </>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-2 border-[#9A6A1220] animate-ping"/>
              <div className="absolute inset-2 rounded-full border-2 border-[#9A6A1240] animate-ping" style={{ animationDelay: '0.3s' }}/>
              <div className="absolute inset-4 rounded-full border-2 border-[#9A6A1260] animate-ping" style={{ animationDelay: '0.6s' }}/>
              <div className="absolute inset-0 flex items-center justify-center"><IcTojeong size={32} className="text-[#9A6A12]"/></div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-bold text-[#3B2A16]" style={{ fontFamily: "'Gowun Batang', serif" }}>토정비결 풀이 중...</p>
              <p className="text-sm text-[#9A8155]">이지함 선생의 비결서를 펼치고 있습니다</p>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className="space-y-4 animate-fade-in-up">
            {/* 괘수 배너 */}
            <div className="bg-gradient-to-br from-[#FBF4E2] via-[#F3E7C8] to-[#EAD9B0] rounded-3xl p-5 shadow-xl shadow-[#000]/40 border border-[#9A6A1225]">
              <p className="text-[#9A8155] text-xs mb-3">{CURR_YEAR}년 토정비결 괘수</p>
              <div className="flex items-end gap-4 mb-3">
                {[
                  { label: '상괘', val: gwe.sang },
                  { label: '중괘', val: gwe.jung },
                  { label: '하괘', val: gwe.ha   },
                ].map(g => (
                  <div key={g.label} className="text-center">
                    <p className="text-3xl font-bold text-white" style={{ fontFamily: "'Gowun Batang', serif" }}>{g.val}</p>
                    <p className="text-xs text-[#9A8155]/60 mt-1">{g.label}</p>
                  </div>
                ))}
                <div className="ml-auto text-right">
                  <p className="text-xs text-[#9A8155]/60 mb-1">종합</p>
                  <p className="text-2xl font-bold text-[#9A6A12]">{gwe.gwe}괘</p>
                </div>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`text-lg ${i < avgScore ? 'text-[#9A6A12]' : 'text-white/20'}`}>★</span>
                ))}
              </div>
            </div>

            {/* 총운 */}
            <div className="bg-[#FBF4E2] rounded-3xl border border-[#D8C290] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-[#9A6A12] rounded-full" />
                <h2 className="text-base font-bold text-[#3B2A16]" style={{ fontFamily: "'Gowun Batang', serif" }}>{CURR_YEAR}년 총운</h2>
              </div>
              <p className="text-sm text-[#5C4A2E] leading-relaxed">{total}</p>
            </div>

            {/* 월별 운세 */}
            <div className="bg-[#FBF4E2] rounded-3xl border border-[#D8C290] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-[#9A6A12] rounded-full" />
                <h2 className="text-base font-bold text-[#3B2A16]" style={{ fontFamily: "'Gowun Batang', serif" }}>월별 운세</h2>
              </div>
              <div className="space-y-2">
                {monthly.map(m => {
                  const meta = SCORE_LABEL[m.score]
                  const isOpen = open === m.month
                  return (
                    <div
                      key={m.month}
                      className="border border-[#D8C290] rounded-2xl overflow-hidden"
                    >
                      <button
                        className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-[#E9DAB8] transition"
                        onClick={() => setOpen(isOpen ? null : m.month)}
                      >
                        <span className="text-sm font-bold text-[#6E5836] w-8 shrink-0">{m.month}월</span>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                          style={{ color: meta.color, backgroundColor: meta.bg }}
                        >
                          {meta.label}
                        </span>
                        <span className="flex-1" />
                        <Stars n={m.score} />
                        <span className="text-[#A89167] text-xs ml-1">{isOpen ? '▲' : '▼'}</span>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4">
                          <div className="h-px bg-[#D8C290] mb-3" />
                          <p className="text-sm text-[#6E5836] leading-relaxed">{m.text}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <PointsClaimButton featureKey="tojeong" label="토정비결 확인 📖" />
            <button
              onClick={() => { setStep('form'); window.scrollTo(0, 0) }}
              className="w-full py-3.5 bg-[#E3D0A4] text-[#5C4A2E] font-semibold rounded-2xl text-sm hover:bg-[#D8C290] transition active:scale-[0.98]"
            >
              다시 조회하기
            </button>
          </div>
        )}
      </div>
      <div className="text-center pb-8 text-xs text-[#A89167]">토정비결 — 참고용 · 전통 역술 기반</div>
    </div>
  )
}
