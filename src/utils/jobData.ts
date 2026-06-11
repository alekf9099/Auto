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
    workStyle: '새로운 아이디어를 키우고 발전시키는 기획·창조 업무에서 강점을 발휘합니다.',
    interviewTip: '본인의 성장 스토리와 앞으로의 비전을 구체적으로 어필하면 좋은 인상을 줍니다.',
    luckyDays: ['목요일', '수요일'],
    caution: '조급하게 결과를 내려다 무리한 약속을 하지 않도록 주의하세요.',
  },
  화: {
    element: '화',
    elementChi: '火',
    emoji: '🔥',
    mood: '열정과 표현력이 빛나는 기운',
    industries: ['마케팅 · 홍보', '엔터테인먼트', '영업', '미디어 · 방송', '서비스업'],
    strengths: ['열정', '표현력', '사교성', '에너지', '추진력'],
    workStyle: '사람을 만나고 자신의 매력을 드러내는 대외 업무에서 빛을 발합니다.',
    interviewTip: '밝은 에너지와 자신감을 보여주되, 침착하게 답변하는 모습을 함께 보여주면 좋습니다.',
    luckyDays: ['화요일', '목요일'],
    caution: '감정이 앞서 즉흥적으로 결정하지 않도록 한 번 더 점검하세요.',
  },
  토: {
    element: '토',
    elementChi: '土',
    emoji: '⛰️',
    mood: '안정과 신뢰를 쌓아가는 기운',
    industries: ['금융 · 부동산', '행정 · 공공기관', '인사 · 총무', '제조 · 생산관리', '농업 · 식품'],
    strengths: ['신뢰감', '책임감', '꾸준함', '중재력', '실행력'],
    workStyle: '꾸준함과 성실함이 필요한 관리·운영 업무에서 신뢰를 얻습니다.',
    interviewTip: '책임감 있게 맡은 일을 끝까지 해낸 경험을 구체적인 사례로 풀어내면 효과적입니다.',
    luckyDays: ['토요일', '화요일'],
    caution: '결정을 미루며 우유부단한 모습을 보이지 않도록 주의하세요.',
  },
  금: {
    element: '금',
    elementChi: '金',
    emoji: '⚙️',
    mood: '전문성과 원칙으로 인정받는 기운',
    industries: ['금융 · 회계', '법률 · 컨설팅', 'IT · 엔지니어링', '품질관리', '의료 · 제약'],
    strengths: ['전문성', '분석력', '원칙주의', '결단력', '정확성'],
    workStyle: '정확성과 전문 지식이 요구되는 분석·관리 업무에서 능력을 인정받습니다.',
    interviewTip: '데이터와 근거를 바탕으로 논리적으로 답변하면 신뢰도를 높일 수 있습니다.',
    luckyDays: ['금요일', '토요일'],
    caution: '지나친 완벽주의로 기회를 미루지 않도록 균형을 잡으세요.',
  },
  수: {
    element: '수',
    elementChi: '水',
    emoji: '💧',
    mood: '지혜와 통찰로 길을 찾는 기운',
    industries: ['연구 · 개발', 'IT · 데이터', '심리 · 상담', '무역 · 해외영업', '예술 · 기획'],
    strengths: ['통찰력', '적응력', '학습능력', '소통력', '전략적 사고'],
    workStyle: '깊이 있는 분석과 전략 수립이 필요한 연구·기획 업무에 강합니다.',
    interviewTip: '문제를 다각도로 분석한 경험을 차분하게 설명하면 강한 인상을 줍니다.',
    luckyDays: ['수요일', '금요일'],
    caution: '생각이 너무 많아 결정을 망설이다 기회를 놓치지 않도록 하세요.',
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
    desc: '책임감 있는 모습이 돋보이고, 조직에서 인정받아 발탁될 가능성이 높습니다. 공채·정규직 지원에 특히 유리한 흐름이에요.',
    tip: '서류와 면접에서 성실함과 신뢰감을 강조해보세요.',
  },
  편관: {
    grade: 'good', label: '길',
    title: '도전적인 기회가 찾아오는 시기',
    desc: '경쟁은 치열하지만, 어려운 상황을 돌파하는 능력을 보여주면 큰 기회로 이어질 수 있습니다.',
    tip: '압박감 있는 질문에도 침착하게 대응하는 모습을 준비하세요.',
  },
  정인: {
    grade: 'good', label: '길',
    title: '시험·자격증 운이 좋은 시기',
    desc: '학습한 내용이 평가에서 빛을 발합니다. 필기·인적성 시험이 있다면 좋은 결과가 기대됩니다.',
    tip: '자격증이나 교육 이수 경험을 적극적으로 어필하세요.',
  },
  편인: {
    grade: 'neutral', label: '평',
    title: '이직·전직에 대한 관심이 커지는 시기',
    desc: '익숙한 분야보다 새로운 분야에 눈이 가는 시기입니다. 충동적인 결정보다는 정보 수집에 집중하세요.',
    tip: '새로운 분야에 도전한다면 관련 경험을 미리 쌓아두면 좋습니다.',
  },
  식신: {
    grade: 'great', label: '대길',
    title: '능력을 마음껏 발휘하는 시기',
    desc: '면접에서 자신감 있고 여유로운 모습을 보일 수 있어 좋은 인상을 남기기 쉽습니다.',
    tip: '본인의 강점과 포트폴리오를 자연스럽게 풀어내 보세요.',
  },
  상관: {
    grade: 'neutral', label: '평',
    title: '변화의 바람이 부는 시기',
    desc: '톡톡 튀는 아이디어가 주목받을 수 있지만, 직설적인 표현으로 마찰이 생기지 않도록 주의가 필요합니다.',
    tip: '독창적인 아이디어는 부드러운 화법으로 전달해보세요.',
  },
  정재: {
    grade: 'good', label: '길',
    title: '안정적인 자리를 얻는 시기',
    desc: '꾸준한 노력이 결실을 맺는 흐름으로, 안정적인 직장과의 인연이 따릅니다.',
    tip: '꾸준함과 장기적인 성장 계획을 어필하면 좋습니다.',
  },
  편재: {
    grade: 'neutral', label: '평',
    title: '여러 제안이 들어오는 시기',
    desc: '여러 회사·기회에서 제안이 들어올 수 있지만, 조건만 보고 성급히 결정하지 않도록 주의하세요.',
    tip: '여러 옵션을 비교할 때 장기적인 비전을 기준으로 판단하세요.',
  },
  비견: {
    grade: 'neutral', label: '평',
    title: '경쟁자가 많은 시기',
    desc: '비슷한 조건의 경쟁자가 많아 치열한 경쟁이 예상됩니다. 자신만의 차별점을 찾는 것이 중요합니다.',
    tip: '나만의 강점을 한 문장으로 정리해 면접에서 활용해보세요.',
  },
  겁재: {
    grade: 'caution', label: '주의',
    title: '경쟁과 변동을 조심해야 할 시기',
    desc: '성급한 이직이나 무리한 조건 변경은 손해로 이어질 수 있습니다. 신중한 판단이 필요한 시기입니다.',
    tip: '중요한 결정은 시간을 두고 여러 번 검토한 뒤 내리세요.',
  },
}

export const LUCK_GRADE_CFG: Record<LuckGrade, { color: string; bg: string; border: string; emoji: string }> = {
  great:   { color: '#C9962A', bg: '#C9962A18', border: '#C9962A45', emoji: '✨' },
  good:    { color: '#4BBF7E', bg: '#4BBF7E18', border: '#4BBF7E45', emoji: '🌟' },
  neutral: { color: '#8B8FA8', bg: '#8B8FA818', border: '#8B8FA845', emoji: '🌙' },
  caution: { color: '#E05252', bg: '#E0525218', border: '#E0525245', emoji: '⚡' },
}
