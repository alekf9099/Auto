import { useEffect, useState } from 'react'

interface Props {
  onDone: () => void
}

export default function SplashScreen({ onDone }: Props) {
  const [visible, setVisible] = useState(false)
  const [fade,    setFade]    = useState(false)

  useEffect(() => {
    // 살짝 딜레이 후 fade-in
    const t0 = setTimeout(() => setVisible(true), 60)
    // fade-out 시작
    const t1 = setTimeout(() => setFade(true), 1600)
    // 다음 페이지로
    const t2 = setTimeout(onDone, 2100)
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center transition-opacity duration-500"
      style={{ opacity: fade ? 0 : visible ? 1 : 0 }}
    >
      {/* 배경 블롭 */}
      <div className="absolute -top-24 -right-20 w-80 h-80 rounded-full bg-[#9A6A12]/8 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-16 w-72 h-72 rounded-full bg-violet-900/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-12 w-40 h-40 rounded-full bg-[#9A6A12]/5 blur-2xl pointer-events-none" />

      {/* 배경 기호 */}
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

      {/* 로고 */}
      <div
        className="relative flex items-center justify-center mb-7 transition-all duration-700"
        style={{ width: 220, height: 220, transform: visible ? 'scale(1)' : 'scale(0.85)', opacity: visible ? 1 : 0 }}
      >
        {/* 동심원 링 */}
        <div className="absolute rounded-full border border-[#9A6A12]/20" style={{ width: 216, height: 216 }} />
        <div className="absolute rounded-full border border-[#9A6A12]/15" style={{ width: 168, height: 168 }} />
        {/* 글로우 */}
        <div className="absolute w-36 h-36 rounded-full bg-[#9A6A12]/10 blur-2xl" />

        {/* 오행 라벨 — 순차 점멸 */}
        <span className="absolute text-xs font-bold animate-pulse" style={{ color: '#86EFAC', top: 6,   left: '50%', transform: 'translateX(-50%)', animationDelay: '0s' }}>木</span>
        <span className="absolute text-xs font-bold animate-pulse" style={{ color: '#FCA5A5', right: 6,  top: '50%',  transform: 'translateY(-50%)', animationDelay: '0.3s' }}>火</span>
        <span className="absolute text-xs font-bold animate-pulse" style={{ color: '#FCD34D', bottom: 6, left: '50%', transform: 'translateX(-50%)', animationDelay: '0.6s' }}>土</span>
        <span className="absolute text-xs font-bold animate-pulse" style={{ color: '#93C5FD', left: 6,   top: '50%',  transform: 'translateY(-50%)', animationDelay: '0.9s' }}>水</span>

        {/* 메인 아이콘 */}
        <div className="relative w-[110px] h-[110px] rounded-full p-[3px] animate-spin"
          style={{ background: 'linear-gradient(135deg, #9A6A12, #B5841C)', animationDuration: '8s' }}>
          <div className="w-full h-full rounded-full bg-[#FBF4E2] flex items-center justify-center">
            <span className="text-[52px]" style={{ color: '#9A6A12', fontFamily: 'serif' }}>☯</span>
          </div>
        </div>
      </div>

      {/* 앱 이름 */}
      <h1
        className="text-4xl font-bold text-[#3B2A16] mb-2 tracking-tight"
        style={{ fontFamily: "'Gowun Batang', serif" }}
      >
        운명봄
      </h1>
      <p className="text-sm text-[#9A8155] mb-1">당신의 운명을 봅니다</p>
      <p className="text-xs text-[#9A6A12]/70">사주팔자 · 신년운세 · 토정비결</p>
    </div>
  )
}
