import { useState } from 'react'
import type { BirthInput, Gender } from '../types'

interface Props {
  onSubmit: (input: BirthInput) => void
}

const inputCls = `
  w-full px-3 py-3 rounded-xl text-center text-white placeholder-zinc-600
  bg-white/[0.07] border border-white/[0.1]
  focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10
  transition text-sm
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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 배경 글로우 */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-violet-600/8 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center mb-5">
            <span className="text-8xl select-none" style={{ fontFamily: "'Noto Serif KR', serif" }}>☯</span>
            <span className="absolute text-8xl text-amber-400 blur-2xl opacity-30 select-none">☯</span>
          </div>
          <h1
            className="text-4xl font-bold text-white tracking-wider mb-2"
            style={{ fontFamily: "'Noto Serif KR', serif" }}
          >
            사주팔자
          </h1>
          <p className="text-zinc-500 text-xs tracking-[0.3em] uppercase">四 柱 八 字</p>
        </div>

        {/* 카드 */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl"
        >
          <h2
            className="text-base font-semibold text-zinc-300 mb-5"
            style={{ fontFamily: "'Noto Serif KR', serif" }}
          >
            생년월일 · 시각 입력
          </h2>

          {/* 년 월 일 */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: '년 (年)', ph: '1990',  val: year,  set: setYear,  min: undefined, max: undefined },
              { label: '월 (月)', ph: '1',     val: month, set: setMonth, min: '1',       max: '12'      },
              { label: '일 (日)', ph: '1',     val: day,   set: setDay,   min: '1',       max: '31'      },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs text-zinc-500 mb-1.5">{f.label}</label>
                <input
                  type="number" placeholder={f.ph} value={f.val}
                  min={f.min} max={f.max}
                  onChange={e => f.set(e.target.value)}
                  className={inputCls}
                />
              </div>
            ))}
          </div>

          {/* 시 · 분 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-zinc-500">시 · 분 (24h)</label>
              <label className="flex items-center gap-1.5 text-xs text-zinc-500 cursor-pointer select-none">
                <input
                  type="checkbox" checked={unknownHour}
                  onChange={e => setUnknownHour(e.target.checked)}
                  className="accent-amber-500 rounded"
                />
                모름
              </label>
            </div>
            <div className="flex gap-2">
              <input
                type="number" placeholder="14 시" min="0" max="23" value={hour}
                disabled={unknownHour}
                onChange={e => setHour(e.target.value)}
                className={`${inputCls} flex-1 disabled:opacity-30`}
              />
              <input
                type="number" placeholder="30 분" min="0" max="59" value={minute}
                disabled={unknownHour}
                onChange={e => setMinute(e.target.value)}
                className={`${inputCls} flex-1 disabled:opacity-30`}
              />
            </div>
            {!unknownHour && (
              <p className="text-[11px] text-zinc-600 mt-1.5 text-center">
                분 입력 시 분주(分柱)까지 계산 · 미입력 가능
              </p>
            )}
          </div>

          {/* 성별 */}
          <div className="mb-6">
            <label className="block text-xs text-zinc-500 mb-1.5">성별 (性別)</label>
            <div className="grid grid-cols-2 gap-2">
              {(['male', 'female'] as Gender[]).map(g => (
                <button
                  key={g} type="button"
                  onClick={() => setGender(g)}
                  className={`py-2.5 rounded-xl font-medium text-sm transition-all ${
                    gender === g
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                      : 'bg-white/5 text-zinc-400 border border-white/10 hover:border-white/20'
                  }`}
                >
                  {g === 'male' ? '♂ 남성' : '♀ 여성'}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs mb-4 bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl font-semibold text-white text-base
              bg-gradient-to-r from-amber-500 to-orange-500
              hover:from-amber-400 hover:to-orange-400
              shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30
              transition-all active:scale-[0.98]"
          >
            사주 보기 →
          </button>
        </form>

        <p className="text-center text-xs text-zinc-700 mt-5">
          양력 기준 · 절기 근사값 · 참고용으로만 활용하세요
        </p>
      </div>
    </div>
  )
}
