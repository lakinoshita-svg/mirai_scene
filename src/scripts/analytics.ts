// ホストが明示的に有効化した場合だけ既存dataLayerへ渡す。送信先や同意管理はホスト側。
// 回答・自由入力・地域・個人識別子はイベントに含めない。
type EventDetail = { experienceId?: string; sceneNumber?: number; destination?: string; destinationId?: string };
export function track(event: string, detail: EventDetail = {}) {
  const host = window as Window & { miraiSceneAnalyticsEnabled?: boolean; dataLayer?: Record<string, unknown>[] };
  if (host.miraiSceneAnalyticsEnabled !== true) return;
  (host.dataLayer ||= []).push({event: `miraiScene_${event}`, ...detail});
}
