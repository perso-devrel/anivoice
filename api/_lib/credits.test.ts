import { describe, it, expect } from 'vitest';
import {
  getPlanCredits,
  PLAN_CREDITS,
  computeDeductSeconds,
  clampHistoryDays,
  mapHistoryRow,
} from './credits';

describe('getPlanCredits', () => {
  it('returns 360000 for free plan', () => {
    expect(getPlanCredits('free')).toBe(360000);
  });

  it('returns 1080000 for basic plan', () => {
    expect(getPlanCredits('basic')).toBe(1080000);
  });

  it('returns 3600000 for pro plan', () => {
    expect(getPlanCredits('pro')).toBe(3600000);
  });

  it('falls back to 60 for unknown plan', () => {
    expect(getPlanCredits('enterprise')).toBe(60);
  });

  it('falls back to 60 for empty string', () => {
    expect(getPlanCredits('')).toBe(60);
  });

  it('PLAN_CREDITS has exactly 3 entries', () => {
    expect(Object.keys(PLAN_CREDITS)).toHaveLength(3);
  });
});

describe('computeDeductSeconds', () => {
  it('converts ms to seconds (ceil) for 1 language', () => {
    expect(computeDeductSeconds(50675, 1)).toBe(51);
  });

  it('multiplies by language count', () => {
    expect(computeDeductSeconds(50675, 3)).toBe(51 * 3);
  });

  it('rounds duration up', () => {
    expect(computeDeductSeconds(1001, 1)).toBe(2);
  });

  it('exact second boundary', () => {
    expect(computeDeductSeconds(3000, 1)).toBe(3);
  });

  it('floors languageCount', () => {
    expect(computeDeductSeconds(1000, 2.9)).toBe(2);
  });

  it('clamps languageCount to at least 1', () => {
    expect(computeDeductSeconds(5000, 0)).toBe(5);
    expect(computeDeductSeconds(5000, -3)).toBe(5);
  });

  it('handles zero duration', () => {
    expect(computeDeductSeconds(0, 1)).toBe(0);
  });
});

describe('clampHistoryDays', () => {
  it('defaults to 30 for undefined', () => {
    expect(clampHistoryDays(undefined)).toBe(30);
  });

  it('defaults to 30 for NaN string', () => {
    expect(clampHistoryDays('abc')).toBe(30);
  });

  it('passes through valid number within range', () => {
    expect(clampHistoryDays(60)).toBe(60);
  });

  it('clamps to 90 when above max', () => {
    expect(clampHistoryDays(365)).toBe(90);
  });

  it('defaults to 30 for zero', () => {
    expect(clampHistoryDays(0)).toBe(30);
  });

  it('handles string number', () => {
    expect(clampHistoryDays('45')).toBe(45);
  });
});

describe('mapHistoryRow', () => {
  it('maps db row to DTO', () => {
    const row = { day: '2026-04-10', used_seconds: 120, tx_count: 3 };
    expect(mapHistoryRow(row)).toEqual({
      day: '2026-04-10',
      usedSeconds: 120,
      txCount: 3,
    });
  });

  it('coerces string values to numbers', () => {
    const row = { day: '2026-04-10', used_seconds: '500', tx_count: '2' };
    expect(mapHistoryRow(row)).toEqual({
      day: '2026-04-10',
      usedSeconds: 500,
      txCount: 2,
    });
  });

  it('handles null values gracefully', () => {
    const row = { day: null, used_seconds: null, tx_count: null };
    const result = mapHistoryRow(row);
    expect(result.day).toBe('null');
    expect(result.usedSeconds).toBe(0);
    expect(result.txCount).toBe(0);
  });
});
