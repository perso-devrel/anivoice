export interface LibraryQueryParams {
  tag?: string;
  lang?: string;
  sort?: string;
  search?: string;
  limit?: string | number;
  offset?: string | number;
}

export function buildLibraryQuery(params: LibraryQueryParams): {
  sql: string;
  args: (string | number)[];
} {
  const {
    tag = '',
    lang = '',
    sort = 'latest',
    search = '',
    limit = '20',
    offset = '0',
  } = params;

  let sql = `
      SELECT p.*, u.display_name as author_name, GROUP_CONCAT(t.name) as tag_names
      FROM projects p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN project_tags pt ON p.id = pt.project_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.is_public = 1 AND p.status = 'completed'
    `;
  const args: (string | number)[] = [];

  if (tag && tag !== 'all') {
    sql += ` AND EXISTS (SELECT 1 FROM project_tags pt2 JOIN tags t2 ON pt2.tag_id = t2.id WHERE pt2.project_id = p.id AND t2.name = ?)`;
    args.push(tag);
  }

  if (lang && lang !== 'all') {
    sql += ` AND p.target_language = ?`;
    args.push(lang);
  }

  if (search) {
    sql += ` AND p.title LIKE ?`;
    args.push(`%${search}%`);
  }

  sql += ` GROUP BY p.id`;

  if (sort === 'popular') {
    sql += ` ORDER BY p.is_favorite DESC, p.created_at DESC`;
  } else {
    sql += ` ORDER BY p.created_at DESC`;
  }

  sql += ` LIMIT ? OFFSET ?`;
  args.push(Number(limit), Number(offset));

  return { sql, args };
}
