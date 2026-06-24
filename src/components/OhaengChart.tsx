import type { OhaengCount } from '../types'
import { ELEMENT_LABELS, ELEMENT_COLORS } from '../utils/constants'
import { IcElementWood, IcElementFire, IcElementEarth, IcElementMetal, IcElementWater } from './icons/SajuIcons'

interface Props { count: OhaengCount; hasHour: boolean }

const ELEMENT_ICON = { wood: IcElementWood, fire: IcElementFire, earth: IcElementEarth, metal: IcElementMetal, water: IcElementWater }
const TRAITS: Record<string, string> = {
  wood: '성장·인자·창의', fire: '열정·예의·표현',
  earth: '신뢰·안정·포용', metal: '결단·의리·정직', water: '지혜·유연·내면',
}

export default function OhaengChart({ count, hasHour }: Props) {
  const total    = hasHour ? 8 : 6
  const elements = ['wood', 'fire', 'earth', 'metal', 'water'] as const
  const strongest = elements.reduce((a, b) => count[a] >= count[b] ? a : b)
  const weakest   = elements.reduce((a, b) => count[a] <= count[b] ? a : b)
  const StrongIcon = ELEMENT_ICON[strongest]
  const WeakIcon   = ELEMENT_ICON[weakest]

  return (
    <div className="bg-[#FBF4E2] rounded-3xl border border-[#D8C290] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-5 bg-[#9A6A12] rounded-full" />
        <h2 className="text-base font-bold text-[#3B2A16]" style={{ fontFamily: "'Gowun Batang', serif" }}>오행 분포 (五行)</h2>
      </div>

      <div className="space-y-3.5">
        {elements.map(el => {
          const n = count[el], c = ELEMENT_COLORS[el]
          const Icon = ELEMENT_ICON[el]
          return (
            <div key={el} className="flex items-center gap-3">
              <span className="w-5" style={{ color: c }}><Icon size={18} /></span>
              <span className="w-14 text-sm text-[#6E5836] font-medium">{ELEMENT_LABELS[el]}</span>
              <div className="flex-1 bg-[#E3D0A4] rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(n / total) * 100}%`, backgroundColor: c }}
                />
              </div>
              <span className="w-4 text-right text-sm font-bold" style={{ color: c }}>{n}</span>
            </div>
          )
        })}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-3 border" style={{ backgroundColor: ELEMENT_COLORS[strongest] + '10', borderColor: ELEMENT_COLORS[strongest] + '30' }}>
          <p className="text-xs text-[#9A8155] mb-1">강한 기운</p>
          <p className="font-bold text-sm flex items-center gap-1.5" style={{ color: ELEMENT_COLORS[strongest] }}>
            <StrongIcon size={16} /> {ELEMENT_LABELS[strongest]}
          </p>
          <p className="text-xs text-[#9A8155] mt-0.5">{TRAITS[strongest]}</p>
        </div>
        {count[weakest] < count[strongest] && (
          <div className="rounded-2xl p-3 border border-[#D8C290] bg-[#E9DAB8]">
            <p className="text-xs text-[#9A8155] mb-1">약한 기운 (보완)</p>
            <p className="font-bold text-sm flex items-center gap-1.5" style={{ color: ELEMENT_COLORS[weakest] }}>
              <WeakIcon size={16} /> {ELEMENT_LABELS[weakest]}
            </p>
            <p className="text-xs text-[#9A8155] mt-0.5">{TRAITS[weakest]}</p>
          </div>
        )}
      </div>
    </div>
  )
}
