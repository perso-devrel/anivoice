import { describe, it, expect } from 'vitest';
import {
  mapDbStatus,
  formatDuration,
  getProgressBarColor,
  filterProjects,
  sortProjects,
  extractAvailableLanguages,
} from './dashboard';
import type { DbProject } from '../services/anivoiceApi';
import type { ProjectStatus } from '../types';

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

function makeMapped(overrides: Partial<DbProject> & { mappedStatus?: ProjectStatus } = {}) {
  const { mappedStatus, ...rest } = overrides;
  const p = makeProject(rest);
  return { ...p, mappedStatus: mappedStatus ?? mapDbStatus(p) };
}

describe('filterProjects', () => {
  const projects = [
    makeMapped({ id: 1, title: 'Naruto EP1', targetLanguage: 'en', isFavorite: true, mappedStatus: 'completed' }),
    makeMapped({ id: 2, title: 'One Piece', targetLanguage: 'ko', isFavorite: false, mappedStatus: 'dubbing' }),
    makeMapped({ id: 3, title: 'Demon Slayer', targetLanguage: 'en,ko', isFavorite: false, mappedStatus: 'failed' }),
    makeMapped({ id: 4, title: 'Attack on Titan', targetLanguage: 'es', isFavorite: true, mappedStatus: 'analyzing' }),
  ];

  it('returns all projects when tab is "all" and no filters', () => {
    const result = filterProjects(projects, { query: '', languageFilter: '', activeTab: 'all' });
    expect(result).toHaveLength(4);
  });

  it('filters by search query matching title', () => {
    const result = filterProjects(projects, { query: 'naruto', languageFilter: '', activeTab: 'all' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('filters by search query matching targetLanguage', () => {
    const result = filterProjects(projects, { query: 'es', languageFilter: '', activeTab: 'all' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(4);
  });

  it('filters by language filter', () => {
    const result = filterProjects(projects, { query: '', languageFilter: 'ko', activeTab: 'all' });
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id).sort()).toEqual([2, 3]);
  });

  it('filters favorites tab', () => {
    const result = filterProjects(projects, { query: '', languageFilter: '', activeTab: 'favorites' });
    expect(result).toHaveLength(2);
    expect(result.every((p) => p.isFavorite)).toBe(true);
  });

  it('filters completed tab', () => {
    const result = filterProjects(projects, { query: '', languageFilter: '', activeTab: 'completed' });
    expect(result).toHaveLength(1);
    expect(result[0].mappedStatus).toBe('completed');
  });

  it('filters in-progress tab (excludes completed and failed)', () => {
    const result = filterProjects(projects, { query: '', languageFilter: '', activeTab: 'in-progress' });
    expect(result).toHaveLength(2);
    expect(result.every((p) => p.mappedStatus !== 'completed' && p.mappedStatus !== 'failed')).toBe(true);
  });

  it('combines query and tab filters', () => {
    const result = filterProjects(projects, { query: 'titan', languageFilter: '', activeTab: 'in-progress' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(4);
  });

  it('trims query whitespace', () => {
    const result = filterProjects(projects, { query: '  naruto  ', languageFilter: '', activeTab: 'all' });
    expect(result).toHaveLength(1);
  });

  it('returns empty when nothing matches', () => {
    const result = filterProjects(projects, { query: 'nonexistent', languageFilter: '', activeTab: 'all' });
    expect(result).toHaveLength(0);
  });
});

describe('sortProjects', () => {
  const projects = [
    makeMapped({ id: 1, createdAt: '2026-01-15' }),
    makeMapped({ id: 2, createdAt: '2026-03-10' }),
    makeMapped({ id: 3, createdAt: '2026-02-20' }),
  ];

  it('sorts newest first', () => {
    const result = sortProjects(projects, 'newest');
    expect(result.map((p) => p.id)).toEqual([2, 3, 1]);
  });

  it('sorts oldest first', () => {
    const result = sortProjects(projects, 'oldest');
    expect(result.map((p) => p.id)).toEqual([1, 3, 2]);
  });

  it('does not mutate the original array', () => {
    const original = [...projects];
    sortProjects(projects, 'newest');
    expect(projects.map((p) => p.id)).toEqual(original.map((p) => p.id));
  });

  it('handles empty createdAt gracefully', () => {
    const items = [
      makeMapped({ id: 1, createdAt: '' }),
      makeMapped({ id: 2, createdAt: '2026-01-01' }),
    ];
    const result = sortProjects(items, 'newest');
    expect(result[0].id).toBe(2);
  });
});

describe('extractAvailableLanguages', () => {
  it('extracts unique languages sorted', () => {
    const projects = [
      makeProject({ targetLanguage: 'en' }),
      makeProject({ targetLanguage: 'ko' }),
      makeProject({ targetLanguage: 'en' }),
    ];
    expect(extractAvailableLanguages(projects)).toEqual(['en', 'ko']);
  });

  it('splits comma-separated languages', () => {
    const projects = [makeProject({ targetLanguage: 'en,ko,ja' })];
    expect(extractAvailableLanguages(projects)).toEqual(['en', 'ja', 'ko']);
  });

  it('trims whitespace and lowercases', () => {
    const projects = [makeProject({ targetLanguage: ' EN , Ko ' })];
    expect(extractAvailableLanguages(projects)).toEqual(['en', 'ko']);
  });

  it('skips empty values', () => {
    const projects = [
      makeProject({ targetLanguage: '' }),
      makeProject({ targetLanguage: 'en' }),
    ];
    expect(extractAvailableLanguages(projects)).toEqual(['en']);
  });

  it('returns empty array for no projects', () => {
    expect(extractAvailableLanguages([])).toEqual([]);
  });
});
