import type { SajuResult } from '../types'
import { STEMS, BRANCHES, ELEMENT_COLORS, SIPSIN_DESC } from '../utils/constants'
import { getSipsin } from '../utils/saju'

interface Props {
  result: SajuResult
}

function SipsinBadge({ name }: { name: string }) {
  const colors: Record<string, string> = {
    비견: 'bg-green-100 text-green-700',
    겁재: 'bg-green-200 text-green-800',
    식신: 'bg-orange-100 text-orange-700',
    상관: 'bg-orange-200 text-orange-800',
    편재: 'bg-yellow-100 text-yellow-700',
    정재: 'bg-yellow-200 text-yellow-800',
    편관: 'bg-red-100 text-red-700',
    정관: 'bg-red-200 text-red-800',
    편인: 'bg-blue-100 text-blue-700',
    정인: 'bg-blue-200 text-blue-800',
  }
  const desc = SIPSIN_DESC[name]
  return (
    <div className="text-right">
      <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-bold ${colors[name] ?? 'bg-stone-100 text-stone-600'}`}>
        {name}
      </span>
      {desc && <p className="text-xs text-stone-400 mt-0.5">{desc.meaning}</p>}
    </div>
  )
}

export default function SipsinChart({ result }: Props) {
  const dayStemIdx = result.dayPillar.stemIndex
  const dayStem    = STEMS[dayStemIdx]

  const pillars = [result.yearPillar, result.monthPillar, result.dayPillar]
  if (result.hourPillar) pillars.push(result.hourPillar)

  const rows: { label: string; pos: string; stemIdx: number; sipsin: string | null }[] = []
  for (const p of pillars) {
    const isDay = p.label === '일주'
    rows.push({
      label: p.label,
      pos: '천간',
      stemIdx: p.stemIndex,
      sipsin: isDay ? null : getSipsin(dayStemIdx, p.stemIndex),
    })
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6">
      <h2 className="text-lg font-bold text-stone-700 mb-1 font-korean">십신 분석 (十神)</h2>
      <p className="text-xs text-stone-400 mb-5">
        일간 <span className="font-bold" style={{ color: ELEMENT_COLORS[dayStem.element] }}>
          {dayStem.hanja}({dayStem.ko})
        </span> 기준
      </p>

      <div className="space-y-2">
        {rows.map((r, i) => {
          const stem = STEMS[r.stemIdx]
          const color = ELEMENT_COLORS[stem.element]
          return (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-stone-50 last:border-0">
              <span className="w-16 text-xs text-stone-400">{r.label} {r.pos}</span>
              <div
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                style={{ backgroundColor: color + '18' }}
              >
                <span className="text-base font-bold" style={{ color }}>{stem.hanja}</span>
                <span className="text-xs" style={{ color }}>{stem.ko}</span>
              </div>
              <div className="flex-1" />
              {r.sipsin ? (
                <SipsinBadge name={r.sipsin} />
              ) : (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-lg font-bold">나 (我)</span>
              )}
            </div>
          )
        })}
      </div>

      {/* 지지 십신 */}
      <div className="mt-4 pt-4 border-t border-stone-100">
        <p className="text-xs text-stone-400 mb-3">지지 (地支) 장간(藏干) 기준</p>
        <div className="space-y-2">
          {pillars.map((p, i) => {
            const branch = BRANCHES[p.branchIndex]
            const color  = ELEMENT_COLORS[branch.element]
            // Use the main element of the branch for sipsin calculation
            const branchStemEquiv = branch.element === 'wood'  ? (branch.yinYang === 'yang' ? 0 : 1)
                                  : branch.element === 'fire'  ? (branch.yinYang === 'yang' ? 2 : 3)
                                  : branch.element === 'earth' ? (branch.yinYang === 'yang' ? 4 : 5)
                                  : branch.element === 'metal' ? (branch.yinYang === 'yang' ? 6 : 7)
                                  : branch.yinYang === 'yang'  ? 8 : 9
            const sipsin = p.label === '일주' ? null : getSipsin(dayStemIdx, branchStemEquiv)
            return (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-stone-50 last:border-0">
                <span className="w-16 text-xs text-stone-400">{p.label} 지지</span>
                <div
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                  style={{ backgroundColor: color + '18' }}
                >
                  <span className="text-base font-bold" style={{ color }}>{branch.hanja}</span>
                  <span className="text-xs" style={{ color }}>{branch.ko}</span>
                  <span className="text-xs text-stone-400">{branch.animal}</span>
                </div>
                <div className="flex-1" />
                {sipsin ? (
                  <SipsinBadge name={sipsin} />
                ) : (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-lg font-bold">나 (我)</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
