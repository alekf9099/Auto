import type { PointsState } from '../utils/points'

interface Props {
  points: PointsState
  onClose: () => void
}

export default function PointsModal({ points, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      {/* 딤 배경 */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* 시트 */}
      <div
        className="relative w-full max-w-2xl bg-white rounded-t-3xl px-5 pt-5 pb-10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* 핸들 */}
        <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mb-5" />

        {/* 잔액 헤더 */}
        <div className="bg-gradient-to-br from-[#1E1152] via-[#2D1B69] to-[#160F3E] rounded-3xl p-5 mb-5">
          <p className="text-violet-300/70 text-xs mb-1">보유 포인트</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-white">{points.balance.toLocaleString()}</span>
            <span className="text-violet-300 text-lg mb-0.5">P</span>
          </div>
          <div className="flex gap-3 mt-4">
            {[
              { label: '가입 보너스', val: '100P' },
              { label: '매일 출석',   val: '+10P' },
              { label: '운세 확인',   val: '+5P'  },
            ].map(item => (
              <div key={item.label} className="flex-1 bg-white/10 rounded-2xl px-3 py-2 text-center">
                <p className="text-violet-300/70 text-[10px] mb-0.5">{item.label}</p>
                <p className="text-white text-sm font-bold">{item.val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 내역 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-violet-500 rounded-full" />
          <h2 className="text-sm font-bold text-stone-800">포인트 내역</h2>
        </div>

        {points.history.length === 0 ? (
          <p className="text-center text-xs text-stone-400 py-8">아직 포인트 내역이 없습니다</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {points.history.map((h, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 bg-stone-50 rounded-2xl">
                <div>
                  <p className="text-sm font-medium text-stone-700">{h.label}</p>
                  <p className="text-xs text-stone-400">{h.date}</p>
                </div>
                <span className="text-sm font-bold text-violet-600">+{h.amount}P</span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 py-3.5 bg-stone-100 text-stone-600 font-semibold rounded-2xl text-sm"
        >
          닫기
        </button>
      </div>
    </div>
  )
}
