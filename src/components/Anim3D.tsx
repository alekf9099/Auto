import { IcSaju } from './icons/SajuIcons'

/**
 * 순수 CSS 3D 카드 뒤집기 (번들 비용 0).
 * flipped=false → 뒷면, true → 앞면. Y축 회전으로 뒤집힌다.
 */
export function FlipCard({
  flipped,
  front,
  back,
  className = '',
}: {
  flipped: boolean
  front: React.ReactNode
  back: React.ReactNode
  className?: string
}) {
  return (
    <div className={`w-full h-full ${className}`} style={{ perspective: '900px' }}>
      <div
        className="relative w-full h-full transition-transform duration-700 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
          {back}
        </div>
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {front}
        </div>
      </div>
    </div>
  )
}

/**
 * 입체적으로 회전하는 태극 — 앞/뒤 양면을 가진 동전처럼 Y축으로 돈다 (번들 비용 0).
 * 평면 SVG가 옆에서 사라지는 문제를 양면 배치로 해결.
 */
export function CoinTaegeuk({ size = 52, color = '#C9962A' }: { size?: number; color?: string }) {
  return (
    <div style={{ perspective: '700px', width: size, height: size }}>
      <div
        className="relative animate-coin-spin"
        style={{ width: size, height: size, transformStyle: 'preserve-3d' }}
      >
        <div className="absolute inset-0 flex items-center justify-center" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', color }}>
          <IcSaju size={size} />
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', color }}
        >
          <IcSaju size={size} />
        </div>
      </div>
    </div>
  )
}
