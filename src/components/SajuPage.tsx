import { useState } from 'react'
import { blockGuestRetry } from '../utils/guestGate'
import type { BirthInput } from '../types'
import { calculateSaju, getOhaengCount, pillarName, pillarNameKo } from '../utils/saju'
import { STEMS, BRANCHES, ELEMENT_COLORS } from '../utils/constants'
import PointsClaimButton from './PointsClaimButton'
import SajuChart from './SajuChart'
import OhaengChart from './OhaengChart'
import SipsinChart from './SipsinChart'
import FortuneReading from './FortuneReading'
import {
  IcSaju, IcDaun, IcGunghab,
  IcGapMok, IcEulMok, IcByeongHwa, IcJeongHwa, IcMuTo,
  IcGiTo, IcGyeongGeum, IcSinGeum, IcImSu, IcGyeSu, IcTalisman,
} from './icons/SajuIcons'

interface Props {
  savedBirth: BirthInput | null
  onBack: () => void
  onDeepSaju: () => void
  onDaun: () => void
  onGunghab: () => void
  onSave?: (b: BirthInput) => void
}

const ELEMENT_KO: Record<string, string> = {
  wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)',
}

const STEM_NATURE: Record<number, { Icon: typeof IcGapMok; title: string; nature: string }> = {
  0: { Icon: IcGapMok, title: '甲木 — 교목(喬木)', nature: '거대한 나무처럼 위로 뻗어나가는 확장의 힘. 한번 세운 방향은 절대 바꾸지 않습니다. 위로만 자라려는 본능이 강해서, 옆을 돌아보지 않으면 고립됩니다.' },
  1: { Icon: IcEulMok, title: '乙木 — 초목(草木)', nature: '유연하게 환경에 적응하지만 뿌리는 단단합니다. 부드러움 속에 끈질긴 생명력이 있습니다. 꺾이는 것처럼 보여도 절대 부러지지 않습니다.' },
  2: { Icon: IcByeongHwa, title: '丙火 — 태양(太陽)', nature: '모두에게 빛을 비추는 태양의 기운. 숨기는 것 없이 활짝 열려 있고 존재 자체가 에너지입니다. 그 빛이 너무 강해서 가까이 있는 사람을 태울 때도 있습니다.' },
  3: { Icon: IcJeongHwa, title: '丁火 — 등화(燈火)', nature: '어둠 속 촛불처럼 은은하게 지속되는 빛. 깊은 내면을 감추고 있는 신비로운 사람입니다. 겉으로 드러나지 않아도 누구보다 오래, 끝까지 타오릅니다.' },
  4: { Icon: IcMuTo, title: '戊土 — 산악(山岳)', nature: '큰 산처럼 포용력이 넓고 흔들리지 않습니다. 신뢰와 중후함이 대명사입니다. 위기 앞에서 가장 먼저 중심을 잡는 사람이 바로 당신입니다.' },
  5: { Icon: IcGiTo, title: '己土 — 전토(田土)', nature: '비옥한 논밭처럼 실용적이고 꼼꼼합니다. 씨앗을 키우는 것처럼 사람을 길러냅니다. 화려하지 않아도 결국 결실을 만드는 사람입니다.' },
  6: { Icon: IcGyeongGeum, title: '庚金 — 이검(利劍)', nature: '날카로운 검처럼 결단력이 강합니다. 한번 결정한 것은 흔들림 없이 실행합니다. 망설이는 사람들 사이에서 가장 먼저 칼을 빼는 쪽입니다.' },
  7: { Icon: IcSinGeum, title: '辛金 — 주옥(珠玉)', nature: '정제된 보석처럼 완벽함을 추구합니다. 높은 미적 감각과 섬세함이 특징입니다. 대충 넘어가는 법이 없어서, 디테일에서 진짜 실력이 드러납니다.' },
  8: { Icon: IcImSu, title: '壬水 — 대해(大海)', nature: '깊고 넓은 바다처럼 포용하고 흐릅니다. 지혜롭고 유연하며 세상을 넓게 바라봅니다. 겉으로는 잠잠해도 속에는 누구보다 큰 흐름을 품고 있습니다.' },
  9: { Icon: IcGyeSu, title: '癸水 — 우로(雨露)', nature: '이슬비처럼 섬세하고 깊습니다. 감수성과 직관이 뛰어나며 내면이 풍부합니다. 작은 신호도 먼저 알아채는, 가장 예민하고 정확한 감각을 가졌습니다.' },
}

const PILLAR_INSIGHTS: string[] = [
  '년주(年柱)는 어린 시절 환경과 조상의 음덕을 봅니다.',
  '월주(月柱)는 부모형제와 20~30대 사회적 활동을 봅니다.',
  '일주(日柱)는 나 자신의 성품과 배우자·40대 인생을 봅니다.',
  '시주(時柱)는 자녀·노년·내 손으로 만든 것들을 봅니다.',
]

export default function SajuPage({ savedBirth, onBack, onDeepSaju, onDaun, onGunghab, onSave }: Props) {
  // 저장된 생년월일이 있으면 폼 입력 없이 곧바로 결과를 보여줍니다
  const [step, setStep] = useState<'form' | 'loading' | 'result'>(savedBirth ? 'result' : 'form')
  const [birth, setBirth] = useState({
    year:   savedBirth ? String(savedBirth.year)   : '',
    month:  savedBirth ? String(savedBirth.month)  : '',
    day:    savedBirth ? String(savedBirth.day)    : '',
    hour:   savedBirth?.hour != null ? String(savedBirth.hour) : '',
    minute: savedBirth?.minute != null ? String(savedBirth.minute) : '',
    gender: (savedBirth?.gender ?? 'male') as 'male' | 'female',
  })
  const [submitted, setSubmitted] = useState<BirthInput | null>(savedBirth)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const inp: BirthInput = {
      year: Number(birth.year), month: Number(birth.month),
      day: Number(birth.day),
      hour: birth.hour !== '' ? Number(birth.hour) : null,
      minute: birth.hour !== '' && birth.minute !== '' ? Number(birth.minute) : null,
      gender: birth.gender,
    }
    onSave?.(inp)
    setSubmitted(inp)
    setStep('loading')
    window.scrollTo(0, 0)
    setTimeout(() => { setStep('result'); window.scrollTo(0, 0) }, 2500)
  }

  const result   = submitted ? calculateSaju(submitted) : null
  const ohaeng   = result ? getOhaengCount(result) : null
  const dayStem  = result ? STEMS[result.dayPillar.stemIndex] : null
  const dayBranch = result ? BRANCHES[result.dayPillar.branchIndex] : null
  const sc       = dayStem ? ELEMENT_COLORS[dayStem.element] : '#C9962A'
  const nature   = result ? STEM_NATURE[result.dayPillar.stemIndex] : null
  const hasHour  = submitted?.hour != null

  const pillarsDesc = (() => {
    const list = [PILLAR_INSIGHTS[0], PILLAR_INSIGHTS[1], PILLAR_INSIGHTS[2]]
    if (hasHour) list.push(PILLAR_INSIGHTS[3])
    return list
  })()

  return (
    <div className="min-h-screen">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-[#0D0A1A]/95 backdrop-blur-md border-b border-[#C9962A30]">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3 flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="뒤로 가기"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#231844] transition text-[#C4B8D8] text-lg"
          >
            ←
          </button>
          <div>
            <h1 className="text-base font-bold text-[#F5EDD4] leading-tight" style={{ fontFamily: "'Gowun Batang', serif" }}>
              정통 사주 (正統四柱)
            </h1>
            <p className="text-xs text-[#7B6F9A]">사주팔자 명식 전체 분석</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {step === 'form' && (
          <>
            <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-6 shadow-xl shadow-[#000]/40 border border-[#C9962A25]">
              <p className="text-violet-300/70 text-xs mb-2">동양 철학의 정수</p>
              <p className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Gowun Batang', serif" }}>
                正統四柱
              </p>
              <p className="text-sm text-violet-300/80 leading-relaxed">
                태어난 년·월·일·시를 사주팔자로 풀어<br />타고난 기질과 운의 흐름을 살핍니다.
              </p>
            </div>

            <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-5 bg-[#C9962A] rounded-full" />
                <h2 className="text-base font-bold text-[#F5EDD4]">생년월일 입력</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: '출생년도', name: 'year',  placeholder: '1990', min: 1900, max: 2010 },
                    { label: '월',       name: 'month', placeholder: '1',    min: 1,    max: 12 },
                    { label: '일',       name: 'day',   placeholder: '1',    min: 1,    max: 31 },
                  ].map(f => (
                    <div key={f.name}>
                      <label className="block text-xs font-semibold text-[#A89BC0] mb-1.5">{f.label}</label>
                      <input
                        type="number" required placeholder={f.placeholder}
                        min={f.min} max={f.max}
                        value={birth[f.name as 'year' | 'month' | 'day']}
                        onChange={e => setBirth(p => ({ ...p, [f.name]: e.target.value }))}
                        className="w-full bg-[#1C1438] border border-[#2A1F4A] rounded-2xl px-3 py-3 text-sm text-[#F5EDD4] placeholder:text-[#4A4060] focus:outline-none focus:border-[#C9962A] focus:ring-2 focus:ring-[#C9962A20] transition text-center"
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#A89BC0] mb-1.5">출생 시간 <span className="text-[#4A4060] font-normal">(선택)</span></label>
                    <input
                      type="number" placeholder="0~23"
                      min={0} max={23}
                      value={birth.hour}
                      onChange={e => setBirth(p => ({ ...p, hour: e.target.value }))}
                      className="w-full bg-[#1C1438] border border-[#2A1F4A] rounded-2xl px-3 py-3 text-sm text-[#F5EDD4] placeholder:text-[#4A4060] focus:outline-none focus:border-[#C9962A] focus:ring-2 focus:ring-[#C9962A20] transition text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#A89BC0] mb-1.5">분 <span className="text-[#4A4060] font-normal">(선택)</span></label>
                    <input
                      type="number" placeholder="0~59"
                      min={0} max={59}
                      disabled={birth.hour === ''}
                      value={birth.minute}
                      onChange={e => setBirth(p => ({ ...p, minute: e.target.value }))}
                      className="w-full bg-[#1C1438] border border-[#2A1F4A] rounded-2xl px-3 py-3 text-sm text-[#F5EDD4] placeholder:text-[#4A4060] focus:outline-none focus:border-[#C9962A] focus:ring-2 focus:ring-[#C9962A20] transition text-center disabled:opacity-40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#A89BC0] mb-1.5">성별</label>
                    <div className="flex gap-2 h-[46px]">
                      {(['male', 'female'] as const).map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setBirth(p => ({ ...p, gender: g }))}
                          className={`flex-1 text-sm font-semibold rounded-2xl border transition ${
                            birth.gender === g
                              ? 'bg-[#C9962A] border-[#C9962A] text-[#0D0A1A]'
                              : 'bg-[#1C1438] border-[#2A1F4A] text-[#A89BC0]'
                          }`}
                        >
                          {g === 'male' ? '남성' : '여성'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-[#C9962A] to-[#E8B84B] text-[#0D0A1A] font-bold rounded-2xl shadow-lg shadow-[#C9962A30] hover:from-[#B8871F] hover:to-[#D4A030] transition-all text-sm active:scale-[0.98]"
                >
                  사주팔자 분석하기 →
                </button>
              </form>
            </div>
          </>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-2 border-[#C9962A20] animate-ping"/>
              <div className="absolute inset-2 rounded-full border-2 border-[#C9962A40] animate-ping" style={{ animationDelay: '0.3s' }}/>
              <div className="absolute inset-4 rounded-full border-2 border-[#C9962A60] animate-ping" style={{ animationDelay: '0.6s' }}/>
              <div className="absolute inset-0 flex items-center justify-center"><IcSaju size={32} className="text-[#C9962A]"/></div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>사주팔자 분석 중...</p>
              <p className="text-sm text-[#7B6F9A]">천간지지를 풀이하고 있습니다</p>
            </div>
          </div>
        )}

        {step === 'result' && submitted && result && dayStem && dayBranch && nature && ohaeng && (
          <div className="space-y-4 animate-fade-in-up">
            {/* Dark hero */}
            <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-5 shadow-xl shadow-[#000]/40 border border-[#C9962A25]">
              <p className="text-violet-300/70 text-xs mb-2">
                {submitted.year}년 {submitted.month}월 {submitted.day}일생 · {submitted.gender === 'male' ? '남성' : '여성'}
              </p>
              <div
                className="text-4xl font-bold tracking-wide text-white mb-1"
                style={{ fontFamily: "'Gowun Batang', serif" }}
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
                <h2 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>
                  일간 기질 (日干 氣質)
                </h2>
              </div>
              <div className="rounded-2xl p-4 border" style={{ backgroundColor: sc + '0D', borderColor: sc + '30' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: sc + '1A', color: sc }}
                  >
                    <nature.Icon size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>
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

            {/* 관련 분석 바로가기 */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onDaun}
                className="bg-[#130E24] border border-[#2A1F4A] rounded-3xl p-4 text-left hover:border-[#C9962A40] active:scale-[0.98] transition-all"
              >
                <IcDaun size={22} className="text-[#0891B2] mb-2" />
                <p className="text-sm font-bold text-[#F5EDD4]">대운 분석</p>
                <p className="text-[11px] text-[#7B6F9A] mt-0.5">10년 단위 인생의 흐름</p>
              </button>
              <button
                onClick={onGunghab}
                className="bg-[#130E24] border border-[#2A1F4A] rounded-3xl p-4 text-left hover:border-[#C9962A40] active:scale-[0.98] transition-all"
              >
                <IcGunghab size={22} className="text-[#E05282] mb-2" />
                <p className="text-sm font-bold text-[#F5EDD4]">궁합 보기</p>
                <p className="text-[11px] text-[#7B6F9A] mt-0.5">상대방과 사주 궁합 분석</p>
              </button>
            </div>

            {/* Deep saju CTA */}
            <div className="bg-gradient-to-br from-[#1A0E30] via-[#100820] to-[#060410] rounded-3xl p-6 shadow-xl shadow-[#000]/40 border border-[#C9962A25]">
              <div className="flex items-center gap-2 mb-2">
                <IcTalisman size={22} className="text-[#C9962A]" />
                <h3
                  className="text-base font-bold text-white"
                  style={{ fontFamily: "'Gowun Batang', serif" }}
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

            <PointsClaimButton featureKey="saju" label="정통사주 확인 ☯" />
            <button
              onClick={() => { if (blockGuestRetry()) return; setStep('form'); window.scrollTo(0, 0) }}
              className="w-full py-3.5 text-[#C4B8D8] font-semibold rounded-2xl text-sm border border-[#C9962A20] transition active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #2A1F4A 0%, #1C1438 100%)' }}
            >
              다시 조회하기
            </button>

            <p className="text-center text-xs text-[#4A4060] pb-6">
              사주팔자 계산기 — 양력 기준 · 절기 근사값 적용
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
