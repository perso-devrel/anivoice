import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, migrate } from '../_lib/db.js';
import { buildLibraryQuery } from '../_lib/library.js';
import { mapLibraryRow } from '../_lib/mappers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await migrate();

    const { sql, args } = buildLibraryQuery({
      tag: String(req.query.tag || ''),
      lang: String(req.query.lang || ''),
      sort: String(req.query.sort || 'latest'),
      search: String(req.query.search || ''),
      limit: String(req.query.limit || '20'),
      offset: String(req.query.offset || '0'),
    });

    const result = await db.execute({ sql, args });

    const total = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM projects WHERE is_public = 1 AND status = ?',
      args: ['completed'],
    });

    return res.json({
      items: result.rows.map(mapLibraryRow),
      total: total.rows[0].count,
    });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
}
