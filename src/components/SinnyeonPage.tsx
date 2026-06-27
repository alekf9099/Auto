import { useState } from 'react'
import { blockGuestRetry } from '../utils/guestGate'
import type { BirthInput } from '../types'
import { calculateSaju, getSipsin } from '../utils/saju'
import { STEMS, BRANCHES, ELEMENT_COLORS } from '../utils/constants'
import { YEARLY_FORTUNE, MONTHLY_FORTUNE } from '../utils/fortuneData'
import PointsClaimButton from './PointsClaimButton'
import { IcSinnyeon, IcWealthLuck, IcLoveLuck, IcHealthLuck, IcCareerLuck, IcSparkleKeyword } from './icons/SajuIcons'

interface Props {
  savedBirth?: BirthInput | null
  onSave?: (b: BirthInput) => void
  onBack: () => void
}

// 올해 연도를 동적으로 계산 (입춘 이후인 3월 1일 기준으로 사주 연도 확정)
const CURR_YEAR = new Date().getFullYear()
const _currYearPillar = calculateSaju({ year: CURR_YEAR, month: 3, day: 1, hour: 12, minute: null, gender: 'male' }).yearPillar
const CURR_YEAR_STEM_IDX   = _currYearPillar.stemIndex
const CURR_YEAR_BRANCH_IDX = _currYearPillar.branchIndex

const MONTH_STEMS_CURR = Array.from({ length: 12 }, (_, i) =>
  calculateSaju({ year: CURR_YEAR, month: i + 1, day: 15, hour: 12, minute: null, gender: 'male' }).monthPillar.stemIndex
)

function Stars({ n }: { n: number }) {
  return (
    <span className="text-amber-400">{'★'.repeat(n)}<span className="text-stone-200">{'★'.repeat(5 - n)}</span></span>
  )
}

function MonthlySection({ dayStemIdx }: { dayStemIdx: number }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 bg-[#C9962A] rounded-full" />
        <h2 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>월별 운세 흐름</h2>
        <span className="text-xs text-[#A79CC2] ml-1">사주 기반 · {CURR_YEAR}년</span>
      </div>
      <div className="space-y-2">
        {MONTH_STEMS_CURR.map((stemIdx, i) => {
          const sipsin  = getSipsin(dayStemIdx, stemIdx) ?? '비견'
          const data    = MONTHLY_FORTUNE[sipsin] ?? MONTHLY_FORTUNE['비견']
          const monthStem = STEMS[stemIdx]
          const isOpen  = open === i
          return (
            <div key={i} className="border border-[#2A1F4A] rounded-2xl overflow-hidden">
              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#1C1438] transition"
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span className="text-xs font-bold text-[#A79CC2] w-6 shrink-0">{i + 1}월</span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                  style={{ color: ELEMENT_COLORS[monthStem.element], backgroundColor: ELEMENT_COLORS[monthStem.element] + '18' }}
                >
                  {sipsin}
                </span>
                <span className="flex-1 text-xs text-[#A79CC2] truncate">{data.조언.slice(0, 20)}…</span>
                <Stars n={data.star} />
                <span className="text-[#857AA0] text-xs ml-1">{isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4">
                  <div className="h-px bg-[#2A1F4A] mb-3" />
                  <p className="text-xs font-semibold text-[#C9962A] mb-1.5 flex items-center gap-1.5"><IcSparkleKeyword size={13} /> {i + 1}월 조언</p>
                  <p className="text-sm text-[#BCB1D4] leading-relaxed mb-3">{data.조언}</p>
                  <p className="text-sm text-[#BCB1D4] leading-relaxed">{data.총평}</p>
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
  return { dayStemIdx: idx, sipsin: getSipsin(idx, CURR_YEAR_STEM_IDX) ?? '비견' }
}

export default function SinnyeonPage({ savedBirth, onSave, onBack }: Props) {
  const init = savedBirth ? calcSinnyeon(savedBirth) : null

  const [step, setStep]   = useState<'form' | 'loading' | 'result'>('form')
  const [birth, setBirth] = useState({
    year:  savedBirth ? String(savedBirth.year)  : '',
    month: savedBirth ? String(savedBirth.month) : '',
    day:   savedBirth ? String(savedBirth.day)   : '',
    hour:  savedBirth?.hour != null ? String(savedBirth.hour) : '',
    minute: savedBirth?.minute != null ? String(savedBirth.minute) : '',
  })
  const [sipsin, setSipsin]       = useState<string>(init?.sipsin ?? '')
  const [dayStemIdx, setDayStemIdx] = useState(init?.dayStemIdx ?? 0)

  const yearStem   = STEMS[CURR_YEAR_STEM_IDX]
  const yearBranch = BRANCHES[CURR_YEAR_BRANCH_IDX]

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
    const r = calcSinnyeon(inp)
    setDayStemIdx(r.dayStemIdx)
    setSipsin(r.sipsin)
    setStep('loading')
    window.scrollTo(0, 0)
    setTimeout(() => { setStep('result'); window.scrollTo(0, 0) }, 2500)
  }

  const fortune  = YEARLY_FORTUNE[sipsin] ?? YEARLY_FORTUNE['비견']
  const dayStem  = STEMS[dayStemIdx]
  const yc       = ELEMENT_COLORS[yearStem.element]

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <div className="bg-[#130E24] border-b border-[#2A1F4A] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} aria-label="뒤로 가기" className="text-[#A79CC2] hover:text-[#C4B8D8] transition text-lg">←</button>
          <div>
            <h1 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>{CURR_YEAR} 신년운세</h1>
            <p className="text-xs text-[#A79CC2]">{yearStem.ko}{yearBranch.ko}년({yearStem.hanja}{yearBranch.hanja}) 한 해 운세</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {step === 'form' && (
          <>
            {/* 배너 */}
            <div className="rounded-3xl overflow-hidden border border-[#C9962A25]" style={{ background: 'linear-gradient(135deg, #0D1A16 0%, #0A1520 100%)' }}>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl font-bold" style={{ color: yc }}>{yearStem.hanja}</span>
                  <span className="text-2xl font-bold" style={{ color: yc }}>{yearBranch.hanja}</span>
                  <span className="text-sm text-[#BCB1D4] ml-1">{yearStem.ko}{yearBranch.ko}년 · {yearBranch.animal}띠의 해</span>
                </div>
                <p className="text-2xl font-bold text-[#F5EDD4] mb-1" style={{ fontFamily: "'Gowun Batang', serif" }}>
                  {CURR_YEAR} 신년운세
                </p>
                <p className="text-sm text-[#BCB1D4]">생년월일을 입력하면 나만의 {CURR_YEAR} 한 해 운세를 알려드립니다</p>
              </div>
            </div>

            {/* 폼 */}
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
                      <label className="block text-xs font-semibold text-[#BCB1D4] mb-1.5">{f.label}</label>
                      <input
                        type="number" required placeholder={f.placeholder}
                        min={f.min} max={f.max}
                        value={birth[f.name as keyof typeof birth]}
                        onChange={e => setBirth(p => ({ ...p, [f.name]: e.target.value }))}
                        className="w-full bg-[#1C1438] border border-[#2A1F4A] rounded-2xl px-3 py-3 text-sm text-[#F5EDD4] placeholder:text-[#857AA0] focus:outline-none focus:border-[#C9962A] focus:ring-2 focus:ring-[#C9962A20] transition text-center"
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#BCB1D4] mb-1.5">출생 시간 <span className="text-[#857AA0] font-normal">(선택, 0~23시)</span></label>
                    <input
                      type="number" placeholder="예: 14"
                      min={0} max={23}
                      value={birth.hour}
                      onChange={e => setBirth(p => ({ ...p, hour: e.target.value }))}
                      className="w-full bg-[#1C1438] border border-[#2A1F4A] rounded-2xl px-3 py-3 text-sm text-[#F5EDD4] placeholder:text-[#857AA0] focus:outline-none focus:border-[#C9962A] focus:ring-2 focus:ring-[#C9962A20] transition text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#BCB1D4] mb-1.5">분 <span className="text-[#857AA0] font-normal">(선택, 0~59분)</span></label>
                    <input
                      type="number" placeholder="예: 30"
                      min={0} max={59}
                      disabled={birth.hour === ''}
                      value={birth.minute}
                      onChange={e => setBirth(p => ({ ...p, minute: e.target.value }))}
                      className="w-full bg-[#1C1438] border border-[#2A1F4A] rounded-2xl px-3 py-3 text-sm text-[#F5EDD4] placeholder:text-[#857AA0] focus:outline-none focus:border-[#C9962A] focus:ring-2 focus:ring-[#C9962A20] transition text-center disabled:opacity-40"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-[#C9962A] to-[#E8B84B] text-[#0D0A1A] font-bold rounded-2xl shadow-lg shadow-[#C9962A30] hover:from-[#B8871F] hover:to-[#D4A030] transition-all text-sm active:scale-[0.98]"
                >
                  {CURR_YEAR} 신년운세 확인하기 →
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
              <div className="absolute inset-0 flex items-center justify-center"><IcSinnyeon size={32} className="text-[#C9962A]"/></div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>신년운세 분석 중...</p>
              <p className="text-sm text-[#A79CC2]">{CURR_YEAR}년 운세를 풀이하고 있습니다</p>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className="space-y-4 animate-fade-in-up">
            {/* 결과 배너 */}
            <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-5 shadow-xl shadow-[#000]/40 border border-[#C9962A25]">
              <p className="text-violet-300/85 text-xs mb-2">{CURR_YEAR} {yearStem.ko}{yearBranch.ko}년({yearStem.hanja}{yearBranch.hanja}) 운세</p>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-bold text-white" style={{ fontFamily: "'Gowun Batang', serif" }}>
                  {dayStem?.hanja}일간
                </span>
                <span className="text-violet-300">×</span>
                <span className="text-3xl font-bold" style={{ color: yc }}>{yearStem.hanja}{yearBranch.hanja}</span>
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
            <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-[#C9962A] rounded-full" />
                <h2 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>{CURR_YEAR}년 총운</h2>
              </div>
              <p className="text-sm text-[#C4B8D8] leading-relaxed">{fortune.총평}</p>
            </div>

            {/* 분야별 운세 */}
            <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-[#C9962A] rounded-full" />
                <h2 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>분야별 운세</h2>
              </div>
              <div className="space-y-4">
                {[
                  { Icon: IcWealthLuck, accent: '#E8B84B', label: '재물운', text: fortune.재물 },
                  { Icon: IcLoveLuck,   accent: '#E86A8B', label: '애정운', text: fortune.애정 },
                  { Icon: IcHealthLuck, accent: '#5CC98F', label: '건강운', text: fortune.건강 },
                  { Icon: IcCareerLuck, accent: '#6AA8E8', label: '직업운', text: fortune.직업 },
                ].map(item => (
                  <div key={item.label} className="flex gap-3 bg-[#1C1438] border border-[#2A1F4A] rounded-2xl p-4">
                    <span className="shrink-0 mt-0.5" style={{ color: item.accent }}><item.Icon size={20} /></span>
                    <div>
                      <p className="text-xs font-bold text-[#BCB1D4] mb-1">{item.label}</p>
                      <p className="text-sm text-[#C4B8D8] leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 올해의 조언 */}
            <div className="bg-[#C9962A15] border border-[#C9962A30] rounded-3xl p-5">
              <p className="text-xs font-semibold text-[#C9962A] mb-2 flex items-center gap-1.5"><IcSparkleKeyword size={13} /> {CURR_YEAR}년 핵심 조언</p>
              <p className="text-sm text-[#C4B8D8] leading-relaxed">{fortune.조언}</p>
            </div>

            {/* 월별 운세 — 사주 십신 기반 */}
            <MonthlySection dayStemIdx={dayStemIdx} />

            <PointsClaimButton featureKey="sinnyeon" label="신년운세 확인 🗓️" />
            <button
              onClick={() => { if (blockGuestRetry()) return; setStep('form'); window.scrollTo(0, 0) }}
              className="w-full py-3.5 bg-[#231844] text-[#C4B8D8] font-semibold rounded-2xl text-sm hover:bg-[#2A1F4A] transition active:scale-[0.98]"
            >
              다시 조회하기
            </button>
          </div>
        )}
      </div>
      <div className="text-center pb-8 text-xs text-[#857AA0]">사주팔자 — 양력 기준 · 절기 근사값 적용</div>
    </div>
  )
}
