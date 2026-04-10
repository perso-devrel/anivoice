import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, migrate } from '../_lib/db.js';
import { verifyFirebaseToken, sendAuthAwareError } from '../_lib/auth.js';
import { mapUserRow } from '../_lib/mappers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const token = await verifyFirebaseToken(req);
    await migrate();

    // Upsert user
    const existing = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [token.sub],
    });

    if (existing.rows.length === 0) {
      await db.execute({
        sql: `INSERT INTO users (id, email, display_name, photo_url, plan, credit_seconds)
              VALUES (?, ?, ?, ?, 'free', 360000)`,
        args: [token.sub, token.email || '', token.name || '', token.picture || null],
      });
    }

    const user = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [token.sub],
    });

    const row = user.rows[0] as Record<string, unknown>;
    return res.json(mapUserRow(row));
  } catch (e) {
    return sendAuthAwareError(res, e);
  }
}
