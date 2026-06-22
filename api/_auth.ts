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

// 구글 tokeninfo 호출 자체가 실패한 경우(네트워크/타임아웃 등) 던지는 에러.
// 토큰이 무효라고 단정할 수 없으므로, 호출부에서 401(재로그인 유도)이 아닌
// 일시적 오류로 구분해 처리할 수 있도록 일반 토큰 무효(null)와 분리한다.
export class AuthProviderUnreachableError extends Error {}

async function verifyGoogleToken(idToken: string): Promise<string | null> {
  const clientId = process.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) return null

  let resp: Response
  try {
    resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`)
  } catch (e) {
    console.error('구글 tokeninfo 호출 실패:', e)
    throw new AuthProviderUnreachableError('google tokeninfo unreachable')
  }
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
  let resp: Response
  try {
    resp = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  } catch (e) {
    console.error('카카오 사용자 조회 실패:', e)
    throw new AuthProviderUnreachableError('kakao api unreachable')
  }
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
