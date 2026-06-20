import { Component } from 'react'
import type { ReactNode } from 'react'
import { captureException } from './utils/sentry'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

const RELOAD_FLAG = 'unmyeongbom_chunk_reload'

// 배포 직후 오래된 페이지가 새 해시의 청크를 불러오지 못해 화면이 비어버리는 것을 막는다.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    const isChunkLoadError = /dynamically imported module|module script failed|Loading chunk/i.test(message)
    if (isChunkLoadError && !sessionStorage.getItem(RELOAD_FLAG)) {
      sessionStorage.setItem(RELOAD_FLAG, '1')
      window.location.reload()
      return
    }
    captureException(error)
  }

  componentDidMount() {
    setTimeout(() => sessionStorage.removeItem(RELOAD_FLAG), 5000)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0D0A1A] flex flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-[#F5EDD4] text-sm">문제가 발생했어요. 다시 시도해주세요.</p>
          <button
            onClick={() => { sessionStorage.removeItem(RELOAD_FLAG); window.location.reload() }}
            className="text-xs font-semibold text-[#0D0A1A] bg-[#C9962A] px-5 py-2.5 rounded-full"
          >
            새로고침
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
