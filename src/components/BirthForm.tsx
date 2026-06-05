import { useState } from 'react'
import type { BirthInput, Gender } from '../types'

interface Props {
  onSubmit: (input: BirthInput) => void
}

const inputCls = `
  w-full px-3 py-3 rounded-xl text-center text-stone-800 placeholder-stone-300
  bg-stone-50 border border-stone-200
  focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100
  transition text-sm font-medium
`.trim()

export default function BirthForm({ onSubmit }: Props) {
  const [year,        setYear]        = useState('')
  const [month,       setMonth]       = useState('')
  const [day,         setDay]         = useState('')
  const [hour,        setHour]        = useState('')
  const [minute,      setMinute]      = useState('')
  const [gender,      setGender]      = useState<Gender>('male')
  const [unknownHour, setUnknownHour] = useState(false)
  const [error,       setError]       = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const y = parseInt(year), m = parseInt(month), d = parseInt(day)
    if (!y || y < 1900 || y > 2100) { setError('연도를 확인해주세요 (1900~2100)'); return }
    if (!m || m < 1   || m > 12)   { setError('월을 확인해주세요 (1~12)');         return }
    if (!d || d < 1   || d > 31)   { setError('일을 확인해주세요 (1~31)');         return }

    let h: number | null = null
    let min: number | null = null
    if (!unknownHour) {
      h = parseInt(hour)
      if (isNaN(h) || h < 0 || h > 23) { setError('시간을 확인해주세요 (0~23)'); return }
      if (minute.trim() !== '') {
        min = parseInt(minute)
        if (isNaN(min) || min < 0 || min > 59) { setError('분을 확인해주세요 (0~59)'); return }
      }
    }
    setError('')
    onSubmit({ year: y, month: m, day: d, hour: h, minute: min, gender })
  }

  return (
    <div className="min-h-screen bg-[#F4F2FF] flex flex-col items-center justify-center p-4">

      {/* 헤더 영역 */}
      <div className="w-full max-w-sm mb-6 text-center">
        {/* 아이콘 */}
        <div className="relative inline-flex items-center justify-center mb-5">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-xl shadow-violet-200">
            <span className="text-4xl text-white select-none" style={{ fontFamily: "'Noto Serif KR', serif" }}>☯</span>
          </div>
          <div className="absolute -inset-1 rounded-3xl bg-violet-400/20 blur-lg -z-10" />
        </div>
        <h1
          className="text-3xl font-bold text-stone-900 mb-1"
          style={{ fontFamily: "'Noto Serif KR', serif" }}
        >
          사주팔자
        </h1>
        <p className="text-stone-400 text-sm">내 운명의 네 기둥을 확인하세요</p>
      </div>

      {/* 입력 카드 */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-3xl shadow-[0_4px_24px_rgba(124,58,237,0.10)] border border-violet-100 p-6"
      >
        <p className="text-xs font-semibold text-violet-500 mb-4 uppercase tracking-wider">생년월일 입력</p>

        {/* 년 월 일 */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: '년 (年)', ph: '1990', val: year,  set: setYear  },
            { label: '월 (月)', ph: '1',    val: month, set: setMonth },
            { label: '일 (日)', ph: '1',    val: day,   set: setDay   },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs text-stone-400 mb-1.5 font-medium">{f.label}</label>
              <input
                type="number" placeholder={f.ph} value={f.val}
                onChange={e => f.set(e.target.value)}
                className={inputCls}
              />
            </div>
          ))}
        </div>

        {/* 시 · 분 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-stone-400 font-medium">시 · 분 (24h)</label>
            <label className="flex items-center gap-1.5 text-xs text-stone-400 cursor-pointer select-none">
              <input
                type="checkbox" checked={unknownHour}
                onChange={e => setUnknownHour(e.target.checked)}
                className="accent-violet-500 rounded"
              />
              모름
            </label>
          </div>
          <div className="flex gap-2">
            <input
              type="number" placeholder="14 시" min="0" max="23" value={hour}
              disabled={unknownHour}
              onChange={e => setHour(e.target.value)}
              className={`${inputCls} flex-1 disabled:opacity-40`}
            />
            <input
              type="number" placeholder="30 분" min="0" max="59" value={minute}
              disabled={unknownHour}
              onChange={e => setMinute(e.target.value)}
              className={`${inputCls} flex-1 disabled:opacity-40`}
            />
          </div>
          {!unknownHour && (
            <p className="text-[11px] text-stone-300 mt-1.5 text-center">
              분 입력 시 분주(分柱)까지 계산됩니다
            </p>
          )}
        </div>

        {/* 성별 */}
        <div className="mb-6">
          <label className="block text-xs text-stone-400 mb-1.5 font-medium">성별 (性別)</label>
          <div className="grid grid-cols-2 gap-2">
            {(['male', 'female'] as Gender[]).map(g => (
              <button
                key={g} type="button"
                onClick={() => setGender(g)}
                className={`py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  gender === g
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                    : 'bg-stone-50 text-stone-500 border border-stone-200 hover:border-violet-200'
                }`}
              >
                {g === 'male' ? '♂ 남성' : '♀ 여성'}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-xs mb-4 bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl text-center">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl font-bold text-white text-base
            bg-gradient-to-r from-violet-600 to-purple-600
            hover:from-violet-500 hover:to-purple-500
            shadow-lg shadow-violet-200 hover:shadow-violet-300
            transition-all active:scale-[0.98]"
        >
          사주 보기 →
        </button>
      </form>

      <p className="text-center text-xs text-stone-300 mt-5">
        양력 기준 · 절기 근사값 · 참고용으로만 활용하세요
      </p>
    </div>
  )
}
