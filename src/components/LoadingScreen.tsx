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
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-2xl shadow-violet-200">
          <span
            className="text-5xl text-white select-none animate-spin"
            style={{ animationDuration: '5s', fontFamily: "'Noto Serif KR', serif" }}
          >
            ☯
          </span>
        </div>
        <div
          className="absolute rounded-full border-4 border-violet-200 border-t-violet-500 animate-spin"
          style={{ width: 120, height: 120, animationDuration: '1.2s' }}
        />
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
