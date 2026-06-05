import type { SajuResult } from '../types'
import { STEMS, BRANCHES, ELEMENT_COLORS, SIPSIN_DESC } from '../utils/constants'
import { getSipsin } from '../utils/saju'

interface Props {
  result: SajuResult
}

const BADGE_COLORS: Record<string, string> = {
  비견: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  겁재: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
  식신: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  상관: 'bg-orange-500/20 text-orange-300 border-orange-400/30',
  편재: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  정재: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
  편관: 'bg-red-500/15 text-red-400 border-red-500/25',
  정관: 'bg-red-500/20 text-red-300 border-red-400/30',
  편인: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  정인: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
}

function SipsinBadge({ name }: { name: string }) {
  const desc = SIPSIN_DESC[name]
  return (
    <div className="text-right">
      <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-bold border ${BADGE_COLORS[name] ?? 'bg-zinc-700 text-zinc-300 border-zinc-600'}`}>
        {name}
      </span>
      {desc && <p className="text-xs text-zinc-600 mt-0.5">{desc.meaning}</p>}
    </div>
  )
}

export default function SipsinChart({ result }: Props) {
  const dayStemIdx = result.dayPillar.stemIndex
  const dayStem    = STEMS[dayStemIdx]

  const pillars = [result.yearPillar, result.monthPillar, result.dayPillar]
  if (result.hourPillar) pillars.push(result.hourPillar)

  const rows = pillars.map(p => ({
    label:   p.label,
    stemIdx: p.stemIndex,
    sipsin:  p.label === '일주' ? null : getSipsin(dayStemIdx, p.stemIndex),
  }))

  return (
    <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6">
      <h2
        className="text-base font-bold text-white mb-1"
        style={{ fontFamily: "'Noto Serif KR', serif" }}
      >
        십신 분석 (十神)
      </h2>
      <p className="text-xs text-zinc-500 mb-5">
        일간{' '}
        <span className="font-bold" style={{ color: ELEMENT_COLORS[dayStem.element] }}>
          {dayStem.hanja}({dayStem.ko})
        </span>{' '}
        기준
      </p>

      {/* 천간 */}
      <div className="space-y-1 mb-5">
        {rows.map((r, i) => {
          const stem  = STEMS[r.stemIdx]
          const color = ELEMENT_COLORS[stem.element]
          return (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-zinc-800/60 last:border-0">
              <span className="w-14 text-xs text-zinc-500">{r.label} 천간</span>
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
                style={{ backgroundColor: color + '15' }}
              >
                <span className="text-base font-bold" style={{ color }}>{stem.hanja}</span>
                <span className="text-xs" style={{ color: color + 'cc' }}>{stem.ko}</span>
              </div>
              <div className="flex-1" />
              {r.sipsin
                ? <SipsinBadge name={r.sipsin} />
                : <span className="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/25 px-2 py-0.5 rounded-lg font-bold">나 (我)</span>
              }
            </div>
          )
        })}
      </div>

      {/* 지지 */}
      <div className="border-t border-zinc-800 pt-4">
        <p className="text-xs text-zinc-500 mb-3">지지 (地支) 장간 기준</p>
        <div className="space-y-1">
          {pillars.map((p, i) => {
            const branch = BRANCHES[p.branchIndex]
            const color  = ELEMENT_COLORS[branch.element]
            const equiv  = branch.element === 'wood'  ? (branch.yinYang === 'yang' ? 0 : 1)
                         : branch.element === 'fire'  ? (branch.yinYang === 'yang' ? 2 : 3)
                         : branch.element === 'earth' ? (branch.yinYang === 'yang' ? 4 : 5)
                         : branch.element === 'metal' ? (branch.yinYang === 'yang' ? 6 : 7)
                         : branch.yinYang === 'yang'  ? 8 : 9
            const sipsin = p.label === '일주' ? null : getSipsin(dayStemIdx, equiv)
            return (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b border-zinc-800/60 last:border-0">
                <span className="w-14 text-xs text-zinc-500">{p.label} 지지</span>
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
                  style={{ backgroundColor: color + '15' }}
                >
                  <span className="text-base font-bold" style={{ color }}>{branch.hanja}</span>
                  <span className="text-xs" style={{ color: color + 'cc' }}>{branch.ko}</span>
                  <span className="text-xs text-zinc-600">{branch.animal}</span>
                </div>
                <div className="flex-1" />
                {sipsin
                  ? <SipsinBadge name={sipsin} />
                  : <span className="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/25 px-2 py-0.5 rounded-lg font-bold">나 (我)</span>
                }
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
