import { useState } from 'react'
import type { SajuResult, OhaengCount } from '../types'
import { STEMS, BRANCHES, ELEMENT_COLORS } from '../utils/constants'
import { calculateSaju, getSipsin } from '../utils/saju'
import { DAY_FORTUNE, MONTHLY_FORTUNE, YEARLY_FORTUNE, LUCKY_COLOR_MAP, LUCKY_COLOR_NAME, LUCKY_NUM, LUCKY_DIR, LUCKY_FOOD } from '../utils/fortuneData'

// ── 공통 UI ───────────────────────────────────────────────────────────

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-sm ${i < n ? 'text-[#9A6A12]' : 'text-[#D8C290]'}`}>★</span>
      ))}
    </div>
  )
}


function CategoryRow({ emoji, label, summary, detail, star }: {
  emoji: string; label: string; summary: string; detail: string; star: number
}) {
  return (
    <details className="border border-[#D8C290] rounded-2xl overflow-hidden group">
      <summary className="flex items-center gap-2 p-3.5 cursor-pointer list-none select-none hover:bg-[#E9DAB8] transition">
        <span className="text-base">{emoji}</span>
        <span className="text-sm font-semibold text-[#5C4A2E]">{label}</span>
        <span className="text-xs text-[#9A8155] flex-1 truncate">{summary}</span>
        <Stars n={star} />
        <span className="text-[#A89167] text-xs ml-1 shrink-0 group-open:rotate-180 transition-transform">▼</span>
      </summary>
      <div className="px-4 pb-4">
        <div className="h-px bg-[#D8C290] mb-3" />
        <p className="text-sm text-[#6E5836] leading-relaxed">{detail}</p>
      </div>
    </details>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────

interface Props {
  result: SajuResult
  ohaeng: OhaengCount
}

type SubTab = 'today' | 'month' | 'year'

export default function FortuneTabs({ result, ohaeng }: Props) {
  const [sub, setSub] = useState<SubTab>('today')

  const today     = new Date()
  const todayCalc = calculateSaju({
    year: today.getFullYear(), month: today.getMonth() + 1,
    day: today.getDate(), hour: today.getHours(), minute: null, gender: 'male',
  })

  const dayStemIdx  = result.dayPillar.stemIndex
  const todaySipsin = getSipsin(dayStemIdx, todayCalc.dayPillar.stemIndex)
  const monthSipsin = getSipsin(dayStemIdx, todayCalc.monthPillar.stemIndex)
  const yearSipsin  = getSipsin(dayStemIdx, todayCalc.yearPillar.stemIndex)

  const elements = ['wood', 'fire', 'earth', 'metal', 'water'] as const
  const luckyEl  = elements.reduce((a, b) => ohaeng[a] <= ohaeng[b] ? a : b)

  const todayData = DAY_FORTUNE[todaySipsin]       ?? DAY_FORTUNE['비견']
  const monthData = MONTHLY_FORTUNE[monthSipsin]   ?? MONTHLY_FORTUNE['비견']
  const yearData  = YEARLY_FORTUNE[yearSipsin]     ?? YEARLY_FORTUNE['비견']

  const todayStem   = STEMS[todayCalc.dayPillar.stemIndex]
  const todayBranch = BRANCHES[todayCalc.dayPillar.branchIndex]
  const monthStem   = STEMS[todayCalc.monthPillar.stemIndex]
  const monthBranch = BRANCHES[todayCalc.monthPillar.branchIndex]
  const yearStem    = STEMS[todayCalc.yearPillar.stemIndex]
  const yearBranch  = BRANCHES[todayCalc.yearPillar.branchIndex]

  const tabs = [
    { id: 'today' as SubTab, label: '오늘', star: todayData.star },
    { id: 'month' as SubTab, label: '이달', star: monthData.star },
    { id: 'year'  as SubTab, label: '올해', star: yearData.star  },
  ]

  return (
    <div className="bg-[#FBF4E2] rounded-3xl border border-[#D8C290] shadow-[0_2px_20px_rgba(201,150,42,0.10)] overflow-hidden">
      {/* 서브탭 */}
      <div className="flex gap-1 border-b border-[#D8C290] px-2 pt-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              sub === t.id
                ? 'text-[#9A6A12] bg-[#9A6A1215]'
                : 'text-[#9A8155] hover:text-[#6E5836]'
            }`}
          >
            <span>{t.label}</span>
            <span className="ml-1 text-xs">{'★'.repeat(Math.min(t.star, 5))}</span>
          </button>
        ))}
      </div>

      <div className="p-5 space-y-4">

        {/* ── 오늘의 운세 ── */}
        {sub === 'today' && (
          <>
            {/* 일주 배지 */}
            <div
              className="rounded-2xl p-4 border flex items-center justify-between"
              style={{ backgroundColor: todayData.color + '10', borderColor: todayData.color + '30' }}
            >
              <div>
                <p className="text-xs text-[#9A8155] mb-1">오늘 일주 · {today.getMonth()+1}/{today.getDate()}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-3xl font-bold" style={{ color: ELEMENT_COLORS[todayStem.element] }}>{todayStem.hanja}</span>
                  <span className="text-3xl font-bold" style={{ color: ELEMENT_COLORS[todayBranch.element] }}>{todayBranch.hanja}</span>
                  <span className="text-sm text-[#9A8155] ml-1">{todayStem.ko}{todayBranch.ko} · {todayBranch.animal}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold px-3 py-1 rounded-xl" style={{ backgroundColor: todayData.color + '20', color: todayData.color }}>
                  {todaySipsin}
                </span>
                <div className="mt-1.5 flex justify-end"><Stars n={todayData.star} /></div>
              </div>
            </div>

            {/* 조언 + 주의 */}
            <div className="bg-[#9A6A1215] border border-[#9A6A1230] rounded-2xl p-3.5">
              <p className="text-xs font-semibold text-[#9A6A12] mb-1">✨ 오늘의 조언</p>
              <p className="text-sm text-[#5C4A2E] leading-relaxed">{todayData.조언}</p>
            </div>
            <div className="bg-red-900/20 border border-red-900/40 rounded-2xl px-4 py-2.5 flex items-center gap-2">
              <span>⚠️</span>
              <p className="text-xs text-[#6E5836]"><span className="font-semibold text-red-400">주의 </span>{todayData.주의}</p>
            </div>

            {/* 항목별 */}
            <div className="space-y-2">
              {([
                { emoji: '🔮', label: '총운',  key: '총평' as const,  star: todayData.star },
                { emoji: '💰', label: '재물운', key: '재물' as const,  star: Math.max(1, todayData.star - 1) },
                { emoji: '💕', label: '애정운', key: '애정' as const,  star: Math.max(1, todayData.star) },
                { emoji: '💪', label: '건강운', key: '건강' as const,  star: Math.max(1, todayData.star) },
                { emoji: '💼', label: '직장운', key: '직업' as const,  star: Math.min(5, todayData.star + 1) },
              ]).map(c => (
                <CategoryRow key={c.key} emoji={c.emoji} label={c.label}
                  summary={todayData[c.key].slice(0, 20) + '…'}
                  detail={todayData[c.key]} star={c.star} />
              ))}
            </div>

            {/* 시간대별 */}
            <div>
              <p className="text-sm font-semibold text-[#5C4A2E] mb-2">🕐 시간대별</p>
              <div className="space-y-2">
                {[
                  { icon: '🌅', label: '오전 06~12시', text: todayData.시간오전 },
                  { icon: '☀️',  label: '오후 12~18시', text: todayData.시간오후 },
                  { icon: '🌙', label: '저녁 18~24시', text: todayData.시간저녁 },
                ].map(t => (
                  <div key={t.label} className="flex gap-3 bg-[#E9DAB8] border border-[#D8C290] rounded-2xl px-4 py-3">
                    <span className="shrink-0">{t.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-[#9A8155] mb-0.5">{t.label}</p>
                      <p className="text-sm text-[#5C4A2E]">{t.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 행운 아이템 */}
            <div>
              <p className="text-sm font-semibold text-[#5C4A2E] mb-2">🍀 오늘의 행운</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '행운 색상', value: LUCKY_COLOR_NAME[luckyEl], dot: LUCKY_COLOR_MAP[luckyEl] },
                  { label: '행운 숫자', value: LUCKY_NUM[luckyEl],         dot: null },
                  { label: '행운 방향', value: LUCKY_DIR[luckyEl],         dot: null },
                  { label: '행운 음식', value: LUCKY_FOOD[luckyEl],        dot: null },
                ].map(item => (
                  <div key={item.label} className="bg-[#9A6A1215] border border-[#9A6A1230] rounded-2xl p-3">
                    <p className="text-xs text-[#9A8155] mb-1">{item.label}</p>
                    <div className="flex items-center gap-1.5">
                      {item.dot && <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.dot }} />}
                      <p className="text-sm font-semibold text-[#5C4A2E]">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── 이달의 운세 ── */}
        {sub === 'month' && (
          <>
            <div
              className="rounded-2xl p-4 border flex items-center justify-between"
              style={{ backgroundColor: ELEMENT_COLORS[monthStem.element] + '10', borderColor: ELEMENT_COLORS[monthStem.element] + '30' }}
            >
              <div>
                <p className="text-xs text-[#9A8155] mb-1">이달 월주 · {today.getFullYear()}.{String(today.getMonth()+1).padStart(2,'0')}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-3xl font-bold" style={{ color: ELEMENT_COLORS[monthStem.element] }}>{monthStem.hanja}</span>
                  <span className="text-3xl font-bold" style={{ color: ELEMENT_COLORS[monthBranch.element] }}>{monthBranch.hanja}</span>
                  <span className="text-sm text-[#9A8155] ml-1">{monthStem.ko}{monthBranch.ko}월</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold px-3 py-1 rounded-xl bg-[#9A6A1220] text-[#9A6A12] border border-[#9A6A1240]">{monthSipsin}</span>
                <div className="mt-1.5 flex justify-end"><Stars n={monthData.star} /></div>
              </div>
            </div>

            <div className="bg-[#9A6A1215] border border-[#9A6A1230] rounded-2xl p-3.5">
              <p className="text-xs font-semibold text-[#9A6A12] mb-1">📅 이달의 조언</p>
              <p className="text-sm text-[#5C4A2E] leading-relaxed">{monthData.조언}</p>
            </div>

            <div className="space-y-2">
              {([
                { emoji: '🔮', label: '총운',  text: monthData.총평 },
                { emoji: '💰', label: '재물운', text: monthData.재물 },
                { emoji: '💕', label: '애정운', text: monthData.애정 },
                { emoji: '💪', label: '건강운', text: monthData.건강 },
                { emoji: '💼', label: '직장운', text: monthData.직업 },
              ]).map((c, i) => {
                const stars = [monthData.star, Math.max(1,monthData.star-1), monthData.star, monthData.star, Math.min(5,monthData.star+1)]
                return <CategoryRow key={c.label} emoji={c.emoji} label={c.label}
                  summary={c.text.slice(0, 20) + '…'} detail={c.text} star={stars[i]} />
              })}
            </div>
          </>
        )}

        {/* ── 올해의 운세 ── */}
        {sub === 'year' && (
          <>
            <div
              className="rounded-2xl p-4 border flex items-center justify-between"
              style={{ backgroundColor: ELEMENT_COLORS[yearStem.element] + '10', borderColor: ELEMENT_COLORS[yearStem.element] + '30' }}
            >
              <div>
                <p className="text-xs text-[#9A8155] mb-1">올해 년주 · {today.getFullYear()}년</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-3xl font-bold" style={{ color: ELEMENT_COLORS[yearStem.element] }}>{yearStem.hanja}</span>
                  <span className="text-3xl font-bold" style={{ color: ELEMENT_COLORS[yearBranch.element] }}>{yearBranch.hanja}</span>
                  <span className="text-sm text-[#9A8155] ml-1">{yearStem.ko}{yearBranch.ko}년 · {yearBranch.animal}의 해</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold px-3 py-1 rounded-xl bg-[#9A6A1220] text-[#9A6A12] border border-[#9A6A1240]">{yearSipsin}</span>
                <div className="mt-1.5 flex justify-end"><Stars n={yearData.star} /></div>
              </div>
            </div>

            <div className="bg-[#9A6A1215] border border-[#9A6A1230] rounded-2xl p-3.5">
              <p className="text-xs font-semibold text-[#9A6A12] mb-1">🗓️ 올해의 조언</p>
              <p className="text-sm text-[#5C4A2E] leading-relaxed">{yearData.조언}</p>
            </div>

            <div className="space-y-2">
              {([
                { emoji: '🔮', label: '총운',  text: yearData.총평 },
                { emoji: '💰', label: '재물운', text: yearData.재물 },
                { emoji: '💕', label: '애정운', text: yearData.애정 },
                { emoji: '💪', label: '건강운', text: yearData.건강 },
                { emoji: '💼', label: '직업운', text: yearData.직업 },
              ]).map((c, i) => {
                const stars = [yearData.star, Math.max(1,yearData.star-1), yearData.star, yearData.star, Math.min(5,yearData.star+1)]
                return <CategoryRow key={c.label} emoji={c.emoji} label={c.label}
                  summary={c.text.slice(0, 20) + '…'} detail={c.text} star={stars[i]} />
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
