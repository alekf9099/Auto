import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setIdToken, setProvider, scheduleCloudPush, pullCloudData } from './cloudSync'
import { loadNickname, saveNickname } from './nickname'
import { loadProfilePhoto, saveProfilePhoto } from './profilePhoto'

beforeEach(() => {
  localStorage.clear()
  setIdToken('fake-token')
  setProvider('google')
})

// 닉네임/프로필 사진처럼 문자열을 JSON.stringify로 감싸 저장하던 값들이
// 클라우드 푸시 → 풀 왕복을 거치고도 그대로 복원되는지 확인한다.
// (감싸서 저장하면 applyLocalData가 인용부호 없는 원문을 그대로 적어, 다음 로드 시
//  JSON.parse가 실패해 빈 값으로 초기화되는 버그가 있었다.)
describe('cloud sync round-trip of string-valued local data', () => {
  it('preserves nickname and profile photo across a push → pull cycle', async () => {
    vi.useFakeTimers()
    try {
      saveNickname('홍길동')
      saveProfilePhoto('data:image/png;base64,abc123')

      let pushedBody: Record<string, unknown> | null = null
      const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
        pushedBody = JSON.parse(init.body as string)
        return { ok: true, status: 200, json: async () => ({ ok: true }) } as Response
      })
      vi.stubGlobal('fetch', fetchMock)

      scheduleCloudPush()
      await vi.advanceTimersByTimeAsync(1000)

      expect(pushedBody).not.toBeNull()
      const pushedData = pushedBody!.data as Record<string, unknown>

      // 로그아웃 후 재로그인했다고 가정 — 로컬 값을 지우고, 위에서 푸시했던 데이터를 풀로 받는다.
      localStorage.clear()
      setIdToken('fake-token')
      setProvider('google')
      vi.stubGlobal('fetch', vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ data: pushedData }),
      })))

      await pullCloudData()

      expect(loadNickname()).toBe('홍길동')
      expect(loadProfilePhoto()).toBe('data:image/png;base64,abc123')
    } finally {
      vi.useRealTimers()
      vi.unstubAllGlobals()
    }
  })
})

describe('nickname / profilePhoto backward compatibility', () => {
  it('unwraps the old JSON.stringify-wrapped format on read', () => {
    localStorage.setItem('unmyeongbom_nickname', JSON.stringify('구버전닉네임'))
    expect(loadNickname()).toBe('구버전닉네임')

    localStorage.setItem('unmyeongbom_profile_photo', JSON.stringify('data:image/png;base64,old'))
    expect(loadProfilePhoto()).toBe('data:image/png;base64,old')
  })
})
