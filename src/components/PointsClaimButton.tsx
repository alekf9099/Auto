import { useState } from 'react'
import { loadPoints, tryFeatureBonus, isFeatureBonusClaimed } from '../utils/points'
import { isGuest } from '../utils/guestGate'
import PointsToast from './PointsToast'
import { IcGem } from './icons/SajuIcons'

interface Props {
  featureKey: string
  label: string
}

export default function PointsClaimButton({ featureKey, label }: Props) {
  const [toast, setToast] = useState<{ amount: number; total: number } | null>(null)
  // 오늘 이미 받았으면 처음부터 받음 상태로 표시한다.
  const [claimedToday, setClaimedToday] = useState(() => isFeatureBonusClaimed(featureKey))

  // 게스트는 포인트가 없으므로 적립 버튼을 노출하지 않는다.
  if (isGuest()) return null

  function handleClaim() {
    if (claimedToday) return
    const { next, claimed } = tryFeatureBonus(loadPoints(), featureKey, label)
    setClaimedToday(true)               // 성공/이미받음 모두 버튼을 즉시 '받음' 상태로
    if (claimed) setToast({ amount: 5, total: next.balance })  // 성공 시 +5P 알림
  }

  return (
    <>
      {toast && (
        <PointsToast amount={toast.amount} total={toast.total} onClose={() => setToast(null)} />
      )}
      <button
        onClick={handleClaim}
        disabled={claimedToday}
        className={`w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all ${
          claimedToday
            ? 'bg-[#1C1530] text-[#A79CC2]'
            : 'bg-gradient-to-r from-[#C9962A] to-[#E8B84B] text-[#0D0A1A] shadow-md shadow-[#C9962A30]'
        }`}
      >
        {claimedToday
          ? '✓ 오늘 포인트 받기 완료'
          : <><IcGem size={15} className="text-[#0D0A1A]" /> 포인트 받기 +5P</>}
      </button>
    </>
  )
}
