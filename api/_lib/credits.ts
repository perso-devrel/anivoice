export const PLAN_CREDITS: Record<string, number> = {
  free: 360000,
  basic: 1080000,
  pro: 3600000,
};

export function getPlanCredits(plan: string): number {
  return PLAN_CREDITS[plan] ?? 60;
}

export function computeDeductSeconds(durationMs: number, languageCount: number): number {
  return Math.ceil(durationMs / 1000) * Math.max(1, Math.floor(languageCount));
}

export function clampHistoryDays(raw: unknown): number {
  return Math.min(Number(raw) || 30, 90);
}

export function mapHistoryRow(row: Record<string, unknown>) {
  return {
    day: String(row.day),
    usedSeconds: Number(row.used_seconds),
    txCount: Number(row.tx_count),
  };
}
