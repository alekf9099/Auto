import { useState } from 'react'
import type { BirthInput, SajuResult, UserInfo } from './types'
import { calculateSaju, getOhaengCount, pillarName, pillarNameKo } from './utils/saju'
import { STEMS, BRANCHES } from './utils/constants'
import LoginPage      from './components/LoginPage'
import HomePage       from './components/HomePage'
import SinnyeonPage   from './components/SinnyeonPage'
import TojeongPage    from './components/TojeongPage'
import BirthForm      from './components/BirthForm'
import LoadingScreen  from './components/LoadingScreen'
import SajuChart      from './components/SajuChart'
import OhaengChart    from './components/OhaengChart'
import SipsinChart    from './components/SipsinChart'
import DaunChart      from './components/DaunChart'
import FortuneReading from './components/FortuneReading'
import FortuneTabs    from './components/FortuneTabs'
import SummaryPage    from './components/SummaryPage'

type Page = 'login' | 'home' | 'sinnyeon' | 'tojeong' | 'form' | 'loading' | 'result' | 'summary'
type Tab  = 'saju' | 'fortune' | 'analysis'

const TABS: { id: Tab; label: string }[] = [
  { id: 'saju',     label: '내 사주' },
  { id: 'fortune',  label: '운세'    },
  { id: 'analysis', label: '분석'    },
]

export default function App() {
  const [page,   setPage]   = useState<Page>('login')
  const [tab,    setTab]    = useState<Tab>('saju')
  const [user,   setUser]   = useState<UserInfo | null>(null)
  const [input,  setInput]  = useState<BirthInput | null>(null)
  const [result, setResult] = useState<SajuResult | null>(null)

  function goHome() { setPage('home'); window.scrollTo(0, 0) }

  function handleLogin(u: UserInfo) { setUser(u); setPage('home'); window.scrollTo(0, 0) }

  function handleHomeNavigate(dest: 'saju' | 'sinnyeon' | 'tojeong' | 'fortune-today' | 'daun') {
    if (dest === 'sinnyeon') { setPage('sinnyeon'); window.scrollTo(0, 0); return }
    if (dest === 'tojeong')  { setPage('tojeong');  window.scrollTo(0, 0); return }
    if (dest === 'fortune-today') {
      if (result) { setTab('fortune'); setPage('result') } else { setPage('form') }
      window.scrollTo(0, 0); return
    }
    if (dest === 'daun') {
      if (result) { setTab('analysis'); setPage('result') } else { setPage('form') }
      window.scrollTo(0, 0); return
    }
    setPage('form'); window.scrollTo(0, 0)
  }

  function handleSubmit(inp: BirthInput) {
    setInput(inp); setPage('loading'); setTab('saju'); window.scrollTo(0, 0)
  }

  function handleLoadingComplete() {
    if (!input) return
    setResult(calculateSaju(input)); setPage('result'); window.scrollTo(0, 0)
  }

  // ── 로그인 ───────────────────────────────────────────────────────────
  if (page === 'login') return <LoginPage onLogin={handleLogin} />

  // ── 홈 ──────────────────────────────────────────────────────────────
  if (page === 'home' && user) {
    return (
      <HomePage
        user={user}
        onNavigate={handleHomeNavigate}
        onLogout={() => { setUser(null); setPage('login'); window.scrollTo(0, 0) }}
      />
    )
  }

  // ── 신년운세 ────────────────────────────────────────────────────────
  if (page === 'sinnyeon') return <SinnyeonPage onBack={goHome} />

  // ── 토정비결 ────────────────────────────────────────────────────────
  if (page === 'tojeong') return <TojeongPage onBack={goHome} />

  // ── 사주 입력 폼 ─────────────────────────────────────────────────────
  if (page === 'form') return <BirthForm onSubmit={handleSubmit} />

  // ── 로딩 ────────────────────────────────────────────────────────────
  if (page === 'loading' && input) return <LoadingScreen onComplete={handleLoadingComplete} />

  // ── 가드 ────────────────────────────────────────────────────────────
  if (!input || !result) return <BirthForm onSubmit={handleSubmit} />

  // ── 요약 페이지 ──────────────────────────────────────────────────────
  const ohaeng    = getOhaengCount(result)
  const dayStem   = STEMS[result.dayPillar.stemIndex]
  const dayBranch = BRANCHES[result.dayPillar.branchIndex]
  const hourLabel = input.hour !== null
    ? `${input.hour}시${input.minute !== null ? ` ${input.minute}분` : ''}`
    : '시 불명'

  if (page === 'summary') {
    return (
      <SummaryPage
        input={input} result={result} ohaeng={ohaeng}
        onBack={() => { setPage('result'); window.scrollTo(0, 0) }}
        onReset={goHome}
      />
    )
  }

  // ── 결과 페이지 ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F4F2FF]">

      {/* 상단 바 */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-violet-100">
        <div className="max-w-2xl mx-auto px-4 pt-3 pb-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-base font-bold text-stone-800" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                사주팔자 결과
              </h1>
              <p className="text-xs text-stone-400">
                {input.year}.{String(input.month).padStart(2,'0')}.{String(input.day).padStart(2,'0')}
                &nbsp;{hourLabel}&nbsp;·&nbsp;{input.gender === 'male' ? '남성' : '여성'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goHome}
                className="text-xs text-stone-400 font-semibold bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-xl hover:bg-stone-100 transition"
              >
                홈
              </button>
              <button
                onClick={() => { setInput(null); setResult(null); setPage('form') }}
                className="text-xs text-violet-600 font-semibold bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-xl hover:bg-violet-100 transition"
              >
                다시 입력
              </button>
            </div>
          </div>

          {/* 탭 */}
          <div className="flex bg-stone-100 rounded-2xl p-1 gap-1 mb-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
                  tab === t.id
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                    : 'text-stone-400 hover:text-stone-600'
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
        {/* 배너 */}
        <div className="bg-gradient-to-br from-[#1E1152] via-[#2D1B69] to-[#160F3E] rounded-3xl p-5 shadow-xl shadow-violet-900/20">
          <p className="text-violet-300/70 text-xs mb-2">
            {input.year}년 {input.month}월 {input.day}일생
          </p>
          <div className="text-4xl font-bold tracking-wide text-white mb-1" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            {pillarName(result.yearPillar)}{pillarName(result.monthPillar)}{pillarName(result.dayPillar)}
            {result.hourPillar   ? pillarName(result.hourPillar)   : ''}
            {result.minutePillar ? pillarName(result.minutePillar) : ''}
          </div>
          <p className="text-violet-300/60 text-sm mb-3">
            ({pillarNameKo(result.yearPillar)}{pillarNameKo(result.monthPillar)}{pillarNameKo(result.dayPillar)}
            {result.hourPillar   ? pillarNameKo(result.hourPillar)   : ''}
            {result.minutePillar ? pillarNameKo(result.minutePillar) : ''})
          </p>
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs bg-violet-400/20 text-violet-200 border border-violet-400/30 px-2.5 py-1 rounded-full font-medium">
              {dayStem.hanja}({dayStem.ko}) 일간
            </span>
            <span className="text-xs bg-white/10 text-violet-200 border border-white/20 px-2.5 py-1 rounded-full">
              {dayStem.element === 'wood' ? '목(木)' : dayStem.element === 'fire' ? '화(火)' : dayStem.element === 'earth' ? '토(土)' : dayStem.element === 'metal' ? '금(金)' : '수(水)'}
              {dayStem.yinYang === 'yang' ? ' 양' : ' 음'}
            </span>
            <span className="text-xs bg-white/10 text-violet-200 border border-white/20 px-2.5 py-1 rounded-full">
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
        {tab === 'fortune' && <FortuneTabs result={result} ohaeng={ohaeng} />}
        {tab === 'analysis' && (
          <>
            <SipsinChart result={result} />
            <DaunChart   result={result} birthYear={input.year} />
          </>
        )}

        {/* 요약 카드 버튼 */}
        <button
          onClick={() => { setPage('summary'); window.scrollTo(0, 0) }}
          className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-3xl shadow-lg shadow-violet-200 hover:from-violet-500 hover:to-purple-500 transition-all text-base flex items-center justify-center gap-2 active:scale-[0.99]"
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
