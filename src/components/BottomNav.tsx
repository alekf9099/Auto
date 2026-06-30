import { IcHome, IcSaju, IcStamp, IcLucky, IcMatch } from './icons/SajuIcons'

export type NavTab = 'home' | 'saju' | 'match' | 'attendance' | 'event'

interface Props {
  current: NavTab
  onNavigate: (tab: NavTab) => void
  matchBadge?: number
}

const TABS: { key: NavTab; label: string; Icon: typeof IcHome; center?: boolean }[] = [
  { key: 'home',       label: '홈',     Icon: IcHome  },
  { key: 'saju',       label: '사주',   Icon: IcSaju  },
  { key: 'match',      label: '매칭',   Icon: IcMatch, center: true },
  { key: 'attendance', label: '출석',   Icon: IcStamp },
  { key: 'event',      label: '이벤트', Icon: IcLucky },
]

export default function BottomNav({ current, onNavigate, matchBadge = 0 }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#130E24]/95 backdrop-blur-md border-t border-[#2A1F4A]">
      <div className="max-w-2xl mx-auto grid grid-cols-5 gap-1 px-1">
        {TABS.map(tab => {
          const active = current === tab.key

          // 가운데 '매칭' 탭 — 메인 기능이라 도드라지게 강조
          if (tab.center) {
            return (
              <button
                key={tab.key}
                onClick={() => onNavigate(tab.key)}
                aria-label="사주매칭"
                className="relative flex flex-col items-center active:scale-95 transition-transform"
              >
                <span
                  className="relative -mt-5 w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #C9962A, #E8B84B)',
                    boxShadow: '0 4px 14px rgba(201,150,42,0.45)',
                    border: '3px solid #130E24',
                  }}
                >
                  <tab.Icon size={26} className="text-[#1A0E30]" />
                  {matchBadge > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E05282] text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#130E24]">
                      {matchBadge > 99 ? '99+' : matchBadge}
                    </span>
                  )}
                </span>
                <span className={`text-[10px] font-bold -mt-0.5 ${active ? 'text-[#E8C75C]' : 'text-[#C9962A]'}`}>{tab.label}</span>
              </button>
            )
          }

          return (
            <button
              key={tab.key}
              onClick={() => onNavigate(tab.key)}
              className="flex flex-col items-center gap-1 py-2.5 active:scale-95 transition-transform"
            >
              <tab.Icon size={20} className={active ? 'text-[#C9962A]' : 'text-[#A79CC2]'} />
              <span className={`text-[10px] font-semibold ${active ? 'text-[#C9962A]' : 'text-[#A79CC2]'}`}>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
