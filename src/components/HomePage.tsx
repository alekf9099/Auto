import { useState, useEffect } from 'react'
import type { UserInfo, BirthInput } from '../types'
import type { PointsState } from '../utils/points'
import { tryClaimDaily } from '../utils/points'
import PointsModal from './PointsModal'

interface Props {
  user: UserInfo
  birthProfile: BirthInput | null
  points: PointsState
  onPointsUpdate: (p: PointsState) => void
  onNavigate: (dest: 'saju' | 'sinnyeon' | 'tojeong' | 'today' | 'tomorrow' | 'daun') => void
  onAttendance: () => void
  onEditProfile: () => void
  onLogout: () => void
}

const MENU = [
  { icon: '🗓️', label: '신년운세',   dest: 'sinnyeon'  as const, sub: '2026 병오년' },
  { icon: '📖', label: '토정비결',   dest: 'tojeong'   as const, sub: '이지함 비결서' },
  { icon: '☯',  label: '정통사주',   dest: 'saju'      as const, sub: '사주팔자 분석' },
  { icon: '🔮', label: '오늘의 운세', dest: 'today'     as const, sub: '오늘 일운 분석' },
  { icon: '⏰', label: '내일의 운세', dest: 'tomorrow'  as const, sub: '내일 미리보기' },
  { icon: '📊', label: '대운 분석',  dest: 'daun'      as const, sub: '10년 대운 흐름' },
]

export default function HomePage({ user, birthProfile, points, onPointsUpdate, onNavigate, onAttendance, onEditProfile, onLogout }: Props) {
  const today = new Date()
  const month = today.getMonth() + 1
  const day   = today.getDate()

  const [showPoints,  setShowPoints]  = useState(false)
  const [dailyToast,  setDailyToast]  = useState(false)

  // 매일 출석 보너스 자동 지급
  useEffect(() => {
    const { next, claimed } = tryClaimDaily(points)
    if (claimed) {
      onPointsUpdate(next)
      setDailyToast(true)
      setTimeout(() => setDailyToast(false), 2800)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#F4F2FF]">

      {/* 매일 출석 토스트 */}
      {dailyToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-violet-600 text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-lg shadow-violet-300 animate-bounce">
          🎉 출석 보너스 +10P 지급!
        </div>
      )}

      {/* 포인트 모달 */}
      {showPoints && (
        <PointsModal points={points} onClose={() => setShowPoints(false)} />
      )}

      {/* 상단 바 */}
      <div className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-stone-800" style={{ fontFamily: "'Noto Serif KR', serif" }}>운명봄</h1>
          <div className="flex items-center gap-2">
            {/* 포인트 배지 */}
            <button
              onClick={() => setShowPoints(true)}
              className="flex items-center gap-1 bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-full hover:bg-violet-100 transition"
            >
              <span className="text-xs">💎</span>
              <span className="text-xs font-bold text-violet-600">{points.balance.toLocaleString()}P</span>
            </button>
            <button
              onClick={onLogout}
              className="text-xs text-stone-400 hover:text-stone-600 transition px-2 py-1"
            >
              로그아웃
            </button>
            <div className="flex items-center gap-2">
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{user.name[0]}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">

        {/* 배너 카드 */}
        <div
          className="rounded-3xl overflow-hidden relative cursor-pointer active:scale-[0.99] transition-transform"
          style={{ background: 'linear-gradient(135deg, #e8f4f0 0%, #ddeef8 100%)' }}
          onClick={() => onNavigate('sinnyeon')}
        >
          <div className="p-5 pb-6">
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-stone-800 text-white px-3 py-1 rounded-full mb-3">
              신년운세 ›
            </span>
            <p className="text-xl font-bold text-stone-800 leading-snug mb-1">
              미리보고 준비!<br />2026 신년운세
            </p>
            <p className="text-sm text-stone-500">얼른 복 잡아가세요!</p>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 select-none pointer-events-none">🏯</div>
          <div className="absolute right-10 top-4 text-2xl opacity-30 select-none pointer-events-none">🕊️</div>
        </div>

        {/* 출석체크 배너 */}
        {(() => {
          const checked = points.lastDaily === new Date().toISOString().slice(0,10)
          return (
            <button
              onClick={onAttendance}
              className="w-full flex items-center justify-between px-5 py-4 rounded-3xl border transition-all active:scale-[0.99]"
              style={{ background: checked ? '#F5F3FF' : 'linear-gradient(135deg,#EDE9FE,#DDD6FE)', borderColor: '#C4B5FD' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{checked ? '✅' : '📅'}</span>
                <div className="text-left">
                  <p className="text-sm font-bold text-violet-700">{checked ? '오늘 출석 완료!' : '출석 체크하고 +10P 받기'}</p>
                  <p className="text-xs text-violet-400">{checked ? `현재 ${points.balance.toLocaleString()}P 보유` : '매일 출석하면 포인트를 드려요'}</p>
                </div>
              </div>
              <span className="text-violet-400 text-sm">→</span>
            </button>
          )
        })()}

        {/* 날짜 */}
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-stone-400">{today.getFullYear()}년 {month}월 {day}일</p>
          <button
            onClick={() => onNavigate('today')}
            className="text-xs text-violet-500 font-medium hover:text-violet-700 transition"
          >
            오늘의 운세 확인하기 →
          </button>
        </div>

        {/* 저장된 프로필 배지 */}
        {birthProfile && (
          <div className="flex items-center justify-between bg-violet-50 border border-violet-100 rounded-2xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-violet-500 text-sm">✓</span>
              <p className="text-xs text-stone-600">
                <span className="font-semibold">{birthProfile.year}.{String(birthProfile.month).padStart(2,'0')}.{String(birthProfile.day).padStart(2,'0')}</span>
                <span className="text-stone-400 ml-1">· {birthProfile.gender === 'male' ? '남성' : '여성'}</span>
                {birthProfile.hour !== null && <span className="text-stone-400 ml-1">· {birthProfile.hour}시</span>}
              </p>
            </div>
            <button
              onClick={onEditProfile}
              className="text-xs text-violet-500 font-semibold hover:text-violet-700 transition"
            >
              수정
            </button>
          </div>
        )}

        {/* 메뉴 그리드 */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_16px_rgba(124,58,237,0.07)] p-5">
          <p className="text-xs text-stone-400 mb-0.5">소름 돋는 미래 예측</p>
          <p className="text-base font-bold text-stone-800 mb-5" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            가장 정확한 사주 풀이
          </p>
          <div className="grid grid-cols-3 gap-4">
            {MENU.map(item => (
              <button
                key={item.label}
                onClick={() => onNavigate(item.dest)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm bg-gradient-to-br from-violet-50 to-purple-100 border border-violet-100 group-active:scale-95 transition-transform">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div className="text-center">
                  <p className="text-xs text-stone-700 font-semibold leading-tight">{item.label}</p>
                  <p className="text-[10px] text-stone-400 leading-tight mt-0.5">{item.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CTA 카드 */}
        <div className="bg-gradient-to-br from-[#1E1152] via-[#2D1B69] to-[#160F3E] rounded-3xl p-5 shadow-xl shadow-violet-900/20">
          <p className="text-violet-300/70 text-xs mb-2">✨ {user.name}님을 위한 오늘의 한마디</p>
          <p className="text-white font-bold text-base mb-1" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            하늘의 기운이 당신 편입니다
          </p>
          <p className="text-violet-300/60 text-sm mb-4">오늘은 새로운 시작에 좋은 날입니다</p>
          <button
            onClick={() => onNavigate('saju')}
            className="w-full py-3 bg-white/15 border border-white/20 text-white font-semibold rounded-2xl text-sm hover:bg-white/20 transition active:scale-[0.98]"
          >
            내 정통사주 확인하기 →
          </button>
        </div>

      </div>

      <div className="text-center pb-8 text-xs text-stone-300">사주팔자 — 양력 기준 · 절기 근사값 적용</div>
    </div>
  )
}
