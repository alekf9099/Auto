import { useEffect } from 'react'
import type { UserInfo } from '../types'

interface Props {
  onLogin: (user: UserInfo) => void
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

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

export default function LoginPage({ onLogin }: Props) {
  useEffect(() => {
    if (!CLIENT_ID) return

    const init = () => {
      if (!window.google) return
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: ({ credential }) => {
          // base64url → UTF-8 (한글 등 멀티바이트 문자 처리)
          const b64 = credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
          const json = decodeURIComponent(
            atob(b64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
          )
          const payload = JSON.parse(json)
          onLogin({ name: payload.name, email: payload.email, picture: payload.picture })
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

  return (
    <div className="min-h-screen bg-[#F4F2FF] flex flex-col items-center justify-center px-6">
      <div className="mb-8 flex flex-col items-center">
        <div className="relative flex items-center justify-center mb-5">
          {/* 글로우 */}
          <div className="absolute w-28 h-28 rounded-full bg-violet-200/50 blur-2xl" />
          {/* 그라데이션 링 */}
          <div className="relative w-[72px] h-[72px] rounded-full p-[2.5px]"
            style={{ background: 'linear-gradient(135deg, #A78BFA, #7C3AED)' }}>
            <div className="w-full h-full rounded-full bg-[#F4F2FF] flex items-center justify-center">
              <span className="text-3xl" style={{ color: '#7C3AED', fontFamily: 'serif' }}>☯</span>
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: "'Noto Serif KR', serif" }}>운명봄</h1>
        <p className="text-sm text-stone-400 mt-1">당신의 운명을 봅니다</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-[0_4px_24px_rgba(124,58,237,0.12)] border border-violet-100 p-7">
        <h2 className="text-base font-bold text-stone-800 mb-1 text-center">로그인</h2>
        <p className="text-xs text-stone-400 mb-6 text-center">구글 계정으로 운세를 확인하세요</p>

        {CLIENT_ID ? (
          <div className="flex justify-center">
            <div id="g-signin" />
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl p-3 leading-relaxed">
              <p className="font-semibold mb-1">⚙️ Google 로그인 설정 필요</p>
              <p>GitHub 저장소 Settings → Secrets에서<br /><code className="bg-amber-100 px-1 rounded">VITE_GOOGLE_CLIENT_ID</code> 를 추가하세요</p>
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-stone-300 text-center">본 서비스는 참고용이며 정확성을 보장하지 않습니다</p>
    </div>
  )
}
