import { describe, it, expect } from 'vitest';
import { buildLibraryQuery } from './library';

describe('buildLibraryQuery', () => {
  it('returns base query with defaults', () => {
    const { sql, args } = buildLibraryQuery({});
    expect(sql).toContain('is_public = 1');
    expect(sql).toContain("status = 'completed'");
    expect(sql).toContain('LIMIT ? OFFSET ?');
    expect(args).toEqual([20, 0]);
  });

  it('filters by tag when not "all"', () => {
    const { sql, args } = buildLibraryQuery({ tag: 'action' });
    expect(sql).toContain('t2.name = ?');
    expect(args[0]).toBe('action');
  });

  it('skips tag filter when "all"', () => {
    const { sql, args } = buildLibraryQuery({ tag: 'all' });
    expect(sql).not.toContain('t2.name = ?');
    expect(args).toEqual([20, 0]);
  });

  it('skips tag filter when empty', () => {
    const { sql, args } = buildLibraryQuery({ tag: '' });
    expect(sql).not.toContain('t2.name = ?');
    expect(args).toEqual([20, 0]);
  });

  it('filters by language when not "all"', () => {
    const { sql, args } = buildLibraryQuery({ lang: 'ko' });
    expect(sql).toContain('target_language = ?');
    expect(args[0]).toBe('ko');
  });

  it('skips language filter when "all"', () => {
    const { sql, args } = buildLibraryQuery({ lang: 'all' });
    expect(sql).not.toContain('target_language = ?');
    expect(args).toEqual([20, 0]);
  });

  it('adds LIKE filter for search', () => {
    const { sql, args } = buildLibraryQuery({ search: 'naruto' });
    expect(sql).toContain('title LIKE ?');
    expect(args[0]).toBe('%naruto%');
  });

  it('skips search filter when empty', () => {
    const { sql, args } = buildLibraryQuery({ search: '' });
    expect(sql).not.toContain('LIKE');
    expect(args).toEqual([20, 0]);
  });

  it('respects custom limit and offset', () => {
    const { args } = buildLibraryQuery({ limit: '10', offset: '5' });
    expect(args).toEqual([10, 5]);
  });

  it('accepts numeric limit and offset', () => {
    const { args } = buildLibraryQuery({ limit: 15, offset: 30 });
    expect(args).toEqual([15, 30]);
  });

  it('combines tag + lang + search filters', () => {
    const { sql, args } = buildLibraryQuery({
      tag: 'romance',
      lang: 'en',
      search: 'love',
    });
    expect(sql).toContain('t2.name = ?');
    expect(sql).toContain('target_language = ?');
    expect(sql).toContain('title LIKE ?');
    expect(args).toEqual(['romance', 'en', '%love%', 20, 0]);
  });

  it('always includes GROUP BY and ORDER BY', () => {
    const { sql } = buildLibraryQuery({});
    expect(sql).toContain('GROUP BY p.id');
    expect(sql).toContain('ORDER BY p.created_at DESC');
  });

  it('handles sort=popular', () => {
    const { sql } = buildLibraryQuery({ sort: 'popular' });
    expect(sql).toContain('ORDER BY p.created_at DESC');
  });
});
