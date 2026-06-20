import { getLuckyTimerAttempts, LUCKY_TIMER_MAX_ATTEMPTS, hasSpunRouletteToday } from '../utils/points'
import { IcLucky } from './icons/SajuIcons'

interface Props {
  onBack: () => void
  onOpenLucky: () => void
  onOpenRoulette: () => void
}

export default function EventPage({ onBack, onOpenLucky, onOpenRoulette }: Props) {
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
        <button
          onClick={onOpenLucky}
          className="w-full overflow-hidden rounded-3xl shadow-[0_2px_16px_rgba(201,150,42,0.10)] active:scale-[0.99] transition-all"
        >
          <div className="relative bg-[#130E24] border border-[#C9962A40] rounded-3xl px-5 py-4 flex items-center gap-4">
            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-[0.06] select-none pointer-events-none text-[#C9962A] rotate-12">
              <IcLucky size={64}/>
            </div>
            <div className="shrink-0 w-12 h-12 rounded-2xl bg-[#C9962A15] border border-[#C9962A35] flex items-center justify-center">
              <span className="text-xl font-bold text-[#C9962A]" style={{ fontFamily: "'Noto Serif KR', serif" }}>7</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-[10px] text-[#C9962A] font-bold mb-0.5">오늘의 이벤트</p>
              <p className="text-sm font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                행운의 숫자 잡기 — 7초에 도전!
              </p>
              <p className="text-[11px] text-[#7B6F9A] mt-0.5">
                {remaining > 0 ? `성공 시 +20P, 참가만 해도 +5P · 남은 기회 ${remaining}/${LUCKY_TIMER_MAX_ATTEMPTS}` : '오늘 참여 완료 · 내일 다시 도전'}
              </p>
            </div>
            <span className="text-[11px] text-[#C9962A] font-semibold shrink-0">
              {remaining > 0 ? '도전 →' : '완료 ✓'}
            </span>
          </div>
        </button>

        <button
          onClick={onOpenRoulette}
          className="w-full overflow-hidden rounded-3xl shadow-[0_2px_16px_rgba(201,150,42,0.10)] active:scale-[0.99] transition-all"
        >
          <div className="relative bg-[#130E24] border border-[#C9962A40] rounded-3xl px-5 py-4 flex items-center gap-4">
            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-[0.06] select-none pointer-events-none text-2xl rotate-12">🎡</div>
            <div className="shrink-0 w-12 h-12 rounded-2xl bg-[#C9962A15] border border-[#C9962A35] flex items-center justify-center text-xl">
              🎡
            </div>
            <div className="flex-1 text-left">
              <p className="text-[10px] text-[#C9962A] font-bold mb-0.5">오늘의 이벤트</p>
              <p className="text-sm font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                오행 룰렛 — 돌려보세요!
              </p>
              <p className="text-[11px] text-[#7B6F9A] mt-0.5">
                {spunToday ? '오늘 참여 완료 · 내일 다시 도전' : '최소 +5P, 잭폿 당첨 시 +100P'}
              </p>
            </div>
            <span className="text-[11px] text-[#C9962A] font-semibold shrink-0">
              {spunToday ? '완료 ✓' : '도전 →'}
            </span>
          </div>
        </button>
      </div>

      <div className="text-center pb-8 text-xs text-[#4A4060]">새로운 이벤트가 곧 추가될 예정이에요</div>
    </div>
  )
}
