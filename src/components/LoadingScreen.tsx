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
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-8 relative overflow-hidden">
      {/* 배경 글로우 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />

      {/* 회전 심볼 */}
      <div className="relative mb-10 flex items-center justify-center">
        <span
          className="text-7xl select-none text-amber-400 animate-spin"
          style={{ animationDuration: '6s', fontFamily: "'Noto Serif KR', serif", filter: 'drop-shadow(0 0 24px rgba(245,158,11,0.4))' }}
        >
          ☯
        </span>
        <div
          className="absolute rounded-full border-2 border-amber-400/20 border-t-amber-400/60 animate-spin"
          style={{ width: 100, height: 100, animationDuration: '1.2s' }}
        />
        <div
          className="absolute rounded-full border border-amber-300/10 border-b-amber-300/30 animate-spin"
          style={{ width: 130, height: 130, animationDuration: '2.5s', animationDirection: 'reverse' }}
        />
      </div>

      <h2
        className="text-2xl font-bold text-white mb-2"
        style={{ fontFamily: "'Noto Serif KR', serif" }}
      >
        사주 분석중
      </h2>
      <p className="text-sm text-zinc-500 mb-8 text-center h-5 transition-all duration-700">
        {MESSAGES[msgIdx]}
      </p>

      {/* 진행 바 */}
      <div className="w-56 bg-zinc-800 rounded-full h-1.5 overflow-hidden mb-2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-zinc-600 mb-12">{Math.round(progress)}%</p>

      {/* 오행 도트 */}
      <div className="flex items-end gap-4">
        {OHAENG_COLORS.map((c, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full animate-bounce"
              style={{ backgroundColor: c, animationDelay: `${i * 0.15}s`, animationDuration: '1s', boxShadow: `0 0 8px ${c}66` }}
            />
            <span className="text-[10px] text-zinc-600">{OHAENG_LABELS[i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
