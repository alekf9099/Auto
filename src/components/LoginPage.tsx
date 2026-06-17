import { useEffect } from 'react'
import type { UserInfo } from '../types'

interface Props {
  onLogin: (user: UserInfo) => void
  onShowPrivacy: () => void
  onShowTerms: () => void
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

export default function LoginPage({ onLogin, onShowPrivacy, onShowTerms }: Props) {
  useEffect(() => {
    if (!CLIENT_ID) return

    const init = () => {
      if (!window.google) return
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: ({ credential }) => {
          try {
            // base64url → UTF-8 (한글 등 멀티바이트 문자 처리)
            const b64 = credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
            const json = decodeURIComponent(
              atob(b64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
            )
            const payload = JSON.parse(json)
            onLogin({ name: payload.name, email: payload.email, picture: payload.picture, idToken: credential })
          } catch (e) {
            console.error('구글 로그인 토큰 처리 실패:', e)
          }
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
    <div className="min-h-screen bg-[#0D0A1A] relative overflow-hidden flex flex-col items-center justify-center px-6">

      {/* ── 배경 블롭 ── */}
      <div className="absolute -top-24 -right-20 w-80 h-80 rounded-full bg-[#C9962A]/8 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-16 w-72 h-72 rounded-full bg-violet-900/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-12 w-40 h-40 rounded-full bg-[#C9962A]/5 blur-2xl pointer-events-none" />

      {/* ── 배경 산점 기호 ── */}
      {[
        { ch: '木', x: '8%',  y: '12%', c: '#86EFAC', s: '13px' },
        { ch: '火', x: '88%', y: '10%', c: '#FCA5A5', s: '11px' },
        { ch: '水', x: '6%',  y: '72%', c: '#93C5FD', s: '12px' },
        { ch: '金', x: '90%', y: '68%', c: '#D1D5DB', s: '11px' },
        { ch: '土', x: '50%', y: '91%', c: '#FCD34D', s: '11px' },
        { ch: '✦',  x: '80%', y: '30%', c: '#C4B5FD', s: '10px' },
        { ch: '✦',  x: '14%', y: '42%', c: '#C4B5FD', s: '8px'  },
        { ch: '⋆',  x: '72%', y: '82%', c: '#DDD6FE', s: '16px' },
        { ch: '⋆',  x: '22%', y: '88%', c: '#DDD6FE', s: '14px' },
      ].map((d, i) => (
        <span key={i} className="absolute select-none pointer-events-none font-bold"
          style={{ left: d.x, top: d.y, color: d.c, fontSize: d.s, opacity: 0.8 }}>
          {d.ch}
        </span>
      ))}

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

          {/* 로고 */}
          <div className="relative w-[100px] h-[100px] rounded-full p-[3px]"
            style={{ background: 'linear-gradient(135deg, #C9962A, #E8B84B)' }}>
            <div className="w-full h-full rounded-full bg-[#0D0A1A] flex items-center justify-center">
              <span className="text-5xl" style={{ color: '#C9962A', fontFamily: 'serif' }}>☯</span>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-[#F5EDD4] mb-1"
          style={{ fontFamily: "'Noto Serif KR', serif" }}>운명봄</h1>
        <p className="text-sm text-[#7B6F9A]">당신의 운명을 봅니다</p>
      </div>

      {/* ── 로그인 카드 ── */}
      <div className="w-full max-w-sm bg-[#130E24] rounded-3xl shadow-[0_4px_24px_rgba(201,150,42,0.12)] border border-[#2A1F4A] p-7">
        <h2 className="text-base font-bold text-[#F5EDD4] mb-1 text-center">로그인</h2>
        <p className="text-xs text-[#7B6F9A] mb-6 text-center">구글 계정으로 운세를 확인하세요</p>

        {CLIENT_ID ? (
          <div className="flex justify-center">
            <div id="g-signin" />
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div className="text-xs text-amber-300 bg-amber-900/20 border border-amber-700/40 rounded-2xl p-3 leading-relaxed">
              <p className="font-semibold mb-1">⚙️ Google 로그인 설정 필요</p>
              <p>GitHub 저장소 Settings → Secrets에서<br /><code className="bg-amber-900/40 px-1 rounded">VITE_GOOGLE_CLIENT_ID</code> 를 추가하세요</p>
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-[#4A4060] text-center">본 서비스는 참고용이며 정확성을 보장하지 않습니다</p>
      <p className="mt-2 text-xs text-[#4A4060] text-center">
        <button onClick={onShowPrivacy} className="underline hover:text-[#7B6F9A] transition">개인정보처리방침</button>
        <span className="mx-2">·</span>
        <button onClick={onShowTerms} className="underline hover:text-[#7B6F9A] transition">이용약관</button>
      </p>
    </div>
  )
}
