const NICKNAME_KEY = 'unmyeongbom_nickname'

// 클라우드 동기화(cloudSync.applyLocalData)는 문자열 값을 그대로(JSON 인코딩 없이) 저장하므로,
// 여기서도 JSON.stringify로 한 번 더 감싸면 안 된다 (감싸면 로그아웃 후 재로그인 시 닉네임이 초기화됨).
export function loadNickname(): string {
  const s = localStorage.getItem(NICKNAME_KEY)
  if (!s) return ''
  // 이전 버전은 JSON.stringify로 감싸 저장했다 (예: '"홍길동"'). 그 형식이면 한 번 풀어준다.
  if (s.startsWith('"') && s.endsWith('"')) {
    try { return JSON.parse(s) as string } catch { /* 풀 수 없으면 그대로 사용 */ }
  }
  return s
}

export function saveNickname(nickname: string): void {
  localStorage.setItem(NICKNAME_KEY, nickname)
}
