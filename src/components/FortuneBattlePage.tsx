import { useState, useEffect } from 'react'
import type { BirthInput } from '../types'
import { calculateSaju, getSipsin } from '../utils/saju'
import { DAY_FORTUNE } from '../utils/fortuneData'
import PointsClaimButton from './PointsClaimButton'
import ShareCardModal from './ShareCardModal'
import { IcBattle, IcCrown, IcDraw, IcShare, IcProfile } from './icons/SajuIcons'

interface Props {
  savedBirth?: BirthInput | null
  onSave?: (b: BirthInput) => void
  onBack: () => void
}

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

function calcSide(birth: BirthInput) {
  const result = calculateSaju(birth)
  const dayIdx = result.dayPillar.stemIndex
  const t = new Date()
  const todayResult = calculateSaju({
    year: t.getFullYear(), month: t.getMonth() + 1, day: t.getDate(),
    hour: 12, minute: null, gender: 'male',
  })
  const sipsin = getSipsin(dayIdx, todayResult.dayPillar.stemIndex) ?? '비견'
  const fortune = DAY_FORTUNE[sipsin] ?? DAY_FORTUNE['비견']
  return { sipsin, fortune }
}

type SideResult = ReturnType<typeof calcSide>

function PersonForm({
  title, fields, onChange, accent,
}: {
  title: string
  fields: BirthFields; onChange: (f: BirthFields) => void
  accent: 'violet' | 'rose'
}) {
  const set = (k: keyof BirthFields, v: string | boolean) => onChange({ ...fields, [k]: v })
  const focusCls = accent === 'rose'
    ? 'focus:border-rose-400 focus:ring-2 focus:ring-rose-900/20'
    : 'focus:border-[#9A6A12] focus:ring-2 focus:ring-[#9A6A1220]'
  const unknownCls = accent === 'rose'
    ? 'bg-rose-900/30 text-rose-300'
    : 'bg-[#9A6A1220] text-[#9A6A12]'
  const accentLine = accent === 'rose' ? 'bg-rose-400' : 'bg-[#9A6A12]'

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-1 h-4 ${accentLine} rounded-full`} />
        <IcProfile size={16} className={accent === 'rose' ? 'text-rose-400' : 'text-violet-400'} />
        <p className="text-sm font-bold text-[#3B2A16]">{title}</p>
      </div>
      <div className="space-y-2.5">
        <div className="grid grid-cols-3 gap-2">
          {([
            { k: 'year'  as const, label: '출생년도', ph: '1990', min: 1900, max: 2010 },
            { k: 'month' as const, label: '월',       ph: '1',    min: 1,    max: 12   },
            { k: 'day'   as const, label: '일',       ph: '1',    min: 1,    max: 31   },
          ]).map(f => (
            <div key={f.k}>
              <label className="block text-[11px] font-semibold text-[#6E5836] mb-1">{f.label}</label>
              <input
                type="number" required placeholder={f.ph} min={f.min} max={f.max}
                value={fields[f.k]}
                onChange={e => set(f.k, e.target.value)}
                className={`w-full bg-[#E9DAB8] border border-[#D8C290] rounded-xl px-1 py-2.5 text-sm text-[#3B2A16] placeholder:text-[#A89167] focus:outline-none transition text-center ${focusCls}`}
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-[#6E5836]">시간</label>
              <button
                type="button"
                onClick={() => set('hourUnknown', !fields.hourUnknown)}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition ${fields.hourUnknown ? unknownCls : 'bg-[#E3D0A4] text-[#9A8155]'}`}
              >
                {fields.hourUnknown ? '모름 ✓' : '모름'}
              </button>
            </div>
            <input
              type="number" placeholder="0~23" min={0} max={23}
              disabled={fields.hourUnknown}
              value={fields.hourUnknown ? '' : fields.hour}
              onChange={e => set('hour', e.target.value)}
              className={`w-full bg-[#E9DAB8] border border-[#D8C290] rounded-xl px-1 py-2.5 text-sm text-[#3B2A16] placeholder:text-[#A89167] focus:outline-none transition text-center disabled:opacity-40 ${focusCls}`}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#6E5836] mb-1">분 (선택)</label>
            <input
              type="number" placeholder="0~59" min={0} max={59}
              disabled={fields.hourUnknown}
              value={fields.hourUnknown ? '' : fields.minute}
              onChange={e => set('minute', e.target.value)}
              className={`w-full bg-[#E9DAB8] border border-[#D8C290] rounded-xl px-1 py-2.5 text-sm text-[#3B2A16] placeholder:text-[#A89167] focus:outline-none transition text-center disabled:opacity-40 ${focusCls}`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ResultCard({
  name, initial, side, accent, isWinner, isTie,
}: {
  name: string; initial: string; side: SideResult
  accent: 'violet' | 'rose'; isWinner: boolean; isTie: boolean
}) {
  const pct = side.fortune.star * 20
  const ring = accent === 'rose' ? 'border-rose-400/40' : 'border-violet-400/40'
  const badgeBg = accent === 'rose' ? 'bg-rose-400' : 'bg-violet-500'
  return (
    <div
      className={`relative rounded-3xl p-4 border transition-all ${
        isWinner ? 'border-[#9A6A12] shadow-[0_0_20px_rgba(201,150,42,0.25)]' : `${ring} opacity-90`
      }`}
      style={{ background: 'linear-gradient(160deg, #FBF4E2 0%, #F3E7C8 60%, #EAD9B0 100%)' }}
    >
      {isWinner && !isTie && (
        <span className="absolute -top-2.5 -right-1.5 rotate-12 text-[#9A6A12]">
          <IcCrown size={20} />
        </span>
      )}
      <div className="flex items-center gap-1.5 mb-3">
        <div className={`w-5 h-5 rounded-full ${badgeBg} flex items-center justify-center text-[10px] text-white font-bold shrink-0`}>{initial}</div>
        <span className="text-xs font-semibold text-[#5C4A2E] truncate">{name}</span>
      </div>
      <p className="text-3xl font-bold text-white leading-none tabular-nums mb-0.5">{pct}<span className="text-sm text-[#6E5836]">점</span></p>
      <p className="text-[11px] mb-2" style={{ color: side.fortune.color }}>{side.sipsin}</p>
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={`text-xs ${i < side.fortune.star ? 'text-[#9A6A12]' : 'text-[#D8C290]'}`}>★</span>
        ))}
      </div>
      <p className="text-[11px] text-[#6E5836] leading-relaxed">{side.fortune.총평.split('.')[0]}.</p>
    </div>
  )
}

export default function FortuneBattlePage({ savedBirth, onSave, onBack }: Props) {
  const [step,     setStep]     = useState<'form' | 'loading' | 'result'>('form')
  const [me,       setMe]       = useState<BirthFields>(() => savedBirth ? fromSaved(savedBirth) : emptyFields())
  const [them,     setThem]     = useState<BirthFields>(emptyFields)
  const [themName, setThemName] = useState('')
  const [result,   setResult]   = useState<{ me: SideResult; them: SideResult } | null>(null)
  const [showShare, setShowShare] = useState(false)

  useEffect(() => {
    if (step !== 'loading') return
    const t = setTimeout(() => { setStep('result'); window.scrollTo(0, 0) }, 1800)
    return () => clearTimeout(t)
  }, [step])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const meBirth = toBirth(me)
    const themBirth = toBirth(them)
    onSave?.(meBirth)
    setResult({ me: calcSide(meBirth), them: calcSide(themBirth) })
    setStep('loading')
    window.scrollTo(0, 0)
  }

  const nameLabel = themName.trim() || '상대방'
  const nameInit  = nameLabel[0] ?? '?'

  const winner: 'me' | 'them' | 'tie' = !result ? 'tie'
    : result.me.fortune.star === result.them.fortune.star ? 'tie'
    : result.me.fortune.star > result.them.fortune.star ? 'me' : 'them'

  return (
    <div className="min-h-screen">
      <div className="bg-[#FBF4E2] border-b border-[#D8C290] sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} aria-label="뒤로 가기" className="text-[#9A8155] hover:text-[#5C4A2E] transition text-lg">←</button>
          <div>
            <h1 className="text-base font-bold text-[#3B2A16]" style={{ fontFamily: "'Gowun Batang', serif" }}>운세대결</h1>
            <p className="text-xs text-[#9A8155]">오늘 누구 운세가 더 좋을까?</p>
          </div>
        </div>
      </div>

      {/* ── FORM ── */}
      {step === 'form' && (
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
          <div className="bg-gradient-to-br from-[#FBF4E2] via-[#F3E7C8] to-[#EAD9B0] rounded-3xl p-6 shadow-xl shadow-[#000]/40 border border-[#9A6A1225] relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-rose-500/15 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-violet-400/15 blur-2xl" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="flex-1">
                <p className="text-[#9A8155] text-xs mb-2">오늘의 사주 운세 점수 대결</p>
                <p className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Gowun Batang', serif" }}>
                  운세대결
                </p>
                <p className="text-sm text-[#9A8155]/80 leading-relaxed">친구와 운세를 비교해서<br />오늘 누가 더 운이 좋은지 확인하세요</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-[#9A6A1220] border border-[#9A6A1240] flex items-center justify-center shrink-0">
                <IcBattle size={30} className="text-[#9A6A12]" />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="bg-[#FBF4E2] rounded-3xl border border-[#9A6A1230] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-5">
              <PersonForm title="나" fields={me} onChange={setMe} accent="violet" />
            </div>

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

            <div className="bg-[#FBF4E2] rounded-3xl border border-rose-900/40 shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#6E5836] mb-1.5">
                  상대방 이름 <span className="text-[#A89167] font-normal">(선택)</span>
                </label>
                <input
                  type="text"
                  placeholder="상대방 이름을 입력하세요"
                  value={themName}
                  onChange={e => setThemName(e.target.value)}
                  className="w-full bg-[#E9DAB8] border border-rose-900/40 rounded-xl px-3 py-2.5 text-sm text-[#3B2A16] placeholder:text-[#A89167] focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-900/20 transition"
                />
              </div>
              <PersonForm title="상대방" fields={them} onChange={setThem} accent="rose" />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-[#9A6A12] to-[#B5841C] text-[#0D0A1A] font-bold rounded-2xl shadow-lg shadow-[#9A6A1230] transition-all text-sm active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <IcBattle size={16} />
              {nameLabel}과 운세대결 시작하기 →
            </button>
          </form>
        </div>
      )}

      {/* ── LOADING ── */}
      {step === 'loading' && (
        <div className="flex flex-col items-center justify-center min-h-[72vh] gap-8 px-4">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-[#9A6A1220] animate-ping"/>
            <div className="absolute inset-2 rounded-full border-2 border-[#9A6A1240] animate-ping" style={{ animationDelay: '0.3s' }}/>
            <IcBattle size={36} className="text-[#9A6A12]"/>
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-[#3B2A16] mb-1">운세를 대결시키는 중</p>
            <p className="text-sm text-[#9A8155]">나와 {nameLabel}의 오늘 운세를 비교하고 있어요</p>
            <div className="flex justify-center gap-1.5 mt-4">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#9A6A12] animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── RESULT ── */}
      {step === 'result' && result && (
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-4 animate-fade-in-up">

          <div
            className={`rounded-3xl p-4 text-center border ${
              winner === 'tie' ? 'bg-[#E3D0A4] border-[#D8C290]' : 'bg-[#9A6A1215] border-[#9A6A1230]'
            }`}
          >
            <p className="text-base font-bold flex items-center justify-center gap-1.5" style={{ fontFamily: "'Gowun Batang', serif", color: winner === 'tie' ? '#3B2A16' : '#9A6A12' }}>
              {winner === 'tie' ? <IcDraw size={18} /> : <IcCrown size={18} />}
              {winner === 'tie'
                ? '오늘은 무승부예요!'
                : winner === 'me'
                  ? '오늘은 내 운세가 더 좋아요!'
                  : `오늘은 ${nameLabel}의 운세가 더 좋아요!`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ResultCard name="나" initial="나" side={result.me} accent="violet" isWinner={winner === 'me'} isTie={winner === 'tie'} />
            <ResultCard name={nameLabel} initial={nameInit} side={result.them} accent="rose" isWinner={winner === 'them'} isTie={winner === 'tie'} />
          </div>

          <button
            onClick={() => setShowShare(true)}
            className="w-full py-3.5 bg-[#E3D0A4] text-[#4A3820] font-semibold rounded-2xl text-sm hover:bg-[#D8C290] transition active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            <IcShare size={16} />
            대결 결과 공유하기
          </button>
          <PointsClaimButton featureKey="battle" label="운세대결 확인" />
          <button
            onClick={() => { setStep('form'); window.scrollTo(0, 0) }}
            className="w-full py-3.5 bg-[#E3D0A4] text-[#5C4A2E] font-semibold rounded-2xl text-sm hover:bg-[#D8C290] transition active:scale-[0.98]"
          >
            다시 대결하기
          </button>
        </div>
      )}

      {step === 'result' && result && showShare && (
        <ShareCardModal
          onClose={() => setShowShare(false)}
          data={{
            badge: '운세대결',
            emoji: winner === 'tie' ? '🤝' : '🏆',
            title: winner === 'tie' ? '오늘은 무승부!' : winner === 'me' ? '내가 이겼다!' : `${nameLabel}이 이겼다!`,
            date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }),
            highlight: `나 ${result.me.fortune.star * 20}점 vs ${nameLabel} ${result.them.fortune.star * 20}점`,
            items: [
              { label: '나의 십성', value: result.me.sipsin },
              { label: '나의 점수', value: `${result.me.fortune.star * 20}점` },
              { label: `${nameLabel}의 십성`, value: result.them.sipsin },
              { label: `${nameLabel}의 점수`, value: `${result.them.fortune.star * 20}점` },
            ],
            accent: winner === 'tie' ? '#6E5836' : winner === 'me' ? '#9A6A12' : '#F43F5E',
            footer: '운명봄 · AI 사주 운세',
          }}
        />
      )}

      <div className="text-center pb-8 text-xs text-[#A89167]">운세대결 — 참고용 · 사주 기반 분석</div>
    </div>
  )
}
