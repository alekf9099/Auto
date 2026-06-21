import { useEffect, useState } from 'react'
import { loadPoints } from '../utils/points'
import type { PointsState } from '../utils/points'
import { pullCloudData } from '../utils/cloudSync'
import { fetchMyReferralCode, redeemReferralCode } from '../utils/referral'
import { trackEvent } from '../utils/analytics'
import PointsToast from './PointsToast'

interface Props {
  onBack: () => void
  onPointsUpdate: (p: PointsState) => void
}

const REASON_MESSAGE: Record<string, string> = {
  invalid_code: '존재하지 않는 코드예요. 다시 확인해주세요',
  self_referral: '내 코드는 사용할 수 없어요',
  already_redeemed: '이미 추천 코드를 사용했어요',
  network_error: '네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요',
}

export default function InvitePage({ onBack, onPointsUpdate }: Props) {
  const [myCode, setMyCode] = useState<string | null>(null)
  const [alreadyRedeemed, setAlreadyRedeemed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState<{ amount: number; total: number } | null>(null)

  useEffect(() => {
    fetchMyReferralCode().then(result => {
      if (result) { setMyCode(result.code); setAlreadyRedeemed(result.alreadyRedeemed) }
      setLoading(false)
    })
  }, [])

  async function handleCopy() {
    if (!myCode) return
    try {
      await navigator.clipboard.writeText(myCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* 클립보드 권한이 없으면 그냥 무시 */ }
  }

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault()
    const code = input.trim()
    if (!code) return
    setSubmitting(true)
    setError('')
    const result = await redeemReferralCode(code)
    setSubmitting(false)
    if (!result.ok) {
      setError(REASON_MESSAGE[result.reason ?? 'network_error'])
      if (result.reason === 'already_redeemed') setAlreadyRedeemed(true)
      return
    }
    setAlreadyRedeemed(true)
    setInput('')
    trackEvent('referral_redeem')
    await pullCloudData()
    const fresh = loadPoints()
    onPointsUpdate(fresh)
    setToast({ amount: 30, total: fresh.balance })
  }

  return (
    <div className="min-h-screen bg-[#0D0A1A]">
      {toast && <PointsToast amount={toast.amount} total={toast.total} label="추천 코드 사용 보너스 🎁" onClose={() => setToast(null)} />}

      {/* 헤더 */}
      <div className="bg-[#130E24] border-b border-[#2A1F4A] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} aria-label="뒤로 가기" className="text-[#7B6F9A] hover:text-[#C4B8D8] transition text-lg">←</button>
          <div>
            <h1 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>친구 초대</h1>
            <p className="text-xs text-[#7B6F9A]">친구를 초대하고 함께 포인트를 받아보세요</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* 내 코드 카드 */}
        <div className="bg-[#130E24] border border-[#C9962A40] rounded-3xl px-5 py-5 text-center">
          <p className="text-[11px] text-[#C9962A] font-bold mb-2">내 추천 코드</p>
          {loading ? (
            <div className="h-12 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-[#2A1F4A] border-t-[#C9962A] animate-spin" />
            </div>
          ) : myCode ? (
            <>
              <p className="text-3xl font-bold text-[#F5EDD4] tracking-[0.2em] mb-3" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                {myCode}
              </p>
              <button
                onClick={handleCopy}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#C9962A] to-[#E8B84B] text-[#0D0A1A] active:scale-[0.98] transition-transform"
              >
                {copied ? '복사했어요 ✓' : '코드 복사하기'}
              </button>
              <p className="text-[11px] text-[#7B6F9A] mt-3 leading-relaxed">
                친구가 이 코드를 입력하면 친구는 +30P, 나는 +50P를 받아요
              </p>
            </>
          ) : (
            <p className="text-sm text-[#7B6F9A] py-3">코드를 불러오지 못했어요. 잠시 후 다시 시도해주세요</p>
          )}
        </div>

        {/* 코드 입력 카드 */}
        <div className="bg-[#130E24] border border-[#2A1F4A] rounded-3xl px-5 py-5">
          <p className="text-[11px] text-[#C9962A] font-bold mb-3">추천 코드 입력</p>
          {alreadyRedeemed ? (
            <p className="text-sm text-[#7B6F9A] text-center py-2">이미 추천 코드를 사용했어요</p>
          ) : (
            <form onSubmit={handleRedeem} className="space-y-2.5">
              <input
                type="text"
                value={input}
                onChange={e => { setInput(e.target.value.toUpperCase()); setError('') }}
                placeholder="친구의 추천 코드를 입력해주세요"
                maxLength={12}
                className="w-full px-4 py-3 rounded-2xl text-center text-[#F5EDD4] placeholder-[#4A4060] bg-[#1C1438] border border-[#2A1F4A] text-sm font-semibold tracking-[0.15em] focus:outline-none focus:border-[#C9962A] focus:ring-2 focus:ring-[#C9962A20] transition"
              />
              {error && <p className="text-xs text-rose-400 text-center">{error}</p>}
              <button
                type="submit"
                disabled={submitting || !input.trim()}
                className="w-full py-3 rounded-2xl font-bold text-[#0D0A1A] text-sm bg-gradient-to-r from-[#C9962A] to-[#E8B84B] disabled:opacity-40 active:scale-[0.98] transition-all"
              >
                {submitting ? '확인 중...' : '코드 입력하고 +30P 받기'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
