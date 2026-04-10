import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, migrate } from '../_lib/db.js';
import { mapLibraryDetailRow } from '../_lib/mappers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id || Array.isArray(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    await migrate();

    const result = await db.execute({
      sql: `
        SELECT p.*, u.display_name as author_name, GROUP_CONCAT(t.name) as tag_names
        FROM projects p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN project_tags pt ON p.id = pt.project_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        WHERE p.id = ? AND p.is_public = 1 AND p.status = 'completed'
        GROUP BY p.id
      `,
      args: [Number(id)],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const row = result.rows[0] as Record<string, unknown>;
    return res.json(mapLibraryDetailRow(row));
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
}
