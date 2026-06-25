import { useState, useEffect, lazy, Suspense } from 'react'
import type { BirthInput, UserInfo } from './types'
import { loadPoints, awardPoints } from './utils/points'
import type { PointsState } from './utils/points'
import { setCurrentEmail, setIdToken, getIdToken, getCurrentEmail, getCurrentName, setCurrentName, getCurrentPicture, setCurrentPicture, getProvider, setProvider, pullCloudData, scheduleCloudPush, onSyncStatusChange, deleteCloudAccount, clearAllLocalData } from './utils/cloudSync'
import { fetchRemoteConfig, isNoticeDismissed, dismissNotice } from './utils/remoteConfig'
import { loadNickname, saveNickname } from './utils/nickname'
import { isGuestUsed, markGuestUsed, registerGuestPrompt } from './utils/guestGate'
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

// 로그인 없이 둘러보는 게스트 사용자. 인증 토큰이 없어 클라우드 동기화/서버 기능은 자동으로 비활성화된다.
const GUEST_USER: UserInfo = { name: '게스트', email: '', idToken: '', provider: 'guest' }

// 새로고침/재방문 시 localStorage에 남은 인증 토큰으로 로그인 화면 없이 세션을 복원한다.
// 토큰이 실제로 만료됐다면 이후 클라우드 동기화 호출에서 401을 받아 SyncErrorBanner로 재로그인을 유도한다.
function restoreUser(): UserInfo | null {
  if (getProvider() === 'guest') return GUEST_USER
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting,     setDeleting]     = useState(false)
  const [deleteError,  setDeleteError]  = useState(false)
  const [loginPrompt,  setLoginPrompt]  = useState<string | null>(null)

  const isGuest = user?.provider === 'guest'

  useEffect(() => onSyncStatusChange(status => setSyncIssue(status === 'ok' ? null : status)), [])

  // 개별 분석 페이지의 "다시 하기"가 게스트일 때 로그인 모달을 띄울 수 있도록 핸들러를 등록한다.
  useEffect(() => registerGuestPrompt(msg => setLoginPrompt(msg)), [])

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
    // 로컬에 남은 개인 데이터(생년월일·닉네임·포인트 등)까지 모두 비워, 같은 기기에서
    // 다음 사용자(게스트 또는 다른 계정)에게 이전 정보가 새지 않도록 한다.
    clearAllLocalData()
    setUser(null)
    setBirthProfile(null)
    setNickname('')
    setPoints(loadPoints())
    setSyncIssue(null)
    setPage('login')
    window.scrollTo(0, 0)
  }

  // 회원 탈퇴: 서버 데이터 삭제 → 로컬 데이터 전체 삭제 → 로그아웃. (Google Play 계정 삭제 정책)
  async function handleDeleteAccount() {
    setDeleting(true)
    const ok = await deleteCloudAccount()
    if (!ok) {
      setDeleting(false)
      setDeleteError(true)
      return
    }
    trackEvent('account_delete')
    localStorage.clear()
    setBirthProfile(null)
    setNickname('')
    setPoints(loadPoints())
    setShowDeleteConfirm(false)
    setDeleting(false)
    handleLogout()
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

  // 로그인 없이 둘러보기. 게스트는 익명으로 시작하므로 이전 계정/세션 데이터를 모두 비운다.
  function handleGuest() {
    clearAllLocalData()
    setProvider('guest')
    setUser(GUEST_USER)
    setBirthProfile(null)
    setNickname('')
    setPoints(loadPoints())
    setIsNewCloudUser(true)
    trackEvent('guest_start')
    setPage('profile')
    window.scrollTo(0, 0)
  }

  // 게스트가 로그인이 필요한 기능을 누르거나 상단 "로그인"을 누르면 로그인 화면으로.
  // (로컬 데이터는 유지되며, 로그인 시 클라우드로 업로드된다.)
  function handleRequestLogin() {
    setLoginPrompt(null)
    setPage('login')
    window.scrollTo(0, 0)
  }

  function handleProfileSave(b: BirthInput, nick: string) {
    saveNickname(nick)
    setNickname(nick)
    saveBirthProfile(b)
    const cur = loadPoints()
    // 게스트는 포인트가 없으므로 가입 보너스도 지급하지 않는다.
    if (!isGuest && isNewCloudUser && cur.history.length === 0) {
      setPoints(awardPoints(cur, 100, '가입 보너스 🎉'))
      trackEvent('sign_up')
    }
    setPage('analyzing')
    window.scrollTo(0, 0)
  }

  function handleHomeNavigate(dest: 'saju' | 'sinnyeon' | 'tojeong' | 'today' | 'daun' | 'gunghab' | 'deepsaju' | 'dream' | 'tarot' | 'outfit' | 'job' | 'battle' | 'match') {
    // 사주매칭은 서버(익명 풀)가 필요해 게스트는 사용할 수 없다.
    if (isGuest && dest === 'match') { setLoginPrompt('사주매칭은 로그인이 필요해요.'); return }
    if (!birthProfile) { setPage('profile'); window.scrollTo(0, 0); return }
    // 게스트는 각 분석을 1회만 볼 수 있다.
    if (isGuest) {
      if (isGuestUsed(dest)) { setLoginPrompt('게스트는 각 분석을 1회만 볼 수 있어요.'); return }
      markGuestUsed(dest)
    }
    setPage(dest)
    window.scrollTo(0, 0)
  }

  function handleTabNavigate(tab: NavTab) {
    if (tab === 'home') { goHome(); return }
    if (tab === 'saju') { handleHomeNavigate('saju'); return }
    // 출석·이벤트는 포인트 기반이라 게스트는 로그인 후 이용한다.
    if (isGuest && (tab === 'attendance' || tab === 'event')) {
      setLoginPrompt('출석·이벤트는 로그인 후 이용할 수 있어요.')
      return
    }
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
        onGuest={handleGuest}
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
        onDeleteAccount={() => { setDeleteError(false); setShowDeleteConfirm(true) }}
        isGuest={isGuest}
        onRequestLogin={handleRequestLogin}
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
        onOpenInvite={() => { if (isGuest) { setLoginPrompt('친구 초대는 로그인이 필요해요.'); return } setPage('invite'); window.scrollTo(0, 0) }}
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
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: "url('/app-bg.png')" }}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-0 bg-[#0D0A1A]/40 pointer-events-none" aria-hidden="true" />

      {/* 콘텐츠 — 항상 배경 위에 */}
      <div className="relative z-10">
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
      </div>

      {/* 게스트 — 로그인 필요 안내 모달 */}
      {loginPrompt && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm" onClick={() => setLoginPrompt(null)}>
          <div className="w-full max-w-sm rounded-3xl bg-[#130E24] border border-[#2A1F4A] p-6 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
            <p className="text-2xl mb-2">🔒</p>
            <h2 className="text-lg font-bold text-[#F5EDD4] mb-1" style={{ fontFamily: "'Gowun Batang', serif" }}>로그인이 필요해요</h2>
            <p className="text-sm text-[#A89BC0] leading-relaxed mb-5">{loginPrompt}<br/>로그인하면 데이터도 안전하게 저장돼요.</p>
            <div className="flex gap-2">
              <button onClick={() => setLoginPrompt(null)} className="flex-1 py-3 rounded-2xl bg-[#1C1438] border border-[#2A1F4A] text-sm font-semibold text-[#C4B8D8] active:scale-[0.98] transition">나중에</button>
              <button onClick={handleRequestLogin} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#C9962A] to-[#E8B84B] text-sm font-bold text-[#0D0A1A] active:scale-[0.98] transition">로그인</button>
            </div>
          </div>
        </div>
      )}

      {/* 회원 탈퇴 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm" onClick={() => !deleting && setShowDeleteConfirm(false)}>
          <div
            className="w-full max-w-sm rounded-3xl bg-[#130E24] border border-[#2A1F4A] p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-[#F5EDD4] mb-2" style={{ fontFamily: "'Gowun Batang', serif" }}>회원 탈퇴</h2>
            <p className="text-sm text-[#A89BC0] leading-relaxed mb-1">
              탈퇴하면 <span className="text-[#E05252] font-semibold">계정과 모든 데이터가 영구 삭제</span>됩니다.
            </p>
            <ul className="text-xs text-[#7B6F9A] leading-relaxed mb-4 list-disc pl-4">
              <li>사주·프로필·닉네임 정보</li>
              <li>보유 포인트 {points.balance.toLocaleString()}P 및 적립 내역</li>
              <li>사주매칭·친구초대 기록</li>
            </ul>
            <p className="text-xs text-[#7B6F9A] mb-4">삭제된 데이터는 복구할 수 없습니다.</p>
            {deleteError && (
              <p className="text-xs text-[#E05252] mb-3">삭제 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 py-3 rounded-2xl bg-[#1C1438] border border-[#2A1F4A] text-sm font-semibold text-[#C4B8D8] active:scale-[0.98] transition disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#E05252] to-[#FF7A7A] text-sm font-bold text-white active:scale-[0.98] transition disabled:opacity-60"
              >
                {deleting ? '삭제 중…' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
