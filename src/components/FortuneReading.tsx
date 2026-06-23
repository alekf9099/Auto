import type { SajuResult, OhaengCount } from '../types'
import { STEMS, BRANCHES, ELEMENT_COLORS, ILJU_MEANING } from '../utils/constants'

interface Props { result: SajuResult; count: OhaengCount }

const KEYWORDS: Record<string, string[]> = {
  wood: ['성장','발전','인내','창의성','계획'], fire: ['열정','표현','사교','명예','순발력'],
  earth: ['안정','신뢰','포용','중재','현실감'], metal: ['결단','원칙','정의','의지','집중력'],
  water: ['지혜','적응','직관','내면','탐구'],
}
const CAREER: Record<string, string[]> = {
  wood: ['교육','의료','환경','문화예술','출판/기획'], fire: ['언론/방송','연예','영업/마케팅','요식업','디자인'],
  earth: ['부동산','건설','금융','농업','관리직'], metal: ['법조','군경','금융','기계/공학','스포츠'],
  water: ['IT/연구','철학/종교','유통','물류','심리상담'],
}

export default function FortuneReading({ result, count }: Props) {
  const dayStem   = STEMS[result.dayPillar.stemIndex]
  const dayBranch = BRANCHES[result.dayPillar.branchIndex]
  const elements  = ['wood','fire','earth','metal','water'] as const
  const strongest = elements.reduce((a, b) => count[a] >= count[b] ? a : b)
  const weakest   = elements.reduce((a, b) => count[a] <= count[b] ? a : b)
  const isBalanced = Math.max(...Object.values(count)) - Math.min(...Object.values(count)) <= 1
  const sc = ELEMENT_COLORS[dayStem.element]

  return (
    <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-5 bg-[#C9962A] rounded-full" />
        <h2 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>명식 해석 (命式)</h2>
      </div>

      {/* 일주 특성 */}
      <div className="rounded-2xl p-4 mb-3 border" style={{ backgroundColor: sc + '0D', borderColor: sc + '30' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl font-bold" style={{ color: sc }}>{dayStem.hanja}{dayBranch.hanja}</span>
          <span className="text-xs text-[#7B6F9A] bg-[#231844] px-2 py-0.5 rounded-full">일주 특성</span>
        </div>
        <p className="text-sm text-[#C4B8D8] leading-relaxed">{ILJU_MEANING[result.dayPillar.stemIndex]}</p>
      </div>

      {/* 오행 균형 */}
      <div className="rounded-2xl bg-[#C9962A15] border border-[#C9962A30] p-4 mb-3">
        <p className="text-xs font-semibold text-[#C9962A] mb-2">🔮 오행 균형 분석</p>
        {isBalanced ? (
          <p className="text-sm text-[#C4B8D8]">오행이 고르게 분포되어 있습니다. 한쪽에 치우치지 않으니 다양한 분야에서 그대로 능력을 발휘하세요. 환경을 가리지 않고 적응하는 것이 당신의 가장 큰 무기입니다.</p>
        ) : (
          <p className="text-sm text-[#C4B8D8]">
            <strong style={{ color: ELEMENT_COLORS[strongest] }}>{KEYWORDS[strongest][0]}</strong>과{' '}
            <strong style={{ color: ELEMENT_COLORS[strongest] }}>{KEYWORDS[strongest][1]}</strong>의 기운이 강하게 작용합니다.{' '}
            {count[weakest] === 0
              ? <><strong className="text-[#F5EDD4]">{weakest === 'wood' ? '목(木)' : weakest === 'fire' ? '화(火)' : weakest === 'earth' ? '토(土)' : weakest === 'metal' ? '금(金)' : '수(水)'}</strong>의 기운이 완전히 비어 있습니다. 지금 관련 색상과 방위를 의식적으로 채우세요.</>
              : <>약한 기운을 그대로 두면 한쪽으로 치우친 삶이 굳어집니다. 지금 의식적으로 보완하세요.</>}
          </p>
        )}
      </div>

      {/* 적성 */}
      <div className="rounded-2xl bg-[#1C1438] border border-[#2A1F4A] p-4 mb-3">
        <p className="text-xs font-semibold text-[#C4B8D8] mb-2.5">💼 적성 &amp; 직업</p>
        <div className="flex flex-wrap gap-1.5">
          {[...CAREER[strongest], ...CAREER[dayStem.element]]
            .filter((v, i, a) => a.indexOf(v) === i).slice(0, 6)
            .map(c => (
              <span key={c} className="text-xs px-2.5 py-1 rounded-full border font-medium"
                style={{ backgroundColor: sc + '10', borderColor: sc + '30', color: sc }}>
                {c}
              </span>
            ))}
        </div>
      </div>

      {/* 키워드 */}
      <div className="rounded-2xl bg-[#1C1438] border border-[#2A1F4A] p-4">
        <p className="text-xs font-semibold text-[#C4B8D8] mb-2.5">✨ 핵심 키워드</p>
        <div className="flex flex-wrap gap-1.5">
          {[...KEYWORDS[dayStem.element], ...KEYWORDS[strongest]]
            .filter((v, i, a) => a.indexOf(v) === i).slice(0, 6)
            .map(kw => (
              <span key={kw} className="text-xs bg-[#C9962A20] text-[#C9962A] border border-[#C9962A40] px-2.5 py-1 rounded-full font-medium">{kw}</span>
            ))}
        </div>
      </div>

      <p className="text-xs text-[#4A4060] mt-4 text-center">※ 본 해석은 참고용이며, 전문 역술가의 상담을 권장합니다.</p>
    </div>
  )
}
