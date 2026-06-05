import { useState } from 'react'
import type { SajuResult, OhaengCount } from '../types'
import { STEMS, BRANCHES, ELEMENT_COLORS } from '../utils/constants'
import { calculateSaju, getSipsin } from '../utils/saju'
import { MONTHLY_FORTUNE, YEARLY_FORTUNE } from '../utils/fortuneData'

// ── 일운 데이터 (DailyFortune에서 통합) ──────────────────────────────
interface DayFortune {
  star: number
  총평: string
  재물: string
  애정: string
  건강: string
  직업: string
  시간오전: string
  시간오후: string
  시간저녁: string
  조언: string
  주의: string
  color: string
}

const DAY_FORTUNE: Record<string, DayFortune> = {
  비견: {
    star: 3, color: '#4CAF50',
    총평: '자신감이 넘치는 날입니다. 독립적으로 행동할 때 좋은 결과를 얻을 수 있지만, 지나친 고집은 주변과의 갈등을 만들 수 있습니다.',
    재물: '경쟁심에서 비롯된 충동 소비를 조심하세요. 계획된 지출만 실행하고 큰 거래는 피하는 것이 안전합니다.',
    애정: '자기중심적 성향이 강해지는 날입니다. 파트너의 의견을 먼저 들어주는 노력이 관계를 지킵니다.',
    건강: '에너지가 넘치지만 무리한 경쟁으로 체력이 소모될 수 있습니다. 적당한 휴식을 취하세요.',
    직업: '동료와의 경쟁 속에서 실력을 발휘할 기회가 생깁니다. 협력과 경쟁의 균형을 유지하세요.',
    시간오전: '에너지가 높아 독립적인 작업을 시작하기 좋습니다.',
    시간오후: '경쟁 상황이 생길 수 있습니다. 감정 조절에 신경 쓰세요.',
    시간저녁: '과도한 경쟁심을 내려놓고 충분히 쉬세요.',
    조언: '자신의 강점을 살리되 상대방과의 협력을 잊지 마세요.',
    주의: '충동 소비, 독선적 태도, 과도한 경쟁',
  },
  겁재: {
    star: 2, color: '#FF9800',
    총평: '손재수가 있을 수 있는 날입니다. 충동적인 결정을 삼가고 중요한 거래나 약속은 다음으로 미루세요.',
    재물: '금전 거래는 절대 피하세요. 투자, 대출, 보증 모두 위험한 날입니다.',
    애정: '질투와 오해가 생기기 쉽습니다. 감정적인 대화는 오늘을 피하세요.',
    건강: '사고와 부상에 각별히 주의하세요. 음주는 삼가고 무리한 활동을 자제하세요.',
    직업: '경쟁자의 방해가 생길 수 있습니다. 자신의 계획을 드러내지 말고 조용히 일하세요.',
    시간오전: '충동적 결정은 삼가고 하루 계획을 점검하는 시간으로 활용하세요.',
    시간오후: '금전 거래나 중요한 약속은 피하는 것이 좋습니다.',
    시간저녁: '감정적으로 예민해질 수 있으니 조용히 쉬세요.',
    조언: '오늘은 무리한 도전보다 현상 유지가 최선입니다. 모든 것을 절제하세요.',
    주의: '금전 거래, 충동 결정, 음주, 위험한 활동',
  },
  식신: {
    star: 4, color: '#4CAF50',
    총평: '재능이 빛나고 행운이 따르는 좋은 날입니다. 적극적으로 자신을 표현하면 주변의 인정을 받을 수 있습니다.',
    재물: '노력한 만큼 보상받는 날입니다. 소소한 횡재나 기대 수입이 들어올 수 있습니다.',
    애정: '자연스러운 매력이 빛납니다. 솔로라면 새로운 인연의 기회를, 연인이라면 즐거운 데이트를 즐기세요.',
    건강: '건강하고 활기찬 하루입니다. 좋아하는 음식과 운동을 즐기되 과식은 조심하세요.',
    직업: '창의력과 표현력이 최고조입니다. 기획, 제안, 발표에서 좋은 성과를 기대할 수 있습니다.',
    시간오전: '창의적인 아이디어가 샘솟는 시간입니다. 기록해 두세요.',
    시간오후: '사람들과의 만남이 즐겁고 유익한 시간입니다.',
    시간저녁: '맛있는 식사와 즐거운 여가를 즐기기 좋은 시간입니다.',
    조언: '오늘은 자신감을 가지고 적극적으로 표현하고 행동하세요.',
    주의: '과식, 자만심, 늦은 귀가',
  },
  상관: {
    star: 3, color: '#FF9800',
    총평: '재치와 창의력이 넘치지만 언행에 각별히 주의해야 합니다. 특히 윗사람 앞에서의 표현을 신중하게 하세요.',
    재물: '재주를 통한 수입 가능성이 있지만, 말 실수로 인한 손해도 주의해야 합니다.',
    애정: '매력적이지만 실언이 관계를 해칠 수 있습니다. 상대방 감정을 고려한 표현을 연습하세요.',
    건강: '신경이 예민해지기 쉬운 날입니다. 명상이나 스트레칭으로 긴장을 해소하세요.',
    직업: '좋은 아이디어가 있다면 적절한 방식으로 제안하세요. 직접적인 비판은 자제하세요.',
    시간오전: '새로운 아이디어가 넘치지만 주변 언행을 각별히 조심하세요.',
    시간오후: '혼자 창의적 작업에 집중하는 것이 더 효율적입니다.',
    시간저녁: '감정 기복이 생길 수 있으니 자극적인 대화는 피하세요.',
    조언: '창의력을 발휘하되, 표현 방식을 신중하게 다듬으세요.',
    주의: '경솔한 발언, 충동적 행동, 권위에 대한 반발',
  },
  편재: {
    star: 3, color: '#FF9800',
    총평: '활동적이고 도전적인 날입니다. 새로운 기회가 생기고 재물의 가능성이 있지만, 과욕은 오히려 손해를 부릅니다.',
    재물: '투자나 사업 기회가 찾아올 수 있습니다. 단 일확천금을 노리는 과욕은 절대 금물입니다.',
    애정: '이성에게 인기가 높은 날입니다. 새로운 만남이나 활기찬 데이트에 좋습니다.',
    건강: '활동량이 많아 체력 소모가 큽니다. 정기적인 휴식을 취하고 과음을 삼가세요.',
    직업: '영업, 외부 미팅, 적극적인 제안 등 외향적 업무에서 좋은 성과를 낼 수 있습니다.',
    시간오전: '도전적인 기회가 생기는 시간입니다. 적극적으로 행동하세요.',
    시간오후: '재물 관련 활동과 외부 미팅에 좋습니다.',
    시간저녁: '과도한 지출이나 음주를 조심하세요.',
    조언: '기회를 잡되 무리하지 마세요. 계획된 도전이 성공 확률을 높입니다.',
    주의: '과욕, 충동 투자, 과음',
  },
  정재: {
    star: 4, color: '#4CAF50',
    총평: '안정적이고 착실한 하루입니다. 계획한 일들이 순조롭게 진행되고 성실한 태도가 좋은 결과로 이어집니다.',
    재물: '저축과 안정적인 소비에 좋은 날입니다. 새로운 금융 상품 가입을 검토해 보세요.',
    애정: '신뢰와 안정감이 깊어지는 날입니다. 진지한 대화를 나누기 좋은 날입니다.',
    건강: '규칙적인 생활이 빛나는 날입니다. 가벼운 운동과 규칙적인 식사로 컨디션을 유지하세요.',
    직업: '꼼꼼하고 성실한 업무 태도가 인정받는 날입니다. 기본에 충실한 자세가 빛납니다.',
    시간오전: '계획한 일을 차근차근 진행하기 좋습니다.',
    시간오후: '중요한 협상이나 거래를 처리하기 좋습니다.',
    시간저녁: '가족이나 가까운 사람과 함께하는 시간이 행복을 줍니다.',
    조언: '착실하게 계획대로 행동하면 반드시 좋은 결과가 따릅니다.',
    주의: '게으름, 충동 소비',
  },
  편관: {
    star: 2, color: '#F44336',
    총평: '압박과 스트레스가 높은 날입니다. 무리한 도전은 삼가고, 인내와 절제로 하루를 보내세요.',
    재물: '예상치 못한 지출이 생길 수 있습니다. 큰 거래는 오늘을 반드시 피하세요.',
    애정: '갈등이 생기기 쉬운 날입니다. 감정이 격해지면 대화를 잠시 멈추세요.',
    건강: '스트레스성 증상에 주의하세요. 충분한 휴식이 무엇보다 중요합니다.',
    직업: '상사나 권위자와의 충돌을 조심하세요. 낮은 자세가 필요한 날입니다.',
    시간오전: '신중하게 하루를 시작하세요. 서두르면 실수할 수 있습니다.',
    시간오후: '압박이 가장 심한 시간대입니다. 한 발짝 물러서세요.',
    시간저녁: '가벼운 산책으로 스트레스를 해소하세요. 음주는 금물입니다.',
    조언: '인내하고 낮은 자세를 유지하세요. 이 시련은 반드시 지나갑니다.',
    주의: '감정적 충돌, 음주, 큰 결정, 과격한 운동',
  },
  정관: {
    star: 4, color: '#2196F3',
    총평: '명예와 신뢰가 높아지는 길한 날입니다. 원칙을 지키고 책임감 있게 행동하면 주변의 인정을 받습니다.',
    재물: '안정적인 수입이 기대되는 날입니다. 정직하고 합법적인 방법이 최선입니다.',
    애정: '진지하고 신뢰받는 모습이 상대방에게 깊은 인상을 줍니다.',
    건강: '규칙적인 생활이 건강을 지켜주는 날입니다. 컨디션이 좋은 날입니다.',
    직업: '승진이나 인정받을 가능성이 높습니다. 책임감 있게 행동하세요.',
    시간오전: '규칙적으로 하루를 시작하면 좋은 결과가 따릅니다.',
    시간오후: '중요한 미팅이나 발표에 최적의 시간입니다.',
    시간저녁: '자기계발이나 공부에 집중하기 좋습니다.',
    조언: '원칙과 성실함을 유지하면 최고의 하루가 됩니다.',
    주의: '원칙 위반, 무책임한 행동',
  },
  편인: {
    star: 3, color: '#78909C',
    총평: '내면 성장에 집중하는 날입니다. 혼자만의 시간이 필요하며 사색과 학습이 어울리는 날입니다.',
    재물: '수입보다 지출이 많을 수 있습니다. 절약을 생활화하고 큰 거래는 피하세요.',
    애정: '혼자 있고 싶은 날입니다. 파트너에게 미리 솔직하게 전달하세요.',
    건강: '피로가 쌓이기 쉬운 날입니다. 충분한 수면이 가장 중요합니다.',
    직업: '연구, 분석, 혼자 하는 창작 작업에서 능력이 빛납니다.',
    시간오전: '혼자 사색하거나 공부하기 좋은 시간입니다.',
    시간오후: '개인 작업에 집중하는 것이 더 효율적입니다.',
    시간저녁: '독서나 명상으로 내면을 채우세요. 일찍 취침하는 것이 좋습니다.',
    조언: '자기계발과 내면 탐구에 집중하면 더 큰 성장을 이룹니다.',
    주의: '과로, 충동 소비, 무리한 사교 활동',
  },
  정인: {
    star: 4, color: '#2196F3',
    총평: '학문과 지혜가 빛나는 날입니다. 배우고 성장하는 데 최적이며, 어른이나 스승으로부터 도움을 받을 수 있습니다.',
    재물: '안정적인 흐름입니다. 전문성을 통한 수입 활동이 유리합니다.',
    애정: '포용력이 높아지는 날입니다. 가족과의 시간이 특히 따뜻합니다.',
    건강: '심신이 안정되는 날입니다. 영양 보충과 충분한 휴식을 취하세요.',
    직업: '학습과 발전에 최적의 날입니다. 배움의 기회를 놓치지 마세요.',
    시간오전: '학습과 성장에 최적의 시간입니다.',
    시간오후: '어른이나 스승에게 조언을 구하면 도움을 받을 수 있습니다.',
    시간저녁: '배운 것을 정리하고 가족과 따뜻한 시간을 보내세요.',
    조언: '배우고 성장하는 데 집중하세요. 지식이 최고의 자산입니다.',
    주의: '오만한 태도, 배움을 게을리하는 것',
  },
}

// ── 공통 UI ──────────────────────────────────────────────────────────

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-sm ${i < n ? 'text-amber-400' : 'text-stone-200'}`}>★</span>
      ))}
    </div>
  )
}

const LUCKY_COLOR_MAP: Record<string, string>  = { wood: '#4CAF50', fire: '#F44336', earth: '#FF9800', metal: '#78909C', water: '#2196F3' }
const LUCKY_COLOR_NAME: Record<string, string> = { wood: '청색·녹색', fire: '적색·주황', earth: '황색·갈색', metal: '흰색·금색', water: '검정·남색' }
const LUCKY_NUM: Record<string, string>        = { wood: '3, 8', fire: '2, 7', earth: '5, 0', metal: '4, 9', water: '1, 6' }
const LUCKY_DIR: Record<string, string>        = { wood: '동쪽', fire: '남쪽', earth: '중앙', metal: '서쪽', water: '북쪽' }
const LUCKY_FOOD: Record<string, string>       = { wood: '채소·나물류', fire: '고기·매운 음식', earth: '단 음식·잡곡', metal: '과일·흰 음식', water: '해산물·검은 음식' }

interface CategoryRowProps {
  emoji: string
  label: string
  summary: string
  detail: string
  star: number
}

function CategoryRow({ emoji, label, summary, detail, star }: CategoryRowProps) {
  return (
    <details className="border border-stone-100 rounded-2xl overflow-hidden group">
      <summary className="flex items-center gap-2 p-3.5 cursor-pointer list-none select-none hover:bg-stone-50 transition">
        <span className="text-base">{emoji}</span>
        <span className="text-sm font-semibold text-stone-700">{label}</span>
        <span className="text-xs text-stone-400 flex-1 truncate">{summary}</span>
        <Stars n={star} />
        <span className="text-stone-300 text-xs ml-1 shrink-0 group-open:rotate-180 transition-transform">▼</span>
      </summary>
      <div className="px-4 pb-4">
        <div className="h-px bg-stone-100 mb-3" />
        <p className="text-sm text-stone-500 leading-relaxed">{detail}</p>
      </div>
    </details>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────

interface Props {
  result: SajuResult
  ohaeng: OhaengCount
}

type SubTab = 'today' | 'month' | 'year'

export default function FortuneTabs({ result, ohaeng }: Props) {
  const [sub, setSub] = useState<SubTab>('today')

  const today     = new Date()
  const todayCalc = calculateSaju({
    year: today.getFullYear(), month: today.getMonth() + 1,
    day: today.getDate(), hour: today.getHours(), minute: null, gender: 'male',
  })

  const dayStemIdx = result.dayPillar.stemIndex
  const todaySipsin  = getSipsin(dayStemIdx, todayCalc.dayPillar.stemIndex)
  const monthSipsin  = getSipsin(dayStemIdx, todayCalc.monthPillar.stemIndex)
  const yearSipsin   = getSipsin(dayStemIdx, todayCalc.yearPillar.stemIndex)

  const elements   = ['wood', 'fire', 'earth', 'metal', 'water'] as const
  const luckyEl    = elements.reduce((a, b) => ohaeng[a] <= ohaeng[b] ? a : b)

  const todayData  = DAY_FORTUNE[todaySipsin]  ?? DAY_FORTUNE['비견']
  const monthData  = MONTHLY_FORTUNE[monthSipsin] ?? MONTHLY_FORTUNE['비견']
  const yearData   = YEARLY_FORTUNE[yearSipsin]   ?? YEARLY_FORTUNE['비견']

  const todayStem   = STEMS[todayCalc.dayPillar.stemIndex]
  const todayBranch = BRANCHES[todayCalc.dayPillar.branchIndex]
  const monthStem   = STEMS[todayCalc.monthPillar.stemIndex]
  const monthBranch = BRANCHES[todayCalc.monthPillar.branchIndex]
  const yearStem    = STEMS[todayCalc.yearPillar.stemIndex]
  const yearBranch  = BRANCHES[todayCalc.yearPillar.branchIndex]

  const tabs: { id: SubTab; label: string; sipsin: string; star: number }[] = [
    { id: 'today', label: '오늘', sipsin: todaySipsin, star: todayData.star },
    { id: 'month', label: '이달', sipsin: monthSipsin, star: monthData.star },
    { id: 'year',  label: '올해', sipsin: yearSipsin,  star: yearData.star  },
  ]

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
      {/* 서브탭 */}
      <div className="flex border-b border-stone-100">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className={`flex-1 py-3.5 text-sm font-semibold transition-all ${
              sub === t.id
                ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/50'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <span>{t.label}</span>
            <span className="ml-1 text-xs">{'★'.repeat(Math.min(t.star, 5))}</span>
          </button>
        ))}
      </div>

      <div className="p-5 space-y-4">

        {/* ── 오늘의 운세 ── */}
        {sub === 'today' && (
          <>
            {/* 일주 배지 */}
            <div
              className="rounded-2xl p-4 border flex items-center justify-between"
              style={{ backgroundColor: todayData.color + '10', borderColor: todayData.color + '30' }}
            >
              <div>
                <p className="text-xs text-stone-400 mb-1">오늘 일주 · {today.getMonth()+1}/{today.getDate()}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-3xl font-bold" style={{ color: ELEMENT_COLORS[todayStem.element] }}>{todayStem.hanja}</span>
                  <span className="text-3xl font-bold" style={{ color: ELEMENT_COLORS[todayBranch.element] }}>{todayBranch.hanja}</span>
                  <span className="text-sm text-stone-400 ml-1">{todayStem.ko}{todayBranch.ko} · {todayBranch.animal}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold px-3 py-1 rounded-xl" style={{ backgroundColor: todayData.color + '20', color: todayData.color }}>
                  {todaySipsin}
                </span>
                <div className="mt-1.5 flex justify-end"><Stars n={todayData.star} /></div>
              </div>
            </div>

            {/* 조언 + 주의 */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3.5">
              <p className="text-xs font-semibold text-amber-600 mb-1">✨ 오늘의 조언</p>
              <p className="text-sm text-stone-600 leading-relaxed">{todayData.조언}</p>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-2.5 flex items-center gap-2">
              <span>⚠️</span>
              <p className="text-xs text-stone-500"><span className="font-semibold text-red-500">주의 </span>{todayData.주의}</p>
            </div>

            {/* 항목별 */}
            <div className="space-y-2">
              {([
                { emoji: '🔮', label: '총운',  key: '총평' as const,  star: todayData.star },
                { emoji: '💰', label: '재물운', key: '재물' as const,  star: Math.max(1, todayData.star - 1) },
                { emoji: '💕', label: '애정운', key: '애정' as const,  star: Math.max(1, todayData.star) },
                { emoji: '💪', label: '건강운', key: '건강' as const,  star: Math.max(1, todayData.star) },
                { emoji: '💼', label: '직장운', key: '직업' as const,  star: Math.min(5, todayData.star + 1) },
              ]).map(c => (
                <CategoryRow key={c.key} emoji={c.emoji} label={c.label} summary={todayData[c.key].slice(0, 20) + '…'} detail={todayData[c.key]} star={c.star} />
              ))}
            </div>

            {/* 시간대 */}
            <div>
              <p className="text-sm font-semibold text-stone-600 mb-2">🕐 시간대별</p>
              <div className="space-y-2">
                {[
                  { icon: '🌅', label: '오전 06~12시', text: todayData.시간오전 },
                  { icon: '☀️',  label: '오후 12~18시', text: todayData.시간오후 },
                  { icon: '🌙', label: '저녁 18~24시', text: todayData.시간저녁 },
                ].map(t => (
                  <div key={t.label} className="flex gap-3 bg-stone-50 rounded-2xl px-4 py-3">
                    <span className="shrink-0">{t.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-stone-400 mb-0.5">{t.label}</p>
                      <p className="text-sm text-stone-600">{t.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 행운 */}
            <div>
              <p className="text-sm font-semibold text-stone-600 mb-2">🍀 오늘의 행운</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '행운 색상', value: LUCKY_COLOR_NAME[luckyEl], dot: LUCKY_COLOR_MAP[luckyEl] },
                  { label: '행운 숫자', value: LUCKY_NUM[luckyEl], dot: null },
                  { label: '행운 방향', value: LUCKY_DIR[luckyEl], dot: null },
                  { label: '행운 음식', value: LUCKY_FOOD[luckyEl], dot: null },
                ].map(item => (
                  <div key={item.label} className="bg-amber-50 border border-amber-100 rounded-2xl p-3">
                    <p className="text-xs text-stone-400 mb-1">{item.label}</p>
                    <div className="flex items-center gap-1.5">
                      {item.dot && <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.dot }} />}
                      <p className="text-sm font-semibold text-stone-700">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── 이달의 운세 ── */}
        {sub === 'month' && (
          <>
            <div
              className="rounded-2xl p-4 border flex items-center justify-between"
              style={{ backgroundColor: '#FF980010', borderColor: '#FF980030' }}
            >
              <div>
                <p className="text-xs text-stone-400 mb-1">이달 월주 · {today.getFullYear()}.{String(today.getMonth()+1).padStart(2,'0')}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-3xl font-bold" style={{ color: ELEMENT_COLORS[monthStem.element] }}>{monthStem.hanja}</span>
                  <span className="text-3xl font-bold" style={{ color: ELEMENT_COLORS[monthBranch.element] }}>{monthBranch.hanja}</span>
                  <span className="text-sm text-stone-400 ml-1">{monthStem.ko}{monthBranch.ko}월</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold px-3 py-1 rounded-xl bg-orange-100 text-orange-600">{monthSipsin}</span>
                <div className="mt-1.5 flex justify-end"><Stars n={monthData.star} /></div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3.5">
              <p className="text-xs font-semibold text-amber-600 mb-1">📅 이달의 조언</p>
              <p className="text-sm text-stone-600 leading-relaxed">{monthData.조언}</p>
            </div>

            <div className="space-y-2">
              {([
                { emoji: '🔮', label: '총운',  text: monthData.총평 },
                { emoji: '💰', label: '재물운', text: monthData.재물 },
                { emoji: '💕', label: '애정운', text: monthData.애정 },
                { emoji: '💪', label: '건강운', text: monthData.건강 },
                { emoji: '💼', label: '직장운', text: monthData.직업 },
              ]).map((c, i) => {
                const stars = [monthData.star, Math.max(1,monthData.star-1), monthData.star, monthData.star, Math.min(5,monthData.star+1)]
                return <CategoryRow key={c.label} emoji={c.emoji} label={c.label} summary={c.text.slice(0, 20) + '…'} detail={c.text} star={stars[i]} />
              })}
            </div>
          </>
        )}

        {/* ── 올해의 운세 ── */}
        {sub === 'year' && (
          <>
            <div
              className="rounded-2xl p-4 border flex items-center justify-between"
              style={{ backgroundColor: '#2196F310', borderColor: '#2196F330' }}
            >
              <div>
                <p className="text-xs text-stone-400 mb-1">올해 년주 · {today.getFullYear()}년</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-3xl font-bold" style={{ color: ELEMENT_COLORS[yearStem.element] }}>{yearStem.hanja}</span>
                  <span className="text-3xl font-bold" style={{ color: ELEMENT_COLORS[yearBranch.element] }}>{yearBranch.hanja}</span>
                  <span className="text-sm text-stone-400 ml-1">{yearStem.ko}{yearBranch.ko}년 · {yearBranch.animal}의 해</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold px-3 py-1 rounded-xl bg-blue-100 text-blue-600">{yearSipsin}</span>
                <div className="mt-1.5 flex justify-end"><Stars n={yearData.star} /></div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3.5">
              <p className="text-xs font-semibold text-amber-600 mb-1">🗓️ 올해의 조언</p>
              <p className="text-sm text-stone-600 leading-relaxed">{yearData.조언}</p>
            </div>

            <div className="space-y-2">
              {([
                { emoji: '🔮', label: '총운',  text: yearData.총평 },
                { emoji: '💰', label: '재물운', text: yearData.재물 },
                { emoji: '💕', label: '애정운', text: yearData.애정 },
                { emoji: '💪', label: '건강운', text: yearData.건강 },
                { emoji: '💼', label: '직업운', text: yearData.직업 },
              ]).map((c, i) => {
                const stars = [yearData.star, Math.max(1,yearData.star-1), yearData.star, yearData.star, Math.min(5,yearData.star+1)]
                return <CategoryRow key={c.label} emoji={c.emoji} label={c.label} summary={c.text.slice(0, 20) + '…'} detail={c.text} star={stars[i]} />
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
