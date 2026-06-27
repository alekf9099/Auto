import { useState, useEffect } from 'react'
import type { BirthInput } from '../types'
import { calcGunghab, type GunghabResult } from '../utils/gunghab'
import { isOptedIn, joinMatchPool, leaveMatchPool, drawMatch, loadMatchHistory, addMatchHistory, type MatchOpponent, type MatchHistoryEntry } from '../utils/match'
import { loadProfilePhoto } from '../utils/profilePhoto'
import PointsClaimButton from './PointsClaimButton'
import { IcMatch, IcDraw } from './icons/SajuIcons'

interface Props {
  nickname: string
  birthProfile: BirthInput
  onBack: () => void
}

const RANK_BADGE = ['#C9962A', '#BCB1D4', '#A79CC2']

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function MiniAvatar({ photo, label, bg }: { photo: string | null; label: string; bg: string }) {
  return photo
    ? <img src={photo} alt={label} className="w-5 h-5 rounded-full object-cover shrink-0" />
    : <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0 ${bg}`}>{label[0] ?? '?'}</div>
}

export default function MatchPage({ nickname, birthProfile, onBack }: Props) {
  const [myPhoto] = useState<string | null>(loadProfilePhoto)
  const [optedIn, setOptedInState] = useState(isOptedIn)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [opponent, setOpponent] = useState<MatchOpponent | null>(null)
  const [result, setResult] = useState<GunghabResult | null>(null)
  const [history, setHistory] = useState<MatchHistoryEntry[]>(loadMatchHistory)

  useEffect(() => { setError(null) }, [optedIn])

  async function handleJoin() {
    setBusy(true)
    setError(null)
    const { ok, error: serverError } = await joinMatchPool(nickname, birthProfile)
    setBusy(false)
    if (ok) setOptedInState(true)
    else setError(`참여에 실패했어요. 잠시 후 다시 시도해주세요.${serverError ? ` (${serverError})` : ''}`)
  }

  async function handleLeave() {
    setBusy(true)
    setError(null)
    const { ok, error: serverError } = await leaveMatchPool()
    setBusy(false)
    if (ok) {
      setOptedInState(false)
      setOpponent(null)
      setResult(null)
    } else {
      setError(`나가기에 실패했어요. 잠시 후 다시 시도해주세요.${serverError ? ` (${serverError})` : ''}`)
    }
  }

  async function handleDraw() {
    setBusy(true)
    setError(null)
    setOpponent(null)
    setResult(null)
    const opp = await drawMatch()
    setBusy(false)
    if (!opp) {
      setError('아직 매칭 가능한 다른 사용자가 없어요. 잠시 후 다시 시도해주세요.')
      return
    }
    const r = calcGunghab(birthProfile, opp.birth, 'friend')
    setOpponent(opp)
    setResult(r)
    setHistory(addMatchHistory({ nickname: opp.nickname, photo: opp.photo, score: r.total, grade: r.grade, date: today() }))
    window.scrollTo(0, 0)
  }

  const ranking = [...history].sort((a, b) => b.score - a.score).slice(0, 10)

  return (
    <div className="min-h-screen">
      <div className="bg-[#130E24] border-b border-[#2A1F4A] sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} aria-label="뒤로 가기" className="text-[#A79CC2] hover:text-[#C4B8D8] transition text-lg">←</button>
          <div>
            <h1 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>사주매칭</h1>
            <p className="text-xs text-[#A79CC2]">익명의 인연과 닉네임으로 궁합을 확인해보세요</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* 히어로 배너 */}
        <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-6 shadow-xl shadow-[#000]/40 border border-[#C9962A25] relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-violet-400/15 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-rose-500/15 blur-2xl" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-violet-300/85 text-xs mb-2">옵트인 사용자 풀 · 무작위 매칭</p>
              <p className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Gowun Batang', serif" }}>
                사주매칭
              </p>
              <p className="text-sm text-violet-300/80 leading-relaxed">닉네임으로만 만나는<br/>무작위 인연과의 궁합</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-[#C9962A15] border border-[#C9962A30] flex items-center justify-center shrink-0">
              <IcMatch size={32} className="text-[#C9962A]" />
            </div>
          </div>
        </div>

        {/* 참여 안내 / 상태 */}
        {!optedIn ? (
          <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-5 space-y-4">
            <div>
              <p className="text-sm font-bold text-[#F5EDD4] mb-2">매칭에 참여하면</p>
              <ul className="space-y-1.5 text-xs text-[#BCB1D4] leading-relaxed">
                <li>· 닉네임 <span className="font-semibold text-[#C9962A]">{nickname || '미설정'}</span>과 생년월일시가 매칭 풀에 등록돼요</li>
                {myPhoto && <li>· 설정해둔 프로필 사진도 매칭 상대에게 보여요</li>}
                <li>· 이메일·실명·구글 계정 사진 등 실제 신원 정보는 절대 공개되지 않아요</li>
                <li>· 언제든 매칭 풀에서 나갈 수 있어요</li>
              </ul>
            </div>
            {error && <p className="text-xs text-rose-400">{error}</p>}
            <button
              onClick={handleJoin}
              disabled={busy || !nickname}
              className="w-full py-4 bg-gradient-to-r from-[#C9962A] to-[#E8B84B] text-[#0D0A1A] font-bold rounded-2xl shadow-lg shadow-[#C9962A30] transition-all text-sm active:scale-[0.98] disabled:opacity-50"
            >
              {busy ? '참여하는 중...' : '매칭 풀에 참여하기'}
            </button>
            {!nickname && <p className="text-[11px] text-center text-[#857AA0]">프로필에 닉네임을 먼저 등록해주세요</p>}
          </div>
        ) : (
          <>
            <div className="bg-[#C9962A15] border border-[#C9962A30] rounded-3xl px-5 py-3.5 flex items-center justify-between">
              <p className="text-xs text-[#C4B8D8]">
                <span className="text-[#C9962A] font-semibold">✓ 매칭 풀 참여 중</span>
                <span className="text-[#A79CC2] ml-1.5">· {nickname}</span>
              </p>
              <button onClick={handleLeave} disabled={busy} className="text-xs text-[#A79CC2] hover:text-rose-400 transition disabled:opacity-50">나가기</button>
            </div>

            {error && (
              <div className="bg-rose-900/20 border border-rose-900/40 rounded-2xl px-4 py-3">
                <p className="text-xs text-rose-300">{error}</p>
              </div>
            )}

            <button
              onClick={handleDraw}
              disabled={busy}
              className="w-full py-4 bg-gradient-to-r from-[#C9962A] to-[#E8B84B] text-[#0D0A1A] font-bold rounded-2xl shadow-lg shadow-[#C9962A30] transition-all text-sm active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {busy ? '매칭 상대를 찾는 중...' : <><IcDraw size={17} /> 랜덤 매칭 뽑기</>}
            </button>
          </>
        )}

        {/* 결과 */}
        {result && opponent && (
          <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl overflow-hidden shadow-xl shadow-[#000]/40 border border-[#C9962A25] relative animate-fade-in-up">
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="relative z-10 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-1.5 bg-violet-400/20 border border-violet-400/30 rounded-full px-2.5 py-1.5">
                  <MiniAvatar photo={myPhoto} label={nickname} bg="bg-violet-500" />
                  <span className="text-xs text-violet-200 font-medium">{nickname}</span>
                </div>
                <span className="text-violet-400/80 text-sm">✕</span>
                <div className="flex items-center gap-1.5 bg-rose-400/20 border border-rose-400/30 rounded-full px-2.5 py-1.5">
                  <MiniAvatar photo={opponent.photo} label={opponent.nickname} bg="bg-rose-400" />
                  <span className="text-xs text-rose-200 font-medium">{opponent.nickname}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center shrink-0 w-20">
                  <p className="text-4xl font-bold text-white leading-none tabular-nums">{result.total}</p>
                  <p className="text-sm font-bold text-violet-300">%</p>
                </div>
                <div className="flex-1 space-y-2">
                  <span
                    className="inline-block text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{ color: result.gradeColor, backgroundColor: result.gradeBg, boxShadow: `0 0 12px ${result.gradeColor}30` }}
                  >
                    {result.grade}
                  </span>
                  <p className="text-base font-bold text-white leading-snug" style={{ fontFamily: "'Gowun Batang', serif" }}>
                    {result.headline}
                  </p>
                </div>
              </div>
              <p className="text-xs text-violet-200/85 leading-relaxed mt-4">{result.summary}</p>
            </div>
          </div>
        )}

        {result && <PointsClaimButton featureKey="match" label="사주매칭 🎲" />}

        {/* 나의 매칭 랭킹 */}
        {optedIn && ranking.length > 0 && (
          <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-[#C9962A] rounded-full" />
              <h2 className="text-sm font-bold text-[#F5EDD4]">나의 매칭 랭킹</h2>
            </div>
            <div className="space-y-2">
              {ranking.map((entry, i) => (
                <div key={`${entry.nickname}-${entry.date}-${i}`} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-[#1C1438]">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-[#0D0A1A] shrink-0"
                    style={{ backgroundColor: RANK_BADGE[i] ?? '#3A2F55', color: i < 3 ? '#0D0A1A' : '#C4B8D8' }}
                  >
                    {i + 1}
                  </span>
                  <MiniAvatar photo={entry.photo} label={entry.nickname} bg="bg-violet-500" />
                  <p className="text-xs font-semibold text-[#C4B8D8] flex-1 truncate">{entry.nickname}</p>
                  <span className="text-[11px] text-[#A79CC2]">{entry.grade}</span>
                  <span className="text-xs font-bold text-[#C9962A] tabular-nums">{entry.score}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="text-center pb-8 text-xs text-[#857AA0]">사주매칭 — 참고용 · 닉네임 기반 익명 매칭</div>
    </div>
  )
}
