import { describe, it, expect } from 'vitest';
import { getDownloadUrl, computeDubbingProgress, buildShareUrl, toggleArrayItem } from './studio';
import type { PersoDownloadLinks } from '../types';

describe('getDownloadUrl', () => {
  const fullLinks: PersoDownloadLinks = {
    videoFile: { videoDownloadLink: '/video.mp4' },
    audioFile: {
      voiceAudioDownloadLink: '/voice.mp3',
      backgroundAudioDownloadLink: '/bg.mp3',
      voiceWithBackgroundAudioDownloadLink: '/voice-bg.mp3',
    },
    srtFile: {
      originalSubtitleDownloadLink: '/original.srt',
      translatedSubtitleDownloadLink: '/translated.srt',
    },
    zippedFileDownloadLink: '/all.zip',
  };

  it('returns video download link', () => {
    expect(getDownloadUrl('video', fullLinks)).toBe('/video.mp4');
  });

  it('returns translated subtitle preferring translated over original', () => {
    expect(getDownloadUrl('subtitle', fullLinks)).toBe('/translated.srt');
  });

  it('falls back to original subtitle when translated is missing', () => {
    const links: PersoDownloadLinks = {
      srtFile: {
        originalSubtitleDownloadLink: '/original.srt',
        translatedSubtitleDownloadLink: '',
      },
    };
    expect(getDownloadUrl('subtitle', links)).toBe('/original.srt');
  });

  it('returns voiceWithBackground audio preferring it over voice-only', () => {
    expect(getDownloadUrl('audio', fullLinks)).toBe('/voice-bg.mp3');
  });

  it('falls back to voice-only audio when voiceWithBackground is missing', () => {
    const links: PersoDownloadLinks = {
      audioFile: {
        voiceAudioDownloadLink: '/voice.mp3',
        backgroundAudioDownloadLink: '/bg.mp3',
        voiceWithBackgroundAudioDownloadLink: '',
      },
    };
    expect(getDownloadUrl('audio', links)).toBe('/voice.mp3');
  });

  it('returns zip download link', () => {
    expect(getDownloadUrl('zip', fullLinks)).toBe('/all.zip');
  });

  it('returns undefined when links is null', () => {
    expect(getDownloadUrl('video', null)).toBeUndefined();
  });

  it('returns undefined when specific file type is missing', () => {
    expect(getDownloadUrl('video', {})).toBeUndefined();
    expect(getDownloadUrl('subtitle', {})).toBeUndefined();
    expect(getDownloadUrl('audio', {})).toBeUndefined();
    expect(getDownloadUrl('zip', {})).toBeUndefined();
  });
});

describe('computeDubbingProgress', () => {
  it('returns 35 at poll start (0%)', () => {
    expect(computeDubbingProgress(0)).toBe(35);
  });

  it('returns 90 at poll end (100%)', () => {
    expect(computeDubbingProgress(100)).toBe(90);
  });

  it('maps 50% poll to 62.5% UI', () => {
    expect(computeDubbingProgress(50)).toBe(62.5);
  });
});

describe('buildShareUrl', () => {
  it('builds project-specific URL when id is provided', () => {
    expect(buildShareUrl('https://example.com', 42)).toBe('https://example.com/library/42');
  });

  it('builds generic library URL when id is null', () => {
    expect(buildShareUrl('https://example.com', null)).toBe('https://example.com/library');
  });
});

describe('toggleArrayItem', () => {
  it('adds item when not present', () => {
    expect(toggleArrayItem([1, 2], 3)).toEqual([1, 2, 3]);
  });

  it('removes item when already present', () => {
    expect(toggleArrayItem([1, 2, 3], 2)).toEqual([1, 3]);
  });

  it('works with strings', () => {
    expect(toggleArrayItem(['en', 'ko'], 'ja')).toEqual(['en', 'ko', 'ja']);
    expect(toggleArrayItem(['en', 'ko'], 'en')).toEqual(['ko']);
  });

  it('returns empty array when toggling only item off', () => {
    expect(toggleArrayItem(['a'], 'a')).toEqual([]);
  });

  it('does not mutate original array', () => {
    const original = [1, 2, 3];
    toggleArrayItem(original, 2);
    expect(original).toEqual([1, 2, 3]);
  });
});
