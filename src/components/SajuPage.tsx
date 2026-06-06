import type { BirthInput } from '../types'
import { calculateSaju, getOhaengCount, pillarName, pillarNameKo } from '../utils/saju'
import { STEMS, BRANCHES, ELEMENT_COLORS } from '../utils/constants'
import SajuChart from './SajuChart'
import OhaengChart from './OhaengChart'
import SipsinChart from './SipsinChart'
import FortuneReading from './FortuneReading'

interface Props {
  savedBirth: BirthInput | null
  onBack: () => void
  onDeepSaju: () => void
}

const ELEMENT_KO: Record<string, string> = {
  wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)',
}

const STEM_NATURE: Record<number, { symbol: string; title: string; nature: string }> = {
  0: { symbol: '🌲', title: '甲木 — 교목(喬木)', nature: '거대한 나무처럼 위로 뻗어나가는 확장의 힘. 한번 세운 방향은 잘 바꾸지 않습니다.' },
  1: { symbol: '🌿', title: '乙木 — 초목(草木)', nature: '유연하게 환경에 적응하지만 뿌리는 단단합니다. 부드러움 속에 끈질긴 생명력이 있습니다.' },
  2: { symbol: '☀️', title: '丙火 — 태양(太陽)', nature: '모두에게 빛을 비추는 태양의 기운. 숨기는 것 없이 활짝 열려 있고 존재 자체가 에너지입니다.' },
  3: { symbol: '🕯️', title: '丁火 — 등화(燈火)', nature: '어둠 속 촛불처럼 은은하게 지속되는 빛. 깊은 내면을 감추고 있는 신비로운 사람입니다.' },
  4: { symbol: '🏔️', title: '戊土 — 산악(山岳)', nature: '큰 산처럼 포용력이 넓고 흔들리지 않습니다. 신뢰와 중후함이 대명사입니다.' },
  5: { symbol: '🌾', title: '己土 — 전토(田土)', nature: '비옥한 논밭처럼 실용적이고 꼼꼼합니다. 씨앗을 키우는 것처럼 사람을 길러냅니다.' },
  6: { symbol: '⚔️', title: '庚金 — 이검(利劍)', nature: '날카로운 검처럼 결단력이 강합니다. 한번 결정한 것은 흔들림 없이 실행합니다.' },
  7: { symbol: '💎', title: '辛金 — 주옥(珠玉)', nature: '정제된 보석처럼 완벽함을 추구합니다. 높은 미적 감각과 섬세함이 특징입니다.' },
  8: { symbol: '🌊', title: '壬水 — 대해(大海)', nature: '깊고 넓은 바다처럼 포용하고 흐릅니다. 지혜롭고 유연하며 세상을 넓게 바라봅니다.' },
  9: { symbol: '💧', title: '癸水 — 우로(雨露)', nature: '이슬비처럼 섬세하고 깊습니다. 감수성과 직관이 뛰어나며 내면이 풍부합니다.' },
}

const PILLAR_INSIGHTS: string[] = [
  '년주(年柱)는 어린 시절 환경과 조상의 음덕을 봅니다.',
  '월주(月柱)는 부모형제와 20~30대 사회적 활동을 봅니다.',
  '일주(日柱)는 나 자신의 성품과 배우자·40대 인생을 봅니다.',
  '시주(時柱)는 자녀·노년·내 손으로 만든 것들을 봅니다.',
]

export default function SajuPage({ savedBirth, onBack, onDeepSaju }: Props) {
  if (!savedBirth) {
    return (
      <div className="min-h-screen bg-[#0D0A1A] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-[#A89BC0] mb-4">생년월일 정보를 먼저 입력해 주세요.</p>
          <button onClick={onBack} className="text-[#C9962A] font-semibold">← 돌아가기</button>
        </div>
      </div>
    )
  }

  const result = calculateSaju(savedBirth)
  const ohaeng = getOhaengCount(result)
  const dayStem   = STEMS[result.dayPillar.stemIndex]
  const dayBranch = BRANCHES[result.dayPillar.branchIndex]
  const sc        = ELEMENT_COLORS[dayStem.element]
  const nature    = STEM_NATURE[result.dayPillar.stemIndex]
  const hasHour   = savedBirth.hour !== null

  const pillarsDesc = (() => {
    const list = [PILLAR_INSIGHTS[0], PILLAR_INSIGHTS[1], PILLAR_INSIGHTS[2]]
    if (hasHour) list.push(PILLAR_INSIGHTS[3])
    return list
  })()

  return (
    <div className="min-h-screen bg-[#0D0A1A]">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-[#0D0A1A]/95 backdrop-blur-md border-b border-[#C9962A30]">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#231844] transition text-[#C4B8D8] text-lg"
          >
            ←
          </button>
          <div>
            <h1 className="text-base font-bold text-[#F5EDD4] leading-tight" style={{ fontFamily: "'Noto Serif KR', serif" }}>
              정통 사주 (正統四柱)
            </h1>
            <p className="text-xs text-[#7B6F9A]">사주팔자 명식 전체 분석</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Dark hero */}
        <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-5 shadow-xl shadow-[#000]/40 border border-[#C9962A25]">
          <p className="text-violet-300/70 text-xs mb-2">
            {savedBirth.year}년 {savedBirth.month}월 {savedBirth.day}일생 · {savedBirth.gender === 'male' ? '남성' : '여성'}
          </p>
          <div
            className="text-4xl font-bold tracking-wide text-white mb-1"
            style={{ fontFamily: "'Noto Serif KR', serif" }}
          >
            {pillarName(result.yearPillar)}{pillarName(result.monthPillar)}{pillarName(result.dayPillar)}
            {result.hourPillar   ? pillarName(result.hourPillar)   : ''}
            {result.minutePillar ? pillarName(result.minutePillar) : ''}
          </div>
          <p className="text-violet-300/60 text-sm mb-4">
            ({pillarNameKo(result.yearPillar)}{pillarNameKo(result.monthPillar)}{pillarNameKo(result.dayPillar)}
            {result.hourPillar   ? pillarNameKo(result.hourPillar)   : ''}
            {result.minutePillar ? pillarNameKo(result.minutePillar) : ''})
          </p>
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs bg-violet-400/20 text-violet-200 border border-violet-400/30 px-2.5 py-1 rounded-full font-medium">
              {dayStem.hanja}({dayStem.ko}) 일간
            </span>
            <span className="text-xs bg-[#C9962A15] text-[#E8B84B] border border-[#C9962A30] px-2.5 py-1 rounded-full">
              {ELEMENT_KO[dayStem.element]}{dayStem.yinYang === 'yang' ? ' 양' : ' 음'}
            </span>
            <span className="text-xs bg-[#C9962A15] text-[#E8B84B] border border-[#C9962A30] px-2.5 py-1 rounded-full">
              {dayBranch.animal}띠
            </span>
          </div>
        </div>

        {/* Day stem card */}
        <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-[#C9962A] rounded-full" />
            <h2 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
              일간 기질 (日干 氣質)
            </h2>
          </div>
          <div className="rounded-2xl p-4 border" style={{ backgroundColor: sc + '0D', borderColor: sc + '30' }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{nature.symbol}</span>
              <div>
                <p className="text-sm font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                  {nature.title}
                </p>
                <p className="text-xs text-[#7B6F9A]">
                  {ELEMENT_KO[dayStem.element]} {dayStem.yinYang === 'yang' ? '양(陽)' : '음(陰)'}
                </p>
              </div>
            </div>
            <p className="text-sm text-[#C4B8D8] leading-relaxed">{nature.nature}</p>
          </div>

          {/* Pillar guide */}
          <div className="mt-4 space-y-2">
            {pillarsDesc.map((desc, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-[#C9962A20] text-[#C9962A] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-xs text-[#A89BC0] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Four pillars chart */}
        <SajuChart result={result} />

        {/* Element distribution */}
        <OhaengChart count={ohaeng} hasHour={hasHour} />

        {/* Day pillar reading */}
        <FortuneReading result={result} count={ohaeng} />

        {/* Ten gods */}
        <SipsinChart result={result} />

        {/* Deep saju CTA */}
        <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-6 shadow-xl shadow-[#000]/40 border border-[#C9962A25]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🪬</span>
            <h3
              className="text-base font-bold text-white"
              style={{ fontFamily: "'Noto Serif KR', serif" }}
            >
              심층 사주 해석으로 더 알아보기
            </h3>
          </div>
          <p className="text-violet-300/80 text-sm mb-4 leading-relaxed">
            재물운 · 직업운 · 애정운 · 건강운 · 용신 · 귀인 분석까지 — 총 11가지 심층 항목을 확인하세요.
          </p>
          <button
            onClick={onDeepSaju}
            className="w-full py-3.5 bg-gradient-to-r from-[#C9962A] to-[#E8B84B] text-[#0D0A1A] font-bold rounded-2xl shadow-lg hover:from-[#B8871F] hover:to-[#D4A030] transition-all active:scale-[0.99]"
          >
            심층 해석 열기 →
          </button>
        </div>

        <p className="text-center text-xs text-[#4A4060] pb-6">
          사주팔자 계산기 — 양력 기준 · 절기 근사값 적용
        </p>
      </div>
    </div>
  )
}
