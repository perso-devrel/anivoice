import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, migrate } from '../_lib/db.js';
import { verifyFirebaseToken, sendAuthAwareError } from '../_lib/auth.js';

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
              VALUES (?, ?, ?, ?, 'free', 60)`,
        args: [token.sub, token.email || '', token.name || '', token.picture || null],
      });
    }

    const user = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [token.sub],
    });

    const row = user.rows[0];
    return res.json({
      id: row.id,
      email: row.email,
      displayName: row.display_name,
      photoURL: row.photo_url,
      plan: row.plan,
      creditSeconds: row.credit_seconds,
      language: row.language,
      createdAt: row.created_at,
    });
  } catch (e) {
    return sendAuthAwareError(res, e);
  }
}
