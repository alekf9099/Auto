import { useState, useEffect, useRef } from 'react'
import { loadPoints, getLuckyTimerAttempts, claimLuckyTimer, LUCKY_TIMER_MAX_ATTEMPTS } from '../utils/points'
import type { PointsState } from '../utils/points'
import { IcLucky } from './icons/SajuIcons'

interface Props {
  onBack: () => void
  onPointsUpdate: (p: PointsState) => void
}

const TARGET = 7.0
const TOLERANCE = 0.1

export default function LuckyTimerPage({ onBack, onPointsUpdate }: Props) {
  const [points,   setPoints]   = useState<PointsState>(loadPoints)
  const [attempts, setAttempts] = useState(getLuckyTimerAttempts)
  const [phase,    setPhase]    = useState<'idle' | 'running' | 'result'>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [result, setResult] = useState<{ success: boolean; amount: number; diff: number } | null>(null)
  const startRef = useRef(0)

  useEffect(() => {
    if (phase !== 'running') return
    const id = setInterval(() => {
      setElapsed((performance.now() - startRef.current) / 1000)
    }, 30)
    return () => clearInterval(id)
  }, [phase])

  const played = attempts >= LUCKY_TIMER_MAX_ATTEMPTS

  function handleStart() {
    if (played) return
    startRef.current = performance.now()
    setElapsed(0)
    setPhase('running')
  }

  function handleStop() {
    const finalElapsed = (performance.now() - startRef.current) / 1000
    const diff = Math.abs(finalElapsed - TARGET)
    const success = diff <= TOLERANCE
    const { next, attempts: nextAttempts } = claimLuckyTimer(points, success)
    setPoints(next)
    onPointsUpdate(next)
    setAttempts(nextAttempts)
    setElapsed(finalElapsed)
    setResult({ success, amount: success ? 20 : 5, diff })
    setPhase('result')
  }

  function handleRetry() {
    setResult(null)
    setElapsed(0)
    setPhase('idle')
  }

  return (
    <div className="min-h-screen bg-[#0D0A1A]">
      {/* 헤더 */}
      <div className="bg-[#0D0A1A]/95 backdrop-blur-md border-b border-[#2A1F4A] sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} aria-label="뒤로 가기" className="text-[#7B6F9A] hover:text-[#C4B8D8] transition text-lg">←</button>
          <div>
            <h1 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>행운의 숫자 잡기</h1>
            <p className="text-xs text-[#7B6F9A]">7초에 딱 맞춰 멈춰보세요</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* 안내 배너 */}
        <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-6 shadow-xl shadow-[#000]/40 border border-[#C9962A25] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-violet-500/10 -translate-y-10 translate-x-10" />
          <div className="relative z-10 text-center">
            <p className="text-violet-300/70 text-xs mb-2">오늘의 이벤트</p>
            <p className="text-7xl font-bold text-[#C9962A] mb-2" style={{ fontFamily: "'Noto Serif KR', serif" }}>7</p>
            <p className="text-base font-bold text-[#F5EDD4] mb-1" style={{ fontFamily: "'Noto Serif KR', serif" }}>
              행운의 숫자, 7초를 맞춰보세요!
            </p>
            <p className="text-sm text-[#A89BC0] leading-relaxed">
              시작 후 정확히 <span className="text-[#C9962A] font-semibold">7.00초</span>에 멈추면 <span className="text-[#C9962A] font-semibold">+20P</span>,<br/>
              아쉽게 놓쳐도 참가 보상으로 <span className="text-[#4BBF7E] font-semibold">+5P</span> 지급!
            </p>
          </div>
        </div>

        {/* 게임 영역 */}
        <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-6">
          {/* 남은 기회 표시 */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <p className="text-xs text-[#7B6F9A]">남은 기회</p>
            <div className="flex gap-1.5">
              {Array.from({ length: LUCKY_TIMER_MAX_ATTEMPTS }).map((_, i) => (
                <span
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full ${i < LUCKY_TIMER_MAX_ATTEMPTS - attempts ? 'bg-[#C9962A]' : 'bg-[#2A1F4A]'}`}
                />
              ))}
            </div>
            <p className="text-xs font-bold text-[#C9962A]">{LUCKY_TIMER_MAX_ATTEMPTS - attempts}/{LUCKY_TIMER_MAX_ATTEMPTS}</p>
          </div>

          {phase !== 'result' && (
            <div className="flex flex-col items-center py-6">
              <div className="relative w-44 h-44 mb-6">
                <div className={`absolute inset-0 rounded-full border-4 ${phase === 'running' ? 'border-[#C9962A60] animate-pulse' : 'border-[#2A1F4A]'}`}/>
                <div className="absolute inset-0 flex items-center justify-center">
                  <IcLucky size={36} className="text-[#C9962A] opacity-50 absolute -top-2"/>
                  <p className="text-4xl font-bold text-[#F5EDD4] tabular-nums" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                    {elapsed.toFixed(2)}<span className="text-lg text-[#7B6F9A]">초</span>
                  </p>
                </div>
              </div>

              {played ? (
                <div className="text-center">
                  <p className="text-sm font-semibold text-[#7B6F9A]">오늘 기회를 모두 사용했어요</p>
                  <p className="text-xs text-[#4A4060] mt-1">내일 다시 도전해보세요!</p>
                </div>
              ) : phase === 'idle' ? (
                <button
                  onClick={handleStart}
                  className="w-full py-4 bg-gradient-to-r from-[#C9962A] to-[#E8B84B] text-[#0D0A1A] font-bold rounded-2xl shadow-lg shadow-[#C9962A30] active:scale-[0.98] transition-all"
                >
                  ▶ 시작하기
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="w-full py-4 bg-gradient-to-r from-[#E05252] to-[#FF7A7A] text-[#0D0A1A] font-bold rounded-2xl shadow-lg shadow-[#E0525230] active:scale-[0.98] transition-all animate-pulse"
                >
                  ■ 멈춰!
                </button>
              )}
            </div>
          )}

          {phase === 'result' && result && (
            <div className="text-center py-4">
              <p className="text-6xl mb-3">{result.success ? '🎯' : '⏱️'}</p>
              <p className="text-2xl font-bold text-[#F5EDD4] mb-1" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                {elapsed.toFixed(2)}초
              </p>
              <p className="text-sm text-[#A89BC0] mb-4">
                목표 7.00초와 <span className="font-semibold text-[#C9962A]">{result.diff.toFixed(2)}초</span> 차이
              </p>
              <div
                className="rounded-2xl p-4 mb-2"
                style={{
                  backgroundColor: result.success ? '#C9962A18' : '#4BBF7E18',
                  border: `1px solid ${result.success ? '#C9962A45' : '#4BBF7E45'}`,
                }}
              >
                <p className="text-base font-bold" style={{ color: result.success ? '#C9962A' : '#4BBF7E' }}>
                  {result.success ? '🎉 정확히 맞췄어요! 대성공!' : '아깝네요! 참가 보상 지급'}
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: result.success ? '#C9962A' : '#4BBF7E' }}>
                  +{result.amount}P
                </p>
              </div>
              <p className="text-xs text-[#4A4060] mb-4">현재 보유 {points.balance.toLocaleString()}P</p>
              {played ? (
                <p className="text-sm font-semibold text-[#7B6F9A]">오늘 기회를 모두 사용했어요. 내일 다시 도전해보세요!</p>
              ) : (
                <button
                  onClick={handleRetry}
                  className="w-full py-4 bg-gradient-to-r from-[#C9962A] to-[#E8B84B] text-[#0D0A1A] font-bold rounded-2xl shadow-lg shadow-[#C9962A30] active:scale-[0.98] transition-all"
                >
                  ▶ 다시 도전하기 ({LUCKY_TIMER_MAX_ATTEMPTS - attempts}회 남음)
                </button>
              )}
            </div>
          )}
        </div>

        {/* 안내 */}
        <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-[#C9962A] rounded-full" />
            <h2 className="text-sm font-bold text-[#F5EDD4]">참여 방법</h2>
          </div>
          <ul className="space-y-1.5 text-sm text-[#A89BC0]">
            <li>1. '시작하기'를 누르면 타이머가 시작됩니다.</li>
            <li>2. 머릿속으로 7초를 세다가 '멈춰!'를 누르세요.</li>
            <li>3. 7.00초 ±0.10초 이내면 <span className="text-[#C9962A] font-semibold">+20P</span>, 아니면 <span className="text-[#4BBF7E] font-semibold">+5P</span> 지급됩니다.</li>
            <li>4. 하루에 최대 {LUCKY_TIMER_MAX_ATTEMPTS}번까지 참여할 수 있어요.</li>
          </ul>
        </div>

      </div>

      <div className="text-center pb-8 text-xs text-[#4A4060]">행운의 숫자 잡기 — 매일 자정 초기화</div>
    </div>
  )
}
