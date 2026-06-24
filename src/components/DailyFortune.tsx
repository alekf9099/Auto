import type { SajuResult, OhaengCount } from '../types'
import { STEMS, BRANCHES, ELEMENT_COLORS } from '../utils/constants'
import { calculateSaju, getSipsin } from '../utils/saju'

interface Props {
  result: SajuResult
  ohaeng: OhaengCount
}

interface FortuneData {
  총운:  { star: number; summary: string; detail: string }
  재물:  { star: number; summary: string; detail: string }
  애정:  { star: number; summary: string; detail: string }
  건강:  { star: number; summary: string; detail: string }
  직장:  { star: number; summary: string; detail: string }
  시간:  { 오전: string; 오후: string; 저녁: string }
  조언:  string
  주의:  string
  color: string
}

const FORTUNE: Record<string, FortuneData> = {
  비견: {
    색: '#4CAF50',
    총운: {
      star: 3,
      summary: '자신감이 넘치는 날입니다.',
      detail: '오늘은 자신의 의지와 자아가 강하게 드러나는 날입니다. 경쟁 상황에서 본인의 능력을 발휘할 기회가 생기며, 독립적으로 행동하면 유리한 결과를 얻을 수 있습니다. 다만 지나친 고집이나 독선은 주변과의 갈등을 일으킬 수 있으니 유연한 자세도 유지하세요.',
    },
    재물: {
      star: 2,
      summary: '지출이 증가할 수 있는 날입니다.',
      detail: '경쟁심이 자극되어 충동적인 소비를 하게 될 수 있습니다. 타인의 소비 패턴을 따라가거나 비교심에서 비롯된 지출은 삼가세요. 큰 투자나 금전 거래는 오늘을 피하고, 이미 계획된 지출만 실행하는 것이 안전합니다.',
    },
    애정: {
      star: 2,
      summary: '자기중심적 태도를 조심하세요.',
      detail: '오늘은 자신의 감정과 의견을 강하게 표현하게 되어 파트너나 주변 사람과 갈등이 생길 수 있습니다. 상대의 입장을 충분히 경청하고 먼저 이해하려는 노력이 필요합니다. 새로운 만남보다 기존 관계 유지에 집중하는 날입니다.',
    },
    건강: {
      star: 3,
      summary: '활동적이지만 무리는 금물입니다.',
      detail: '에너지가 넘쳐 활동적인 하루를 보내게 되지만, 경쟁심에서 비롯된 무리한 신체 활동은 부상이나 체력 소모로 이어질 수 있습니다. 과로를 주의하고 충분한 수분 섭취와 휴식으로 컨디션을 조절하세요.',
    },
    직장: {
      star: 3,
      summary: '동료와의 경쟁 속에서 실력을 발휘하세요.',
      detail: '오늘은 직장 내 경쟁이 심화되는 날입니다. 자신의 업무 능력을 보여줄 기회가 생기지만, 협력보다 경쟁을 택했다가 팀워크가 깨질 수 있습니다. 자신의 성과를 강조하되 동료를 배려하는 균형감이 필요합니다.',
    },
    시간: {
      오전: '에너지가 높아 집중력이 뛰어납니다. 독립적인 작업을 시작하기 좋은 시간입니다.',
      오후: '경쟁 상황이 생길 수 있습니다. 감정 조절에 신경 쓰며 신중하게 행동하세요.',
      저녁: '과도한 경쟁심을 내려놓고 휴식을 취하세요. 혼자만의 시간이 재충전에 도움됩니다.',
    },
    조언: '오늘은 독립심과 자신감을 살리되, 상대방과의 협력을 잊지 마세요. 경쟁보다 공존의 자세가 더 큰 성과를 가져옵니다.',
    주의: '충동적 소비, 독선적 태도, 무리한 운동',
    color: '#4CAF50',
  } as unknown as FortuneData,
  겁재: {
    총운: {
      star: 2,
      summary: '손재수가 있을 수 있는 날입니다.',
      detail: '오늘은 예상치 못한 지출이나 손해가 발생할 수 있는 날입니다. 타인의 달콤한 제안이나 투자 권유에 쉽게 흔들릴 수 있으니 신중하게 판단하세요. 중요한 결정은 내일로 미루고, 현재 상황을 유지하는 것이 최선입니다.',
    },
    재물: {
      star: 1,
      summary: '금전 거래는 절대 피하세요.',
      detail: '오늘은 재물 손실의 위험이 높은 날입니다. 투자, 대출, 보증, 큰 금액의 거래를 모두 피하세요. 지인의 돈 요구도 가능하면 거절하거나 다음으로 미루는 것이 좋습니다. 소액의 일상적 지출도 계획적으로 관리하세요.',
    },
    애정: {
      star: 2,
      summary: '질투와 오해가 생기기 쉬운 날입니다.',
      detail: '감정 기복이 심해지고 상대방에 대한 의심이나 질투심이 생길 수 있습니다. 작은 오해가 큰 다툼으로 이어질 수 있으니 감정적 대화는 오늘을 피하세요. 파트너에게 먼저 연락하기보다는 상대가 먼저 오기를 기다리는 것이 좋습니다.',
    },
    건강: {
      star: 2,
      summary: '사고와 부상에 각별히 주의하세요.',
      detail: '교통사고나 낙상 등 예상치 못한 사고가 발생할 수 있는 날입니다. 운전 시 더욱 조심하고 무리한 야외 활동은 자제하세요. 음주는 절대 삼가고, 몸이 좋지 않다면 무리하지 말고 충분히 쉬세요.',
    },
    직장: {
      star: 2,
      summary: '경쟁자의 방해를 조심하세요.',
      detail: '직장 내 경쟁자나 시기하는 사람으로부터 방해나 훼방이 생길 수 있습니다. 중요한 정보는 함부로 공유하지 말고, 자신의 계획을 드러내지 마세요. 상사나 동료와의 불필요한 마찰을 피하고 조용히 자신의 일에 집중하는 것이 최선입니다.',
    },
    시간: {
      오전: '충동적인 결정은 삼가고 하루 계획을 점검하는 시간으로 활용하세요.',
      오후: '금전 거래나 중요한 약속은 피하는 것이 좋습니다. 조용히 업무에 집중하세요.',
      저녁: '감정적으로 예민해질 수 있습니다. 혼자 조용히 쉬며 내일을 준비하세요.',
    },
    조언: '오늘은 무리한 도전보다 현상 유지가 최선입니다. 지출, 감정, 언행 모두 절제가 필요한 날입니다.',
    주의: '금전 거래, 충동적 결정, 음주, 격렬한 운동',
    color: '#FF9800',
  } as unknown as FortuneData,
  식신: {
    총운: {
      star: 4,
      summary: '재능이 빛나는 행운의 날입니다.',
      detail: '오늘은 타고난 재능과 매력이 자연스럽게 표출되는 길한 날입니다. 평소 하고 싶었던 것을 시도하거나, 자신의 능력을 보여줄 기회를 적극적으로 찾아보세요. 주변 사람들의 인정과 지지를 받을 수 있으며, 작은 행운과 즐거운 일이 찾아옵니다.',
    },
    재물: {
      star: 4,
      summary: '노력한 만큼 보상받는 날입니다.',
      detail: '오늘은 그동안의 노력이 결실을 맺는 날입니다. 예상치 않은 소소한 횡재나 수입이 생길 수도 있습니다. 식복(食福)이 있는 날이니 좋은 음식을 즐기는 것도 재운을 높이는 방법입니다. 투자보다는 안정적인 수입 활동이 유리합니다.',
    },
    애정: {
      star: 4,
      summary: '매력이 넘치는 날, 좋은 인연이 찾아옵니다.',
      detail: '오늘은 자연스러운 매력이 빛나 이성에게 좋은 인상을 주기 쉬운 날입니다. 솔로라면 새로운 만남의 기회가 생길 수 있습니다. 연인이 있다면 함께 맛있는 식사나 즐거운 활동을 즐기면 관계가 더욱 깊어집니다.',
    },
    건강: {
      star: 4,
      summary: '건강하고 활기찬 하루입니다.',
      detail: '몸 상태가 좋고 에너지가 넘치는 날입니다. 평소 즐기던 운동이나 취미 활동을 하면 더욱 활력이 생깁니다. 식욕도 좋아 맛있는 음식을 즐기되, 과식은 피하세요. 전체적으로 몸과 마음이 조화로운 날입니다.',
    },
    직장: {
      star: 4,
      summary: '창의적 아이디어가 빛나는 날입니다.',
      detail: '오늘은 평소보다 창의적이고 표현력이 풍부해지는 날입니다. 프레젠테이션, 기획 회의, 클라이언트 미팅 등에서 뛰어난 성과를 낼 수 있습니다. 자신의 아이디어를 적극적으로 표현하고 제안하면 좋은 반응을 얻을 것입니다.',
    },
    시간: {
      오전: '창의적인 아이디어가 샘솟는 시간입니다. 기록해 두고 적극 활용하세요.',
      오후: '사람들과의 만남이 즐겁고 유익합니다. 네트워킹이나 미팅에 최적입니다.',
      저녁: '맛있는 식사와 즐거운 여가를 즐기기 딱 좋은 시간입니다.',
    },
    조언: '오늘은 적극적으로 자신을 표현하고 행동하세요. 당신의 재능이 주목받을 수 있는 기회를 놓치지 마세요.',
    주의: '과식, 자만심, 늦은 귀가',
    color: '#4CAF50',
  } as unknown as FortuneData,
  상관: {
    총운: {
      star: 3,
      summary: '재주가 넘치지만 언행을 조심하세요.',
      detail: '오늘은 재치와 창의력이 넘치는 날이지만, 표현이 지나치거나 경솔한 발언으로 오해를 살 수 있습니다. 특히 윗사람이나 권위 있는 사람 앞에서의 언행을 특별히 조심해야 합니다. 능력을 발휘하되 겸손함을 잃지 마세요.',
    },
    재물: {
      star: 3,
      summary: '예상치 못한 수입이 가능하지만 주의도 필요합니다.',
      detail: '재주를 통한 예상 외의 수입이 생길 수 있습니다. 프리랜서 작업, 부업, 창의적 활동을 통한 수익이 기대됩니다. 그러나 입이 가볍거나 실언으로 인해 금전적 손해로 이어질 수도 있으니, 말과 행동에 신중을 기하세요.',
    },
    애정: {
      star: 3,
      summary: '매력적이지만 말 실수를 조심하세요.',
      detail: '오늘은 재치 있는 말솜씨로 이성의 관심을 끌 수 있지만, 한 발짝 더 나아가다가 상처 주는 말을 하게 될 수 있습니다. 농담이 진심처럼 들릴 수 있으니 표현에 주의하세요. 진지한 관계라면 오늘은 가벼운 데이트를 즐기는 것이 좋습니다.',
    },
    건강: {
      star: 3,
      summary: '신경과민과 스트레스를 주의하세요.',
      detail: '머리가 빠르게 돌아가고 신경이 예민해지는 날입니다. 과도한 생각과 걱정으로 두통이나 신경성 증상이 나타날 수 있습니다. 명상이나 스트레칭으로 긴장을 풀어주고, 카페인 섭취는 줄이는 것이 좋습니다.',
    },
    직장: {
      star: 3,
      summary: '아이디어는 좋지만 상사와의 마찰을 주의하세요.',
      detail: '창의적인 아이디어가 넘치는 날이지만, 규칙이나 권위에 도전하는 행동은 상사와의 갈등을 일으킬 수 있습니다. 좋은 아이디어는 적절한 방식으로 제안하고, 반발하는 듯한 언행은 삼가세요. 혼자 작업하는 시간이 팀 협업보다 효율적인 날입니다.',
    },
    시간: {
      오전: '새로운 아이디어가 넘치는 시간이지만 주변 언행을 각별히 조심하세요.',
      오후: '창의적 작업에 집중하기 좋습니다. 혼자 작업하는 것이 더 효율적입니다.',
      저녁: '감정 기복이 생길 수 있으니 자극적인 대화는 피하고 편안히 쉬세요.',
    },
    조언: '오늘은 창의력을 발휘하되, 표현 방식에 신중을 기하세요. 특히 윗사람 앞에서의 언행이 당신의 평판을 좌우합니다.',
    주의: '경솔한 발언, 충동적 행동, 권위에 대한 반발',
    color: '#FF9800',
  } as unknown as FortuneData,
  편재: {
    총운: {
      star: 3,
      summary: '활동적으로 도전하는 날입니다.',
      detail: '오늘은 새로운 기회를 향해 도전하는 에너지가 넘치는 날입니다. 평소보다 적극적이고 외향적인 성향이 강해져 새로운 사람을 만나거나 새로운 프로젝트를 시작하기 좋습니다. 단, 과욕이나 무계획적인 도전은 오히려 손해를 초래할 수 있으니 기본 계획은 세우세요.',
    },
    재물: {
      star: 4,
      summary: '재물 기회가 있는 날, 단 과욕 금지.',
      detail: '투자나 사업 기회가 생기는 날입니다. 빠른 판단력과 행동력이 재물로 이어질 수 있습니다. 하지만 일확천금을 노리는 과욕은 오히려 손해로 돌아옵니다. 적당한 수준의 투자와 활동적인 수익 활동은 좋은 결과를 낼 수 있습니다.',
    },
    애정: {
      star: 3,
      summary: '이성에게 인기가 높은 날입니다.',
      detail: '오늘은 활발하고 매력적인 에너지로 이성의 관심을 받기 좋은 날입니다. 처음 만나는 자리나 소개팅에서 좋은 인상을 줄 수 있습니다. 연인이 있다면 함께 새로운 경험을 즐기는 데이트가 관계를 활성화시킵니다. 단, 바람기가 생길 수 있으니 주의하세요.',
    },
    건강: {
      star: 3,
      summary: '과로와 과식에 주의하세요.',
      detail: '활동량이 많아 체력 소모가 클 수 있는 날입니다. 에너지가 넘쳐 무리하게 움직이다가 저녁에 갑자기 피로감을 느낄 수 있습니다. 정기적인 휴식을 취하고 식사는 규칙적으로 하되 폭식은 피하세요.',
    },
    직장: {
      star: 3,
      summary: '적극적인 행동이 결실을 맺습니다.',
      detail: '오늘은 소극적으로 기다리기보다 먼저 나서는 것이 유리한 날입니다. 새로운 사업이나 프로젝트 제안, 영업 활동 등 외향적인 업무에서 좋은 성과를 낼 수 있습니다. 고객이나 파트너와의 관계 형성에도 유리한 날입니다.',
    },
    시간: {
      오전: '도전적인 기회가 생기는 시간입니다. 적극적으로 행동하면 좋은 결과를 얻습니다.',
      오후: '재물 관련 활동과 외부 미팅에 좋은 시간입니다. 네트워킹을 활용하세요.',
      저녁: '과도한 지출이나 음주를 주의하세요. 하루를 정리하고 내일을 계획하세요.',
    },
    조언: '오늘은 기회를 포착하고 과감하게 도전하세요. 단, 무리한 투자나 계획 없는 행동은 위험합니다.',
    주의: '과욕, 충동 투자, 불필요한 만남, 음주',
    color: '#FF9800',
  } as unknown as FortuneData,
  정재: {
    총운: {
      star: 4,
      summary: '안정적이고 착실한 하루입니다.',
      detail: '오늘은 계획한 일이 순조롭게 진행되는 안정적인 날입니다. 성실하고 규칙적인 행동이 좋은 결과로 이어지며, 주변 사람들로부터 신뢰와 인정을 받을 수 있습니다. 무리한 도전보다는 차근차근 쌓아가는 방식이 가장 효과적인 날입니다.',
    },
    재물: {
      star: 4,
      summary: '저축과 안정적 수입에 최적인 날입니다.',
      detail: '오늘은 정직하고 성실한 노력이 재물로 이어지는 날입니다. 투자보다는 저축, 계획적인 소비가 유리합니다. 새로운 금융 상품 가입이나 장기 투자 계획을 세우기 좋은 날입니다. 작은 금액이라도 꾸준히 모으는 습관이 빛나는 날입니다.',
    },
    애정: {
      star: 4,
      summary: '신뢰와 안정감이 깊어지는 날입니다.',
      detail: '오늘은 진지하고 성실한 태도가 상대방에게 깊은 신뢰를 줍니다. 장기 연인 관계라면 더욱 안정적으로 발전하는 계기가 될 수 있습니다. 결혼이나 진지한 만남을 고려 중이라면 오늘 관련 대화를 나누는 것도 좋습니다.',
    },
    건강: {
      star: 4,
      summary: '규칙적인 생활로 건강을 유지하세요.',
      detail: '오늘은 몸 상태가 전반적으로 안정적인 날입니다. 규칙적인 식사와 충분한 수면이 컨디션을 최상으로 유지시켜 줍니다. 과격한 운동보다는 가벼운 산책이나 스트레칭으로 몸을 관리하세요.',
    },
    직장: {
      star: 4,
      summary: '성실함이 인정받는 날입니다.',
      detail: '오늘은 꼼꼼하고 성실하게 업무를 처리하면 상사나 동료로부터 인정받을 수 있습니다. 화려한 아이디어보다 기본에 충실한 업무 태도가 빛납니다. 장기 프로젝트나 반복적인 업무도 오늘은 집중력 있게 처리할 수 있습니다.',
    },
    시간: {
      오전: '계획한 일을 차근차근 진행하기 좋은 시간입니다. 중요 업무를 오전에 처리하세요.',
      오후: '중요한 협상이나 거래를 처리하기 좋은 시간입니다. 신중하고 성실한 태도가 빛납니다.',
      저녁: '가족이나 가까운 사람과 함께하는 시간이 행복을 가져다줍니다.',
    },
    조언: '오늘은 착실하게 계획대로 행동하면 반드시 좋은 결과가 따라옵니다. 정직하고 성실한 하루를 보내세요.',
    주의: '게으름, 충동 소비, 무리한 투자',
    color: '#4CAF50',
  } as unknown as FortuneData,
  편관: {
    총운: {
      star: 2,
      summary: '압박과 스트레스가 높은 날입니다.',
      detail: '오늘은 여러 방면에서 압박과 도전이 느껴지는 힘든 날입니다. 예상치 못한 장애물이 나타나거나, 권위 있는 사람이나 상황이 당신을 옥죄는 느낌이 들 수 있습니다. 그러나 이 압박을 이겨내면 강해질 수 있으니, 포기하지 말고 인내로 극복하세요.',
    },
    재물: {
      star: 2,
      summary: '예상치 못한 지출이 생길 수 있습니다.',
      detail: '오늘은 의도치 않은 지출이 발생할 가능성이 높습니다. 벌금, 수리비, 의료비 등 갑작스러운 지출에 대비하세요. 큰 투자나 금전 거래는 오늘을 반드시 피하고, 비상금을 손대지 않도록 주의하세요.',
    },
    애정: {
      star: 2,
      summary: '갈등과 다툼이 생기기 쉬운 날입니다.',
      detail: '파트너나 가까운 사람과 의견 충돌이 생기기 쉬운 날입니다. 서로의 감정이 격해지기 전에 대화를 잠시 중단하고 감정을 가라앉히는 것이 좋습니다. 자신의 감정을 강하게 표현하기보다는 상대의 말을 먼저 들어주세요.',
    },
    건강: {
      star: 2,
      summary: '스트레스성 질환에 주의하세요.',
      detail: '심리적 압박으로 인한 두통, 소화 불량, 불면증 등 스트레스성 증상이 나타날 수 있습니다. 오늘은 특히 충분한 휴식이 필요합니다. 긴장을 풀어주는 명상이나 가벼운 산책이 도움이 됩니다. 무리한 신체 활동은 절대 피하세요.',
    },
    직장: {
      star: 2,
      summary: '상사나 권위자와의 충돌을 조심하세요.',
      detail: '직장 내 상하관계에서 긴장이 생기기 쉬운 날입니다. 상사의 지시에 반발하거나 불만을 드러내면 불필요한 갈등이 생깁니다. 오늘은 낮은 자세로 겸손하게 지시를 따르면서 내부 갈등을 최소화하는 것이 현명합니다.',
    },
    시간: {
      오전: '신중하게 하루를 시작하세요. 서두르다가 실수를 할 수 있습니다.',
      오후: '압박이 가장 심한 시간대입니다. 한 발짝 물러서고 감정적 대응을 피하세요.',
      저녁: '가벼운 운동이나 산책으로 스트레스를 해소하세요. 음주는 금물입니다.',
    },
    조언: '오늘은 어려움이 있더라도 인내하고 낮은 자세를 유지하세요. 이 시련을 극복하면 더 강해질 수 있습니다.',
    주의: '감정적 충돌, 음주, 큰 결정, 과격한 운동',
    color: '#F44336',
  } as unknown as FortuneData,
  정관: {
    총운: {
      star: 4,
      summary: '명예와 신뢰가 높아지는 길한 날입니다.',
      detail: '오늘은 원칙을 지키고 규율을 따르는 행동이 높은 평가를 받는 날입니다. 주변으로부터 신뢰와 존경을 받을 수 있으며, 중요한 자리나 역할을 맡게 될 수도 있습니다. 윗사람의 인정을 받고 새로운 기회가 열리는 길한 날입니다.',
    },
    재물: {
      star: 3,
      summary: '안정적인 수입이 기대되는 날입니다.',
      detail: '오늘은 정직하고 합법적인 방법으로의 수입이 기대되는 날입니다. 급여, 계약금, 정기 수입 등 안정적인 재물의 흐름이 좋습니다. 투기적 투자보다는 장기적이고 안정적인 재정 계획을 세우기에 적합한 날입니다.',
    },
    애정: {
      star: 4,
      summary: '신뢰받는 관계가 형성되는 날입니다.',
      detail: '오늘은 진지하고 책임감 있는 태도가 파트너에게 깊은 신뢰를 줍니다. 새로운 만남이라면 첫인상이 매우 좋게 남을 수 있습니다. 기존 관계에서는 더욱 깊고 안정적인 단계로 발전하는 계기가 될 수 있습니다.',
    },
    건강: {
      star: 4,
      summary: '규칙적인 생활이 건강을 지켜주는 날입니다.',
      detail: '오늘은 규칙적인 식사, 운동, 수면이 몸을 최상의 상태로 유지시켜 줍니다. 전반적으로 건강 상태가 좋은 날이니 평소 미루던 건강 검진을 받거나 운동을 시작하기에도 좋습니다.',
    },
    직장: {
      star: 5,
      summary: '승진이나 인정받을 가능성이 매우 높습니다.',
      detail: '오늘은 직장에서 당신의 능력과 성실함이 빛나는 날입니다. 상사나 윗사람으로부터 칭찬이나 인정을 받을 수 있으며, 승진이나 중요 프로젝트 배정의 기회가 올 수 있습니다. 책임감 있게 행동하고 원칙을 지키면 반드시 좋은 결과가 따릅니다.',
    },
    시간: {
      오전: '규칙적으로 하루를 시작하면 좋은 결과가 따릅니다. 중요 업무를 오전에 처리하세요.',
      오후: '중요한 미팅이나 발표에 최적의 시간입니다. 자신감 있게 임하세요.',
      저녁: '자기계발이나 공부에 집중하기 좋습니다. 내일을 위한 준비 시간으로 활용하세요.',
    },
    조언: '오늘은 원칙과 규율을 지키며 책임감 있게 행동하세요. 윗사람의 신뢰와 인정을 받을 수 있는 최고의 날입니다.',
    주의: '원칙 위반, 무책임한 행동, 지각·결석',
    color: '#2196F3',
  } as unknown as FortuneData,
  편인: {
    총운: {
      star: 3,
      summary: '내면 성장에 집중하는 날입니다.',
      detail: '오늘은 외부 활동보다는 내면을 탐구하고 자기계발에 집중하는 것이 더 효과적인 날입니다. 혼자만의 시간이 필요하게 느껴질 수 있으며, 사람들과의 교류보다 독서, 연구, 사색이 더 어울리는 날입니다. 외로움을 느낄 수 있지만 이는 성장의 과정입니다.',
    },
    재물: {
      star: 2,
      summary: '수입보다 지출이 많을 수 있는 날입니다.',
      detail: '오늘은 재물의 흐름이 다소 막히는 날입니다. 예상치 못한 지출이 생기거나 수입이 줄어들 수 있습니다. 큰 금전 거래는 피하고, 절약을 생활화하세요. 오늘 벌어들인 재물은 쉽게 빠져나갈 수 있으니 소비를 자제하세요.',
    },
    애정: {
      star: 2,
      summary: '혼자 있고 싶은 날입니다.',
      detail: '오늘은 타인과의 관계보다 자신에게 집중하고 싶은 날입니다. 상대방에게 냉정하게 보일 수 있으므로, 파트너에게 미리 "혼자 있고 싶은 날"임을 솔직히 전달하는 것이 좋습니다. 새로운 만남은 오늘보다 다른 날을 택하세요.',
    },
    건강: {
      star: 3,
      summary: '피로와 과로에 각별히 주의하세요.',
      detail: '정신적, 신체적으로 쉽게 지치는 날입니다. 평소보다 수면이 더 필요하며, 무리한 활동은 자제하세요. 소화기계가 약해질 수 있으니 자극적인 음식은 피하고 소화가 잘 되는 음식을 드세요.',
    },
    직장: {
      star: 3,
      summary: '학습과 연구에 집중하기 좋은 날입니다.',
      detail: '오늘은 팀 활동보다 혼자 하는 연구, 분석, 글쓰기, 공부에서 능력이 빛납니다. 창의적이고 독창적인 아이디어가 떠오를 수 있으니 메모해 두세요. 다만 이 아이디어를 오늘 당장 공유하기보다 내일 다듬어 발표하는 것이 더 효과적입니다.',
    },
    시간: {
      오전: '혼자 사색하거나 공부하기 좋은 시간입니다. 방해받지 않는 환경을 만드세요.',
      오후: '사람들과의 활발한 교류보다 개인 작업에 집중하는 것이 더 효율적입니다.',
      저녁: '독서나 명상으로 내면을 채우는 시간을 가지세요. 일찍 취침하는 것이 좋습니다.',
    },
    조언: '오늘은 사람들과의 교류보다 자기계발과 내면 탐구에 집중하면 더 큰 성장을 이룰 수 있습니다.',
    주의: '무리한 사교 활동, 충동 소비, 늦은 귀가, 과로',
    color: '#78909C',
  } as unknown as FortuneData,
  정인: {
    총운: {
      star: 4,
      summary: '학문과 지혜가 빛나는 길한 날입니다.',
      detail: '오늘은 배우고 성장하는 데 있어 최적의 날입니다. 어른이나 스승, 선배로부터 귀중한 가르침이나 도움을 받을 수 있으며, 학업이나 전문성 향상에 관련된 활동이 특히 빛납니다. 포용력과 이해력이 높아져 주변 사람들과의 관계도 원만하게 유지됩니다.',
    },
    재물: {
      star: 3,
      summary: '안정적인 재물 흐름이 기대됩니다.',
      detail: '오늘은 안정적이고 꾸준한 수입이 기대되는 날입니다. 공부나 자격증, 전문성을 통한 수입 활동이 유리합니다. 무리한 투자보다는 저축과 안정적인 재정 관리에 집중하세요. 어른이나 전문가의 조언을 듣고 재정 계획을 세우면 더욱 좋습니다.',
    },
    애정: {
      star: 4,
      summary: '포용력이 높아져 관계가 깊어지는 날입니다.',
      detail: '오늘은 상대방을 깊이 이해하고 포용하는 마음이 강해집니다. 가족과의 시간이 특히 따뜻하고 의미 있는 날입니다. 연인 관계에서도 상대의 단점을 넓은 마음으로 받아들이는 포용력이 생겨 관계가 더 깊어집니다.',
    },
    건강: {
      star: 4,
      summary: '심신이 안정되고 건강한 날입니다.',
      detail: '오늘은 심신이 전반적으로 안정되고 건강한 날입니다. 영양 보충과 충분한 휴식이 건강을 더욱 향상시킵니다. 따뜻한 음식과 충분한 수면이 몸을 최적의 상태로 만들어 줍니다. 스파나 마사지 등 몸을 관리하는 시간을 갖는 것도 좋습니다.',
    },
    직장: {
      star: 4,
      summary: '학습과 성장에 최적의 날입니다.',
      detail: '오늘은 새로운 기술이나 지식을 배우는 데 탁월한 집중력을 보이는 날입니다. 교육이나 세미나, 멘토링을 받는 것이 큰 도움이 됩니다. 어른이나 선배에게 조언을 구하면 업무에 큰 도움이 될 지혜를 얻을 수 있습니다.',
    },
    시간: {
      오전: '학습과 성장에 최적의 시간입니다. 새로운 것을 배우거나 공부를 시작하세요.',
      오후: '어른이나 스승에게 조언을 구하면 귀중한 도움을 받을 수 있는 시간입니다.',
      저녁: '배운 것을 정리하고 내일을 준비하세요. 가족과의 대화가 위로가 됩니다.',
    },
    조언: '오늘은 배우고 성장하는 데 집중하세요. 어른이나 스승의 도움을 받을 수 있는 좋은 날입니다.',
    주의: '오만한 태도, 배움을 게을리하는 것, 어른에 대한 무례함',
    color: '#2196F3',
  } as unknown as FortuneData,
}

const LUCKY_COLOR: Record<string, { name: string; hex: string }> = {
  wood:  { name: '청색·녹색', hex: '#4CAF50' },
  fire:  { name: '적색·주황', hex: '#F44336' },
  earth: { name: '황색·갈색', hex: '#FF9800' },
  metal: { name: '흰색·금색', hex: '#78909C' },
  water: { name: '검정·남색', hex: '#2196F3' },
}
const LUCKY_NUM: Record<string, string> = {
  wood: '3, 8', fire: '2, 7', earth: '5, 0', metal: '4, 9', water: '1, 6',
}
const LUCKY_DIR: Record<string, string> = {
  wood: '동쪽', fire: '남쪽', earth: '중앙', metal: '서쪽', water: '북쪽',
}
const LUCKY_FOOD: Record<string, string> = {
  wood: '채소·나물류', fire: '고기·매운 음식', earth: '단 음식·잡곡', metal: '과일·흰 음식', water: '해산물·검은 음식',
}

function Stars({ n, max = 5 }: { n: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`text-sm ${i < n ? 'text-[#9A6A12]' : 'text-stone-200'}`}>★</span>
      ))}
    </div>
  )
}

export default function DailyFortune({ result, ohaeng }: Props) {
  const today = new Date()
  const todayYear  = today.getFullYear()
  const todayMonth = today.getMonth() + 1
  const todayDay   = today.getDate()

  const todayResult = calculateSaju({
    year: todayYear, month: todayMonth,
    day: todayDay, hour: today.getHours(), minute: null, gender: 'male',
  })

  const dayStemIdx     = result.dayPillar.stemIndex
  const todayStemIdx   = todayResult.dayPillar.stemIndex
  const todayBranchIdx = todayResult.dayPillar.branchIndex

  const sipsin  = getSipsin(dayStemIdx, todayStemIdx)
  const fortune = FORTUNE[sipsin] ?? FORTUNE['비견']

  const todayStem   = STEMS[todayStemIdx]
  const todayBranch = BRANCHES[todayBranchIdx]

  // 행운 원소: 사용자 팔자에서 가장 약한 오행
  const elements = ['wood', 'fire', 'earth', 'metal', 'water'] as const
  const luckyEl  = elements.reduce((a, b) => ohaeng[a] <= ohaeng[b] ? a : b)

  const avgStar = Math.round(
    [fortune.총운.star, fortune.재물.star, fortune.애정.star, fortune.건강.star, fortune.직장.star]
      .reduce((s, v) => s + v, 0) / 5
  )

  const categories = [
    { key: '총운' as const, emoji: '🔮', label: '총운' },
    { key: '재물' as const, emoji: '💰', label: '재물운' },
    { key: '애정' as const, emoji: '💕', label: '애정운' },
    { key: '건강' as const, emoji: '💪', label: '건강운' },
    { key: '직장' as const, emoji: '💼', label: '직장운' },
  ]

  return (
    <div className="bg-[#FBF4E2] rounded-3xl shadow-sm border border-[#D8C290] p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-[#3B2A16] font-korean">오늘의 운세</h2>
        <span className="text-xs text-[#9A8155] bg-[#E9DAB8] px-2 py-1 rounded-full">
          {todayYear}.{String(todayMonth).padStart(2,'0')}.{String(todayDay).padStart(2,'0')}
        </span>
      </div>

      {/* 오늘 일주 + 관계 */}
      <div
        className="rounded-2xl p-4 mb-4 border"
        style={{ backgroundColor: fortune.color + '12', borderColor: fortune.color + '40' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-[#9A8155] mb-1">오늘의 일주</p>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold" style={{ color: ELEMENT_COLORS[todayStem.element] }}>
                {todayStem.hanja}
              </span>
              <span className="text-4xl font-bold" style={{ color: ELEMENT_COLORS[todayBranch.element] }}>
                {todayBranch.hanja}
              </span>
              <div className="ml-1">
                <p className="text-sm text-[#6E5836]">{todayStem.ko}{todayBranch.ko}일</p>
                <p className="text-xs text-[#9A8155]">{todayBranch.animal}의 날</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#9A8155] mb-1">내 일간과의 관계</p>
            <span
              className="text-2xl font-bold px-3 py-1.5 rounded-xl inline-block"
              style={{ backgroundColor: fortune.color + '20', color: fortune.color }}
            >
              {sipsin}
            </span>
            <div className="mt-1.5 flex justify-end">
              <Stars n={avgStar} />
            </div>
          </div>
        </div>

        {/* 조언 */}
        <div className="bg-[#E9DAB8] rounded-xl p-3">
          <p className="text-xs font-semibold mb-1" style={{ color: fortune.color }}>✨ 오늘의 조언</p>
          <p className="text-sm text-[#5C4A2E] leading-relaxed">{fortune.조언}</p>
        </div>
      </div>

      {/* 주의사항 */}
      <div className="bg-red-900/20 border border-red-900/40 rounded-2xl px-4 py-2.5 mb-4 flex items-start gap-2">
        <span className="text-sm">⚠️</span>
        <div>
          <span className="text-xs font-semibold text-red-400">오늘 조심할 것 </span>
          <span className="text-xs text-[#6E5836]">{fortune.주의}</span>
        </div>
      </div>

      {/* 카테고리별 상세 운세 */}
      <div className="space-y-3 mb-5">
        {categories.map(({ key, emoji, label }) => {
          const f = fortune[key]
          return (
            <details key={key} className="border border-[#D8C290] rounded-2xl overflow-hidden group">
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-[#E9DAB8] transition">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{emoji}</span>
                  <span className="text-sm font-semibold text-[#5C4A2E]">{label}</span>
                  <span className="text-xs text-[#9A8155] ml-1">{f.summary}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Stars n={f.star} />
                  <span className="text-[#A89167] text-xs group-open:rotate-180 transition-transform">▼</span>
                </div>
              </summary>
              <div className="px-4 pb-4 pt-0">
                <div className="h-px bg-[#D8C290] mb-3" />
                <p className="text-sm text-[#6E5836] leading-relaxed">{f.detail}</p>
              </div>
            </details>
          )
        })}
      </div>

      {/* 시간대별 운세 */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-[#5C4A2E] mb-3">🕐 시간대별 운세</p>
        <div className="space-y-2">
          {([
            { label: '오전 (06~12시)', icon: '🌅', text: fortune.시간.오전 },
            { label: '오후 (12~18시)', icon: '☀️',  text: fortune.시간.오후 },
            { label: '저녁 (18~24시)', icon: '🌙', text: fortune.시간.저녁 },
          ]).map(t => (
            <div key={t.label} className="flex gap-3 bg-[#E9DAB8] rounded-2xl px-4 py-3">
              <span className="text-lg shrink-0">{t.icon}</span>
              <div>
                <p className="text-xs font-semibold text-[#9A8155] mb-0.5">{t.label}</p>
                <p className="text-sm text-[#5C4A2E] leading-relaxed">{t.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 행운 아이템 */}
      <div>
        <p className="text-sm font-semibold text-[#5C4A2E] mb-3">🍀 오늘의 행운 아이템</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: '행운 색상', value: LUCKY_COLOR[luckyEl].name, icon: '🎨',
              dot: LUCKY_COLOR[luckyEl].hex },
            { label: '행운 숫자', value: LUCKY_NUM[luckyEl], icon: '🔢', dot: null },
            { label: '행운 방향', value: LUCKY_DIR[luckyEl], icon: '🧭', dot: null },
            { label: '행운 음식', value: LUCKY_FOOD[luckyEl], icon: '🍽️', dot: null },
          ].map(item => (
            <div key={item.label} className="bg-[#9A6A1215] border border-[#9A6A1230] rounded-2xl p-3">
              <p className="text-xs text-[#9A8155] mb-1">{item.icon} {item.label}</p>
              <div className="flex items-center gap-1.5">
                {item.dot && (
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.dot }} />
                )}
                <p className="text-sm font-semibold text-[#5C4A2E]">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-stone-300 mt-2 text-center">
          * 행운 아이템은 팔자에서 부족한 오행({luckyEl === 'wood' ? '목木' : luckyEl === 'fire' ? '화火' : luckyEl === 'earth' ? '토土' : luckyEl === 'metal' ? '금金' : '수水'})을 보완하는 기준입니다.
        </p>
      </div>
    </div>
  )
}
