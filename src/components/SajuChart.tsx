import type { SajuResult } from '../types'
import { STEMS, BRANCHES, ELEMENT_COLORS } from '../utils/constants'

interface Props { result: SajuResult }

function PillarCell({ label, stemIndex, branchIndex, compact = false }: {
  label: string; stemIndex: number; branchIndex: number; compact?: boolean
}) {
  const stem   = STEMS[stemIndex]
  const branch = BRANCHES[branchIndex]
  const sc = ELEMENT_COLORS[stem.element]
  const bc = ELEMENT_COLORS[branch.element]

  const cardW   = compact ? 'w-12' : 'w-16'
  const stemH   = compact ? 'h-12' : 'h-16'
  const branchH = compact ? 'h-14' : 'h-20'
  const hanja   = compact ? 'text-xl' : 'text-2xl'

  return (
    <div className="flex flex-col items-center">
      <span className={`${compact ? 'text-[10px]' : 'text-xs'} text-[#A79CC2] mb-2 font-medium text-center leading-tight`}>{label}</span>
      <div
        className={`${cardW} ${stemH} rounded-2xl flex flex-col items-center justify-center border-2 mb-1 shadow-sm`}
        style={{ borderColor: sc + '50', backgroundColor: sc + '12' }}
      >
        <span className={`${hanja} font-bold`} style={{ color: sc }}>{stem.hanja}</span>
        <span className="text-xs font-medium" style={{ color: sc + 'cc' }}>{stem.ko}</span>
      </div>
      <div className="text-xs mb-2 text-[#A79CC2]">
        {stem.element === 'wood' ? '목' : stem.element === 'fire' ? '화' : stem.element === 'earth' ? '토' : stem.element === 'metal' ? '금' : '수'}
        {stem.yinYang === 'yang' ? '양' : '음'}
      </div>
      <div
        className={`${cardW} ${branchH} rounded-2xl flex flex-col items-center justify-center border-2 shadow-sm`}
        style={{ borderColor: bc + '50', backgroundColor: bc + '12' }}
      >
        <span className={`${hanja} font-bold`} style={{ color: bc }}>{branch.hanja}</span>
        <span className="text-xs font-medium" style={{ color: bc + 'cc' }}>{branch.ko}</span>
        <span className="text-[11px] mt-0.5" style={{ color: bc + '99' }}>{branch.animal}</span>
      </div>
      <div className="text-xs mt-1 text-[#A79CC2]">
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
      ? [{ ...dayPillar, label: '일주' }, { ...monthPillar, label: '월주' }, { ...yearPillar, label: '년주' }]
      : [{ ...dayPillar, label: '일주(日柱)' }, { ...monthPillar, label: '월주(月柱)' }, { ...yearPillar, label: '년주(年柱)' }]
    if (hourPillar)   base.unshift({ ...hourPillar,   label: compact ? '시주' : '시주(時柱)' })
    if (minutePillar) base.unshift({ ...minutePillar, label: '분주(分柱)' })
    return base
  })()

  return (
    <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-5 bg-[#C9962A] rounded-full" />
        <h2 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>
          {minutePillar ? '오주십자 (五柱十字)' : '사주팔자 (四柱八字)'}
        </h2>
      </div>

      <div className={`flex justify-center ${compact ? 'gap-2' : 'gap-4'}`}>
        {pillars.map(p => (
          <PillarCell key={p.label} label={p.label} stemIndex={p.stemIndex} branchIndex={p.branchIndex} compact={compact} />
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-[#2A1F4A]">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs bg-[#C9962A20] text-[#C9962A] border border-[#C9962A40] px-2 py-0.5 rounded-full font-medium">일주</span>
          <span className="text-sm font-semibold text-[#F5EDD4]">
            {STEMS[dayPillar.stemIndex].hanja}{BRANCHES[dayPillar.branchIndex].hanja}
            <span className="text-[#A79CC2] font-normal text-xs ml-1">({STEMS[dayPillar.stemIndex].ko}{BRANCHES[dayPillar.branchIndex].ko}일)</span>
          </span>
        </div>
        <p className="text-sm text-[#BCB1D4] leading-relaxed">
          일간 <strong className="text-[#E8DFC8]">{STEMS[dayPillar.stemIndex].hanja}({STEMS[dayPillar.stemIndex].ko})</strong>이 본명(本命)입니다.{' '}
          {STEMS[dayPillar.stemIndex].element === 'wood' ? '목(木)' : STEMS[dayPillar.stemIndex].element === 'fire' ? '화(火)' : STEMS[dayPillar.stemIndex].element === 'earth' ? '토(土)' : STEMS[dayPillar.stemIndex].element === 'metal' ? '금(金)' : '수(水)'}
          {STEMS[dayPillar.stemIndex].yinYang === 'yang' ? ' 양(陽)' : ' 음(陰)'}의 기운을 지닌 명식입니다.
        </p>
      </div>
    </div>
  )
}
