import { describe, it, expect } from 'vitest';
import { parseTags, mapProjectRow, mapLibraryRow } from './mappers';

describe('parseTags', () => {
  it('splits comma-separated string', () => {
    expect(parseTags('action,comedy,drama')).toEqual(['action', 'comedy', 'drama']);
  });

  it('returns single-element array for one tag', () => {
    expect(parseTags('action')).toEqual(['action']);
  });

  it('returns empty array for null', () => {
    expect(parseTags(null)).toEqual([]);
  });

  it('returns empty array for undefined', () => {
    expect(parseTags(undefined)).toEqual([]);
  });

  it('returns empty array for number', () => {
    expect(parseTags(42)).toEqual([]);
  });

  it('returns [""] for empty string', () => {
    expect(parseTags('')).toEqual(['']);
  });
});

describe('mapProjectRow', () => {
  const baseRow: Record<string, unknown> = {
    id: 1,
    title: 'Test Project',
    original_file_name: 'video.mp4',
    source_language: 'ja',
    target_language: 'en',
    status: 'completed',
    progress: 100,
    duration_ms: 50000,
    perso_project_seq: 12345,
    perso_space_seq: 501071,
    thumbnail_url: 'https://example.com/thumb.jpg',
    video_url: 'https://example.com/video.mp4',
    audio_url: 'https://example.com/audio.mp3',
    zip_url: 'https://example.com/all.zip',
    is_public: 1,
    is_favorite: 0,
    tag_names: 'action,comedy',
    created_at: '2026-04-10',
    updated_at: '2026-04-11',
  };

  it('maps all fields correctly', () => {
    const result = mapProjectRow(baseRow);
    expect(result.id).toBe(1);
    expect(result.title).toBe('Test Project');
    expect(result.originalFileName).toBe('video.mp4');
    expect(result.sourceLanguage).toBe('ja');
    expect(result.targetLanguage).toBe('en');
    expect(result.status).toBe('completed');
    expect(result.progress).toBe(100);
    expect(result.durationMs).toBe(50000);
    expect(result.persoProjectSeq).toBe(12345);
    expect(result.persoSpaceSeq).toBe(501071);
    expect(result.thumbnailUrl).toBe('https://example.com/thumb.jpg');
    expect(result.videoUrl).toBe('https://example.com/video.mp4');
    expect(result.audioUrl).toBe('https://example.com/audio.mp3');
    expect(result.zipUrl).toBe('https://example.com/all.zip');
    expect(result.createdAt).toBe('2026-04-10');
    expect(result.updatedAt).toBe('2026-04-11');
  });

  it('converts is_public 1 to boolean true', () => {
    expect(mapProjectRow(baseRow).isPublic).toBe(true);
  });

  it('converts is_public 0 to boolean false', () => {
    expect(mapProjectRow({ ...baseRow, is_public: 0 }).isPublic).toBe(false);
  });

  it('converts is_favorite 1 to boolean true', () => {
    expect(mapProjectRow({ ...baseRow, is_favorite: 1 }).isFavorite).toBe(true);
  });

  it('converts is_favorite 0 to boolean false', () => {
    expect(mapProjectRow(baseRow).isFavorite).toBe(false);
  });

  it('parses comma-separated tags', () => {
    expect(mapProjectRow(baseRow).tags).toEqual(['action', 'comedy']);
  });

  it('returns empty tags for null tag_names', () => {
    expect(mapProjectRow({ ...baseRow, tag_names: null }).tags).toEqual([]);
  });
});

describe('mapLibraryRow', () => {
  const baseRow: Record<string, unknown> = {
    id: 42,
    title: 'Library Item',
    author_name: 'Ronald',
    source_language: 'ja',
    target_language: 'ko',
    duration_ms: 120000,
    thumbnail_url: '/thumb.jpg',
    video_url: '/video.mp4',
    tag_names: 'romance',
    created_at: '2026-04-01',
  };

  it('maps all fields correctly', () => {
    const result = mapLibraryRow(baseRow);
    expect(result.id).toBe(42);
    expect(result.title).toBe('Library Item');
    expect(result.authorName).toBe('Ronald');
    expect(result.sourceLanguage).toBe('ja');
    expect(result.targetLanguage).toBe('ko');
    expect(result.durationMs).toBe(120000);
    expect(result.thumbnailUrl).toBe('/thumb.jpg');
    expect(result.videoUrl).toBe('/video.mp4');
    expect(result.tags).toEqual(['romance']);
    expect(result.createdAt).toBe('2026-04-01');
  });

  it('parses multiple tags', () => {
    expect(mapLibraryRow({ ...baseRow, tag_names: 'a,b,c' }).tags).toEqual(['a', 'b', 'c']);
  });

  it('returns empty tags for null', () => {
    expect(mapLibraryRow({ ...baseRow, tag_names: null }).tags).toEqual([]);
  });
});
