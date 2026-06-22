/// <reference types="node" />
// 카카오 로그인 인가 코드를 액세스 토큰으로 교환하고, 프로필까지 함께 가져온다.
// REST API 키/Client Secret은 서버에만 두고 클라이언트에 노출하지 않는다.

interface KakaoTokenResponse { access_token: string }

interface KakaoUserMe {
  id: number
  kakao_account?: {
    email?: string
    is_email_verified?: boolean
    profile?: { nickname?: string; profile_image_url?: string }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { code, redirectUri } = (req.body ?? {}) as { code?: string; redirectUri?: string }
  if (!code || !redirectUri) return res.status(400).json({ error: 'invalid request' })

  const restApiKey = process.env.KAKAO_REST_API_KEY
  const clientSecret = process.env.KAKAO_CLIENT_SECRET
  if (!restApiKey) return res.status(500).json({ error: 'server not configured' })

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: restApiKey,
    redirect_uri: redirectUri,
    code,
  })
  if (clientSecret) params.set('client_secret', clientSecret)

  let tokenResp: Response
  try {
    tokenResp = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })
  } catch (e) {
    console.error('카카오 토큰 요청 실패:', e)
    return res.status(503).json({ error: 'kakao token endpoint unreachable' })
  }
  if (!tokenResp.ok) {
    console.error('카카오 토큰 발급 실패:', tokenResp.status, await tokenResp.text().catch(() => ''))
    return res.status(401).json({ error: 'invalid code' })
  }
  const { access_token } = (await tokenResp.json()) as KakaoTokenResponse

  let meResp: Response
  try {
    meResp = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    })
  } catch (e) {
    console.error('카카오 사용자 조회 실패:', e)
    return res.status(503).json({ error: 'kakao api unreachable' })
  }
  if (!meResp.ok) return res.status(401).json({ error: 'invalid token' })
  const info = (await meResp.json()) as KakaoUserMe

  const account = info.kakao_account
  const email = account?.email && account.is_email_verified ? account.email : `kakao_${info.id}@kakao.local`
  const profile = account?.profile

  return res.status(200).json({
    accessToken: access_token,
    name: profile?.nickname ?? '카카오 사용자',
    email,
    picture: profile?.profile_image_url ?? null,
  })
}
