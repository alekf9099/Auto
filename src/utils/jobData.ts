export type Element5 = '목' | '화' | '토' | '금' | '수'

const STEM_ELEMENT: Element5[] = ['목','목','화','화','토','토','금','금','수','수']

export function getElement(stemIndex: number): Element5 {
  return STEM_ELEMENT[((stemIndex % 10) + 10) % 10]
}

export interface JobCareerInfo {
  element: Element5
  elementChi: string
  emoji: string
  mood: string
  industries: string[]
  strengths: string[]
  workStyle: string
  interviewTip: string
  luckyDays: string[]
  caution: string
}

export const JOB_DATA: Record<Element5, JobCareerInfo> = {
  목: {
    element: '목',
    elementChi: '木',
    emoji: '🌱',
    mood: '성장과 가능성을 향해 뻗어가는 기운',
    industries: ['교육 · 출판', '콘텐츠 기획', '스타트업 · 신사업', '디자인', '환경 · 조경'],
    strengths: ['성장지향', '창의력', '유연한 사고', '협업 능력', '추진력'],
    workStyle: '새로운 아이디어를 키우고 발전시키는 기획·창조 업무에서 강점을 발휘합니다. 정해진 틀 안에서 일하기보다, 스스로 방향을 설계하는 환경에서 능력이 폭발합니다.',
    interviewTip: '본인의 성장 스토리와 앞으로의 비전을 구체적으로 말하세요. 막연한 포부보다 다음 단계가 뚜렷하게 보이는 사람이 뽑힙니다.',
    luckyDays: ['목요일', '수요일'],
    caution: '조급하게 결과를 내려다 무리한 약속을 하면 신뢰를 잃습니다. 지금 속도를 늦추고 지킬 수 있는 것만 약속하세요.',
  },
  화: {
    element: '화',
    elementChi: '火',
    emoji: '🔥',
    mood: '열정과 표현력이 빛나는 기운',
    industries: ['마케팅 · 홍보', '엔터테인먼트', '영업', '미디어 · 방송', '서비스업'],
    strengths: ['열정', '표현력', '사교성', '에너지', '추진력'],
    workStyle: '사람을 만나고 자신의 매력을 드러내는 대외 업무에서 빛을 발합니다. 가만히 앉아있는 업무보다 무대 위에 서는 역할이 맞습니다.',
    interviewTip: '밝은 에너지와 자신감을 그대로 보여주세요. 단, 침착하게 답하는 모습을 한 번은 보여줘야 신뢰를 얻습니다.',
    luckyDays: ['화요일', '목요일'],
    caution: '감정이 앞서 즉흥적으로 결정하면 반드시 후회합니다. 중요한 결정은 하루 미루고 다시 점검하세요.',
  },
  토: {
    element: '토',
    elementChi: '土',
    emoji: '⛰️',
    mood: '안정과 신뢰를 쌓아가는 기운',
    industries: ['금융 · 부동산', '행정 · 공공기관', '인사 · 총무', '제조 · 생산관리', '농업 · 식품'],
    strengths: ['신뢰감', '책임감', '꾸준함', '중재력', '실행력'],
    workStyle: '꾸준함과 성실함이 필요한 관리·운영 업무에서 신뢰를 얻습니다. 화려함보다 끝까지 책임지는 모습이 평가받습니다.',
    interviewTip: '맡은 일을 끝까지 해낸 경험을 구체적인 사례로 말하세요. 추상적인 말보다 숫자와 결과가 신뢰를 만듭니다.',
    luckyDays: ['토요일', '화요일'],
    caution: '결정을 미루며 우유부단한 모습을 보이면 기회를 놓칩니다. 지금 결정하고 그 결정을 밀어붙이세요.',
  },
  금: {
    element: '금',
    elementChi: '金',
    emoji: '⚙️',
    mood: '전문성과 원칙으로 인정받는 기운',
    industries: ['금융 · 회계', '법률 · 컨설팅', 'IT · 엔지니어링', '품질관리', '의료 · 제약'],
    strengths: ['전문성', '분석력', '원칙주의', '결단력', '정확성'],
    workStyle: '정확성과 전문 지식이 요구되는 분석·관리 업무에서 능력을 인정받습니다. 모호한 지시보다 명확한 기준이 있는 환경에서 강합니다.',
    interviewTip: '데이터와 근거로 답하세요. 감으로 말하는 순간 신뢰를 잃습니다.',
    luckyDays: ['금요일', '토요일'],
    caution: '완벽주의에 갇혀 기회를 미루면 손해입니다. 80%만 준비됐어도 지금 움직이세요.',
  },
  수: {
    element: '수',
    elementChi: '水',
    emoji: '💧',
    mood: '지혜와 통찰로 길을 찾는 기운',
    industries: ['연구 · 개발', 'IT · 데이터', '심리 · 상담', '무역 · 해외영업', '예술 · 기획'],
    strengths: ['통찰력', '적응력', '학습능력', '소통력', '전략적 사고'],
    workStyle: '깊이 있는 분석과 전략 수립이 필요한 연구·기획 업무에 강합니다. 빠른 결정보다 정확한 결정이 필요한 자리에서 빛납니다.',
    interviewTip: '문제를 다각도로 분석한 경험을 차분하게 설명하세요. 서두르지 않는 태도 자체가 강점입니다.',
    luckyDays: ['수요일', '금요일'],
    caution: '생각이 너무 많아 결정을 망설이면 기회는 이미 지나갑니다. 지금 정하고 행동하세요.',
  },
}

export type LuckGrade = 'great' | 'good' | 'neutral' | 'caution'

export interface SipsinJobLuck {
  grade: LuckGrade
  label: string
  title: string
  desc: string
  tip: string
}

export const JOB_LUCK_BY_SIPSIN: Record<string, SipsinJobLuck> = {
  정관: {
    grade: 'great', label: '대길',
    title: '정규직 합격운이 최고조인 시기',
    desc: '책임감 있는 모습이 돋보이고, 조직에서 인정받아 발탁될 가능성이 높습니다. 공채·정규직 지원이라면 지금이 최적의 타이밍입니다. 망설이지 말고 지원하세요.',
    tip: '서류와 면접에서 성실함과 신뢰감을 강조하세요. 그게 지금 가장 강력한 무기입니다.',
  },
  편관: {
    grade: 'good', label: '길',
    title: '도전적인 기회가 찾아오는 시기',
    desc: '경쟁은 치열하지만 어려운 상황을 돌파하는 능력을 보여주면 큰 기회로 이어집니다. 압박이 있는 자리일수록 오히려 유리합니다.',
    tip: '압박감 있는 질문에도 침착하게 답하세요. 흔들리지 않는 모습이 곧 합격입니다.',
  },
  정인: {
    grade: 'good', label: '길',
    title: '시험·자격증 운이 좋은 시기',
    desc: '학습한 내용이 평가에서 그대로 빛을 발합니다. 필기·인적성 시험이 있다면 지금 결과가 확실히 좋습니다.',
    tip: '자격증이나 교육 이수 경험을 적극적으로 어필하세요. 숨기지 말고 다 꺼내세요.',
  },
  편인: {
    grade: 'neutral', label: '평',
    title: '이직·전직에 대한 관심이 커지는 시기',
    desc: '익숙한 분야보다 새로운 분야에 눈이 가는 시기입니다. 충동적으로 결정하지 말고 지금은 정보 수집에만 집중하세요.',
    tip: '새로운 분야에 도전한다면 관련 경험을 먼저 쌓으세요. 준비 없이 뛰어들면 반드시 후회합니다.',
  },
  식신: {
    grade: 'great', label: '대길',
    title: '능력을 마음껏 발휘하는 시기',
    desc: '면접에서 자신감 있고 여유로운 모습을 보일 수 있어 좋은 인상을 확실히 남깁니다. 지금이 자신을 드러낼 최고의 타이밍입니다.',
    tip: '본인의 강점과 포트폴리오를 자연스럽게 풀어내세요. 망설이면 묻힙니다.',
  },
  상관: {
    grade: 'neutral', label: '평',
    title: '변화의 바람이 부는 시기',
    desc: '톡톡 튀는 아이디어가 주목받지만 직설적인 표현이 마찰을 만들 수 있습니다. 내용은 과감하게, 표현은 부드럽게 가세요.',
    tip: '독창적인 아이디어는 부드러운 화법으로 전달하세요. 그래야 받아들여집니다.',
  },
  정재: {
    grade: 'good', label: '길',
    title: '안정적인 자리를 얻는 시기',
    desc: '꾸준한 노력이 결실을 맺는 흐름입니다. 안정적인 직장과의 인연이 지금 확실하게 따라옵니다.',
    tip: '꾸준함과 장기적인 성장 계획을 어필하세요. 그게 지금 가장 잘 통합니다.',
  },
  편재: {
    grade: 'neutral', label: '평',
    title: '여러 제안이 들어오는 시기',
    desc: '여러 회사·기회에서 동시에 제안이 들어올 수 있습니다. 조건만 보고 성급히 결정하면 반드시 후회합니다.',
    tip: '여러 옵션을 비교할 때 장기적인 비전을 기준으로 판단하세요. 조건만 보지 마세요.',
  },
  비견: {
    grade: 'neutral', label: '평',
    title: '경쟁자가 많은 시기',
    desc: '비슷한 조건의 경쟁자가 많아 치열한 경쟁이 예상됩니다. 차별점이 없으면 그대로 묻힙니다.',
    tip: '나만의 강점을 한 문장으로 정리하세요. 면접에서 그 한 문장이 승부를 가릅니다.',
  },
  겁재: {
    grade: 'caution', label: '주의',
    title: '경쟁과 변동을 조심해야 할 시기',
    desc: '성급한 이직이나 무리한 조건 변경은 손해로 이어집니다. 지금은 신중한 판단이 전부입니다.',
    tip: '중요한 결정은 시간을 두고 여러 번 검토한 뒤 내리세요. 서두르면 반드시 후회합니다.',
  },
}

export const LUCK_GRADE_CFG: Record<LuckGrade, { color: string; bg: string; border: string; emoji: string }> = {
  great:   { color: '#C9962A', bg: '#C9962A18', border: '#C9962A45', emoji: '✨' },
  good:    { color: '#4BBF7E', bg: '#4BBF7E18', border: '#4BBF7E45', emoji: '🌟' },
  neutral: { color: '#8B8FA8', bg: '#8B8FA818', border: '#8B8FA845', emoji: '🌙' },
  caution: { color: '#E05252', bg: '#E0525218', border: '#E0525245', emoji: '⚡' },
}
