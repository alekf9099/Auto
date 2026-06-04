import type { SajuResult } from '../types'
import { STEMS, BRANCHES, ELEMENT_COLORS } from '../utils/constants'
import { getSipsin, pillarName } from '../utils/saju'

interface Props {
  result: SajuResult
  birthYear: number
  currentYear?: number
}

export default function DaunChart({ result, birthYear, currentYear = new Date().getFullYear() }: Props) {
  const { daun, daunStartAge, isForward } = result
  const dayStemIdx = result.dayPillar.stemIndex

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-stone-700 font-korean">대운 (大運)</h2>
        <span className="text-xs bg-stone-100 text-stone-500 px-2 py-1 rounded-full">
          {isForward ? '순행(順行) ▶' : '역행(逆行) ◀'} · {daunStartAge}세 시작
        </span>
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <div className="flex gap-2 min-w-max pb-2">
          {daun.map((entry) => {
            const age     = entry.age
            const ageYear = birthYear + age
            const isCurrent = ageYear <= currentYear && currentYear < ageYear + 10
            const stem    = STEMS[entry.pillar.stemIndex]
            const branch  = BRANCHES[entry.pillar.branchIndex]
            const stemColor   = ELEMENT_COLORS[stem.element]
            const branchColor = ELEMENT_COLORS[branch.element]
            const sipsinStem  = getSipsin(dayStemIdx, entry.pillar.stemIndex)
            const branchStemEquiv = branch.element === 'wood'  ? (branch.yinYang === 'yang' ? 0 : 1)
                                  : branch.element === 'fire'  ? (branch.yinYang === 'yang' ? 2 : 3)
                                  : branch.element === 'earth' ? (branch.yinYang === 'yang' ? 4 : 5)
                                  : branch.element === 'metal' ? (branch.yinYang === 'yang' ? 6 : 7)
                                  : branch.yinYang === 'yang'  ? 8 : 9
            const sipsinBranch = getSipsin(dayStemIdx, branchStemEquiv)

            return (
              <div
                key={age}
                className={`flex flex-col items-center rounded-2xl p-3 min-w-[76px] border-2 transition-all ${
                  isCurrent
                    ? 'border-amber-400 bg-amber-50 shadow-md'
                    : 'border-stone-100 bg-stone-50'
                }`}
              >
                {isCurrent && (
                  <span className="text-xs bg-amber-400 text-white px-1.5 py-0.5 rounded-full mb-1 font-bold">현재</span>
                )}
                <span className="text-xs text-stone-400 mb-1">{age}세</span>
                <span className="text-xs text-stone-300">{ageYear}~</span>

                {/* 천간 */}
                <div
                  className="mt-2 w-10 h-10 rounded-xl flex flex-col items-center justify-center border"
                  style={{ borderColor: stemColor + '60', backgroundColor: stemColor + '15' }}
                >
                  <span className="text-base font-bold leading-none" style={{ color: stemColor }}>{stem.hanja}</span>
                  <span className="text-xs" style={{ color: stemColor }}>{stem.ko}</span>
                </div>
                <span className="text-xs mt-0.5 text-stone-400">{sipsinStem}</span>

                {/* 지지 */}
                <div
                  className="mt-1 w-10 h-12 rounded-xl flex flex-col items-center justify-center border"
                  style={{ borderColor: branchColor + '60', backgroundColor: branchColor + '15' }}
                >
                  <span className="text-base font-bold leading-none" style={{ color: branchColor }}>{branch.hanja}</span>
                  <span className="text-xs" style={{ color: branchColor }}>{branch.ko}</span>
                </div>
                <span className="text-xs mt-0.5 text-stone-400">{sipsinBranch}</span>
                <span className="text-xs text-stone-300 mt-1">{pillarName(entry.pillar)}</span>
              </div>
            )
          })}
        </div>
      </div>

      <p className="text-xs text-stone-400 mt-3">
        * 대운은 10년 단위로 운의 흐름을 보여줍니다. 절기 날짜는 근사값이므로 참고용으로 활용하세요.
      </p>
    </div>
  )
}
