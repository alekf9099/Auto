import { useEffect, useRef, useState } from 'react'

const MESSAGES = [
  '천간(天干)과 지지(地支)를 분석하는 중...',
  '오행(五行)의 균형을 살펴보는 중...',
  '대운(大運)의 흐름을 계산하는 중...',
  '십신(十神)의 관계를 파악하는 중...',
  '나만의 운명 지도를 완성하는 중...',
]

const OHAENG_COLORS = ['#4CAF50', '#F44336', '#FF9800', '#78909C', '#2196F3']
const OHAENG_LABELS = ['목', '화', '토', '금', '수']

interface Props {
  onComplete: () => void
}

export default function LoadingScreen({ onComplete }: Props) {
  const [msgIdx,   setMsgIdx]   = useState(0)
  const [progress, setProgress] = useState(0)
  const doneRef = useRef(false)

  useEffect(() => {
    const duration = 3000 + Math.random() * 5000
    const start    = Date.now()

    const tick = setInterval(() => {
      const pct = Math.min(((Date.now() - start) / duration) * 100, 98)
      setProgress(pct)
      setMsgIdx(Math.min(Math.floor((pct / 100) * MESSAGES.length), MESSAGES.length - 1))
    }, 80)

    const finish = setTimeout(() => {
      if (doneRef.current) return
      doneRef.current = true
      clearInterval(tick)
      setProgress(100)
      setTimeout(onComplete, 400)
    }, duration)

    return () => { clearInterval(tick); clearTimeout(finish) }
  }, [onComplete])

  return (
    <div className="min-h-screen bg-[#0D0A1A] relative overflow-hidden flex flex-col items-center justify-center px-8">

      {/* 배경 블롭 */}
      <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-[#C9962A]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-12 w-64 h-64 rounded-full bg-violet-900/20 blur-3xl pointer-events-none" />

      {/* 배경 산점 */}
      {[
        { ch: '木', x: '9%',  y: '14%', c: '#86EFAC' },
        { ch: '火', x: '86%', y: '12%', c: '#FCA5A5' },
        { ch: '水', x: '7%',  y: '74%', c: '#93C5FD' },
        { ch: '金', x: '88%', y: '70%', c: '#D1D5DB' },
        { ch: '✦',  x: '78%', y: '35%', c: '#C4B5FD' },
        { ch: '⋆',  x: '18%', y: '55%', c: '#DDD6FE' },
      ].map((d, i) => (
        <span key={i} className="absolute select-none pointer-events-none text-xs font-bold"
          style={{ left: d.x, top: d.y, color: d.c, opacity: 0.7 }}>
          {d.ch}
        </span>
      ))}

      {/* 아이콘 */}
      <div className="relative mb-10 flex items-center justify-center">
        {/* 바깥 글로우 */}
        <div
          className="absolute w-40 h-40 rounded-full blur-2xl transition-colors duration-700"
          style={{ backgroundColor: OHAENG_COLORS[msgIdx] + '1A' }}
        />
        {/* 장식 링 */}
        <div className="absolute rounded-full border border-[#C9962A]/20" style={{ width: 160, height: 160 }} />
        {/* 회전 링 — 오행 색상 순환 */}
        <div
          className="absolute rounded-full border-[3px] border-[#2A1F4A] animate-spin transition-colors duration-700"
          style={{ width: 124, height: 124, animationDuration: '1.4s', borderTopColor: OHAENG_COLORS[msgIdx] }}
        />
        {/* 아이콘 원 */}
        <div className="relative w-24 h-24 rounded-full bg-[#130E24] border border-[#2A1F4A] shadow-[0_4px_24px_rgba(201,150,42,0.18)] flex items-center justify-center">
          <span
            className="text-5xl select-none animate-spin transition-colors duration-700"
            style={{ color: OHAENG_COLORS[msgIdx], animationDuration: '6s', fontFamily: 'serif' }}
          >
            ☯
          </span>
        </div>
      </div>

      <h2
        className="text-2xl font-bold text-[#F5EDD4] mb-2"
        style={{ fontFamily: "'Noto Serif KR', serif" }}
      >
        사주 분석중
      </h2>
      <p className="text-sm text-[#7B6F9A] mb-8 text-center h-5">{MESSAGES[msgIdx]}</p>

      {/* 진행 바 */}
      <div className="w-56 bg-[#231844] rounded-full h-2 overflow-hidden mb-2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#C9962A] to-[#E8B84B] transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-[#7B6F9A] mb-12">{Math.round(progress)}%</p>

      {/* 오행 도트 */}
      <div className="flex items-end gap-4">
        {OHAENG_COLORS.map((c, i) => {
          const active = i === msgIdx
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className="rounded-full animate-bounce transition-all duration-300"
                style={{
                  backgroundColor: c,
                  width: active ? 14 : 12,
                  height: active ? 14 : 12,
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '0.9s',
                  boxShadow: active ? `0 0 10px 2px ${c}80` : 'none',
                }}
              />
              <span
                className="text-[10px] font-bold transition-colors duration-300"
                style={{ color: active ? c : '#7B6F9A' }}
              >
                {OHAENG_LABELS[i]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
