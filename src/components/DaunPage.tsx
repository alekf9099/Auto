import { useState } from 'react'
import type { BirthInput } from '../types'
import { calculateSaju, getSipsin, pillarName } from '../utils/saju'
import { STEMS, BRANCHES, ELEMENT_COLORS, SIPSIN_DESC } from '../utils/constants'
import PointsClaimButton from './PointsClaimButton'
import DaunChart from './DaunChart'
import { IcDaun } from './icons/SajuIcons'

interface Props {
  savedBirth: BirthInput | null
  onBack: () => void
  onSave?: (b: BirthInput) => void
}

interface DaunReading {
  title: string
  plain: string
  summary: string
  wealth: string
  career: string
  love: string
  caution: string
}

const DAUN_READING: Record<string, DaunReading> = {
  비견: {
    title: '동등한 경쟁의 대운',
    plain: '지금은 나와 비슷한 경쟁자들이 사방에서 나타나는 시기입니다. 독립심이 강해지고 혼자 해내고 싶은 욕구가 치솟습니다. 협력보다 단독 행동이 유리합니다.',
    summary: '나와 비슷한 위치의 사람들이 주변에 몰리는 시기입니다. 경쟁이 거세지지만 동류끼리는 오히려 협력이 강해집니다. 독립심이 치솟아 자기 방식대로 밀어붙이고 싶어집니다. 남의 방식을 따르려 하면 답답함만 커집니다.',
    wealth: '재물에도 경쟁자가 붙습니다. 들어오는 만큼 나가는 흐름이 반복됩니다. 타인에게 보증이나 대출을 서주는 일은 지금 절대 하지 마세요.',
    career: '독립, 창업, 프리랜서 전환을 진지하게 고민하게 됩니다. 조직 안에 있다면 자기 영역을 지키려는 경쟁 심리가 그대로 드러납니다. 지금 움직이면 길이 열립니다.',
    love: '애정 면에서 경쟁자가 분명히 나타납니다. 기혼자라면 배우자와 주도권 다툼이 반복됩니다. 먼저 양보하는 쪽이 관계를 지킵니다.',
    caution: '동업이라면 지분과 역할을 지금 문서로 명확히 하세요. 감정적인 경쟁은 즉시 멈추고, 남의 말에 휘둘리지 말고 자기 의지를 지키세요.',
  },
  겁재: {
    title: '투쟁과 변동의 대운',
    plain: '에너지는 넘치지만 돈과 인간관계에서 변수가 터지는 시기입니다. 충동적인 결정은 지금 절대 하지 마세요.',
    summary: '에너지는 충만하지만 엉뚱한 방향으로 새기 쉬운 시기입니다. 손재수가 따르고 인간관계에서 갈등이 반복됩니다. 도전 정신은 살리되, 무모한 도박은 지금 절대 손대지 마세요.',
    wealth: '투자나 투기에 손대는 순간 손해를 봅니다. 지인이나 친구를 통해 재물이 빠져나가니, 돈 거래는 지금부터 전부 문서화하세요.',
    career: '직업이 급작스럽게 변하거나 스스로 변화를 원하게 됩니다. 정공법은 통하지 않습니다. 창의적인 방식으로 돌파구를 찾으세요.',
    love: '연애에서 갈등과 다툼, 이별 가능성이 높아집니다. 질투심과 소유욕이 강해져 스스로도 지칩니다. 감정을 그대로 드러내면 관계가 끝납니다.',
    caution: '충동적인 결정, 특히 돈과 관련된 결정은 지금 절대 하지 마세요. 화가 난 상태에서는 어떤 중요한 결정도 내리지 마세요.',
  },
  식신: {
    title: '재능과 풍요의 대운',
    plain: '인생에서 가장 여유롭고 풍요로운 시기입니다. 먹고사는 걱정이 줄고 하고 싶은 일을 그대로 할 수 있습니다.',
    summary: '가장 편안하고 여유로운 대운입니다. 먹고사는 걱정이 줄고 재능과 취미를 마음껏 펼칠 수 있습니다. 건강이 좋아지고 주변에 사람이 자연스럽게 모입니다. 지금이 인생에서 가장 누릴 때입니다.',
    wealth: '꾸준한 수입이 들어오는 시기입니다. 투자보다 안정적인 수입원을 만드는 데 집중하세요. 그게 지금 가장 맞는 전략입니다.',
    career: '자신의 장기를 살리는 직업, 특히 요리·예술·교육·서비스 분야에서 확실히 빛을 발합니다. 조직 안에서도 전문성을 인정받습니다.',
    love: '관계가 자연스럽고 따뜻하게 흘러가는 시기입니다. 편안한 분위기에서 좋은 만남이 그대로 이어집니다.',
    caution: '여유에 취해 게을러지면 기회를 그대로 흘려보냅니다. 좋은 시기일수록 다음을 지금 준비하세요.',
  },
  상관: {
    title: '표현과 변화의 대운',
    plain: '창의력과 표현력이 폭발하는 시기입니다. 기존 틀을 깨고 싶어지고, 직업과 관계에 큰 변화가 일어납니다.',
    summary: '창의력과 언변이 폭발하는 시기입니다. 기존 틀을 깨고 싶은 욕구가 강해지고, 직업과 관계 모두에서 큰 변화가 일어납니다. 두뇌 회전이 빠르고 표현이 날카로워지니, 말 한마디의 무게가 평소보다 훨씬 커집니다.',
    wealth: '한꺼번에 크게 벌거나 크게 잃는 기복이 분명합니다. 부업, 프리랜서, 창작 활동으로 돈을 버는 흐름이 강합니다.',
    career: '예술·방송·IT·스타트업처럼 창의성이 요구되는 분야에서 분명하게 두각을 나타냅니다. 기존 직장이 답답하게 느껴진다면, 지금이 이직이나 창업을 결단할 때입니다.',
    love: '매력이 넘쳐흘러 이성의 주목을 확실히 받습니다. 다만 관계가 오래 유지되기는 어렵습니다. 변덕스러운 감정을 다스리지 않으면 매번 같은 패턴으로 끝납니다.',
    caution: '말이 날카로워 주변에 상처를 입힙니다. 직장 내 권위자와의 마찰과 관재수를 지금 조심하세요.',
  },
  편재: {
    title: '투자와 활동의 대운',
    plain: '돈과 활동력이 왕성해지는 시기입니다. 투자·사업으로 큰돈을 움직이게 되지만, 그만큼 기복도 큽니다.',
    summary: '돈과 활동력이 왕성해지는 시기입니다. 투자·사업·부동산으로 큰돈을 움직이게 됩니다. 역마살처럼 이동과 변화가 끊이지 않고, 아버지나 남성과의 인연이 강하게 작용합니다.',
    wealth: '재물운이 강하지만 기복도 큽니다. 대박도 가능하고 큰 손실도 가능합니다. 분산 투자하세요. 한 곳에 모든 걸 걸면 그대로 무너집니다.',
    career: '사업가·영업·무역·투자·금융 분야에서 분명하게 두각을 나타냅니다. 새로운 프로젝트나 비즈니스 개발에서 힘을 제대로 발휘하세요.',
    love: '매력적이고 활발한 연애가 펼쳐집니다. 이미 연인이 있다면 외부의 유혹을 지금 단호하게 차단하세요.',
    caution: '지나친 낙관이 독이 됩니다. 기회가 왔을 때 냉정하게 위험을 계산하세요. 보증과 투자 실패는 한 번에 모든 걸 무너뜨립니다.',
  },
  정재: {
    title: '안정과 성실의 대운',
    plain: '꾸준히 노력하면 착실하게 결실이 쌓이는 시기입니다. 부동산, 저축, 결혼 같은 인생의 기반을 지금 다지세요.',
    summary: '꾸준한 노력이 결실을 맺는 시기입니다. 급하게 큰돈을 버는 것보다 착실하게 쌓아가는 방식이 분명히 더 맞습니다. 부동산 취득, 직업 안정화, 결혼 같은 인생의 기반을 다지는 사건들이 지금 일어납니다.',
    wealth: '안정적인 수입이 보장됩니다. 저축과 부동산에 집중하세요. 재물이 천천히, 그러나 확실하게 쌓입니다.',
    career: '전문직·회계·금융·공직·관리직에서 안정적인 성과를 냅니다. 새로운 것을 좇지 말고, 지금 하는 일을 충실히 해내세요.',
    love: '안정적이고 신뢰 기반의 관계가 맺어집니다. 결혼이나 동거 같은 실질적인 진전이 지금 일어나기 쉽습니다.',
    caution: '고집이 세어져 변화를 거부하면 기회를 그대로 놓칩니다. 안주에 머물지 말고 작은 혁신을 함께 시도하세요.',
  },
  편관: {
    title: '도전과 권위의 대운',
    plain: '강한 외부 압력과 마찰이 생기는 시기입니다. 힘든 시기지만, 이겨내면 강한 권위와 사회적 지위를 손에 쥡니다.',
    summary: '강한 외부 압력과 마찰이 생기는 시기입니다. 권위자와의 갈등, 관재수, 건강 이상이 동시에 찾아올 수 있습니다. 그러나 이 압력을 이겨내면 강한 권위와 사회적 지위가 그대로 따라옵니다.',
    wealth: '재물이 묶이거나 예상치 못한 지출이 생깁니다. 소송, 세금, 벌금 관련 문제를 조심하고, 서류와 계약은 지금 꼼꼼히 확인하세요.',
    career: '승진의 기회와 권력 다툼이 동시에 찾아오는 시기입니다. 군인·경찰·법조인·의사처럼 강인함이 요구되는 분야에서 분명하게 두각을 보입니다.',
    love: '관계에서 통제와 억압의 역학이 생깁니다. 서로의 독립성을 존중해야만 관계가 유지됩니다.',
    caution: '건강을 무리하게 혹사하지 마세요. 법적 분쟁과 상해사고가 생기기 쉬운 시기이니, 교통사고와 안전사고를 지금 조심하세요.',
  },
  정관: {
    title: '명예와 성취의 대운',
    plain: '조직에서 인정받고 지위가 높아지는 시기입니다. 규칙을 따르는 것이 곧 출세의 길입니다.',
    summary: '사회적으로 인정받고 지위가 높아지는 시기입니다. 규칙과 원칙을 지키는 것이 곧 출세의 길입니다. 직장에서 승진하고 사회적 명성을 쌓기에 지금이 최적의 시기입니다.',
    wealth: '안정적이고 꾸준한 재물 흐름이 유지됩니다. 직위에 걸맞은 수입 증가가 그대로 따라옵니다.',
    career: '조직·공공기관·교육·법률·행정 분야에서 분명하게 두각을 나타냅니다. 실력으로 인정받아 승진하는 흐름이 강합니다.',
    love: '신뢰할 수 있는 사람과의 깊은 관계가 맺어집니다. 결혼이나 장기적인 관계가 지금 시작됩니다.',
    caution: '규칙에 얽매여 융통성을 잃으면 손해입니다. 완벽해 보이려는 태도가 주변과의 거리감을 만든다는 걸 기억하세요.',
  },
  편인: {
    title: '학문과 역마의 대운',
    plain: '이동과 새로운 공부, 특수한 재능이 꽃피는 시기입니다. 혼자 있고 싶은 마음과 고독함이 함께 찾아옵니다.',
    summary: '이동과 학문, 특수한 재능이 꽃을 피우는 시기입니다. 새로운 학문이나 철학, 특이한 재주를 지금 익히게 됩니다. 고독한 경향이 강해지고 주변과의 거리감이 분명히 생깁니다.',
    wealth: '재물보다 지식과 경험에 투자하게 됩니다. 불규칙한 수입이 생기기 쉬우니, 프리랜서나 전문직 쪽으로 방향을 잡으세요.',
    career: '연구·철학·종교·예술·IT·의술 같은 특수한 분야에서 확실한 성과를 냅니다. 조직보다 독립적으로 일하는 방식이 맞습니다.',
    love: '거리감이 생기고 혼자 있고 싶은 마음이 강해집니다. 기혼자라면 별거나 단신 부임 가능성을 미리 염두에 두세요.',
    caution: '현실 감각이 떨어지기 쉽습니다. 이상적인 계획만 세우다 실천을 못 하는 패턴을 지금 끊으세요.',
  },
  정인: {
    title: '학문과 모성의 대운',
    plain: '인생에서 가장 안정적인 배움의 시기입니다. 귀인의 도움이 따르고 학문·자격증에서 확실한 성과를 냅니다.',
    summary: '인생에서 가장 안정적이고 풍요로운 배움의 시기입니다. 어머니나 보살펴 주는 사람의 도움이 분명하게 따르고, 학문과 자기계발에서 큰 성과를 거둡니다. 심리적으로도 확실히 안정됩니다.',
    wealth: '큰 재물은 아니지만 부족함 없는 수준의 안정적인 재물이 꾸준히 유지됩니다.',
    career: '교육·학술·출판·상담·의료·공직에서 탁월한 성과를 냅니다. 자격증과 학위 취득을 지금 시작하세요. 분명히 도움이 됩니다.',
    love: '가족과 가정에 집중하게 됩니다. 헌신하고 돌보는 역할을 자연스럽게 맡게 되니, 그 역할을 피하지 마세요.',
    caution: '지나친 의존이나 과보호는 반드시 문제가 됩니다. 상대를 걱정하고 간섭하는 정도를 지금 줄이세요. 관계가 질식하기 전에 멈춰야 합니다.',
  },
}

const SEUN_READING: Record<string, { summary: string; keyword: string; advice: string }> = {
  비견: {
    summary: '나와 같은 에너지가 외부에서 밀려드는 해입니다. 경쟁자가 나타나고 독립 욕구가 강하게 치솟습니다. 동업이나 협업보다 단독 결정이 지금 더 유리합니다.',
    keyword: '독립 · 경쟁 · 분리',
    advice: '비용 지출을 지금 통제하고, 새로운 파트너십은 신중하게만 접근하세요.',
  },
  겁재: {
    summary: '돈과 관계에 예상치 못한 변수가 터지는 해입니다. 충동적인 투자, 보증, 지인의 부탁에는 지금 단호하게 선을 그으세요.',
    keyword: '손재 · 변동 · 돌발',
    advice: '투기성 투자, 연대보증, 큰 계약 서명은 지금 절대 서두르지 마세요.',
  },
  식신: {
    summary: '재능이 빛나고 먹고사는 걱정이 확실히 줄어드는 해입니다. 하고 싶은 것을 그대로 하세요. 몸과 마음 모두 건강해집니다.',
    keyword: '풍요 · 재능 · 여유',
    advice: '편안함에 안주하지 말고 지금 다음 목표를 세우세요.',
  },
  상관: {
    summary: '말, 글, 창의적인 표현이 힘을 발휘하는 해입니다. 기존 틀을 깨고 싶은 욕구가 강해집니다. 직장이나 권위자와의 마찰을 피하려면 언행을 지금 다듬으세요.',
    keyword: '표현 · 변화 · 마찰',
    advice: '감정적 충동으로 중요한 관계를 해치지 마세요. 말은 한 번 더 다듬고 꺼내세요.',
  },
  편재: {
    summary: '돈이 크게 움직이는 해입니다. 기회도 오지만 손실도 크게 날 수 있습니다. 새로운 사업, 투자, 부동산 기회가 지금 찾아옵니다.',
    keyword: '재물 기복 · 활동 · 기회',
    advice: '분산 투자하세요. 한 곳에 올인하면 그대로 무너집니다.',
  },
  정재: {
    summary: '착실하게 노력한 것이 정확히 결과로 돌아오는 해입니다. 안정적인 수입이 유지되고 재물이 차곡차곡 쌓입니다.',
    keyword: '안정 · 성실 · 결실',
    advice: '현상 유지가 최선의 전략입니다. 검증된 방법만 고수하세요.',
  },
  편관: {
    summary: '외부의 압박과 도전이 강해지는 해입니다. 법적 문제, 건강 이상, 갑작스러운 직업 변동이 동시에 찾아올 수 있습니다. 이 압력을 이겨내면 분명한 도약이 따라옵니다.',
    keyword: '도전 · 압박 · 성장',
    advice: '건강 검진, 법적 서류 정리, 계약서 검토를 지금 철저히 끝내세요.',
  },
  정관: {
    summary: '사회적으로 명예와 인정이 분명하게 따르는 해입니다. 승진, 자격증 취득, 사회적 지위 향상이 지금 일어납니다.',
    keyword: '명예 · 승진 · 인정',
    advice: '규칙을 지키고 성실함을 유지하세요. 보상은 반드시 따라옵니다.',
  },
  편인: {
    summary: '새로운 공부, 여행, 특이한 취미가 생기는 해입니다. 불규칙한 생활과 정신적 피로가 분명히 쌓입니다.',
    keyword: '역마 · 학문 · 고독',
    advice: '규칙적인 생활 패턴을 지금 지키고, 현실적인 계획을 함께 세우세요.',
  },
  정인: {
    summary: '배움과 안정이 함께 오는 해입니다. 학업, 자격증, 전문성 강화에서 분명한 성과를 냅니다.',
    keyword: '학문 · 안정 · 보살핌',
    advice: '배움에 지금 투자하세요. 지식이 곧 가장 확실한 자산이 됩니다.',
  },
}

const ELEMENT_KO: Record<string, string> = {
  wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)',
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

export default function DaunPage({ savedBirth, onBack, onSave }: Props) {
  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form')
  const [birth, setBirth] = useState({
    year:   savedBirth ? String(savedBirth.year)   : '',
    month:  savedBirth ? String(savedBirth.month)  : '',
    day:    savedBirth ? String(savedBirth.day)    : '',
    hour:   savedBirth?.hour != null ? String(savedBirth.hour) : '',
    minute: savedBirth?.minute != null ? String(savedBirth.minute) : '',
    gender: (savedBirth?.gender ?? 'male') as 'male' | 'female',
  })
  const [submitted, setSubmitted] = useState<BirthInput | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const inp: BirthInput = {
      year: Number(birth.year), month: Number(birth.month),
      day: Number(birth.day),
      hour: birth.hour !== '' ? Number(birth.hour) : null,
      minute: birth.hour !== '' && birth.minute !== '' ? Number(birth.minute) : null,
      gender: birth.gender,
    }
    onSave?.(inp)
    setSubmitted(inp)
    setStep('loading')
    window.scrollTo(0, 0)
    setTimeout(() => { setStep('result'); window.scrollTo(0, 0) }, 2500)
  }

  const result = submitted ? calculateSaju(submitted) : null
  const currentYear = new Date().getFullYear()
  const dayStemIdx  = result ? result.dayPillar.stemIndex : 0
  const daun        = result?.daun ?? []
  const daunStartAge = result?.daunStartAge ?? 0
  const isForward   = result?.isForward ?? true
  const dayStem     = result ? STEMS[dayStemIdx] : null

  const currentDaun = submitted ? daun.find(entry => {
    const ageYear = submitted.year + entry.age
    return ageYear <= currentYear && currentYear < ageYear + 10
  }) : null

  const nextDaun = currentDaun
    ? daun.find(e => e.age === currentDaun.age + 10)
    : null

  const _seunYear = new Date().getFullYear()
  const _seunPillar = calculateSaju({ year: _seunYear, month: 3, day: 1, hour: 12, minute: null, gender: 'male' }).yearPillar
  const seunStemIdx   = _seunPillar.stemIndex
  const seunBranchIdx = _seunPillar.branchIndex
  const seunStem   = STEMS[seunStemIdx]
  const seunBranch = BRANCHES[seunBranchIdx]
  const seunSipsin = result ? getSipsin(dayStemIdx, seunStemIdx) : '비견'
  const seunReading = SEUN_READING[seunSipsin]

  return (
    <div className="min-h-screen bg-[#0D0A1A]">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-[#0D0A1A]/95 backdrop-blur-md border-b border-[#C9962A30]">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3 flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="뒤로 가기"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#231844] transition text-[#C4B8D8] text-lg"
          >
            ←
          </button>
          <div>
            <h1 className="text-base font-bold text-[#F5EDD4] leading-tight" style={{ fontFamily: "'Noto Serif KR', serif" }}>
              대운 분석 (大運 分析)
            </h1>
            <p className="text-xs text-[#7B6F9A]">10년 단위 운세 흐름</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {step === 'form' && (
          <>
            <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-6 shadow-xl shadow-[#000]/40 border border-[#C9962A25]">
              <p className="text-violet-300/70 text-xs mb-2">10년 단위 운의 큰 흐름</p>
              <p className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                大運 分析
              </p>
              <p className="text-sm text-violet-300/80 leading-relaxed">
                사주를 바탕으로 10년마다 바뀌는<br />대운의 흐름과 현재 시기를 분석합니다.
              </p>
            </div>

            <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-5 bg-[#C9962A] rounded-full" />
                <h2 className="text-base font-bold text-[#F5EDD4]">생년월일 입력</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: '출생년도', name: 'year',  placeholder: '1990', min: 1900, max: 2010 },
                    { label: '월',       name: 'month', placeholder: '1',    min: 1,    max: 12 },
                    { label: '일',       name: 'day',   placeholder: '1',    min: 1,    max: 31 },
                  ].map(f => (
                    <div key={f.name}>
                      <label className="block text-xs font-semibold text-[#A89BC0] mb-1.5">{f.label}</label>
                      <input
                        type="number" required placeholder={f.placeholder}
                        min={f.min} max={f.max}
                        value={birth[f.name as 'year' | 'month' | 'day']}
                        onChange={e => setBirth(p => ({ ...p, [f.name]: e.target.value }))}
                        className="w-full bg-[#1C1438] border border-[#2A1F4A] rounded-2xl px-3 py-3 text-sm text-[#F5EDD4] placeholder:text-[#4A4060] focus:outline-none focus:border-[#C9962A] focus:ring-2 focus:ring-[#C9962A20] transition text-center"
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#A89BC0] mb-1.5">출생 시간 <span className="text-[#4A4060] font-normal">(선택)</span></label>
                    <input
                      type="number" placeholder="0~23"
                      min={0} max={23}
                      value={birth.hour}
                      onChange={e => setBirth(p => ({ ...p, hour: e.target.value }))}
                      className="w-full bg-[#1C1438] border border-[#2A1F4A] rounded-2xl px-3 py-3 text-sm text-[#F5EDD4] placeholder:text-[#4A4060] focus:outline-none focus:border-[#C9962A] focus:ring-2 focus:ring-[#C9962A20] transition text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#A89BC0] mb-1.5">분 <span className="text-[#4A4060] font-normal">(선택)</span></label>
                    <input
                      type="number" placeholder="0~59"
                      min={0} max={59}
                      disabled={birth.hour === ''}
                      value={birth.minute}
                      onChange={e => setBirth(p => ({ ...p, minute: e.target.value }))}
                      className="w-full bg-[#1C1438] border border-[#2A1F4A] rounded-2xl px-3 py-3 text-sm text-[#F5EDD4] placeholder:text-[#4A4060] focus:outline-none focus:border-[#C9962A] focus:ring-2 focus:ring-[#C9962A20] transition text-center disabled:opacity-40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#A89BC0] mb-1.5">성별</label>
                    <div className="flex gap-2 h-[46px]">
                      {(['male', 'female'] as const).map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setBirth(p => ({ ...p, gender: g }))}
                          className={`flex-1 text-sm font-semibold rounded-2xl border transition ${
                            birth.gender === g
                              ? 'bg-[#C9962A] border-[#C9962A] text-[#0D0A1A]'
                              : 'bg-[#1C1438] border-[#2A1F4A] text-[#A89BC0]'
                          }`}
                        >
                          {g === 'male' ? '남성' : '여성'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-[#C9962A] to-[#E8B84B] text-[#0D0A1A] font-bold rounded-2xl shadow-lg shadow-[#C9962A30] hover:from-[#B8871F] hover:to-[#D4A030] transition-all text-sm active:scale-[0.98]"
                >
                  대운 분석하기 →
                </button>
              </form>
            </div>
          </>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-2 border-[#C9962A20] animate-ping"/>
              <div className="absolute inset-2 rounded-full border-2 border-[#C9962A40] animate-ping" style={{ animationDelay: '0.3s' }}/>
              <div className="absolute inset-4 rounded-full border-2 border-[#C9962A60] animate-ping" style={{ animationDelay: '0.6s' }}/>
              <div className="absolute inset-0 flex items-center justify-center"><IcDaun size={32} className="text-[#C9962A]"/></div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>대운 분석 중...</p>
              <p className="text-sm text-[#7B6F9A]">10년 단위 운세 흐름을 계산하고 있습니다</p>
            </div>
          </div>
        )}

        {step === 'result' && submitted && result && dayStem && (
          <>
            {/* Dark hero */}
            <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-5 shadow-xl shadow-[#000]/40 border border-[#C9962A25]">
              <p className="text-violet-300/70 text-xs mb-3">
                {submitted.year}년생 · {submitted.gender === 'male' ? '남성' : '여성'} · 일간{' '}
                <span style={{ color: ELEMENT_COLORS[dayStem.element] }}>
                  {dayStem.hanja}({dayStem.ko})
                </span>
              </p>

              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <p className="text-violet-300/60 text-xs mb-1">대운 시작</p>
                  <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                    {daunStartAge}세
                  </p>
                </div>
                <div className="w-px h-10 bg-violet-400/30" />
                <div className="text-center">
                  <p className="text-violet-300/60 text-xs mb-1">진행 방향</p>
                  <p className="text-lg font-bold text-white">
                    {isForward ? '순행 ▶' : '역행 ◀'}
                  </p>
                </div>
                {currentDaun && (
                  <>
                    <div className="w-px h-10 bg-violet-400/30" />
                    <div className="text-center">
                      <p className="text-violet-300/60 text-xs mb-1">현재 대운</p>
                      <p className="text-2xl font-bold text-amber-300" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                        {pillarName(currentDaun.pillar)}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <p className="text-violet-300/60 text-xs leading-relaxed">
                대운은 {daunStartAge}세를 시작으로 10년마다 바뀌는 큰 운의 흐름입니다.{' '}
                {isForward ? '월주 천간의 다음 간지 순서로 순행합니다.' : '월주 천간의 이전 간지 순서로 역행합니다.'}
              </p>
            </div>

            {/* DaunChart */}
            <DaunChart result={result} birthYear={submitted.year} currentYear={currentYear} />

            {/* Current daun deep reading */}
            {currentDaun && (() => {
              const stem   = STEMS[currentDaun.pillar.stemIndex]
              const branch = BRANCHES[currentDaun.pillar.branchIndex]
              const sipsin = getSipsin(dayStemIdx, currentDaun.pillar.stemIndex)
              const reading = DAUN_READING[sipsin]
              const desc    = SIPSIN_DESC[sipsin]
              const ageYear = submitted.year + currentDaun.age
              const stemC   = ELEMENT_COLORS[stem.element]

              return (
                <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1 h-5 bg-amber-400 rounded-full" />
                    <h2 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                      현재 대운 심층 해석
                    </h2>
                    <span className="ml-auto text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-bold">
                      현재
                    </span>
                  </div>
                  <p className="text-xs text-[#7B6F9A] mb-5 ml-3">
                    {currentDaun.age}세 대운 ({ageYear}년 ~ {ageYear + 9}년)
                  </p>

                  <div className="flex items-center gap-4 mb-5 p-4 rounded-2xl" style={{ backgroundColor: stemC + '0D', borderColor: stemC + '20' }}>
                    <div
                      className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-2"
                      style={{ borderColor: stemC + '50', backgroundColor: stemC + '12' }}
                    >
                      <span className="text-2xl font-bold" style={{ color: stemC }}>{stem.hanja}</span>
                      <span className="text-xs" style={{ color: stemC + 'cc' }}>{stem.ko}</span>
                    </div>
                    <div
                      className="w-14 h-16 rounded-2xl flex flex-col items-center justify-center border-2"
                      style={{ borderColor: ELEMENT_COLORS[branch.element] + '50', backgroundColor: ELEMENT_COLORS[branch.element] + '12' }}
                    >
                      <span className="text-2xl font-bold" style={{ color: ELEMENT_COLORS[branch.element] }}>{branch.hanja}</span>
                      <span className="text-xs" style={{ color: ELEMENT_COLORS[branch.element] + 'cc' }}>{branch.ko}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${BADGE[sipsin] ?? 'bg-[#231844] text-[#A89BC0] border-[#2A1F4A]'}`}>
                          {sipsin}
                        </span>
                        {desc && <span className="text-xs text-[#7B6F9A]">{desc.meaning}</span>}
                      </div>
                      <p className="text-sm font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                        {reading?.title ?? sipsin + '의 대운'}
                      </p>
                    </div>
                  </div>

                  {reading && (
                    <div className="space-y-3">
                      <div className="flex gap-2 items-start bg-[#C9962A0D] border border-[#C9962A30] rounded-2xl px-4 py-3">
                        <span className="text-sm flex-shrink-0">💬</span>
                        <p className="text-sm text-[#E8B84B] font-medium leading-relaxed">{reading.plain}</p>
                      </div>
                      <p className="text-sm text-[#C4B8D8] leading-relaxed bg-[#1C1438] rounded-2xl p-4">
                        {reading.summary}
                      </p>

                      {[
                        { label: '💰 재물운', text: reading.wealth },
                        { label: '💼 직업운', text: reading.career },
                        { label: '💕 애정운', text: reading.love },
                      ].map(({ label, text }) => (
                        <div key={label} className="rounded-2xl border border-[#2A1F4A] p-4">
                          <p className="text-xs font-bold text-[#A89BC0] mb-1.5">{label}</p>
                          <p className="text-sm text-[#C4B8D8] leading-relaxed">{text}</p>
                        </div>
                      ))}

                      <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
                        <p className="text-xs font-bold text-amber-700 mb-1.5">⚠ 주의사항</p>
                        <p className="text-sm text-[#C4B8D8] leading-relaxed">{reading.caution}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* 올해 세운 분석 */}
            <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-6">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-5 bg-red-400 rounded-full" />
                <h2 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                  {_seunYear}년 세운 (歲運)
                </h2>
                <span className="ml-auto text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-full font-medium">
                  {seunStem.ko}{seunBranch.ko}년 {seunStem.hanja}{seunBranch.hanja}
                </span>
              </div>
              <p className="text-xs text-[#7B6F9A] mb-5 ml-3">올해의 연간 운세 분석</p>

              <div className="flex items-center gap-3 mb-5 p-4 bg-[#1C1438] rounded-2xl border border-[#2A1F4A]">
                <div
                  className="w-12 h-12 rounded-xl flex flex-col items-center justify-center border-2"
                  style={{ borderColor: ELEMENT_COLORS[seunStem.element] + '50', backgroundColor: ELEMENT_COLORS[seunStem.element] + '12' }}
                >
                  <span className="text-xl font-bold" style={{ color: ELEMENT_COLORS[seunStem.element] }}>{seunStem.hanja}</span>
                  <span className="text-[10px]" style={{ color: ELEMENT_COLORS[seunStem.element] + 'cc' }}>{seunStem.ko}</span>
                </div>
                <div
                  className="w-12 h-14 rounded-xl flex flex-col items-center justify-center border-2"
                  style={{ borderColor: ELEMENT_COLORS[seunBranch.element] + '50', backgroundColor: ELEMENT_COLORS[seunBranch.element] + '12' }}
                >
                  <span className="text-xl font-bold" style={{ color: ELEMENT_COLORS[seunBranch.element] }}>{seunBranch.hanja}</span>
                  <span className="text-[10px]" style={{ color: ELEMENT_COLORS[seunBranch.element] + 'cc' }}>{seunBranch.ko}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#E8DFC8] mb-1">
                    {ELEMENT_KO[seunStem.element]} {seunStem.yinYang === 'yang' ? '양(陽)' : '음(陰)'}의 해
                  </p>
                  <p className="text-xs text-[#A89BC0]">
                    {seunBranch.animal}띠 해 · {ELEMENT_KO[seunBranch.element]}기 흐름
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${BADGE[seunSipsin] ?? 'bg-[#231844] text-[#A89BC0] border-[#2A1F4A]'}`}>
                      {seunSipsin}
                    </span>
                    <span className="text-xs text-[#7B6F9A]">일간 기준</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-red-900/15 border border-red-900/40 p-4 mb-3">
                <p className="text-xs font-bold text-red-400 mb-2">{seunStem.ko}{seunBranch.ko}년({seunStem.hanja}{seunBranch.hanja}年) 특징</p>
                <p className="text-sm text-[#C4B8D8] leading-relaxed">
                  {_seunYear}년은 {seunStem.ko}({seunStem.hanja})와 {seunBranch.ko}({seunBranch.hanja})로 이루어진 해입니다.
                  천간({seunStem.hanja})은 {ELEMENT_KO[seunStem.element]} 기운, 지지({seunBranch.hanja})는 {ELEMENT_KO[seunBranch.element]} 기운을 담고 있으며
                  {seunBranch.animal}띠의 에너지가 한 해 흐름에 영향을 줍니다.
                </p>
              </div>

              {seunReading && (
                <div className="space-y-3">
                  <div className="flex gap-2 items-start bg-[#C9962A0D] border border-[#C9962A30] rounded-2xl px-4 py-3">
                    <span className="text-sm flex-shrink-0">💬</span>
                    <div>
                      <p className="text-[10px] text-[#C9962A] font-bold mb-0.5">올해를 한 줄로 요약하면</p>
                      <p className="text-sm text-[#E8B84B] font-medium leading-relaxed">{seunReading.summary.split('.')[0]}.</p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#1C1438] border border-[#2A1F4A] p-4">
                    <p className="text-xs font-bold text-[#A89BC0] mb-2">
                      일간 {dayStem.hanja}({dayStem.ko}) 기준 — {seunSipsin} 해
                    </p>
                    <p className="text-sm text-[#C4B8D8] leading-relaxed">{seunReading.summary}</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-2xl bg-[#C9962A15] border border-[#C9962A30] p-3">
                      <p className="text-[10px] font-bold text-[#C9962A] mb-1">핵심 키워드</p>
                      <p className="text-xs text-[#E8B84B] font-medium">{seunReading.keyword}</p>
                    </div>
                    <div className="flex-1 rounded-2xl bg-amber-50 border border-amber-100 p-3">
                      <p className="text-[10px] font-bold text-amber-600 mb-1">조언</p>
                      <p className="text-xs text-[#C4B8D8] leading-relaxed">{seunReading.advice}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Next daun preview */}
            {nextDaun && (() => {
              const stem     = STEMS[nextDaun.pillar.stemIndex]
              const sipsin   = getSipsin(dayStemIdx, nextDaun.pillar.stemIndex)
              const reading  = DAUN_READING[sipsin]
              const ageYear  = submitted.year + nextDaun.age
              const stemC    = ELEMENT_COLORS[stem.element]

              return (
                <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1 h-5 bg-[#3D3358] rounded-full" />
                    <h2 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                      다음 대운 예고
                    </h2>
                    <span className="ml-auto text-xs bg-[#1C1438] text-[#A89BC0] border border-[#2A1F4A] px-2.5 py-1 rounded-full">
                      {nextDaun.age}세 ~ {ageYear}년 시작
                    </span>
                  </div>
                  <p className="text-xs text-[#7B6F9A] mb-4 ml-3">다음 10년 사이클 미리보기</p>

                  <div className="flex items-center gap-3 p-4 bg-[#1C1438] rounded-2xl border border-[#2A1F4A]">
                    <div
                      className="w-12 h-12 rounded-xl flex flex-col items-center justify-center border-2"
                      style={{ borderColor: stemC + '50', backgroundColor: stemC + '12' }}
                    >
                      <span className="text-xl font-bold" style={{ color: stemC }}>{stem.hanja}</span>
                      <span className="text-xs" style={{ color: stemC + 'cc' }}>{stem.ko}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${BADGE[sipsin] ?? 'bg-[#231844] text-[#A89BC0] border-[#2A1F4A]'}`}>
                          {sipsin}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#E8DFC8]">
                        {reading?.title ?? sipsin + '의 대운'}
                      </p>
                      {reading && (
                        <p className="text-xs text-[#A89BC0] mt-1 leading-relaxed">
                          {reading.summary}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })()}

            <PointsClaimButton featureKey="daun" label="대운 분석 확인 📊" />
            <button
              onClick={() => { setStep('form'); window.scrollTo(0, 0) }}
              className="w-full py-3.5 bg-[#231844] text-[#C4B8D8] font-semibold rounded-2xl text-sm hover:bg-[#2A1F4A] transition active:scale-[0.98]"
            >
              다시 조회하기
            </button>

            <p className="text-center text-xs text-[#4A4060] pb-6">
              사주팔자 계산기 — 양력 기준 · 절기 근사값 적용
            </p>
          </>
        )}
      </div>
    </div>
  )
}
