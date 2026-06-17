import { useState } from 'react'
import { loadPoints, tryFeatureBonus } from '../utils/points'
import PointsToast from './PointsToast'
import { IcGem } from './icons/SajuIcons'

interface Props {
  featureKey: string
  label: string
}

export default function PointsClaimButton({ featureKey, label }: Props) {
  const [toast, setToast] = useState<{ amount: number; total: number } | null>(null)

  function handleClaim() {
    const { next, claimed } = tryFeatureBonus(loadPoints(), featureKey, label)
    if (claimed) setToast({ amount: 5, total: next.balance })
    else setToast({ amount: 0, total: loadPoints().balance })
  }

  return (
    <>
      {toast && toast.amount > 0 && (
        <PointsToast amount={toast.amount} total={toast.total} onClose={() => setToast(null)} />
      )}
      <button
        onClick={handleClaim}
        disabled={toast !== null && toast.amount === 0}
        className={`w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all ${
          toast !== null && toast.amount === 0
            ? 'bg-[#1C1530] text-[#7B6F9A]'
            : 'bg-gradient-to-r from-[#C9962A] to-[#E8B84B] text-[#0D0A1A] shadow-md shadow-[#C9962A30]'
        }`}
      >
        {toast !== null && toast.amount === 0
          ? '✓ 오늘 포인트 이미 받음'
          : <><IcGem size={15} className="text-[#0D0A1A]" /> 포인트 받기 +5P</>}
      </button>
    </>
  )
}
