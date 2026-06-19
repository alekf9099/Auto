import { useId } from 'react'

interface P { size?: number; className?: string }

// 정통사주 — 사주팔자 천간(위)/지지(아래) 4쌍 그리드
export function IcSaju({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="1.5" y="3" width="4.5" height="5" rx="1" opacity="0.45"/>
      <rect x="7"   y="3" width="4.5" height="5" rx="1" opacity="0.45"/>
      <rect x="12.5" y="3" width="4.5" height="5" rx="1" opacity="0.7"/>
      <rect x="18"  y="3" width="4.5" height="5" rx="1" opacity="0.45"/>
      <rect x="1.5" y="9.5" width="4.5" height="11.5" rx="1"/>
      <rect x="7"   y="9.5" width="4.5" height="11.5" rx="1" opacity="0.75"/>
      <rect x="12.5" y="9.5" width="4.5" height="11.5" rx="1"/>
      <rect x="18"  y="9.5" width="4.5" height="11.5" rx="1" opacity="0.75"/>
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

// 오늘의 운세 — 수정구슬 (크리스탈 오브)
export function IcTodayFortune({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Orb */}
      <circle cx="12" cy="11" r="7.5" fill="currentColor" opacity="0.12"/>
      <circle cx="12" cy="11" r="7.5" stroke="currentColor" strokeWidth="1.6"/>
      {/* Inner glow ring */}
      <circle cx="12" cy="11" r="4.5" fill="currentColor" opacity="0.3"/>
      {/* Core */}
      <circle cx="12" cy="11" r="2" fill="currentColor"/>
      {/* Glint */}
      <path d="M8 7.5 C8.8 6.5 10 6 11 6.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.6"/>
      {/* Base */}
      <path d="M9 19.5 L15 19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M10 18.5 L14 18.5 L13.5 19.5 L10.5 19.5 Z" fill="currentColor" opacity="0.5"/>
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

// 대운 분석 — 흐르는 운세 물결 (10년 단위 노드)
export function IcDaun({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Flowing S-curve timeline */}
      <path
        d="M2 17 C5 17 5 7 8 7 C11 7 11 17 14 17 C17 17 17 7 22 7"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5"
      />
      {/* Decade node dots */}
      <circle cx="2" cy="17" r="2.2" fill="currentColor"/>
      <circle cx="8" cy="7" r="2.2" fill="currentColor"/>
      <circle cx="14" cy="17" r="2.2" fill="currentColor"/>
      <circle cx="22" cy="7" r="2.2" fill="currentColor"/>
      {/* Current year marker */}
      <circle cx="14" cy="17" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4"/>
    </svg>
  )
}

// 궁합 — 두 원의 만남 (음양 교차)
export function IcGunghab({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      {/* Left circle */}
      <circle cx="9" cy="12" r="6.5" opacity="0.6"/>
      {/* Right circle (overlapping, slightly lighter at overlap via SVG blend) */}
      <circle cx="15" cy="12" r="6.5" opacity="0.6"/>
      {/* Overlap region — brighter */}
      <path
        d="M12 6.3 C13.8 7.7 15 9.7 15 12 C15 14.3 13.8 16.3 12 17.7 C10.2 16.3 9 14.3 9 12 C9 9.7 10.2 7.7 12 6.3 Z"
        fill="currentColor" opacity="0.6"
      />
      {/* Small heart/star at center */}
      <circle cx="12" cy="12" r="1.6" fill="white" opacity="0.9"/>
    </svg>
  )
}

// 심층 해석 — 연꽃/동심원 (깊은 통찰)
export function IcDeepSaju({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Outer ring */}
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.4" opacity="0.3"/>
      {/* Middle ring */}
      <circle cx="12" cy="12" r="6.5" stroke="currentColor" strokeWidth="1.5" opacity="0.55"/>
      {/* Inner ring */}
      <circle cx="12" cy="12" r="3.8" stroke="currentColor" strokeWidth="1.6" opacity="0.8"/>
      {/* Core filled */}
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
      {/* 4 axis marks (방위 direction) */}
      <line x1="12" y1="1.5" x2="12" y2="4.5" stroke="currentColor" strokeWidth="1.4" opacity="0.4" strokeLinecap="round"/>
      <line x1="12" y1="19.5" x2="12" y2="22.5" stroke="currentColor" strokeWidth="1.4" opacity="0.4" strokeLinecap="round"/>
      <line x1="1.5" y1="12" x2="4.5" y2="12" stroke="currentColor" strokeWidth="1.4" opacity="0.4" strokeLinecap="round"/>
      <line x1="19.5" y1="12" x2="22.5" y2="12" stroke="currentColor" strokeWidth="1.4" opacity="0.4" strokeLinecap="round"/>
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
        fontFamily="'Noto Serif KR', serif"
      >印</text>
    </svg>
  )
}

// 꿈해몽 — 생각 거품(思夢雲) + 초승달
export function IcDream({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      {/* Dream thought bubble — cloud with bumps */}
      <path d="M6.5 10.8 C6.2 9.0 7.5 7.2 9.5 7.0 C9.8 5.8 11.0 5 12.5 5 C14.0 5 15.3 5.9 15.7 7.2 C16.0 7.1 16.4 7 16.8 7 C18.3 7 19.5 8.2 19.5 9.8 C19.5 9.9 19.5 10.0 19.5 10.1 C20.4 10.5 21 11.4 21 12.5 C21 14.0 19.7 15.2 18.2 15.2 L7.8 15.2 C6.2 15.2 4.9 13.9 4.9 12.3 C4.9 11.5 5.2 10.8 6.5 10.8 Z" opacity="0.9"/>
      {/* Thought bubble tail — 3 diminishing dots */}
      <circle cx="7.5" cy="17" r="1.3"/>
      <circle cx="5.5" cy="19.3" r="0.9"/>
      <circle cx="4" cy="21.2" r="0.6"/>
      {/* Crescent moon inside cloud */}
      <path d="M15 10.5 C15 12.2 13.5 13.5 11.7 13.5 C10.8 13.5 10.0 13.2 9.4 12.7 C9.9 12.8 10.4 12.9 11 12.9 C12.7 12.9 14.1 11.5 14.1 9.8 C14.1 9.2 13.9 8.6 13.6 8.1 C14.5 8.6 15 9.5 15 10.5 Z" fill="white" opacity="0.65"/>
    </svg>
  )
}

// 오늘의 코디 — 옷걸이 아이콘
export function IcOutfit({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Hanger hook */}
      <path d="M12 3 C12 3 14.5 3.5 14.5 6 C14.5 7.5 13 8 12 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
      {/* Hanger bar */}
      <path d="M2 14 L12 8 L22 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      {/* Clothing body */}
      <path d="M2 14 L4 14 L4 21 L20 21 L20 14 L22 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15"/>
      <path d="M4 14 L4 21 L20 21 L20 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      {/* Shirt fold lines */}
      <line x1="9" y1="15.5" x2="9" y2="20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      <line x1="15" y1="15.5" x2="15" y2="20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
    </svg>
  )
}

// 취업운 — 서류가방 아이콘
export function IcJob({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Handle */}
      <path d="M9 7 V5.5 C9 4.7 9.7 4 10.5 4 H13.5 C14.3 4 15 4.7 15 5.5 V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      {/* Body */}
      <rect x="3" y="7" width="18" height="13" rx="1.8" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.6"/>
      {/* Center latch */}
      <rect x="10" y="11" width="4" height="3" rx="0.8" fill="currentColor" opacity="0.6"/>
      {/* Middle line */}
      <line x1="3" y1="13" x2="21" y2="13" stroke="currentColor" strokeWidth="1.2" opacity="0.4"/>
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

// 사용자 프로필 — 전통 조각 문양
export function IcProfile({ size = 24, className = '' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20 C4 16 7.6 13 12 13 C16.4 13 20 16 20 20 Z" opacity="0.85"/>
    </svg>
  )
}
