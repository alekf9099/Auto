import { useState, useEffect } from 'react'
import { loadPoints, tryClaimDaily } from '../utils/points'
import type { PointsState } from '../utils/points'
import PointsToast from './PointsToast'

interface Props {
  onBack: () => void
  onPointsUpdate: (p: PointsState) => void
}

const POINT_GUIDE = [
  { icon: '🎁', label: '가입 보너스',       amount: 100, desc: '처음 가입 시 1회 지급'          },
  { icon: '📅', label: '매일 출석 체크',     amount: 10,  desc: '하루 1회, 출석 체크 시 지급'   },
  { icon: '🔮', label: '오늘의 운세 확인',   amount: 5,   desc: '하루 1회, 운세 확인 후 지급'   },
  { icon: '⏰', label: '내일의 운세 확인',   amount: 5,   desc: '하루 1회, 내일 운세 확인 후'   },
  { icon: '🗓️', label: '신년운세 확인',      amount: 5,   desc: '하루 1회, 신년운세 확인 후'    },
  { icon: '📖', label: '토정비결 확인',      amount: 5,   desc: '하루 1회, 토정비결 확인 후'    },
  { icon: '☯',  label: '정통사주 확인',      amount: 5,   desc: '하루 1회, 사주 확인 후 지급'   },
  { icon: '📊', label: '대운 분석 확인',     amount: 5,   desc: '하루 1회, 대운 분석 후 지급'   },
]

const today = () => new Date().toISOString().slice(0, 10)

// 이번 주 날짜 배열
function getWeekDays() {
  const d = new Date()
  const day = d.getDay() // 0=일
  const mon = new Date(d); mon.setDate(d.getDate() - ((day + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(mon); dd.setDate(mon.getDate() + i)
    return {
      label: ['월','화','수','목','금','토','일'][i],
      date: dd.toISOString().slice(0, 10),
      isToday: dd.toISOString().slice(0, 10) === today(),
    }
  })
}

export default function AttendancePage({ onBack, onPointsUpdate }: Props) {
  const [points,    setPoints]    = useState<PointsState>(loadPoints)
  const [toast,     setToast]     = useState<{ amount: number; total: number } | null>(null)
  const checkedToday = points.lastDaily === today()
  const weekDays     = getWeekDays()

  // 체크된 날짜 set
  const checkedDates = new Set(points.history.filter(h => h.label.includes('출석')).map(h => h.date))

  function handleCheck() {
    if (checkedToday) return
    const { next, claimed } = tryClaimDaily(points)
    if (claimed) {
      setPoints(next)
      onPointsUpdate(next)
      setToast({ amount: 10, total: next.balance })
    }
  }

  useEffect(() => {
    setPoints(loadPoints())
  }, [])

  return (
    <div className="min-h-screen bg-[#F4F2FF]">
      {toast && <PointsToast amount={toast.amount} total={toast.total} onClose={() => setToast(null)} />}

      {/* 헤더 */}
      <div className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-stone-400 hover:text-stone-600 transition text-lg">←</button>
          <div>
            <h1 className="text-base font-bold text-stone-800" style={{ fontFamily: "'Noto Serif KR', serif" }}>출석 체크</h1>
            <p className="text-xs text-stone-400">매일 출석하고 포인트를 모으세요</p>
          </div>
          <div className="ml-auto flex items-center gap-1 bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-full">
            <span className="text-xs">💎</span>
            <span className="text-xs font-bold text-violet-600">{points.balance.toLocaleString()}P</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* 이번 주 출석 캘린더 */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_16px_rgba(124,58,237,0.07)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-violet-500 rounded-full" />
            <h2 className="text-sm font-bold text-stone-800">이번 주 출석 현황</h2>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(w => {
              const checked = checkedDates.has(w.date)
              return (
                <div key={w.date} className="flex flex-col items-center gap-1.5">
                  <p className={`text-[10px] font-semibold ${w.label === '토' ? 'text-blue-400' : w.label === '일' ? 'text-red-400' : 'text-stone-400'}`}>{w.label}</p>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all ${
                    checked
                      ? 'bg-violet-500 shadow-md shadow-violet-200'
                      : w.isToday
                      ? 'border-2 border-violet-400 border-dashed'
                      : 'bg-stone-100'
                  }`}>
                    {checked ? <span className="text-white text-base">✓</span> : <span className="text-stone-300 text-xs">{new Date(w.date + 'T12:00:00').getDate()}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 출석 체크 버튼 */}
        <button
          onClick={handleCheck}
          disabled={checkedToday}
          className={`w-full py-5 rounded-3xl font-bold text-base transition-all active:scale-[0.98] ${
            checkedToday
              ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-200 hover:from-violet-500 hover:to-purple-500'
          }`}
        >
          {checkedToday ? '✓ 오늘 출석 완료 (+10P 지급됨)' : '📅 오늘 출석 체크하기 +10P'}
        </button>

        {/* 포인트 안내 */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_16px_rgba(124,58,237,0.07)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-violet-500 rounded-full" />
            <h2 className="text-sm font-bold text-stone-800">포인트 적립 안내</h2>
          </div>
          <div className="space-y-2">
            {POINT_GUIDE.map(g => (
              <div key={g.label} className="flex items-center gap-3 px-3 py-2.5 bg-stone-50 rounded-2xl">
                <span className="text-lg shrink-0">{g.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-stone-700">{g.label}</p>
                  <p className="text-[11px] text-stone-400">{g.desc}</p>
                </div>
                <span className="text-sm font-bold text-violet-600 shrink-0">+{g.amount}P</span>
              </div>
            ))}
          </div>
        </div>

        {/* 포인트 내역 */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_16px_rgba(124,58,237,0.07)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-violet-500 rounded-full" />
            <h2 className="text-sm font-bold text-stone-800">포인트 내역</h2>
            <span className="ml-auto text-xs text-stone-400">{points.balance.toLocaleString()}P 보유</span>
          </div>
          {points.history.length === 0 ? (
            <p className="text-center text-xs text-stone-400 py-6">아직 내역이 없습니다</p>
          ) : (
            <div className="space-y-2">
              {points.history.slice(0, 20).map((h, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2.5 bg-stone-50 rounded-2xl">
                  <div>
                    <p className="text-xs font-medium text-stone-700">{h.label}</p>
                    <p className="text-[11px] text-stone-400">{h.date}</p>
                  </div>
                  <span className="text-sm font-bold text-violet-600">+{h.amount}P</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
      <div className="text-center pb-8 text-xs text-stone-300">운명봄 포인트는 서비스 내 전용 포인트입니다</div>
    </div>
  )
}
