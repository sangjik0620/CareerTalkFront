export const getScoreColor = (score = 0) => {
  const s = Number(score) || 0;
  if (s >= 85) return "#16a34a";
  if (s >= 70) return "#2563eb";
  if (s >= 55) return "#f59e0b";
  return "#ef4444";
};

export const getScoreLabel = (score = 0) => {
  const s = Number(score) || 0;
  if (s >= 85) return "매우 우수";
  if (s >= 70) return "우수";
  if (s >= 55) return "보통";
  return "개선 필요";
};

export const clamp100 = (n) => Math.max(0, Math.min(100, Number(n) || 0));
export const isPlainObject = (v) =>
  v !== null && typeof v === "object" && !Array.isArray(v);
export const asArray = (v) => (Array.isArray(v) ? v : []);
export const hasItems = (arr) => Array.isArray(arr) && arr.length > 0;

export const safeJson = (s) => {
  if (!s || typeof s !== "string") return null;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};
export function normalizeTopPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;

  const normalized = n <= 1 ? n * 100 : n;
  return Math.max(0, Math.min(100, normalized));
}

export function topPercentToPercentile(value) {
  const top = normalizeTopPercent(value);
  if (top == null) return null;
  return 100 - top;
}

export function formatTopPercent(value) {
  const top = normalizeTopPercent(value);
  if (top == null) return "-";
  return `상위 ${Math.round(top)}%`;
}

export function formatPercentileFromTopPercent(value) {
  const percentile = topPercentToPercentile(value);
  if (percentile == null) return "-";
  return `${Math.round(percentile)}%`;
}