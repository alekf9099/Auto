import { useRef, useState } from 'react'
import { IcGem, IcSinnyeon, IcShare } from './icons/SajuIcons'

type IconCmp = React.ComponentType<{ size?: number; className?: string }>

export interface ShareCardData {
  badge: string
  Icon: IconCmp
  iconColor?: string
  title: string
  date: string
  highlight: string
  items: { label: string; value: string }[]
  accent: string
  footer: string
}

interface Props {
  data: ShareCardData
  onClose: () => void
}

export default function ShareCardModal({ data, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function captureCanvas() {
    if (!cardRef.current) return null
    const { default: html2canvas } = await import('html2canvas')
    return html2canvas(cardRef.current, {
      scale: 2,
      backgroundColor: null,
      useCORS: true,
    })
  }

  async function handleSave() {
    setBusy(true)
    try {
      const canvas = await captureCanvas()
      if (!canvas) return
      const link = document.createElement('a')
      link.download = `운명봄_${data.badge}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      setDone(true)
      setTimeout(() => setDone(false), 2000)
    } finally {
      setBusy(false)
    }
  }

  async function handleShare() {
    setBusy(true)
    try {
      const canvas = await captureCanvas()
      if (!canvas) return
      canvas.toBlob(async blob => {
        if (!blob) { setBusy(false); return }
        const file = new File([blob], `운명봄_${data.badge}.png`, { type: 'image/png' })
        if (navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `운명봄 · ${data.badge}`,
              text: data.highlight,
            })
          } catch { /* 사용자가 취소함 */ }
          setBusy(false)
        } else {
          const link = document.createElement('a')
          link.download = `운명봄_${data.badge}.png`
          link.href = canvas.toDataURL('image/png')
          link.click()
          setBusy(false)
        }
      }, 'image/png')
    } catch {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* 카드 미리보기 */}
        <div className="flex justify-center mb-4">
          <div
            ref={cardRef}
            className="w-[300px] aspect-[9/16] rounded-[26px] p-[1.5px]"
            style={{ background: `linear-gradient(160deg, ${data.accent}90, #2A1F4A 45%, ${data.accent}50)` }}
          >
          <div
            className="w-full h-full rounded-[24.5px] overflow-hidden relative flex flex-col p-6"
            style={{ background: 'linear-gradient(160deg, #1A0E30 0%, #100820 55%, #060410 100%)' }}
          >
            {/* 장식 */}
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-20 blur-2xl" style={{ backgroundColor: data.accent }} />
            <div className="absolute -left-10 bottom-20 w-32 h-32 rounded-full opacity-10 blur-2xl" style={{ backgroundColor: data.accent }} />
            <div className="absolute -right-6 bottom-4 opacity-[0.05] pointer-events-none select-none rotate-12" style={{ color: data.accent }}>
              <IcSinnyeon size={110}/>
            </div>

            {/* 헤더 */}
            <div className="relative flex items-center justify-between mb-6">
              <div className="flex items-center gap-1">
                <span style={{ color: data.accent }}><IcGem size={13}/></span>
                <p className="text-sm font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>운명봄</p>
              </div>
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ color: data.accent, backgroundColor: data.accent + '20', border: `1px solid ${data.accent}45` }}
              >
                {data.badge}
              </span>
            </div>

            {/* 본문 */}
            <div className="relative flex-1 flex flex-col items-center justify-center text-center px-1">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: data.accent + '18', border: `1.5px solid ${data.accent}45` }}
              >
                <span className="leading-none" style={{ color: data.iconColor ?? data.accent }}><data.Icon size={40} /></span>
              </div>
              <h2 className="text-xl font-bold text-[#F5EDD4] mb-2 leading-snug" style={{ fontFamily: "'Gowun Batang', serif" }}>
                {data.title}
              </h2>
              <div className="w-9 h-[2px] rounded-full mb-3" style={{ backgroundColor: data.accent }} />
              <p className="text-xs text-[#C4B8D8] leading-relaxed mb-5">{data.highlight}</p>

              {data.items.length > 0 && (
                <div className="w-full grid grid-cols-2 gap-2">
                  {data.items.map(item => (
                    <div key={item.label} className="rounded-xl px-2 py-2" style={{ backgroundColor: data.accent + '12', border: `1px solid ${data.accent}30` }}>
                      <p className="text-[9px] text-[#A79CC2] mb-0.5">{item.label}</p>
                      <p className="text-xs font-bold text-[#E8DFC8] truncate">{item.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 푸터 */}
            <div className="relative text-center mt-4">
              <p className="text-[10px] text-[#A79CC2]">{data.date}</p>
              <p className="text-[9px] text-[#857AA0] mt-1">{data.footer}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <span style={{ color: data.accent }}><IcGem size={9}/></span>
                <p className="text-[9px] font-bold" style={{ color: data.accent }}>매일 운세, 운명봄에서</p>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={busy}
            className="flex-1 py-3 rounded-2xl text-sm font-bold bg-[#231844] text-[#C4B8D8] hover:bg-[#2A1F4A] transition active:scale-[0.98] disabled:opacity-50"
          >
            {done ? '✓ 저장됨' : '이미지 저장'}
          </button>
          <button
            onClick={handleShare}
            disabled={busy}
            className="flex-1 py-3 rounded-2xl text-sm font-bold text-[#0D0A1A] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5"
            style={{ background: `linear-gradient(to right, ${data.accent}, ${data.accent}CC)` }}
          >
            {busy ? '처리 중...' : <><IcShare size={15} /> 공유하기</>}
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-2 py-2.5 text-xs text-[#A79CC2] hover:text-[#C4B8D8] transition"
        >
          닫기
        </button>
      </div>
    </div>
  )
}
