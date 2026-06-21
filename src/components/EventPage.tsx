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
    <div className="min-h-screen bg-[#0D0A1A]">
      {/* 헤더 */}
      <div className="bg-[#130E24] border-b border-[#2A1F4A] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} aria-label="뒤로 가기" className="text-[#7B6F9A] hover:text-[#C4B8D8] transition text-lg">←</button>
          <div>
            <h1 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>이벤트</h1>
            <p className="text-xs text-[#7B6F9A]">진행 중인 이벤트에 참여하고 포인트를 받아보세요</p>
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
              <div
                className="relative shrink-0 w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'radial-gradient(circle at 35% 30%, #FFD557, #E8A33D 55%, #8A5A14 100%)', boxShadow: '0 0 18px rgba(232,163,61,0.5)' }}
              >
                <div className="absolute inset-0 rounded-full border-2 border-[#FFE9A8]/70" />
                <div className="absolute inset-[3px] rounded-full border border-[#8A5A14]/60" />
                <IcLucky size={26} className="relative text-[#3A1F05]"/>
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold text-[#C9962A]">1</span>
                  <p
                    className="text-base font-bold"
                    style={{ fontFamily: "'Noto Serif KR', serif", background: 'linear-gradient(180deg,#FFF4C7,#E8B84B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
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
              <div
                className="relative shrink-0 w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'radial-gradient(circle at 35% 30%, #FFD557, #E8A33D 55%, #8A5A14 100%)', boxShadow: '0 0 18px rgba(232,163,61,0.5)' }}
              >
                <div className="absolute inset-0 rounded-full border-2 border-[#FFE9A8]/70" />
                <div className="absolute inset-[3px] rounded-full border border-[#8A5A14]/60" />
                <IcRoulette size={26} className="relative text-[#3A1F05]"/>
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold text-[#C9962A]">2</span>
                  <p
                    className="text-base font-bold"
                    style={{ fontFamily: "'Noto Serif KR', serif", background: 'linear-gradient(180deg,#FFF4C7,#E8B84B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
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
              <div
                className="relative shrink-0 w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'radial-gradient(circle at 35% 30%, #FFD557, #E8A33D 55%, #8A5A14 100%)', boxShadow: '0 0 18px rgba(232,163,61,0.5)' }}
              >
                <div className="absolute inset-0 rounded-full border-2 border-[#FFE9A8]/70" />
                <div className="absolute inset-[3px] rounded-full border border-[#8A5A14]/60" />
                <IcGift size={26} className="relative text-[#3A1F05]"/>
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold text-[#C9962A]">3</span>
                  <p
                    className="text-base font-bold"
                    style={{ fontFamily: "'Noto Serif KR', serif", background: 'linear-gradient(180deg,#FFF4C7,#E8B84B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
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

      <div className="text-center pb-8 text-xs text-[#4A4060]">새로운 이벤트가 곧 추가될 예정이에요</div>
    </div>
  )
}
