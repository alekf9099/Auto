import type { OhaengCount } from '../types'
import { ELEMENT_LABELS, ELEMENT_COLORS } from '../utils/constants'

interface Props {
  count: OhaengCount
  hasHour: boolean
}

const ELEMENT_EMOJI: Record<string, string> = {
  wood:  '🌳',
  fire:  '🔥',
  earth: '🪨',
  metal: '⚔️',
  water: '💧',
}

const ELEMENT_TRAITS: Record<string, string> = {
  wood:  '성장·인자·창의',
  fire:  '열정·예의·표현',
  earth: '신뢰·안정·포용',
  metal: '결단·의리·정직',
  water: '지혜·유연·내면',
}

export default function OhaengChart({ count, hasHour }: Props) {
  const total = hasHour ? 8 : 6
  const elements = ['wood', 'fire', 'earth', 'metal', 'water'] as const

  const strongest = elements.reduce((a, b) => count[a] >= count[b] ? a : b)
  const weakest   = elements.reduce((a, b) => count[a] <= count[b] ? a : b)

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6">
      <h2 className="text-lg font-bold text-stone-700 mb-5 font-korean">오행 분포 (五行)</h2>

      <div className="space-y-3">
        {elements.map(el => {
          const n     = count[el]
          const pct   = Math.round((n / total) * 100)
          const color = ELEMENT_COLORS[el]
          return (
            <div key={el} className="flex items-center gap-3">
              <span className="text-lg w-6">{ELEMENT_EMOJI[el]}</span>
              <span className="w-16 text-sm font-medium text-stone-600">{ELEMENT_LABELS[el]}</span>
              <div className="flex-1 bg-stone-100 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(n / total) * 100}%`, backgroundColor: color }}
                />
              </div>
              <span className="w-8 text-right text-sm font-bold" style={{ color }}>{n}</span>
              <span className="w-8 text-right text-xs text-stone-400">{pct}%</span>
            </div>
          )
        })}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div
          className="rounded-2xl p-3 border"
          style={{ backgroundColor: ELEMENT_COLORS[strongest] + '15', borderColor: ELEMENT_COLORS[strongest] + '40' }}
        >
          <p className="text-xs text-stone-400 mb-1">강한 기운</p>
          <p className="font-bold" style={{ color: ELEMENT_COLORS[strongest] }}>
            {ELEMENT_EMOJI[strongest]} {ELEMENT_LABELS[strongest]}
          </p>
          <p className="text-xs text-stone-500 mt-0.5">{ELEMENT_TRAITS[strongest]}</p>
        </div>
        {count[weakest] < count[strongest] && (
          <div className="rounded-2xl p-3 border border-stone-100 bg-stone-50">
            <p className="text-xs text-stone-400 mb-1">약한 기운 (보완 필요)</p>
            <p className="font-bold text-stone-500">
              {ELEMENT_EMOJI[weakest]} {ELEMENT_LABELS[weakest]}
            </p>
            <p className="text-xs text-stone-400 mt-0.5">{ELEMENT_TRAITS[weakest]}</p>
          </div>
        )}
      </div>
    </div>
  )
}
