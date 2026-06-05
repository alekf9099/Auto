interface Props {
  onLogin: (name: string) => void
}

export default function LoginPage({ onLogin }: Props) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = (fd.get('name') as string).trim()
    if (name) onLogin(name)
  }

  return (
    <div className="min-h-screen bg-[#F4F2FF] flex flex-col items-center justify-center px-6">
      {/* 로고 */}
      <div className="mb-8 flex flex-col items-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-xl shadow-violet-300/40 mb-4">
          <span className="text-4xl">☯</span>
        </div>
        <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: "'Noto Serif KR', serif" }}>
          사주팔자
        </h1>
        <p className="text-sm text-stone-400 mt-1">소름 돋는 미래 예측</p>
      </div>

      {/* 로그인 카드 */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-[0_4px_24px_rgba(124,58,237,0.12)] border border-violet-100 p-6">
        <h2 className="text-base font-bold text-stone-800 mb-1">시작하기</h2>
        <p className="text-xs text-stone-400 mb-5">이름을 입력하고 운세를 확인하세요</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-500 mb-1.5">이름</label>
            <input
              name="name"
              type="text"
              placeholder="이름을 입력하세요"
              maxLength={10}
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-violet-200 hover:from-violet-500 hover:to-purple-500 transition-all text-sm active:scale-[0.98]"
          >
            운세 보러 가기 →
          </button>
        </form>
      </div>

      <p className="mt-6 text-xs text-stone-300 text-center">
        본 서비스는 참고용이며 정확성을 보장하지 않습니다
      </p>
    </div>
  )
}
