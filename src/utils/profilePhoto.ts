import { scheduleCloudPush } from './cloudSync'

const PHOTO_KEY = 'unmyeongbom_profile_photo'
const MAX_DIMENSION = 240
const JPEG_QUALITY = 0.82

export function loadProfilePhoto(): string | null {
  try {
    const s = localStorage.getItem(PHOTO_KEY)
    return s ? (JSON.parse(s) as string) : null
  } catch { return null }
}

export function saveProfilePhoto(dataUrl: string): void {
  localStorage.setItem(PHOTO_KEY, JSON.stringify(dataUrl))
  scheduleCloudPush()
}

export function clearProfilePhoto(): void {
  localStorage.removeItem(PHOTO_KEY)
  scheduleCloudPush()
}

// 업로드한 이미지를 작은 정사각형 썸네일(JPEG)로 축소해 data URL로 반환한다.
// 매칭 상대 등 다른 사용자에게도 전송될 수 있으므로 용량을 가볍게 유지한다.
export function resizeImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) { reject(new Error('이미지 파일만 업로드할 수 있어요')); return }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('파일을 읽을 수 없어요'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('이미지를 불러올 수 없어요'))
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
        const w = Math.max(1, Math.round(img.width * scale))
        const h = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('이미지를 처리할 수 없어요')); return }
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}
