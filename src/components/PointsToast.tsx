import { useEffect } from 'react'

interface Props {
  amount: number
  total: number
  onClose: () => void
}

export default function PointsToast({ amount, total, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 2200)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        className="bg-[#130E24] border border-[#C9962A30] rounded-3xl shadow-2xl shadow-[#000]/60 px-8 py-6 text-center"
        style={{ animation: 'pointsPop 0.35s cubic-bezier(.175,.885,.32,1.275)' }}
      >
        <p className="text-4xl mb-2">🎉</p>
        <p className="text-3xl font-bold text-[#C9962A] mb-1">+{amount}P</p>
        <p className="text-sm text-[#7B6F9A]">누적 <span className="font-semibold text-[#C4B8D8]">{total.toLocaleString()}P</span></p>
      </div>
      <style>{`
        @keyframes pointsPop {
          0%   { opacity: 0; transform: scale(0.7) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
