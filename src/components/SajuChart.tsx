import type { SajuResult } from '../types'
import { STEMS, BRANCHES, ELEMENT_COLORS } from '../utils/constants'

interface Props {
  result: SajuResult
}

function PillarCell({ label, stemIndex, branchIndex, compact = false }: {
  label: string; stemIndex: number; branchIndex: number; compact?: boolean
}) {
  const stem   = STEMS[stemIndex]
  const branch = BRANCHES[branchIndex]
  const stemColor   = ELEMENT_COLORS[stem.element]
  const branchColor = ELEMENT_COLORS[branch.element]

  const cardW    = compact ? 'w-12' : 'w-16'
  const stemH    = compact ? 'h-12' : 'h-16'
  const branchH  = compact ? 'h-14' : 'h-20'
  const hanja    = compact ? 'text-xl' : 'text-2xl'

  return (
    <div className="flex flex-col items-center">
      <span className={`${compact ? 'text-[10px]' : 'text-xs'} text-stone-400 mb-2 font-medium text-center leading-tight`}>{label}</span>

      {/* 천간 */}
      <div
        className={`${cardW} ${stemH} rounded-2xl flex flex-col items-center justify-center border-2 mb-1 shadow-sm`}
        style={{ borderColor: stemColor, backgroundColor: stemColor + '15' }}
      >
        <span className={`${hanja} font-bold`} style={{ color: stemColor }}>{stem.hanja}</span>
        <span className="text-xs font-medium" style={{ color: stemColor }}>{stem.ko}</span>
      </div>
      <div className="text-xs text-stone-400 mb-2" style={{ color: stemColor + 'bb' }}>
        {stem.element === 'wood' ? '목' : stem.element === 'fire' ? '화' : stem.element === 'earth' ? '토' : stem.element === 'metal' ? '금' : '수'}
        {stem.yinYang === 'yang' ? '양' : '음'}
      </div>

      {/* 지지 */}
      <div
        className={`${cardW} ${branchH} rounded-2xl flex flex-col items-center justify-center border-2 shadow-sm`}
        style={{ borderColor: branchColor, backgroundColor: branchColor + '15' }}
      >
        <span className={`${hanja} font-bold`} style={{ color: branchColor }}>{branch.hanja}</span>
        <span className="text-xs font-medium" style={{ color: branchColor }}>{branch.ko}</span>
        {!compact && <span className="text-xs mt-0.5" style={{ color: branchColor + 'aa' }}>{branch.animal}</span>}
        {compact  && <span className="text-[10px] mt-0.5" style={{ color: branchColor + 'aa' }}>{branch.animal}</span>}
      </div>
      <div className="text-xs mt-1" style={{ color: branchColor + 'bb' }}>
        {branch.element === 'wood' ? '목' : branch.element === 'fire' ? '화' : branch.element === 'earth' ? '토' : branch.element === 'metal' ? '금' : '수'}
        {branch.yinYang === 'yang' ? '양' : '음'}
      </div>
    </div>
  )
}

export default function SajuChart({ result }: Props) {
  const { yearPillar, monthPillar, dayPillar, hourPillar, minutePillar } = result

  const compact = !!minutePillar

  const pillars = (() => {
    const base = compact
      ? [
          { ...dayPillar,   label: '일주' },
          { ...monthPillar, label: '월주' },
          { ...yearPillar,  label: '년주' },
        ]
      : [
          { ...dayPillar,   label: '일주(日柱)' },
          { ...monthPillar, label: '월주(月柱)' },
          { ...yearPillar,  label: '년주(年柱)' },
        ]
    if (hourPillar)   base.unshift({ ...hourPillar,   label: compact ? '시주' : '시주(時柱)' })
    if (minutePillar) base.unshift({ ...minutePillar, label: '분주(分柱)' })
    return base
  })()

  const title = minutePillar
    ? '오주십자 (五柱十字)'
    : '사주팔자 (四柱八字)'

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6">
      <h2 className="text-lg font-bold text-stone-700 mb-5 font-korean">
        {title}
      </h2>

      <div className={`flex justify-center ${compact ? 'gap-2' : 'gap-4'}`}>
        {pillars.map(p => (
          <PillarCell
            key={p.label}
            label={p.label}
            stemIndex={p.stemIndex}
            branchIndex={p.branchIndex}
            compact={compact}
          />
        ))}
      </div>

      {/* 일주 특성 */}
      <div className="mt-5 pt-5 border-t border-stone-100">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">일주</span>
          <span className="text-sm font-semibold text-stone-700">
            {STEMS[dayPillar.stemIndex].hanja}{BRANCHES[dayPillar.branchIndex].hanja}
            &nbsp;({STEMS[dayPillar.stemIndex].ko}{BRANCHES[dayPillar.branchIndex].ko}일)
          </span>
        </div>
        <p className="text-sm text-stone-500 leading-relaxed">
          일간 <strong>{STEMS[dayPillar.stemIndex].hanja}({STEMS[dayPillar.stemIndex].ko})</strong>이
          본명(本命)입니다. {STEMS[dayPillar.stemIndex].element === 'wood' ? '목(木)' : STEMS[dayPillar.stemIndex].element === 'fire' ? '화(火)' : STEMS[dayPillar.stemIndex].element === 'earth' ? '토(土)' : STEMS[dayPillar.stemIndex].element === 'metal' ? '금(金)' : '수(水)'}
          {STEMS[dayPillar.stemIndex].yinYang === 'yang' ? ' 양(陽)' : ' 음(陰)'}의 기운을 지닌 명식입니다.
        </p>
      </div>
    </div>
  )
}
