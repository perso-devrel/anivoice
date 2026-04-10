export function buildOwnershipQuery(
  projectId: number,
  userId: string,
): { sql: string; args: (number | string)[] } {
  return {
    sql: 'SELECT id FROM projects WHERE id = ? AND user_id = ?',
    args: [projectId, userId],
  };
}

export function buildPublishUpdateQuery(
  projectId: number,
  isPublic: boolean,
): { sql: string; args: (number)[] } {
  return {
    sql: "UPDATE projects SET is_public = ?, updated_at = datetime('now') WHERE id = ?",
    args: [isPublic ? 1 : 0, projectId],
  };
}

export function buildTagDeleteQuery(
  projectId: number,
): { sql: string; args: number[] } {
  return {
    sql: 'DELETE FROM project_tags WHERE project_id = ?',
    args: [projectId],
  };
}

export function buildTagInsertQueries(
  projectId: number,
  tagIds: number[],
): { sql: string; args: number[] }[] {
  return tagIds.map((tagId) => ({
    sql: 'INSERT OR IGNORE INTO project_tags (project_id, tag_id) VALUES (?, ?)',
    args: [projectId, tagId],
  }));
}
