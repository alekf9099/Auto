import { useEffect, useRef } from 'react'

const UNIT_ID = import.meta.env.VITE_ADFIT_UNIT_ID as string | undefined
const SCRIPT_SRC = 'https://t1.daumcdn.net/kas/static/ba.min.js'

let scriptLoaded = false

function ensureScriptLoaded() {
  if (scriptLoaded) return
  scriptLoaded = true
  const script = document.createElement('script')
  script.async = true
  script.src = SCRIPT_SRC
  document.body.appendChild(script)
}

// 카카오 AdFit 배너. VITE_ADFIT_UNIT_ID가 없으면 아무것도 렌더링하지 않는다.
export default function AdBanner() {
  const insRef = useRef<HTMLModElement>(null)

  useEffect(() => {
    if (!UNIT_ID) return
    ensureScriptLoaded()
  }, [])

  if (!UNIT_ID) return null

  return (
    <div className="flex justify-center py-2">
      <ins
        ref={insRef}
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit={UNIT_ID}
        data-ad-width="320"
        data-ad-height="50"
      />
    </div>
  )
}
