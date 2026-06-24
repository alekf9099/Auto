interface Props {
  message: string
  onDismiss: () => void
}

export default function NoticeBanner({ message, onDismiss }: Props) {
  return (
    <div className="bg-[#1A1430] border-b border-[#9A6A1240] px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-[#3B2A16] shadow-md shadow-black/30">
      <span>📢 {message}</span>
      <button onClick={onDismiss} className="shrink-0 text-[#9A6A12] font-semibold">닫기</button>
    </div>
  )
}
