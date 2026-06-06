import { useState, useEffect, useRef } from 'react'
import type { UserInfo, BirthInput } from '../types'
import type { PointsState } from '../utils/points'
import { tryClaimDaily } from '../utils/points'
import PointsModal from './PointsModal'
import {
  IcSaju, IcSinnyeon, IcTojeong, IcTodayFortune,
  IcTomorrowFortune, IcDaun, IcGunghab, IcDeepSaju, IcGem, IcStamp,
} from './icons/SajuIcons'

interface Props {
  user: UserInfo
  birthProfile: BirthInput | null
  points: PointsState
  onPointsUpdate: (p: PointsState) => void
  onNavigate: (dest: 'saju' | 'sinnyeon' | 'tojeong' | 'today' | 'tomorrow' | 'daun' | 'gunghab' | 'deepsaju') => void
  onAttendance: () => void
  onEditProfile: () => void
  onLogout: () => void
}

const BANNERS = [
  {
    dest: 'sinnyeon' as const,
    tag: '신년운세',
    title: '미리보고 준비!\n2026 신년운세',
    sub: '얼른 복 잡아가세요!',
    bg: 'linear-gradient(135deg, #0D1A16 0%, #0A1520 100%)',
    accentColor: '#C9962A',
  },
  {
    dest: 'tojeong' as const,
    tag: '토정비결',
    title: '2026년 나의\n한 해 운세는?',
    sub: '이지함 선생의 전통 비결서',
    bg: 'linear-gradient(135deg, #13081C 0%, #190D2E 100%)',
    accentColor: '#C9962A',
  },
  {
    dest: 'gunghab' as const,
    tag: '궁합 보기',
    title: '나와 잘 맞는\n사람은 누구?',
    sub: '사주로 보는 두 사람의 궁합',
    bg: 'linear-gradient(135deg, #1C0A16 0%, #200E22 100%)',
    accentColor: '#C9962A',
  },
]

type MenuDest = 'sinnyeon' | 'tojeong' | 'saju' | 'today' | 'tomorrow' | 'daun' | 'gunghab' | 'deepsaju'

const MENU: { Icon: React.FC<{ size?: number; className?: string }>; label: string; dest: MenuDest; sub: string }[] = [
  { Icon: IcSinnyeon,       label: '신년운세',   dest: 'sinnyeon', sub: '2026 병오년' },
  { Icon: IcTojeong,        label: '토정비결',   dest: 'tojeong',  sub: '이지함 비결서' },
  { Icon: IcSaju,           label: '정통사주',   dest: 'saju',     sub: '사주팔자 분석' },
  { Icon: IcTodayFortune,   label: '오늘의 운세', dest: 'today',    sub: '오늘 일운 분석' },
  { Icon: IcTomorrowFortune,label: '내일의 운세', dest: 'tomorrow', sub: '내일 미리보기' },
  { Icon: IcDaun,           label: '대운 분석',  dest: 'daun',     sub: '10년 대운 흐름' },
  { Icon: IcGunghab,        label: '궁합 보기',  dest: 'gunghab',  sub: '사주 기반 궁합' },
  { Icon: IcDeepSaju,       label: '심층 해석',  dest: 'deepsaju', sub: '일간 심층 분석' },
]

export default function HomePage({ user, birthProfile, points, onPointsUpdate, onNavigate, onAttendance, onEditProfile, onLogout }: Props) {
  const todayDate = new Date()
  const month = todayDate.getMonth() + 1
  const day   = todayDate.getDate()

  const [showPoints, setShowPoints] = useState(false)
  const [dailyToast, setDailyToast] = useState(false)
  const [bannerIdx,  setBannerIdx]  = useState(0)
  const touchStartX = useRef<number | null>(null)

  // 연속 출석 스트릭 계산
  const streak = (() => {
    const dailyDates = new Set(
      points.history.filter(h => h.label === '매일 출석 보너스').map(h => h.date)
    )
    const todayStr = new Date().toISOString().slice(0, 10)
    let count = 0
    const d = new Date()
    // 오늘 체크했으면 오늘부터, 아니면 어제부터
    if (!dailyDates.has(todayStr)) d.setDate(d.getDate() - 1)
    while (dailyDates.has(d.toISOString().slice(0, 10))) {
      count++
      d.setDate(d.getDate() - 1)
    }
    return count
  })()

  useEffect(() => {
    const { next, claimed } = tryClaimDaily(points)
    if (claimed) {
      onPointsUpdate(next)
      setDailyToast(true)
      setTimeout(() => setDailyToast(false), 2800)
    }
  }, [])

  // 4초마다 자동 롤링
  useEffect(() => {
    const t = setInterval(() => setBannerIdx(p => (p + 1) % BANNERS.length), 4000)
    return () => clearInterval(t)
  }, [])

  function handleSwipeEnd(endX: number) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - endX
    if (diff > 40)       setBannerIdx(p => (p + 1) % BANNERS.length)
    else if (diff < -40) setBannerIdx(p => (p - 1 + BANNERS.length) % BANNERS.length)
    touchStartX.current = null
  }

  return (
    <div className="min-h-screen bg-[#0D0A1A]">

      {dailyToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#C9962A] text-[#0D0A1A] text-xs font-semibold px-5 py-2.5 rounded-full shadow-lg shadow-[#C9962A30] animate-bounce">
          🎉 출석 보너스 +10P 지급!
        </div>
      )}

      {showPoints && <PointsModal points={points} onClose={() => setShowPoints(false)} />}

      {/* 상단 바 */}
      <div className="bg-[#130E24] border-b border-[#2A1F4A] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>운명봄</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPoints(true)}
              className="flex items-center gap-1 bg-[#C9962A15] border border-[#C9962A30] px-3 py-1.5 rounded-full hover:bg-[#C9962A25] transition"
            >
              <IcGem size={14} className="text-[#C9962A]"/>
              <span className="text-xs font-bold text-[#C9962A]">{points.balance.toLocaleString()}P</span>
            </button>
            <button onClick={onLogout} className="text-xs text-[#A89BC0] hover:text-[#C4B8D8] transition px-2 py-1">
              로그아웃
            </button>
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

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">

        {/* ── 배너 캐러셀 ── */}
        <div>
          <div
            className="overflow-hidden rounded-3xl shadow-md select-none"
            onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
            onTouchEnd={e => handleSwipeEnd(e.changedTouches[0].clientX)}
            onMouseDown={e => { touchStartX.current = e.clientX }}
            onMouseUp={e => handleSwipeEnd(e.clientX)}
          >
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${bannerIdx * 100}%)` }}
            >
              {BANNERS.map(b => (
                <div
                  key={b.dest}
                  className="w-full shrink-0 relative cursor-pointer active:scale-[0.99] transition-transform overflow-hidden"
                  style={{ background: b.bg }}
                  onClick={() => onNavigate(b.dest)}
                >
                  {/* Background SVG decoration */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.08]" style={{ color: b.accentColor }}>
                    {b.dest === 'sinnyeon' && <IcSinnyeon size={90}/>}
                    {b.dest === 'tojeong'  && <IcTojeong  size={90}/>}
                    {b.dest === 'gunghab'  && <IcGunghab  size={90}/>}
                  </div>
                  <div className="p-5 pb-6 min-h-[120px]">
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#C9962A20] text-[#C9962A] border border-[#C9962A40] px-3 py-1 rounded-full mb-3">
                      {b.tag} ›
                    </span>
                    <p className="text-xl font-bold text-[#F5EDD4] leading-snug mb-1">
                      {b.title.split('\n').map((line, i, arr) => (
                        <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                      ))}
                    </p>
                    <p className="text-sm text-[#A89BC0]">{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 인디케이터 도트 */}
          <div className="flex justify-center gap-1.5 mt-2.5">
            {BANNERS.map((_, i) => (
              <button
                key={i}
                onClick={() => setBannerIdx(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === bannerIdx ? 'w-5 h-1.5 bg-[#C9962A]' : 'w-1.5 h-1.5 bg-[#2A1F4A]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 출석체크 배너 — 전통 도장 스타일 */}
        {(() => {
          const checked = points.lastDaily === new Date().toISOString().slice(0, 10)
          const TOTAL_DAYS = 7
          return (
            <button
              onClick={onAttendance}
              className="w-full overflow-hidden rounded-3xl shadow-[0_2px_16px_rgba(180,30,30,0.10)] active:scale-[0.99] transition-all"
            >
              <div className="relative bg-[#130E24] border border-red-900/40 rounded-3xl px-5 pt-4 pb-3">

                {/* 배경 장식 — 전통 문양 SVG */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-[0.06] select-none pointer-events-none text-red-800 rotate-12">
                  <IcStamp size={72}/>
                </div>
                <div className="absolute right-16 bottom-3 opacity-[0.04] select-none pointer-events-none text-red-700 -rotate-6">
                  <IcSinnyeon size={32}/>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  {/* 원형 도장 */}
                  <div className="relative shrink-0 w-[60px] h-[60px] flex items-center justify-center">
                    <div className={`absolute inset-0 rounded-full border-[3px] transition-all ${
                      checked ? 'border-red-300' : 'border-red-500'
                    }`} />
                    <div className="absolute inset-[5px] rounded-full border border-red-300 opacity-40" />
                    {checked ? (
                      <div className="flex flex-col items-center">
                        <span className="text-red-500 text-xl font-bold leading-none">✓</span>
                        <span className="text-[9px] text-red-400 font-bold mt-0.5">완료</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-[11px] font-bold text-red-600 leading-tight text-center" style={{ fontFamily: "'Noto Serif KR', serif" }}>출석<br/>도장</span>
                      </div>
                    )}
                  </div>

                  {/* 텍스트 */}
                  <div className="flex-1 text-left">
                    <p className="text-[10px] text-[#7B6F9A] mb-0.5 font-medium">출석체크하고</p>
                    <p className="text-base font-bold leading-tight" style={{ fontFamily: "'Noto Serif KR', serif", color: checked ? '#A89BC0' : '#F5EDD4' }}>
                      {checked ? '오늘 도장 찍었어요!' : '포인트 받아가세요!'}
                    </p>
                    <p className="text-[11px] text-[#7B6F9A] mt-0.5">
                      {checked
                        ? `${streak}일 연속 출석 중 · 누적 ${points.balance.toLocaleString()}P`
                        : `${streak > 0 ? `${streak}일 연속 출석 중 · ` : ''}매일 +10P 지급`}
                    </p>
                  </div>

                  {/* 우측 뱃지 */}
                  {!checked
                    ? <div className="shrink-0 w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-md shadow-red-900/30">
                        <span className="text-white text-[10px] font-bold leading-tight text-center">+10P</span>
                      </div>
                    : <span className="text-[11px] text-[#7B6F9A] font-medium shrink-0">내역 →</span>
                  }
                </div>

                {/* 7일 도장 스탬프 */}
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: TOTAL_DAYS }).map((_, i) => {
                    const filled = i < streak
                    const isToday = checked && i === streak - 1
                    return (
                      <div
                        key={i}
                        className={`flex-1 aspect-square rounded-full border-2 flex items-center justify-center transition-all ${
                          filled
                            ? isToday
                              ? 'border-red-500 bg-red-500 shadow-sm shadow-red-900/30'
                              : 'border-red-900/50 bg-red-900/30'
                            : 'border-[#2A1F4A] bg-[#1C1438]'
                        }`}
                      >
                        {filled && (
                          <span className={`text-[8px] font-bold ${isToday ? 'text-white' : 'text-red-400'}`}>
                            {i + 1}일
                          </span>
                        )}
                        {!filled && (
                          <span className="text-[8px] text-[#4A4060]">{i + 1}</span>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* 하단 라인 */}
                <div className="mt-2.5 pt-2 border-t border-red-900/30 flex items-center justify-between">
                  <span className="text-[10px] text-[#4A4060]">7일 연속 출석 시 특별 보너스 지급</span>
                  <span className="text-[10px] text-red-400 font-semibold">자세히 보기 →</span>
                </div>
              </div>
            </button>
          )
        })()}

        {/* 날짜 */}
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-[#7B6F9A]">{todayDate.getFullYear()}년 {month}월 {day}일</p>
          <button onClick={() => onNavigate('today')} className="text-xs text-[#C9962A] font-medium hover:text-[#E8B84B] transition">
            오늘의 운세 확인하기 →
          </button>
        </div>

        {/* 저장된 프로필 배지 */}
        {birthProfile && (
          <div className="flex items-center justify-between bg-[#C9962A15] border border-[#C9962A30] rounded-2xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[#C9962A] text-sm">✓</span>
              <p className="text-xs text-[#C4B8D8]">
                <span className="font-semibold">{birthProfile.year}.{String(birthProfile.month).padStart(2,'0')}.{String(birthProfile.day).padStart(2,'0')}</span>
                <span className="text-[#7B6F9A] ml-1">· {birthProfile.gender === 'male' ? '남성' : '여성'}</span>
                {birthProfile.hour !== null && <span className="text-[#7B6F9A] ml-1">· {birthProfile.hour}시</span>}
              </p>
            </div>
            <button onClick={onEditProfile} className="text-xs text-[#C9962A] font-semibold hover:text-[#E8B84B] transition">
              수정
            </button>
          </div>
        )}

        {/* 메뉴 그리드 */}
        <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-5">
          <p className="text-xs text-[#7B6F9A] mb-0.5">소름 돋는 미래 예측</p>
          <p className="text-base font-bold text-[#F5EDD4] mb-5" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            가장 정확한 사주 풀이
          </p>
          <div className="grid grid-cols-3 gap-4">
            {MENU.map(item => (
              <button key={item.label} onClick={() => onNavigate(item.dest)} className="flex flex-col items-center gap-2 group">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm bg-[#C9962A15] border border-[#C9962A30] group-active:scale-95 transition-transform">
                  <item.Icon size={28} className="text-[#C9962A]"/>
                </div>
                <div className="text-center">
                  <p className="text-xs text-[#C4B8D8] font-semibold leading-tight">{item.label}</p>
                  <p className="text-[10px] text-[#7B6F9A] leading-tight mt-0.5">{item.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CTA 카드 */}
        <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-5 shadow-xl shadow-[#000]/40 border border-[#C9962A25]">
          <p className="text-violet-300/70 text-xs mb-2">✨ {user.name}님을 위한 오늘의 한마디</p>
          <p className="text-white font-bold text-base mb-1" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            하늘의 기운이 당신 편입니다
          </p>
          <p className="text-violet-300/60 text-sm mb-4">오늘은 새로운 시작에 좋은 날입니다</p>
          <button
            onClick={() => onNavigate('saju')}
            className="w-full py-3 bg-[#C9962A20] border border-[#C9962A40] text-[#E8B84B] font-semibold rounded-2xl text-sm hover:bg-[#C9962A30] transition active:scale-[0.98]"
          >
            내 정통사주 확인하기 →
          </button>
        </div>

      </div>

      <div className="text-center pb-8 text-xs text-[#4A4060]">사주팔자 — 양력 기준 · 절기 근사값 적용</div>
    </div>
  )
}
