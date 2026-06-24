import { useState } from 'react'
import type { BirthInput, SajuResult, OhaengCount } from '../types'
import { STEMS, BRANCHES, ELEMENT_COLORS, ELEMENT_LABELS, ILJU_MEANING } from '../utils/constants'
import { pillarName, pillarNameKo, calculateSaju, getSipsin } from '../utils/saju'

const SHARE_URL = 'https://alekf9099.github.io/Auto/'

interface Props {
  input:   BirthInput
  result:  SajuResult
  ohaeng:  OhaengCount
  onBack:  () => void
  onReset: () => void
}

const ELEMENT_EMOJI: Record<string, string> = {
  wood: '🌳', fire: '🔥', earth: '🪨', metal: '⚔️', water: '💧',
}
const LUCKY_COLOR: Record<string, { name: string; hex: string }> = {
  wood:  { name: '청색·녹색', hex: '#4CAF50' },
  fire:  { name: '적색·주황', hex: '#F44336' },
  earth: { name: '황색·갈색', hex: '#FF9800' },
  metal: { name: '흰색·금색', hex: '#78909C' },
  water: { name: '검정·남색', hex: '#2196F3' },
}
const LUCKY_NUM: Record<string, string>  = { wood: '3, 8', fire: '2, 7', earth: '5, 0', metal: '4, 9', water: '1, 6' }
const LUCKY_DIR: Record<string, string>  = { wood: '동쪽', fire: '남쪽', earth: '중앙', metal: '서쪽', water: '북쪽' }

export default function SummaryPage({ input, result, ohaeng, onBack, onReset }: Props) {
  const [toast, setToast] = useState('')

  const dayStem   = STEMS[result.dayPillar.stemIndex]
  const dayBranch = BRANCHES[result.dayPillar.branchIndex]
  const elements  = ['wood', 'fire', 'earth', 'metal', 'water'] as const
  const total     = Object.values(ohaeng).reduce((s, v) => s + v, 0)
  const strongest = elements.reduce((a, b) => ohaeng[a] >= ohaeng[b] ? a : b)
  const weakest   = elements.reduce((a, b) => ohaeng[a] <= ohaeng[b] ? a : b)

  // 오늘 일주와 내 일간의 관계
  const today = new Date()
  const todayResult = calculateSaju({
    year: today.getFullYear(), month: today.getMonth() + 1,
    day: today.getDate(), hour: today.getHours(), minute: null, gender: input.gender,
  })
  const sipsin = getSipsin(result.dayPillar.stemIndex, todayResult.dayPillar.stemIndex)
  const todayStar: Record<string, number> = {
    비견: 3, 겁재: 2, 식신: 4, 상관: 3, 편재: 3,
    정재: 4, 편관: 2, 정관: 4, 편인: 3, 정인: 4,
  }

  // 현재 대운
  const currentAge = today.getFullYear() - input.year
  const currentDaun = result.daun.find((d, i) => {
    const next = result.daun[i + 1]
    return d.age <= currentAge && (!next || currentAge < next.age)
  }) ?? result.daun[0]

  const pillars = [result.yearPillar, result.monthPillar, result.dayPillar]
  if (result.hourPillar)   pillars.push(result.hourPillar)
  if (result.minutePillar) pillars.push(result.minutePillar)
  const pillarLabels = ['년', '월', '일', '시', '분']

  const shareText = [
    `✨ 나의 사주팔자 ✨`,
    `${input.year}년생 · ${dayStem.hanja}(${dayStem.ko}) 일간 · ${dayBranch.animal}띠`,
    pillars.map(p => STEMS[p.stemIndex].hanja + BRANCHES[p.branchIndex].hanja).join(''),
    ``,
    `나의 사주 보러가기 👉 ${SHARE_URL}`,
  ].join('\n')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  async function handleShare(platform: 'kakao' | 'instagram') {
    const nav = navigator as Navigator & { share?: (d: object) => Promise<void> }
    if (nav.share) {
      try {
        await nav.share({ title: '나의 사주팔자', text: shareText, url: SHARE_URL })
      } catch { /* 취소 */ }
    } else if (platform === 'kakao') {
      await window.navigator.clipboard.writeText(shareText)
      showToast('카카오톡 공유 텍스트를 복사했습니다')
    } else {
      await window.navigator.clipboard.writeText(SHARE_URL)
      showToast('링크를 복사했습니다 — 인스타 스토리에 붙여넣기!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 flex flex-col">
      {/* 상단 네비 */}
      <div className="flex items-center justify-between px-4 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-stone-400 hover:text-white transition text-sm"
        >
          ← 상세 결과
        </button>
        <button
          onClick={onReset}
          className="text-xs bg-stone-700 text-stone-300 px-3 py-1.5 rounded-xl hover:bg-stone-600 transition"
        >
          다시 입력
        </button>
      </div>

      <div className="flex-1 px-4 pb-8 max-w-lg mx-auto w-full space-y-4">

        {/* 메인 카드 */}
        <div className="bg-gradient-to-br from-amber-900/60 to-stone-900/80 rounded-3xl border border-amber-700/30 p-6">
          <p className="text-[#9A6A12]/70 text-xs mb-1">{result.minutePillar ? '나의 오주십자 요약' : '나의 사주팔자 요약'}</p>
          <p className="text-stone-400 text-xs mb-4">
            {input.year}.{String(input.month).padStart(2,'0')}.{String(input.day).padStart(2,'0')}
            &nbsp;·&nbsp;{input.gender === 'male' ? '남성' : '여성'}
            &nbsp;·&nbsp;{dayBranch.animal}띠
          </p>

          {/* 팔자 8자 */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {pillars.map((p, i) => {
              const s = STEMS[p.stemIndex]
              const b = BRANCHES[p.branchIndex]
              return (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-3xl font-bold" style={{ color: ELEMENT_COLORS[s.element] }}>{s.hanja}</span>
                  <span className="text-3xl font-bold" style={{ color: ELEMENT_COLORS[b.element] }}>{b.hanja}</span>
                  <span className="text-xs text-stone-500 mt-1">{pillarLabels[i]}</span>
                </div>
              )
            })}
          </div>
          <p className="text-stone-500 text-xs mb-1">
            ({pillars.map(p => pillarNameKo(p)).join(' ')})
          </p>
        </div>

        {/* 일간 특성 */}
        <div
          className="rounded-3xl border p-5"
          style={{ backgroundColor: ELEMENT_COLORS[dayStem.element] + '18', borderColor: ELEMENT_COLORS[dayStem.element] + '40' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl font-bold" style={{ color: ELEMENT_COLORS[dayStem.element] }}>{dayStem.hanja}</span>
            <div>
              <p className="text-white font-bold text-lg">{dayStem.ko}({dayStem.hanja}) 일간</p>
              <p className="text-stone-400 text-xs">
                {ELEMENT_LABELS[dayStem.element]} {dayStem.yinYang === 'yang' ? '양(陽)' : '음(陰)'}
              </p>
            </div>
          </div>
          <p className="text-stone-300 text-sm leading-relaxed">{ILJU_MEANING[result.dayPillar.stemIndex]}</p>
        </div>

        {/* 오행 분포 */}
        <div className="bg-stone-800/60 rounded-3xl border border-stone-700/40 p-5">
          <p className="text-stone-400 text-xs mb-3">오행 분포</p>
          <div className="space-y-2.5">
            {elements.map(el => {
              const n   = ohaeng[el]
              const pct = (n / total) * 100
              return (
                <div key={el} className="flex items-center gap-2">
                  <span className="w-5 text-sm">{ELEMENT_EMOJI[el]}</span>
                  <span className="w-12 text-xs text-stone-400">{ELEMENT_LABELS[el]}</span>
                  <div className="flex-1 bg-stone-700 rounded-full h-3">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: ELEMENT_COLORS[el] }} />
                  </div>
                  <span className="w-4 text-right text-xs font-bold" style={{ color: ELEMENT_COLORS[el] }}>{n}</span>
                </div>
              )
            })}
          </div>
          <div className="flex gap-3 mt-4">
            <div className="flex-1 bg-stone-700/60 rounded-2xl p-3">
              <p className="text-xs text-stone-500 mb-1">강한 기운</p>
              <p className="text-sm font-bold" style={{ color: ELEMENT_COLORS[strongest] }}>
                {ELEMENT_EMOJI[strongest]} {ELEMENT_LABELS[strongest]}
              </p>
            </div>
            <div className="flex-1 bg-stone-700/60 rounded-2xl p-3">
              <p className="text-xs text-stone-500 mb-1">보완 필요</p>
              <p className="text-sm font-bold" style={{ color: ELEMENT_COLORS[weakest] }}>
                {ELEMENT_EMOJI[weakest]} {ELEMENT_LABELS[weakest]}
              </p>
            </div>
          </div>
        </div>

        {/* 현재 대운 */}
        {currentDaun && (
          <div className="bg-stone-800/60 rounded-3xl border border-stone-700/40 p-5">
            <p className="text-stone-400 text-xs mb-3">현재 대운 ({currentDaun.age}세~)</p>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center border"
                  style={{ backgroundColor: ELEMENT_COLORS[STEMS[currentDaun.pillar.stemIndex].element] + '20',
                           borderColor: ELEMENT_COLORS[STEMS[currentDaun.pillar.stemIndex].element] + '50' }}>
                  <span className="text-xl font-bold" style={{ color: ELEMENT_COLORS[STEMS[currentDaun.pillar.stemIndex].element] }}>
                    {STEMS[currentDaun.pillar.stemIndex].hanja}
                  </span>
                </div>
                <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center border"
                  style={{ backgroundColor: ELEMENT_COLORS[BRANCHES[currentDaun.pillar.branchIndex].element] + '20',
                           borderColor: ELEMENT_COLORS[BRANCHES[currentDaun.pillar.branchIndex].element] + '50' }}>
                  <span className="text-xl font-bold" style={{ color: ELEMENT_COLORS[BRANCHES[currentDaun.pillar.branchIndex].element] }}>
                    {BRANCHES[currentDaun.pillar.branchIndex].hanja}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-white font-bold text-lg">{pillarName(currentDaun.pillar)} 대운</p>
                <p className="text-stone-400 text-xs">{pillarNameKo(currentDaun.pillar)} · {currentAge - currentDaun.age + 1}년차</p>
              </div>
            </div>
          </div>
        )}

        {/* 행운 아이템 */}
        <div className="bg-stone-800/60 rounded-3xl border border-stone-700/40 p-5">
          <p className="text-stone-400 text-xs mb-3">나에게 필요한 에너지 ({ELEMENT_LABELS[weakest]} 보완)</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '행운 색상', value: LUCKY_COLOR[weakest].name, icon: '🎨' },
              { label: '행운 숫자', value: LUCKY_NUM[weakest], icon: '🔢' },
              { label: '행운 방향', value: LUCKY_DIR[weakest], icon: '🧭' },
              { label: '오늘 총운', value: `${sipsin} (${todayStar[sipsin] ?? 3}점/5점)`, icon: '🔮' },
            ].map(item => (
              <div key={item.label} className="bg-stone-700/50 rounded-2xl p-3">
                <p className="text-stone-500 text-xs mb-1">{item.icon} {item.label}</p>
                <p className="text-white text-sm font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 공유 버튼 */}
        <div className="bg-stone-800/60 rounded-3xl border border-stone-700/40 p-5">
          <p className="text-stone-400 text-xs mb-3">결과 공유하기</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleShare('kakao')}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition active:scale-95"
              style={{ backgroundColor: '#FEE500', color: '#3A1D1D' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.6 5.1 4 6.6l-.8 3.2 3.6-2.4c1 .2 2 .3 3.2.3 5.523 0 10-3.477 10-7.7S17.523 3 12 3z"/>
              </svg>
              카카오톡
            </button>
            <button
              onClick={() => handleShare('instagram')}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm text-white transition active:scale-95"
              style={{ background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              인스타그램
            </button>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onBack}
            className="py-3.5 bg-stone-700 text-stone-200 font-semibold rounded-2xl hover:bg-stone-600 transition text-sm"
          >
            ← 상세 결과
          </button>
          <button
            onClick={onReset}
            className="py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-2xl hover:from-amber-600 hover:to-orange-600 transition text-sm"
          >
            다시 입력 →
          </button>
        </div>
      </div>

      {/* 토스트 알림 */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-sm px-5 py-3 rounded-2xl shadow-xl z-50 whitespace-nowrap transition-all duration-300">
          {toast}
        </div>
      )}
    </div>
  )
}
