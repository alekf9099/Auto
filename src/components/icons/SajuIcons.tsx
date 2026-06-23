import { useId } from 'react'

interface P { size?: number; className?: string }

// 정통사주 — 전통 나경(羅經) 방위 만다라 + 태극 소용돌이
export function IcSaju({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* 4방 다이아몬드 */}
      <path d="M12 1.5 L13.3 4.3 L12 5.6 L10.7 4.3 Z" fill="currentColor"/>
      <path d="M22.5 12 L19.7 13.3 L18.4 12 L19.7 10.7 Z" fill="currentColor"/>
      <path d="M12 22.5 L10.7 19.7 L12 18.4 L13.3 19.7 Z" fill="currentColor"/>
      <path d="M1.5 12 L4.3 10.7 L5.6 12 L4.3 13.3 Z" fill="currentColor"/>
      {/* 4간 꽃잎 */}
      <path d="M18.7 5.3 L17.1 7.9 L15.6 6.9 Z" fill="currentColor" opacity="0.7"/>
      <path d="M18.7 18.7 L16.1 17.1 L17.1 15.6 Z" fill="currentColor" opacity="0.7"/>
      <path d="M5.3 18.7 L6.9 16.1 L8.4 17.1 Z" fill="currentColor" opacity="0.7"/>
      <path d="M5.3 5.3 L7.9 6.9 L6.9 8.4 Z" fill="currentColor" opacity="0.7"/>
      {/* 중심 원 */}
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.4"/>
      {/* 태극 소용돌이 */}
      <path d="M12 8.4 C13.9 8.4 15 9.7 15 11.5 C15 12 14.8 12.4 14.6 12.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <path d="M12 15.6 C10.1 15.6 9 14.3 9 12.5 C9 12 9.2 11.6 9.4 11.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <circle cx="12" cy="9.6" r="0.9" fill="currentColor"/>
      <circle cx="12" cy="14.4" r="0.9" fill="currentColor"/>
    </svg>
  )
}

// 신년운세 — 팔방(八方)으로 퍼지는 태양
export function IcSinnyeon({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="12" r="4.2"/>
      {/* 8 rays */}
      <rect x="11.1" y="1.5" width="1.8" height="4" rx="0.9"/>
      <rect x="11.1" y="18.5" width="1.8" height="4" rx="0.9"/>
      <rect x="1.5" y="11.1" width="4" height="1.8" rx="0.9"/>
      <rect x="18.5" y="11.1" width="4" height="1.8" rx="0.9"/>
      <rect x="4.1" y="4.1" width="1.8" height="4" rx="0.9" transform="rotate(-45 5 6.1)"/>
      <rect x="18.1" y="4.1" width="1.8" height="4" rx="0.9" transform="rotate(45 19 6.1)"/>
      <rect x="4.1" y="15.9" width="1.8" height="4" rx="0.9" transform="rotate(45 5 17.9)"/>
      <rect x="18.1" y="15.9" width="1.8" height="4" rx="0.9" transform="rotate(-45 19 17.9)"/>
    </svg>
  )
}

// 토정비결 — 두루마리 고서(古書)
export function IcTojeong({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Scroll body */}
      <rect x="4" y="5" width="16" height="14" rx="1.5" fill="currentColor" opacity="0.15"/>
      <rect x="4" y="5" width="16" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
      {/* Top rolled edge */}
      <path d="M4 7 C4 5.3 5.8 4 8 4 L16 4 C18.2 4 20 5.3 20 7" fill="currentColor" opacity="0.35"/>
      <path d="M4 7 C4 5.3 5.8 4 8 4 L16 4 C18.2 4 20 5.3 20 7" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      {/* Bottom rolled edge */}
      <path d="M4 17 C4 18.7 5.8 20 8 20 L16 20 C18.2 20 20 18.7 20 17" fill="currentColor" opacity="0.35"/>
      <path d="M4 17 C4 18.7 5.8 20 8 20 L16 20 C18.2 20 20 18.7 20 17" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      {/* Text lines */}
      <line x1="7.5" y1="9.5" x2="16.5" y2="9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.7"/>
      <line x1="7.5" y1="12" x2="16.5" y2="12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.7"/>
      <line x1="7.5" y1="14.5" x2="12.5" y2="14.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
    </svg>
  )
}

// 오늘의 운세 — 정교한 8선 태양 만다라
export function IcTodayFortune({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
        <path key={a} d="M12 1.6 L12.9 5.4 L12 6.4 L11.1 5.4 Z" transform={`rotate(${a} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="3.3" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="1.1"/>
    </svg>
  )
}

// 내일의 운세 — 초승달과 별
export function IcTomorrowFortune({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      {/* Moon crescent via clip */}
      <path d="M18 12.5 C18 17.2 14.4 21 10 21 C6.7 21 3.9 18.9 2.7 16 C4 16.6 5.5 17 7 17 C12.5 17 17 12.5 17 7 C17 5.5 16.6 4 16 2.7 C18.9 3.9 21 6.7 21 10 C21 10.9 20.9 11.7 20.7 12.5 Z" opacity="0.9"/>
      {/* Stars */}
      <circle cx="19" cy="5" r="1.2"/>
      <circle cx="22" cy="9" r="0.9" opacity="0.7"/>
      <circle cx="16" cy="2" r="0.8" opacity="0.6"/>
    </svg>
  )
}

// 대운 분석 — 톱니 톱니바퀴 (10년 단위로 맞물려 돌아가는 운의 흐름)
export function IcDaun({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      {Array.from({ length: 12 }).map((_, i) => (
        <path key={i} d="M12 1.5 L12.6 3.6 L11.4 3.6 Z" transform={`rotate(${i * 30} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.3" opacity="0.85"/>
      <circle cx="12" cy="12" r="4.3" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.5"/>
      <path d="M12 9.3 L13.2 12 L12 14.7 L10.8 12 Z" opacity="0.9"/>
    </svg>
  )
}

// 궁합 — 꽃잎 테두리 나경 인장 (두 사람의 균형과 조화)
export function IcGunghab({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <g stroke="currentColor" strokeWidth="1.3" opacity="0.8">
        {Array.from({ length: 8 }).map((_, i) => (
          <circle key={i} cx="12" cy="4.3" r="3.2" transform={`rotate(${i * 45} 12 12)`} />
        ))}
      </g>
      <circle cx="12" cy="12" r="5.2" stroke="currentColor" strokeWidth="1.4"/>
      <line x1="12" y1="7.3" x2="12" y2="16.7" stroke="currentColor" strokeWidth="1.2" opacity="0.7"/>
      <line x1="7.3" y1="12" x2="16.7" y2="12" stroke="currentColor" strokeWidth="1.2" opacity="0.7"/>
      <circle cx="12" cy="12" r="1.1" fill="currentColor"/>
    </svg>
  )
}

// 심층 해석 — 통찰의 눈 (원에서 뻗어나가는 혜안)
export function IcDeepSaju({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="11" cy="13" r="7" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M15.5 7.5 C17 6 18.8 5.3 20.3 5.8 C20.8 7.3 20.1 9.1 18.6 10.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <circle cx="15.7" cy="9.3" r="1.3" fill="currentColor"/>
      <circle cx="11" cy="13" r="1.6" fill="currentColor" opacity="0.75"/>
    </svg>
  )
}

// 포인트 코인 — 전통 엽전(상평통보)
export function IcGem({ size = 24, className = '' }: P) {
  const maskId = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white"/>
          <rect x="9.3" y="9.3" width="5.4" height="5.4" fill="black"/>
        </mask>
      </defs>
      {/* 동전 몸체 (가운데 네모 구멍) */}
      <circle cx="12" cy="12" r="10" fill="currentColor" mask={`url(#${maskId})`}/>
      {/* 테두리 */}
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.55"/>
      <rect x="9.3" y="9.3" width="5.4" height="5.4" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.6"/>
      {/* 광택 하이라이트 */}
      <path d="M5.5 7.2 C7 5 9.3 3.8 12 3.6" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.4"/>
    </svg>
  )
}

// 출석 도장 — 전통 인장(印章)
export function IcStamp({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="6.5" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      <text
        x="12" y="16"
        textAnchor="middle"
        fontSize="8"
        fontWeight="bold"
        fill="currentColor"
        fontFamily="'Gowun Batang', serif"
      >印</text>
    </svg>
  )
}

// 꿈해몽 — 초승달과 별빛 (밤의 계시)
export function IcDream({ size = 24, className = '' }: P) {
  const maskId = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white"/>
          <circle cx="12.5" cy="7.5" r="7" fill="black"/>
        </mask>
      </defs>
      <circle cx="9.5" cy="10.5" r="7.5" fill="currentColor" mask={`url(#${maskId})`}/>
      <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <line x1="18.5" y1="4" x2="18.5" y2="9.5"/>
        <line x1="16.1" y1="5.3" x2="20.9" y2="8.2"/>
        <line x1="16.1" y1="8.2" x2="20.9" y2="5.3"/>
      </g>
    </svg>
  )
}

// 오늘의 코디 — 3단 옷장 (오늘의 스타일을 고르는 장)
export function IcOutfit({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* 윗면 (입체감) */}
      <path d="M4.5 6.5 L6 5 L18 5 L19.5 6.5 Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12"/>
      {/* 몸체 */}
      <rect x="4.5" y="6.5" width="15" height="14" rx="0.8" stroke="currentColor" strokeWidth="1.5"/>
      {/* 칸막이 */}
      <line x1="9.5" y1="6.5" x2="9.5" y2="20.5" stroke="currentColor" strokeWidth="1.2" opacity="0.6"/>
      <line x1="14.5" y1="6.5" x2="14.5" y2="20.5" stroke="currentColor" strokeWidth="1.2" opacity="0.6"/>
      {/* 손잡이 */}
      <circle cx="7.3" cy="13.5" r="0.6" fill="currentColor"/>
      <circle cx="16.7" cy="13.5" r="0.6" fill="currentColor"/>
      {/* 중앙 아치 장식 */}
      <path d="M11 16 C11 14.3 11.9 13 12 13 C12.1 13 13 14.3 13 16" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.75"/>
    </svg>
  )
}

// 취업운 — 금테 인장 (커리어를 보증하는 직인)
export function IcJob({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 5 L19 5 L19 19 L5 19 Z" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5 5 L8.3 8.3 L15.7 8.3 L19 5 M5 19 L8.3 15.7 L15.7 15.7 L19 19" stroke="currentColor" strokeWidth="1.2" opacity="0.7" fill="none"/>
      <rect x="8.3" y="8.3" width="7.4" height="7.4" stroke="currentColor" strokeWidth="1.3" opacity="0.85"/>
      <g fill="currentColor">
        {[0, 45, 90, 135].map(a => (
          <rect key={a} x="11.4" y="9.6" width="1.2" height="2.6" rx="0.5" transform={`rotate(${a} 12 12)`} />
        ))}
      </g>
      <circle cx="12" cy="12" r="1.6" fill="currentColor"/>
    </svg>
  )
}

// 행운의 숫자 잡기 — 스톱워치 아이콘
export function IcLucky({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Top button */}
      <line x1="12" y1="2" x2="12" y2="4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="9.5" y1="2" x2="14.5" y2="2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      {/* Body */}
      <circle cx="12" cy="13" r="9" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.6"/>
      {/* Hands pointing to 7 */}
      <line x1="12" y1="13" x2="12" y2="8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="12" y1="13" x2="9.5" y2="16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="12" cy="13" r="1.2" fill="currentColor"/>
    </svg>
  )
}

// 오행 룰렛 — 8방위 컴퍼스 별 (캔바 코인 메달 시안 재현)
export function IcRoulette({ size = 24, className = '' }: P) {
  const leftHalf = 'M12 2.2 L10.6 12 L12 12 Z'
  const rightHalf = 'M12 2.2 L13.4 12 L12 12 Z'
  const angles = [0, 45, 90, 135, 180, 225, 270, 315]
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {angles.map(a => (
        <g key={a} transform={`rotate(${a} 12 12)`}>
          <path d={leftHalf} fill="currentColor" opacity="0.9" />
          <path d={rightHalf} fill="currentColor" opacity="0.55" />
        </g>
      ))}
      <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    </svg>
  )
}

// 친구 초대 선물 — 리본 상자 (캔바 코인 메달 시안 재현)
export function IcGift({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 8.6 C10.4 4.8 6.6 4 5.2 5.4 C4 6.6 4.9 8.8 8 8.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="currentColor" fillOpacity="0.18"/>
      <path d="M12 8.6 C13.6 4.8 17.4 4 18.8 5.4 C20 6.6 19.1 8.8 16 8.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="currentColor" fillOpacity="0.18"/>
      <rect x="4.6" y="9.4" width="14.8" height="10.4" rx="0.7" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="12" y1="9.4" x2="12" y2="19.8" stroke="currentColor" strokeWidth="1.4" opacity="0.7"/>
    </svg>
  )
}

// 홈 — 지붕과 문이 있는 집
export function IcHome({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.5 L21 10 V20 a1 1 0 0 1-1 1 H15 V14 H9 V21 H4 a1 1 0 0 1-1-1 V10 Z"/>
    </svg>
  )
}

// 운세대결 — 리본 문장(紋章) (승부를 가르는 명예의 표식)
export function IcBattle({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M9 4.3 C9.8 3.2 11 3.2 12 4.2 C13 3.2 14.2 3.2 15 4.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <circle cx="12" cy="4.5" r="0.8" fill="currentColor"/>
      <path d="M6 5.3 L9 4.6 L12 5.8 L15 4.6 L18 5.3 C18 10.8 16.5 15.8 12 19.3 C7.5 15.8 6 10.8 6 5.3 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/>
      <path d="M12 8.4 L12.9 11 L15.7 11 L13.4 12.6 L14.3 15.2 L12 13.6 L9.7 15.2 L10.6 12.6 L8.3 11 L11.1 11 Z" fill="currentColor" opacity="0.85"/>
    </svg>
  )
}

// 사용자 프로필 — 전통 조각 문양
export function IcProfile({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20 C4 16 7.6 13 12 13 C16.4 13 20 16 20 20 Z" opacity="0.85"/>
    </svg>
  )
}

// 승리 — 왕관 (대결 우승자 표시)
export function IcCrown({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4 9 L7.2 16 H16.8 L20 9 L15.2 12.2 L12 6 L8.8 12.2 Z"/>
      <rect x="6.5" y="16" width="11" height="2.3" rx="1"/>
      <circle cx="4" cy="7.7" r="1.4"/>
      <circle cx="12" cy="4.8" r="1.4"/>
      <circle cx="20" cy="7.7" r="1.4"/>
    </svg>
  )
}

// 무승부 — 동그라미 안의 等호(=)
export function IcDraw({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.6" opacity="0.5"/>
      <line x1="7" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="7" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

// 사주매칭 — 맞물린 두 삼각 (서로의 인연이 교차하는 육각 인장)
export function IcMatch({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.3" opacity="0.45"/>
      <path d="M12 5 L17.5 14.5 L6.5 14.5 Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M12 19 L6.5 9.5 L17.5 9.5 Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="1.3" fill="currentColor"/>
    </svg>
  )
}

// 공유하기 — 박스에서 위로 나가는 화살표
export function IcShare({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2.5 V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M8 6.5 L12 2.5 L16 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M5 12 V19 a1.5 1.5 0 0 0 1.5 1.5 H17.5 A1.5 1.5 0 0 0 19 19 V12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}

// 타로 — 부채꼴로 펼쳐진 세 장의 카드
export function IcTarot({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <g transform="translate(12 14)">
        <rect x="-9" y="-8" width="7" height="11" rx="1.2" transform="rotate(-18)" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="-3.5" y="-9.5" width="7" height="11" rx="1.2" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="2" y="-8" width="7" height="11" rx="1.2" transform="rotate(18)" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.3"/>
        <circle cx="0" cy="-4.2" r="1.6" fill="currentColor"/>
      </g>
    </svg>
  )
}

// 총운 — 신비로운 천리안 (하루 전체를 꿰뚫어보는 혜안)
export function IcGeneralLuck({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M2.5 12 C6.5 5.3 17.5 5.3 21.5 12 C17.5 18.7 6.5 18.7 2.5 12 Z" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="12" cy="12" r="1.3" fill="currentColor"/>
      <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.75">
        <line x1="12" y1="3.2" x2="12" y2="5.4"/>
        <line x1="5.2" y1="6.2" x2="6.7" y2="7.7"/>
        <line x1="18.8" y1="6.2" x2="17.3" y2="7.7"/>
      </g>
    </svg>
  )
}

// 재물운 — 전통 금괴 (재물이 쌓이는 황금 덩이)
export function IcWealthLuck({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5.5 16.5 L7.5 9.5 a2 2 0 0 1 1.9-1.5 h5.2 a2 2 0 0 1 1.9 1.5 l2 7 a1.6 1.6 0 0 1-1.5 2 h-10.4 a1.6 1.6 0 0 1-1.5-2 Z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M9.2 9 L8 13.5 h8 l-1.2-4.5" stroke="currentColor" strokeWidth="1.1" opacity="0.6" fill="none"/>
      <path d="M5.3 4.8 l0.5 1.2 l1.2 0.5 l-1.2 0.5 l-0.5 1.2 l-0.5-1.2 l-1.2-0.5 l1.2-0.5 Z" fill="currentColor" opacity="0.6"/>
      <path d="M18.2 3.6 l0.4 0.9 l0.9 0.4 l-0.9 0.4 l-0.4 0.9 l-0.4-0.9 l-0.9-0.4 l0.9-0.4 Z" fill="currentColor" opacity="0.5"/>
    </svg>
  )
}

// 애정운 — 우아한 하트 (마음에 피어나는 사랑의 기운)
export function IcLoveLuck({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 19.5 C7.5 16 3.5 12.8 3.5 8.8 C3.5 6.1 5.6 4 8.2 4 C9.9 4 11.2 4.9 12 6.2 C12.8 4.9 14.1 4 15.8 4 C18.4 4 20.5 6.1 20.5 8.8 C20.5 12.8 16.5 16 12 19.5 Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M7 8.3 C7.3 7 8.4 6.1 9.7 6.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" fill="none"/>
    </svg>
  )
}

// 건강운 — 연꽃 (정화와 활력이 피어나는 세 잎)
export function IcHealthLuck({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 19 C12 19 6.5 16.4 6.5 11.5 C6.5 9.6 8 8 9.9 8 C10.7 8 11.4 8.3 12 8.8 C12.6 8.3 13.3 8 14.1 8 C16 8 17.5 9.6 17.5 11.5 C17.5 16.4 12 19 12 19 Z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M12 19 C12 19 9 13.6 9 9.3 C9 7.3 10.3 5.7 12 5.7 C13.7 5.7 15 7.3 15 9.3 C15 13.6 12 19 12 19 Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <line x1="12" y1="19" x2="12" y2="21.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.6"/>
    </svg>
  )
}

// 직장운 — 가죽 서류 가방 (커리어와 성취를 담는 가방)
export function IcCareerLuck({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M9 7.5 V6 a2 2 0 0 1 2-2 h2 a2 2 0 0 1 2 2 v1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <rect x="3.5" y="7.5" width="17" height="12" rx="1.6" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="3.5" y1="12.5" x2="20.5" y2="12.5" stroke="currentColor" strokeWidth="1.3" opacity="0.7"/>
      <rect x="10.6" y="11.3" width="2.8" height="2.4" rx="0.5" fill="currentColor"/>
    </svg>
  )
}

// 오전 — 수평선 위로 떠오르는 아침 해
export function IcMorning({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5.5 16 a6.5 6.5 0 0 1 13 0 Z" fill="currentColor" fillOpacity="0.85" stroke="currentColor" strokeWidth="1.4"/>
      <line x1="2" y1="16" x2="22" y2="16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.8">
        <line x1="12" y1="3.5" x2="12" y2="6"/>
        <line x1="5.5" y1="6.5" x2="7.2" y2="8.2"/>
        <line x1="18.5" y1="6.5" x2="16.8" y2="8.2"/>
      </g>
    </svg>
  )
}

// 오후 — 하늘 높이 떠 있는 한낮의 해
export function IcAfternoon({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.85" stroke="currentColor" strokeWidth="1.3"/>
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
          <line key={a} x1="12" y1="2.3" x2="12" y2="4.3" transform={`rotate(${a} 12 12)`} />
        ))}
      </g>
    </svg>
  )
}

// 저녁 — 수평선 너머로 저무는 노을
export function IcEvening({ size = 24, className = '' }: P) {
  const maskId = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white"/>
          <rect x="2" y="16" width="20" height="6" fill="black"/>
        </mask>
      </defs>
      <circle cx="12" cy="16" r="6" fill="currentColor" opacity="0.85" mask={`url(#${maskId})`}/>
      <line x1="2" y1="16" x2="22" y2="16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.7">
        <line x1="6" y1="11.5" x2="6" y2="13.3"/>
        <line x1="18" y1="11.5" x2="18" y2="13.3"/>
      </g>
      <circle cx="19.5" cy="5.5" r="0.9" fill="currentColor" opacity="0.6"/>
    </svg>
  )
}

// 행운 아이템 — 네잎클로버 (작은 행운이 깃든 잎)
export function IcCloverLucky({ size = 24, className = '' }: P) {
  const lobe = 'M12 12 C12 8.5 9.5 6 6.7 6 C4.5 6 3 7.7 3 9.7 C3 11.8 5 12.6 6.8 12.6 C8.8 12.6 12 12 12 12 Z'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      {[0, 90, 180, 270].map(a => (
        <path key={a} d={lobe} transform={`rotate(${a} 12 12)`} opacity={a % 180 === 0 ? 0.95 : 0.75} />
      ))}
      <line x1="12" y1="12" x2="12" y2="20.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
    </svg>
  )
}
