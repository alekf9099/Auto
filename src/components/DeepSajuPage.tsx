import { useState } from 'react'
import type { BirthInput } from '../types'
import { calcDeepSaju, isDeepFreeUsed, markDeepFreeUsed } from '../utils/deepSaju'
import { loadPoints, tryFeatureBonus, spendPoints, DEEP_SAJU_UNLOCK_COST } from '../utils/points'
import PointsToast from './PointsToast'
import { IcDeepSaju } from './icons/SajuIcons'

interface Props {
  savedBirth: BirthInput | null
  onBack: () => void
  onSave?: (b: BirthInput) => void
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
  { icon: '📅', label: `${new Date().getFullYear()}년 운세`,  sub: '올해 개인 운세 흐름' },
  { icon: '🌀', label: '용신(用神) 분석', sub: '나에게 필요한 오행과 에너지' },
  { icon: '🤝', label: '귀인(貴人) 분석', sub: '나를 도와주는 사람의 유형' },
  { icon: '🌐', label: '대인관계',     sub: '인간관계 패턴과 소통 방식' },
  { icon: '🍀', label: '행운 키워드',  sub: '색상·방향·숫자·계절' },
  { icon: '📜', label: '총평',         sub: '일생 흐름과 핵심 메시지' },
  { icon: '✨', label: '조언',         sub: '당신을 위한 한마디' },
]

export default function DeepSajuPage({ savedBirth, onBack, onSave }: Props) {
  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form')
  const [unlocked, setUnlocked] = useState(false)
  const [wasFirstFree, setWasFirstFree] = useState(false)
  const [birth, setBirth] = useState({
    year:   savedBirth ? String(savedBirth.year)   : '',
    month:  savedBirth ? String(savedBirth.month)  : '',
    day:    savedBirth ? String(savedBirth.day)    : '',
    hour:   savedBirth?.hour != null ? String(savedBirth.hour) : '',
    minute: savedBirth?.minute != null ? String(savedBirth.minute) : '',
    gender: (savedBirth?.gender ?? 'male') as 'male' | 'female',
  })
  const [submitted, setSubmitted] = useState<BirthInput | null>(null)
  const [toast, setToast] = useState<{ amount: number; total: number } | null>(null)
  const [unlockError, setUnlockError] = useState(false)

  function handlePointsClaim() {
    const { next, claimed } = tryFeatureBonus(loadPoints(), 'deepsaju', '심층 사주 해석 🔮')
    if (claimed) setToast({ amount: 5, total: next.balance })
    else setToast({ amount: 0, total: loadPoints().balance })
  }

  function handleUnlock() {
    const { success } = spendPoints(loadPoints(), DEEP_SAJU_UNLOCK_COST, '심층 사주 전체 잠금 해제')
    if (success) setUnlocked(true)
    else setUnlockError(true)
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

    if (!isDeepFreeUsed()) {
      markDeepFreeUsed()
      setUnlocked(true)
      setWasFirstFree(true)
    }

    setStep('loading')
    window.scrollTo(0, 0)
    setTimeout(() => { setStep('result'); window.scrollTo(0, 0) }, 2500)
  }

  const data       = submitted ? calcDeepSaju(submitted) : null
  const content    = data?.content
  const ohaengText = data?.ohaengText ?? ''

  const elemStyle = content ? (ELEM_COLOR[content.element] ?? ELEM_COLOR['목(木)']) : ELEM_COLOR['목(木)']
  const [ohaengLines, ohaengVerdict] = ohaengText.split('\n\n')

  return (
    <div className="min-h-screen bg-[#0D0A1A]">
      {/* 상단 바 */}
      <div className="bg-[#130E24] border-b border-[#2A1F4A] sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#231844] transition text-[#C4B8D8] text-lg"
          >
            ←
          </button>
          <h1 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>심층 사주 해석</h1>
          {step !== 'result' && (
            <span className="ml-auto text-[10px] bg-[#C9962A15] text-[#C9962A] border border-[#C9962A30] px-2.5 py-1 rounded-full font-semibold">11개 섹션</span>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {step === 'form' && (
          <>
            <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-6 shadow-xl shadow-[#000]/40 border border-[#C9962A25]">
              <p className="text-violet-300/70 text-xs mb-2">사주팔자 심층 분석</p>
              <p className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                深層 解釋
              </p>
              <p className="text-sm text-violet-300/80 leading-relaxed">
                재물·직업·애정·건강·용신·귀인 등<br />11가지 심층 항목을 분석합니다.
              </p>
            </div>

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
                      <label className="block text-xs font-semibold text-[#A89BC0] mb-1.5">{f.label}</label>
                      <input
                        type="number" required placeholder={f.placeholder}
                        min={f.min} max={f.max}
                        value={birth[f.name as 'year' | 'month' | 'day']}
                        onChange={e => setBirth(p => ({ ...p, [f.name]: e.target.value }))}
                        className="w-full bg-[#1C1438] border border-[#2A1F4A] rounded-2xl px-3 py-3 text-sm text-[#F5EDD4] placeholder:text-[#4A4060] focus:outline-none focus:border-[#C9962A] focus:ring-2 focus:ring-[#C9962A20] transition text-center"
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#A89BC0] mb-1.5">출생 시간 <span className="text-[#4A4060] font-normal">(선택)</span></label>
                    <input
                      type="number" placeholder="0~23"
                      min={0} max={23}
                      value={birth.hour}
                      onChange={e => setBirth(p => ({ ...p, hour: e.target.value }))}
                      className="w-full bg-[#1C1438] border border-[#2A1F4A] rounded-2xl px-3 py-3 text-sm text-[#F5EDD4] placeholder:text-[#4A4060] focus:outline-none focus:border-[#C9962A] focus:ring-2 focus:ring-[#C9962A20] transition text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#A89BC0] mb-1.5">분 <span className="text-[#4A4060] font-normal">(선택)</span></label>
                    <input
                      type="number" placeholder="0~59"
                      min={0} max={59}
                      disabled={birth.hour === ''}
                      value={birth.minute}
                      onChange={e => setBirth(p => ({ ...p, minute: e.target.value }))}
                      className="w-full bg-[#1C1438] border border-[#2A1F4A] rounded-2xl px-3 py-3 text-sm text-[#F5EDD4] placeholder:text-[#4A4060] focus:outline-none focus:border-[#C9962A] focus:ring-2 focus:ring-[#C9962A20] transition text-center disabled:opacity-40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#A89BC0] mb-1.5">성별</label>
                    <div className="flex gap-2 h-[46px]">
                      {(['male', 'female'] as const).map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setBirth(p => ({ ...p, gender: g }))}
                          className={`flex-1 text-sm font-semibold rounded-2xl border transition ${
                            birth.gender === g
                              ? 'bg-[#C9962A] border-[#C9962A] text-[#0D0A1A]'
                              : 'bg-[#1C1438] border-[#2A1F4A] text-[#A89BC0]'
                          }`}
                        >
                          {g === 'male' ? '남성' : '여성'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-[#C9962A] to-[#E8B84B] text-[#0D0A1A] font-bold rounded-2xl shadow-lg shadow-[#C9962A30] hover:from-[#B8871F] hover:to-[#D4A030] transition-all text-sm active:scale-[0.98]"
                >
                  심층 해석 열기 →
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
              <div className="absolute inset-0 flex items-center justify-center"><IcDeepSaju size={32} className="text-[#C9962A]"/></div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>심층 분석 중...</p>
              <p className="text-sm text-[#7B6F9A]">사주팔자를 깊이 풀이하고 있습니다</p>
            </div>
          </div>
        )}

        {step === 'result' && submitted && content && (
          <>
            {/* 일간 히어로 배너 */}
            <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-6 shadow-xl shadow-[#000]/40 border border-[#C9962A25] relative overflow-hidden">
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
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#C9962A20] border border-[#C9962A40] text-[#E8B84B]">
                  {content.yinYang}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#C9962A15] border border-[#C9962A30] text-[#C9962A]">
                  {submitted.year}.{String(submitted.month).padStart(2,'0')}.{String(submitted.day).padStart(2,'0')}
                </span>
              </div>
            </div>

            {/* 무료 섹션 1: 성향 분석 */}
            <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🧠</span>
                <p className="text-sm font-bold text-[#F5EDD4]">성향 분석</p>
                <span className="ml-auto text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">무료</span>
              </div>
              <p className="text-sm font-semibold text-[#E8DFC8] mb-2">{content.personality}</p>
              <p className="text-sm text-[#A89BC0] leading-relaxed">{content.personalityDetail}</p>
            </div>

            {/* 무료 섹션 2: 오행 분포 */}
            <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">⚖️</span>
                <p className="text-sm font-bold text-[#F5EDD4]">오행 분포 분석</p>
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
                        <span className="text-[10px] text-[#7B6F9A]">{name}</span>
                        <span className="text-[10px] font-bold" style={{ color: colors[i] }}>{pctStr}</span>
                      </div>
                      <div className="h-1.5 bg-[#231844] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${val}%`, background: colors[i] }} />
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-sm text-[#A89BC0] leading-relaxed">{ohaengVerdict}</p>
            </div>

            {/* 유료 잠금 구역 */}
            {!unlocked ? (
              <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] overflow-hidden">
                <div className="p-5 pb-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">💰</span>
                    <p className="text-sm font-bold text-[#F5EDD4]">재물운</p>
                    <span className="ml-auto text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">미리보기</span>
                  </div>
                  <div className="relative mb-4">
                    <p className="text-sm text-[#A89BC0] leading-relaxed line-clamp-2">{content.wealth}</p>
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#130E24] to-transparent" />
                  </div>
                </div>

                <div className="bg-gradient-to-b from-[#1C1438] to-[#C9962A15] border-t border-[#2A1F4A] px-5 pt-5 pb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">🔒</span>
                    <p className="text-sm font-bold text-[#F5EDD4]">아래 {LOCKED_SECTIONS.length}개 섹션이 잠겨 있습니다</p>
                  </div>
                  <p className="text-xs text-[#7B6F9A] mb-4 ml-6">잠금 해제 후 영구 열람 가능</p>

                  <div className="space-y-2 mb-5">
                    {LOCKED_SECTIONS.map(sec => (
                      <div key={sec.label} className="flex items-center gap-3 bg-[#130E24]/70 border border-[#2A1F4A] rounded-2xl px-3.5 py-2.5">
                        <span className="text-base shrink-0">{sec.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#E8DFC8]">{sec.label}</p>
                          <p className="text-[10px] text-[#7B6F9A]">{sec.sub}</p>
                        </div>
                        <span className="text-[#3D3358] text-sm shrink-0">🔒</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleUnlock}
                    className="w-full py-4 bg-gradient-to-r from-[#C9962A] to-[#E8B84B] text-[#0D0A1A] font-bold rounded-2xl shadow-lg shadow-[#C9962A30] hover:from-[#B8871F] hover:to-[#D4A030] transition-all text-sm active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <span className="text-base">✨</span>
                    <span>{DEEP_SAJU_UNLOCK_COST}P로 전체 잠금 해제</span>
                  </button>
                  {unlockError && (
                    <p className="text-center text-[11px] text-[#F87171] mt-2.5">
                      포인트가 부족합니다 (보유 {loadPoints().balance}P / 필요 {DEEP_SAJU_UNLOCK_COST}P)
                    </p>
                  )}
                  <p className="text-center text-[11px] text-[#4A4060] mt-2.5">1회 사용 · 동일 계정 영구 열람</p>
                </div>
              </div>
            ) : (
              <>
                <SectionCard icon="💰" title="재물운" content={content.wealth} accent={elemStyle} />
                <SectionCard icon="💼" title="직업/직장운" content={content.career} accent={elemStyle} />
                <SectionCard icon="💖" title="애정운" content={content.love} accent={elemStyle} />
                <SectionCard icon="🌿" title="건강운" content={content.health} accent={elemStyle} />
                <SectionCard icon="📅" title={`${new Date().getFullYear()}년 운세`} content={content.yearFortune} accent={elemStyle} highlight />
                <SectionCard icon="🌀" title="용신(用神) 분석" content={content.yongshin} accent={elemStyle} />
                <SectionCard icon="🤝" title="귀인(貴人) 분석" content={content.guardian} accent={elemStyle} />
                <SectionCard icon="🌐" title="대인관계" content={content.relationship} accent={elemStyle} />
                <LuckyCard content={content.lucky} elemStyle={elemStyle} />
                <SectionCard icon="📜" title="총평" content={content.overall} accent={elemStyle} highlight />
                <AdviceCard content={content.advice} />
              </>
            )}

            {wasFirstFree && unlocked && (
              <div className="bg-[#C9962A15] border border-[#C9962A30] rounded-2xl px-4 py-3 text-center">
                <p className="text-xs text-[#C9962A] font-semibold">🎉 첫 심층 해석은 무료로 제공됩니다!</p>
                <p className="text-[11px] text-[#A89BC0] mt-0.5">다음 방문부터는 {DEEP_SAJU_UNLOCK_COST}P가 필요합니다</p>
              </div>
            )}

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
              onClick={() => { setStep('form'); window.scrollTo(0, 0) }}
              className="w-full py-3.5 bg-[#231844] text-[#C4B8D8] font-semibold rounded-2xl text-sm hover:bg-[#2A1F4A] transition active:scale-[0.98]"
            >
              다시 조회하기
            </button>
          </>
        )}
      </div>

      <div className="text-center pb-8 text-xs text-[#4A4060]">사주팔자 — 양력 기준 · 절기 근사값 적용</div>
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
    <div className={`bg-[#130E24] rounded-3xl border shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-5 ${
      highlight ? 'border-[#C9962A30]' : 'border-[#2A1F4A]'
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <p className="text-sm font-bold text-[#F5EDD4]">{title}</p>
        {highlight && (
          <span className="ml-auto text-[10px] bg-[#C9962A15] text-[#C9962A] border border-[#C9962A30] px-2 py-0.5 rounded-full font-semibold">핵심</span>
        )}
      </div>
      <p className="text-sm text-[#A89BC0] leading-relaxed">{content}</p>
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
    <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🍀</span>
        <p className="text-sm font-bold text-[#F5EDD4]">행운 키워드</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {lines.map((line, i) => {
          const [label, ...rest] = line.split(': ')
          const value = rest.join(': ')
          const isPrimary = i < 2
          return (
            <div
              key={i}
              className={`rounded-2xl px-3.5 py-3 border ${isPrimary ? '' : 'bg-[#1C1438] border-[#2A1F4A]'}`}
              style={isPrimary ? { background: elemStyle.bg, borderColor: elemStyle.border } : {}}
            >
              <p className="text-[10px] text-[#7B6F9A] mb-0.5">{label}</p>
              <p
                className="text-xs font-bold"
                style={isPrimary ? { color: elemStyle.text } : { color: '#C4B8D8' }}
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
    <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-5 shadow-xl shadow-[#000]/40 border border-[#C9962A25]">
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
