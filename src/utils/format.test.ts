import { describe, it, expect } from 'vitest';
import { formatMs, formatDuration, formatSeconds, formatCreditTime, formatCreditTimeMs, formatChartDay, getErrorMessage } from './format';

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

describe('formatDuration', () => {
  it('formats zero', () => {
    expect(formatDuration(0)).toBe('0:00');
  });

  it('formats seconds only', () => {
    expect(formatDuration(5000)).toBe('0:05');
    expect(formatDuration(59000)).toBe('0:59');
  });

  it('formats minutes and seconds', () => {
    expect(formatDuration(60000)).toBe('1:00');
    expect(formatDuration(90000)).toBe('1:30');
    expect(formatDuration(3661000)).toBe('61:01');
  });

  it('floors partial seconds', () => {
    expect(formatDuration(1500)).toBe('0:01');
    expect(formatDuration(999)).toBe('0:00');
  });
});

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

describe('formatCreditTime', () => {
  const tKo = (key: string): string => {
    const map: Record<string, string> = { 'common.hours': '시간', 'common.minutes': '분', 'common.seconds': '초' };
    return map[key] ?? key;
  };
  const tEn = (key: string): string => {
    const map: Record<string, string> = { 'common.hours': 'hr', 'common.minutes': 'min', 'common.seconds': 'sec' };
    return map[key] ?? key;
  };

  it('delegates to formatSeconds with i18n labels (ko)', () => {
    expect(formatCreditTime(3661, tKo)).toBe('1시간 1분');
  });

  it('delegates to formatSeconds with i18n labels (en)', () => {
    expect(formatCreditTime(90, tEn)).toBe('1min 30sec');
  });

  it('handles zero', () => {
    expect(formatCreditTime(0, tEn)).toBe('0sec');
  });
});

describe('formatCreditTimeMs', () => {
  const tEn = (key: string): string => {
    const map: Record<string, string> = { 'common.hours': 'hr', 'common.minutes': 'min', 'common.seconds': 'sec' };
    return map[key] ?? key;
  };

  it('converts ms to seconds and formats', () => {
    expect(formatCreditTimeMs(90000, tEn)).toBe('1min 30sec');
  });

  it('floors partial seconds', () => {
    expect(formatCreditTimeMs(1999, tEn)).toBe('1sec');
  });

  it('handles zero', () => {
    expect(formatCreditTimeMs(0, tEn)).toBe('0sec');
  });
});

describe('formatChartDay', () => {
  it('strips year prefix from ISO date', () => {
    expect(formatChartDay('2026-04-11')).toBe('04-11');
  });

  it('handles short strings', () => {
    expect(formatChartDay('2026')).toBe('');
    expect(formatChartDay('')).toBe('');
  });

  it('handles non-ISO strings', () => {
    expect(formatChartDay('abcdefghij')).toBe('fghij');
  });
});

describe('getErrorMessage', () => {
  it('extracts message from Error instance', () => {
    expect(getErrorMessage(new Error('something broke'))).toBe('something broke');
  });

  it('converts string to itself', () => {
    expect(getErrorMessage('plain string')).toBe('plain string');
  });

  it('converts number to string', () => {
    expect(getErrorMessage(404)).toBe('404');
  });

  it('converts null to string', () => {
    expect(getErrorMessage(null)).toBe('null');
  });

  it('converts undefined to string', () => {
    expect(getErrorMessage(undefined)).toBe('undefined');
  });

  it('handles Error subclass', () => {
    expect(getErrorMessage(new TypeError('type error'))).toBe('type error');
  });

  it('uses fallback for non-Error when provided', () => {
    expect(getErrorMessage('oops', 'default msg')).toBe('default msg');
    expect(getErrorMessage(null, 'default msg')).toBe('default msg');
    expect(getErrorMessage(undefined, 'default msg')).toBe('default msg');
  });

  it('prefers Error.message over fallback', () => {
    expect(getErrorMessage(new Error('real'), 'fallback')).toBe('real');
  });
});
