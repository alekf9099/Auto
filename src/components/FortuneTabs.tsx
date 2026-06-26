import { useState } from 'react'
import type { SajuResult, OhaengCount } from '../types'
import { STEMS, BRANCHES, ELEMENT_COLORS } from '../utils/constants'
import { calculateSaju, getSipsin } from '../utils/saju'
import { DAY_FORTUNE, MONTHLY_FORTUNE, YEARLY_FORTUNE, LUCKY_COLOR_MAP, LUCKY_COLOR_NAME, LUCKY_NUM, LUCKY_DIR, LUCKY_FOOD } from '../utils/fortuneData'
import {
  IcGeneralLuck, IcWealthLuck, IcLoveLuck, IcHealthLuck, IcCareerLuck,
  IcMorning, IcAfternoon, IcEvening, IcCloverLucky, IcSparkleKeyword,
} from './icons/SajuIcons'

type IconCmp = React.FC<{ size?: number; className?: string }>

// 운세 카테고리 — 아이콘 + 의미별 강조색 (이모지 대신 통일된 SVG 아이콘 사용)
const CATS: { Icon: IconCmp; label: string; key: '총평' | '재물' | '애정' | '건강' | '직업'; accent: string }[] = [
  { Icon: IcGeneralLuck, label: '총운',   key: '총평', accent: '#C9962A' },
  { Icon: IcWealthLuck,  label: '재물운', key: '재물', accent: '#E8B84B' },
  { Icon: IcLoveLuck,    label: '애정운', key: '애정', accent: '#E05282' },
  { Icon: IcHealthLuck,  label: '건강운', key: '건강', accent: '#4BBF7E' },
  { Icon: IcCareerLuck,  label: '직장운', key: '직업', accent: '#5B9BD5' },
]

function catStars(base: number): number[] {
  return [base, Math.max(1, base - 1), base, base, Math.min(5, base + 1)]
}

// ── 공통 UI ───────────────────────────────────────────────────────────

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-sm ${i < n ? 'text-amber-400' : 'text-[#3D3358]'}`}>★</span>
      ))}
    </div>
  )
}


function CategoryRow({ Icon, accent, label, summary, detail, star }: {
  Icon: IconCmp; accent: string; label: string; summary: string; detail: string; star: number
}) {
  return (
    <details className="border border-[#2A1F4A] rounded-2xl overflow-hidden group">
      <summary className="flex items-center gap-2 p-3.5 cursor-pointer list-none select-none hover:bg-[#1C1438] transition">
        <span className="shrink-0" style={{ color: accent }}><Icon size={18} /></span>
        <span className="text-sm font-semibold text-[#C4B8D8]">{label}</span>
        <span className="text-xs text-[#A79CC2] flex-1 truncate">{summary}</span>
        <Stars n={star} />
        <span className="text-[#857AA0] text-xs ml-1 shrink-0 group-open:rotate-180 transition-transform">▼</span>
      </summary>
      <div className="px-4 pb-4">
        <div className="h-px bg-[#2A1F4A] mb-3" />
        <p className="text-sm text-[#BCB1D4] leading-relaxed">{detail}</p>
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
    <div className="bg-[#130E24] rounded-3xl border border-[#2A1F4A] shadow-[0_2px_20px_rgba(201,150,42,0.10)] overflow-hidden">
      {/* 서브탭 */}
      <div className="flex gap-1 border-b border-[#2A1F4A] px-2 pt-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              sub === t.id
                ? 'text-[#C9962A] bg-[#C9962A15]'
                : 'text-[#A79CC2] hover:text-[#BCB1D4]'
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
                <p className="text-xs text-[#A79CC2] mb-1">오늘 일주 · {today.getMonth()+1}/{today.getDate()}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-3xl font-bold" style={{ color: ELEMENT_COLORS[todayStem.element] }}>{todayStem.hanja}</span>
                  <span className="text-3xl font-bold" style={{ color: ELEMENT_COLORS[todayBranch.element] }}>{todayBranch.hanja}</span>
                  <span className="text-sm text-[#A79CC2] ml-1">{todayStem.ko}{todayBranch.ko} · {todayBranch.animal}</span>
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
            <div className="bg-[#C9962A15] border border-[#C9962A30] rounded-2xl p-3.5">
              <p className="text-xs font-semibold text-[#C9962A] mb-1 flex items-center gap-1"><IcSparkleKeyword size={13} /> 오늘의 조언</p>
              <p className="text-sm text-[#C4B8D8] leading-relaxed">{todayData.조언}</p>
            </div>
            <div className="bg-red-900/20 border border-red-900/40 rounded-2xl px-4 py-2.5 flex items-start gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5"><path d="M12 4l9 16H3z" stroke="#F87171" strokeWidth="1.8" strokeLinejoin="round"/><path d="M12 10v4" stroke="#F87171" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="17" r="0.6" fill="#F87171"/></svg>
              <p className="text-xs text-[#BCB1D4]"><span className="font-semibold text-red-400">주의 </span>{todayData.주의}</p>
            </div>

            {/* 항목별 */}
            <div className="space-y-2">
              {CATS.map((c, i) => (
                <CategoryRow key={c.key} Icon={c.Icon} accent={c.accent} label={c.label}
                  summary={todayData[c.key].slice(0, 20) + '…'}
                  detail={todayData[c.key]} star={catStars(todayData.star)[i]} />
              ))}
            </div>

            {/* 시간대별 */}
            <div>
              <p className="text-sm font-semibold text-[#C4B8D8] mb-2">시간대별</p>
              <div className="space-y-2">
                {[
                  { Icon: IcMorning,   label: '오전 06~12시', text: todayData.시간오전 },
                  { Icon: IcAfternoon, label: '오후 12~18시', text: todayData.시간오후 },
                  { Icon: IcEvening,   label: '저녁 18~24시', text: todayData.시간저녁 },
                ].map(t => (
                  <div key={t.label} className="flex gap-3 bg-[#1C1438] border border-[#2A1F4A] rounded-2xl px-4 py-3">
                    <span className="shrink-0 text-[#C9962A] mt-0.5"><t.Icon size={18} /></span>
                    <div>
                      <p className="text-xs font-semibold text-[#A79CC2] mb-0.5">{t.label}</p>
                      <p className="text-sm text-[#C4B8D8]">{t.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 행운 아이템 */}
            <div>
              <p className="text-sm font-semibold text-[#C4B8D8] mb-2 flex items-center gap-1.5"><IcCloverLucky size={16} className="text-[#C9962A]" /> 오늘의 행운</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '행운 색상', value: LUCKY_COLOR_NAME[luckyEl], dot: LUCKY_COLOR_MAP[luckyEl] },
                  { label: '행운 숫자', value: LUCKY_NUM[luckyEl],         dot: null },
                  { label: '행운 방향', value: LUCKY_DIR[luckyEl],         dot: null },
                  { label: '행운 음식', value: LUCKY_FOOD[luckyEl],        dot: null },
                ].map(item => (
                  <div key={item.label} className="bg-[#C9962A15] border border-[#C9962A30] rounded-2xl p-3">
                    <p className="text-xs text-[#A79CC2] mb-1">{item.label}</p>
                    <div className="flex items-center gap-1.5">
                      {item.dot && <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.dot }} />}
                      <p className="text-sm font-semibold text-[#C4B8D8]">{item.value}</p>
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
                <p className="text-xs text-[#A79CC2] mb-1">이달 월주 · {today.getFullYear()}.{String(today.getMonth()+1).padStart(2,'0')}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-3xl font-bold" style={{ color: ELEMENT_COLORS[monthStem.element] }}>{monthStem.hanja}</span>
                  <span className="text-3xl font-bold" style={{ color: ELEMENT_COLORS[monthBranch.element] }}>{monthBranch.hanja}</span>
                  <span className="text-sm text-[#A79CC2] ml-1">{monthStem.ko}{monthBranch.ko}월</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold px-3 py-1 rounded-xl bg-[#C9962A20] text-[#C9962A] border border-[#C9962A40]">{monthSipsin}</span>
                <div className="mt-1.5 flex justify-end"><Stars n={monthData.star} /></div>
              </div>
            </div>

            <div className="bg-[#C9962A15] border border-[#C9962A30] rounded-2xl p-3.5">
              <p className="text-xs font-semibold text-[#C9962A] mb-1 flex items-center gap-1"><IcSparkleKeyword size={13} /> 이달의 조언</p>
              <p className="text-sm text-[#C4B8D8] leading-relaxed">{monthData.조언}</p>
            </div>

            <div className="space-y-2">
              {CATS.map((c, i) => (
                <CategoryRow key={c.key} Icon={c.Icon} accent={c.accent} label={c.label}
                  summary={monthData[c.key].slice(0, 20) + '…'} detail={monthData[c.key]} star={catStars(monthData.star)[i]} />
              ))}
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
                <p className="text-xs text-[#A79CC2] mb-1">올해 년주 · {today.getFullYear()}년</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-3xl font-bold" style={{ color: ELEMENT_COLORS[yearStem.element] }}>{yearStem.hanja}</span>
                  <span className="text-3xl font-bold" style={{ color: ELEMENT_COLORS[yearBranch.element] }}>{yearBranch.hanja}</span>
                  <span className="text-sm text-[#A79CC2] ml-1">{yearStem.ko}{yearBranch.ko}년 · {yearBranch.animal}의 해</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold px-3 py-1 rounded-xl bg-[#C9962A20] text-[#C9962A] border border-[#C9962A40]">{yearSipsin}</span>
                <div className="mt-1.5 flex justify-end"><Stars n={yearData.star} /></div>
              </div>
            </div>

            <div className="bg-[#C9962A15] border border-[#C9962A30] rounded-2xl p-3.5">
              <p className="text-xs font-semibold text-[#C9962A] mb-1 flex items-center gap-1"><IcSparkleKeyword size={13} /> 올해의 조언</p>
              <p className="text-sm text-[#C4B8D8] leading-relaxed">{yearData.조언}</p>
            </div>

            <div className="space-y-2">
              {CATS.map((c, i) => (
                <CategoryRow key={c.key} Icon={c.Icon} accent={c.accent} label={c.label}
                  summary={yearData[c.key].slice(0, 20) + '…'} detail={yearData[c.key]} star={catStars(yearData.star)[i]} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
