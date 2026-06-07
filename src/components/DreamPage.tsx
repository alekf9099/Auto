import { useState } from 'react'
import { DREAM_CATEGORIES } from '../utils/dreamData'
import type { DreamSymbol, DreamCategory } from '../utils/dreamData'

interface Props {
  onBack: () => void
}

const LUCK_CFG = {
  great:   { label: '대길몽', color: '#C9962A', bg: '#C9962A18', border: '#C9962A45' },
  good:    { label: '길몽',   color: '#4BBF7E', bg: '#4BBF7E18', border: '#4BBF7E45' },
  neutral: { label: '평몽',   color: '#8B8FA8', bg: '#8B8FA818', border: '#8B8FA845' },
  caution: { label: '주의',   color: '#E05252', bg: '#E0525218', border: '#E0525245' },
}

const OHAENG_KO: Record<string, string> = {
  wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)',
}

const DETAIL_SECTIONS = [
  { key: 'wealth',  label: '재물운',      bar: '#C9962A' },
  { key: 'love',    label: '애정운',      bar: '#E05282' },
  { key: 'career',  label: '직업/사업운', bar: '#4BBF7E' },
  { key: 'health',  label: '건강운',      bar: '#52B4E0' },
] as const

export default function DreamPage({ onBack }: Props) {
  const [step, setStep]                       = useState<1 | 2 | 3>(1)
  const [selectedCat, setSelectedCat]         = useState<DreamCategory | null>(null)
  const [selectedSym, setSelectedSym]         = useState<DreamSymbol | null>(null)

  function handleCatSelect(cat: DreamCategory) {
    setSelectedCat(cat); setStep(2); window.scrollTo(0, 0)
  }

  function handleSymSelect(sym: DreamSymbol) {
    setSelectedSym(sym); setStep(3); window.scrollTo(0, 0)
  }

  function handleBack() {
    if (step === 3) { setStep(2); window.scrollTo(0, 0) }
    else if (step === 2) { setStep(1); window.scrollTo(0, 0) }
    else onBack()
  }

  const luck = selectedSym ? LUCK_CFG[selectedSym.luck] : null

  return (
    <div className="min-h-screen bg-[#0D0A1A]">

      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-[#0D0A1A]/95 backdrop-blur-md border-b border-[#C9962A30]">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3 flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#231844] transition text-[#C4B8D8] text-lg flex-shrink-0"
          >
            ←
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-[#F5EDD4] leading-tight" style={{ fontFamily: "'Noto Serif KR', serif" }}>
              꿈해몽 (夢解夢)
            </h1>
            <p className="text-xs text-[#7B6F9A] truncate">
              {step === 1
                ? '꿈의 주제를 선택하세요'
                : step === 2
                  ? `${selectedCat?.name} — 꿈 속 대상 선택`
                  : '꿈 해몽 결과'}
            </p>
          </div>
          {/* Step dots */}
          <div className="flex gap-1 flex-shrink-0">
            {([1, 2, 3] as const).map(s => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? 'w-5 bg-[#C9962A]' : s < step ? 'w-3 bg-[#C9962A60]' : 'w-3 bg-[#2A1F4A]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">

        {/* ── STEP 1: Category ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-5 border border-[#C9962A25] shadow-xl shadow-[#000]/40">
              <p className="text-violet-300/70 text-xs mb-1">전통 꿈 풀이</p>
              <h2 className="text-xl font-bold text-[#F5EDD4] mb-2" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                오늘 꿈에 무엇이 나왔나요?
              </h2>
              <p className="text-sm text-[#A89BC0] leading-relaxed">
                꿈의 주제를 선택하면 재물·애정·직업·건강 운세와 함께 상세한 전통 해몽을 알려드립니다.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {DREAM_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCatSelect(cat)}
                  className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] p-4 text-left hover:border-[#C9962A50] active:scale-[0.97] transition-all"
                >
                  <div className="text-3xl mb-2">{cat.emoji}</div>
                  <p className="text-sm font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                    {cat.name}
                  </p>
                  <p className="text-xs text-[#7B6F9A] mt-0.5">{cat.desc}</p>
                  <p className="text-xs text-[#C9962A] mt-2 font-medium">{cat.symbols.length}가지 →</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: Symbol ── */}
        {step === 2 && selectedCat && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-5 border border-[#C9962A25] shadow-xl shadow-[#000]/40">
              <span className="text-4xl">{selectedCat.emoji}</span>
              <h2 className="text-xl font-bold text-[#F5EDD4] mt-2 mb-1" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                {selectedCat.name}
              </h2>
              <p className="text-sm text-[#A89BC0]">꿈에 나온 대상을 선택하세요</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {selectedCat.symbols.map(sym => {
                const lc = LUCK_CFG[sym.luck]
                return (
                  <button
                    key={sym.id}
                    onClick={() => handleSymSelect(sym)}
                    className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] p-4 text-left hover:border-[#C9962A50] active:scale-[0.97] transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-3xl">{sym.emoji}</span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ color: lc.color, backgroundColor: lc.bg, border: `1px solid ${lc.border}` }}
                      >
                        {lc.label}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                      {sym.name}
                    </p>
                    <p className="text-xs text-[#7B6F9A] mt-0.5 line-clamp-2">{sym.shortDesc}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── STEP 3: Result ── */}
        {step === 3 && selectedSym && luck && (
          <div className="space-y-4">

            {/* Hero */}
            <div
              className="rounded-3xl p-6 border shadow-xl shadow-[#000]/40"
              style={{ background: 'linear-gradient(135deg, #1A0E30 0%, #100820 60%, #060410 100%)', borderColor: luck.border }}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-6xl leading-none">{selectedSym.emoji}</span>
                <span
                  className="text-sm font-bold px-3 py-1.5 rounded-full"
                  style={{ color: luck.color, backgroundColor: luck.bg, border: `1px solid ${luck.border}` }}
                >
                  {luck.label}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-[#F5EDD4] mb-1" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                {selectedSym.name} 꿈
              </h2>
              <p className="text-xs text-[#7B6F9A] mb-3">{selectedSym.shortDesc}</p>

              <div className="flex gap-2 flex-wrap mb-4">
                <span className="text-xs bg-[#C9962A15] text-[#E8B84B] border border-[#C9962A30] px-2.5 py-1 rounded-full">
                  {OHAENG_KO[selectedSym.ohaeng]} 기운
                </span>
                <span className="text-xs bg-violet-400/15 text-violet-300 border border-violet-400/25 px-2.5 py-1 rounded-full">
                  {selectedCat?.name}
                </span>
              </div>

              {/* 핵심 해몽 callout */}
              <div className="flex gap-2 items-start bg-[#C9962A0D] border border-[#C9962A30] rounded-2xl px-4 py-3 mb-1">
                <span className="text-sm flex-shrink-0">💬</span>
                <div>
                  <p className="text-[10px] text-[#C9962A] font-bold mb-0.5">전통 해몽 핵심</p>
                  <p className="text-sm text-[#E8B84B] font-medium leading-relaxed">
                    {selectedSym.general.split('.')[0]}.
                  </p>
                </div>
              </div>

              {/* General */}
              <div className="rounded-2xl p-4" style={{ backgroundColor: luck.bg, border: `1px solid ${luck.border}` }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 rounded-full" style={{ backgroundColor: luck.color }}/>
                  <p className="text-xs font-bold" style={{ color: luck.color }}>총운 해몽</p>
                </div>
                <p className="text-sm text-[#C4B8D8] leading-relaxed">{selectedSym.general}</p>
              </div>
            </div>

            {/* Detail sections */}
            {DETAIL_SECTIONS.map(sec => (
              <div key={sec.key} className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 rounded-full" style={{ backgroundColor: sec.bar }}/>
                  <h3 className="text-sm font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                    {sec.label}
                  </h3>
                </div>
                <p className="text-sm text-[#C4B8D8] leading-relaxed">{(selectedSym as unknown as Record<string, string>)[sec.key]}</p>
              </div>
            ))}

            {/* Advice */}
            <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-5 border border-[#C9962A25] shadow-xl shadow-[#000]/40">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-[#C9962A] rounded-full"/>
                <h3 className="text-sm font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                  오늘의 행동 지침
                </h3>
              </div>
              <p className="text-sm text-[#C4B8D8] leading-relaxed">{selectedSym.advice}</p>
            </div>

            {/* Restart CTA */}
            <button
              onClick={() => { setStep(1); setSelectedCat(null); setSelectedSym(null); window.scrollTo(0, 0) }}
              className="w-full py-3.5 bg-gradient-to-r from-[#C9962A] to-[#E8B84B] text-[#0D0A1A] font-bold rounded-2xl shadow-lg hover:from-[#B8871F] hover:to-[#D4A030] transition-all active:scale-[0.99]"
            >
              다른 꿈 해몽하기 →
            </button>

          </div>
        )}

        <p className="text-center text-xs text-[#4A4060] pb-6 pt-4">
          꿈해몽 — 전통 해몽 사전 기반 · 참고용으로만 활용하세요
        </p>
      </div>
    </div>
  )
}
