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
