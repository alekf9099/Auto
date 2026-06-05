import { useState } from 'react'
import type { BirthInput, Gender } from '../types'

interface Props {
  onSubmit: (input: BirthInput) => void
}

export default function BirthForm({ onSubmit }: Props) {
  const [year,   setYear]   = useState('')
  const [month,  setMonth]  = useState('')
  const [day,    setDay]    = useState('')
  const [hour,   setHour]   = useState('')
  const [minute, setMinute] = useState('')
  const [gender, setGender] = useState<Gender>('male')
  const [unknownHour, setUnknownHour] = useState(false)
  const [error,  setError]  = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const y = parseInt(year)
    const m = parseInt(month)
    const d = parseInt(day)

    if (!y || y < 1900 || y > 2100) { setError('올바른 연도를 입력해주세요 (1900~2100)'); return }
    if (!m || m < 1 || m > 12)       { setError('올바른 월을 입력해주세요 (1~12)'); return }
    if (!d || d < 1 || d > 31)       { setError('올바른 일을 입력해주세요 (1~31)'); return }

    let h: number | null = null
    let min: number | null = null
    if (!unknownHour) {
      h = parseInt(hour)
      if (isNaN(h) || h < 0 || h > 23) { setError('올바른 시간을 입력해주세요 (0~23)'); return }
      if (minute.trim() !== '') {
        min = parseInt(minute)
        if (isNaN(min) || min < 0 || min > 59) { setError('올바른 분을 입력해주세요 (0~59)'); return }
      }
    }

    setError('')
    onSubmit({ year: y, month: m, day: d, hour: h, minute: min, gender })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">☯</div>
          <h1 className="text-4xl font-bold text-stone-800 font-korean mb-2">사주팔자</h1>
          <p className="text-stone-500 text-lg">四柱八字 — 운명의 네 기둥</p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-amber-100">
          <h2 className="text-xl font-semibold text-stone-700 mb-6 font-korean">생년월일시 입력</h2>

          {/* Date fields */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-sm text-stone-500 mb-1">년 (年)</label>
              <input
                type="number" placeholder="1990" value={year}
                onChange={e => setYear(e.target.value)}
                className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-center text-stone-700 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-stone-500 mb-1">월 (月)</label>
              <input
                type="number" placeholder="1" min="1" max="12" value={month}
                onChange={e => setMonth(e.target.value)}
                className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-center text-stone-700 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-stone-500 mb-1">일 (日)</label>
              <input
                type="number" placeholder="1" min="1" max="31" value={day}
                onChange={e => setDay(e.target.value)}
                className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-center text-stone-700 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
              />
            </div>
          </div>

          {/* Hour + Minute fields */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm text-stone-500">시 · 분 — 태어난 시각 (24h)</label>
              <label className="flex items-center gap-1.5 text-sm text-stone-400 cursor-pointer">
                <input
                  type="checkbox" checked={unknownHour}
                  onChange={e => setUnknownHour(e.target.checked)}
                  className="rounded"
                />
                모름
              </label>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="number" placeholder="14 (시)" min="0" max="23" value={hour}
                  disabled={unknownHour}
                  onChange={e => setHour(e.target.value)}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-center text-stone-700 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition disabled:bg-stone-50 disabled:text-stone-300"
                />
              </div>
              <div className="flex-1">
                <input
                  type="number" placeholder="30 (분, 선택)" min="0" max="59" value={minute}
                  disabled={unknownHour}
                  onChange={e => setMinute(e.target.value)}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-center text-stone-700 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition disabled:bg-stone-50 disabled:text-stone-300"
                />
              </div>
            </div>
            {!unknownHour && (
              <p className="text-xs text-stone-400 mt-1">시: 오전2시→2, 오후3시→15, 자정→0 · 분: 입력 시 분주(分柱) 계산</p>
            )}
          </div>

          {/* Gender */}
          <div className="mb-6">
            <label className="block text-sm text-stone-500 mb-2">성별 (性別)</label>
            <div className="grid grid-cols-2 gap-3">
              {(['male', 'female'] as Gender[]).map(g => (
                <button
                  key={g} type="button"
                  onClick={() => setGender(g)}
                  className={`py-2.5 rounded-xl font-medium transition text-sm ${
                    gender === g
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-stone-50 text-stone-500 border border-stone-200 hover:border-amber-300'
                  }`}
                >
                  {g === 'male' ? '♂ 남성' : '♀ 여성'}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4 bg-red-50 px-4 py-2 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-md hover:from-amber-600 hover:to-orange-600 transition-all duration-200 text-lg"
          >
            사주 보기 →
          </button>
        </form>

        <p className="text-center text-xs text-stone-400 mt-6">
          양력 기준 · 절기(節氣) 근사값 적용 · 참고용으로만 활용하세요
        </p>
      </div>
    </div>
  )
}
