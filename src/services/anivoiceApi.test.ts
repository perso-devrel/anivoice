import { describe, it, expect } from 'vitest';
import { formatSeconds } from './anivoiceApi';

describe('formatSeconds', () => {
  it('formats seconds only', () => {
    expect(formatSeconds(30)).toBe('30초');
  });

  it('formats zero', () => {
    expect(formatSeconds(0)).toBe('0초');
  });

  it('formats minutes and seconds', () => {
    expect(formatSeconds(90)).toBe('1분 30초');
  });

  it('formats exact minutes', () => {
    expect(formatSeconds(120)).toBe('2분 0초');
  });

  it('formats hours and minutes', () => {
    expect(formatSeconds(3661)).toBe('1시간 1분');
  });

  it('formats exact hours', () => {
    expect(formatSeconds(7200)).toBe('2시간 0분');
  });

  it('formats large values', () => {
    expect(formatSeconds(360000)).toBe('100시간 0분');
  });
});
