export type Element5 = '목' | '화' | '토' | '금' | '수'

export interface ColorSwatch {
  hex: string
  name: string
  main?: boolean
}

export interface OutfitRecommendation {
  element: Element5
  elementChi: string
  elementEmoji: string
  mood: string
  mainColors: ColorSwatch[]
  avoidColors: ColorSwatch[]
  items: {
    top: string[]
    bottom: string[]
    outer: string[]
    shoes: string[]
    accessories: string[]
  }
  keywords: string[]
  tip: string
}

const STEM_ELEMENT: Element5[] = ['목','목','화','화','토','토','금','금','수','수']

export function getElement(stemIndex: number): Element5 {
  return STEM_ELEMENT[((stemIndex % 10) + 10) % 10]
}

export const OUTFIT_DATA: Record<Element5, OutfitRecommendation> = {
  목: {
    element: '목',
    elementChi: '木',
    elementEmoji: '🌿',
    mood: '자연 속 여유로운 보타닉 무드',
    mainColors: [
      { hex: '#4A7C59', name: '포레스트 그린', main: true },
      { hex: '#8DB87A', name: '세이지 그린' },
      { hex: '#A5C895', name: '모스 그린' },
      { hex: '#D4E8C2', name: '민트 아이보리' },
      { hex: '#795548', name: '어스 브라운' },
    ],
    avoidColors: [
      { hex: '#E53935', name: '레드' },
      { hex: '#FF8F00', name: '오렌지' },
    ],
    items: {
      top:         ['린넨 셔츠', '오버핏 니트', '스트라이프 반팔', '그린 롱슬리브'],
      bottom:      ['와이드 치노 팬츠', '카고 팬츠', '플리츠 스커트', '베이지 면바지'],
      outer:       ['트렌치코트', '오버사이즈 재킷', '리넨 블레이저'],
      shoes:       ['캔버스 스니커즈', '로퍼', '샌들', '첼시 부츠'],
      accessories: ['우드 팔찌', '에코백', '그린 스카프', '레이어드 체인'],
    },
    keywords: ['내추럴', '에코', '보타닉', '캐주얼', '그린 무드', '오가닉'],
    tip: '린넨·면·대나무 등 자연 소재를 활용하면 木 기운이 더욱 살아납니다.',
  },
  화: {
    element: '화',
    elementChi: '火',
    elementEmoji: '🔥',
    mood: '열정적이고 화려한 비비드 룩',
    mainColors: [
      { hex: '#C62828', name: '딥 레드', main: true },
      { hex: '#E57373', name: '코럴 레드' },
      { hex: '#FF8F00', name: '앰버 오렌지' },
      { hex: '#FFD54F', name: '선샤인 옐로우' },
      { hex: '#FF6F00', name: '버닝 오렌지' },
    ],
    avoidColors: [
      { hex: '#1565C0', name: '다크 블루' },
      { hex: '#212121', name: '블랙' },
    ],
    items: {
      top:         ['레드 블라우스', '화려한 프린트 셔츠', '오프숄더 탑', '비비드 니트'],
      bottom:      ['미니스커트', '슬림핏 팬츠', '레드 와이드팬츠', '패턴 스커트'],
      outer:       ['볼레로', '크롭 재킷', '플리스 재킷', '체크 코트'],
      shoes:       ['힐', '앵클 부츠', '레드 스니커즈', '메리제인'],
      accessories: ['골드 귀걸이', '레이어드 목걸이', '레드 백', '컬러 스카프'],
    },
    keywords: ['비비드', '컬러풀', '볼드', '패셔너블', '포인트 룩', '글램'],
    tip: '레드나 오렌지를 포인트 하나로 쓰고 나머지는 베이직하게 매치하세요.',
  },
  토: {
    element: '토',
    elementChi: '土',
    elementEmoji: '🌾',
    mood: '안정적이고 클래식한 어스 톤',
    mainColors: [
      { hex: '#8D6E63', name: '어스 브라운', main: true },
      { hex: '#BCAAA4', name: '로즈 베이지' },
      { hex: '#D7CCC8', name: '카페 라떼' },
      { hex: '#EFEBE9', name: '크림 베이지' },
      { hex: '#FFF8E1', name: '아이보리' },
    ],
    avoidColors: [
      { hex: '#1A237E', name: '인디고' },
      { hex: '#4A148C', name: '딥 퍼플' },
    ],
    items: {
      top:         ['베이지 니트', '터틀넥 스웨터', '크림 블라우스', '카키 셔츠'],
      bottom:      ['슬랙스', '테이퍼드 팬츠', '미디 스커트', '코듀로이 팬츠'],
      outer:       ['캐멀 코트', '울 블레이저', '더블 브레스티드 코트', '봄버 재킷'],
      shoes:       ['첼시 부츠', '태슬 로퍼', '옥스퍼드 슈즈', '브라운 스니커즈'],
      accessories: ['토트백', '가죽 벨트', '골드 브로치', '갈색 시계'],
    },
    keywords: ['클래식', '미니멀', '어스 톤', '타임리스', '세련', '내추럴 클래식'],
    tip: '베이지·카키·브라운 레이어드로 안정감 있는 룩을 완성하세요.',
  },
  금: {
    element: '금',
    elementChi: '金',
    elementEmoji: '✨',
    mood: '깔끔하고 샤프한 미니멀 무드',
    mainColors: [
      { hex: '#F5F5F5', name: '클린 화이트', main: true },
      { hex: '#BDBDBD', name: '실버 그레이' },
      { hex: '#9E9E9E', name: '미드 그레이' },
      { hex: '#616161', name: '차콜 그레이' },
      { hex: '#B0BEC5', name: '쿨 실버' },
    ],
    avoidColors: [
      { hex: '#BF360C', name: '번트 오렌지' },
      { hex: '#4E342E', name: '다크 브라운' },
    ],
    items: {
      top:         ['화이트 셔츠', '그레이 니트', '스트라이프 탑', '슬림 터틀넥'],
      bottom:      ['블랙 슬랙스', '화이트 팬츠', '그레이 스커트', '미니멀 진'],
      outer:       ['화이트 코트', '그레이 블레이저', '트렌치코트', '라이더 재킷'],
      shoes:       ['화이트 스니커즈', '슬리퍼 뮬', '포인티드 플랫', '실버 힐'],
      accessories: ['실버 귀걸이', '미니멀 백', '실버 체인', '시스루 선글라스'],
    },
    keywords: ['미니멀', '클린', '모노톤', '시크', '샤프', '현대적'],
    tip: '화이트·그레이 모노톤 조합에 실버 액세서리로 金 기운 포인트를 주세요.',
  },
  수: {
    element: '수',
    elementChi: '水',
    elementEmoji: '🌊',
    mood: '신비롭고 깊이 있는 딥 무드',
    mainColors: [
      { hex: '#1A237E', name: '딥 네이비', main: true },
      { hex: '#283593', name: '로열 블루' },
      { hex: '#37474F', name: '슬레이트 블루' },
      { hex: '#546E7A', name: '스틸 블루' },
      { hex: '#212121', name: '딥 블랙' },
    ],
    avoidColors: [
      { hex: '#F9A825', name: '골드 옐로우' },
      { hex: '#FF8F00', name: '오렌지' },
    ],
    items: {
      top:         ['네이비 니트', '다크 블루 셔츠', '블랙 터틀넥', '딥 컬러 블라우스'],
      bottom:      ['네이비 팬츠', '블랙 스커트', '다크 진', '슬레이트 슬랙스'],
      outer:       ['네이비 코트', '블랙 라이더 재킷', '다크 블레이저', '트렌치코트'],
      shoes:       ['블랙 부츠', '네이비 스니커즈', '첼시 부츠', '앵클 부츠'],
      accessories: ['실버·건메탈 주얼리', '다크 미니백', '블루 스카프', '선글라스'],
    },
    keywords: ['무드', '다크', '미스터리', '딥 컬러', '세련', '인텔리전트'],
    tip: '다크 컬러 조합에 실버 액세서리를 더하면 水 기운이 극대화됩니다.',
  },
}
