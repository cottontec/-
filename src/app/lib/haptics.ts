/**
 * スマホのバイブレーションを使った軽い触覚フィードバック。
 * 対応していない端末では何もしない。ユーザーが「モーション減らす」設定を
 * 有効にしている場合は静かに無視される。
 */
function canVibrate(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return false;
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  } catch { /* noop */ }
  return true;
}

export function tapLight() {
  if (canVibrate()) navigator.vibrate(8);
}

export function tapMedium() {
  if (canVibrate()) navigator.vibrate(18);
}

export function tapSuccess() {
  if (canVibrate()) navigator.vibrate([12, 40, 12]);
}

export function tapError() {
  if (canVibrate()) navigator.vibrate([30, 60, 30, 60, 30]);
}
