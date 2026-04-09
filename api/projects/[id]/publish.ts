import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, migrate } from '../../_lib/db';
import { verifyFirebaseToken } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;

  try {
    const token = await verifyFirebaseToken(req);
    await migrate();

    const { tagIds = [], isPublic = true } = req.body;

    // Verify ownership
    const project = await db.execute({
      sql: 'SELECT id FROM projects WHERE id = ? AND user_id = ?',
      args: [Number(id), token.sub],
    });
    if (project.rows.length === 0) return res.status(404).json({ error: 'Project not found' });

    // Update public status
    await db.execute({
      sql: "UPDATE projects SET is_public = ?, updated_at = datetime('now') WHERE id = ?",
      args: [isPublic ? 1 : 0, Number(id)],
    });

    // Replace tags
    await db.execute({ sql: 'DELETE FROM project_tags WHERE project_id = ?', args: [Number(id)] });

    for (const tagId of tagIds) {
      await db.execute({
        sql: 'INSERT OR IGNORE INTO project_tags (project_id, tag_id) VALUES (?, ?)',
        args: [Number(id), tagId],
      });
    }

    return res.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('Token') || msg.includes('Unauthorized')) return res.status(401).json({ error: msg });
    return res.status(500).json({ error: msg });
  }
}
