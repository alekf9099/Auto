import type { SajuResult } from '../types'
import { STEMS, BRANCHES, ELEMENT_COLORS, SIPSIN_DESC } from '../utils/constants'
import { getSipsin } from '../utils/saju'

interface Props { result: SajuResult }

const SIPSIN_PLAIN: Record<string, string> = {
  비견: '나와 비슷한 경쟁자가 늘고 독립 욕구가 강해집니다',
  겁재: '충동적 결정이 재물 손실을 부를 수 있으니 신중해야 합니다',
  식신: '하고 싶은 것을 마음껏 할 수 있는 여유롭고 풍요로운 별입니다',
  상관: '창의력이 폭발하고 기존 틀을 깨고 싶어지는 변화의 별입니다',
  편재: '돈이 크게 움직이는 투자와 기회의 별, 리스크도 함께 옵니다',
  정재: '착실한 노력이 안정적인 결실로 돌아오는 성실 보상의 별입니다',
  편관: '외부 압박이 강해지지만 이겨내면 큰 도약이 기다리는 별입니다',
  정관: '조직에서 인정받고 명예와 승진이 따르는 안정 성취의 별입니다',
  편인: '새 학문이나 특이한 재능이 개발되고 이동이 잦아지는 별입니다',
  정인: '배움과 안정, 귀인의 도움이 함께 찾아오는 풍요로운 별입니다',
}

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
  const desc  = SIPSIN_DESC[name]
  const plain = SIPSIN_PLAIN[name]
  return (
    <div className="text-right max-w-[180px]">
      <div className="flex items-center justify-end gap-1.5 mb-0.5">
        <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-bold border ${BADGE[name] ?? 'bg-[#E3D0A4] text-[#6E5836] border-[#D8C290]'}`}>{name}</span>
        {desc && <span className="text-[10px] text-[#9A8155]">{desc.meaning}</span>}
      </div>
      {plain && (
        <p className="text-[10px] text-[#9A6A12]/80 leading-snug">
          💬 {plain}
        </p>
      )}
    </div>
  )
}

export default function SipsinChart({ result }: Props) {
  const dayStemIdx = result.dayPillar.stemIndex
  const dayStem    = STEMS[dayStemIdx]
  const pillars    = [result.yearPillar, result.monthPillar, result.dayPillar]
  if (result.hourPillar) pillars.push(result.hourPillar)

  return (
    <div className="bg-[#FBF4E2] rounded-3xl border border-[#D8C290] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-6">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-5 bg-[#9A6A12] rounded-full" />
        <h2 className="text-base font-bold text-[#3B2A16]" style={{ fontFamily: "'Gowun Batang', serif" }}>십신 분석 (十神)</h2>
      </div>
      <p className="text-xs text-[#9A8155] mb-5 ml-3">
        일간 <span className="font-bold" style={{ color: ELEMENT_COLORS[dayStem.element] }}>{dayStem.hanja}({dayStem.ko})</span> 기준
      </p>

      {/* 천간 */}
      <div className="space-y-1 mb-5">
        {pillars.map((p, i) => {
          const stem = STEMS[p.stemIndex], c = ELEMENT_COLORS[stem.element]
          const sipsin = p.label === '일주' ? null : getSipsin(dayStemIdx, p.stemIndex)
          return (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-[#E9DAB8] last:border-0">
              <span className="w-16 text-xs text-[#9A8155] whitespace-nowrap">{p.label} 천간</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl" style={{ backgroundColor: c + '12' }}>
                <span className="text-base font-bold" style={{ color: c }}>{stem.hanja}</span>
                <span className="text-xs" style={{ color: c + 'cc' }}>{stem.ko}</span>
              </div>
              <div className="flex-1" />
              {sipsin
                ? <SipsinBadge name={sipsin} />
                : <span className="text-xs bg-[#9A6A1220] text-[#9A6A12] border border-[#9A6A1240] px-2 py-0.5 rounded-lg font-bold">나 (我)</span>}
            </div>
          )
        })}
      </div>

      {/* 지지 */}
      <div className="border-t border-[#D8C290] pt-4">
        <p className="text-xs text-[#9A8155] mb-3">지지 (地支) 장간 기준</p>
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
              <div key={i} className="flex items-center gap-3 py-2.5 border-b border-[#E9DAB8] last:border-0">
                <span className="w-16 text-xs text-[#9A8155] whitespace-nowrap">{p.label} 지지</span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl" style={{ backgroundColor: c + '12' }}>
                  <span className="text-base font-bold" style={{ color: c }}>{branch.hanja}</span>
                  <span className="text-xs" style={{ color: c + 'cc' }}>{branch.ko}</span>
                  <span className="text-xs text-[#9A8155]">{branch.animal}</span>
                </div>
                <div className="flex-1" />
                {sipsin
                  ? <SipsinBadge name={sipsin} />
                  : <span className="text-xs bg-[#9A6A1220] text-[#9A6A12] border border-[#9A6A1240] px-2 py-0.5 rounded-lg font-bold">나 (我)</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
