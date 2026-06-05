import { useState, useEffect } from 'react'
import type { BirthInput, SajuResult, UserInfo } from './types'
import { calculateSaju, getOhaengCount, pillarName, pillarNameKo } from './utils/saju'
import { STEMS, BRANCHES } from './utils/constants'
import { loadPoints, awardPoints, tryFeatureBonus } from './utils/points'
import type { PointsState } from './utils/points'
import LoginPage        from './components/LoginPage'
import ProfileSetupPage from './components/ProfileSetupPage'
import SplashScreen     from './components/SplashScreen'
import HomePage         from './components/HomePage'
import AttendancePage from './components/AttendancePage'
import SinnyeonPage   from './components/SinnyeonPage'
import TojeongPage    from './components/TojeongPage'
import DayFortunePage from './components/DayFortunePage'
import GunghabPage    from './components/GunghabPage'
import DeepSajuPage  from './components/DeepSajuPage'
import BirthForm      from './components/BirthForm'
import LoadingScreen  from './components/LoadingScreen'
import SajuChart      from './components/SajuChart'
import OhaengChart    from './components/OhaengChart'
import SipsinChart    from './components/SipsinChart'
import DaunChart      from './components/DaunChart'
import FortuneReading from './components/FortuneReading'
import FortuneTabs    from './components/FortuneTabs'
import SummaryPage    from './components/SummaryPage'

const STORAGE_KEY = 'unmyeongbom_birth'

type Page = 'splash' | 'login' | 'profile' | 'analyzing' | 'home' | 'attendance' | 'sinnyeon' | 'tojeong' | 'today' | 'tomorrow' | 'gunghab' | 'deepsaju' | 'form' | 'loading' | 'result' | 'summary'
type Tab  = 'saju' | 'fortune' | 'analysis'

const TABS: { id: Tab; label: string }[] = [
  { id: 'saju',     label: '내 사주' },
  { id: 'fortune',  label: '운세'    },
  { id: 'analysis', label: '분석'    },
]

function loadBirthProfile(): BirthInput | null {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    return s ? (JSON.parse(s) as BirthInput) : null
  } catch { return null }
}

export default function App() {
  const [page,         setPage]         = useState<Page>('splash')
  const [tab,          setTab]          = useState<Tab>('saju')
  const [user,         setUser]         = useState<UserInfo | null>(null)
  const [birthProfile, setBirthProfile] = useState<BirthInput | null>(loadBirthProfile)
  const [input,        setInput]        = useState<BirthInput | null>(null)
  const [result,       setResult]       = useState<SajuResult | null>(null)
  const [points,       setPoints]       = useState<PointsState>(loadPoints)

  // 뒤로가기 버튼 지원
  useEffect(() => {
    const BACK_MAP: Partial<Record<Page, Page>> = {
      profile: 'login', analyzing: 'home', attendance: 'home',
      sinnyeon: 'home', tojeong: 'home', today: 'home', tomorrow: 'home',
      gunghab: 'home', deepsaju: 'home', form: 'home', loading: 'home', result: 'home', summary: 'result',
    }
    const navigable: Page[] = ['attendance','sinnyeon','tojeong','today','tomorrow','gunghab','deepsaju','form','result','summary','profile','analyzing']
    if (navigable.includes(page)) history.pushState({ page }, '')

    function onPop() {
      history.pushState(null, '')
      setPage(prev => BACK_MAP[prev] ?? 'home')
      window.scrollTo(0, 0)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [page])

  // 사주 결과도 프로필과 동기화
  useEffect(() => {
    if (birthProfile && !result) {
      setResult(calculateSaju(birthProfile))
      setInput(birthProfile)
    }
  }, [birthProfile])

  function saveBirthProfile(b: BirthInput) {
    setBirthProfile(b)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(b))
  }

  function goHome() { setPoints(loadPoints()); setPage('home'); window.scrollTo(0, 0) }

  function handleLogin(u: UserInfo) {
    setUser(u)
    setPage(loadBirthProfile() ? 'home' : 'profile')
    window.scrollTo(0, 0)
  }

  function handleProfileSave(b: BirthInput) {
    saveBirthProfile(b)
    // 최초 가입 보너스
    const cur = loadPoints()
    if (cur.history.length === 0) {
      setPoints(awardPoints(cur, 100, '가입 보너스 🎉'))
    }
    setPage('analyzing')
    window.scrollTo(0, 0)
  }

  function handleHomeNavigate(dest: 'saju' | 'sinnyeon' | 'tojeong' | 'today' | 'tomorrow' | 'daun' | 'gunghab' | 'deepsaju') {
    if (!birthProfile) { setPage('profile'); window.scrollTo(0, 0); return }
    // 기능 첫 사용 하루 1회 +5P
    const LABELS: Record<string, string> = {
      sinnyeon: '신년운세 확인 ✨', tojeong: '토정비결 확인 📖',
      today: '오늘의 운세 확인 🔮', tomorrow: '내일의 운세 확인 ⏰',
      saju: '정통사주 확인 ☯', daun: '대운 분석 확인 📊',
      gunghab: '궁합 확인 💕',
      deepsaju: '심층 사주 해석 🔮',
    }
    const { next, claimed } = tryFeatureBonus(points, dest, LABELS[dest] ?? dest)
    if (claimed) setPoints(next)
    if (dest === 'sinnyeon') { setPage('sinnyeon'); window.scrollTo(0, 0); return }
    if (dest === 'tojeong')  { setPage('tojeong');  window.scrollTo(0, 0); return }
    if (dest === 'today')    { setPage('today');    window.scrollTo(0, 0); return }
    if (dest === 'tomorrow') { setPage('tomorrow'); window.scrollTo(0, 0); return }
    if (dest === 'gunghab')  { setPage('gunghab');  window.scrollTo(0, 0); return }
    if (dest === 'deepsaju') { setPage('deepsaju'); window.scrollTo(0, 0); return }
    if (dest === 'daun') {
      if (result) { setTab('analysis'); setPage('result') } else { setPage('form') }
      window.scrollTo(0, 0); return
    }
    // 정통사주: 프로필 있으면 바로 결과
    if (birthProfile && result) { setPage('result'); window.scrollTo(0, 0); return }
    setPage('form'); window.scrollTo(0, 0)
  }

  function handleSubmit(inp: BirthInput) {
    saveBirthProfile(inp)
    setInput(inp); setPage('loading'); setTab('saju'); window.scrollTo(0, 0)
  }

  function handleLoadingComplete() {
    if (!input) return
    setResult(calculateSaju(input)); setPage('result'); window.scrollTo(0, 0)
  }

  // ── 스플래시 ─────────────────────────────────────────────────────────
  if (page === 'splash') return <SplashScreen onDone={() => setPage('login')} />

  // ── 로그인 ───────────────────────────────────────────────────────────
  if (page === 'login') return <LoginPage onLogin={handleLogin} />

  // ── 프로필 설정 ──────────────────────────────────────────────────────
  if (page === 'profile' && user) return <ProfileSetupPage user={user} onSave={handleProfileSave} />

  // ── 프로필 저장 후 분석 중 ────────────────────────────────────────────
  if (page === 'analyzing') return <LoadingScreen onComplete={() => { setPage('home'); window.scrollTo(0, 0) }} />

  // ── 홈 ──────────────────────────────────────────────────────────────
  if (page === 'home' && user) {
    return (
      <HomePage
        user={user}
        birthProfile={birthProfile}
        points={points}
        onPointsUpdate={setPoints}
        onNavigate={handleHomeNavigate}
        onAttendance={() => { setPage('attendance'); window.scrollTo(0, 0) }}
        onEditProfile={() => { setPage('profile'); window.scrollTo(0, 0) }}
        onLogout={() => { setUser(null); setPage('login'); window.scrollTo(0, 0) }}
      />
    )
  }

  // ── 출석체크 ────────────────────────────────────────────────────────
  if (page === 'attendance') return <AttendancePage onBack={goHome} onPointsUpdate={p => { setPoints(p) }} />

  // ── 신년운세 ────────────────────────────────────────────────────────
  if (page === 'sinnyeon') return <SinnyeonPage savedBirth={birthProfile} onSave={saveBirthProfile} onBack={goHome} />

  // ── 토정비결 ────────────────────────────────────────────────────────
  if (page === 'tojeong') return <TojeongPage savedBirth={birthProfile} onSave={saveBirthProfile} onBack={goHome} />

  // ── 오늘/내일의 운세 ─────────────────────────────────────────────────
  if (page === 'today')    return <DayFortunePage dayOffset={0} savedBirth={birthProfile} onSave={saveBirthProfile} onBack={goHome} />
  if (page === 'tomorrow') return <DayFortunePage dayOffset={1} savedBirth={birthProfile} onSave={saveBirthProfile} onBack={goHome} />

  // ── 궁합 ────────────────────────────────────────────────────────────
  if (page === 'gunghab') return <GunghabPage savedBirth={birthProfile} onSave={saveBirthProfile} onBack={goHome} />

  // ── 심층 사주 해석 ────────────────────────────────────────────────────
  if (page === 'deepsaju') return <DeepSajuPage savedBirth={birthProfile} onBack={goHome} />

  // ── 사주 입력 폼 ─────────────────────────────────────────────────────
  if (page === 'form') return <BirthForm savedBirth={birthProfile} onSubmit={handleSubmit} />

  // ── 로딩 ────────────────────────────────────────────────────────────
  if (page === 'loading' && input) return <LoadingScreen onComplete={handleLoadingComplete} />

  // ── 가드 ────────────────────────────────────────────────────────────
  if (!input || !result) return <BirthForm savedBirth={birthProfile} onSubmit={handleSubmit} />

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
                onClick={() => { setInput(null); setResult(null); setBirthProfile(null); localStorage.removeItem(STORAGE_KEY); setPage('profile'); window.scrollTo(0, 0) }}
                className="text-xs text-violet-600 font-semibold bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-xl hover:bg-violet-100 transition"
              >
                정보 수정
              </button>
            </div>
          </div>
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

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        <div className="bg-gradient-to-br from-[#1E1152] via-[#2D1B69] to-[#160F3E] rounded-3xl p-5 shadow-xl shadow-violet-900/20">
          <p className="text-violet-300/70 text-xs mb-2">{input.year}년 {input.month}월 {input.day}일생</p>
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
