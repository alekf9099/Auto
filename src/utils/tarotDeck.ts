export interface TarotCard {
  id: number
  name: string
  nameEn: string
  symbol: string
}

// 메이저 아르카나 22장
export const TAROT_DECK: TarotCard[] = [
  { id: 0,  name: '광대',           nameEn: 'The Fool',           symbol: '🃏' },
  { id: 1,  name: '마법사',         nameEn: 'The Magician',       symbol: '🪄' },
  { id: 2,  name: '여사제',         nameEn: 'The High Priestess', symbol: '🌙' },
  { id: 3,  name: '여제',           nameEn: 'The Empress',        symbol: '👑' },
  { id: 4,  name: '황제',           nameEn: 'The Emperor',        symbol: '⚔️' },
  { id: 5,  name: '교황',           nameEn: 'The Hierophant',     symbol: '🔔' },
  { id: 6,  name: '연인',           nameEn: 'The Lovers',         symbol: '💞' },
  { id: 7,  name: '전차',           nameEn: 'The Chariot',        symbol: '🏆' },
  { id: 8,  name: '힘',             nameEn: 'Strength',           symbol: '🦁' },
  { id: 9,  name: '은둔자',         nameEn: 'The Hermit',         symbol: '🏮' },
  { id: 10, name: '운명의 수레바퀴', nameEn: 'Wheel of Fortune',   symbol: '🎡' },
  { id: 11, name: '정의',           nameEn: 'Justice',            symbol: '⚖️' },
  { id: 12, name: '매달린 사람',     nameEn: 'The Hanged Man',     symbol: '🙃' },
  { id: 13, name: '죽음',           nameEn: 'Death',              symbol: '💀' },
  { id: 14, name: '절제',           nameEn: 'Temperance',         symbol: '🍷' },
  { id: 15, name: '악마',           nameEn: 'The Devil',          symbol: '😈' },
  { id: 16, name: '탑',             nameEn: 'The Tower',          symbol: '🗼' },
  { id: 17, name: '별',             nameEn: 'The Star',           symbol: '⭐' },
  { id: 18, name: '달',             nameEn: 'The Moon',           symbol: '🌕' },
  { id: 19, name: '태양',           nameEn: 'The Sun',            symbol: '☀️' },
  { id: 20, name: '심판',           nameEn: 'Judgement',          symbol: '📯' },
  { id: 21, name: '세계',           nameEn: 'The World',          symbol: '🌍' },
]

export interface DrawnCard extends TarotCard {
  reversed: boolean
}

// 중복 없이 count장을 무작위로 뽑고, 카드마다 정/역방향을 결정한다
export function drawTarotCards(count: number): DrawnCard[] {
  const pool = [...TAROT_DECK]
  const result: DrawnCard[] = []
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length)
    const [card] = pool.splice(idx, 1)
    result.push({ ...card, reversed: Math.random() < 0.5 })
  }
  return result
}
