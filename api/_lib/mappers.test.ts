import { describe, it, expect } from 'vitest';
import { parseTags, mapProjectRow, mapLibraryRow, mapLibraryDetailRow, mapUserRow, mapTagRow, buildPatchFields } from './mappers';

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

describe('mapLibraryDetailRow', () => {
  const baseRow: Record<string, unknown> = {
    id: 10,
    title: 'Detail Item',
    author_name: 'Author',
    source_language: 'ja',
    target_language: 'en',
    duration_ms: 60000,
    thumbnail_url: '/thumb.jpg',
    video_url: '/video.mp4',
    audio_url: '/audio.mp3',
    subtitle_url: '/subs.srt',
    tag_names: 'sci-fi,action',
    created_at: '2026-04-05',
  };

  it('maps all fields including audioUrl and subtitleUrl', () => {
    const result = mapLibraryDetailRow(baseRow);
    expect(result.id).toBe(10);
    expect(result.title).toBe('Detail Item');
    expect(result.authorName).toBe('Author');
    expect(result.sourceLanguage).toBe('ja');
    expect(result.targetLanguage).toBe('en');
    expect(result.durationMs).toBe(60000);
    expect(result.thumbnailUrl).toBe('/thumb.jpg');
    expect(result.videoUrl).toBe('/video.mp4');
    expect(result.audioUrl).toBe('/audio.mp3');
    expect(result.subtitleUrl).toBe('/subs.srt');
    expect(result.tags).toEqual(['sci-fi', 'action']);
    expect(result.createdAt).toBe('2026-04-05');
  });

  it('handles null audioUrl and subtitleUrl', () => {
    const result = mapLibraryDetailRow({ ...baseRow, audio_url: null, subtitle_url: null });
    expect(result.audioUrl).toBeNull();
    expect(result.subtitleUrl).toBeNull();
  });

  it('returns empty tags for undefined tag_names', () => {
    expect(mapLibraryDetailRow({ ...baseRow, tag_names: undefined }).tags).toEqual([]);
  });
});

describe('mapUserRow', () => {
  const baseRow: Record<string, unknown> = {
    id: 'uid-123',
    email: 'test@example.com',
    display_name: 'Test User',
    photo_url: 'https://example.com/photo.jpg',
    plan: 'free',
    credit_seconds: 360000,
    language: 'ko',
    created_at: '2026-04-01',
  };

  it('maps all fields correctly', () => {
    const result = mapUserRow(baseRow);
    expect(result.id).toBe('uid-123');
    expect(result.email).toBe('test@example.com');
    expect(result.displayName).toBe('Test User');
    expect(result.photoURL).toBe('https://example.com/photo.jpg');
    expect(result.plan).toBe('free');
    expect(result.creditSeconds).toBe(360000);
    expect(result.language).toBe('ko');
    expect(result.createdAt).toBe('2026-04-01');
  });

  it('handles null photo_url', () => {
    expect(mapUserRow({ ...baseRow, photo_url: null }).photoURL).toBeNull();
  });

  it('handles undefined language', () => {
    expect(mapUserRow({ ...baseRow, language: undefined }).language).toBeUndefined();
  });
});

describe('mapTagRow', () => {
  it('maps all fields correctly', () => {
    const result = mapTagRow({ id: 1, name: 'action', display_name_ko: '액션', display_name_en: 'Action' });
    expect(result.id).toBe(1);
    expect(result.name).toBe('action');
    expect(result.displayNameKo).toBe('액션');
    expect(result.displayNameEn).toBe('Action');
  });

  it('handles null display names', () => {
    const result = mapTagRow({ id: 2, name: 'test', display_name_ko: null, display_name_en: null });
    expect(result.displayNameKo).toBeNull();
    expect(result.displayNameEn).toBeNull();
  });
});

describe('buildPatchFields', () => {
  it('builds fields and args for provided camelCase keys', () => {
    const { fields, args } = buildPatchFields({ title: 'New Title', status: 'completed' });
    expect(fields).toEqual(['title = ?', 'status = ?']);
    expect(args).toEqual(['New Title', 'completed']);
  });

  it('converts isFavorite true to 1', () => {
    const { fields, args } = buildPatchFields({ isFavorite: true });
    expect(fields).toEqual(['is_favorite = ?']);
    expect(args).toEqual([1]);
  });

  it('converts isFavorite false to 0', () => {
    const { fields, args } = buildPatchFields({ isFavorite: false });
    expect(fields).toEqual(['is_favorite = ?']);
    expect(args).toEqual([0]);
  });

  it('maps camelCase to snake_case', () => {
    const { fields } = buildPatchFields({ durationMs: 5000, thumbnailUrl: '/thumb.jpg' });
    expect(fields).toEqual(['duration_ms = ?', 'thumbnail_url = ?']);
  });

  it('ignores unknown keys', () => {
    const { fields, args } = buildPatchFields({ unknownField: 'val', title: 'ok' });
    expect(fields).toEqual(['title = ?']);
    expect(args).toEqual(['ok']);
  });

  it('returns empty when body has no recognized keys', () => {
    const { fields, args } = buildPatchFields({ foo: 'bar' });
    expect(fields).toEqual([]);
    expect(args).toEqual([]);
  });

  it('skips undefined values', () => {
    const { fields, args } = buildPatchFields({ title: undefined, status: 'pending' });
    expect(fields).toEqual(['status = ?']);
    expect(args).toEqual(['pending']);
  });

  it('handles all allowed fields', () => {
    const body = {
      title: 't', status: 's', progress: 50,
      durationMs: 1000, persoProjectSeq: 1, persoSpaceSeq: 2,
      thumbnailUrl: 'a', videoUrl: 'b', audioUrl: 'c',
      subtitleUrl: 'd', zipUrl: 'e', isFavorite: true,
    };
    const { fields } = buildPatchFields(body);
    expect(fields).toHaveLength(12);
  });

  it('handles null values', () => {
    const { args } = buildPatchFields({ videoUrl: null });
    expect(args).toEqual([null]);
  });
});
