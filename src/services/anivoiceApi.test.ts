import { describe, it, expect } from 'vitest';
import { formatSeconds } from './anivoiceApi';

const ko = { hours: '시간', minutes: '분', seconds: '초' };
const en = { hours: 'hr', minutes: 'min', seconds: 'sec' };

describe('formatSeconds', () => {
  it('formats seconds only (ko)', () => {
    expect(formatSeconds(30, ko)).toBe('30초');
  });

  it('formats zero (ko)', () => {
    expect(formatSeconds(0, ko)).toBe('0초');
  });

  it('formats minutes and seconds (ko)', () => {
    expect(formatSeconds(90, ko)).toBe('1분 30초');
  });

  it('formats exact minutes (ko)', () => {
    expect(formatSeconds(120, ko)).toBe('2분 0초');
  });

  it('formats hours and minutes (ko)', () => {
    expect(formatSeconds(3661, ko)).toBe('1시간 1분');
  });

  it('formats exact hours (ko)', () => {
    expect(formatSeconds(7200, ko)).toBe('2시간 0분');
  });

  it('formats large values (ko)', () => {
    expect(formatSeconds(360000, ko)).toBe('100시간 0분');
  });

  it('formats seconds only (en)', () => {
    expect(formatSeconds(30, en)).toBe('30sec');
  });

  it('formats zero (en)', () => {
    expect(formatSeconds(0, en)).toBe('0sec');
  });

  it('formats minutes and seconds (en)', () => {
    expect(formatSeconds(90, en)).toBe('1min 30sec');
  });

  it('formats hours and minutes (en)', () => {
    expect(formatSeconds(3661, en)).toBe('1hr 1min');
  });

  it('formats large values (en)', () => {
    expect(formatSeconds(360000, en)).toBe('100hr 0min');
  });
});
