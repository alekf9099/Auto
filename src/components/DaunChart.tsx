import type { SajuResult } from '../types'
import { STEMS, BRANCHES, ELEMENT_COLORS } from '../utils/constants'
import { getSipsin, pillarName } from '../utils/saju'

interface Props {
  result: SajuResult
  birthYear: number
  currentYear?: number
}

// 십신별 대운 기세(氣勢) 점수 — 그래프 곡선을 위한 예시적 지표 (0~100)
const SIPSIN_SCORE: Record<string, number> = {
  '정관': 95, '정재': 88, '식신': 82, '정인': 78,
  '비견': 65, '편재': 60, '편인': 55,
  '상관': 48, '편관': 45, '겁재': 38,
}

// Catmull-Rom 보간 기반 부드러운 SVG 패스 생성
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(i + 2, points.length - 1)]
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  return d
}

export default function DaunChart({ result, birthYear, currentYear = new Date().getFullYear() }: Props) {
  const { daun, daunStartAge, isForward } = result
  const dayStemIdx = result.dayPillar.stemIndex

  // 그래프 좌표 계산
  const W = 640, H = 150
  const padX = 26, topY = 22, baseY = 112, labelY = 134
  const stepX = daun.length > 1 ? (W - padX * 2) / (daun.length - 1) : 0
  const chartPoints = daun.map((entry, i) => {
    const age       = entry.age
    const ageYear   = birthYear + age
    const isCurrent = ageYear <= currentYear && currentYear < ageYear + 10
    const sipsin    = getSipsin(dayStemIdx, entry.pillar.stemIndex)
    const score     = SIPSIN_SCORE[sipsin] ?? 50
    const x = padX + i * stepX
    const y = baseY - ((score - 30) / 70) * (baseY - topY)
    return { age, isCurrent, sipsin, x, y }
  })
  const linePath = smoothPath(chartPoints)
  const current  = chartPoints.find(p => p.isCurrent)

  return (
    <div className="bg-[#FBF4E2] rounded-3xl border border-[#D8C290] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-6">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-5 bg-[#9A6A12] rounded-full" />
        <h2 className="text-base font-bold text-[#3B2A16]" style={{ fontFamily: "'Gowun Batang', serif" }}>
          대운 (大運)
        </h2>
        <div className="flex-1" />
        <span className="text-xs bg-[#9A6A1220] text-[#9A6A12] border border-[#9A6A1240] px-2.5 py-1 rounded-full font-medium">
          {isForward ? '순행 ▶' : '역행 ◀'} · {daunStartAge}세
        </span>
      </div>
      <p className="text-xs text-[#9A8155] mb-5 ml-3">10년 단위 대운 흐름</p>

      {/* 대운 기세 그래프 */}
      <div className="relative mb-6 mt-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full block">
          <defs>
            <linearGradient id="daunLineGrad" x1="0" y1="0" x2={W} y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#9A6A12" />
              <stop offset="50%" stopColor="#B5841C" />
              <stop offset="100%" stopColor="#9A6A12" />
            </linearGradient>
            <filter id="daunGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="daunOrbGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F3E7C8" />
              <stop offset="55%" stopColor="#F0B429" />
              <stop offset="100%" stopColor="#C8442E" stopOpacity="0" />
            </radialGradient>
          </defs>

          <line x1={padX} y1={baseY} x2={W - padX} y2={baseY} stroke="#D8C290" strokeWidth="1" />

          {current && (
            <line x1={current.x} y1={current.y} x2={current.x} y2={baseY} stroke="#9A6A12" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.7" />
          )}

          <path d={linePath} fill="none" stroke="url(#daunLineGrad)" strokeWidth="3" strokeLinecap="round" filter="url(#daunGlow)" />

          {chartPoints.filter(p => !p.isCurrent).map(p => (
            <circle key={p.age} cx={p.x} cy={p.y} r="3" fill="#9A6A12" />
          ))}

          {current && (
            <>
              <circle cx={current.x} cy={current.y} r="14" fill="url(#daunOrbGrad)" />
              <circle cx={current.x} cy={current.y} r="5" fill="#F3E7C8" />
            </>
          )}

          {chartPoints.map(p => (
            <text
              key={p.age}
              x={p.x}
              y={labelY}
              textAnchor="middle"
              fontSize="13"
              fill={p.isCurrent ? '#9A6A12' : '#9A8155'}
              fontWeight={p.isCurrent ? 700 : 400}
            >
              {p.age}세
            </text>
          ))}
        </svg>

        {current && (
          <div
            className="absolute -translate-x-1/2 -translate-y-full px-2.5 py-1 rounded-full bg-[#E9DAB8] border border-[#9A6A12] text-[10px] font-bold text-[#B5841C] whitespace-nowrap shadow-[0_0_10px_rgba(201,150,42,0.5)]"
            style={{ left: `${(current.x / W) * 100}%`, top: `${(current.y / H) * 100}%`, marginTop: '-10px' }}
          >
            현재 · {current.sipsin} 대운
          </div>
        )}
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <div className="flex gap-2 min-w-max pb-2">
          {daun.map(entry => {
            const age       = entry.age
            const ageYear   = birthYear + age
            const isCurrent = ageYear <= currentYear && currentYear < ageYear + 10
            const stem      = STEMS[entry.pillar.stemIndex]
            const branch    = BRANCHES[entry.pillar.branchIndex]
            const stemColor   = ELEMENT_COLORS[stem.element]
            const branchColor = ELEMENT_COLORS[branch.element]
            const sipsinStem  = getSipsin(dayStemIdx, entry.pillar.stemIndex)
            const equiv       = branch.element === 'wood'  ? (branch.yinYang === 'yang' ? 0 : 1)
                              : branch.element === 'fire'  ? (branch.yinYang === 'yang' ? 2 : 3)
                              : branch.element === 'earth' ? (branch.yinYang === 'yang' ? 4 : 5)
                              : branch.element === 'metal' ? (branch.yinYang === 'yang' ? 6 : 7)
                              : branch.yinYang === 'yang'  ? 8 : 9
            const sipsinBranch = getSipsin(dayStemIdx, equiv)

            return (
              <div
                key={age}
                className={`flex flex-col items-center rounded-2xl p-3 min-w-[76px] border transition-all ${
                  isCurrent
                    ? 'border-amber-400/60 bg-amber-50 shadow-md shadow-amber-100'
                    : 'border-[#D8C290] bg-[#E9DAB8]'
                }`}
              >
                {isCurrent && (
                  <span className="text-[10px] bg-amber-400 text-white px-1.5 py-0.5 rounded-full mb-1 font-bold">현재</span>
                )}
                <span className="text-xs text-[#9A8155] mb-0.5">{age}세</span>
                <span className="text-[10px] text-[#A89167]">{ageYear}~</span>

                {/* 천간 */}
                <div
                  className="mt-2 w-10 h-10 rounded-xl flex flex-col items-center justify-center border"
                  style={{ borderColor: stemColor + '40', backgroundColor: stemColor + '12' }}
                >
                  <span className="text-base font-bold leading-none" style={{ color: stemColor }}>{stem.hanja}</span>
                  <span className="text-[10px]" style={{ color: stemColor + 'cc' }}>{stem.ko}</span>
                </div>
                <span className="text-[10px] mt-1 text-[#9A8155]">{sipsinStem}</span>

                {/* 지지 */}
                <div
                  className="mt-1 w-10 h-12 rounded-xl flex flex-col items-center justify-center border"
                  style={{ borderColor: branchColor + '40', backgroundColor: branchColor + '12' }}
                >
                  <span className="text-base font-bold leading-none" style={{ color: branchColor }}>{branch.hanja}</span>
                  <span className="text-[10px]" style={{ color: branchColor + 'cc' }}>{branch.ko}</span>
                </div>
                <span className="text-[10px] mt-1 text-[#9A8155]">{sipsinBranch}</span>
                <span className="text-[10px] text-[#A89167] mt-1">{pillarName(entry.pillar)}</span>
              </div>
            )
          })}
        </div>
      </div>

      <p className="text-xs text-[#A89167] mt-3">
        * 절기 날짜는 근사값이므로 참고용으로 활용하세요.
      </p>
    </div>
  )
}
