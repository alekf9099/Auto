import { useState, useEffect, lazy, Suspense } from 'react'
import type { BirthInput, UserInfo } from './types'
import { loadPoints, awardPoints } from './utils/points'
import type { PointsState } from './utils/points'
import { setCurrentEmail, setIdToken, getIdToken, getCurrentEmail, getCurrentName, setCurrentName, getCurrentPicture, setCurrentPicture, getProvider, setProvider, pullCloudData, scheduleCloudPush, onSyncStatusChange } from './utils/cloudSync'
import { fetchRemoteConfig, isNoticeDismissed, dismissNotice } from './utils/remoteConfig'
import { loadNickname, saveNickname } from './utils/nickname'
import { trackPageView, trackEvent } from './utils/analytics'
import LoginPage        from './components/LoginPage'
import SplashScreen     from './components/SplashScreen'
import LoadingScreen    from './components/LoadingScreen'
import SyncErrorBanner  from './components/SyncErrorBanner'
import NoticeBanner     from './components/NoticeBanner'
import BottomNav from './components/BottomNav'
import type { NavTab } from './components/BottomNav'

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
const TarotPage        = lazy(() => import('./components/TarotPage'))
const OutfitPage       = lazy(() => import('./components/OutfitPage'))
const JobPage          = lazy(() => import('./components/JobPage'))
const FortuneBattlePage = lazy(() => import('./components/FortuneBattlePage'))
const MatchPage         = lazy(() => import('./components/MatchPage'))
const LuckyTimerPage   = lazy(() => import('./components/LuckyTimerPage'))
const RoulettePage      = lazy(() => import('./components/RoulettePage'))
const EventPage         = lazy(() => import('./components/EventPage'))
const InvitePage        = lazy(() => import('./components/InvitePage'))
const PrivacyPolicyPage = lazy(() => import('./components/PrivacyPolicyPage'))
const TermsPage         = lazy(() => import('./components/TermsPage'))

const STORAGE_KEY = 'unmyeongbom_birth'

type Page = 'splash' | 'login' | 'profile' | 'analyzing' | 'home' | 'attendance' | 'sinnyeon' | 'tojeong' | 'today' | 'gunghab' | 'deepsaju' | 'saju' | 'daun' | 'dream' | 'tarot' | 'outfit' | 'job' | 'battle' | 'match' | 'lucky' | 'roulette' | 'invite' | 'event' | 'privacy' | 'terms'

const TAB_PAGES: Page[] = ['home', 'saju', 'attendance', 'event']

function loadBirthProfile(): BirthInput | null {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    return s ? (JSON.parse(s) as BirthInput) : null
  } catch { return null }
}

// 새로고침/재방문 시 localStorage에 남은 인증 토큰으로 로그인 화면 없이 세션을 복원한다.
// 토큰이 실제로 만료됐다면 이후 클라우드 동기화 호출에서 401을 받아 SyncErrorBanner로 재로그인을 유도한다.
function restoreUser(): UserInfo | null {
  const token = getIdToken()
  const email = getCurrentEmail()
  const name = getCurrentName()
  const provider = getProvider()
  if (!token || !email || !name || !provider) return null
  return { name, email, picture: getCurrentPicture() ?? undefined, idToken: token, provider }
}

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div
        className="w-10 h-10 rounded-full border-[3px] border-[#2A1F4A] border-t-[#C9962A] animate-spin"
        style={{ animationDuration: '0.8s' }}
      />
    </div>
  )
}

export default function App() {
  const [page,         setPage]         = useState<Page>('splash')
  const [user,         setUser]         = useState<UserInfo | null>(restoreUser)
  const [birthProfile, setBirthProfile] = useState<BirthInput | null>(loadBirthProfile)
  const [nickname,     setNickname]     = useState<string>(loadNickname)
  const [points,       setPoints]       = useState<PointsState>(loadPoints)
  const [isNewCloudUser, setIsNewCloudUser] = useState(true)
  const [legalReturn,  setLegalReturn]  = useState<Page>('login')
  const [syncIssue,    setSyncIssue]    = useState<'error' | 'expired' | null>(null)
  const [notice,       setNotice]       = useState<{ id: string; message: string } | null>(null)

  useEffect(() => onSyncStatusChange(status => setSyncIssue(status === 'ok' ? null : status)), [])

  // 배포 없이 공지/점검 메시지를 띄울 수 있도록 원격 설정을 한 번 가져온다 (실패해도 무시).
  useEffect(() => {
    fetchRemoteConfig().then(cfg => {
      if (cfg.notice && !isNoticeDismissed(cfg.notice.id)) setNotice(cfg.notice)
    })
  }, [])

  // 세션이 복원된 경우, 백그라운드에서 클라우드 데이터를 한 번 받아온다 (토큰 만료 시 위 리스너가 안내 배너를 띄운다)
  useEffect(() => {
    if (!user) return
    pullCloudData().then(() => {
      setBirthProfile(loadBirthProfile())
      setNickname(loadNickname())
      setPoints(loadPoints())
    })
  }, [])

  useEffect(() => {
    const BACK_MAP: Partial<Record<Page, Page>> = {
      profile: 'login', analyzing: 'home', attendance: 'home',
      sinnyeon: 'home', tojeong: 'home', today: 'home',
      gunghab: 'home', deepsaju: 'home', saju: 'home', daun: 'home', dream: 'home', tarot: 'home', outfit: 'home', job: 'home', battle: 'home', match: 'home', lucky: 'home', roulette: 'home', invite: 'home', event: 'home',
      privacy: legalReturn, terms: legalReturn,
    }
    const navigable: Page[] = ['attendance','sinnyeon','tojeong','today','gunghab','deepsaju','saju','daun','dream','tarot','outfit','job','battle','match','lucky','roulette','invite','event','profile','analyzing','privacy','terms']
    if (navigable.includes(page)) history.pushState({ page }, '')

    function onPop() {
      history.pushState(null, '')
      setPage(prev => BACK_MAP[prev] ?? 'home')
      window.scrollTo(0, 0)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [page])

  useEffect(() => { trackPageView(`/${page}`) }, [page])

  function saveBirthProfile(b: BirthInput) {
    setBirthProfile(b)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(b))
    scheduleCloudPush()
  }

  function goHome() { setPoints(loadPoints()); setPage('home'); window.scrollTo(0, 0) }

  function handleLogout() {
    setCurrentEmail(null)
    setIdToken(null)
    setCurrentName(null)
    setCurrentPicture(null)
    setProvider(null)
    setUser(null)
    setSyncIssue(null)
    setPage('login')
    window.scrollTo(0, 0)
  }

  async function handleLogin(u: UserInfo) {
    setUser(u)
    setCurrentEmail(u.email)
    setIdToken(u.idToken)
    setCurrentName(u.name)
    setCurrentPicture(u.picture ?? null)
    setProvider(u.provider)
    trackEvent('login')
    const { isNewUser } = await pullCloudData()
    setIsNewCloudUser(isNewUser)
    setBirthProfile(loadBirthProfile())
    setNickname(loadNickname())
    setPoints(loadPoints())
    setPage(loadBirthProfile() ? 'home' : 'profile')
    window.scrollTo(0, 0)
  }

  function handleProfileSave(b: BirthInput, nick: string) {
    saveNickname(nick)
    setNickname(nick)
    saveBirthProfile(b)
    const cur = loadPoints()
    if (isNewCloudUser && cur.history.length === 0) {
      setPoints(awardPoints(cur, 100, '가입 보너스 🎉'))
      trackEvent('sign_up')
    }
    setPage('analyzing')
    window.scrollTo(0, 0)
  }

  function handleHomeNavigate(dest: 'saju' | 'sinnyeon' | 'tojeong' | 'today' | 'daun' | 'gunghab' | 'deepsaju' | 'dream' | 'tarot' | 'outfit' | 'job' | 'battle' | 'match') {
    if (!birthProfile) { setPage('profile'); window.scrollTo(0, 0); return }
    setPage(dest)
    window.scrollTo(0, 0)
  }

  function handleTabNavigate(tab: NavTab) {
    if (tab === 'home') { goHome(); return }
    if (tab === 'saju') { handleHomeNavigate('saju'); return }
    setPage(tab)
    window.scrollTo(0, 0)
  }

  function openLegal(type: 'privacy' | 'terms', from: Page) {
    setLegalReturn(from)
    setPage(type)
    window.scrollTo(0, 0)
  }

  if (page === 'splash') return <SplashScreen onDone={() => setPage(user ? (birthProfile ? 'home' : 'profile') : 'login')} />
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
    content = <ProfileSetupPage user={user} savedNickname={nickname} savedBirth={birthProfile} onSave={handleProfileSave} />
  } else if (page === 'analyzing') {
    content = <LoadingScreen onComplete={() => { setPage('home'); window.scrollTo(0, 0) }} />
  } else if (page === 'home' && user) {
    content = (
      <HomePage
        user={user}
        nickname={nickname}
        birthProfile={birthProfile}
        points={points}
        onPointsUpdate={setPoints}
        onNavigate={handleHomeNavigate}
        onAttendance={() => { setPage('attendance'); window.scrollTo(0, 0) }}
        onLuckyTimer={() => { setPage('lucky'); window.scrollTo(0, 0) }}
        onEditProfile={() => { setPage('profile'); window.scrollTo(0, 0) }}
        onLogout={handleLogout}
        onShowPrivacy={() => openLegal('privacy', 'home')}
        onShowTerms={() => openLegal('terms', 'home')}
      />
    )
  } else if (page === 'attendance') {
    content = <AttendancePage onBack={goHome} onPointsUpdate={p => { setPoints(p) }} />
  } else if (page === 'event') {
    content = (
      <EventPage
        onBack={goHome}
        onOpenLucky={() => { setPage('lucky'); window.scrollTo(0, 0) }}
        onOpenRoulette={() => { setPage('roulette'); window.scrollTo(0, 0) }}
        onOpenInvite={() => { setPage('invite'); window.scrollTo(0, 0) }}
      />
    )
  } else if (page === 'lucky') {
    content = <LuckyTimerPage onBack={() => { setPage('event'); window.scrollTo(0, 0) }} onPointsUpdate={p => { setPoints(p) }} />
  } else if (page === 'roulette') {
    content = <RoulettePage onBack={() => { setPage('event'); window.scrollTo(0, 0) }} onPointsUpdate={p => { setPoints(p) }} />
  } else if (page === 'invite') {
    content = <InvitePage onBack={() => { setPage('event'); window.scrollTo(0, 0) }} onPointsUpdate={p => { setPoints(p) }} />
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
        onDaun={() => { setPage('daun'); window.scrollTo(0, 0) }}
        onGunghab={() => { setPage('gunghab'); window.scrollTo(0, 0) }}
      />
    )
  } else if (page === 'daun') {
    content = <DaunPage savedBirth={birthProfile} onSave={saveBirthProfile} onBack={goHome} />
  } else if (page === 'dream') {
    content = <DreamPage onBack={goHome} />
  } else if (page === 'tarot') {
    content = <TarotPage onBack={goHome} />
  } else if (page === 'outfit') {
    content = <OutfitPage savedBirth={birthProfile} onSave={saveBirthProfile} onBack={goHome} />
  } else if (page === 'job') {
    content = <JobPage savedBirth={birthProfile} onSave={saveBirthProfile} onBack={goHome} />
  } else if (page === 'battle') {
    content = <FortuneBattlePage savedBirth={birthProfile} onSave={saveBirthProfile} onBack={goHome} />
  } else if (page === 'match' && birthProfile) {
    content = <MatchPage nickname={nickname} birthProfile={birthProfile} onBack={goHome} />
  } else {
    content = <LoadingScreen onComplete={() => { setPage('home'); window.scrollTo(0, 0) }} />
  }

  const showNav = TAB_PAGES.includes(page)

  return (
    <>
      {/* 전역 배경 — 별자리 디자인 이미지 + 가독성 오버레이 (모든 화면 공통) */}
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: "url('/app-bg.png')" }}
        aria-hidden="true"
      />
      <div className="fixed inset-0 -z-10 bg-[#0D0A1A]/55 pointer-events-none" aria-hidden="true" />

      {(syncIssue || notice) && (
        <div className="relative z-[60] flex flex-col">
          {syncIssue && (
            <SyncErrorBanner
              expired={syncIssue === 'expired'}
              onDismiss={() => setSyncIssue(null)}
              onRelogin={handleLogout}
            />
          )}
          {notice && (
            <NoticeBanner
              message={notice.message}
              onDismiss={() => { dismissNotice(notice.id); setNotice(null) }}
            />
          )}
        </div>
      )}
      <Suspense fallback={<PageFallback />}>
        <div className={showNav ? 'pb-16' : ''}>{content}</div>
      </Suspense>
      {showNav && <BottomNav current={page as NavTab} onNavigate={handleTabNavigate} />}
    </>
  )
}
