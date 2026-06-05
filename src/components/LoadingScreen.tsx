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
    const duration = 3000 + Math.random() * 5000 // 3~8초
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
      setTimeout(onComplete, 500)
    }, duration)

    return () => { clearInterval(tick); clearTimeout(finish) }
  }, [onComplete])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex flex-col items-center justify-center px-8">

      {/* 회전 심볼 */}
      <div className="relative mb-10 flex items-center justify-center">
        <div
          className="text-7xl select-none animate-spin text-amber-500"
          style={{ animationDuration: '6s', textShadow: '0 4px 24px rgba(245,158,11,0.3)' }}
        >
          ☯
        </div>
        <div
          className="absolute rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin"
          style={{ width: 100, height: 100, animationDuration: '1.2s' }}
        />
        <div
          className="absolute rounded-full border-2 border-orange-100 border-b-orange-300 animate-spin"
          style={{ width: 128, height: 128, animationDuration: '2s', animationDirection: 'reverse' }}
        />
      </div>

      <h2 className="text-2xl font-bold text-stone-800 mb-2">사주 분석중</h2>
      <p className="text-sm text-stone-500 mb-8 text-center h-5 transition-all duration-700">
        {MESSAGES[msgIdx]}
      </p>

      {/* 진행 바 */}
      <div className="w-64 bg-stone-200 rounded-full h-2 overflow-hidden mb-2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-stone-400 mb-12">{Math.round(progress)}%</p>

      {/* 오행 바운스 도트 */}
      <div className="flex items-end gap-3 h-8">
        {OHAENG_COLORS.map((c, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className="w-3 h-3 rounded-full animate-bounce"
              style={{ backgroundColor: c, animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
            />
            <span className="text-[9px] text-stone-400">{OHAENG_LABELS[i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
