import { useState } from 'react'
import type { BirthInput, SajuResult } from './types'
import { calculateSaju, getOhaengCount, pillarName, pillarNameKo } from './utils/saju'
import { STEMS, BRANCHES } from './utils/constants'
import BirthForm      from './components/BirthForm'
import LoadingScreen  from './components/LoadingScreen'
import SajuChart      from './components/SajuChart'
import OhaengChart    from './components/OhaengChart'
import SipsinChart    from './components/SipsinChart'
import DaunChart      from './components/DaunChart'
import FortuneReading from './components/FortuneReading'
import FortuneTabs    from './components/FortuneTabs'
import SummaryPage    from './components/SummaryPage'

type Page = 'form' | 'loading' | 'result' | 'summary'
type Tab  = 'saju' | 'fortune' | 'analysis'

const TABS: { id: Tab; label: string }[] = [
  { id: 'saju',     label: '내 사주' },
  { id: 'fortune',  label: '운세'    },
  { id: 'analysis', label: '분석'    },
]

export default function App() {
  const [page,   setPage]   = useState<Page>('form')
  const [tab,    setTab]    = useState<Tab>('saju')
  const [input,  setInput]  = useState<BirthInput | null>(null)
  const [result, setResult] = useState<SajuResult | null>(null)

  function handleSubmit(inp: BirthInput) {
    setInput(inp)
    setPage('loading')
    setTab('saju')
    window.scrollTo(0, 0)
  }

  function handleLoadingComplete() {
    if (!input) return
    setResult(calculateSaju(input))
    setPage('result')
    window.scrollTo(0, 0)
  }

  function handleReset() {
    setInput(null)
    setResult(null)
    setPage('form')
  }

  if (page === 'form') {
    return <BirthForm onSubmit={handleSubmit} />
  }

  if (page === 'loading' && input) {
    return <LoadingScreen onComplete={handleLoadingComplete} />
  }

  if (!input || !result) {
    return <BirthForm onSubmit={handleSubmit} />
  }

  const ohaeng    = getOhaengCount(result)
  const dayStem   = STEMS[result.dayPillar.stemIndex]
  const dayBranch = BRANCHES[result.dayPillar.branchIndex]
  const hourLabel = input.hour !== null
    ? `${input.hour}시${input.minute !== null ? ` ${input.minute}분` : ''}`
    : '시 불명'

  if (page === 'summary') {
    return (
      <SummaryPage
        input={input}
        result={result}
        ohaeng={ohaeng}
        onBack={() => { setPage('result'); window.scrollTo(0, 0) }}
        onReset={handleReset}
      />
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-x-hidden">
      {/* 배경 글로우 */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-amber-500/8 blur-[120px] pointer-events-none" />

      {/* 상단 바 */}
      <div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-2xl mx-auto px-4 pt-3 pb-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1
                className="text-base font-bold text-white"
                style={{ fontFamily: "'Noto Serif KR', serif" }}
              >
                사주팔자 결과
              </h1>
              <p className="text-xs text-zinc-500">
                {input.year}.{String(input.month).padStart(2,'0')}.{String(input.day).padStart(2,'0')}
                &nbsp;{hourLabel}&nbsp;·&nbsp;{input.gender === 'male' ? '남성' : '여성'}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="text-xs text-zinc-400 border border-zinc-700 px-3 py-1.5 rounded-xl hover:border-zinc-500 hover:text-white transition"
            >
              다시 입력
            </button>
          </div>

          {/* 탭 — 필 스타일 */}
          <div className="flex bg-zinc-900/70 rounded-2xl p-1 gap-1 mb-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
                  tab === t.id
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4 relative z-10">
        {/* 배너 */}
        <div className="bg-gradient-to-br from-amber-500/20 to-orange-600/10 border border-amber-500/20 rounded-3xl p-5">
          <p className="text-amber-400/70 text-xs mb-2">
            {input.year}년 {input.month}월 {input.day}일생
          </p>
          <div
            className="text-4xl font-bold tracking-wide text-white mb-1"
            style={{ fontFamily: "'Noto Serif KR', serif", textShadow: '0 0 40px rgba(245,158,11,0.3)' }}
          >
            {pillarName(result.yearPillar)}
            {pillarName(result.monthPillar)}
            {pillarName(result.dayPillar)}
            {result.hourPillar   ? pillarName(result.hourPillar)   : ''}
            {result.minutePillar ? pillarName(result.minutePillar) : ''}
          </div>
          <p className="text-zinc-500 text-sm mb-2">
            ({pillarNameKo(result.yearPillar)}{pillarNameKo(result.monthPillar)}
            {pillarNameKo(result.dayPillar)}
            {result.hourPillar   ? pillarNameKo(result.hourPillar)   : ''}
            {result.minutePillar ? pillarNameKo(result.minutePillar) : ''})
          </p>
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full">
              {dayStem.hanja}({dayStem.ko}) 일간
            </span>
            <span className="text-xs bg-white/5 text-zinc-400 border border-white/10 px-2.5 py-1 rounded-full">
              {dayStem.element === 'wood' ? '목(木)' : dayStem.element === 'fire' ? '화(火)' : dayStem.element === 'earth' ? '토(土)' : dayStem.element === 'metal' ? '금(金)' : '수(水)'}
              {dayStem.yinYang === 'yang' ? ' 양' : ' 음'}
            </span>
            <span className="text-xs bg-white/5 text-zinc-400 border border-white/10 px-2.5 py-1 rounded-full">
              {dayBranch.animal}띠
            </span>
          </div>
        </div>

        {/* 탭별 콘텐츠 */}
        {tab === 'saju' && (
          <>
            <SajuChart      result={result} />
            <OhaengChart    count={ohaeng} hasHour={input.hour !== null} />
            <FortuneReading result={result} count={ohaeng} />
          </>
        )}
        {tab === 'fortune' && (
          <FortuneTabs result={result} ohaeng={ohaeng} />
        )}
        {tab === 'analysis' && (
          <>
            <SipsinChart result={result} />
            <DaunChart   result={result} birthYear={input.year} />
          </>
        )}

        {/* 요약 카드 버튼 */}
        <button
          onClick={() => { setPage('summary'); window.scrollTo(0, 0) }}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-3xl
            shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:from-amber-400 hover:to-orange-400
            transition-all text-base flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          <span>나의 사주 요약 카드 보기</span>
          <span className="text-lg">→</span>
        </button>
      </div>

      <div className="text-center pb-8 text-xs text-stone-300">
        사주팔자 계산기 — 양력 기준 · 절기 근사값 적용
      </div>
    </div>
  )
}
