import { useState } from 'react'
import PointsClaimButton from './PointsClaimButton'
import { IcDream } from './icons/SajuIcons'

interface Props {
  onBack: () => void
}

interface DreamResult {
  luck: 'great' | 'good' | 'neutral' | 'caution'
  summary: string
  general: string
  wealth: string
  love: string
  career: string
  health: string
  advice: string
}

const LUCK_CFG = {
  great:   { label: '대길몽', color: '#9A6A12', bg: '#9A6A1218', border: '#9A6A1245', emoji: '✨' },
  good:    { label: '길몽',   color: '#4BBF7E', bg: '#4BBF7E18', border: '#4BBF7E45', emoji: '🌟' },
  neutral: { label: '평몽',   color: '#8A7350', bg: '#8A735018', border: '#8A735045', emoji: '🌙' },
  caution: { label: '주의몽', color: '#E05252', bg: '#E0525218', border: '#E0525245', emoji: '⚡' },
}

const DETAIL_SECTIONS = [
  { key: 'wealth',  label: '재물운',      bar: '#9A6A12' },
  { key: 'love',    label: '애정운',      bar: '#E05282' },
  { key: 'career',  label: '직업/사업운', bar: '#4BBF7E' },
  { key: 'health',  label: '건강운',      bar: '#52B4E0' },
] as const

export default function DreamPage({ onBack }: Props) {
  const [step,      setStep]      = useState<'input' | 'loading' | 'result'>('input')
  const [dreamText, setDreamText] = useState('')
  const [result,    setResult]    = useState<DreamResult | null>(null)
  const [error,     setError]     = useState('')

  async function handleSubmit() {
    if (!dreamText.trim()) return
    setStep('loading')
    setError('')
    try {
      const apiUrl = import.meta.env.VITE_DREAM_API_URL ?? '/api/dream'
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 20000)
      let resp: Response
      try {
        resp = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dream: dreamText }),
          signal: controller.signal,
        })
      } finally {
        clearTimeout(timer)
      }
      let data: DreamResult & { error?: string }
      try {
        data = await resp.json() as DreamResult & { error?: string }
      } catch {
        throw new Error('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.')
      }
      if (!resp.ok) throw new Error(data.error ?? '오류가 발생했습니다')
      setResult(data)
      setStep('result')
      window.scrollTo(0, 0)
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다')
      setStep('input')
    }
  }

  function handleBack() {
    if (step === 'result') { setStep('input'); window.scrollTo(0, 0) }
    else onBack()
  }

  const luck = result ? LUCK_CFG[result.luck] : null

  return (
    <div className="min-h-screen">

      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-[#F3E7C8]/90 backdrop-blur-md border-b border-[#9A6A1230]">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3 flex items-center gap-3">
          <button
            onClick={handleBack}
            aria-label="뒤로 가기"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#E3D0A4] transition text-[#5C4A2E] text-lg flex-shrink-0"
          >
            ←
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-[#3B2A16] leading-tight" style={{ fontFamily: "'Gowun Batang', serif" }}>
              꿈해몽 (夢解夢)
            </h1>
            <p className="text-xs text-[#9A8155] truncate">
              {step === 'input' ? 'AI 전통 해몽' : step === 'loading' ? '해몽 중...' : '해몽 결과'}
            </p>
          </div>
          <span className="text-[10px] text-[#4BBF7E] bg-[#4BBF7E15] border border-[#4BBF7E30] px-2 py-1 rounded-full flex-shrink-0 font-semibold">
            AI 해몽
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">

        {/* ── INPUT ── */}
        {step === 'input' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#FBF4E2] via-[#F3E7C8] to-[#EAD9B0] rounded-3xl p-5 border border-[#9A6A1225] shadow-xl shadow-[#000]/40">
              <p className="text-[#9A8155] text-xs mb-1">AI 전통 해몽</p>
              <h2 className="text-xl font-bold text-[#3B2A16] mb-2" style={{ fontFamily: "'Gowun Batang', serif" }}>
                어떤 꿈을 꾸셨나요?
              </h2>
              <p className="text-sm text-[#6E5836] leading-relaxed">
                꿈 내용을 자유롭게 입력하면 AI가 전통 해몽 방식으로 재물·애정·직업·건강 운세를 풀어드립니다.
              </p>
            </div>

            <div className="bg-[#FBF4E2] rounded-3xl border border-[#D8C290] p-5">
              <textarea
                value={dreamText}
                onChange={e => setDreamText(e.target.value)}
                placeholder="예) 돼지 세 마리가 집 안으로 들어오는 꿈을 꿨어요. 황금색이었고 매우 기분이 좋았습니다."
                maxLength={300}
                rows={5}
                className="w-full bg-[#E9DAB8] border border-[#D8C290] rounded-2xl px-4 py-3 text-sm text-[#3B2A16] placeholder:text-[#A89167] focus:outline-none focus:border-[#9A6A12] focus:ring-2 focus:ring-[#9A6A1220] transition resize-none leading-relaxed"
              />
              <div className="flex items-center justify-between mt-2 px-1">
                <p className="text-xs text-[#A89167]">{dreamText.length}/300자</p>
                {error && <p className="text-xs text-red-400">{error}</p>}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!dreamText.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-[#9A6A12] to-[#B5841C] text-[#0D0A1A] font-bold rounded-2xl shadow-lg hover:from-[#9A6A12] hover:to-[#B5841C] transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              💭 해몽하기
            </button>

            <div className="flex items-center gap-2 justify-center">
              <div className="h-px flex-1 bg-[#D8C290]"/>
              <p className="text-[10px] text-[#A89167]">Google Gemini AI · 전통 해몽 기반</p>
              <div className="h-px flex-1 bg-[#D8C290]"/>
            </div>
          </div>
        )}

        {/* ── LOADING ── */}
        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-2 border-[#9A6A1220] animate-ping"/>
              <div className="absolute inset-2 rounded-full border-2 border-[#9A6A1240] animate-ping" style={{ animationDelay: '0.3s' }}/>
              <div className="absolute inset-4 rounded-full border-2 border-[#9A6A1260] animate-ping" style={{ animationDelay: '0.6s' }}/>
              <div className="absolute inset-0 flex items-center justify-center"><IcDream size={32} className="text-[#9A6A12]"/></div>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-[#3B2A16] mb-1" style={{ fontFamily: "'Gowun Batang', serif" }}>
                해몽 중...
              </p>
              <p className="text-sm text-[#9A8155]">AI가 전통 해몽을 분석하고 있습니다</p>
            </div>
          </div>
        )}

        {/* ── RESULT ── */}
        {step === 'result' && result && luck && (
          <div className="space-y-4 animate-fade-in-up">

            {/* Hero */}
            <div
              className="rounded-3xl p-6 border shadow-xl shadow-[#000]/40"
              style={{ background: 'linear-gradient(135deg, #FBF4E2 0%, #F3E7C8 60%, #EAD9B0 100%)', borderColor: luck.border }}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-6xl leading-none">{luck.emoji}</span>
                <span
                  className="text-sm font-bold px-3 py-1.5 rounded-full"
                  style={{ color: luck.color, backgroundColor: luck.bg, border: `1px solid ${luck.border}` }}
                >
                  {luck.label}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-[#3B2A16] mb-1" style={{ fontFamily: "'Gowun Batang', serif" }}>
                꿈 해몽 결과
              </h2>
              <p className="text-xs text-[#9A8155] mb-3">{result.summary}</p>

              {/* 핵심 해몽 callout */}
              <div className="flex gap-2 items-start bg-[#9A6A120D] border border-[#9A6A1230] rounded-2xl px-4 py-3 mb-3">
                <span className="text-sm flex-shrink-0">💬</span>
                <div>
                  <p className="text-[10px] text-[#9A6A12] font-bold mb-0.5">전통 해몽 핵심</p>
                  <p className="text-sm text-[#B5841C] font-medium leading-relaxed">
                    {result.general.split('.')[0]}.
                  </p>
                </div>
              </div>

              {/* General */}
              <div className="rounded-2xl p-4" style={{ backgroundColor: luck.bg, border: `1px solid ${luck.border}` }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 rounded-full" style={{ backgroundColor: luck.color }}/>
                  <p className="text-xs font-bold" style={{ color: luck.color }}>총운 해몽</p>
                </div>
                <p className="text-sm text-[#5C4A2E] leading-relaxed">{result.general}</p>
              </div>
            </div>

            {/* Detail sections */}
            {DETAIL_SECTIONS.map(sec => (
              <div key={sec.key} className="bg-[#FBF4E2] rounded-3xl border border-[#D8C290] p-5 shadow-[0_2px_20px_rgba(122,90,40,0.15)]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 rounded-full" style={{ backgroundColor: sec.bar }}/>
                  <h3 className="text-sm font-bold text-[#3B2A16]" style={{ fontFamily: "'Gowun Batang', serif" }}>
                    {sec.label}
                  </h3>
                </div>
                <p className="text-sm text-[#5C4A2E] leading-relaxed">{result[sec.key]}</p>
              </div>
            ))}

            {/* Advice */}
            <div className="bg-gradient-to-br from-[#FBF4E2] via-[#F3E7C8] to-[#EAD9B0] rounded-3xl p-5 border border-[#9A6A1225] shadow-xl shadow-[#000]/40">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-[#9A6A12] rounded-full"/>
                <h3 className="text-sm font-bold text-[#3B2A16]" style={{ fontFamily: "'Gowun Batang', serif" }}>
                  오늘의 행동 지침
                </h3>
              </div>
              <p className="text-sm text-[#5C4A2E] leading-relaxed">{result.advice}</p>
            </div>

            {/* 포인트 받기 */}
            <PointsClaimButton featureKey="dream" label="꿈해몽 확인 💭" />

            {/* Restart CTA */}
            <button
              onClick={() => { setStep('input'); setResult(null); setDreamText(''); window.scrollTo(0, 0) }}
              className="w-full py-3.5 bg-gradient-to-r from-[#9A6A12] to-[#B5841C] text-[#0D0A1A] font-bold rounded-2xl shadow-lg hover:from-[#9A6A12] hover:to-[#B5841C] transition-all active:scale-[0.99]"
            >
              다른 꿈 해몽하기 →
            </button>
          </div>
        )}

        <p className="text-center text-xs text-[#A89167] pb-6 pt-4">
          꿈해몽 — Google Gemini AI · 전통 해몽 기반 · 참고용으로만 활용하세요
        </p>
      </div>
    </div>
  )
}
