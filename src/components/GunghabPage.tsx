import { useState, useEffect } from 'react'
import type { BirthInput } from '../types'
import { calcGunghab, type GunghabRelation, type GunghabResult } from '../utils/gunghab'
import { loadPoints, tryFeatureBonus } from '../utils/points'
import PointsToast from './PointsToast'

interface Props {
  savedBirth?: BirthInput | null
  onSave?: (b: BirthInput) => void
  onBack: () => void
}

const REL_OPTIONS: { key: GunghabRelation; icon: string; label: string }[] = [
  { key: 'couple', icon: '💕', label: '커플'     },
  { key: 'friend', icon: '🤝', label: '친구'     },
  { key: 'work',   icon: '💼', label: '직장동료' },
]

type BirthFields = {
  year: string; month: string; day: string
  hour: string; minute: string; hourUnknown: boolean
}

function emptyFields(): BirthFields {
  return { year: '', month: '', day: '', hour: '', minute: '', hourUnknown: false }
}
function fromSaved(b: BirthInput): BirthFields {
  return {
    year: String(b.year), month: String(b.month), day: String(b.day),
    hour: b.hour !== null ? String(b.hour) : '',
    minute: b.minute !== null ? String(b.minute) : '',
    hourUnknown: b.hour === null,
  }
}
function toBirth(f: BirthFields): BirthInput {
  return {
    year: Number(f.year), month: Number(f.month), day: Number(f.day),
    hour: f.hourUnknown ? null : (f.hour !== '' ? Number(f.hour) : 12),
    minute: f.hourUnknown || f.minute === '' ? null : Number(f.minute),
    gender: 'male',
  }
}

function GaugeMeter({ value, color }: { value: number; color: string }) {
  const r = 46, cx = 60, cy = 60
  const circ = 2 * Math.PI * r
  const filled = (value / 100) * circ
  return (
    <svg viewBox="0 0 120 120" className="w-36 h-36">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={`${filled} ${circ - filled}`}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    </svg>
  )
}

function PersonForm({
  title, icon, fields, onChange,
}: {
  title: string; icon: string
  fields: BirthFields; onChange: (f: BirthFields) => void
}) {
  const set = (k: keyof BirthFields, v: string | boolean) => onChange({ ...fields, [k]: v })
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <p className="text-sm font-bold text-stone-700">{title}</p>
      </div>
      <div className="space-y-2.5">
        <div className="grid grid-cols-3 gap-2">
          {([
            { k: 'year'  as const, label: '출생년도', ph: '1990', min: 1900, max: 2010 },
            { k: 'month' as const, label: '월',       ph: '1',    min: 1,    max: 12   },
            { k: 'day'   as const, label: '일',       ph: '1',    min: 1,    max: 31   },
          ]).map(f => (
            <div key={f.k}>
              <label className="block text-[11px] font-semibold text-stone-400 mb-1">{f.label}</label>
              <input
                type="number" required placeholder={f.ph} min={f.min} max={f.max}
                value={fields[f.k]}
                onChange={e => set(f.k, e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-1 py-2.5 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition text-center"
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-stone-400">시간</label>
              <button
                type="button"
                onClick={() => set('hourUnknown', !fields.hourUnknown)}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition ${fields.hourUnknown ? 'bg-violet-100 text-violet-600' : 'bg-stone-100 text-stone-400'}`}
              >
                {fields.hourUnknown ? '모름 ✓' : '모름'}
              </button>
            </div>
            <input
              type="number" placeholder="0~23" min={0} max={23}
              disabled={fields.hourUnknown}
              value={fields.hourUnknown ? '' : fields.hour}
              onChange={e => set('hour', e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-1 py-2.5 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition text-center disabled:opacity-40"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-stone-400 mb-1">분 (선택)</label>
            <input
              type="number" placeholder="0~59" min={0} max={59}
              disabled={fields.hourUnknown}
              value={fields.hourUnknown ? '' : fields.minute}
              onChange={e => set('minute', e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-1 py-2.5 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition text-center disabled:opacity-40"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GunghabPage({ savedBirth, onSave, onBack }: Props) {
  const [step,     setStep]     = useState<'form' | 'loading' | 'result'>('form')
  const [rel,      setRel]      = useState<GunghabRelation>('couple')
  const [me,       setMe]       = useState<BirthFields>(() => savedBirth ? fromSaved(savedBirth) : emptyFields())
  const [them,     setThem]     = useState<BirthFields>(emptyFields)
  const [themName, setThemName] = useState('')
  const [result,   setResult]   = useState<GunghabResult | null>(null)
  const [toast,    setToast]    = useState<{ amount: number; total: number } | null>(null)

  useEffect(() => {
    if (step !== 'loading') return
    const t = setTimeout(() => { setStep('result'); window.scrollTo(0, 0) }, 1900)
    return () => clearTimeout(t)
  }, [step])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const birthA = toBirth(me)
    const birthB = toBirth(them)
    onSave?.(birthA)
    setResult(calcGunghab(birthA, birthB, rel))
    setStep('loading')
    window.scrollTo(0, 0)
  }

  function handlePointsClaim() {
    const { next, claimed } = tryFeatureBonus(loadPoints(), 'gunghab', '궁합 확인 💕')
    if (claimed) setToast({ amount: 5, total: next.balance })
    else setToast({ amount: 0, total: loadPoints().balance })
  }

  const relOpt    = REL_OPTIONS.find(r => r.key === rel)!
  const nameLabel = themName.trim() || '상대방'

  return (
    <div className="min-h-screen bg-[#F4F2FF]">
      <div className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-stone-400 hover:text-stone-600 transition text-lg">←</button>
          <div>
            <h1 className="text-base font-bold text-stone-800" style={{ fontFamily: "'Noto Serif KR', serif" }}>궁합 보기</h1>
            <p className="text-xs text-stone-400">사주 기반 두 사람의 궁합 분석</p>
          </div>
        </div>
      </div>

      {/* ── FORM ── */}
      {step === 'form' && (
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
          {/* 히어로 배너 */}
          <div className="bg-gradient-to-br from-[#1E1152] via-[#2D1B69] to-[#160F3E] rounded-3xl p-6 shadow-xl shadow-violet-900/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-pink-500/10 -translate-y-10 translate-x-10" />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-violet-400/10 translate-y-8 -translate-x-6" />
            <div className="relative z-10">
              <p className="text-violet-300/70 text-xs mb-2">사주팔자 기반 · 천간지지 분석</p>
              <p className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                궁합 보기 💕
              </p>
              <p className="text-sm text-violet-300/80 leading-relaxed">
                두 사람의 사주를 분석해<br />얼마나 잘 맞는지 알려드립니다
              </p>
            </div>
          </div>

          {/* 관계 선택 */}
          <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_16px_rgba(124,58,237,0.07)] p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-violet-500 rounded-full" />
              <p className="text-sm font-bold text-stone-800">관계 선택</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {REL_OPTIONS.map(opt => (
                <button
                  key={opt.key} type="button" onClick={() => setRel(opt.key)}
                  className={`py-3.5 rounded-2xl text-center transition-all ${
                    rel === opt.key
                      ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-200'
                      : 'bg-stone-50 border border-stone-200 text-stone-500 hover:border-violet-300'
                  }`}
                >
                  <p className="text-xl mb-1">{opt.icon}</p>
                  <p className="text-xs font-bold">{opt.label}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* 나 */}
            <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_16px_rgba(124,58,237,0.07)] p-5">
              <PersonForm title="나" icon="🧑" fields={me} onChange={setMe} />
            </div>

            {/* VS 구분선 */}
            <div className="flex items-center gap-3 px-2">
              <div className="flex-1 h-px bg-stone-200" />
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-md text-white text-xs font-bold">VS</div>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            {/* 상대방 */}
            <div className="bg-white rounded-3xl border border-violet-100 shadow-[0_2px_16px_rgba(124,58,237,0.1)] p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-400 mb-1.5">
                  {relOpt.icon} {relOpt.label} 이름 <span className="text-stone-300 font-normal">(선택)</span>
                </label>
                <input
                  type="text"
                  placeholder={rel === 'couple' ? '연인 이름을 입력하세요' : rel === 'friend' ? '친구 이름을 입력하세요' : '동료 이름을 입력하세요'}
                  value={themName}
                  onChange={e => setThemName(e.target.value)}
                  className="w-full bg-violet-50 border border-violet-200 rounded-xl px-3 py-2.5 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                />
              </div>
              <PersonForm title="상대방" icon={relOpt.icon} fields={them} onChange={setThem} />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-violet-200 hover:from-violet-500 hover:to-purple-500 transition-all text-sm active:scale-[0.98]"
            >
              {relOpt.icon} {nameLabel}과의 궁합 확인하기 →
            </button>
          </form>
        </div>
      )}

      {/* ── LOADING ── */}
      {step === 'loading' && (
        <div className="flex flex-col items-center justify-center min-h-[72vh] gap-6 px-4">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-violet-200 animate-ping opacity-25" />
            <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-violet-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-3xl">💕</div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-base font-bold text-stone-700">사주를 분석하는 중...</p>
            <p className="text-sm text-stone-400">{nameLabel}과의 궁합을 계산하고 있어요</p>
          </div>
        </div>
      )}

      {/* ── RESULT ── */}
      {step === 'result' && result && (
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

          {/* 결과 배너 */}
          <div className="bg-gradient-to-br from-[#1E1152] via-[#2D1B69] to-[#160F3E] rounded-3xl p-6 shadow-xl shadow-violet-900/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-pink-500/10 -translate-y-14 translate-x-14" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-violet-400/10 translate-y-10 -translate-x-8" />
            <div className="relative z-10">
              <p className="text-violet-300/60 text-xs mb-4">{relOpt.icon} {relOpt.label} 궁합 분석 결과</p>
              <div className="flex items-center gap-5 mb-4">
                {/* 원형 게이지 */}
                <div className="relative shrink-0">
                  <GaugeMeter value={result.total} color={result.gradeColor} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold text-white leading-none">{result.total}</p>
                    <p className="text-sm text-violet-300 font-semibold">%</p>
                  </div>
                </div>
                {/* 텍스트 */}
                <div className="flex-1">
                  <p className="text-lg font-bold text-white leading-snug mb-2" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                    {nameLabel}과의<br />궁합입니다
                  </p>
                  <span
                    className="inline-block text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{ color: result.gradeColor, backgroundColor: result.gradeBg }}
                  >
                    {result.grade}
                  </span>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm font-bold text-white">{result.headline}</p>
              </div>
            </div>
          </div>

          {/* 분야별 궁합 */}
          <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_16px_rgba(124,58,237,0.07)] p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-5 bg-violet-500 rounded-full" />
              <h2 className="text-sm font-bold text-stone-800">분야별 궁합</h2>
            </div>
            <div className="space-y-5">
              {[
                { label: '감정 궁합', score: result.emotion,     icon: '💕', desc: rel === 'couple' ? '서로에 대한 감정과 유대감' : '서로에 대한 감정과 공감대' },
                { label: '성격 궁합', score: result.personality, icon: '✨', desc: '가치관과 성격의 조화로움' },
                { label: '발전 궁합', score: result.future,      icon: '🌱', desc: rel === 'work' ? '함께 이루는 성과와 성장' : '함께할 미래와 발전 가능성' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{item.icon}</span>
                      <p className="text-xs font-semibold text-stone-700">{item.label}</p>
                      <p className="text-[11px] text-stone-400">{item.desc}</p>
                    </div>
                    <p className="text-sm font-bold text-violet-600 shrink-0">{item.score}%</p>
                  </div>
                  <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 궁합 포인트 */}
          {result.tips.length > 0 && (
            <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_16px_rgba(124,58,237,0.07)] p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-violet-500 rounded-full" />
                <h2 className="text-sm font-bold text-stone-800">궁합 포인트</h2>
              </div>
              <div className="space-y-2">
                {result.tips.map((tip, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-4 py-3 rounded-2xl"
                    style={{ backgroundColor: tip.good ? '#F3F0FF' : '#FFF1F2' }}
                  >
                    <span className="text-sm shrink-0 mt-0.5">{tip.good ? '✨' : '⚠️'}</span>
                    <p className="text-xs text-stone-600 leading-relaxed">{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 종합 설명 */}
          <div className="bg-violet-50 border border-violet-100 rounded-3xl p-5">
            <p className="text-xs font-semibold text-violet-600 mb-2">💌 종합 분석</p>
            <p className="text-sm text-stone-600 leading-relaxed">{result.summary}</p>
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
        </div>
      )}

      <div className="text-center pb-8 text-xs text-stone-300">궁합 — 참고용 · 사주 기반 분석</div>
    </div>
  )
}
