import { useEffect, useState } from 'react'
import type { UserInfo } from '../types'
import { decodeIdToken } from '../utils/cloudSync'

interface Props {
  onLogin: (user: UserInfo) => void
  onGuest: () => void
  onShowPrivacy: () => void
  onShowTerms: () => void
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const KAKAO_KEY  = import.meta.env.VITE_KAKAO_REST_KEY as string | undefined

// 카카오 로그인은 인가 코드 받기(리다이렉트) → /api/kakao-token(서버) 에서 토큰 교환 방식을 쓴다.
// (JS SDK의 Kakao.Auth.login은 v2에서 제거됨 — Kakao.Auth.authorize 리다이렉트 흐름으로 대체됨)
function kakaoRedirectUri(): string {
  return `${window.location.origin}/`
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(cfg: {
            client_id: string
            callback: (r: { credential: string }) => void
            use_fedcm_for_prompt?: boolean
          }): void
          renderButton(el: HTMLElement, opts: object): void
        }
      }
    }
  }
}

export default function LoginPage({ onLogin, onGuest, onShowPrivacy, onShowTerms }: Props) {
  // 카카오 리다이렉트(?code=…)로 돌아온 직후엔 토큰 교환을 처리하는 동안 "로그인 중…"을 보여준다.
  const [processingKakao, setProcessingKakao] = useState<boolean>(
    () => !!KAKAO_KEY && new URLSearchParams(window.location.search).has('code')
  )

  useEffect(() => {
    if (!CLIENT_ID) return

    const init = () => {
      if (!window.google) return
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: ({ credential }) => {
          const payload = decodeIdToken(credential)
          if (!payload) { console.error('구글 로그인 토큰 처리 실패'); return }
          onLogin({ name: payload.name, email: payload.email, picture: payload.picture, idToken: credential, provider: 'google' })
        },
      })
      const el = document.getElementById('g-signin')
      if (el) {
        window.google.accounts.id.renderButton(el, {
          theme: 'outline', size: 'large', text: 'signin_with', locale: 'ko', width: 280,
        })
      }
    }

    if (window.google) {
      init()
    } else {
      const t = setInterval(() => { if (window.google) { clearInterval(t); init() } }, 100)
      return () => clearInterval(t)
    }
  }, [])

  // 카카오 로그인 리다이렉트로 돌아왔을 때(?code=...) 인가 코드를 서버에서 토큰으로 교환한다.
  useEffect(() => {
    if (!KAKAO_KEY) return
    const code = new URLSearchParams(window.location.search).get('code')
    if (!code) return
    window.history.replaceState({}, '', window.location.pathname)

    fetch('/api/kakao-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirectUri: kakaoRedirectUri() }),
    })
      .then(res => {
        if (!res.ok) throw new Error(`카카오 토큰 교환 실패: ${res.status}`)
        return res.json() as Promise<{ accessToken: string; name: string; email: string; picture: string | null }>
      })
      .then(data => {
        onLogin({ name: data.name, email: data.email, picture: data.picture ?? undefined, idToken: data.accessToken, provider: 'kakao' })
      })
      .catch(err => { console.error('카카오 로그인 처리 실패:', err); setProcessingKakao(false) })
  }, [])

  function handleKakaoLogin() {
    if (!KAKAO_KEY) return
    const params = new URLSearchParams({
      client_id: KAKAO_KEY,
      redirect_uri: kakaoRedirectUri(),
      response_type: 'code',
    })
    window.location.href = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`
  }

  return (
    <div className="min-h-screen relative overflow-hidden isolate flex flex-col items-center justify-center px-6">

      {/* ── 전역 별자리 배경 (앱 내부와 통일) ── */}
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: "url('/app-bg.png')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 -z-10 bg-[#0D0A1A]/45 pointer-events-none" aria-hidden="true" />

      {/* ── 로고 영역 ── */}
      <div className="flex flex-col items-center mb-9 relative">

        {/* 장식 링 */}
        <div className="relative flex items-center justify-center mb-5" style={{ width: 200, height: 200 }}>
          {/* 가장 바깥 링 */}
          <div className="absolute rounded-full border border-[#C9962A]/20"
            style={{ width: 196, height: 196 }} />
          {/* 중간 링 */}
          <div className="absolute rounded-full border border-[#C9962A]/15"
            style={{ width: 152, height: 152 }} />
          {/* 글로우 */}
          <div className="absolute w-32 h-32 rounded-full bg-[#C9962A]/10 blur-2xl" />

          {/* 링 위 오행 레이블 */}
          <span className="absolute text-[11px] font-bold" style={{ color: '#86EFAC', top: 4,   left: '50%', transform: 'translateX(-50%)' }}>木</span>
          <span className="absolute text-[11px] font-bold" style={{ color: '#FCA5A5', right: 4,  top: '50%',  transform: 'translateY(-50%)' }}>火</span>
          <span className="absolute text-[11px] font-bold" style={{ color: '#FCD34D', bottom: 4, left: '50%', transform: 'translateX(-50%)' }}>土</span>
          <span className="absolute text-[11px] font-bold" style={{ color: '#93C5FD', left: 4,   top: '50%',  transform: 'translateY(-50%)' }}>水</span>

          {/* 로고 — 스플래시처럼 회전 + 오행 색이 서서히 변함 */}
          <div className="relative w-[100px] h-[100px] rounded-full p-[3px] animate-spin-glow">
            <div className="w-full h-full rounded-full bg-[#0D0A1A] flex items-center justify-center">
              <span className="text-5xl" style={{ color: '#C9962A', fontFamily: 'serif' }}>☯</span>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-[#F5EDD4] mb-1"
          style={{ fontFamily: "'Gowun Batang', serif" }}>운명봄</h1>
        <p className="text-sm text-[#7B6F9A]">당신의 운명을 봅니다</p>
      </div>

      {processingKakao ? (
        <div className="w-full max-w-sm flex flex-col items-center py-12">
          <div className="w-10 h-10 rounded-full border-[3px] border-[#2A1F4A] border-t-[#C9962A] animate-spin" style={{ animationDuration: '0.8s' }} />
          <p className="mt-4 text-sm font-semibold text-[#C4B8D8]">카카오 로그인 중…</p>
          <p className="mt-1 text-xs text-[#7B6F9A]">잠시만 기다려주세요</p>
        </div>
      ) : (
      <>
      {/* ── 로그인 카드 ── */}
      <div className="w-full max-w-sm bg-[#130E24] rounded-3xl shadow-[0_4px_24px_rgba(201,150,42,0.12)] border border-[#2A1F4A] p-7">
        <h2 className="text-base font-bold text-[#F5EDD4] mb-1 text-center">로그인</h2>
        <p className="text-xs text-[#7B6F9A] mb-6 text-center">간편하게 로그인하고 운세를 확인하세요</p>

        {(CLIENT_ID || KAKAO_KEY) ? (
          <div className="space-y-3">
            {KAKAO_KEY && (
              <button
                onClick={handleKakaoLogin}
                className="w-full flex items-center justify-center gap-2 bg-[#FEE500] text-[#191919] font-semibold text-sm py-3 rounded-xl active:scale-[0.98] transition-transform"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="13" rx="6.5" fill="#191919" />
                  <path d="M8 17l-1 4 4.5-3.2z" fill="#191919" />
                </svg>
                카카오로 로그인
              </button>
            )}

            {CLIENT_ID && KAKAO_KEY && (
              <div className="flex items-center gap-2 text-[#4A4060] text-xs">
                <div className="flex-1 h-px bg-[#2A1F4A]" />
                <span>또는</span>
                <div className="flex-1 h-px bg-[#2A1F4A]" />
              </div>
            )}

            {CLIENT_ID && (
              <div className="flex justify-center">
                <div id="g-signin" />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div className="text-xs text-amber-300 bg-amber-900/20 border border-amber-700/40 rounded-2xl p-3 leading-relaxed">
              <p className="font-semibold mb-1">⚙️ 로그인 설정 필요</p>
              <p>GitHub 저장소 Settings → Secrets에서<br /><code className="bg-amber-900/40 px-1 rounded">VITE_GOOGLE_CLIENT_ID</code> 또는 <code className="bg-amber-900/40 px-1 rounded">VITE_KAKAO_JS_KEY</code> 를 추가하세요</p>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onGuest}
        className="mt-4 w-full max-w-xs mx-auto block py-3 rounded-2xl border border-[#2A1F4A] text-sm font-semibold text-[#C4B8D8] hover:border-[#C9962A60] hover:text-[#F5EDD4] active:scale-[0.98] transition"
      >
        로그인 없이 둘러보기 →
      </button>
      <p className="mt-2 text-[11px] text-[#4A4060] text-center">출석·포인트 저장, 사주매칭은 로그인 후 이용할 수 있어요</p>
      </>
      )}

      <p className="mt-6 text-xs text-[#4A4060] text-center">본 서비스는 참고용이며 정확성을 보장하지 않습니다</p>
      <p className="mt-2 text-xs text-[#4A4060] text-center">
        <button onClick={onShowPrivacy} className="underline hover:text-[#7B6F9A] transition">개인정보처리방침</button>
        <span className="mx-2">·</span>
        <button onClick={onShowTerms} className="underline hover:text-[#7B6F9A] transition">이용약관</button>
      </p>
    </div>
  )
}
