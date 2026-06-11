import { useState } from 'react'
import type { BirthInput } from '../types'
import { calculateSaju, getSipsin } from '../utils/saju'
import { getElement, JOB_DATA, JOB_LUCK_BY_SIPSIN, LUCK_GRADE_CFG } from '../utils/jobData'
import { loadPoints, tryFeatureBonus } from '../utils/points'
import PointsToast from './PointsToast'
import ShareCardModal from './ShareCardModal'
import { IcJob } from './icons/SajuIcons'

interface Props {
  savedBirth: BirthInput | null
  onSave?: (b: BirthInput) => void
  onBack: () => void
}

function computeResult(b: BirthInput) {
  const sajuResult  = calculateSaju(b)
  const dayStemIdx  = sajuResult.dayPillar.stemIndex
  const myElement   = getElement(dayStemIdx)
  const myData      = JOB_DATA[myElement]

  const currentYear = new Date().getFullYear()
  const currentDaun = sajuResult.daun.find(entry => {
    const ageYear = b.year + entry.age
    return ageYear <= currentYear && currentYear < ageYear + 10
  })
  const daunSipsin  = currentDaun ? (getSipsin(dayStemIdx, currentDaun.pillar.stemIndex) ?? '비견') : '비견'
  const overallLuck = JOB_LUCK_BY_SIPSIN[daunSipsin]

  const today = new Date()
  const todaySaju  = calculateSaju({
    year: today.getFullYear(), month: today.getMonth() + 1,
    day: today.getDate(), hour: 12, minute: null, gender: 'male',
  })
  const todaySipsin = getSipsin(dayStemIdx, todaySaju.dayPillar.stemIndex) ?? '비견'
  const todayLuck   = JOB_LUCK_BY_SIPSIN[todaySipsin]

  return { myData, myElement, overallLuck, daunSipsin, todayLuck, todaySipsin, daunRange: currentDaun ? `${currentDaun.age}~${currentDaun.age + 9}세` : '' }
}

export default function JobPage({ savedBirth, onSave, onBack }: Props) {
  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form')
  const [birth, setBirth] = useState({
    year:   savedBirth ? String(savedBirth.year)  : '',
    month:  savedBirth ? String(savedBirth.month) : '',
    day:    savedBirth ? String(savedBirth.day)   : '',
    hour:   savedBirth?.hour != null ? String(savedBirth.hour) : '',
    minute: savedBirth?.minute != null ? String(savedBirth.minute) : '',
    gender: (savedBirth?.gender ?? 'male') as 'male' | 'female',
  })
  const [submitted, setSubmitted] = useState<BirthInput | null>(null)
  const [showShare, setShowShare] = useState(false)
  const [toast, setToast] = useState<{ amount: number; total: number } | null>(null)

  function handlePointsClaim() {
    const { next, claimed } = tryFeatureBonus(loadPoints(), 'job', '취업운 확인 💼')
    if (claimed) setToast({ amount: 5, total: next.balance })
    else setToast({ amount: 0, total: loadPoints().balance })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const inp: BirthInput = {
      year: Number(birth.year), month: Number(birth.month),
      day: Number(birth.day),
      hour: birth.hour !== '' ? Number(birth.hour) : null,
      minute: birth.hour !== '' && birth.minute !== '' ? Number(birth.minute) : null,
      gender: birth.gender,
    }
    onSave?.(inp)
    setSubmitted(inp)
    setStep('loading')
    window.scrollTo(0, 0)
    setTimeout(() => { setStep('result'); window.scrollTo(0, 0) }, 2500)
  }

  const result = (() => {
    if (!submitted) return null
    try { return computeResult(submitted) }
    catch { return null }
  })()

  const canSubmit = birth.year && birth.month && birth.day

  return (
    <div className="min-h-screen bg-[#0D0A1A]">

      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-[#0D0A1A]/95 backdrop-blur-md border-b border-[#C9962A30]">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#231844] transition text-[#C4B8D8] text-lg flex-shrink-0"
          >
            ←
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-[#F5EDD4] leading-tight" style={{ fontFamily: "'Noto Serif KR', serif" }}>
              취업운
            </h1>
            <p className="text-xs text-[#7B6F9A] truncate">
              {step === 'form' ? '사주로 보는 커리어 운' : step === 'loading' ? '취업운 분석 중...' : '취업운 분석 결과'}
            </p>
          </div>
          <span className="text-[10px] text-[#4BBF7E] bg-[#4BBF7E15] border border-[#4BBF7E30] px-2 py-1 rounded-full flex-shrink-0 font-semibold">
            커리어 운세
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">

        {/* ── FORM ── */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-5 border border-[#4BBF7E25] shadow-xl shadow-[#000]/40">
              <p className="text-emerald-300/70 text-xs mb-1">사주 십성 기반</p>
              <h2 className="text-xl font-bold text-[#F5EDD4] mb-2" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                취업·이직 운이 궁금하다면?
              </h2>
              <p className="text-sm text-[#A89BC0] leading-relaxed">
                생년월일로 현재 대운의 십성을 분석해 취업운, 적성 직무, 면접 팁, 행운의 요일까지 알려드립니다.
              </p>
            </div>

            <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] p-5 space-y-4">

              {/* Gender */}
              <div>
                <p className="text-xs text-[#7B6F9A] mb-2 font-semibold">성별</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['male','female'] as const).map(g => (
                    <button
                      key={g} type="button"
                      onClick={() => setBirth(b => ({ ...b, gender: g }))}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        birth.gender === g
                          ? 'bg-[#4BBF7E20] border-[#4BBF7E] text-[#F5EDD4]'
                          : 'bg-[#1C1438] border-[#2A1F4A] text-[#7B6F9A] hover:border-[#4BBF7E50]'
                      }`}
                    >
                      {g === 'male' ? '남성 🧑' : '여성 👩'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div>
                <p className="text-xs text-[#7B6F9A] mb-2 font-semibold">생년월일</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['year','month','day'] as const).map(f => (
                    <input
                      key={f}
                      type="number"
                      value={birth[f]}
                      onChange={e => setBirth(b => ({ ...b, [f]: e.target.value }))}
                      placeholder={f === 'year' ? '년도' : f === 'month' ? '월' : '일'}
                      className="bg-[#1C1438] border border-[#2A1F4A] rounded-xl px-3 py-2.5 text-sm text-[#F5EDD4] placeholder:text-[#4A4060] focus:outline-none focus:border-[#4BBF7E] transition text-center"
                    />
                  ))}
                </div>
              </div>

              {/* Hour & Minute */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-[#7B6F9A] mb-2 font-semibold">태어난 시간 <span className="text-[#4A4060] font-normal">(선택)</span></p>
                  <input
                    type="number"
                    value={birth.hour}
                    onChange={e => setBirth(b => ({ ...b, hour: e.target.value }))}
                    placeholder="0~23시"
                    min={0} max={23}
                    className="w-full bg-[#1C1438] border border-[#2A1F4A] rounded-xl px-3 py-2.5 text-sm text-[#F5EDD4] placeholder:text-[#4A4060] focus:outline-none focus:border-[#4BBF7E] transition text-center"
                  />
                </div>
                <div>
                  <p className="text-xs text-[#7B6F9A] mb-2 font-semibold">분 <span className="text-[#4A4060] font-normal">(선택)</span></p>
                  <input
                    type="number"
                    value={birth.minute}
                    onChange={e => setBirth(b => ({ ...b, minute: e.target.value }))}
                    placeholder="0~59분"
                    min={0} max={59}
                    disabled={birth.hour === ''}
                    className="w-full bg-[#1C1438] border border-[#2A1F4A] rounded-xl px-3 py-2.5 text-sm text-[#F5EDD4] placeholder:text-[#4A4060] focus:outline-none focus:border-[#4BBF7E] transition text-center disabled:opacity-40"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-3.5 bg-gradient-to-r from-[#3FA86A] to-[#4BBF7E] text-[#0D0A1A] font-bold rounded-2xl shadow-lg hover:from-[#359A5E] hover:to-[#3FAE6E] transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              💼 취업운 확인하기
            </button>

            <div className="flex items-center gap-2 justify-center">
              <div className="h-px flex-1 bg-[#2A1F4A]"/>
              <p className="text-[10px] text-[#4A4060]">사주팔자 십성(十星) 기반 분석</p>
              <div className="h-px flex-1 bg-[#2A1F4A]"/>
            </div>
          </form>
        )}

        {/* ── LOADING ── */}
        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-2 border-[#4BBF7E20] animate-ping"/>
              <div className="absolute inset-2 rounded-full border-2 border-[#4BBF7E40] animate-ping" style={{ animationDelay: '0.3s' }}/>
              <div className="absolute inset-4 rounded-full border-2 border-[#4BBF7E60] animate-ping" style={{ animationDelay: '0.6s' }}/>
              <div className="absolute inset-0 flex items-center justify-center"><IcJob size={32} className="text-[#4BBF7E]"/></div>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-[#F5EDD4] mb-1" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                취업운 분석 중...
              </p>
              <p className="text-sm text-[#7B6F9A]">사주 십성을 분석해 커리어 운을 풀이합니다</p>
            </div>
          </div>
        )}

        {/* ── RESULT ── */}
        {step === 'result' && result && (
          <div className="space-y-4">

            {/* Hero — 종합 취업운 */}
            <div
              className="rounded-3xl p-6 border shadow-xl shadow-[#000]/40"
              style={{ background: 'linear-gradient(135deg, #1A0E30 0%, #100820 60%, #060410 100%)', borderColor: LUCK_GRADE_CFG[result.overallLuck.grade].border }}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-5xl leading-none">{LUCK_GRADE_CFG[result.overallLuck.grade].emoji}</span>
                <span
                  className="text-sm font-bold px-3 py-1.5 rounded-full"
                  style={{ color: LUCK_GRADE_CFG[result.overallLuck.grade].color, backgroundColor: LUCK_GRADE_CFG[result.overallLuck.grade].bg, border: `1px solid ${LUCK_GRADE_CFG[result.overallLuck.grade].border}` }}
                >
                  {result.overallLuck.label} · {result.daunSipsin}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-[#F5EDD4] mb-1" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                {result.overallLuck.title}
              </h2>
              <p className="text-xs text-[#7B6F9A] mb-3">현재 대운 ({result.daunRange}) 기준 분석</p>

              <div
                className="rounded-2xl p-4"
                style={{ backgroundColor: LUCK_GRADE_CFG[result.overallLuck.grade].bg, border: `1px solid ${LUCK_GRADE_CFG[result.overallLuck.grade].border}` }}
              >
                <p className="text-sm text-[#C4B8D8] leading-relaxed mb-2">{result.overallLuck.desc}</p>
                <div className="flex gap-2 items-start">
                  <span className="text-sm flex-shrink-0">💬</span>
                  <p className="text-sm font-medium" style={{ color: LUCK_GRADE_CFG[result.overallLuck.grade].color }}>{result.overallLuck.tip}</p>
                </div>
              </div>
            </div>

            {/* 오늘의 면접운 */}
            <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 rounded-full" style={{ backgroundColor: LUCK_GRADE_CFG[result.todayLuck.grade].color }}/>
                <h3 className="text-sm font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                  오늘의 면접 · 지원운
                </h3>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto"
                  style={{ color: LUCK_GRADE_CFG[result.todayLuck.grade].color, backgroundColor: LUCK_GRADE_CFG[result.todayLuck.grade].bg, border: `1px solid ${LUCK_GRADE_CFG[result.todayLuck.grade].border}` }}
                >
                  {result.todayLuck.label}
                </span>
              </div>
              <p className="text-sm font-bold text-[#F5EDD4] mb-1">{result.todayLuck.title}</p>
              <p className="text-sm text-[#C4B8D8] leading-relaxed">{result.todayLuck.desc}</p>
            </div>

            {/* 적성 직무 */}
            <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{result.myData.emoji}</span>
                <h3 className="text-sm font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                  {result.myData.elementChi}({result.myData.element}) 일간의 적성 직무
                </h3>
              </div>
              <p className="text-xs text-[#7B6F9A] mb-3">{result.myData.mood}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {result.myData.industries.map((item, i) => (
                  <span
                    key={item}
                    className={i === 0
                      ? "text-xs font-bold bg-[#4BBF7E20] border border-[#4BBF7E] text-[#F5EDD4] pl-2.5 pr-3 py-1 rounded-full inline-flex items-center gap-1"
                      : "text-xs bg-[#1C1438] border border-[#2A1F4A] text-[#C4B8D8] px-3 py-1 rounded-full"}
                  >
                    {i === 0 && <span className="text-[10px]">⭐</span>}
                    {item}
                  </span>
                ))}
              </div>
              <p className="text-sm text-[#C4B8D8] leading-relaxed mb-3">{result.myData.workStyle}</p>
              <div className="flex flex-wrap gap-2">
                {result.myData.strengths.map(kw => (
                  <span
                    key={kw}
                    className="text-xs font-semibold bg-[#4BBF7E15] border border-[#4BBF7E35] text-[#4BBF7E] px-3 py-1.5 rounded-full"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>

            {/* 행운의 요일 + 면접 팁 */}
            <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 rounded-full bg-[#C9962A]"/>
                <h3 className="text-sm font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                  행운의 요일
                </h3>
              </div>
              <div className="flex gap-2">
                {result.myData.luckyDays.map(day => (
                  <span key={day} className="text-sm font-bold bg-[#C9962A15] border border-[#C9962A35] text-[#C9962A] px-4 py-2 rounded-2xl">
                    {day}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-[#7B6F9A] mt-2">면접·지원서 제출은 이 요일을 활용해보세요.</p>
            </div>

            {/* 면접 팁 */}
            <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-5 border border-[#C9962A25] shadow-xl shadow-[#000]/40">
              <div className="flex gap-2 items-start bg-[#C9962A0D] border border-[#C9962A30] rounded-2xl px-4 py-3">
                <span className="text-sm flex-shrink-0">💡</span>
                <div>
                  <p className="text-[10px] text-[#C9962A] font-bold mb-0.5">면접 팁</p>
                  <p className="text-sm text-[#C4B8D8] leading-relaxed">{result.myData.interviewTip}</p>
                </div>
              </div>
            </div>

            {/* 주의사항 */}
            <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-[#E05252] rounded-full"/>
                <h3 className="text-sm font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                  주의할 점
                </h3>
              </div>
              <p className="text-sm text-[#C4B8D8] leading-relaxed">{result.myData.caution}</p>
            </div>

            {/* 포인트 받기 + 공유 + Restart CTA */}
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
              onClick={() => setShowShare(true)}
              className="w-full py-3.5 bg-[#231844] text-[#E8DFC8] font-semibold rounded-2xl text-sm hover:bg-[#2A1F4A] transition active:scale-[0.98]"
            >
              📤 취업운 카드 공유하기
            </button>
            <button
              onClick={() => { setStep('form'); setSubmitted(null); window.scrollTo(0, 0) }}
              className="w-full py-3.5 bg-gradient-to-r from-[#3FA86A] to-[#4BBF7E] text-[#0D0A1A] font-bold rounded-2xl shadow-lg hover:from-[#359A5E] hover:to-[#3FAE6E] transition-all active:scale-[0.99]"
            >
              다시 분석하기 →
            </button>
          </div>
        )}

        <p className="text-center text-xs text-[#4A4060] pb-6 pt-4">
          취업운 — 사주팔자 십성(十星) 기반 분석 · 참고용으로 활용하세요
        </p>
      </div>

      {showShare && result && (
        <ShareCardModal
          onClose={() => setShowShare(false)}
          data={{
            badge: '취업운',
            emoji: LUCK_GRADE_CFG[result.overallLuck.grade].emoji,
            title: result.overallLuck.title,
            date: `${result.myData.elementChi}(${result.myData.element}) 일간 · ${result.daunSipsin} 대운 (${result.daunRange})`,
            highlight: result.overallLuck.desc.split('.')[0] + '.',
            items: [
              { label: '오늘 면접운', value: result.todayLuck.label },
              { label: '추천 산업', value: result.myData.industries[0] },
              { label: '행운 요일', value: result.myData.luckyDays.join(', ') },
              { label: '핵심 강점', value: result.myData.strengths[0] },
            ],
            accent: LUCK_GRADE_CFG[result.overallLuck.grade].color,
            footer: '운명봄 · 십성 기반 취업운 분석',
          }}
        />
      )}
    </div>
  )
}
