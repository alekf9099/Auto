import { useState, useEffect } from 'react'
import type { BirthInput, UserInfo } from './types'
import { loadPoints, awardPoints } from './utils/points'
import type { PointsState } from './utils/points'
import LoginPage        from './components/LoginPage'
import ProfileSetupPage from './components/ProfileSetupPage'
import SplashScreen     from './components/SplashScreen'
import HomePage         from './components/HomePage'
import AttendancePage   from './components/AttendancePage'
import SinnyeonPage     from './components/SinnyeonPage'
import TojeongPage      from './components/TojeongPage'
import DayFortunePage   from './components/DayFortunePage'
import GunghabPage      from './components/GunghabPage'
import DeepSajuPage     from './components/DeepSajuPage'
import SajuPage         from './components/SajuPage'
import DaunPage         from './components/DaunPage'
import DreamPage        from './components/DreamPage'
import OutfitPage       from './components/OutfitPage'
import JobPage          from './components/JobPage'
import LuckyTimerPage   from './components/LuckyTimerPage'
import LoadingScreen    from './components/LoadingScreen'

const STORAGE_KEY = 'unmyeongbom_birth'

type Page = 'splash' | 'login' | 'profile' | 'analyzing' | 'home' | 'attendance' | 'sinnyeon' | 'tojeong' | 'today' | 'gunghab' | 'deepsaju' | 'saju' | 'daun' | 'dream' | 'outfit' | 'job' | 'lucky'

function loadBirthProfile(): BirthInput | null {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    return s ? (JSON.parse(s) as BirthInput) : null
  } catch { return null }
}

export default function App() {
  const [page,         setPage]         = useState<Page>('splash')
  const [user,         setUser]         = useState<UserInfo | null>(null)
  const [birthProfile, setBirthProfile] = useState<BirthInput | null>(loadBirthProfile)
  const [points,       setPoints]       = useState<PointsState>(loadPoints)

  useEffect(() => {
    const BACK_MAP: Partial<Record<Page, Page>> = {
      profile: 'login', analyzing: 'home', attendance: 'home',
      sinnyeon: 'home', tojeong: 'home', today: 'home',
      gunghab: 'home', deepsaju: 'home', saju: 'home', daun: 'home', dream: 'home', outfit: 'home', job: 'home', lucky: 'home',
    }
    const navigable: Page[] = ['attendance','sinnyeon','tojeong','today','gunghab','deepsaju','saju','daun','dream','outfit','job','lucky','profile','analyzing']
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
  }

  function goHome() { setPoints(loadPoints()); setPage('home'); window.scrollTo(0, 0) }

  function handleLogin(u: UserInfo) {
    setUser(u)
    setPage(loadBirthProfile() ? 'home' : 'profile')
    window.scrollTo(0, 0)
  }

  function handleProfileSave(b: BirthInput) {
    saveBirthProfile(b)
    const cur = loadPoints()
    if (cur.history.length === 0) {
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

  if (page === 'splash') return <SplashScreen onDone={() => setPage('login')} />
  if (page === 'login')  return <LoginPage onLogin={handleLogin} />
  if (page === 'profile' && user) return <ProfileSetupPage user={user} onSave={handleProfileSave} />
  if (page === 'analyzing') return <LoadingScreen onComplete={() => { setPage('home'); window.scrollTo(0, 0) }} />

  if (page === 'home' && user) {
    return (
      <HomePage
        user={user}
        birthProfile={birthProfile}
        points={points}
        onPointsUpdate={setPoints}
        onNavigate={handleHomeNavigate}
        onAttendance={() => { setPage('attendance'); window.scrollTo(0, 0) }}
        onLuckyTimer={() => { setPage('lucky'); window.scrollTo(0, 0) }}
        onEditProfile={() => { setPage('profile'); window.scrollTo(0, 0) }}
        onLogout={() => { setUser(null); setPage('login'); window.scrollTo(0, 0) }}
      />
    )
  }

  if (page === 'attendance') return <AttendancePage onBack={goHome} onPointsUpdate={p => { setPoints(p) }} />
  if (page === 'lucky')      return <LuckyTimerPage onBack={goHome} onPointsUpdate={p => { setPoints(p) }} />
  if (page === 'sinnyeon')   return <SinnyeonPage savedBirth={birthProfile} onSave={saveBirthProfile} onBack={goHome} />
  if (page === 'tojeong')    return <TojeongPage  savedBirth={birthProfile} onSave={saveBirthProfile} onBack={goHome} />
  if (page === 'today')      return <DayFortunePage dayOffset={0} savedBirth={birthProfile} onSave={saveBirthProfile} onBack={goHome} />
  if (page === 'gunghab')    return <GunghabPage  savedBirth={birthProfile} onSave={saveBirthProfile} onBack={goHome} />
  if (page === 'deepsaju')   return <DeepSajuPage savedBirth={birthProfile} onSave={saveBirthProfile} onBack={goHome} />
  if (page === 'saju') return (
    <SajuPage
      savedBirth={birthProfile}
      onBack={goHome}
      onSave={saveBirthProfile}
      onDeepSaju={() => { setPage('deepsaju'); window.scrollTo(0, 0) }}
    />
  )
  if (page === 'daun')  return <DaunPage  savedBirth={birthProfile} onSave={saveBirthProfile} onBack={goHome} />
  if (page === 'dream')  return <DreamPage onBack={goHome} />
  if (page === 'outfit') return <OutfitPage savedBirth={birthProfile} onSave={saveBirthProfile} onBack={goHome} />
  if (page === 'job')    return <JobPage savedBirth={birthProfile} onSave={saveBirthProfile} onBack={goHome} />

  return <LoadingScreen onComplete={() => { setPage('home'); window.scrollTo(0, 0) }} />
}
