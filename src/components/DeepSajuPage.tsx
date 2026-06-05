import { useState, useEffect } from 'react'
import type { BirthInput } from '../types'
import { calcDeepSaju, isDeepFreeUsed, markDeepFreeUsed } from '../utils/deepSaju'
import type { DeepContent } from '../utils/deepSaju'

interface Props {
  savedBirth: BirthInput | null
  onBack: () => void
}

interface Section {
  key: keyof DeepContent
  label: string
  icon: string
}

const SECTIONS: Section[] = [
  { key: 'wealth',   label: '재물운',        icon: '💰' },
  { key: 'career',   label: '직업/직장운',    icon: '💼' },
  { key: 'love',     label: '애정운',        icon: '💖' },
  { key: 'health',   label: '건강운',        icon: '🌿' },
  { key: 'year2026', label: '2026년 운세',   icon: '📅' },
  { key: 'advice',   label: '조언',          icon: '✨' },
]

const LOCKED_LABELS = ['직업/직장운', '애정운', '건강운', '2026년 운세', '조언']

const ELEM_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  '목(木)': { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
  '화(火)': { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA' },
  '토(土)': { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  '금(金)': { bg: '#F8FAFC', text: '#475569', border: '#CBD5E1' },
  '수(水)': { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
}

export default function DeepSajuPage({ savedBirth, onBack }: Props) {
  const [unlocked, setUnlocked] = useState(false)

  const data = savedBirth ? calcDeepSaju(savedBirth) : null
  const content = data?.content
  const ohaengText = data?.ohaengText ?? ''

  const isFreeUsed = isDeepFreeUsed()

  useEffect(() => {
    if (!isFreeUsed) {
      markDeepFreeUsed()
      setUnlocked(true)
    }
  }, [])

  const elemStyle = content ? (ELEM_COLOR[content.element] ?? ELEM_COLOR['목(木)']) : ELEM_COLOR['목(木)']

  const [ohaengLines, ohaengVerdict] = ohaengText.split('\n\n')

  if (!content || !savedBirth) {
    return (
      <div className="min-h-screen bg-[#F4F2FF] flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-500 mb-4">생년월일 정보가 없습니다.</p>
          <button onClick={onBack} className="text-violet-600 font-semibold">← 홈으로</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F2FF]">

      {/* 상단 바 */}
      <div className="bg-white border-b border-stone-100 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-stone-100 transition text-stone-500">
            ←
          </button>
          <h1 className="text-base font-bold text-stone-800" style={{ fontFamily: "'Noto Serif KR', serif" }}>심층 사주 해석</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* 일간 히어로 배너 */}
        <div className="bg-gradient-to-br from-[#1E1152] via-[#2D1B69] to-[#160F3E] rounded-3xl p-6 shadow-xl shadow-violet-900/20 relative overflow-hidden">
          <div className="absolute right-4 top-4 text-8xl opacity-[0.07] select-none pointer-events-none" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            {content.stemHanja}
          </div>
          <p className="text-violet-300/60 text-xs mb-3">일간(日干) · 타고난 본질</p>
          <div className="flex items-end gap-3 mb-4">
            <span className="text-5xl font-bold text-white" style={{ fontFamily: "'Noto Serif KR', serif" }}>
              {content.stemHanja}
            </span>
            <div>
              <p className="text-2xl font-bold text-white">{content.stemName}일간</p>
              <p className="text-violet-300/70 text-sm">{content.element} · {content.yinYang}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full border"
              style={{ background: elemStyle.bg + '22', color: elemStyle.text, borderColor: elemStyle.border + '44' }}
            >
              {content.element}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 border border-white/20 text-violet-200">
              {content.yinYang}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-violet-500/30 border border-violet-400/30 text-violet-200">
              {savedBirth.year}.{String(savedBirth.month).padStart(2,'0')}.{String(savedBirth.day).padStart(2,'0')}
            </span>
          </div>
        </div>

        {/* 성향 분석 (항상 노출) */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_16px_rgba(124,58,237,0.07)] p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🧠</span>
            <p className="text-sm font-bold text-stone-800">성향 분석</p>
          </div>
          <p className="text-sm font-semibold text-stone-700 mb-2">{content.personality}</p>
          <p className="text-sm text-stone-500 leading-relaxed">{content.personalityDetail}</p>
        </div>

        {/* 오행 분석 (항상 노출) */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_16px_rgba(124,58,237,0.07)] p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">⚖️</span>
            <p className="text-sm font-bold text-stone-800">오행 분포 분석</p>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {ohaengLines.split(' · ').map((item, i) => {
              const [name, pct] = item.split(' ')
              const val = parseInt(pct)
              const colors = ['#22C55E', '#F97316', '#EAB308', '#94A3B8', '#3B82F6']
              return (
                <div key={i} className="flex-1 min-w-[60px]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-stone-400">{name}</span>
                    <span className="text-[10px] font-bold" style={{ color: colors[i] }}>{pct}</span>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${val}%`, background: colors[i] }} />
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-sm text-stone-500 leading-relaxed">{ohaengVerdict}</p>
        </div>

        {/* 재물운 — 잠금 시 30% 미리보기 */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_16px_rgba(124,58,237,0.07)] overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">💰</span>
              <p className="text-sm font-bold text-stone-800">재물운</p>
              {!unlocked && !isFreeUsed && (
                <span className="ml-auto text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">미리보기</span>
              )}
            </div>
            <div className="relative">
              <p className={`text-sm text-stone-500 leading-relaxed ${!unlocked ? 'line-clamp-2' : ''}`}>
                {content.wealth}
              </p>
              {!unlocked && (
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
              )}
            </div>
          </div>

          {/* 잠금 월 */}
          {!unlocked && (
            <div className="border-t border-stone-100 bg-stone-50/80 px-5 py-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">🔒</span>
                <p className="text-sm font-bold text-stone-700">전체 해석 잠금</p>
              </div>
              <div className="space-y-2 mb-4">
                {LOCKED_LABELS.map(label => (
                  <div key={label} className="flex items-center gap-2 text-sm text-stone-400">
                    <span className="w-4 h-4 rounded-full border-2 border-stone-200 flex items-center justify-center shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                    </span>
                    {label}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setUnlocked(true)}
                className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-violet-200 hover:from-violet-500 hover:to-purple-500 transition-all text-sm active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span>✨</span>
                <span>50코인으로 전체 해석 잠금 해제</span>
              </button>
              <p className="text-center text-[11px] text-stone-300 mt-2">잠금 해제 후 영구적으로 열람 가능</p>
            </div>
          )}
        </div>

        {/* 잠금 해제 후 나머지 섹션들 */}
        {unlocked && SECTIONS.slice(1).map(sec => (
          <div key={sec.key} className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_16px_rgba(124,58,237,0.07)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{sec.icon}</span>
              <p className="text-sm font-bold text-stone-800">{sec.label}</p>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed">{content[sec.key] as string}</p>
          </div>
        ))}

        {/* 첫 무료 안내 */}
        {!isFreeUsed && unlocked && (
          <div className="bg-violet-50 border border-violet-100 rounded-2xl px-4 py-3 text-center">
            <p className="text-xs text-violet-600 font-semibold">🎉 첫 심층 해석은 무료로 제공됩니다!</p>
            <p className="text-[11px] text-violet-400 mt-0.5">다음 방문부터는 코인이 필요합니다</p>
          </div>
        )}

      </div>

      <div className="text-center pb-8 text-xs text-stone-300">사주팔자 — 양력 기준 · 절기 근사값 적용</div>
    </div>
  )
}
