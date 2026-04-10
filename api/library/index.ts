import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, migrate } from '../_lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await migrate();

    const tag = String(req.query.tag || '');
    const lang = String(req.query.lang || '');
    const sort = String(req.query.sort || 'latest');
    const search = String(req.query.search || '');
    const limit = String(req.query.limit || '20');
    const offset = String(req.query.offset || '0');

    let sql = `
      SELECT p.*, u.display_name as author_name, GROUP_CONCAT(t.name) as tag_names
      FROM projects p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN project_tags pt ON p.id = pt.project_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.is_public = 1 AND p.status = 'completed'
    `;
    const args: (string | number | null)[] = [];

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
      sql += ` ORDER BY p.created_at DESC`; // TODO: add view/like count later
    } else {
      sql += ` ORDER BY p.created_at DESC`;
    }

    sql += ` LIMIT ? OFFSET ?`;
    args.push(Number(limit), Number(offset));

    const result = await db.execute({ sql, args });

    const total = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM projects WHERE is_public = 1 AND status = ?',
      args: ['completed'],
    });

    return res.json({
      items: result.rows.map((row: Record<string, unknown>) => ({
        id: row.id,
        title: row.title,
        authorName: row.author_name,
        sourceLanguage: row.source_language,
        targetLanguage: row.target_language,
        durationMs: row.duration_ms,
        thumbnailUrl: row.thumbnail_url,
        videoUrl: row.video_url,
        tags: typeof row.tag_names === 'string' ? row.tag_names.split(',') : [],
        createdAt: row.created_at,
      })),
      total: total.rows[0].count,
    });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
}
