import { useState, useEffect, lazy, Suspense } from 'react'
import type { BirthInput, UserInfo } from './types'
import { loadPoints, awardPoints } from './utils/points'
import type { PointsState } from './utils/points'
import { setCurrentEmail, setIdToken, pullCloudData, scheduleCloudPush } from './utils/cloudSync'
import LoginPage        from './components/LoginPage'
import SplashScreen     from './components/SplashScreen'
import LoadingScreen    from './components/LoadingScreen'

const ProfileSetupPage = lazy(() => import('./components/ProfileSetupPage'))
const HomePage         = lazy(() => import('./components/HomePage'))
const AttendancePage   = lazy(() => import('./components/AttendancePage'))
const SinnyeonPage     = lazy(() => import('./components/SinnyeonPage'))
const TojeongPage      = lazy(() => import('./components/TojeongPage'))
const DayFortunePage   = lazy(() => import('./components/DayFortunePage'))
const GunghabPage      = lazy(() => import('./components/GunghabPage'))
const DeepSajuPage     = lazy(() => import('./components/DeepSajuPage'))
const SajuPage         = lazy(() => import('./components/SajuPage'))
const DaunPage         = lazy(() => import('./components/DaunPage'))
const DreamPage        = lazy(() => import('./components/DreamPage'))
const OutfitPage       = lazy(() => import('./components/OutfitPage'))
const JobPage          = lazy(() => import('./components/JobPage'))
const LuckyTimerPage   = lazy(() => import('./components/LuckyTimerPage'))
const PrivacyPolicyPage = lazy(() => import('./components/PrivacyPolicyPage'))
const TermsPage         = lazy(() => import('./components/TermsPage'))

const STORAGE_KEY = 'unmyeongbom_birth'

type Page = 'splash' | 'login' | 'profile' | 'analyzing' | 'home' | 'attendance' | 'sinnyeon' | 'tojeong' | 'today' | 'gunghab' | 'deepsaju' | 'saju' | 'daun' | 'dream' | 'outfit' | 'job' | 'lucky' | 'privacy' | 'terms'

function loadBirthProfile(): BirthInput | null {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    return s ? (JSON.parse(s) as BirthInput) : null
  } catch { return null }
}

function PageFallback() {
  return (
    <div className="min-h-screen bg-[#0D0A1A] flex items-center justify-center">
      <div
        className="w-10 h-10 rounded-full border-[3px] border-[#2A1F4A] border-t-[#C9962A] animate-spin"
        style={{ animationDuration: '0.8s' }}
      />
    </div>
  )
}

export default function App() {
  const [page,         setPage]         = useState<Page>('splash')
  const [user,         setUser]         = useState<UserInfo | null>(null)
  const [birthProfile, setBirthProfile] = useState<BirthInput | null>(loadBirthProfile)
  const [points,       setPoints]       = useState<PointsState>(loadPoints)
  const [isNewCloudUser, setIsNewCloudUser] = useState(true)
  const [legalReturn,  setLegalReturn]  = useState<Page>('login')

  useEffect(() => {
    const BACK_MAP: Partial<Record<Page, Page>> = {
      profile: 'login', analyzing: 'home', attendance: 'home',
      sinnyeon: 'home', tojeong: 'home', today: 'home',
      gunghab: 'home', deepsaju: 'home', saju: 'home', daun: 'home', dream: 'home', outfit: 'home', job: 'home', lucky: 'home',
      privacy: legalReturn, terms: legalReturn,
    }
    const navigable: Page[] = ['attendance','sinnyeon','tojeong','today','gunghab','deepsaju','saju','daun','dream','outfit','job','lucky','profile','analyzing','privacy','terms']
    if (navigable.includes(page)) history.pushState({ page }, '')

    function onPop() {
      history.pushState(null, '')
      setPage(prev => BACK_MAP[prev] ?? 'home')
      window.scrollTo(0, 0)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [page])

  function saveBirthProfile(b: BirthInput) {
    setBirthProfile(b)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(b))
    scheduleCloudPush()
  }

  function goHome() { setPoints(loadPoints()); setPage('home'); window.scrollTo(0, 0) }

  async function handleLogin(u: UserInfo) {
    setUser(u)
    setCurrentEmail(u.email)
    setIdToken(u.idToken)
    const { isNewUser } = await pullCloudData()
    setIsNewCloudUser(isNewUser)
    setBirthProfile(loadBirthProfile())
    setPoints(loadPoints())
    setPage(loadBirthProfile() ? 'home' : 'profile')
    window.scrollTo(0, 0)
  }

  function handleProfileSave(b: BirthInput) {
    saveBirthProfile(b)
    const cur = loadPoints()
    if (isNewCloudUser && cur.history.length === 0) {
      setPoints(awardPoints(cur, 100, '가입 보너스 🎉'))
    }
    setPage('analyzing')
    window.scrollTo(0, 0)
  }

  function handleHomeNavigate(dest: 'saju' | 'sinnyeon' | 'tojeong' | 'today' | 'daun' | 'gunghab' | 'deepsaju' | 'dream' | 'outfit' | 'job') {
    if (!birthProfile) { setPage('profile'); window.scrollTo(0, 0); return }
    setPage(dest)
    window.scrollTo(0, 0)
  }

  function openLegal(type: 'privacy' | 'terms', from: Page) {
    setLegalReturn(from)
    setPage(type)
    window.scrollTo(0, 0)
  }

  if (page === 'splash') return <SplashScreen onDone={() => setPage('login')} />
  if (page === 'login')
    return (
      <LoginPage
        onLogin={handleLogin}
        onShowPrivacy={() => openLegal('privacy', 'login')}
        onShowTerms={() => openLegal('terms', 'login')}
      />
    )

  let content: JSX.Element

  if (page === 'privacy') {
    content = <PrivacyPolicyPage onBack={() => setPage(legalReturn)} />
  } else if (page === 'terms') {
    content = <TermsPage onBack={() => setPage(legalReturn)} />
  } else if (page === 'profile' && user) {
    content = <ProfileSetupPage user={user} onSave={handleProfileSave} />
  } else if (page === 'analyzing') {
    content = <LoadingScreen onComplete={() => { setPage('home'); window.scrollTo(0, 0) }} />
  } else if (page === 'home' && user) {
    content = (
      <HomePage
        user={user}
        birthProfile={birthProfile}
        points={points}
        onPointsUpdate={setPoints}
        onNavigate={handleHomeNavigate}
        onAttendance={() => { setPage('attendance'); window.scrollTo(0, 0) }}
        onLuckyTimer={() => { setPage('lucky'); window.scrollTo(0, 0) }}
        onEditProfile={() => { setPage('profile'); window.scrollTo(0, 0) }}
        onLogout={() => { setCurrentEmail(null); setIdToken(null); setUser(null); setPage('login'); window.scrollTo(0, 0) }}
        onShowPrivacy={() => openLegal('privacy', 'home')}
        onShowTerms={() => openLegal('terms', 'home')}
      />
    )
  } else if (page === 'attendance') {
    content = <AttendancePage onBack={goHome} onPointsUpdate={p => { setPoints(p) }} />
  } else if (page === 'lucky') {
    content = <LuckyTimerPage onBack={goHome} onPointsUpdate={p => { setPoints(p) }} />
  } else if (page === 'sinnyeon') {
    content = <SinnyeonPage savedBirth={birthProfile} onSave={saveBirthProfile} onBack={goHome} />
  } else if (page === 'tojeong') {
    content = <TojeongPage savedBirth={birthProfile} onSave={saveBirthProfile} onBack={goHome} />
  } else if (page === 'today') {
    content = <DayFortunePage dayOffset={0} savedBirth={birthProfile} onSave={saveBirthProfile} onBack={goHome} />
  } else if (page === 'gunghab') {
    content = <GunghabPage savedBirth={birthProfile} onSave={saveBirthProfile} onBack={goHome} />
  } else if (page === 'deepsaju') {
    content = <DeepSajuPage savedBirth={birthProfile} onSave={saveBirthProfile} onBack={goHome} />
  } else if (page === 'saju') {
    content = (
      <SajuPage
        savedBirth={birthProfile}
        onBack={goHome}
        onSave={saveBirthProfile}
        onDeepSaju={() => { setPage('deepsaju'); window.scrollTo(0, 0) }}
      />
    )
  } else if (page === 'daun') {
    content = <DaunPage savedBirth={birthProfile} onSave={saveBirthProfile} onBack={goHome} />
  } else if (page === 'dream') {
    content = <DreamPage onBack={goHome} />
  } else if (page === 'outfit') {
    content = <OutfitPage savedBirth={birthProfile} onSave={saveBirthProfile} onBack={goHome} />
  } else if (page === 'job') {
    content = <JobPage savedBirth={birthProfile} onSave={saveBirthProfile} onBack={goHome} />
  } else {
    content = <LoadingScreen onComplete={() => { setPage('home'); window.scrollTo(0, 0) }} />
  }

  return <Suspense fallback={<PageFallback />}>{content}</Suspense>
}
