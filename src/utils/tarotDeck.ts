export interface TarotCard {
  id: number
  name: string
  nameEn: string
  symbol: string
  slug: string
}

// 메이저 아르카나 22장
export const TAROT_DECK: TarotCard[] = [
  { id: 0,  name: '광대',           nameEn: 'The Fool',           symbol: '🃏', slug: 'the-fool' },
  { id: 1,  name: '마법사',         nameEn: 'The Magician',       symbol: '🪄', slug: 'the-magician' },
  { id: 2,  name: '여사제',         nameEn: 'The High Priestess', symbol: '🌙', slug: 'the-high-priestess' },
  { id: 3,  name: '여제',           nameEn: 'The Empress',        symbol: '👑', slug: 'the-empress' },
  { id: 4,  name: '황제',           nameEn: 'The Emperor',        symbol: '⚔️', slug: 'the-emperor' },
  { id: 5,  name: '교황',           nameEn: 'The Hierophant',     symbol: '🔔', slug: 'the-hierophant' },
  { id: 6,  name: '연인',           nameEn: 'The Lovers',         symbol: '💞', slug: 'the-lovers' },
  { id: 7,  name: '전차',           nameEn: 'The Chariot',        symbol: '🏆', slug: 'the-chariot' },
  { id: 8,  name: '힘',             nameEn: 'Strength',           symbol: '🦁', slug: 'strength' },
  { id: 9,  name: '은둔자',         nameEn: 'The Hermit',         symbol: '🏮', slug: 'the-hermit' },
  { id: 10, name: '운명의 수레바퀴', nameEn: 'Wheel of Fortune',   symbol: '🎡', slug: 'wheel-of-fortune' },
  { id: 11, name: '정의',           nameEn: 'Justice',            symbol: '⚖️', slug: 'justice' },
  { id: 12, name: '매달린 사람',     nameEn: 'The Hanged Man',     symbol: '🙃', slug: 'the-hanged-man' },
  { id: 13, name: '죽음',           nameEn: 'Death',              symbol: '💀', slug: 'death' },
  { id: 14, name: '절제',           nameEn: 'Temperance',         symbol: '🍷', slug: 'temperance' },
  { id: 15, name: '악마',           nameEn: 'The Devil',          symbol: '😈', slug: 'the-devil' },
  { id: 16, name: '탑',             nameEn: 'The Tower',          symbol: '🗼', slug: 'the-tower' },
  { id: 17, name: '별',             nameEn: 'The Star',           symbol: '⭐', slug: 'the-star' },
  { id: 18, name: '달',             nameEn: 'The Moon',           symbol: '🌕', slug: 'the-moon' },
  { id: 19, name: '태양',           nameEn: 'The Sun',            symbol: '☀️', slug: 'the-sun' },
  { id: 20, name: '심판',           nameEn: 'Judgement',          symbol: '📯', slug: 'judgement' },
  { id: 21, name: '세계',           nameEn: 'The World',          symbol: '🌍', slug: 'the-world' },
]

export interface DrawnCard extends TarotCard {
  reversed: boolean
}

// 덱 전체를 무작위 순서로 섞고, 카드마다 정/역방향을 결정한다
export function shuffleDeck(): DrawnCard[] {
  const pool = [...TAROT_DECK]
  const result: DrawnCard[] = []
  while (pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length)
    const [card] = pool.splice(idx, 1)
    result.push({ ...card, reversed: Math.random() < 0.5 })
  }
  return result
}

export function cardImageSrc(slug: string) {
  return `/images/tarot/cards/${slug}.webp`
}
