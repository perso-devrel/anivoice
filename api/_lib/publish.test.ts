import { describe, it, expect } from 'vitest';
import {
  buildOwnershipQuery,
  buildPublishUpdateQuery,
  buildTagDeleteQuery,
  buildTagInsertQueries,
} from './publish';

describe('buildOwnershipQuery', () => {
  it('builds SELECT query with project id and user id', () => {
    const { sql, args } = buildOwnershipQuery(42, 'user-abc');
    expect(sql).toBe('SELECT id FROM projects WHERE id = ? AND user_id = ?');
    expect(args).toEqual([42, 'user-abc']);
  });

  it('preserves numeric project id', () => {
    const { args } = buildOwnershipQuery(0, 'u1');
    expect(args[0]).toBe(0);
  });
});

describe('buildPublishUpdateQuery', () => {
  it('sets is_public to 1 when true', () => {
    const { sql, args } = buildPublishUpdateQuery(10, true);
    expect(sql).toContain('is_public = ?');
    expect(sql).toContain("updated_at = datetime('now')");
    expect(args).toEqual([1, 10]);
  });

  it('sets is_public to 0 when false', () => {
    const { args } = buildPublishUpdateQuery(10, false);
    expect(args).toEqual([0, 10]);
  });

  it('uses correct project id in WHERE clause', () => {
    const { sql, args } = buildPublishUpdateQuery(99, true);
    expect(sql).toContain('WHERE id = ?');
    expect(args[1]).toBe(99);
  });
});

describe('buildTagDeleteQuery', () => {
  it('builds DELETE query for project tags', () => {
    const { sql, args } = buildTagDeleteQuery(5);
    expect(sql).toBe('DELETE FROM project_tags WHERE project_id = ?');
    expect(args).toEqual([5]);
  });
});

describe('buildTagInsertQueries', () => {
  it('returns one query per tag id', () => {
    const queries = buildTagInsertQueries(10, [1, 2, 3]);
    expect(queries).toHaveLength(3);
  });

  it('builds INSERT OR IGNORE queries', () => {
    const queries = buildTagInsertQueries(10, [1, 2]);
    for (const q of queries) {
      expect(q.sql).toBe('INSERT OR IGNORE INTO project_tags (project_id, tag_id) VALUES (?, ?)');
    }
    expect(queries[0].args).toEqual([10, 1]);
    expect(queries[1].args).toEqual([10, 2]);
  });

  it('returns empty array for no tag ids', () => {
    expect(buildTagInsertQueries(10, [])).toEqual([]);
  });

  it('preserves tag id order', () => {
    const queries = buildTagInsertQueries(1, [5, 3, 7]);
    expect(queries.map((q) => q.args[1])).toEqual([5, 3, 7]);
  });

  it('uses correct project id for all queries', () => {
    const queries = buildTagInsertQueries(42, [1, 2]);
    for (const q of queries) {
      expect(q.args[0]).toBe(42);
    }
  });
});
