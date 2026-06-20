const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined

declare global {
  interface Window {
    dataLayer?: unknown[][]
    gtag?: (...args: unknown[]) => void
  }
}

let loaded = false

function ensureLoaded() {
  if (loaded) return
  loaded = true
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = (...args: unknown[]) => window.dataLayer!.push(args)
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { send_page_view: false })
}

export function trackPageView(path: string) {
  if (!GA_ID) return
  ensureLoaded()
  window.gtag?.('event', 'page_view', { page_path: path })
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (!GA_ID) return
  ensureLoaded()
  window.gtag?.('event', name, params)
}
