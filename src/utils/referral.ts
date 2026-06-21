import { getIdToken, getProvider } from './cloudSync'

export type RedeemReason = 'invalid_code' | 'self_referral' | 'already_redeemed' | 'network_error'

interface CodeResponse { code?: string; alreadyRedeemed?: boolean; error?: string }
interface RedeemResponse { ok?: boolean; reason?: string; error?: string }

async function callReferral<T>(body: Record<string, unknown>): Promise<T | null> {
  const idToken = getIdToken()
  if (!idToken) return null
  try {
    const res = await fetch('/api/referral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken, provider: getProvider(), ...body }),
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch { return null }
}

export async function fetchMyReferralCode(): Promise<{ code: string; alreadyRedeemed: boolean } | null> {
  const result = await callReferral<CodeResponse>({ action: 'code' })
  if (!result || typeof result.code !== 'string') return null
  return { code: result.code, alreadyRedeemed: !!result.alreadyRedeemed }
}

export async function redeemReferralCode(code: string): Promise<{ ok: boolean; reason?: RedeemReason }> {
  const result = await callReferral<RedeemResponse>({ action: 'redeem', code })
  if (!result) return { ok: false, reason: 'network_error' }
  return { ok: !!result.ok, reason: result.reason as RedeemReason | undefined }
}
