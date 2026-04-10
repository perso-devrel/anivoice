import { describe, it, expect } from 'vitest';
import { formatMs } from './format';

describe('formatMs', () => {
  it('formats zero', () => {
    expect(formatMs(0)).toBe('00:00');
  });

  it('formats sub-second values to 00:00', () => {
    expect(formatMs(999)).toBe('00:00');
    expect(formatMs(500)).toBe('00:00');
  });

  it('formats exact seconds', () => {
    expect(formatMs(1000)).toBe('00:01');
    expect(formatMs(5000)).toBe('00:05');
    expect(formatMs(59000)).toBe('00:59');
  });

  it('pads single-digit seconds', () => {
    expect(formatMs(3000)).toBe('00:03');
  });

  it('formats exact minutes', () => {
    expect(formatMs(60000)).toBe('01:00');
    expect(formatMs(120000)).toBe('02:00');
  });

  it('formats minutes and seconds', () => {
    expect(formatMs(90000)).toBe('01:30');
    expect(formatMs(61000)).toBe('01:01');
  });

  it('pads single-digit minutes', () => {
    expect(formatMs(65000)).toBe('01:05');
  });

  it('handles large values', () => {
    expect(formatMs(3600000)).toBe('60:00');
    expect(formatMs(5400000)).toBe('90:00');
  });

  it('truncates milliseconds (floor)', () => {
    expect(formatMs(1999)).toBe('00:01');
    expect(formatMs(61999)).toBe('01:01');
  });

  it('handles negative values without crashing', () => {
    expect(() => formatMs(-1000)).not.toThrow();
  });
});
