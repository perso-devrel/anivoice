import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, migrate } from '../_lib/db.js';
import { verifyFirebaseToken, ensureUser, sendAuthAwareError } from '../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const token = await verifyFirebaseToken(req);
    await migrate();
    await ensureUser(token);

    const { seconds, description } = req.body;

    if (!seconds || seconds <= 0) {
      return res.status(400).json({ error: 'seconds required' });
    }

    await db.execute({
      sql: "UPDATE users SET credit_seconds = credit_seconds + ?, updated_at = datetime('now') WHERE id = ?",
      args: [seconds, token.sub],
    });

    const user = await db.execute({
      sql: 'SELECT credit_seconds FROM users WHERE id = ?',
      args: [token.sub],
    });
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const balanceAfter = Number(user.rows[0].credit_seconds);

    await db.execute({
      sql: `INSERT INTO credit_transactions (user_id, type, amount_seconds, balance_after, description)
            VALUES (?, 'purchase', ?, ?, ?)`,
      args: [token.sub, seconds, balanceAfter, description || `Purchased ${seconds}s`],
    });

    return res.json({ creditSeconds: balanceAfter, added: seconds });
  } catch (e) {
    return sendAuthAwareError(res, e);
  }
}
