import { useState, useEffect } from 'react'
import { blockGuestRetry } from '../utils/guestGate'
import { shuffleDeck, cardImageSrc } from '../utils/tarotDeck'
import type { DrawnCard } from '../utils/tarotDeck'
import PointsClaimButton from './PointsClaimButton'
import { FlipCard } from './Anim3D'
import { IcTarot, IcGem, IcCloverLucky, IcBalance, IcTalisman, IcSparkleKeyword } from './icons/SajuIcons'

// 카드 뒷면 — 모든 카드에 공통으로 쓰는 금빛 패턴 디자인
// 카드 뒷면 — 앱의 신비로운 밤하늘 분위기와 어우러지는 고급 골드 & 미드나잇 테마
function TarotCardBack() {
  return (
    <div 
      className="w-full h-full rounded-xl border border-[#C9962A60] flex items-center justify-center relative overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.5)] bg-slate-950"
      style={{
        background: 'radial-gradient(circle at center, #1E1233 0%, #0A0514 100%)'
      }}
    >
      {/* 신비감을 극대화하는 배경 오버레이 및 미세 격자 실선 */}
      <div 
        className="absolute inset-1.5 rounded-lg border border-[#C9962A25]" 
        style={{
          backgroundImage: 'radial-gradient(rgba(201,150,42,0.15) 1px, transparent 1px)',
          backgroundSize: '6px 6px'
        }} 
      />
      
      {/* 중앙에서 빛나는 사주/타로 크로스 디자인 스파클 아이콘 */}
      <div className="relative z-10 flex flex-col items-center gap-1 opacity-90 scale-105">
        <IcSparkleKeyword size={20} className="text-[#C9962A]" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#C9962A] animate-pulse" />
      </div>
      
      {/* 카드 네 모서리의 미세한 골드 안착 포인트 */}
      <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-[#C9962A30]" />
      <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-[#C9962A30]" />
      <div className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-[#C9962A30]" />
      <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-[#C9962A30]" />
    </div>
  )
}

// 카드 앞면 그림 — 생성된 이미지가 있으면 이미지를, 없으면 이모지로 대체
function TarotCardFace({ card }: { card: DrawnCard }) {
  const [imgFailed, setImgFailed] = useState(false)
  return (
    <div
      className="w-full h-full rounded-xl border border-[#C9962A60] flex items-center justify-center overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, #1A0E30 0%, #100820 100%)',
        transform: card.reversed ? 'rotate(180deg)' : 'none',
      }}
    >
      {!imgFailed ? (
        <img
          src={cardImageSrc(card.slug)}
          alt={card.name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span className="text-2xl">{card.symbol}</span>
      )}
    </div>
  )
}

// 과거/현재/미래 미리보기 카드 — 카드가 놓이면 뒷면→앞면으로 3D 뒤집기
function PreviewCard({ card, index }: { card: DrawnCard | undefined; index: number }) {
  const [flipped, setFlipped] = useState(false)
  useEffect(() => {
    if (card) {
      const t = setTimeout(() => setFlipped(true), 80)
      return () => clearTimeout(t)
    }
    setFlipped(false)
  }, [card])

  if (!card) {
    return (
      <div className="w-full h-full rounded-xl border border-dashed border-[#C9962A30] flex items-center justify-center">
        <span className="text-[#857AA0] text-xs">{index + 1}</span>
      </div>
    )
  }
  return (
    <FlipCard
      flipped={flipped}
      back={<TarotCardBack />}
      front={<TarotCardFace card={card} />}
    />
  )
}

interface Props {
  onBack: () => void
}

interface TarotResult {
  luck: 'great' | 'good' | 'neutral' | 'caution'
  summary: string
  past: string
  present: string
  future: string
  advice: string
}

const LUCK_CFG = {
  great:   { label: '대길',   color: '#C9962A', bg: '#C9962A18', border: '#C9962A45', Icon: IcGem },
  good:    { label: '길',     color: '#4BBF7E', bg: '#4BBF7E18', border: '#4BBF7E45', Icon: IcCloverLucky },
  neutral: { label: '평',     color: '#A3A6BC', bg: '#A3A6BC18', border: '#A3A6BC45', Icon: IcBalance },
  caution: { label: '주의',   color: '#E05252', bg: '#E0525218', border: '#E0525245', Icon: IcTalisman },
}

const POSITIONS = [
  { key: 'past',    label: '과거' },
  { key: 'present', label: '현재' },
  { key: 'future',  label: '미래' },
] as const

export default function TarotPage({ onBack }: Props) {
  const [step,     setStep]     = useState<'intro' | 'shuffling' | 'draw' | 'loading' | 'result'>('intro')
  const [question, setQuestion] = useState('')
  const [spread,   setSpread]   = useState<DrawnCard[]>([])
  const [picked,   setPicked]   = useState<number[]>([])
  const [result,   setResult]   = useState<TarotResult | null>(null)
  const [error,    setError]    = useState('')

  const drawn = picked.map(i => spread[i])

  function handleStartDraw() {
    if (!question.trim()) return
    setStep('shuffling')
    setTimeout(() => {
      setSpread(shuffleDeck())
      setPicked([])
      setStep('draw')
    }, 1100)
  }

  function handlePick(i: number) {
    if (picked.length >= 3 || picked.includes(i)) return
    setPicked(prev => [...prev, i])
  }

  async function handleInterpret() {
    setStep('loading')
    setError('')
    try {
      const apiUrl = import.meta.env.VITE_TAROT_API_URL ?? '/api/tarot'
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 20000)
      let resp: Response
      try {
        resp = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: question.trim(),
            cards: drawn.map(c => ({ name: c.name, reversed: c.reversed })),
          }),
          signal: controller.signal,
        })
      } finally {
        clearTimeout(timer)
      }
      let data: TarotResult & { error?: string }
      try {
        data = await resp.json() as TarotResult & { error?: string }
      } catch {
        throw new Error('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.')
      }
      if (!resp.ok) throw new Error(data.error ?? '오류가 발생했습니다')
      setResult(data)
      setStep('result')
      window.scrollTo(0, 0)
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다')
      setStep('draw')
    }
  }

  function handleRestart() {
    if (blockGuestRetry()) return
    setStep('intro')
    setQuestion('')
    setSpread([])
    setPicked([])
    setResult(null)
    setError('')
    window.scrollTo(0, 0)
  }

  function handleBack() {
    if (step === 'result') { handleRestart(); return }
    if (step === 'draw' || step === 'loading') { setStep('intro'); window.scrollTo(0, 0); return }
    onBack()
  }

  const allPicked = picked.length === 3
  const luck = result ? LUCK_CFG[result.luck] : null

  return (
    <div className="min-h-screen">

      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-[#0D0A1A]/95 backdrop-blur-md border-b border-[#C9962A30]">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3 flex items-center gap-3">
          <button
            onClick={handleBack}
            aria-label="뒤로 가기"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#231844] transition text-[#C4B8D8] text-lg flex-shrink-0"
          >
            ←
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-[#F5EDD4] leading-tight" style={{ fontFamily: "'Gowun Batang', serif" }}>
              나만의 타로 상담
            </h1>
            <p className="text-xs text-[#A79CC2] truncate">
              {step === 'intro' ? 'AI 타로 카드 해석' : step === 'shuffling' ? '카드를 섞는 중...' : step === 'draw' ? '카드를 뽑아주세요' : step === 'loading' ? '해석 중...' : '상담 결과'}
            </p>
          </div>
          <span className="text-[10px] text-[#4BBF7E] bg-[#4BBF7E15] border border-[#4BBF7E30] px-2 py-1 rounded-full flex-shrink-0 font-semibold">
            AI 해석
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">

        {/* ── INTRO ── */}
        {step === 'intro' && (
          <div className="space-y-4">

            {/* 양옆에 실제 타로 카드를 두고 가운데를 비추는 장식용 히어로 */}
            <div className="relative h-44 flex items-center justify-center mb-1">
              <div className="absolute inset-x-0 top-0 h-44 flex items-center justify-center pointer-events-none">
                <div className="w-56 h-32 rounded-full blur-2xl opacity-40" style={{ background: 'radial-gradient(circle, rgba(232,199,92,0.4), transparent 70%)' }} />
              </div>
              <div className="absolute left-0 w-20 h-32 rounded-xl border border-[#d4af37]/60 overflow-hidden shadow-lg z-10 animate-float-left">
                <img src={cardImageSrc('strength')} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="relative z-20 flex flex-col items-center gap-1.5">
                <IcTarot size={30} className="text-[#E8C75C]" />
                <p className="text-[11px] text-[#C9962A] font-semibold tracking-wide">22장의 메이저 아르카나</p>
              </div>
              <div className="absolute right-0 w-20 h-32 rounded-xl border border-[#d4af37]/60 overflow-hidden shadow-lg z-10 animate-float-right">
                <img src={cardImageSrc('justice')} alt="" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-5 border border-[#C9962A25] shadow-xl shadow-[#000]/40">
              <p className="text-violet-300/85 text-xs mb-1">과거 · 현재 · 미래 3카드 스프레드</p>
              <h2 className="text-xl font-bold text-[#F5EDD4] mb-2" style={{ fontFamily: "'Gowun Batang', serif" }}>
                무엇이 궁금하신가요?
              </h2>
              <p className="text-sm text-[#BCB1D4] leading-relaxed">
                궁금한 점을 적으면 더 정확한 해석을 받을 수 있어요.
              </p>
            </div>

            <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] p-5">
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="예) 지금 하는 일이 잘 풀릴까요?"
                maxLength={200}
                rows={3}
                className="w-full bg-[#1C1438] border border-[#2A1F4A] rounded-2xl px-4 py-3 text-sm text-[#F5EDD4] placeholder:text-[#857AA0] focus:outline-none focus:border-[#C9962A] focus:ring-2 focus:ring-[#C9962A20] transition resize-none leading-relaxed"
              />
              <p className="text-xs text-[#857AA0] mt-2 px-1">{question.length}/200자 · 필수 입력</p>
            </div>

            <button
              onClick={handleStartDraw}
              disabled={!question.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-[#C9962A] to-[#E8B84B] text-[#0D0A1A] font-bold rounded-2xl shadow-lg hover:from-[#B8871F] hover:to-[#D4A030] transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <IcTarot size={20} className="text-[#0D0A1A]" />
              카드 뽑기
            </button>

            <div className="flex items-center gap-2 justify-center">
              <div className="h-px flex-1 bg-[#2A1F4A]"/>
              <p className="text-[10px] text-[#857AA0]">Google Gemini AI · 메이저 아르카나 22장</p>
              <div className="h-px flex-1 bg-[#2A1F4A]"/>
            </div>
          </div>
        )}

        {/* ── SHUFFLING ── */}
        {step === 'shuffling' && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-2 border-[#C9962A20] animate-ping"/>
              <div className="absolute inset-2 rounded-full border-2 border-[#C9962A40] animate-ping" style={{ animationDelay: '0.3s' }}/>
              <div className="absolute inset-0 flex items-center justify-center"><IcTarot size={32} className="text-[#C9962A]"/></div>
            </div>
            <p className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>카드를 섞고 있어요...</p>
          </div>
        )}

        {/* ── DRAW ── */}
        {step === 'draw' && (
          <div className="space-y-5">

            {/* 선택한 카드 미리보기 (과거/현재/미래) */}
            <div className="grid grid-cols-3 gap-3">
              {POSITIONS.map((pos, i) => {
                const card = drawn[i]
                return (
                  <div key={pos.key} className="flex flex-col items-center gap-2">
                    <div className="w-full aspect-[2/3]">
                      <PreviewCard card={card} index={i} />
                    </div>
                    <p className="text-[11px] text-[#A79CC2] font-semibold">{pos.label}{card?.reversed ? ' · 역방향' : ''}</p>
                  </div>
                )
              })}
            </div>

            <p className="text-center text-sm text-[#BCB1D4]">22장 중 3장을 골라주세요 ({picked.length}/3)</p>

            {/* 부채꼴 레이아웃 컨테이너 (높이를 축소하고 모바일 화면 중앙 정렬 최적화) */}
<div className="relative w-full max-w-sm mx-auto h-[200px] flex items-center justify-center overflow-visible my-4" style={{ perspective: '1000px' }}>
  {spread.map((card, i) => {
    const pickIndex = picked.indexOf(i)
    const isPicked = pickIndex !== -1
    const disabled = allPicked && !isPicked

    // 부채꼴 계산 로직
    const totalCards = spread.length
    const midIndex = (totalCards - 1) / 2
    const distanceFromCenter = i - midIndex

    // 아래쪽이 잘리거나 문구와 겹치지 않도록 회전 각도와 반경을 콤팩트하게 압축
    const rotateZ = distanceFromCenter * 2.0      // 카드당 회전 각도 (더 촘촘하게)
    const translateX = distanceFromCenter * 7.5    // 카드 간 좌우 간격 (px)
    // 둥글게 휘어지는 축의 Y 위치를 위로 올려서 카드 밑바닥이 화면 밖으로 나가는 것을 방지
    const translateY = Math.abs(distanceFromCenter) * 0.8 - 40 

    return (
      <button
        key={card.id}
        onClick={() => handlePick(i)}
        disabled={isPicked || allPicked}
        style={{
          transform: `translateX(${translateX}px) translateY(${translateY}px) rotateZ(${rotateZ}deg)`,
          transformOrigin: 'center 120%', // 회전 중심
          축을 카드 아래 바깥쪽으로 설정해 완만한 아치 구현
          zIndex: i,
        }}
        className={`
          absolute w-[60px] aspect-[2/3] transition-all duration-300 ease-out select-none
          
          /* 일반 상태 호버: 위로 번쩍 솟아오르며 안내 문구를 가리지 않도록 조절 */
          ${!isPicked && !disabled ? 'hover:-translate-y-20 hover:scale-115 hover:z-[99] hover:shadow-[0_0_20px_rgba(201,150,42,0.7)]' : ''}
          
          /* 이미 뽑힌 카드 처리 */
          ${isPicked ? 'opacity-10 scale-75 pointer-events-none' : ''}
          
          /* 3장 다 뽑아서 잠긴 카드 처리 */
          ${disabled ? 'opacity-20 pointer-events-none' : ''}
        `}
      >
        <TarotCardBack/>
      </button>
    )
  })}
</div>

            {error && <p className="text-xs text-red-400 text-center">{error}</p>}

            <button
              onClick={handleInterpret}
              disabled={!allPicked}
              className="w-full py-3.5 bg-gradient-to-r from-[#C9962A] to-[#E8B84B] text-[#0D0A1A] font-bold rounded-2xl shadow-lg hover:from-[#B8871F] hover:to-[#D4A030] transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {allPicked ? <><IcSparkleKeyword size={16} /> 해석 보기</> : `${picked.length}/3장 뽑는 중...`}
            </button>
          </div>
        )}

        {/* ── LOADING ── */}
        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-2 border-[#C9962A20] animate-ping"/>
              <div className="absolute inset-2 rounded-full border-2 border-[#C9962A40] animate-ping" style={{ animationDelay: '0.3s' }}/>
              <div className="absolute inset-4 rounded-full border-2 border-[#C9962A60] animate-ping" style={{ animationDelay: '0.6s' }}/>
              <div className="absolute inset-0 flex items-center justify-center"><IcTarot size={32} className="text-[#C9962A]"/></div>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-[#F5EDD4] mb-1" style={{ fontFamily: "'Gowun Batang', serif" }}>해석 중...</p>
              <p className="text-sm text-[#A79CC2]">AI가 카드의 의미를 풀어내고 있습니다</p>
            </div>
          </div>
        )}

        {/* ── RESULT ── */}
        {step === 'result' && result && luck && (
          <div className="space-y-4 animate-fade-in-up">

            {/* Hero */}
            <div
              className="rounded-3xl p-6 border shadow-xl shadow-[#000]/40"
              style={{ background: 'linear-gradient(135deg, #1A0E30 0%, #100820 60%, #060410 100%)', borderColor: luck.border }}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="leading-none" style={{ color: luck.color }}><luck.Icon size={52} /></span>
                <span
                  className="text-sm font-bold px-3 py-1.5 rounded-full"
                  style={{ color: luck.color, backgroundColor: luck.bg, border: `1px solid ${luck.border}` }}
                >
                  {luck.label}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-[#F5EDD4] mb-1" style={{ fontFamily: "'Gowun Batang', serif" }}>
                타로 상담 결과
              </h2>
              <p className="text-xs text-[#A79CC2]">{result.summary}</p>
            </div>

            {/* 뽑힌 카드 한눈에 보기 */}
            <div className="grid grid-cols-3 gap-3">
              {POSITIONS.map((pos, i) => {
                const card = drawn[i]
                if (!card) return null
                return (
                  <div key={pos.key} className="bg-[#130E24] border border-[#2A1F4A] rounded-2xl p-2 flex flex-col items-center gap-1.5">
                    <div className="w-full aspect-[2/3]"><TarotCardFace card={card}/></div>
                    <p className="text-[10px] font-bold text-[#F5EDD4] text-center leading-tight">{card.name}</p>
                    {card.reversed && <span className="text-[8px] text-[#E05252] font-semibold">역방향</span>}
                    <p className="text-[9px] text-[#A79CC2] mt-0.5">{pos.label}</p>
                  </div>
                )
              })}
            </div>

            {/* Detail sections */}
            {(['past', 'present', 'future'] as const).map((key, i) => (
              <div key={key} className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 rounded-full" style={{ backgroundColor: luck.color }}/>
                  <h3 className="text-sm font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>
                    {POSITIONS[i].label}
                  </h3>
                </div>
                <p className="text-sm text-[#C4B8D8] leading-relaxed">{result[key]}</p>
              </div>
            ))}

            {/* Advice */}
            <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-5 border border-[#C9962A25] shadow-xl shadow-[#000]/40">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-[#C9962A] rounded-full"/>
                <h3 className="text-sm font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>
                  오늘의 조언
                </h3>
              </div>
              <p className="text-sm text-[#C4B8D8] leading-relaxed">{result.advice}</p>
            </div>

            {/* 포인트 받기 */}
            <PointsClaimButton featureKey="tarot" label="타로 상담 확인 🔮" />

            {/* Restart CTA */}
            <button
              onClick={handleRestart}
              className="w-full py-3.5 bg-gradient-to-r from-[#C9962A] to-[#E8B84B] text-[#0D0A1A] font-bold rounded-2xl shadow-lg hover:from-[#B8871F] hover:to-[#D4A030] transition-all active:scale-[0.99]"
            >
              다른 카드로 다시 보기 →
            </button>
          </div>
        )}

        <p className="text-center text-xs text-[#857AA0] pb-6 pt-4">
          타로 상담 — Google Gemini AI · 메이저 아르카나 기반 · 참고용으로만 활용하세요
        </p>
      </div>
    </div>
  )
}
