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
    <div className="min-h-screen bg-[#F4F2FF] flex flex-col items-center justify-center px-8">
      {/* 아이콘 */}
      <div className="relative mb-10 flex items-center justify-center">
        {/* 바깥 글로우 */}
        <div className="absolute w-36 h-36 rounded-full bg-violet-200/40 blur-2xl" />
        {/* 회전 링 */}
        <div
          className="absolute rounded-full border-[3px] border-violet-100 border-t-violet-400 animate-spin"
          style={{ width: 124, height: 124, animationDuration: '1.4s' }}
        />
        {/* 아이콘 원 */}
        <div className="relative w-24 h-24 rounded-full bg-white border border-violet-100 shadow-[0_4px_24px_rgba(124,58,237,0.18)] flex items-center justify-center">
          <span
            className="text-5xl select-none animate-spin"
            style={{ color: '#7C3AED', animationDuration: '6s', fontFamily: 'serif' }}
          >
            ☯
          </span>
        </div>
      </div>

      <h2
        className="text-2xl font-bold text-stone-800 mb-2"
        style={{ fontFamily: "'Noto Serif KR', serif" }}
      >
        사주 분석중
      </h2>
      <p className="text-sm text-stone-400 mb-8 text-center h-5">{MESSAGES[msgIdx]}</p>

      {/* 진행 바 */}
      <div className="w-56 bg-violet-100 rounded-full h-2 overflow-hidden mb-2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-stone-400 mb-12">{Math.round(progress)}%</p>

      {/* 오행 도트 */}
      <div className="flex items-end gap-4">
        {OHAENG_COLORS.map((c, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full animate-bounce"
              style={{ backgroundColor: c, animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
            />
            <span className="text-[10px] text-stone-400">{OHAENG_LABELS[i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
