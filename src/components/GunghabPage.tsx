import { useState, useEffect, useRef } from 'react'
import { blockGuestRetry } from '../utils/guestGate'
import type { BirthInput } from '../types'
import { calcGunghab, type GunghabRelation, type GunghabResult } from '../utils/gunghab'
import PointsClaimButton from './PointsClaimButton'
import { IcGunghab, IcLoveLuck, IcMatch, IcJob, IcProfile } from './icons/SajuIcons'

interface Props {
  savedBirth?: BirthInput | null
  onSave?: (b: BirthInput) => void
  onBack: () => void
}

type IconCmp = React.FC<{ size?: number; className?: string }>

const REL_OPTIONS: { key: GunghabRelation; Icon: IconCmp; label: string; desc: string }[] = [
  { key: 'couple', Icon: IcLoveLuck, label: '커플',     desc: '연인 궁합' },
  { key: 'friend', Icon: IcMatch,    label: '친구',     desc: '우정 궁합' },
  { key: 'work',   Icon: IcJob,      label: '직장동료', desc: '업무 궁합' },
]

// 캔바 디자인의 점수 바 색상 — 빨강(낮음) → 골드(중간) → 초록(높음) 스펙트럼
const SPECTRUM_BAR = 'linear-gradient(90deg, #B12629 0%, #C46D19 32%, #D2800D 50%, #6B8A3A 72%, #2F7A4A 100%)'

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

function GaugeMeter({ value, color, size = 176, stroke = 9 }: { value: number; color: string; size?: number; stroke?: number }) {
  const r = size / 2 - stroke - 3
  const cx = size / 2, cy = size / 2
  const circ = 2 * Math.PI * r
  const filled = (value / 100) * circ
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={stroke + 5} />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${filled} ${circ - filled}`}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    </svg>
  )
}

function CornerBracket({ corner }: { corner: 'tl' | 'tr' | 'bl' | 'br' }) {
  const rotate = { tl: 0, tr: 90, bl: -90, br: 180 }[corner]
  const pos = {
    tl: 'top-3 left-3',
    tr: 'top-3 right-3',
    bl: 'bottom-3 left-3',
    br: 'bottom-3 right-3',
  }[corner]
  return (
    <svg viewBox="0 0 48 48" className={`absolute ${pos} w-9 h-9 pointer-events-none`} style={{ transform: `rotate(${rotate}deg)` }}>
      <path d="M2 16 V2 H16" fill="none" stroke="#C9962A" strokeWidth="1.5" opacity="0.7" />
      <path d="M8 22 V8 H22" fill="none" stroke="#C9962A" strokeWidth="1.5" opacity="0.45" />
    </svg>
  )
}

function PersonForm({
  title, icon, fields, onChange, accent,
}: {
  title: string; icon: React.ReactNode
  fields: BirthFields; onChange: (f: BirthFields) => void
  accent: 'violet' | 'rose'
}) {
  const set = (k: keyof BirthFields, v: string | boolean) => onChange({ ...fields, [k]: v })
  const focusCls = accent === 'rose'
    ? 'focus:border-rose-400 focus:ring-2 focus:ring-rose-900/20'
    : 'focus:border-[#C9962A] focus:ring-2 focus:ring-[#C9962A20]'
  const unknownCls = accent === 'rose'
    ? 'bg-rose-900/30 text-rose-300'
    : 'bg-[#C9962A20] text-[#C9962A]'
  const accentLine = accent === 'rose' ? 'bg-rose-400' : 'bg-[#C9962A]'

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-1 h-4 ${accentLine} rounded-full`} />
        {icon}
        <p className="text-sm font-bold text-[#F5EDD4]">{title}</p>
      </div>
      <div className="space-y-2.5">
        <div className="grid grid-cols-3 gap-2">
          {([
            { k: 'year'  as const, label: '출생년도', ph: '1990', min: 1900, max: 2010 },
            { k: 'month' as const, label: '월',       ph: '1',    min: 1,    max: 12   },
            { k: 'day'   as const, label: '일',       ph: '1',    min: 1,    max: 31   },
          ]).map(f => (
            <div key={f.k}>
              <label className="block text-[11px] font-semibold text-[#A89BC0] mb-1">{f.label}</label>
              <input
                type="number" required placeholder={f.ph} min={f.min} max={f.max}
                value={fields[f.k]}
                onChange={e => set(f.k, e.target.value)}
                className={`w-full bg-[#1C1438] border border-[#2A1F4A] rounded-xl px-1 py-2.5 text-sm text-[#F5EDD4] placeholder:text-[#4A4060] focus:outline-none transition text-center ${focusCls}`}
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-[#A89BC0]">시간</label>
              <button
                type="button"
                onClick={() => set('hourUnknown', !fields.hourUnknown)}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition ${fields.hourUnknown ? unknownCls : 'bg-[#231844] text-[#7B6F9A]'}`}
              >
                {fields.hourUnknown ? '모름 ✓' : '모름'}
              </button>
            </div>
            <input
              type="number" placeholder="0~23" min={0} max={23}
              disabled={fields.hourUnknown}
              value={fields.hourUnknown ? '' : fields.hour}
              onChange={e => set('hour', e.target.value)}
              className={`w-full bg-[#1C1438] border border-[#2A1F4A] rounded-xl px-1 py-2.5 text-sm text-[#F5EDD4] placeholder:text-[#4A4060] focus:outline-none transition text-center disabled:opacity-40 ${focusCls}`}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#A89BC0] mb-1">분 (선택)</label>
            <input
              type="number" placeholder="0~59" min={0} max={59}
              disabled={fields.hourUnknown}
              value={fields.hourUnknown ? '' : fields.minute}
              onChange={e => set('minute', e.target.value)}
              className={`w-full bg-[#1C1438] border border-[#2A1F4A] rounded-xl px-1 py-2.5 text-sm text-[#F5EDD4] placeholder:text-[#4A4060] focus:outline-none transition text-center disabled:opacity-40 ${focusCls}`}
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
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step !== 'loading') return
    const t = setTimeout(() => { setStep('result'); window.scrollTo(0, 0) }, 2000)
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

  const relOpt    = REL_OPTIONS.find(r => r.key === rel)!
  const nameLabel = themName.trim() || '상대방'
  const nameInit  = nameLabel[0] ?? '?'

  return (
    <div className="min-h-screen">
      <div className="bg-[#130E24] border-b border-[#2A1F4A] sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} aria-label="뒤로 가기" className="text-[#7B6F9A] hover:text-[#C4B8D8] transition text-lg">←</button>
          <div>
            <h1 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>궁합 보기</h1>
            <p className="text-xs text-[#7B6F9A]">사주 기반 두 사람의 궁합 분석</p>
          </div>
        </div>
      </div>

      {/* ── FORM ── */}
      {step === 'form' && (
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
          {/* 히어로 배너 */}
          <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-6 shadow-xl shadow-[#000]/40 border border-[#C9962A25] relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-rose-500/15 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-violet-400/15 blur-2xl" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="flex-1">
                <p className="text-violet-300/70 text-xs mb-2">사주팔자 기반 천간지지 분석</p>
                <p className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Gowun Batang', serif" }}>
                  궁합 보기
                </p>
                <p className="text-sm text-violet-300/80 leading-relaxed">두 사람의 사주를 분석해<br />얼마나 잘 맞는지 알려드립니다</p>
              </div>
              <IcGunghab size={60} className="text-[#C9962A] opacity-90 shrink-0" />
            </div>
          </div>

          {/* 관계 선택 */}
          <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-5">
            <p className="text-xs font-semibold text-[#A89BC0] mb-3">관계 선택</p>
            <div className="grid grid-cols-3 gap-2">
              {REL_OPTIONS.map(opt => {
                const active = rel === opt.key
                return (
                  <button
                    key={opt.key} type="button" onClick={() => setRel(opt.key)}
                    className={`py-3.5 rounded-2xl text-center transition-all active:scale-95 border ${
                      active
                        ? 'bg-gradient-to-b from-[#C9962A] to-[#B8871F] border-[#E8B84B] text-[#0D0A1A] shadow-lg shadow-[#C9962A40]'
                        : 'bg-[#1C1438] border-[#2A1F4A] text-[#A89BC0]'
                    }`}
                  >
                    <opt.Icon size={26} className={`mx-auto mb-1.5 ${active ? 'text-[#0D0A1A]' : 'text-[#C9962A]'}`} />
                    <p className="text-xs font-bold">{opt.label}</p>
                    <p className="text-[10px] opacity-70 mt-0.5">{opt.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* 나 */}
            <div className="bg-[#130E24] rounded-3xl border border-[#C9962A30] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-5">
              <PersonForm title="나" icon={<IcProfile size={16} className="text-[#C9962A]" />} fields={me} onChange={setMe} accent="violet" />
            </div>

            {/* VS 구분선 */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent" />
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400 to-rose-400 animate-ping opacity-20" />
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-rose-500 flex items-center justify-center shadow-lg text-white text-xs font-bold">
                  VS
                </div>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-rose-200 to-transparent" />
            </div>

            {/* 상대방 */}
            <div className="bg-[#130E24] rounded-3xl border border-rose-900/40 shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-5 space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#A89BC0] mb-1.5">
                  <relOpt.Icon size={14} className="text-[#C9962A]" />
                  {relOpt.label} 이름
                  <span className="text-[#4A4060] font-normal">(선택)</span>
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={rel === 'couple' ? '연인 이름을 입력하세요' : rel === 'friend' ? '친구 이름을 입력하세요' : '동료 이름을 입력하세요'}
                  value={themName}
                  onChange={e => setThemName(e.target.value)}
                  className="w-full bg-[#1C1438] border border-rose-900/40 rounded-xl px-3 py-2.5 text-sm text-[#F5EDD4] placeholder:text-[#4A4060] focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-900/20 transition"
                />
              </div>
              <PersonForm title="상대방" icon={<relOpt.Icon size={16} className="text-rose-300" />} fields={them} onChange={setThem} accent="rose" />
            </div>

            <button
              type="submit"
              className="w-full py-4 flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#C9962A] to-[#E8B84B] text-[#0D0A1A] font-bold rounded-2xl shadow-lg shadow-[#C9962A30] transition-all text-sm active:scale-[0.98]"
            >
              <relOpt.Icon size={16} className="text-[#0D0A1A]" /> {nameLabel}과의 궁합 확인하기 →
            </button>
          </form>
        </div>
      )}

      {/* ── LOADING ── */}
      {step === 'loading' && (
        <div className="flex flex-col items-center justify-center min-h-[72vh] gap-8 px-4">
          {/* 두 오브 회전 애니메이션 */}
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-6 h-6 rounded-full bg-violet-500 shadow-lg shadow-violet-300" />
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-6 h-6 rounded-full bg-rose-400 shadow-lg shadow-rose-200" />
            </div>
            <div className="absolute inset-4 rounded-full border-2 border-dashed border-[#2A1F4A] animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
            <div className="absolute inset-0 flex items-center justify-center"><IcGunghab size={36} className="text-[#C9962A]" /></div>
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-[#F5EDD4] mb-1">사주를 분석하는 중</p>
            <p className="text-sm text-[#7B6F9A]">{nameLabel}과의 궁합을 계산하고 있어요</p>
            <div className="flex justify-center gap-1.5 mt-4">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#C9962A] animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── RESULT ── */}
      {step === 'result' && result && (
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-4 animate-fade-in-up">

          {/* 메인 패널 — 아바타 + 거대 게이지 + 점수 바 */}
          <div className="relative bg-gradient-to-br from-[#1A0E22] via-[#0F0712] to-[#000005] rounded-3xl border border-[#C9962A40] shadow-xl shadow-black/50 overflow-hidden">
            <CornerBracket corner="tl" />
            <CornerBracket corner="tr" />
            <CornerBracket corner="bl" />
            <CornerBracket corner="br" />

            <div className="relative z-10 px-5 pt-7 pb-5">
              {/* 아바타 줄 */}
              <div className="flex items-center justify-between px-2">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 border-2 border-violet-300/40 flex items-center justify-center text-white text-base font-bold shadow-lg shadow-violet-900/50">나</div>
                  <span className="text-[11px] text-violet-300/80 font-medium">나</span>
                </div>
                <span className="text-[#C9962A] text-xs font-bold tracking-widest">VS</span>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 border-2 border-rose-200/40 flex items-center justify-center text-white text-base font-bold shadow-lg shadow-rose-900/50">{nameInit}</div>
                  <span className="text-[11px] text-rose-300/80 font-medium">{nameLabel}</span>
                </div>
              </div>

              {/* 거대 게이지 — 이클립스 글로우 */}
              <div className="relative flex flex-col items-center justify-center -mt-1">
                <div className="absolute w-56 h-56 rounded-full blur-3xl opacity-40" style={{ backgroundColor: result.gradeColor }} />
                <div className="relative w-64 h-64" style={{ filter: `drop-shadow(0 0 24px ${result.gradeColor}66)` }}>
                  <GaugeMeter value={result.total} color={result.gradeColor} size={256} stroke={14} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-6xl font-bold leading-none tabular-nums" style={{ color: '#F7DA9B' }}>{result.total}</p>
                    <p className="text-sm font-bold text-[#C9962A] mt-1">%</p>
                    <span
                      className="mt-3 inline-block text-xs font-bold px-3 py-1.5 rounded-full"
                      style={{ color: result.gradeColor, backgroundColor: result.gradeBg, boxShadow: `0 0 12px ${result.gradeColor}40` }}
                    >
                      {result.grade}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-base font-bold text-white text-center leading-snug px-4" style={{ fontFamily: "'Gowun Batang', serif" }}>
                  {result.headline}
                </p>
              </div>

              {/* 스펙트럼 점수 바 */}
              <div className="mt-6 space-y-3">
                {[
                  { label: '감정 궁합', score: result.emotion },
                  { label: '성격 궁합', score: result.personality },
                  { label: '발전 궁합', score: result.future },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] text-[#C4B8D8] font-medium">{item.label}</span>
                      <span className="text-[11px] font-bold text-[#F7DA9B] tabular-nums">{item.score}%</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden bg-white/5">
                      <div className="h-full rounded-full" style={{ width: `${item.score}%`, background: SPECTRUM_BAR }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 골드 디바이더 */}
            <div className="mx-5 mb-5 h-px bg-gradient-to-r from-transparent via-[#C9962A80] to-transparent" />
          </div>

          {/* 궁합 포인트 — 장점 / 유의점 */}
          <div className="relative bg-gradient-to-br from-[#1A0E22] via-[#0F0712] to-[#000005] rounded-3xl border border-[#C9962A40] shadow-xl shadow-black/50 pt-9 pb-5 px-5">
            <CornerBracket corner="tl" />
            <CornerBracket corner="tr" />
            <CornerBracket corner="bl" />
            <CornerBracket corner="br" />

            {/* 떠 있는 엠블럼 */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-gradient-to-r from-[#C9962A] to-[#E8B84B] text-[#0D0A1A] text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-[#C9962A40] whitespace-nowrap">
              💫 궁합 포인트
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <div>
                <p className="text-[11px] font-bold text-[#7CC98A] mb-2">✓ 장점</p>
                <div className="space-y-2">
                  {result.tips.filter(t => t.good).length > 0 ? (
                    result.tips.filter(t => t.good).map((tip, i) => (
                      <div key={i} className="bg-[#C9962A12] border border-[#C9962A30] rounded-xl px-3 py-2.5">
                        <p className="text-[11px] text-[#C4B8D8] leading-relaxed">{tip.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-[#4A4060] px-1">눈에 띄는 강점은 없어요</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-rose-300 mb-2">! 유의점</p>
                <div className="space-y-2">
                  {result.tips.filter(t => !t.good).length > 0 ? (
                    result.tips.filter(t => !t.good).map((tip, i) => (
                      <div key={i} className="bg-rose-900/15 border border-rose-900/40 rounded-xl px-3 py-2.5">
                        <p className="text-[11px] text-[#A89BC0] leading-relaxed">{tip.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-[#4A4060] px-1">큰 우려는 없어요</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 종합 설명 */}
          <div className="bg-[#C9962A15] border border-[#C9962A30] rounded-3xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-[#C9962A]/10 -translate-y-4 translate-x-4" />
            <p className="text-xs font-bold text-[#C9962A] mb-2">💌 종합 분석</p>
            <p className="text-sm text-[#C4B8D8] leading-relaxed relative z-10">{result.summary}</p>
          </div>

          <PointsClaimButton featureKey="gunghab" label="궁합 확인 💕" />
          <button
            onClick={() => { if (blockGuestRetry()) return; setStep('form'); window.scrollTo(0, 0) }}
            className="w-full py-3.5 bg-[#231844] text-[#C4B8D8] font-semibold rounded-2xl text-sm hover:bg-[#2A1F4A] transition active:scale-[0.98]"
          >
            다시 조회하기
          </button>
        </div>
      )}

      <div className="text-center pb-8 text-xs text-[#4A4060]">궁합 — 참고용 · 사주 기반 분석</div>
    </div>
  )
}
