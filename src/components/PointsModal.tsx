import type { PointsState } from '../utils/points'
import { IcGem } from './icons/SajuIcons'

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
        className="relative w-full max-w-2xl bg-[#FBF4E2] rounded-t-3xl px-5 pt-5 pb-10 shadow-2xl border-t border-[#D8C290]"
        onClick={e => e.stopPropagation()}
      >
        {/* 핸들 */}
        <div className="w-10 h-1 bg-[#D8C290] rounded-full mx-auto mb-5" />

        {/* 잔액 헤더 */}
        <div className="bg-gradient-to-br from-[#FBF4E2] via-[#F3E7C8] to-[#EAD9B0] rounded-3xl p-5 mb-5 border border-[#9A6A1225]">
          <p className="text-[#9A8155] text-xs mb-1">보유 포인트</p>
          <div className="flex items-end gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#B5841C] to-[#9A6A12] flex items-center justify-center shadow-[0_0_18px_rgba(201,150,42,0.45)] shrink-0">
              <IcGem size={26} className="text-[#0D0A1A]"/>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white">{points.balance.toLocaleString()}</span>
              <span className="text-[#9A8155] text-lg mb-0.5">P</span>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            {[
              { label: '가입 보너스', val: '100P' },
              { label: '매일 출석',   val: '+10P' },
              { label: '운세 확인',   val: '+5P'  },
            ].map(item => (
              <div key={item.label} className="flex-1 bg-white/10 rounded-2xl px-3 py-2 text-center">
                <p className="text-[#9A8155] text-[10px] mb-0.5">{item.label}</p>
                <p className="text-white text-sm font-bold">{item.val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 내역 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-[#9A6A12] rounded-full" />
          <h2 className="text-sm font-bold text-[#3B2A16]">포인트 내역</h2>
        </div>

        {points.history.length === 0 ? (
          <p className="text-center text-xs text-[#9A8155] py-8">아직 포인트 내역이 없습니다</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {points.history.map((h, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 bg-[#E9DAB8] rounded-2xl">
                <div>
                  <p className="text-sm font-medium text-[#5C4A2E]">{h.label}</p>
                  <p className="text-xs text-[#9A8155]">{h.date}</p>
                </div>
                <span className="text-sm font-bold text-[#9A6A12]">+{h.amount}P</span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 py-3.5 bg-[#E3D0A4] text-[#5C4A2E] font-semibold rounded-2xl text-sm"
        >
          닫기
        </button>
      </div>
    </div>
  )
}
