const NICKNAME_KEY = 'unmyeongbom_nickname'

export function loadNickname(): string {
  try {
    const s = localStorage.getItem(NICKNAME_KEY)
    return s ? (JSON.parse(s) as string) : ''
  } catch { return '' }
}

export function saveNickname(nickname: string): void {
  localStorage.setItem(NICKNAME_KEY, JSON.stringify(nickname))
}
