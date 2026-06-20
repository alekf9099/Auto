import { useState } from 'react'
import {
  loadPoints, hasSpunRouletteToday, pickRouletteSegment, claimRoulette, ROULETTE_SEGMENTS,
} from '../utils/points'
import type { PointsState, RouletteSegment } from '../utils/points'

interface Props {
  onBack: () => void
  onPointsUpdate: (p: PointsState) => void
}

const SLICE_DEG = 360 / ROULETTE_SEGMENTS.length
const CENTER = 100
const OUTER_R = 94
const LABEL_R = 62

function shade(hex: string, amt: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const channel = (shift: number) => {
    const v = (num >> shift) & 0xff
    return Math.max(0, Math.min(255, Math.round(amt > 0 ? v + (255 - v) * amt : v * (1 + amt))))
  }
  return `#${[channel(16), channel(8), channel(0)].map(v => v.toString(16).padStart(2, '0')).join('')}`
}

function polar(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) }
}

function slicePath(startDeg: number, endDeg: number, r: number) {
  const p1 = polar(startDeg, r)
  const p2 = polar(endDeg, r)
  const largeArc = endDeg - startDeg > 180 ? 1 : 0
  return `M ${CENTER},${CENTER} L ${p1.x.toFixed(2)},${p1.y.toFixed(2)} A ${r},${r} 0 ${largeArc} 1 ${p2.x.toFixed(2)},${p2.y.toFixed(2)} Z`
}

export default function RoulettePage({ onBack, onPointsUpdate }: Props) {
  const [points,   setPoints]   = useState<PointsState>(loadPoints)
  const [spunToday, setSpunToday] = useState(hasSpunRouletteToday)
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [result,   setResult]   = useState<RouletteSegment | null>(null)
  const [pending,  setPending]  = useState<RouletteSegment | null>(null)

  function handleSpin() {
    if (spunToday || spinning) return
    const segment = pickRouletteSegment()
    const index = ROULETTE_SEGMENTS.findIndex(s => s.key === segment.key)
    const targetAngle = index * SLICE_DEG + SLICE_DEG / 2
    const targetMod = (360 - targetAngle + 360) % 360
    const delta = (targetMod - (rotation % 360) + 360) % 360
    setRotation(rotation + 5 * 360 + delta)
    setSpinning(true)
    setResult(null)
    setPending(segment)
  }

  function handleTransitionEnd() {
    if (!spinning || !pending) return
    setSpinning(false)
    const next = claimRoulette(points, pending)
    setPoints(next)
    onPointsUpdate(next)
    setSpunToday(true)
    setResult(pending)
    setPending(null)
  }

  return (
    <div className="min-h-screen bg-[#0D0A1A]">
      {/* 헤더 */}
      <div className="bg-[#0D0A1A]/95 backdrop-blur-md border-b border-[#2A1F4A] sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} aria-label="뒤로 가기" className="text-[#7B6F9A] hover:text-[#C4B8D8] transition text-lg">←</button>
          <div>
            <h1 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>오행 룰렛</h1>
            <p className="text-xs text-[#7B6F9A]">하루 한 번, 오행의 기운을 뽑아보세요</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* 안내 배너 */}
        <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-6 shadow-xl shadow-[#000]/40 border border-[#C9962A25] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-violet-500/10 -translate-y-10 translate-x-10" />
          <div className="relative z-10 text-center">
            <p className="text-violet-300/70 text-xs mb-2">오늘의 이벤트</p>
            <p className="text-5xl mb-2">🎡</p>
            <p className="text-base font-bold text-[#F5EDD4] mb-1" style={{ fontFamily: "'Noto Serif KR', serif" }}>
              오행 룰렛을 돌려보세요!
            </p>
            <p className="text-sm text-[#A89BC0] leading-relaxed">
              칸마다 포인트가 달라요. 운이 좋으면 <span className="text-[#C9962A] font-semibold">잭폿 +100P</span>까지!
            </p>
          </div>
        </div>

        {/* 룰렛 영역 */}
        <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-6 flex flex-col items-center">
          <div className="relative w-64 h-64 mb-6 drop-shadow-[0_8px_20px_rgba(0,0,0,0.55)]">
            {/* 포인터 */}
            <div
              className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 w-5 h-5"
              style={{
                clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
                background: 'linear-gradient(180deg, #FCEAA6, #C9962A)',
                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.6))',
              }}
            />

            <div
              onTransitionEnd={handleTransitionEnd}
              className="w-64 h-64 rounded-full relative"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? 'transform 3.2s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
              }}
            >
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <defs>
                  {ROULETTE_SEGMENTS.map(seg => (
                    <linearGradient key={seg.key} id={`grad-${seg.key}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={shade(seg.color, 0.35)} />
                      <stop offset="55%" stopColor={seg.color} />
                      <stop offset="100%" stopColor={shade(seg.color, -0.3)} />
                    </linearGradient>
                  ))}
                  <linearGradient id="rim-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F5D78E" />
                    <stop offset="50%" stopColor="#C9962A" />
                    <stop offset="100%" stopColor="#8A6C1F" />
                  </linearGradient>
                </defs>

                {ROULETTE_SEGMENTS.map((seg, i) => {
                  const start = i * SLICE_DEG
                  const end = (i + 1) * SLICE_DEG
                  const mid = start + SLICE_DEG / 2
                  const labelPos = polar(mid, LABEL_R)
                  return (
                    <g key={seg.key}>
                      <path
                        d={slicePath(start, end, OUTER_R)}
                        fill={`url(#grad-${seg.key})`}
                        stroke="#0D0A1A"
                        strokeWidth={1.5}
                        strokeOpacity={0.5}
                      />
                      <text
                        x={labelPos.x}
                        y={labelPos.y}
                        transform={`rotate(${mid}, ${labelPos.x}, ${labelPos.y})`}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="11"
                        fontWeight="bold"
                        fill="#fff"
                        stroke="#0D0A1A"
                        strokeWidth={3}
                        paintOrder="stroke"
                      >
                        {seg.label}
                      </text>
                    </g>
                  )
                })}

                <circle cx={CENTER} cy={CENTER} r={OUTER_R} fill="none" stroke="url(#rim-gradient)" strokeWidth="4" />
              </svg>
            </div>

            {/* 유광 하이라이트 (회전하지 않음) */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.25), transparent 55%)' }}
            />

            {/* 중심 허브 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                style={{
                  background: 'radial-gradient(circle at 35% 30%, #FCEAA6, #C9962A 60%, #8A6C1F)',
                  border: '2px solid #F5D78E',
                }}
              >
                🎡
              </div>
            </div>
          </div>

          {result && !spinning ? (
            <div className="text-center w-full">
              <div
                className="rounded-2xl p-4 mb-4"
                style={{ backgroundColor: `${result.color}18`, border: `1px solid ${result.color}55` }}
              >
                <p className="text-base font-bold" style={{ color: result.color }}>
                  {result.key === 'jackpot' ? '🎉 잭폿 당첨!' : result.key === 'blank' ? '꽝! 참가 보상 지급' : `${result.label} 적중!`}
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: result.color }}>+{result.amount}P</p>
              </div>
              <p className="text-xs text-[#4A4060] mb-2">현재 보유 {points.balance.toLocaleString()}P</p>
              <p className="text-sm font-semibold text-[#7B6F9A]">내일 다시 도전해보세요!</p>
            </div>
          ) : spunToday ? (
            <div className="text-center">
              <p className="text-sm font-semibold text-[#7B6F9A]">오늘 룰렛을 모두 사용했어요</p>
              <p className="text-xs text-[#4A4060] mt-1">내일 다시 도전해보세요!</p>
            </div>
          ) : (
            <button
              onClick={handleSpin}
              disabled={spinning}
              className="w-full py-4 bg-gradient-to-r from-[#C9962A] to-[#E8B84B] text-[#0D0A1A] font-bold rounded-2xl shadow-lg shadow-[#C9962A30] active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {spinning ? '돌아가는 중...' : '🎡 룰렛 돌리기'}
            </button>
          )}
        </div>

        {/* 가이드 — 칸별 보상 */}
        <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-[#C9962A] rounded-full" />
            <h2 className="text-sm font-bold text-[#F5EDD4]">칸별 보상 가이드</h2>
          </div>
          <ul className="space-y-2">
            {ROULETTE_SEGMENTS.map(seg => (
              <li key={seg.key} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20"
                    style={{ background: `linear-gradient(135deg, ${shade(seg.color, 0.35)}, ${seg.color} 55%, ${shade(seg.color, -0.3)})` }}
                  />
                  <span className="text-[#A89BC0]">{seg.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#7B6F9A] text-xs">{seg.weight}%</span>
                  <span className="text-[#C9962A] font-semibold">+{seg.amount}P</span>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-[#4A4060] mt-3">하루에 한 번만 돌릴 수 있어요. 매일 자정 초기화돼요.</p>
        </div>

      </div>

      <div className="text-center pb-8 text-xs text-[#4A4060]">오행 룰렛 — 매일 자정 초기화</div>
    </div>
  )
}
