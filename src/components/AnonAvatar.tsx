import { ELEMENT_COLORS } from '../utils/constants'

// 익명 인연을 위한 오행 아바타.
// 사진이 있으면 사진을, 없으면 오행(木火土金水) 색 원 + 한자 글리프로 표시한다.
// 실제 오행(element)을 알면 그걸 쓰고, 모르면 seed(userId/닉네임)로 결정적으로 배정한다.

const ELEMENTS = ['wood', 'fire', 'earth', 'metal', 'water'] as const
const HANJA: Record<string, string> = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' }

function seedElement(seed: string): (typeof ELEMENTS)[number] {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return ELEMENTS[h % ELEMENTS.length]
}

interface Props {
  seed: string
  photo?: string | null
  element?: string | null   // 실제 오행을 알 때 (매칭 결과 등)
  size?: number
  className?: string
}

export default function AnonAvatar({ seed, photo, element, size = 32, className = '' }: Props) {
  if (photo) {
    return <img src={photo} alt="" className={`rounded-full object-cover shrink-0 ${className}`} style={{ width: size, height: size }} />
  }
  const el = element && ELEMENT_COLORS[element] ? element : seedElement(seed)
  const c = ELEMENT_COLORS[el]
  return (
    <span
      className={`rounded-full flex items-center justify-center shrink-0 font-bold ${className}`}
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, ${c}, ${c}AA)`,
        color: '#1A0E30',
        fontSize: Math.round(size * 0.44),
        boxShadow: `0 0 0 1px ${c}66 inset`,
      }}
    >
      {HANJA[el]}
    </span>
  )
}
