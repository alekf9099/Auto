import { IcHome, IcSaju, IcStamp, IcLucky } from './icons/SajuIcons'

export type NavTab = 'home' | 'saju' | 'attendance' | 'lucky'

interface Props {
  current: NavTab
  onNavigate: (tab: NavTab) => void
}

const TABS: { key: NavTab; label: string; Icon: typeof IcHome }[] = [
  { key: 'home',       label: '홈',   Icon: IcHome  },
  { key: 'saju',       label: '사주', Icon: IcSaju  },
  { key: 'attendance', label: '출석', Icon: IcStamp },
  { key: 'lucky',      label: '행운', Icon: IcLucky },
]

export default function BottomNav({ current, onNavigate }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#130E24]/95 backdrop-blur-md border-t border-[#2A1F4A]">
      <div className="max-w-2xl mx-auto grid grid-cols-4">
        {TABS.map(tab => {
          const active = current === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => onNavigate(tab.key)}
              className="flex flex-col items-center gap-1 py-2.5 active:scale-95 transition-transform"
            >
              <tab.Icon size={20} className={active ? 'text-[#C9962A]' : 'text-[#7B6F9A]'} />
              <span className={`text-[10px] font-semibold ${active ? 'text-[#C9962A]' : 'text-[#7B6F9A]'}`}>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
