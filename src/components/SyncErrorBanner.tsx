interface Props {
  expired: boolean
  onDismiss: () => void
  onRelogin: () => void
}

export default function SyncErrorBanner({ expired, onDismiss, onRelogin }: Props) {
  return (
    <div className="bg-[#3A1F1F] border-b border-[#C9962A40] px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-[#F0D9C0] shadow-md shadow-black/30">
      <span className="flex items-center gap-1.5">
        <span className="shrink-0 w-4 h-4 rounded-full bg-[#C9962A]/25 text-[#E8B84B] text-[10px] font-bold flex items-center justify-center">!</span>
        {expired
          ? '로그인이 만료됐어요. 다시 로그인하면 동기화가 복구돼요.'
          : '클라우드 동기화에 실패했어요. 데이터가 백업되지 않을 수 있어요.'}
      </span>
      {expired
        ? <button onClick={onRelogin} className="shrink-0 text-[#C9962A] font-semibold">다시 로그인</button>
        : <button onClick={onDismiss} className="shrink-0 text-[#C9962A] font-semibold">닫기</button>}
    </div>
  )
}
