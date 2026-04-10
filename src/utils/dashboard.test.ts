import { describe, it, expect } from 'vitest';
import { mapDbStatus, formatDuration, getProgressBarColor } from './dashboard';
import type { DbProject } from '../services/anivoiceApi';

function makeProject(overrides: Partial<DbProject> = {}): DbProject {
  return {
    id: 1,
    title: 'test',
    originalFileName: 'test.mp4',
    sourceLanguage: 'ja',
    targetLanguage: 'en',
    status: '',
    progress: 0,
    durationMs: 0,
    persoProjectSeq: null,
    persoSpaceSeq: null,
    thumbnailUrl: null,
    videoUrl: null,
    audioUrl: null,
    zipUrl: null,
    isPublic: false,
    isFavorite: false,
    tags: [],
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    ...overrides,
  };
}

describe('mapDbStatus', () => {
  it('returns failed for failed status', () => {
    expect(mapDbStatus(makeProject({ status: 'failed' }))).toBe('failed');
    expect(mapDbStatus(makeProject({ status: 'FAILED' }))).toBe('failed');
  });

  it('returns completed for completed status', () => {
    expect(mapDbStatus(makeProject({ status: 'completed' }))).toBe('completed');
  });

  it('returns completed when progress >= 100', () => {
    expect(mapDbStatus(makeProject({ status: 'dubbing', progress: 100 }))).toBe('completed');
    expect(mapDbStatus(makeProject({ status: '', progress: 100 }))).toBe('completed');
  });

  it('returns lip-syncing for lip-related status', () => {
    expect(mapDbStatus(makeProject({ status: 'lip_sync' }))).toBe('lip-syncing');
    expect(mapDbStatus(makeProject({ status: 'Lip Syncing' }))).toBe('lip-syncing');
  });

  it('returns dubbing for dub/translat status', () => {
    expect(mapDbStatus(makeProject({ status: 'dubbing' }))).toBe('dubbing');
    expect(mapDbStatus(makeProject({ status: 'translating' }))).toBe('dubbing');
    expect(mapDbStatus(makeProject({ status: 'TRANSLATION' }))).toBe('dubbing');
  });

  it('returns uploading for upload status', () => {
    expect(mapDbStatus(makeProject({ status: 'uploading' }))).toBe('uploading');
  });

  it('returns analyzing for analyz/process status', () => {
    expect(mapDbStatus(makeProject({ status: 'analyzing' }))).toBe('analyzing');
    expect(mapDbStatus(makeProject({ status: 'processing' }))).toBe('analyzing');
  });

  it('returns dubbing for partial progress with unknown status', () => {
    expect(mapDbStatus(makeProject({ status: '', progress: 50 }))).toBe('dubbing');
  });

  it('defaults to analyzing for unknown status and zero progress', () => {
    expect(mapDbStatus(makeProject({ status: 'unknown', progress: 0 }))).toBe('analyzing');
    expect(mapDbStatus(makeProject({}))).toBe('analyzing');
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

describe('getProgressBarColor', () => {
  it('returns yellow for analyzing', () => {
    expect(getProgressBarColor('analyzing')).toBe('bg-yellow-400');
  });

  it('returns yellow for uploading', () => {
    expect(getProgressBarColor('uploading')).toBe('bg-yellow-400');
  });

  it('returns blue for dubbing', () => {
    expect(getProgressBarColor('dubbing')).toBe('bg-blue-400');
  });

  it('returns blue for lip-syncing', () => {
    expect(getProgressBarColor('lip-syncing')).toBe('bg-blue-400');
  });

  it('returns green for completed', () => {
    expect(getProgressBarColor('completed')).toBe('bg-green-400');
  });

  it('returns red for failed', () => {
    expect(getProgressBarColor('failed')).toBe('bg-red-400');
  });

  it('returns primary for unknown status', () => {
    expect(getProgressBarColor('unknown' as never)).toBe('bg-primary-400');
  });
});
