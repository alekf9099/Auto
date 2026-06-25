// 리워드(보상형) 광고 추상화 레이어.
//
// 현재는 웹(PWA)이라 실제 리워드 광고가 없으므로 비활성화(REWARDED_ADS_ENABLED=false)되어 있다.
// 플레이스토어용 TWA/네이티브 래퍼로 패키징할 때 Google AdMob 리워드 광고를 연동하고,
// 아래 showRewardedAd()만 실제 구현으로 교체한 뒤 플래그를 true로 바꾸면 UI가 활성화된다.
//
// 연동 방식(택1):
//  1) 네이티브 래퍼(Capacitor/Flutter/RN) + AdMob 플러그인 → JS 브리지로 광고 호출
//  2) TWA + Android 측 AdMob → window.postMessage/JS interface 브리지
//
// 정책: 보상은 "광고를 끝까지 시청"한 경우에만 지급한다(onUserEarnedReward). 중도 종료 시 false.
// 어뷰징 방지는 클라이언트 하루 상한(REWARDED_AD_DAILY_CAP) + 서버 검증(api/sync.ts POINT_RULES)로 이중 처리한다.

export const REWARDED_ADS_ENABLED = false

// 광고를 한 번 노출하고, 끝까지 시청해 보상 조건을 충족하면 true를 반환한다.
export async function showRewardedAd(): Promise<boolean> {
  if (!REWARDED_ADS_ENABLED) return false

  // TODO(출시): AdMob 리워드 광고로 교체.
  // 예) const earned = await nativeBridge.showRewarded('ca-app-pub-xxx/yyy'); return earned
  // 아래는 연동 전 UI 흐름 확인용 목업(0.8초 후 보상 성공).
  return new Promise(resolve => setTimeout(() => resolve(true), 800))
}
