import type { SajuResult } from '../types'
import { STEMS, BRANCHES, ELEMENT_COLORS } from '../utils/constants'
import { calculateSaju, getSipsin } from '../utils/saju'

interface Props {
  result: SajuResult
}

const SIPSIN_FORTUNE: Record<string, {
  총운: { star: number; text: string }
  재물: { star: number; text: string }
  애정: { star: number; text: string }
  건강: { star: number; text: string }
  직장: { star: number; text: string }
  조언: string
  color: string
}> = {
  비견: {
    총운: { star: 3, text: '자신감이 넘치는 날입니다. 독립적으로 행동할 때 유리합니다.' },
    재물: { star: 2, text: '경쟁으로 인한 지출이 많을 수 있으니 충동구매를 자제하세요.' },
    애정: { star: 2, text: '자기중심적 태도로 파트너와 갈등이 생길 수 있습니다.' },
    건강: { star: 3, text: '활동적이지만 무리한 경쟁으로 체력이 소모될 수 있습니다.' },
    직장: { star: 3, text: '동료와의 경쟁 속에서 실력을 발휘할 수 있는 날입니다.' },
    조언: '오늘은 협력보다 독립적인 행동이 유리합니다. 단, 경쟁심이 지나치지 않도록 주의하세요.',
    color: '#4CAF50',
  },
  겁재: {
    총운: { star: 2, text: '손재수가 있을 수 있으니 충동적인 결정을 삼가세요.' },
    재물: { star: 1, text: '투자나 큰 지출은 피하는 것이 좋습니다. 돈 거래 주의.' },
    애정: { star: 2, text: '질투와 다툼이 생길 수 있습니다. 감정 조절이 필요합니다.' },
    건강: { star: 2, text: '사고와 부상에 주의하고 음주는 삼가세요.' },
    직장: { star: 2, text: '경쟁자로부터 방해가 생길 수 있습니다. 신중하게 행동하세요.' },
    조언: '오늘은 무리한 결정보다 현상 유지가 최선입니다. 지출과 감정 모두 절제가 필요한 날입니다.',
    color: '#FF9800',
  },
  식신: {
    총운: { star: 4, text: '표현력이 뛰어나고 재능이 빛나는 행운의 날입니다.' },
    재물: { star: 4, text: '노력한 만큼 보상받는 날입니다. 소소한 횡재수도 있을 수 있습니다.' },
    애정: { star: 4, text: '매력이 넘치는 날입니다. 새로운 만남의 기회가 생길 수 있습니다.' },
    건강: { star: 4, text: '건강하고 활기찬 하루입니다. 식복이 있어 맛있는 것을 즐기세요.' },
    직장: { star: 4, text: '창의력이 빛나는 날입니다. 아이디어를 적극적으로 표현하세요.' },
    조언: '오늘은 적극적으로 표현하고 행동하세요. 당신의 재능이 주목받을 수 있는 좋은 날입니다.',
    color: '#4CAF50',
  },
  상관: {
    총운: { star: 3, text: '재주가 넘치지만 충동적 언행을 주의해야 합니다.' },
    재물: { star: 3, text: '예상치 못한 수입이 생길 수 있으나 말 실수로 인한 손해 주의.' },
    애정: { star: 3, text: '매력적이지만 말 실수로 관계가 틀어질 수 있으니 주의하세요.' },
    건강: { star: 3, text: '신경이 예민해지기 쉬운 날입니다. 긴장 완화가 필요합니다.' },
    직장: { star: 3, text: '아이디어는 좋지만 상사와의 마찰에 주의하세요.' },
    조언: '오늘은 창의력을 발휘하되, 표현 방식에 신중을 기하세요. 특히 윗사람 앞에서의 언행을 조심하세요.',
    color: '#FF9800',
  },
  편재: {
    총운: { star: 3, text: '활동적이고 도전적인 날입니다. 재물의 기회가 있습니다.' },
    재물: { star: 4, text: '투자와 사업에 기회가 생기는 날입니다. 단, 과욕은 금물입니다.' },
    애정: { star: 3, text: '이성에게 인기가 높은 날입니다. 새로운 만남도 기대해볼 수 있습니다.' },
    건강: { star: 3, text: '과로에 주의하세요. 활동량이 많아 체력 소모가 클 수 있습니다.' },
    직장: { star: 3, text: '적극적인 행동이 결실을 맺는 날입니다. 도전해보세요.' },
    조언: '오늘은 과감하게 도전하되 무리하지 마세요. 재물 기회가 있지만 신중한 판단이 필요합니다.',
    color: '#FF9800',
  },
  정재: {
    총운: { star: 4, text: '안정적이고 착실한 하루입니다. 계획한 일이 순조롭게 진행됩니다.' },
    재물: { star: 4, text: '저축과 투자 모두 좋은 날입니다. 안정적인 수익이 기대됩니다.' },
    애정: { star: 4, text: '신뢰와 안정감이 높아지는 날입니다. 진지한 관계에 좋은 날입니다.' },
    건강: { star: 4, text: '규칙적인 생활로 건강이 유지됩니다. 컨디션이 좋은 날입니다.' },
    직장: { star: 4, text: '성실함이 인정받는 날입니다. 꼼꼼하게 업무를 처리하세요.' },
    조언: '오늘은 착실하게 계획대로 행동하면 좋은 결과가 있습니다. 안정적인 선택이 최선입니다.',
    color: '#4CAF50',
  },
  편관: {
    총운: { star: 2, text: '압박과 스트레스가 높은 날입니다. 무리한 도전은 삼가세요.' },
    재물: { star: 2, text: '예상치 못한 지출이 생길 수 있습니다. 큰 거래는 피하세요.' },
    애정: { star: 2, text: '갈등과 다툼이 생길 수 있습니다. 감정을 자제하세요.' },
    건강: { star: 2, text: '스트레스성 질환에 주의하세요. 충분한 휴식이 필요합니다.' },
    직장: { star: 2, text: '상사나 권위자와 충돌할 수 있습니다. 낮은 자세가 필요한 날입니다.' },
    조언: '오늘은 어려움이 있을 수 있지만 인내하면 극복할 수 있습니다. 공격적 행동은 금물입니다.',
    color: '#F44336',
  },
  정관: {
    총운: { star: 4, text: '규율과 명예가 높아지는 길한 날입니다. 원칙을 지키세요.' },
    재물: { star: 3, text: '안정적인 수입이 기대되는 날입니다. 정직한 방법이 최선입니다.' },
    애정: { star: 4, text: '신뢰받는 관계가 형성됩니다. 진실된 마음으로 대하세요.' },
    건강: { star: 4, text: '규칙적인 생활이 건강을 지켜주는 날입니다.' },
    직장: { star: 5, text: '승진이나 인정받을 가능성이 높습니다. 책임감 있게 행동하세요.' },
    조언: '오늘은 원칙과 규율을 지키면 좋은 결과가 따라옵니다. 윗사람의 인정을 받을 수 있는 날입니다.',
    color: '#2196F3',
  },
  편인: {
    총운: { star: 3, text: '내면 성장의 날입니다. 혼자만의 시간이 필요할 수 있습니다.' },
    재물: { star: 2, text: '수입보다 지출이 많을 수 있습니다. 절약이 필요한 날입니다.' },
    애정: { star: 2, text: '혼자 있고 싶은 날입니다. 상대방에게 냉정하게 보일 수 있습니다.' },
    건강: { star: 3, text: '과로와 피로에 주의하세요. 충분한 수면이 필요합니다.' },
    직장: { star: 3, text: '학습과 연구에 적합한 날입니다. 창의적 작업에 집중하세요.' },
    조언: '오늘은 사람들과의 교류보다 자기계발과 내면 탐구에 집중하면 더 좋습니다.',
    color: '#78909C',
  },
  정인: {
    총운: { star: 4, text: '학문과 지혜가 빛나는 날입니다. 배움과 성장이 기대됩니다.' },
    재물: { star: 3, text: '안정적인 흐름입니다. 무리한 투자보다 저축이 유리합니다.' },
    애정: { star: 4, text: '포용력이 높아지는 날입니다. 가족과의 시간이 특히 좋습니다.' },
    건강: { star: 4, text: '심신이 안정되는 날입니다. 영양 보충과 휴식을 취하세요.' },
    직장: { star: 4, text: '학습과 발전에 최적의 날입니다. 배움의 기회를 놓치지 마세요.' },
    조언: '오늘은 배우고 성장하는 데 집중하면 좋은 날입니다. 어른이나 스승의 도움을 받을 수 있습니다.',
    color: '#2196F3',
  },
}

function Stars({ count, max = 5 }: { count: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < count ? 'text-amber-400' : 'text-stone-200'}>★</span>
      ))}
    </div>
  )
}

export default function DailyFortune({ result }: Props) {
  const today = new Date()
  const todayYear  = today.getFullYear()
  const todayMonth = today.getMonth() + 1
  const todayDay   = today.getDate()

  // 오늘의 일주 계산 (시간은 현재 시각 기준)
  const todayResult = calculateSaju({
    year: todayYear,
    month: todayMonth,
    day: todayDay,
    hour: today.getHours(),
    gender: 'male',
  })

  const dayStemIdx    = result.dayPillar.stemIndex
  const todayStemIdx  = todayResult.dayPillar.stemIndex
  const todayBranchIdx = todayResult.dayPillar.branchIndex

  const sipsin  = getSipsin(dayStemIdx, todayStemIdx)
  const fortune = SIPSIN_FORTUNE[sipsin]

  const todayStem   = STEMS[todayStemIdx]
  const todayBranch = BRANCHES[todayBranchIdx]

  const categories = [
    { key: '총운', emoji: '🔮', label: '총운' },
    { key: '재물', emoji: '💰', label: '재물운' },
    { key: '애정', emoji: '💕', label: '애정운' },
    { key: '건강', emoji: '💪', label: '건강운' },
    { key: '직장', emoji: '💼', label: '직장운' },
  ] as const

  const avgStar = Math.round(
    categories.reduce((s, c) => s + fortune[c.key].star, 0) / categories.length
  )

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-stone-700 font-korean">오늘의 운세</h2>
        <span className="text-xs text-stone-400">
          {todayYear}.{String(todayMonth).padStart(2,'0')}.{String(todayDay).padStart(2,'0')}
        </span>
      </div>

      {/* 오늘 일주 + 관계 */}
      <div
        className="rounded-2xl p-4 mb-5 border"
        style={{ backgroundColor: fortune.color + '12', borderColor: fortune.color + '40' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-400 mb-1">오늘의 일주</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold" style={{ color: ELEMENT_COLORS[todayStem.element] }}>
                {todayStem.hanja}
              </span>
              <span className="text-3xl font-bold" style={{ color: ELEMENT_COLORS[todayBranch.element] }}>
                {todayBranch.hanja}
              </span>
              <span className="text-sm text-stone-400">
                ({todayStem.ko}{todayBranch.ko}일)
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-stone-400 mb-1">내 일간과의 관계</p>
            <span
              className="text-xl font-bold px-3 py-1 rounded-xl"
              style={{ backgroundColor: fortune.color + '20', color: fortune.color }}
            >
              {sipsin}
            </span>
            <div className="mt-1">
              <Stars count={avgStar} />
            </div>
          </div>
        </div>
      </div>

      {/* 오늘의 조언 */}
      <div className="bg-amber-50 rounded-2xl p-4 mb-5 border border-amber-100">
        <p className="text-xs font-semibold text-amber-600 mb-1">✨ 오늘의 조언</p>
        <p className="text-sm text-stone-600 leading-relaxed">{fortune.조언}</p>
      </div>

      {/* 카테고리별 운세 */}
      <div className="space-y-3">
        {categories.map(({ key, emoji, label }) => {
          const f = fortune[key]
          return (
            <div key={key} className="border border-stone-100 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{emoji}</span>
                  <span className="text-sm font-semibold text-stone-600">{label}</span>
                </div>
                <Stars count={f.star} />
              </div>
              <p className="text-xs text-stone-500 leading-relaxed pl-7">{f.text}</p>
            </div>
          )
        })}
      </div>

      {/* 오늘 사주 요약 */}
      <div className="mt-4 pt-4 border-t border-stone-100">
        <p className="text-xs text-stone-400 mb-2">오늘 년/월/일주</p>
        <div className="flex gap-2">
          {[todayResult.yearPillar, todayResult.monthPillar, todayResult.dayPillar].map((p, i) => {
            const s = STEMS[p.stemIndex]
            const b = BRANCHES[p.branchIndex]
            return (
              <div key={i} className="flex-1 text-center bg-stone-50 rounded-xl py-2">
                <span className="text-base font-bold block" style={{ color: ELEMENT_COLORS[s.element] }}>
                  {s.hanja}
                </span>
                <span className="text-base font-bold block" style={{ color: ELEMENT_COLORS[b.element] }}>
                  {b.hanja}
                </span>
                <span className="text-xs text-stone-400">{['년', '월', '일'][i]}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
