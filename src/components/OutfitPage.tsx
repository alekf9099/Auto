import { useState } from 'react'
import { blockGuestRetry } from '../utils/guestGate'
import type { BirthInput } from '../types'
import { calculateSaju } from '../utils/saju'
import { getElement, OUTFIT_DATA } from '../utils/outfitData'
import type { ColorSwatch, OutfitRecommendation } from '../utils/outfitData'
import PointsClaimButton from './PointsClaimButton'
import { IcOutfit } from './icons/SajuIcons'

interface Props {
  savedBirth: BirthInput | null
  onSave?: (b: BirthInput) => void
  onBack: () => void
}

const ITEM_LABELS: { key: keyof OutfitRecommendation['items']; label: string; emoji: string }[] = [
  { key: 'top',         label: '상의',   emoji: '👕' },
  { key: 'bottom',      label: '하의',   emoji: '👖' },
  { key: 'outer',       label: '아우터', emoji: '🧥' },
  { key: 'shoes',       label: '신발',   emoji: '👟' },
  { key: 'accessories', label: '악세서리', emoji: '💍' },
]

function computeResult(b: BirthInput) {
  const sajuResult = calculateSaju(b)
  const myElement  = getElement(sajuResult.dayPillar.stemIndex)
  const myData     = OUTFIT_DATA[myElement]

  const today = new Date()
  const todaySaju = calculateSaju({
    year: today.getFullYear(), month: today.getMonth() + 1,
    day: today.getDate(), hour: 12, minute: null, gender: 'male',
  })
  const todayElement = getElement(todaySaju.dayPillar.stemIndex)
  const todayData    = OUTFIT_DATA[todayElement]

  return { myData, myElement, todayElement, todayData }
}

export default function OutfitPage({ savedBirth, onSave, onBack }: Props) {
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
  const [selectedColor, setSelectedColor] = useState<ColorSwatch | null>(null)

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
    <div className="min-h-screen">

      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-[#0D0A1A]/95 backdrop-blur-md border-b border-[#C9962A30]">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3 flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="뒤로 가기"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#231844] transition text-[#C4B8D8] text-lg flex-shrink-0"
          >
            ←
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-[#F5EDD4] leading-tight" style={{ fontFamily: "'Gowun Batang', serif" }}>
              오늘의 코디
            </h1>
            <p className="text-xs text-[#A79CC2] truncate">
              {step === 'form' ? '사주 기반 스타일 추천' : step === 'loading' ? '코디 분석 중...' : '코디 추천 결과'}
            </p>
          </div>
          <span className="text-[10px] text-[#E05282] bg-[#E0528215] border border-[#E0528230] px-2 py-1 rounded-full flex-shrink-0 font-semibold">
            AI 스타일링
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">

        {/* ── FORM ── */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-5 border border-[#E0528225] shadow-xl shadow-[#000]/40">
              <p className="text-pink-300/70 text-xs mb-1">사주 오행 기반</p>
              <h2 className="text-xl font-bold text-[#F5EDD4] mb-2" style={{ fontFamily: "'Gowun Batang', serif" }}>
                오늘 뭐 입을까요?
              </h2>
              <p className="text-sm text-[#BCB1D4] leading-relaxed">
                생년월일로 사주 일간(日干)의 오행을 분석해 당신에게 어울리는 오늘의 코디를 추천해 드립니다.
              </p>
            </div>

            <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] p-5 space-y-4">

              {/* Gender */}
              <div>
                <p className="text-xs text-[#A79CC2] mb-2 font-semibold">성별</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['male','female'] as const).map(g => (
                    <button
                      key={g} type="button"
                      onClick={() => setBirth(b => ({ ...b, gender: g }))}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        birth.gender === g
                          ? 'bg-[#E0528220] border-[#E05282] text-[#F5EDD4]'
                          : 'bg-[#1C1438] border-[#2A1F4A] text-[#A79CC2] hover:border-[#E0528250]'
                      }`}
                    >
                      {g === 'male' ? '남성 🧑' : '여성 👩'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div>
                <p className="text-xs text-[#A79CC2] mb-2 font-semibold">생년월일</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['year','month','day'] as const).map(f => (
                    <input
                      key={f}
                      type="number"
                      value={birth[f]}
                      onChange={e => setBirth(b => ({ ...b, [f]: e.target.value }))}
                      placeholder={f === 'year' ? '년도' : f === 'month' ? '월' : '일'}
                      className="bg-[#1C1438] border border-[#2A1F4A] rounded-xl px-3 py-2.5 text-sm text-[#F5EDD4] placeholder:text-[#857AA0] focus:outline-none focus:border-[#E05282] transition text-center"
                    />
                  ))}
                </div>
              </div>

              {/* Hour & Minute */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-[#A79CC2] mb-2 font-semibold">태어난 시간 <span className="text-[#857AA0] font-normal">(선택)</span></p>
                  <input
                    type="number"
                    value={birth.hour}
                    onChange={e => setBirth(b => ({ ...b, hour: e.target.value }))}
                    placeholder="0~23시"
                    min={0} max={23}
                    className="w-full bg-[#1C1438] border border-[#2A1F4A] rounded-xl px-3 py-2.5 text-sm text-[#F5EDD4] placeholder:text-[#857AA0] focus:outline-none focus:border-[#E05282] transition text-center"
                  />
                </div>
                <div>
                  <p className="text-xs text-[#A79CC2] mb-2 font-semibold">분 <span className="text-[#857AA0] font-normal">(선택)</span></p>
                  <input
                    type="number"
                    value={birth.minute}
                    onChange={e => setBirth(b => ({ ...b, minute: e.target.value }))}
                    placeholder="0~59분"
                    min={0} max={59}
                    disabled={birth.hour === ''}
                    className="w-full bg-[#1C1438] border border-[#2A1F4A] rounded-xl px-3 py-2.5 text-sm text-[#F5EDD4] placeholder:text-[#857AA0] focus:outline-none focus:border-[#E05282] transition text-center disabled:opacity-40"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-3.5 bg-gradient-to-r from-[#C9507A] to-[#E05282] text-white font-bold rounded-2xl shadow-lg hover:from-[#B8406A] hover:to-[#CE4272] transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              👗 오늘의 코디 보기
            </button>

            <div className="flex items-center gap-2 justify-center">
              <div className="h-px flex-1 bg-[#2A1F4A]"/>
              <p className="text-[10px] text-[#857AA0]">사주팔자 일간 오행 기반</p>
              <div className="h-px flex-1 bg-[#2A1F4A]"/>
            </div>
          </form>
        )}

        {/* ── LOADING ── */}
        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-2 border-[#E0528220] animate-ping"/>
              <div className="absolute inset-2 rounded-full border-2 border-[#E0528240] animate-ping" style={{ animationDelay: '0.3s' }}/>
              <div className="absolute inset-4 rounded-full border-2 border-[#E0528260] animate-ping" style={{ animationDelay: '0.6s' }}/>
              <div className="absolute inset-0 flex items-center justify-center"><IcOutfit size={32} className="text-[#E05282]"/></div>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-[#F5EDD4] mb-1" style={{ fontFamily: "'Gowun Batang', serif" }}>
                코디 분석 중...
              </p>
              <p className="text-sm text-[#A79CC2]">사주 오행을 분석해 스타일을 추천합니다</p>
            </div>
          </div>
        )}

        {/* ── RESULT ── */}
        {step === 'result' && result && (
          <div className="space-y-4 animate-fade-in-up">

            {/* Hero */}
            <div className="rounded-3xl p-6 border shadow-xl shadow-[#000]/40"
              style={{ background: 'linear-gradient(135deg, #1A0E30 0%, #100820 60%, #060410 100%)', borderColor: 'rgba(224,82,130,0.35)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-5xl leading-none">{result.todayData.elementEmoji}</span>
                <span className="text-sm font-bold px-3 py-1.5 rounded-full bg-[#E0528218] border border-[#E0528240] text-[#E05282]">
                  {result.todayData.elementChi} · {result.todayData.element}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-[#F5EDD4] mb-1" style={{ fontFamily: "'Gowun Batang', serif" }}>
                오늘의 코디 추천
              </h2>
              <p className="text-xs text-[#A79CC2] mb-4">{result.todayData.mood}</p>

              {/* Color palette */}
              <div className="mb-4">
                <p className="text-[10px] text-[#E05282] font-bold mb-2">추천 컬러 팔레트</p>
                <div className="flex gap-2 flex-wrap mb-3">
                  {result.todayData.mainColors.map(c => {
                    const active = (selectedColor ?? result.todayData.mainColors.find(m => m.main) ?? result.todayData.mainColors[0]).hex === c.hex
                    return (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        className="flex flex-col items-center gap-1"
                      >
                        <div className="relative">
                          <div
                            className={`rounded-xl shadow-md transition-transform hover:scale-110 ${c.main ? 'w-12 h-12' : 'w-9 h-9'} ${active ? 'ring-2 ring-[#E05282] ring-offset-2 ring-offset-[#1A0E30] scale-110' : 'ring-1 ring-white/10'}`}
                            style={{ backgroundColor: c.hex }}
                          />
                          {c.main && (
                            <span className="absolute -top-1.5 -right-1.5 text-[10px] bg-[#E05282] text-white rounded-full w-4 h-4 flex items-center justify-center shadow">⭐</span>
                          )}
                        </div>
                        <p className={`text-[9px] text-center max-w-[48px] leading-tight ${active ? 'text-[#F5EDD4] font-semibold' : 'text-[#A79CC2]'}`}>{c.name}</p>
                      </button>
                    )
                  })}
                </div>

                {/* Selected color preview */}
                {(() => {
                  const shown = selectedColor ?? result.todayData.mainColors.find(m => m.main) ?? result.todayData.mainColors[0]
                  return (
                    <div className="flex items-center gap-3 bg-[#0000002A] border border-[#FFFFFF14] rounded-2xl px-4 py-3">
                      <div className="w-14 h-14 rounded-2xl shadow-lg flex-shrink-0 ring-1 ring-white/20" style={{ backgroundColor: shown.hex }}/>
                      <div>
                        <p className="text-sm font-bold text-[#F5EDD4]">{shown.name}</p>
                        <p className="text-xs text-[#A79CC2] uppercase">{shown.hex}</p>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* My element */}
              <div className="flex gap-2 items-start bg-[#E052820D] border border-[#E0528230] rounded-2xl px-4 py-3">
                <span className="text-sm flex-shrink-0">💡</span>
                <div>
                  <p className="text-[10px] text-[#E05282] font-bold mb-0.5">나의 사주 오행</p>
                  <p className="text-sm text-[#C4B8D8] leading-relaxed">
                    당신의 일간은 <span className="text-[#F5EDD4] font-bold">{result.myData.elementChi}({result.myData.element})</span> 기운이에요.
                    {' '}{result.myData.mainColors[0].name} 계열의 아이템을 함께 코디하면 더욱 좋아요.
                  </p>
                </div>
              </div>
            </div>

            {/* Outfit items */}
            <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 rounded-full bg-[#E05282]"/>
                <h3 className="text-sm font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>
                  추천 아이템
                </h3>
              </div>
              <div className="space-y-3">
                {ITEM_LABELS.map(({ key, label, emoji }) => (
                  <div key={key}>
                    <p className="text-[10px] text-[#A79CC2] font-semibold mb-1.5">{emoji} {label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.todayData.items[key].map((item, i) => (
                        <span
                          key={item}
                          className={i === 0
                            ? "text-xs font-bold bg-[#E0528220] border border-[#E05282] text-[#F5EDD4] pl-2.5 pr-3 py-1 rounded-full inline-flex items-center gap-1"
                            : "text-xs bg-[#1C1438] border border-[#2A1F4A] text-[#C4B8D8] px-3 py-1 rounded-full"}
                        >
                          {i === 0 && <span className="text-[10px]">⭐</span>}
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Style keywords */}
            <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 rounded-full bg-[#4BBF7E]"/>
                <h3 className="text-sm font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>
                  스타일 키워드
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.todayData.keywords.map(kw => (
                  <span
                    key={kw}
                    className="text-xs font-semibold bg-[#4BBF7E15] border border-[#4BBF7E35] text-[#4BBF7E] px-3 py-1.5 rounded-full"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Avoid colors */}
            <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-[#E05252] rounded-full"/>
                <h3 className="text-sm font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>
                  피하면 좋은 색상
                </h3>
              </div>
              <div className="flex gap-3">
                {result.todayData.avoidColors.map(c => (
                  <div key={c.hex} className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded-lg flex-shrink-0" style={{ backgroundColor: c.hex }}>
                      <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold drop-shadow">✕</span>
                    </div>
                    <p className="text-xs text-[#A79CC2]">{c.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Styling tip */}
            <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-5 border border-[#C9962A25] shadow-xl shadow-[#000]/40">
              <div className="flex gap-2 items-start bg-[#C9962A0D] border border-[#C9962A30] rounded-2xl px-4 py-3">
                <span className="text-sm flex-shrink-0">💬</span>
                <div>
                  <p className="text-[10px] text-[#C9962A] font-bold mb-0.5">스타일링 팁</p>
                  <p className="text-sm text-[#C4B8D8] leading-relaxed">{result.todayData.tip}</p>
                </div>
              </div>
            </div>

            {/* 포인트 받기 */}
            <PointsClaimButton featureKey="outfit" label="오늘의 코디 확인 👗" />

            {/* Restart CTA */}
            <button
              onClick={() => { if (blockGuestRetry()) return; setStep('form'); setSubmitted(null); setSelectedColor(null); window.scrollTo(0, 0) }}
              className="w-full py-3.5 bg-gradient-to-r from-[#C9507A] to-[#E05282] text-white font-bold rounded-2xl shadow-lg hover:from-[#B8406A] hover:to-[#CE4272] transition-all active:scale-[0.99]"
            >
              다시 분석하기 →
            </button>
          </div>
        )}

        <p className="text-center text-xs text-[#857AA0] pb-6 pt-4">
          오늘의 코디 — 사주팔자 오행 기반 스타일 추천 · 참고용으로 활용하세요
        </p>
      </div>
    </div>
  )
}
