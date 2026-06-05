import type { OhaengCount } from '../types'
import { ELEMENT_LABELS, ELEMENT_COLORS } from '../utils/constants'

interface Props {
  count: OhaengCount
  hasHour: boolean
}

const ELEMENT_EMOJI: Record<string, string> = {
  wood: '🌳', fire: '🔥', earth: '🪨', metal: '⚔️', water: '💧',
}
const ELEMENT_TRAITS: Record<string, string> = {
  wood:  '성장·인자·창의',
  fire:  '열정·예의·표현',
  earth: '신뢰·안정·포용',
  metal: '결단·의리·정직',
  water: '지혜·유연·내면',
}

export default function OhaengChart({ count, hasHour }: Props) {
  const total    = hasHour ? 8 : 6
  const elements = ['wood', 'fire', 'earth', 'metal', 'water'] as const
  const strongest = elements.reduce((a, b) => count[a] >= count[b] ? a : b)
  const weakest   = elements.reduce((a, b) => count[a] <= count[b] ? a : b)

  return (
    <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6">
      <h2
        className="text-base font-bold text-white mb-5"
        style={{ fontFamily: "'Noto Serif KR', serif" }}
      >
        오행 분포 (五行)
      </h2>

      <div className="space-y-3.5">
        {elements.map(el => {
          const n   = count[el]
          const pct = (n / total) * 100
          const c   = ELEMENT_COLORS[el]
          return (
            <div key={el} className="flex items-center gap-3">
              <span className="text-base w-5">{ELEMENT_EMOJI[el]}</span>
              <span className="w-14 text-sm text-zinc-400">{ELEMENT_LABELS[el]}</span>
              <div className="flex-1 bg-zinc-800 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: c, boxShadow: `0 0 8px ${c}66` }}
                />
              </div>
              <span className="w-4 text-right text-sm font-bold" style={{ color: c }}>{n}</span>
            </div>
          )
        })}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div
          className="rounded-2xl p-3 border"
          style={{ backgroundColor: ELEMENT_COLORS[strongest] + '12', borderColor: ELEMENT_COLORS[strongest] + '30' }}
        >
          <p className="text-xs text-zinc-500 mb-1">강한 기운</p>
          <p className="font-bold text-sm" style={{ color: ELEMENT_COLORS[strongest] }}>
            {ELEMENT_EMOJI[strongest]} {ELEMENT_LABELS[strongest]}
          </p>
          <p className="text-xs text-zinc-600 mt-0.5">{ELEMENT_TRAITS[strongest]}</p>
        </div>
        {count[weakest] < count[strongest] && (
          <div className="rounded-2xl p-3 border border-zinc-700/50 bg-zinc-800/50">
            <p className="text-xs text-zinc-500 mb-1">약한 기운 (보완)</p>
            <p className="font-bold text-sm" style={{ color: ELEMENT_COLORS[weakest] }}>
              {ELEMENT_EMOJI[weakest]} {ELEMENT_LABELS[weakest]}
            </p>
            <p className="text-xs text-zinc-600 mt-0.5">{ELEMENT_TRAITS[weakest]}</p>
          </div>
        )}
      </div>
    </div>
  )
}
