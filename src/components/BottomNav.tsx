import { IcHome, IcSaju, IcStamp, IcLucky } from './icons/SajuIcons'

export type NavTab = 'home' | 'saju' | 'attendance' | 'event'

interface Props {
  current: NavTab
  onNavigate: (tab: NavTab) => void
}

const TABS: { key: NavTab; label: string; Icon: typeof IcHome }[] = [
  { key: 'home',       label: '홈',     Icon: IcHome  },
  { key: 'saju',       label: '사주',   Icon: IcSaju  },
  { key: 'attendance', label: '출석',   Icon: IcStamp },
  { key: 'event',      label: '이벤트', Icon: IcLucky },
]

export default function BottomNav({ current, onNavigate }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#FBF4E2]/95 backdrop-blur-md border-t border-[#D8C290]">
      <div className="max-w-2xl mx-auto grid grid-cols-4 gap-1 px-1">
        {TABS.map(tab => {
          const active = current === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => onNavigate(tab.key)}
              className="flex flex-col items-center gap-1 py-2.5 active:scale-95 transition-transform"
            >
              <tab.Icon size={20} className={active ? 'text-[#9A6A12]' : 'text-[#9A8155]'} />
              <span className={`text-[10px] font-semibold ${active ? 'text-[#9A6A12]' : 'text-[#9A8155]'}`}>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
