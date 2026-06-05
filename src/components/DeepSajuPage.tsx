import { useState, useEffect } from 'react'
import type { BirthInput } from '../types'
import { calcDeepSaju, isDeepFreeUsed, markDeepFreeUsed } from '../utils/deepSaju'

interface Props {
  savedBirth: BirthInput | null
  onBack: () => void
}

const ELEM_COLOR: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  '목(木)': { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0', glow: '#059669' },
  '화(火)': { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA', glow: '#EA580C' },
  '토(土)': { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A', glow: '#D97706' },
  '금(金)': { bg: '#F8FAFC', text: '#475569', border: '#CBD5E1', glow: '#64748B' },
  '수(水)': { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE', glow: '#2563EB' },
}

const LOCKED_SECTIONS = [
  { icon: '💰', label: '재물운',       sub: '재물 흐름과 투자 성향' },
  { icon: '💼', label: '직업/직장운',   sub: '적합 직군과 커리어 방향' },
  { icon: '💖', label: '애정운',       sub: '연애·결혼 성향과 파트너십' },
  { icon: '🌿', label: '건강운',       sub: '취약 부위와 건강 관리법' },
  { icon: '📅', label: '2026년 운세',  sub: '병오년 개인 운세 흐름' },
  { icon: '🌀', label: '용신(用神) 분석', sub: '나에게 필요한 오행과 에너지' },
  { icon: '🤝', label: '귀인(貴人) 분석', sub: '나를 도와주는 사람의 유형' },
  { icon: '🌐', label: '대인관계',     sub: '인간관계 패턴과 소통 방식' },
  { icon: '🍀', label: '행운 키워드',  sub: '색상·방향·숫자·계절' },
  { icon: '📜', label: '총평',         sub: '일생 흐름과 핵심 메시지' },
  { icon: '✨', label: '조언',         sub: '당신을 위한 한마디' },
]

export default function DeepSajuPage({ savedBirth, onBack }: Props) {
  const [unlocked, setUnlocked] = useState(false)

  const data       = savedBirth ? calcDeepSaju(savedBirth) : null
  const content    = data?.content
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
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-stone-100 transition text-stone-500 text-lg"
          >
            ←
          </button>
          <h1 className="text-base font-bold text-stone-800" style={{ fontFamily: "'Noto Serif KR', serif" }}>심층 사주 해석</h1>
          {!unlocked && (
            <span className="ml-auto text-[10px] bg-violet-50 text-violet-600 border border-violet-200 px-2.5 py-1 rounded-full font-semibold">11개 섹션</span>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* 일간 히어로 배너 */}
        <div className="bg-gradient-to-br from-[#1E1152] via-[#2D1B69] to-[#160F3E] rounded-3xl p-6 shadow-xl shadow-violet-900/20 relative overflow-hidden">
          <div
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[120px] font-bold opacity-[0.06] select-none pointer-events-none leading-none"
            style={{ fontFamily: "'Noto Serif KR', serif" }}
          >
            {content.stemHanja}
          </div>
          <p className="text-violet-300/60 text-xs mb-3">일간(日干) · 타고난 본질의 기운</p>
          <div className="flex items-end gap-4 mb-4">
            <span className="text-6xl font-bold text-white" style={{ fontFamily: "'Noto Serif KR', serif" }}>
              {content.stemHanja}
            </span>
            <div>
              <p className="text-2xl font-bold text-white leading-tight">{content.stemName}일간</p>
              <p className="text-violet-300/70 text-sm mt-0.5">{content.element} · {content.yinYang}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full border"
              style={{ background: elemStyle.bg + '30', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
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

        {/* ── 무료 섹션 1: 성향 분석 ── */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_16px_rgba(124,58,237,0.07)] p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🧠</span>
            <p className="text-sm font-bold text-stone-800">성향 분석</p>
            <span className="ml-auto text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">무료</span>
          </div>
          <p className="text-sm font-semibold text-stone-700 mb-2">{content.personality}</p>
          <p className="text-sm text-stone-500 leading-relaxed">{content.personalityDetail}</p>
        </div>

        {/* ── 무료 섹션 2: 오행 분포 ── */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_16px_rgba(124,58,237,0.07)] p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">⚖️</span>
            <p className="text-sm font-bold text-stone-800">오행 분포 분석</p>
            <span className="ml-auto text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">무료</span>
          </div>
          <div className="flex gap-2 mb-3">
            {ohaengLines.split(' · ').map((item, i) => {
              const parts = item.split(' ')
              const name = parts.slice(0, -1).join(' ')
              const pctStr = parts[parts.length - 1]
              const val = parseInt(pctStr)
              const colors = ['#22C55E', '#F97316', '#EAB308', '#94A3B8', '#3B82F6']
              return (
                <div key={i} className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-stone-400">{name}</span>
                    <span className="text-[10px] font-bold" style={{ color: colors[i] }}>{pctStr}</span>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${val}%`, background: colors[i] }} />
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-sm text-stone-500 leading-relaxed">{ohaengVerdict}</p>
        </div>

        {/* ── 유료 잠금 구역 ── */}
        {!unlocked ? (
          <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_16px_rgba(124,58,237,0.07)] overflow-hidden">

            {/* 재물운 미리보기 (30%) */}
            <div className="p-5 pb-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💰</span>
                <p className="text-sm font-bold text-stone-800">재물운</p>
                <span className="ml-auto text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">미리보기</span>
              </div>
              <div className="relative mb-4">
                <p className="text-sm text-stone-500 leading-relaxed line-clamp-2">{content.wealth}</p>
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
              </div>
            </div>

            {/* 잠금 월 */}
            <div className="bg-gradient-to-b from-stone-50 to-violet-50/30 border-t border-stone-100 px-5 pt-5 pb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">🔒</span>
                <p className="text-sm font-bold text-stone-800">아래 {LOCKED_SECTIONS.length}개 섹션이 잠겨 있습니다</p>
              </div>
              <p className="text-xs text-stone-400 mb-4 ml-6">잠금 해제 후 영구 열람 가능</p>

              <div className="space-y-2 mb-5">
                {LOCKED_SECTIONS.map(sec => (
                  <div key={sec.label} className="flex items-center gap-3 bg-white/70 border border-stone-100 rounded-2xl px-3.5 py-2.5">
                    <span className="text-base shrink-0">{sec.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-stone-700">{sec.label}</p>
                      <p className="text-[10px] text-stone-400">{sec.sub}</p>
                    </div>
                    <span className="text-stone-300 text-sm shrink-0">🔒</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setUnlocked(true)}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-violet-200 hover:from-violet-500 hover:to-purple-500 transition-all text-sm active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span className="text-base">✨</span>
                <span>1코인으로 전체 잠금 해제</span>
              </button>
              <p className="text-center text-[11px] text-stone-300 mt-2.5">1회 결제 · 동일 계정 영구 열람</p>
            </div>
          </div>
        ) : (
          <>
            {/* 재물운 */}
            <SectionCard icon="💰" title="재물운" content={content.wealth} accent={elemStyle} />
            {/* 직업/직장운 */}
            <SectionCard icon="💼" title="직업/직장운" content={content.career} accent={elemStyle} />
            {/* 애정운 */}
            <SectionCard icon="💖" title="애정운" content={content.love} accent={elemStyle} />
            {/* 건강운 */}
            <SectionCard icon="🌿" title="건강운" content={content.health} accent={elemStyle} />
            {/* 2026년 운세 */}
            <SectionCard icon="📅" title="2026년 운세" content={content.year2026} accent={elemStyle} highlight />
            {/* 용신 분석 */}
            <SectionCard icon="🌀" title="용신(用神) 분석" content={content.yongshin} accent={elemStyle} />
            {/* 귀인 분석 */}
            <SectionCard icon="🤝" title="귀인(貴人) 분석" content={content.guardian} accent={elemStyle} />
            {/* 대인관계 */}
            <SectionCard icon="🌐" title="대인관계" content={content.relationship} accent={elemStyle} />
            {/* 행운 키워드 */}
            <LuckyCard content={content.lucky} elemStyle={elemStyle} />
            {/* 총평 */}
            <SectionCard icon="📜" title="총평" content={content.overall} accent={elemStyle} highlight />
            {/* 조언 */}
            <AdviceCard content={content.advice} />
          </>
        )}

        {/* 첫 무료 안내 */}
        {!isFreeUsed && unlocked && (
          <div className="bg-violet-50 border border-violet-100 rounded-2xl px-4 py-3 text-center">
            <p className="text-xs text-violet-600 font-semibold">🎉 첫 심층 해석은 무료로 제공됩니다!</p>
            <p className="text-[11px] text-violet-400 mt-0.5">다음 방문부터는 1코인이 필요합니다</p>
          </div>
        )}

      </div>

      <div className="text-center pb-8 text-xs text-stone-300">사주팔자 — 양력 기준 · 절기 근사값 적용</div>
    </div>
  )
}

function SectionCard({
  icon, title, content, highlight = false,
}: {
  icon: string
  title: string
  content: string
  accent?: { bg: string; text: string; border: string; glow: string }
  highlight?: boolean
}) {
  return (
    <div className={`bg-white rounded-3xl border shadow-[0_2px_16px_rgba(124,58,237,0.07)] p-5 ${
      highlight ? 'border-violet-100' : 'border-stone-100'
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <p className="text-sm font-bold text-stone-800">{title}</p>
        {highlight && (
          <span className="ml-auto text-[10px] bg-violet-50 text-violet-600 border border-violet-200 px-2 py-0.5 rounded-full font-semibold">핵심</span>
        )}
      </div>
      <p className="text-sm text-stone-500 leading-relaxed">{content}</p>
    </div>
  )
}

function LuckyCard({
  content,
  elemStyle,
}: {
  content: string
  elemStyle: { bg: string; text: string; border: string; glow: string }
}) {
  const lines = content.split('\n').filter(Boolean)
  return (
    <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_16px_rgba(124,58,237,0.07)] p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🍀</span>
        <p className="text-sm font-bold text-stone-800">행운 키워드</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {lines.map((line, i) => {
          const [label, ...rest] = line.split(': ')
          const value = rest.join(': ')
          const isPrimary = i < 2
          return (
            <div
              key={i}
              className={`rounded-2xl px-3.5 py-3 border ${isPrimary ? '' : 'bg-stone-50 border-stone-100'}`}
              style={isPrimary ? { background: elemStyle.bg, borderColor: elemStyle.border } : {}}
            >
              <p className="text-[10px] text-stone-400 mb-0.5">{label}</p>
              <p
                className="text-xs font-bold"
                style={isPrimary ? { color: elemStyle.text } : { color: '#44403C' }}
              >
                {value}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AdviceCard({ content }: { content: string }) {
  return (
    <div className="bg-gradient-to-br from-[#1E1152] via-[#2D1B69] to-[#160F3E] rounded-3xl p-5 shadow-xl shadow-violet-900/20">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">✨</span>
        <p className="text-sm font-bold text-violet-200">당신을 위한 조언</p>
      </div>
      <p className="text-sm text-violet-100/90 leading-relaxed font-medium" style={{ fontFamily: "'Noto Serif KR', serif" }}>
        "{content}"
      </p>
    </div>
  )
}
