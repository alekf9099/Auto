import { useState } from 'react'
import type { BirthInput, SajuResult } from './types'
import { calculateSaju, getOhaengCount, pillarName, pillarNameKo } from './utils/saju'
import { STEMS, BRANCHES } from './utils/constants'
import BirthForm      from './components/BirthForm'
import SajuChart      from './components/SajuChart'
import OhaengChart    from './components/OhaengChart'
import SipsinChart    from './components/SipsinChart'
import DaunChart      from './components/DaunChart'
import FortuneReading from './components/FortuneReading'
import FortuneTabs    from './components/FortuneTabs'
import SummaryPage    from './components/SummaryPage'

type Page = 'form' | 'result' | 'summary'
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
    setResult(calculateSaju(inp))
    setPage('result')
    setTab('saju')
    window.scrollTo(0, 0)
  }

  function handleReset() {
    setInput(null)
    setResult(null)
    setPage('form')
  }

  if (page === 'form' || !input || !result) {
    return <BirthForm onSubmit={handleSubmit} />
  }

  const ohaeng    = getOhaengCount(result)
  const dayStem   = STEMS[result.dayPillar.stemIndex]
  const dayBranch = BRANCHES[result.dayPillar.branchIndex]
  const hourLabel = input.hour !== null ? `${input.hour}시` : '시 불명'

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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* 상단 바 */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-stone-100">
        <div className="max-w-2xl mx-auto px-4 pt-3 pb-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-base font-bold text-stone-700 font-korean">사주팔자 결과</h1>
              <p className="text-xs text-stone-400">
                {input.year}.{String(input.month).padStart(2,'0')}.{String(input.day).padStart(2,'0')}
                &nbsp;{hourLabel}&nbsp;·&nbsp;{input.gender === 'male' ? '남성' : '여성'}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="text-sm text-amber-600 font-medium bg-amber-50 px-3 py-1.5 rounded-xl hover:bg-amber-100 transition"
            >
              다시 입력
            </button>
          </div>

          {/* 탭 */}
          <div className="flex gap-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-2 text-sm font-semibold rounded-t-xl transition-all ${
                  tab === t.id
                    ? 'bg-amber-500 text-white'
                    : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* 공통 배너 */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-5 text-white shadow-lg">
          <p className="text-amber-100 text-sm mb-1">
            {input.year}년 {input.month}월 {input.day}일생
          </p>
          <span className="text-4xl font-bold tracking-wide">
            {pillarName(result.yearPillar)}
            {pillarName(result.monthPillar)}
            {pillarName(result.dayPillar)}
            {result.hourPillar ? pillarName(result.hourPillar) : ''}
          </span>
          <p className="text-amber-200 text-sm mt-1">
            ({pillarNameKo(result.yearPillar)}{pillarNameKo(result.monthPillar)}
            {pillarNameKo(result.dayPillar)}{result.hourPillar ? pillarNameKo(result.hourPillar) : ''})
          </p>
          <p className="text-amber-100 text-xs mt-2">
            일간 {dayStem.hanja}({dayStem.ko}) &middot;
            {dayStem.element === 'wood' ? ' 목(木)' : dayStem.element === 'fire' ? ' 화(火)' : dayStem.element === 'earth' ? ' 토(土)' : dayStem.element === 'metal' ? ' 금(金)' : ' 수(水)'}
            {dayStem.yinYang === 'yang' ? ' 양(陽)' : ' 음(陰)'} &middot; {dayBranch.animal}띠
          </p>
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
          className="w-full py-4 bg-gradient-to-r from-stone-800 to-stone-700 text-white font-bold rounded-3xl shadow-lg hover:from-stone-700 hover:to-stone-600 transition-all duration-200 text-base flex items-center justify-center gap-2"
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
