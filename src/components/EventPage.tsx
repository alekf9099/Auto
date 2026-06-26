import { getLuckyTimerAttempts, LUCKY_TIMER_MAX_ATTEMPTS, hasSpunRouletteToday } from '../utils/points'
import { IcLucky, IcRoulette, IcGift } from './icons/SajuIcons'

// 카드 모서리 계단식 회문(回紋) 장식 — Canva 시안의 모서리 디테일 재현
function CornerFret({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 22 22" width="20" height="20" fill="none" className={className}>
      <path d="M2 18 L2 9 L5 9 L5 6 L9 6 L9 3 L18 3" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="3.3" y="7.3" width="2.6" height="2.6" fill="currentColor" opacity="0.85"/>
      <rect x="7.3" y="3.3" width="2.6" height="2.6" fill="currentColor" opacity="0.6"/>
      <circle cx="2" cy="20" r="1.1" fill="currentColor"/>
    </svg>
  )
}

// 코인 테두리의 톱니(쉐브론) 패턴 — Canva 시안의 음각 메달 테두리 재현
function CoinRing({ className = '' }: { className?: string }) {
  const teeth = Array.from({ length: 18 }, (_, i) => i * (360 / 18))
  return (
    <svg viewBox="0 0 56 56" className={className} fill="none">
      <circle cx="28" cy="28" r="25.5" stroke="currentColor" strokeWidth="1" opacity="0.55" />
      <circle cx="28" cy="28" r="18.5" stroke="currentColor" strokeWidth="1" opacity="0.55" />
      <g opacity="0.85">
        {teeth.map(d => (
          <polygon key={d} points="28,20.5 29.6,24.8 26.4,24.8" fill="currentColor" transform={`rotate(${d} 28 28)`} />
        ))}
      </g>
    </svg>
  )
}

// 청동 코인 메달 배지 — Canva 시안의 음각 코인 아이콘 스타일 재현
function CoinBadge({ children, ornaments = false }: { children: React.ReactNode; ornaments?: boolean }) {
  return (
    <div className="relative shrink-0 w-14 h-14 flex items-center justify-center">
      {ornaments && (
        <>
          <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-[#C9962A]" />
          <div className="absolute -right-[5px] top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-[#C9962A]" />
        </>
      )}
      <div
        className="relative w-14 h-14 rounded-full flex items-center justify-center"
        style={{ background: 'radial-gradient(circle at 32% 26%, #E2BD78 0%, #B9863F 48%, #6B4520 100%)', boxShadow: '0 2px 10px rgba(0,0,0,0.45), 0 0 14px rgba(184,134,63,0.35)' }}
      >
        <div className="absolute inset-0 rounded-full border border-[#3A2410]/70" />
        <CoinRing className="absolute inset-0 text-[#4A2F14]" />
        <div
          className="absolute inset-[11px] rounded-full"
          style={{ background: 'radial-gradient(circle at 35% 28%, #C9A05A, #8A6230 65%, #5C3D1C 100%)', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.55), inset 0 -1px 2px rgba(255,224,170,0.25)' }}
        />
        <div className="relative text-[#2E1B0A]">{children}</div>
      </div>
    </div>
  )
}

interface Props {
  onBack: () => void
  onOpenLucky: () => void
  onOpenRoulette: () => void
  onOpenInvite: () => void
}

export default function EventPage({ onBack, onOpenLucky, onOpenRoulette, onOpenInvite }: Props) {
  const remaining = LUCKY_TIMER_MAX_ATTEMPTS - getLuckyTimerAttempts()
  const spunToday = hasSpunRouletteToday()

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <div className="bg-[#130E24] border-b border-[#2A1F4A] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} aria-label="뒤로 가기" className="text-[#A79CC2] hover:text-[#C4B8D8] transition text-lg">←</button>
          <div>
            <h1 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>이벤트</h1>
            <p className="text-xs text-[#A79CC2]">진행 중인 이벤트에 참여하고 포인트를 받아보세요</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        <button onClick={onOpenLucky} className="w-full text-left active:scale-[0.99] transition-all">
          <div className="relative bg-[#170820] rounded-2xl border border-[#C9962A]/70 px-5 py-4 shadow-[0_2px_16px_rgba(201,150,42,0.10)] overflow-hidden">
            <CornerFret className="absolute top-2 left-2 text-[#C9962A]" />
            <CornerFret className="absolute top-2 right-2 text-[#C9962A] -scale-x-100" />
            <CornerFret className="absolute bottom-2 left-2 text-[#C9962A] -scale-y-100" />
            <CornerFret className="absolute bottom-2 right-2 text-[#C9962A] -scale-x-100 -scale-y-100" />

            <div className="flex items-center gap-3">
              <CoinBadge>
                <IcLucky size={24} className="text-[#2E1B0A]" />
              </CoinBadge>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold text-[#C9962A]">1</span>
                  <p
                    className="text-base font-bold"
                    style={{ fontFamily: "'Gowun Batang', serif", background: 'linear-gradient(180deg,#FFF4C7,#E8B84B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                  >
                    행운의 숫자 잡기
                  </p>
                </div>
                <p className="text-[11px] mt-1" style={{ color: '#B08F66' }}>
                  {remaining > 0 ? `성공 시 +20P, 참가만 해도 +5P · 남은 기회 ${remaining}/${LUCKY_TIMER_MAX_ATTEMPTS}` : '오늘 참여 완료 · 내일 다시 도전'}
                </p>
              </div>
              <span className="text-[11px] text-[#C9962A] font-semibold shrink-0">
                {remaining > 0 ? '도전 →' : '완료 ✓'}
              </span>
            </div>
          </div>
        </button>

        <button onClick={onOpenRoulette} className="w-full text-left active:scale-[0.99] transition-all">
          <div className="relative bg-[#170820] rounded-2xl border border-[#C9962A]/70 px-5 py-4 shadow-[0_2px_16px_rgba(201,150,42,0.10)] overflow-hidden">
            <CornerFret className="absolute top-2 left-2 text-[#C9962A]" />
            <CornerFret className="absolute top-2 right-2 text-[#C9962A] -scale-x-100" />
            <CornerFret className="absolute bottom-2 left-2 text-[#C9962A] -scale-y-100" />
            <CornerFret className="absolute bottom-2 right-2 text-[#C9962A] -scale-x-100 -scale-y-100" />

            <div className="flex items-center gap-3">
              <CoinBadge>
                <IcRoulette size={24} className="text-[#2E1B0A]" />
              </CoinBadge>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold text-[#C9962A]">2</span>
                  <p
                    className="text-base font-bold"
                    style={{ fontFamily: "'Gowun Batang', serif", background: 'linear-gradient(180deg,#FFF4C7,#E8B84B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                  >
                    오행 룰렛
                  </p>
                </div>
                <p className="text-[11px] mt-1" style={{ color: '#B08F66' }}>
                  {spunToday ? '오늘 참여 완료 · 내일 다시 도전' : '최소 +5P, 잭폿 당첨 시 +100P'}
                </p>
              </div>
              <span className="text-[11px] text-[#C9962A] font-semibold shrink-0">
                {spunToday ? '완료 ✓' : '도전 →'}
              </span>
            </div>
          </div>
        </button>

        <button onClick={onOpenInvite} className="w-full text-left active:scale-[0.99] transition-all">
          <div className="relative bg-[#170820] rounded-2xl border border-[#C9962A]/70 px-5 py-4 shadow-[0_2px_16px_rgba(201,150,42,0.10)] overflow-hidden">
            <CornerFret className="absolute top-2 left-2 text-[#C9962A]" />
            <CornerFret className="absolute top-2 right-2 text-[#C9962A] -scale-x-100" />
            <CornerFret className="absolute bottom-2 left-2 text-[#C9962A] -scale-y-100" />
            <CornerFret className="absolute bottom-2 right-2 text-[#C9962A] -scale-x-100 -scale-y-100" />

            <div className="flex items-center gap-3">
              <CoinBadge ornaments>
                <IcGift size={24} className="text-[#2E1B0A]" />
              </CoinBadge>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold text-[#C9962A]">3</span>
                  <p
                    className="text-base font-bold"
                    style={{ fontFamily: "'Gowun Batang', serif", background: 'linear-gradient(180deg,#FFF4C7,#E8B84B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                  >
                    친구 초대 선물
                  </p>
                </div>
                <p className="text-[11px] mt-1" style={{ color: '#B08F66' }}>
                  친구는 +30P, 나는 +50P
                </p>
              </div>
              <span className="text-[11px] text-[#C9962A] font-semibold shrink-0">
                초대하기 →
              </span>
            </div>
          </div>
        </button>
      </div>

      <div className="text-center pb-8 text-xs text-[#857AA0]">새로운 이벤트가 곧 추가될 예정이에요</div>
    </div>
  )
}
