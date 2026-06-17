import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import ErrorBoundary from './ErrorBoundary'

// 배포 직후 새 서비스워커가 열려 있던 페이지를 즉시 장악하면서, 옛 페이지가
// 더 이상 존재하지 않는 옛 해시 청크를 요청해 빈 화면이 되는 것을 막는다.
if ('serviceWorker' in navigator) {
  let reloaded = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded) return
    reloaded = true
    window.location.reload()
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
