import { useState } from 'react'
import type { BirthInput, SajuResult } from './types'
import { calculateSaju, getOhaengCount, pillarName, pillarNameKo } from './utils/saju'
import { STEMS, BRANCHES } from './utils/constants'
import BirthForm     from './components/BirthForm'
import SajuChart     from './components/SajuChart'
import OhaengChart   from './components/OhaengChart'
import SipsinChart   from './components/SipsinChart'
import DaunChart     from './components/DaunChart'
import FortuneReading from './components/FortuneReading'

export default function App() {
  const [input,  setInput]  = useState<BirthInput | null>(null)
  const [result, setResult] = useState<SajuResult | null>(null)

  function handleSubmit(inp: BirthInput) {
    setInput(inp)
    setResult(calculateSaju(inp))
  }

  function handleReset() {
    setInput(null)
    setResult(null)
  }

  if (!input || !result) {
    return <BirthForm onSubmit={handleSubmit} />
  }

  const ohaeng = getOhaengCount(result)
  const dayStem   = STEMS[result.dayPillar.stemIndex]
  const dayBranch = BRANCHES[result.dayPillar.branchIndex]

  const hourLabel = input.hour !== null
    ? `${input.hour}시 (${dayBranch.hour})`
    : '시 불명'

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-stone-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-stone-700 font-korean">사주팔자 결과</h1>
            <p className="text-xs text-stone-400">
              {input.year}.{String(input.month).padStart(2, '0')}.{String(input.day).padStart(2, '0')} {hourLabel}
              &nbsp;·&nbsp;{input.gender === 'male' ? '남성' : '여성'}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="text-sm text-amber-600 font-medium bg-amber-50 px-3 py-1.5 rounded-xl hover:bg-amber-100 transition"
          >
            다시 입력
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Summary banner */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-5 text-white shadow-lg">
          <p className="text-amber-100 text-sm mb-1">
            {input.year}년 {input.month}월 {input.day}일생
          </p>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-bold tracking-wide">
              {pillarName(result.yearPillar)}
              {pillarName(result.monthPillar)}
              {pillarName(result.dayPillar)}
              {result.hourPillar ? pillarName(result.hourPillar) : ''}
            </span>
          </div>
          <p className="text-amber-200 text-sm mt-1">
            ({pillarNameKo(result.yearPillar)}{pillarNameKo(result.monthPillar)}{pillarNameKo(result.dayPillar)}{result.hourPillar ? pillarNameKo(result.hourPillar) : ''})
          </p>
          <p className="text-amber-100 text-xs mt-2">
            일간 {dayStem.hanja}({dayStem.ko}) &middot; {dayStem.element === 'wood' ? '목(木)' : dayStem.element === 'fire' ? '화(火)' : dayStem.element === 'earth' ? '토(土)' : dayStem.element === 'metal' ? '금(金)' : '수(水)'}
            {dayStem.yinYang === 'yang' ? ' 양(陽)' : ' 음(陰)'} &middot; {dayBranch.animal}띠
          </p>
        </div>

        <SajuChart     result={result} />
        <OhaengChart   count={ohaeng} hasHour={input.hour !== null} />
        <FortuneReading result={result} count={ohaeng} />
        <SipsinChart   result={result} />
        <DaunChart     result={result} birthYear={input.year} />
      </div>

      <div className="text-center pb-8 text-xs text-stone-300">
        사주팔자 계산기 — 양력 기준 · 절기 근사값 적용
      </div>
    </div>
  )
}
