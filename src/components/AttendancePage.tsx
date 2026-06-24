import { useState, useEffect } from 'react'
import { loadPoints, tryClaimDaily } from '../utils/points'
import type { PointsState } from '../utils/points'
import { trackEvent } from '../utils/analytics'
import PointsToast from './PointsToast'
import {
  IcGem, IcStamp, IcGift, IcLucky,
  IcTodayFortune, IcTomorrowFortune, IcSinnyeon, IcTojeong, IcSaju, IcDaun,
} from './icons/SajuIcons'

interface Props {
  onBack: () => void
  onPointsUpdate: (p: PointsState) => void
}

const POINT_GUIDE = [
  { icon: IcGift,           label: '가입 보너스',       amount: 100, color: '#9A6A12' },
  { icon: IcStamp,          label: '매일 출석 체크',     amount: 10,  color: '#4BBF7E' },
  { icon: IcLucky,          label: '행운의 숫자 잡기 (성공)', amount: 20,  color: '#F0B429' },
  { icon: IcLucky,          label: '행운의 숫자 잡기 (참가)', amount: 5,   color: '#E8A33D' },
  { icon: IcTodayFortune,   label: '오늘의 운세',        amount: 5,   color: '#E8A33D' },
  { icon: IcTomorrowFortune, label: '내일의 운세',       amount: 5,   color: '#FB923C' },
  { icon: IcSinnyeon,       label: '신년운세',          amount: 5,   color: '#60A5FA' },
  { icon: IcTojeong,        label: '토정비결',           amount: 5,   color: '#E05282' },
  { icon: IcSaju,           label: '정통사주',           amount: 5,   color: '#A78BFA' },
  { icon: IcDaun,           label: '대운 분석',          amount: 5,   color: '#22D3EE' },
]

const todayStr = () => new Date().toISOString().slice(0, 10)

function getWeekDays() {
  const d = new Date()
  const day = d.getDay()
  const mon = new Date(d); mon.setDate(d.getDate() - ((day + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(mon); dd.setDate(mon.getDate() + i)
    return {
      label: ['월','화','수','목','금','토','일'][i],
      date: dd.toISOString().slice(0, 10),
      isToday: dd.toISOString().slice(0, 10) === todayStr(),
      isSat: i === 5,
      isSun: i === 6,
    }
  })
}

export default function AttendancePage({ onBack, onPointsUpdate }: Props) {
  const [points,    setPoints]    = useState<PointsState>(loadPoints)
  const [toast,     setToast]     = useState<{ amount: number; total: number; label?: string } | null>(null)

  useEffect(() => { setPoints(loadPoints()) }, [])

  const checkedToday = points.lastDaily === todayStr()
  const weekDays     = getWeekDays()
  const checkedDates = new Set(points.history.filter(h => h.label.includes('출석')).map(h => h.date))

  // 연속 출석 스트릭 계산
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 60; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i)
    if (checkedDates.has(d.toISOString().slice(0, 10))) streak++
    else break
  }

  function handleCheck() {
    if (checkedToday) return
    const { next, claimed, milestone } = tryClaimDaily(points)
    if (claimed) {
      setPoints(next)
      onPointsUpdate(next)
      trackEvent('daily_checkin')
      if (milestone) {
        setToast({ amount: 10 + milestone.bonus, total: next.balance, label: `🎉 ${milestone.days}일 연속 출석 달성!` })
      } else {
        setToast({ amount: 10, total: next.balance })
      }
    }
  }

  return (
    <div className="min-h-screen">
      {toast && <PointsToast amount={toast.amount} total={toast.total} label={toast.label} onClose={() => setToast(null)} />}

      {/* 헤더 */}
      <div className="bg-[#FBF4E2] border-b border-[#D8C290] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} aria-label="뒤로 가기" className="text-[#9A8155] hover:text-[#5C4A2E] transition text-lg">←</button>
          <div>
            <h1 className="text-base font-bold text-[#3B2A16]" style={{ fontFamily: "'Gowun Batang', serif" }}>출석 체크</h1>
            <p className="text-xs text-[#9A8155]">매일 출석하고 포인트를 모으세요</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* 히어로 배너 */}
        <div className="bg-gradient-to-br from-[#FBF4E2] via-[#F3E7C8] to-[#EAD9B0] rounded-3xl p-6 shadow-xl shadow-[#000]/40 border border-[#9A6A1225] relative overflow-hidden">
          {/* 배경 장식 */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-violet-500/10 -translate-y-10 translate-x-10" />
          <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-purple-400/10 translate-y-8 -translate-x-6" />
          <div className="absolute right-4 bottom-2 opacity-[0.08] select-none pointer-events-none text-[#C8442E] rotate-6" style={{ filter: 'drop-shadow(0 0 14px rgba(200,68,46,0.6))' }}>
            <IcStamp size={88}/>
          </div>

          <div className="relative z-10">
            <p className="text-[#9A8155] text-xs mb-4">운명봄 포인트</p>
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="text-[#9A8155]/60 text-xs mb-1">현재 보유</p>
                <p className="text-4xl font-bold text-white" style={{ fontFamily: "'Gowun Batang', serif" }}>
                  {points.balance.toLocaleString()}
                  <span className="text-xl text-[#9A8155] ml-1">P</span>
                </p>
              </div>
              <div className="text-right">
                <div
                  className="relative inline-flex flex-col items-center justify-center w-16 h-16 rounded-full"
                  style={{ backgroundColor: 'rgba(200,68,46,0.12)', boxShadow: '0 0 16px rgba(200,68,46,0.45)' }}
                >
                  <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: '#C8442E' }} />
                  <div className="absolute inset-[3px] rounded-full border" style={{ borderColor: 'rgba(200,68,46,0.5)' }} />
                  <span className="relative text-xl font-bold" style={{ color: '#E8694A' }}>{streak}</span>
                  <span className="relative text-[9px] -mt-0.5" style={{ color: 'rgba(232,105,74,0.8)' }}>연속 출석</span>
                </div>
              </div>
            </div>

            {/* 출석 체크 버튼 */}
            <button
              onClick={handleCheck}
              disabled={checkedToday}
              className={`w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] ${
                checkedToday
                  ? 'bg-white/10 text-[#9A8155] border border-violet-400/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-400 to-orange-400 text-stone-900 shadow-lg shadow-amber-900/30 hover:from-amber-300 hover:to-orange-300'
              }`}
            >
              {checkedToday ? '✓ 오늘 출석 완료 — +10P 적립됨' : '📅 출석 체크하고 +10P 받기'}
            </button>
          </div>
        </div>

        {/* 이번 주 캘린더 */}
        <div className="bg-[#FBF4E2] rounded-3xl border border-[#D8C290] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 bg-[#9A6A12] rounded-full" />
            <h2 className="text-sm font-bold text-[#3B2A16]">이번 주 출석 현황</h2>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {weekDays.map(w => {
              const checked = checkedDates.has(w.date)
              const dayNum  = new Date(w.date + 'T12:00:00').getDate()
              return (
                <div key={w.date} className="flex flex-col items-center gap-2">
                  <p className={`text-[11px] font-bold ${
                    w.isSat ? 'text-blue-400' : w.isSun ? 'text-rose-400' : 'text-stone-400'
                  }`}>{w.label}</p>
                  <div
                    className={`relative w-10 h-10 rounded-full flex flex-col items-center justify-center transition-all ${
                      checked
                        ? 'bg-gradient-to-br from-[#F0D27A] via-[#D9A93C] to-[#9A6A12]'
                        : w.isToday
                        ? 'border-2 border-dashed border-[#9A6A12] bg-[#9A6A1210]'
                        : 'bg-[#E9DAB8] border border-[#D8C290]'
                    }`}
                    style={checked ? { boxShadow: w.isToday ? '0 0 12px rgba(200,68,46,0.55)' : '0 0 8px rgba(201,150,42,0.4)' } : undefined}
                  >
                    {checked && (
                      <>
                        <div
                          className="absolute inset-0 rounded-full border-2"
                          style={{ borderColor: w.isToday ? '#C8442E' : '#9A6A12' }}
                        />
                        <div className="absolute inset-[3px] rounded-full border border-[#B5841C]/70" />
                      </>
                    )}
                    {checked
                      ? <IcGem size={16} className="relative text-[#2A1606]"/>
                      : <span className={`text-xs font-semibold ${w.isToday ? 'text-[#9A6A12]' : 'text-[#A89167]'}`}>{dayNum}</span>
                    }
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-[#D8C290] flex items-center gap-4 text-[11px] text-[#9A8155]">
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#9A6A12] to-[#9A6A12] inline-block" />
              출석 완료
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-dashed border-[#9A6A12] bg-[#9A6A1210] inline-block" />
              오늘
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#E3D0A4] inline-block" />
              미출석
            </span>
          </div>
        </div>

        {/* 포인트 적립 안내 */}
        <div className="bg-[#FBF4E2] rounded-3xl border border-[#D8C290] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-[#9A6A12] rounded-full" />
            <h2 className="text-sm font-bold text-[#3B2A16]">포인트 적립 방법</h2>
          </div>
          <div className="space-y-2">
            {POINT_GUIDE.map(g => (
              <div key={g.label} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#E9DAB8] border border-[#D8C290]">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: g.color + '20', border: `1px solid ${g.color}40`, color: g.color }}
                >
                  <g.icon size={18} />
                </div>
                <p className="flex-1 text-sm font-semibold text-[#4A3820]">{g.label}</p>
                <span className="text-sm font-bold shrink-0" style={{ color: g.color }}>+{g.amount}P</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#9A8155] text-center mt-3">하루 1회 · 매일 자정 초기화</p>
        </div>

        {/* 포인트 내역 */}
        <div className="bg-[#FBF4E2] rounded-3xl border border-[#D8C290] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-[#9A6A12] rounded-full" />
            <h2 className="text-sm font-bold text-[#3B2A16]">적립 내역</h2>
            <span className="ml-auto text-xs font-bold text-[#9A6A12]">{points.balance.toLocaleString()}P 보유</span>
          </div>
          {points.history.length === 0 ? (
            <div className="text-center py-8">
              <IcGem size={32} className="text-[#A89167] mx-auto mb-2"/>
              <p className="text-sm text-[#9A8155]">아직 적립 내역이 없어요</p>
              <p className="text-xs text-[#A89167] mt-1">출석 체크부터 시작해보세요!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {[...points.history].reverse().slice(0, 20).map((h, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 bg-[#E9DAB8] rounded-2xl">
                  <div>
                    <p className="text-xs font-semibold text-[#4A3820]">{h.label}</p>
                    <p className="text-[11px] text-[#9A8155] mt-0.5">{h.date}</p>
                  </div>
                  <span className="text-sm font-bold text-[#9A6A12]">+{h.amount}P</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <div className="text-center pb-8 text-xs text-[#A89167]">운명봄 포인트는 서비스 내 전용 포인트입니다</div>
    </div>
  )
}
