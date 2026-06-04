import type { StemInfo, BranchInfo } from '../types'

export const STEMS: StemInfo[] = [
  { ko: '갑', hanja: '甲', element: 'wood',  yinYang: 'yang' },
  { ko: '을', hanja: '乙', element: 'wood',  yinYang: 'yin'  },
  { ko: '병', hanja: '丙', element: 'fire',  yinYang: 'yang' },
  { ko: '정', hanja: '丁', element: 'fire',  yinYang: 'yin'  },
  { ko: '무', hanja: '戊', element: 'earth', yinYang: 'yang' },
  { ko: '기', hanja: '己', element: 'earth', yinYang: 'yin'  },
  { ko: '경', hanja: '庚', element: 'metal', yinYang: 'yang' },
  { ko: '신', hanja: '辛', element: 'metal', yinYang: 'yin'  },
  { ko: '임', hanja: '壬', element: 'water', yinYang: 'yang' },
  { ko: '계', hanja: '癸', element: 'water', yinYang: 'yin'  },
]

export const BRANCHES: BranchInfo[] = [
  { ko: '자', hanja: '子', element: 'water', yinYang: 'yang', animal: '쥐',    hour: '23~01시' },
  { ko: '축', hanja: '丑', element: 'earth', yinYang: 'yin',  animal: '소',    hour: '01~03시' },
  { ko: '인', hanja: '寅', element: 'wood',  yinYang: 'yang', animal: '호랑이',hour: '03~05시' },
  { ko: '묘', hanja: '卯', element: 'wood',  yinYang: 'yin',  animal: '토끼',  hour: '05~07시' },
  { ko: '진', hanja: '辰', element: 'earth', yinYang: 'yang', animal: '용',    hour: '07~09시' },
  { ko: '사', hanja: '巳', element: 'fire',  yinYang: 'yin',  animal: '뱀',    hour: '09~11시' },
  { ko: '오', hanja: '午', element: 'fire',  yinYang: 'yang', animal: '말',    hour: '11~13시' },
  { ko: '미', hanja: '未', element: 'earth', yinYang: 'yin',  animal: '양',    hour: '13~15시' },
  { ko: '신', hanja: '申', element: 'metal', yinYang: 'yang', animal: '원숭이',hour: '15~17시' },
  { ko: '유', hanja: '酉', element: 'metal', yinYang: 'yin',  animal: '닭',    hour: '17~19시' },
  { ko: '술', hanja: '戌', element: 'earth', yinYang: 'yang', animal: '개',    hour: '19~21시' },
  { ko: '해', hanja: '亥', element: 'water', yinYang: 'yin',  animal: '돼지',  hour: '21~23시' },
]

export const ELEMENT_LABELS: Record<string, string> = {
  wood:  '목(木)',
  fire:  '화(火)',
  earth: '토(土)',
  metal: '금(金)',
  water: '수(水)',
}

export const ELEMENT_COLORS: Record<string, string> = {
  wood:  '#4CAF50',
  fire:  '#F44336',
  earth: '#FF9800',
  metal: '#78909C',
  water: '#2196F3',
}

export const ELEMENT_BG: Record<string, string> = {
  wood:  'bg-wood/10 border-wood/40 text-wood-dark',
  fire:  'bg-fire/10 border-fire/40 text-fire-dark',
  earth: 'bg-earth/10 border-earth/40 text-earth-dark',
  metal: 'bg-metal/10 border-metal/40 text-metal-dark',
  water: 'bg-water/10 border-water/40 text-water-dark',
}

export const SIPSIN_DESC: Record<string, { ko: string; meaning: string }> = {
  비견: { ko: '比肩', meaning: '형제·동료·경쟁' },
  겁재: { ko: '劫財', meaning: '형제·투쟁·손재' },
  식신: { ko: '食神', meaning: '표현·재능·식복' },
  상관: { ko: '傷官', meaning: '재주·반항·예술' },
  편재: { ko: '偏財', meaning: '편부·투자·재물' },
  정재: { ko: '正財', meaning: '정직·안정·재물' },
  편관: { ko: '偏官', meaning: '권위·압박·칠살' },
  정관: { ko: '正官', meaning: '명예·규율·관직' },
  편인: { ko: '偏印', meaning: '재능·편모·고독' },
  정인: { ko: '正印', meaning: '학문·어머니·인자' },
}

export const ILJU_MEANING: Record<number, string> = {
  0:  '리더십이 강하고 진취적인 성격으로, 새로운 것을 시작하는 데 탁월한 능력을 보입니다.',
  1:  '부드러우면서도 끈기 있는 성격으로, 예술적 감각과 섬세한 배려가 돋보입니다.',
  2:  '열정적이고 사교적인 성격으로, 표현력이 뛰어나고 활발한 대인관계를 맺습니다.',
  3:  '온화하고 직관력이 뛰어난 성격으로, 신뢰를 주는 인상과 깊은 내면을 지닙니다.',
  4:  '신중하고 포용력이 넓은 성격으로, 중재자 역할에 뛰어나고 안정을 추구합니다.',
  5:  '실용적이고 꼼꼼한 성격으로, 성실함과 책임감으로 주변의 신뢰를 얻습니다.',
  6:  '의지가 강하고 결단력 있는 성격으로, 목표를 향해 거침없이 나아갑니다.',
  7:  '날카로운 통찰력과 완벽주의 성향으로, 높은 미적 감각과 고결함을 추구합니다.',
  8:  '지혜롭고 포용력이 큰 성격으로, 창의적 아이디어와 넓은 시야를 지닙니다.',
  9:  '섬세하고 감수성이 풍부한 성격으로, 깊은 사려와 영적 직관력을 갖추고 있습니다.',
}
