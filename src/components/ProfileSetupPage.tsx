import { useState } from 'react'
import type { BirthInput, Gender, UserInfo } from '../types'

interface Props {
  user: UserInfo
  onSave: (b: BirthInput) => void
}

const inputCls = `
  w-full px-3 py-3 rounded-2xl text-center text-stone-800 placeholder-stone-300
  bg-stone-50 border border-stone-200 text-sm font-medium
  focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition
`.trim()

export default function ProfileSetupPage({ user, onSave }: Props) {
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
    onSave({ year: y, month: m, day: d, hour: h, minute: min, gender })
  }

  return (
    <div className="min-h-screen bg-[#F4F2FF] flex flex-col">

      {/* 상단 인사 영역 */}
      <div className="px-6 pt-14 pb-8 text-center">
        {/* 앱 로고 */}
        <div className="flex justify-center mb-5">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-violet-200/50 blur-xl" />
            <div className="relative w-[64px] h-[64px] rounded-full p-[2.5px]"
              style={{ background: 'linear-gradient(135deg, #A78BFA, #7C3AED)' }}>
              <div className="w-full h-full rounded-full bg-[#F4F2FF] flex items-center justify-center">
                <span className="text-3xl" style={{ color: '#7C3AED', fontFamily: 'serif' }}>☯</span>
              </div>
            </div>
          </div>
        </div>
        {/* 사용자 프로필 */}
        <div className="flex items-center justify-center gap-2.5 mb-3">
          {user.picture ? (
            <img src={user.picture} alt={user.name}
              className="w-8 h-8 rounded-full border border-violet-200 object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center">
              <span className="text-violet-600 text-sm font-bold">{user.name[0]}</span>
            </div>
          )}
          <p className="text-stone-600 text-sm font-semibold">{user.name}님, 반가워요</p>
        </div>
        <h1 className="text-xl font-bold text-stone-800 mb-1" style={{ fontFamily: "'Noto Serif KR', serif" }}>
          내 정보 입력
        </h1>
        <p className="text-stone-400 text-xs leading-relaxed">
          정확한 운세 분석을 위해 생년월일을 입력해 주세요
        </p>
      </div>

      {/* 입력 카드 */}
      <div className="flex-1 px-4 -mt-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(124,58,237,0.10)] border border-violet-100 p-6 space-y-5"
        >
          {/* 생년월일 */}
          <div>
            <p className="text-xs font-semibold text-violet-500 mb-3 flex items-center gap-1.5">
              <span className="w-1 h-4 bg-violet-500 rounded-full inline-block" />
              생년월일
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '년 (年)', ph: '1990', val: year,  set: setYear,  min: 1900, max: 2100 },
                { label: '월 (月)', ph: '1',    val: month, set: setMonth, min: 1,    max: 12   },
                { label: '일 (日)', ph: '1',    val: day,   set: setDay,   min: 1,    max: 31   },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-[11px] text-stone-400 mb-1.5 font-medium text-center">{f.label}</label>
                  <input
                    type="number" required placeholder={f.ph} value={f.val}
                    min={f.min} max={f.max}
                    onChange={e => f.set(e.target.value)}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 시·분 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-violet-500 flex items-center gap-1.5">
                <span className="w-1 h-4 bg-violet-500 rounded-full inline-block" />
                태어난 시간 (24h)
              </p>
              <label className="flex items-center gap-1.5 text-xs text-stone-400 cursor-pointer select-none">
                <input
                  type="checkbox" checked={unknownHour}
                  onChange={e => setUnknownHour(e.target.checked)}
                  className="accent-violet-500 rounded w-3.5 h-3.5"
                />
                모름
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-stone-400 mb-1.5 font-medium text-center">시</label>
                <input
                  type="number" placeholder="14" min="0" max="23" value={hour}
                  disabled={unknownHour}
                  onChange={e => setHour(e.target.value)}
                  className={`${inputCls} disabled:opacity-40`}
                />
              </div>
              <div>
                <label className="block text-[11px] text-stone-400 mb-1.5 font-medium text-center">분</label>
                <input
                  type="number" placeholder="30" min="0" max="59" value={minute}
                  disabled={unknownHour}
                  onChange={e => setMinute(e.target.value)}
                  className={`${inputCls} disabled:opacity-40`}
                />
              </div>
            </div>
            {!unknownHour && (
              <p className="text-[11px] text-stone-300 mt-1.5 text-center">
                분 입력 시 분주(分柱)까지 계산됩니다
              </p>
            )}
          </div>

          {/* 성별 */}
          <div>
            <p className="text-xs font-semibold text-violet-500 mb-3 flex items-center gap-1.5">
              <span className="w-1 h-4 bg-violet-500 rounded-full inline-block" />
              성별
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(['male', 'female'] as Gender[]).map(g => (
                <button
                  key={g} type="button"
                  onClick={() => setGender(g)}
                  className={`py-3 rounded-2xl font-semibold text-sm transition-all ${
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
            <p className="text-red-500 text-xs bg-red-50 border border-red-100 px-4 py-2.5 rounded-2xl text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-4 rounded-2xl font-bold text-white text-base
              bg-gradient-to-r from-violet-600 to-purple-600
              hover:from-violet-500 hover:to-purple-500
              shadow-lg shadow-violet-200 transition-all active:scale-[0.98]"
          >
            운명봄 시작하기 →
          </button>
        </form>

        <p className="text-center text-xs text-stone-300 my-5">
          입력 정보는 기기에만 저장되며 외부로 전송되지 않습니다
        </p>
      </div>
    </div>
  )
}
