import * as Sentry from '@sentry/react'

const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined

export function initSentry() {
  if (!DSN) return
  Sentry.init({ dsn: DSN, tracesSampleRate: 0 })
}

export function captureException(error: unknown) {
  if (!DSN) return
  Sentry.captureException(error)
}
