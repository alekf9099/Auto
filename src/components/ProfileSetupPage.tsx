import { useRef, useState } from 'react'
import type { BirthInput, Gender, UserInfo } from '../types'
import { lunarToSolar } from '../utils/lunar'
import { loadProfilePhoto, saveProfilePhoto, clearProfilePhoto, resizeImageFile } from '../utils/profilePhoto'

interface Props {
  user: UserInfo
  savedNickname?: string
  onSave: (b: BirthInput, nickname: string) => void
}

const inputCls = `
  w-full px-3 py-3 rounded-2xl text-center text-[#F5EDD4] placeholder-[#4A4060]
  bg-[#1C1438] border border-[#2A1F4A] text-sm font-medium
  focus:outline-none focus:border-[#C9962A] focus:ring-2 focus:ring-[#C9962A20] transition
`.trim()

export default function ProfileSetupPage({ user, savedNickname, onSave }: Props) {
  const [photo,       setPhoto]       = useState<string | null>(loadProfilePhoto)
  const [photoError,  setPhotoError]  = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [nickname,    setNickname]    = useState(savedNickname ?? '')
  const [year,        setYear]        = useState('')
  const [month,       setMonth]       = useState('')
  const [day,         setDay]         = useState('')
  const [hour,        setHour]        = useState('')
  const [minute,      setMinute]      = useState('')
  const [gender,      setGender]      = useState<Gender>('male')
  const [unknownHour, setUnknownHour] = useState(false)
  const [error,       setError]       = useState('')
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar')
  const [isLeapMonth,  setIsLeapMonth]  = useState(false)

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const dataUrl = await resizeImageFile(file)
      saveProfilePhoto(dataUrl)
      setPhoto(dataUrl)
      setPhotoError('')
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : '사진을 처리할 수 없어요')
    }
  }

  function handlePhotoRemove() {
    clearProfilePhoto()
    setPhoto(null)
    setPhotoError('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nick = nickname.trim()
    if (nick.length < 2 || nick.length > 10) { setError('닉네임을 2~10자로 입력해주세요'); return }

    let y = parseInt(year), m = parseInt(month), d = parseInt(day)
    if (!y || y < 1900 || y > 2100) { setError('연도를 확인해주세요 (1900~2100)'); return }
    if (!m || m < 1   || m > 12)   { setError('월을 확인해주세요 (1~12)');         return }
    if (!d || d < 1   || d > 31)   { setError('일을 확인해주세요 (1~31)');         return }

    if (calendarType === 'lunar') {
      const solar = lunarToSolar(y, m, d, isLeapMonth)
      if (!solar) { setError('음력 날짜를 확인해주세요'); return }
      y = solar.year; m = solar.month; d = solar.day
    }

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
    onSave({ year: y, month: m, day: d, hour: h, minute: min, gender }, nick)
  }

  return (
    <div className="min-h-screen bg-[#0D0A1A] flex flex-col">

      {/* 상단 인사 영역 */}
      <div className="px-6 pt-14 pb-8 text-center">
        {/* 앱 로고 */}
        <div className="flex justify-center mb-5">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#C9962A]/10 blur-xl" />
            <div className="relative w-[64px] h-[64px] rounded-full p-[2.5px]"
              style={{ background: 'linear-gradient(135deg, #C9962A, #E8B84B)' }}>
              <div className="w-full h-full rounded-full bg-[#0D0A1A] flex items-center justify-center">
                <span className="text-3xl" style={{ color: '#C9962A', fontFamily: 'serif' }}>☯</span>
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
            <div className="w-8 h-8 rounded-full bg-[#C9962A20] border border-[#C9962A40] flex items-center justify-center">
              <span className="text-[#C9962A] text-sm font-bold">{user.name[0]}</span>
            </div>
          )}
          <p className="text-[#C4B8D8] text-sm font-semibold">{user.name}님, 반가워요</p>
        </div>
        <h1 className="text-xl font-bold text-[#F5EDD4] mb-1" style={{ fontFamily: "'Noto Serif KR', serif" }}>
          내 정보 입력
        </h1>
        <p className="text-[#7B6F9A] text-xs leading-relaxed">
          정확한 운세 분석을 위해 생년월일을 입력해 주세요
        </p>
      </div>

      {/* 입력 카드 */}
      <div className="flex-1 px-4 -mt-4">
        <form
          onSubmit={handleSubmit}
          className="bg-[#130E24] rounded-3xl shadow-[0_4px_24px_rgba(201,150,42,0.10)] border border-[#2A1F4A] p-6 space-y-5"
        >
          {/* 프로필 사진 */}
          <div>
            <p className="text-xs font-semibold text-[#C9962A] mb-2 flex items-center gap-1.5">
              <span className="w-1 h-4 bg-[#C9962A] rounded-full inline-block" />
              프로필 사진 <span className="text-[#7B6F9A] font-normal">(선택)</span>
            </p>
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                {photo ? (
                  <img src={photo} alt="프로필 사진" className="w-16 h-16 rounded-full object-cover border border-[#C9962A40]" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#1C1438] border border-[#2A1F4A] flex items-center justify-center text-2xl">🙂</div>
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 rounded-xl text-xs font-semibold bg-[#1C1438] border border-[#2A1F4A] text-[#C4B8D8] hover:border-[#C9962A40] transition"
                >
                  {photo ? '사진 변경' : '사진 선택'}
                </button>
                {photo && (
                  <button
                    type="button"
                    onClick={handlePhotoRemove}
                    className="w-full py-1.5 rounded-xl text-[11px] font-semibold text-[#7B6F9A] hover:text-rose-400 transition"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
            {photoError && <p className="text-[11px] text-rose-400 mt-1.5">{photoError}</p>}
            <p className="text-[11px] text-[#4A4060] mt-1.5 text-center">
              사주매칭에서 매칭 상대에게도 보일 수 있어요. 얼굴 사진이 아니어도 괜찮아요
            </p>
          </div>

          {/* 닉네임 */}
          <div>
            <p className="text-xs font-semibold text-[#C9962A] mb-2 flex items-center gap-1.5">
              <span className="w-1 h-4 bg-[#C9962A] rounded-full inline-block" />
              닉네임
            </p>
            <input
              type="text" required placeholder="2~10자로 입력해주세요" value={nickname}
              maxLength={10}
              onChange={e => setNickname(e.target.value)}
              className={inputCls}
            />
            <p className="text-[11px] text-[#4A4060] mt-1.5 text-center">
              다른 사용자와의 매칭 등에서 본명 대신 표시될 이름이에요
            </p>
          </div>

          {/* 생년월일 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-[#C9962A] flex items-center gap-1.5">
                <span className="w-1 h-4 bg-[#C9962A] rounded-full inline-block" />
                생년월일
              </p>
              <div className="flex gap-1 bg-[#1C1438] border border-[#2A1F4A] rounded-full p-0.5">
                {(['solar', 'lunar'] as const).map(c => (
                  <button
                    key={c} type="button"
                    onClick={() => setCalendarType(c)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${
                      calendarType === c ? 'bg-[#C9962A] text-[#0D0A1A]' : 'text-[#7B6F9A]'
                    }`}
                  >
                    {c === 'solar' ? '양력' : '음력'}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '년 (年)', ph: '1990', val: year,  set: setYear,  min: 1900, max: 2100 },
                { label: '월 (月)', ph: '1',    val: month, set: setMonth, min: 1,    max: 12   },
                { label: '일 (日)', ph: '1',    val: day,   set: setDay,   min: 1,    max: 31   },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-[11px] text-[#A89BC0] mb-1.5 font-medium text-center">{f.label}</label>
                  <input
                    type="number" required placeholder={f.ph} value={f.val}
                    min={f.min} max={f.max}
                    onChange={e => f.set(e.target.value)}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
            {calendarType === 'lunar' && (
              <label className="flex items-center gap-1.5 text-xs text-[#A89BC0] cursor-pointer select-none mt-2.5">
                <input
                  type="checkbox" checked={isLeapMonth}
                  onChange={e => setIsLeapMonth(e.target.checked)}
                  className="accent-[#C9962A] rounded w-3.5 h-3.5"
                />
                윤달이에요
              </label>
            )}
          </div>

          {/* 시·분 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-[#C9962A] flex items-center gap-1.5">
                <span className="w-1 h-4 bg-[#C9962A] rounded-full inline-block" />
                태어난 시간 (24h)
              </p>
              <label className="flex items-center gap-1.5 text-xs text-[#A89BC0] cursor-pointer select-none">
                <input
                  type="checkbox" checked={unknownHour}
                  onChange={e => setUnknownHour(e.target.checked)}
                  className="accent-[#C9962A] rounded w-3.5 h-3.5"
                />
                모름
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-[#A89BC0] mb-1.5 font-medium text-center">시</label>
                <input
                  type="number" placeholder="14" min="0" max="23" value={hour}
                  disabled={unknownHour}
                  onChange={e => setHour(e.target.value)}
                  className={`${inputCls} disabled:opacity-40`}
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#A89BC0] mb-1.5 font-medium text-center">분</label>
                <input
                  type="number" placeholder="30" min="0" max="59" value={minute}
                  disabled={unknownHour}
                  onChange={e => setMinute(e.target.value)}
                  className={`${inputCls} disabled:opacity-40`}
                />
              </div>
            </div>
            {!unknownHour && (
              <p className="text-[11px] text-[#4A4060] mt-1.5 text-center">
                분 입력 시 분주(分柱)까지 계산됩니다
              </p>
            )}
          </div>

          {/* 성별 */}
          <div>
            <p className="text-xs font-semibold text-[#C9962A] mb-3 flex items-center gap-1.5">
              <span className="w-1 h-4 bg-[#C9962A] rounded-full inline-block" />
              성별
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(['male', 'female'] as Gender[]).map(g => (
                <button
                  key={g} type="button"
                  onClick={() => setGender(g)}
                  className={`py-3 rounded-2xl font-semibold text-sm transition-all ${
                    gender === g
                      ? 'bg-gradient-to-r from-[#C9962A] to-[#E8B84B] text-[#0D0A1A] shadow-md shadow-[#C9962A30]'
                      : 'bg-[#1C1438] text-[#A89BC0] border border-[#2A1F4A] hover:border-[#C9962A40]'
                  }`}
                >
                  {g === 'male' ? '♂ 남성' : '♀ 여성'}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-900/20 border border-red-900/40 px-4 py-2.5 rounded-2xl text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-4 rounded-2xl font-bold text-[#0D0A1A] text-base
              bg-gradient-to-r from-[#C9962A] to-[#E8B84B]
              hover:from-[#B8871F] hover:to-[#D4A030]
              shadow-lg shadow-[#C9962A30] transition-all active:scale-[0.98]"
          >
            운명봄 시작하기 →
          </button>
        </form>

        <p className="text-center text-xs text-[#4A4060] my-5">
          입력 정보는 기기에만 저장되며 외부로 전송되지 않습니다
        </p>
      </div>
    </div>
  )
}
