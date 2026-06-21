/// <reference types="node" />
// 파일명이 _로 시작해 Vercel이 별도 라우트로 배포하지 않는다 (sync.ts, match.ts에서만 가져다 쓴다).

interface GoogleTokenInfo {
  aud: string
  email: string
  email_verified: string | boolean
  exp: string
}

interface KakaoUserMe {
  id: number
  kakao_account?: { email?: string; is_email_verified?: boolean }
}

async function verifyGoogleToken(idToken: string): Promise<string | null> {
  const clientId = process.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) return null

  const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`)
  if (!resp.ok) return null

  const info = (await resp.json()) as GoogleTokenInfo
  if (info.aud !== clientId) return null
  if (info.email_verified !== 'true' && info.email_verified !== true) return null
  if (!info.email) return null

  return info.email
}

// 카카오 액세스 토큰은 JWT가 아니라 서명 검증으로 본인 확인을 할 수 없으므로, 카카오 서버에
// 직접 물어 토큰 소유자를 확인한다. 이메일 동의를 받지 않은 앱은 이메일이 오지 않을 수 있어,
// 그 경우 카카오 고유 id로 합성 식별자를 만들어 기존 email 컬럼을 그대로 재사용한다
// (실제 메일 발송 용도가 아니라 내부 식별자로만 쓰이므로 문제 없다).
async function verifyKakaoToken(accessToken: string): Promise<string | null> {
  const resp = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!resp.ok) return null

  const info = (await resp.json()) as KakaoUserMe
  if (!info.id) return null

  const account = info.kakao_account
  if (account?.email && account.is_email_verified) return account.email
  return `kakao_${info.id}@kakao.local`
}

export async function verifyAuthToken(token: string, provider: unknown): Promise<string | null> {
  if (provider === 'kakao') return verifyKakaoToken(token)
  return verifyGoogleToken(token)
}
