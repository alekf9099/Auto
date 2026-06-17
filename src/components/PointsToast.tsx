import { useEffect } from 'react'
import { IcGem } from './icons/SajuIcons'

interface Props {
  amount: number
  total: number
  onClose: () => void
}

const SPARKLES = [
  { x: '14%', y: '18%', s: 7,  delay: '0s'    },
  { x: '86%', y: '22%', s: 5,  delay: '0.15s' },
  { x: '78%', y: '78%', s: 6,  delay: '0.3s'  },
  { x: '20%', y: '80%', s: 4,  delay: '0.45s' },
]

export default function PointsToast({ amount, total, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 2200)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-6">
      <div
        className="relative bg-[#130E24] border border-[#C9962A40] rounded-3xl shadow-2xl shadow-black/60 px-9 py-7 text-center overflow-hidden"
        style={{ animation: 'pointsPop 0.4s cubic-bezier(.175,.885,.32,1.275)' }}
      >
        {/* 은은한 골드 글로우 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#C9962A1A] to-transparent pointer-events-none" />

        {/* 산점 반짝임 */}
        {SPARKLES.map((sp, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-[#E8B84B]"
            style={{
              left: sp.x, top: sp.y, width: sp.s, height: sp.s,
              animation: `pointsSparkle 1.1s ease-in-out ${sp.delay} infinite`,
            }}
          />
        ))}

        <div className="relative">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#C9962A] to-[#E8B84B] flex items-center justify-center shadow-lg shadow-[#C9962A40]">
            <IcGem size={26} className="text-[#0D0A1A]" />
          </div>
          <p className="text-3xl font-bold text-[#F5EDD4] mb-1.5" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            +{amount}P
          </p>
          <p className="text-sm text-[#7B6F9A]">누적 <span className="font-semibold text-[#C9962A]">{total.toLocaleString()}P</span></p>
        </div>
      </div>
      <style>{`
        @keyframes pointsPop {
          0%   { opacity: 0; transform: scale(0.7) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pointsSparkle {
          0%, 100% { opacity: 0; transform: scale(0.4); }
          50%      { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
