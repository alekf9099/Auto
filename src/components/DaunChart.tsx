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
    <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2
          className="text-base font-bold text-white"
          style={{ fontFamily: "'Noto Serif KR', serif" }}
        >
          대운 (大運)
        </h2>
        <span className="text-xs bg-zinc-800 text-zinc-400 border border-zinc-700 px-2.5 py-1 rounded-full">
          {isForward ? '순행 ▶' : '역행 ◀'} · {daunStartAge}세
        </span>
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
                    ? 'border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                    : 'border-zinc-700/60 bg-zinc-800/40'
                }`}
              >
                {isCurrent && (
                  <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full mb-1 font-bold">현재</span>
                )}
                <span className="text-xs text-zinc-500 mb-0.5">{age}세</span>
                <span className="text-[10px] text-zinc-600">{ageYear}~</span>

                {/* 천간 */}
                <div
                  className="mt-2 w-10 h-10 rounded-xl flex flex-col items-center justify-center border"
                  style={{ borderColor: stemColor + '40', backgroundColor: stemColor + '12' }}
                >
                  <span className="text-base font-bold leading-none" style={{ color: stemColor }}>{stem.hanja}</span>
                  <span className="text-[10px]" style={{ color: stemColor + 'cc' }}>{stem.ko}</span>
                </div>
                <span className="text-[10px] mt-1 text-zinc-500">{sipsinStem}</span>

                {/* 지지 */}
                <div
                  className="mt-1 w-10 h-12 rounded-xl flex flex-col items-center justify-center border"
                  style={{ borderColor: branchColor + '40', backgroundColor: branchColor + '12' }}
                >
                  <span className="text-base font-bold leading-none" style={{ color: branchColor }}>{branch.hanja}</span>
                  <span className="text-[10px]" style={{ color: branchColor + 'cc' }}>{branch.ko}</span>
                </div>
                <span className="text-[10px] mt-1 text-zinc-500">{sipsinBranch}</span>
                <span className="text-[10px] text-zinc-600 mt-1">{pillarName(entry.pillar)}</span>
              </div>
            )
          })}
        </div>
      </div>

      <p className="text-xs text-zinc-700 mt-3">
        * 대운은 10년 단위로 운의 흐름을 보여줍니다. 절기 날짜는 근사값이므로 참고용으로 활용하세요.
      </p>
    </div>
  )
}
