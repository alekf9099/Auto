import type { SajuResult } from '../types'
import { STEMS, BRANCHES, ELEMENT_COLORS, SIPSIN_DESC } from '../utils/constants'
import { getSipsin } from '../utils/saju'

interface Props { result: SajuResult }

const BADGE: Record<string, string> = {
  비견: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  겁재: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  식신: 'bg-orange-50 text-orange-700 border-orange-200',
  상관: 'bg-orange-100 text-orange-800 border-orange-300',
  편재: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  정재: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  편관: 'bg-red-50 text-red-700 border-red-200',
  정관: 'bg-red-100 text-red-800 border-red-300',
  편인: 'bg-blue-50 text-blue-700 border-blue-200',
  정인: 'bg-blue-100 text-blue-800 border-blue-300',
}

function SipsinBadge({ name }: { name: string }) {
  const desc = SIPSIN_DESC[name]
  return (
    <div className="text-right">
      <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-bold border ${BADGE[name] ?? 'bg-stone-100 text-stone-600 border-stone-200'}`}>{name}</span>
      {desc && <p className="text-xs text-stone-400 mt-0.5">{desc.meaning}</p>}
    </div>
  )
}

export default function SipsinChart({ result }: Props) {
  const dayStemIdx = result.dayPillar.stemIndex
  const dayStem    = STEMS[dayStemIdx]
  const pillars    = [result.yearPillar, result.monthPillar, result.dayPillar]
  if (result.hourPillar) pillars.push(result.hourPillar)

  return (
    <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_16px_rgba(124,58,237,0.07)] p-6">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-5 bg-violet-500 rounded-full" />
        <h2 className="text-base font-bold text-stone-800" style={{ fontFamily: "'Noto Serif KR', serif" }}>십신 분석 (十神)</h2>
      </div>
      <p className="text-xs text-stone-400 mb-5 ml-3">
        일간 <span className="font-bold" style={{ color: ELEMENT_COLORS[dayStem.element] }}>{dayStem.hanja}({dayStem.ko})</span> 기준
      </p>

      {/* 천간 */}
      <div className="space-y-1 mb-5">
        {pillars.map((p, i) => {
          const stem = STEMS[p.stemIndex], c = ELEMENT_COLORS[stem.element]
          const sipsin = p.label === '일주' ? null : getSipsin(dayStemIdx, p.stemIndex)
          return (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-stone-50 last:border-0">
              <span className="w-14 text-xs text-stone-400">{p.label} 천간</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl" style={{ backgroundColor: c + '12' }}>
                <span className="text-base font-bold" style={{ color: c }}>{stem.hanja}</span>
                <span className="text-xs" style={{ color: c + 'cc' }}>{stem.ko}</span>
              </div>
              <div className="flex-1" />
              {sipsin
                ? <SipsinBadge name={sipsin} />
                : <span className="text-xs bg-violet-50 text-violet-600 border border-violet-200 px-2 py-0.5 rounded-lg font-bold">나 (我)</span>}
            </div>
          )
        })}
      </div>

      {/* 지지 */}
      <div className="border-t border-stone-100 pt-4">
        <p className="text-xs text-stone-400 mb-3">지지 (地支) 장간 기준</p>
        <div className="space-y-1">
          {pillars.map((p, i) => {
            const branch = BRANCHES[p.branchIndex], c = ELEMENT_COLORS[branch.element]
            const equiv  = branch.element === 'wood'  ? (branch.yinYang === 'yang' ? 0 : 1)
                         : branch.element === 'fire'  ? (branch.yinYang === 'yang' ? 2 : 3)
                         : branch.element === 'earth' ? (branch.yinYang === 'yang' ? 4 : 5)
                         : branch.element === 'metal' ? (branch.yinYang === 'yang' ? 6 : 7)
                         : branch.yinYang === 'yang'  ? 8 : 9
            const sipsin = p.label === '일주' ? null : getSipsin(dayStemIdx, equiv)
            return (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b border-stone-50 last:border-0">
                <span className="w-14 text-xs text-stone-400">{p.label} 지지</span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl" style={{ backgroundColor: c + '12' }}>
                  <span className="text-base font-bold" style={{ color: c }}>{branch.hanja}</span>
                  <span className="text-xs" style={{ color: c + 'cc' }}>{branch.ko}</span>
                  <span className="text-xs text-stone-400">{branch.animal}</span>
                </div>
                <div className="flex-1" />
                {sipsin
                  ? <SipsinBadge name={sipsin} />
                  : <span className="text-xs bg-violet-50 text-violet-600 border border-violet-200 px-2 py-0.5 rounded-lg font-bold">나 (我)</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
