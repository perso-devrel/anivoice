import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, migrate } from '../_lib/db.js';
import { verifyFirebaseToken, sendAuthAwareError } from '../_lib/auth.js';
import { buildPatchFields } from '../_lib/mappers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  try {
    const token = await verifyFirebaseToken(req);
    await migrate();

    if (req.method === 'GET') {
      const result = await db.execute({
        sql: 'SELECT * FROM projects WHERE id = ? AND user_id = ?',
        args: [Number(id), token.sub],
      });
      if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
      return res.json(result.rows[0]);
    }

    if (req.method === 'PATCH') {
      const { fields, args } = buildPatchFields(req.body);

      if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

      fields.push("updated_at = datetime('now')");
      args.push(Number(id), token.sub);

      await db.execute({
        sql: `UPDATE projects SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
        args,
      });

      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return sendAuthAwareError(res, e);
  }
}
