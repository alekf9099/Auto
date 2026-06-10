import { useState } from 'react'
import type { BirthInput } from '../types'
import { calculateSaju, getSipsin, pillarName } from '../utils/saju'
import { STEMS, BRANCHES, ELEMENT_COLORS, SIPSIN_DESC } from '../utils/constants'
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
    plain: '지금은 나와 비슷한 경쟁자들이 많아지는 시기입니다. 독립심이 강해지고 혼자 하고 싶은 욕구가 올라옵니다.',
    summary: '나와 비슷한 위치의 사람들이 주변에 많아지는 시기입니다. 경쟁이 심화되지만 동류끼리의 협력도 강해집니다. 독립심이 강해지며 자기 방식대로 하고 싶은 욕구가 올라옵니다.',
    wealth: '재물에 경쟁자가 나타납니다. 돈이 들어오는 만큼 나가기도 합니다. 타인에게 보증이나 대출을 서주는 일은 피해야 합니다.',
    career: '독립, 창업, 프리랜서 전환을 생각하게 됩니다. 조직 안에 있다면 내 영역을 지키려는 경쟁 심리가 강해지는 시기입니다.',
    love: '애정 면에서 경쟁자가 나타날 수 있습니다. 기혼자라면 배우자와 주도권 다툼이 생길 수 있습니다.',
    caution: '동업은 지분과 역할을 명확히 하세요. 감정적 경쟁은 최소화하고, 남의 말과 내 의지 사이의 균형을 유지하세요.',
  },
  겁재: {
    title: '투쟁과 변동의 대운',
    plain: '에너지는 넘치지만 돈과 인간관계에서 예상 밖의 변수가 생기는 시기입니다. 충동적인 결정은 금물입니다.',
    summary: '에너지는 충만하지만 그 에너지가 엉뚱한 방향으로 흐르기 쉬운 시기입니다. 손재수가 따르고 인간관계에서 예기치 않은 갈등이 생길 수 있습니다. 도전 정신은 넘치지만 무모한 도박은 금물입니다.',
    wealth: '투자나 투기에 손대면 손해를 보기 쉽습니다. 지인이나 친구를 통해 재물이 나가는 경우가 많으니 돈 거래는 철저히 문서화하세요.',
    career: '직업의 급작스러운 변동이 생기거나 스스로 원하게 됩니다. 정공법보다 창의적인 방식으로 돌파구를 찾아야 합니다.',
    love: '연애에서 갈등과 다툼, 이별 가능성이 높아집니다. 질투심과 소유욕이 강해져 스스로도 힘들 수 있습니다.',
    caution: '충동적인 결정, 특히 돈과 관련된 것들을 경계하세요. 화가 났을 때는 중요한 결정을 내리지 마세요.',
  },
  식신: {
    title: '재능과 풍요의 대운',
    plain: '인생에서 가장 여유롭고 풍요로운 시기 중 하나입니다. 먹고사는 걱정이 줄고 하고 싶은 일을 할 수 있습니다.',
    summary: '가장 편안하고 여유로운 대운 중 하나입니다. 먹고사는 걱정이 줄고 자신의 재능과 취미를 마음껏 펼칠 수 있는 시기입니다. 건강이 좋아지고 주변에 사람이 모여듭니다.',
    wealth: '꾸준하게 수입이 들어오는 시기입니다. 투자보다 안정적인 수입원을 만드는 것이 더 잘 맞습니다.',
    career: '자신의 장기를 살리는 직업, 특히 요리·예술·교육·서비스 쪽에서 빛을 발합니다. 조직 내에서도 전문성을 인정받습니다.',
    love: '관계가 자연스럽고 따뜻하게 흘러가는 시기입니다. 편안한 분위기에서 자연스러운 만남이 이어집니다.',
    caution: '너무 여유로워서 게을러지거나 기회를 흘려보내지 마세요. 좋은 시기일수록 다음을 준비해야 합니다.',
  },
  상관: {
    title: '표현과 변화의 대운',
    plain: '창의력과 표현력이 폭발하는 시기입니다. 기존 틀을 깨고 싶어지며 직업과 관계에 큰 변화가 일어납니다.',
    summary: '창의력과 언변이 폭발하는 시기입니다. 기존의 틀을 깨고 싶은 욕구가 강해지며, 직업과 관계 모두에서 큰 변화가 일어납니다. 두뇌 회전이 빠르고 표현이 날카로워집니다.',
    wealth: '한꺼번에 크게 벌거나 크게 잃는 기복이 있습니다. 부업, 프리랜서, 창작 활동으로 돈을 버는 경향이 있습니다.',
    career: '예술·방송·IT·스타트업처럼 창의성이 요구되는 분야에서 두각을 나타냅니다. 기존 직장이 답답하게 느껴져 이직이나 창업을 선택하는 사람이 많습니다.',
    love: '매력이 넘쳐흘러 이성의 주목을 받지만, 관계가 오래 유지되기 어렵습니다. 변덕스러운 감정이 문제가 되기도 합니다.',
    caution: '말이 너무 날카로워 주변에 상처를 줄 수 있습니다. 직장 내 권위자와의 마찰, 관재수를 주의하세요.',
  },
  편재: {
    title: '투자와 활동의 대운',
    plain: '돈과 활동력이 왕성해지는 시기입니다. 투자·사업으로 큰돈을 움직이게 되지만 기복도 큽니다.',
    summary: '돈과 활동력이 왕성해지는 시기입니다. 투자·사업·부동산 등으로 큰돈을 움직이게 됩니다. 역마살처럼 이동과 변화가 많고, 아버지나 남성과의 인연이 강해집니다.',
    wealth: '재물운이 강하지만 기복이 큽니다. 대박도 가능하지만 큰 손실도 가능합니다. 분산 투자가 중요하고, 한 곳에 모든 걸 걸면 위험합니다.',
    career: '사업가·영업·무역·투자·금융 분야에서 두각을 나타냅니다. 새로운 프로젝트나 비즈니스 개발 쪽에서 힘을 발휘합니다.',
    love: '매력적이고 활발한 연애가 펼쳐집니다. 이미 연인이 있다면 외부의 유혹을 조심해야 합니다.',
    caution: '지나친 낙관이 독이 됩니다. 기회가 왔을 때 냉정하게 위험을 계산하세요. 보증과 투자 실패는 한 번에 무너질 수 있습니다.',
  },
  정재: {
    title: '안정과 성실의 대운',
    plain: '꾸준히 노력하면 착실하게 결실이 쌓이는 시기입니다. 부동산·저축·결혼 같은 인생의 기반을 다집니다.',
    summary: '꾸준한 노력이 결실을 맺는 시기입니다. 급하게 큰돈을 버는 것보다 착실하게 쌓아가는 과정이 잘 맞습니다. 부동산 취득·직업 안정화·결혼 등 인생의 기반을 다지는 사건들이 일어납니다.',
    wealth: '안정적인 수입이 보장됩니다. 저축과 부동산이 잘 맞습니다. 재물이 천천히, 그러나 확실하게 쌓입니다.',
    career: '전문직·회계·금융·공직·관리직에서 안정적인 성과를 냅니다. 새로운 것보다 기존의 것을 충실히 해나가는 것이 최선입니다.',
    love: '안정적이고 신뢰 기반의 관계가 맺어집니다. 결혼이나 동거 등 실질적인 관계의 진전이 일어나기 쉬운 시기입니다.',
    caution: '고집이 세어져 변화를 거부하다 기회를 놓칠 수 있습니다. 지나친 안주를 경계하고 작은 혁신도 함께 추구하세요.',
  },
  편관: {
    title: '도전과 권위의 대운',
    plain: '강한 외부 압력과 마찰이 생기는 시기입니다. 힘들지만 이겨내면 강한 권위와 사회적 지위를 얻습니다.',
    summary: '강한 외부 압력과 마찰이 생기는 시기입니다. 권위자와의 갈등, 관재수, 건강 이상 등이 생길 수 있습니다. 하지만 이 압력을 이겨낸다면 강한 권위와 사회적 지위를 얻을 수 있습니다.',
    wealth: '재물이 묶이거나 예상치 못한 지출이 생깁니다. 소송·세금·벌금 관련 문제가 생길 수 있으니 서류와 계약을 꼼꼼히 하세요.',
    career: '승진의 기회와 동시에 권력 다툼이 생기는 시기입니다. 군인·경찰·법조인·의사처럼 강인함이 요구되는 분야에서 두각을 보입니다.',
    love: '관계에서 통제와 억압의 역학이 생깁니다. 서로의 독립성을 존중하는 것이 관계 유지의 핵심입니다.',
    caution: '건강을 무리하게 혹사하지 마세요. 법적 분쟁이나 상해사고가 생기기 쉬운 시기이니 교통사고와 안전사고에 유의하세요.',
  },
  정관: {
    title: '명예와 성취의 대운',
    plain: '조직에서 인정받고 지위가 높아지는 시기입니다. 규칙을 따르는 것이 오히려 출세의 길이 됩니다.',
    summary: '사회적으로 인정받고 지위가 높아지는 시기입니다. 규칙과 원칙을 따르는 것이 오히려 출세의 길이 됩니다. 직장에서 승진하고 사회적으로 명성을 쌓는 좋은 시기입니다.',
    wealth: '안정적이고 꾸준한 재물 흐름이 유지됩니다. 직위에 걸맞은 수입 증가가 이루어집니다.',
    career: '조직·공공기관·교육·법률·행정 쪽에서 크게 두각을 나타냅니다. 실력으로 인정받고 승진하는 경향이 강합니다.',
    love: '신뢰할 수 있는 사람과의 깊은 관계가 맺어집니다. 결혼 혹은 장기적인 관계의 시작을 알리는 시기입니다.',
    caution: '규칙에 너무 얽매여 융통성을 잃지 마세요. 지나치게 완벽해 보이려는 태도가 주변과의 거리감을 만들 수 있습니다.',
  },
  편인: {
    title: '학문과 역마의 대운',
    plain: '이동과 새로운 공부, 특수한 재능이 꽃피는 시기입니다. 혼자 있고 싶은 경향과 고독함이 생깁니다.',
    summary: '이동과 학문, 특수한 재능이 꽃을 피우는 시기입니다. 새로운 학문이나 철학, 특이한 재주를 익히게 됩니다. 고독한 경향이 있고 주변과의 거리감이 생깁니다.',
    wealth: '재물보다 지식과 경험에 투자하게 됩니다. 불규칙한 수입이 생기기 쉽고, 프리랜서나 전문직이 더 잘 맞습니다.',
    career: '연구·철학·종교·예술·IT·의술 같은 특수한 분야에서 성과를 냅니다. 조직보다는 독립적으로 일하는 것이 맞습니다.',
    love: '어느 정도 거리감이 생기고 혼자 있고 싶은 마음이 커집니다. 기혼자는 별거나 단신 부임이 생길 수 있습니다.',
    caution: '현실 감각이 떨어질 수 있습니다. 이상적인 계획만 세우다 실천을 못하는 것을 주의하세요.',
  },
  정인: {
    title: '학문과 모성의 대운',
    plain: '인생에서 가장 안정적인 배움의 시기입니다. 귀인의 도움이 생기고 학문·자격증에서 큰 성과를 냅니다.',
    summary: '인생에서 가장 안정적이고 풍요로운 배움의 시기입니다. 어머니나 보살펴 주는 사람의 도움이 생기고, 학문과 자기계발에 큰 성과를 거둡니다. 심리적으로도 안정됩니다.',
    wealth: '큰 재물은 아니지만 항상 부족하지 않은 수준의 안정적인 재물이 유지됩니다.',
    career: '교육·학술·출판·상담·의료·공직에서 탁월한 성과를 냅니다. 자격증, 학위 취득이 큰 도움이 됩니다.',
    love: '가족과 가정에 집중하게 됩니다. 헌신하고 돌보는 역할을 자연스럽게 맡게 됩니다.',
    caution: '지나친 의존 혹은 과보호가 문제가 될 수 있습니다. 상대방을 너무 많이 걱정하거나 간섭하면 관계가 질식할 수 있습니다.',
  },
}

const SEUN_READING: Record<string, { summary: string; keyword: string; advice: string }> = {
  비견: {
    summary: '나와 같은 에너지가 외부에서 들어오는 해입니다. 경쟁자가 나타나거나 독립 욕구가 강해집니다. 동업, 협업보다 단독 결정이 유리합니다.',
    keyword: '독립 · 경쟁 · 분리',
    advice: '비용 지출을 통제하고 새로운 파트너십에 신중하게 접근하세요.',
  },
  겁재: {
    summary: '돈과 관계에 예상치 못한 변수가 생기는 해입니다. 충동적인 투자나 보증, 지인 부탁에는 단호히 선을 그어야 합니다.',
    keyword: '손재 · 변동 · 돌발',
    advice: '투기성 투자, 연대보증, 큰 계약 서명은 꼼꼼히 검토하세요.',
  },
  식신: {
    summary: '재능이 빛나고 먹고사는 걱정이 줄어드는 좋은 해입니다. 하고 싶은 것을 할 수 있고, 몸과 마음 모두 건강해집니다.',
    keyword: '풍요 · 재능 · 여유',
    advice: '너무 편안해서 게을러지지 않도록 목표를 세워두세요.',
  },
  상관: {
    summary: '말, 글, 창의적인 표현이 힘을 발휘하는 해입니다. 기존의 틀을 깨고 싶은 욕구가 강해집니다. 직장이나 권위자와 마찰이 생길 수 있으니 언행에 주의하세요.',
    keyword: '표현 · 변화 · 마찰',
    advice: '감정적 충동으로 중요한 관계를 해치지 않도록 말을 다듬으세요.',
  },
  편재: {
    summary: '돈이 크게 움직이는 해입니다. 기회도 오지만 손실도 크게 날 수 있습니다. 새로운 사업, 투자, 부동산 관련 기회가 찾아올 수 있습니다.',
    keyword: '재물 기복 · 활동 · 기회',
    advice: '분산 투자하고 한 곳에 올인하는 것을 피하세요.',
  },
  정재: {
    summary: '착실하게 노력한 것이 결과로 돌아오는 해입니다. 안정적인 수입이 유지되고 재물이 차곡차곡 쌓입니다.',
    keyword: '안정 · 성실 · 결실',
    advice: '현상 유지가 최선의 전략입니다. 검증된 방법을 고수하세요.',
  },
  편관: {
    summary: '외부의 압박과 도전이 강해지는 해입니다. 법적 문제, 건강 이상, 갑작스러운 직업 변동이 생길 수 있습니다. 하지만 이 압력을 이겨내면 도약이 가능합니다.',
    keyword: '도전 · 압박 · 성장',
    advice: '건강 검진, 법적 서류 정리, 계약서 검토를 철저히 하세요.',
  },
  정관: {
    summary: '사회적으로 명예와 인정이 따르는 해입니다. 승진, 자격증 취득, 사회적 지위 향상이 일어날 수 있습니다.',
    keyword: '명예 · 승진 · 인정',
    advice: '규칙을 지키고 성실함을 유지하면 자연스럽게 보상이 옵니다.',
  },
  편인: {
    summary: '새로운 공부, 여행, 특이한 취미가 생기는 해입니다. 불규칙한 생활과 정신적 피로가 쌓일 수 있습니다.',
    keyword: '역마 · 학문 · 고독',
    advice: '규칙적인 생활 패턴을 유지하고 현실적인 계획도 함께 세우세요.',
  },
  정인: {
    summary: '배움과 안정이 함께 오는 좋은 해입니다. 학업, 자격증, 전문성 강화에 큰 성과를 냅니다.',
    keyword: '학문 · 안정 · 보살핌',
    advice: '배움에 투자하세요. 지식이 곧 자산이 되는 해입니다.',
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

  const seun2026StemIdx   = 2
  const seun2026BranchIdx = 6
  const seunStem   = STEMS[seun2026StemIdx]
  const seunBranch = BRANCHES[seun2026BranchIdx]
  const seunSipsin = result ? getSipsin(dayStemIdx, seun2026StemIdx) : '비견'
  const seunReading = SEUN_READING[seunSipsin]

  return (
    <div className="min-h-screen bg-[#0D0A1A]">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-[#0D0A1A]/95 backdrop-blur-md border-b border-[#C9962A30]">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3 flex items-center gap-3">
          <button
            onClick={onBack}
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

            {/* 2026년 세운 분석 */}
            <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-6">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-5 bg-red-400 rounded-full" />
                <h2 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                  2026년 세운 (歲運)
                </h2>
                <span className="ml-auto text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-full font-medium">
                  병오년 丙午
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
                    {ELEMENT_KO[seunStem.element]} 양(陽)의 해
                  </p>
                  <p className="text-xs text-[#A89BC0]">
                    {seunBranch.animal}띠 해 · 화기(火氣) 집중
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
                <p className="text-xs font-bold text-red-400 mb-2">병오년(丙午年) 특징</p>
                <p className="text-sm text-[#C4B8D8] leading-relaxed">
                  2026년은 병(丙)과 오(午) 모두 화(火) 기운으로 이루어진 강렬한 불의 해입니다.
                  태양처럼 뜨겁고 밝은 에너지가 넘치며, 활동력·표현력·열정이 극대화됩니다.
                  화기가 강한 해는 빠른 성과를 낼 수 있지만 과열되면 충돌과 소진도 옵니다.
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
