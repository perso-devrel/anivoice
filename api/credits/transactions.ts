import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, migrate } from '../_lib/db.js';
import { verifyFirebaseToken, ensureUser, sendAuthAwareError } from '../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const token = await verifyFirebaseToken(req);
    await migrate();
    await ensureUser(token);

    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const result = await db.execute({
      sql: `SELECT id, type, amount_seconds, balance_after, description, project_id, created_at
            FROM credit_transactions
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?`,
      args: [token.sub, limit, offset],
    });

    const countResult = await db.execute({
      sql: 'SELECT COUNT(*) AS total FROM credit_transactions WHERE user_id = ?',
      args: [token.sub],
    });

    const transactions = result.rows.map((row) => ({
      id: Number(row.id),
      type: String(row.type),
      amountSeconds: Number(row.amount_seconds),
      balanceAfter: Number(row.balance_after),
      description: row.description ? String(row.description) : null,
      projectId: row.project_id ? Number(row.project_id) : null,
      createdAt: String(row.created_at),
    }));

    const total = countResult.rows.length > 0 ? Number(countResult.rows[0].total) : 0;

    return res.json({ transactions, total });
  } catch (e) {
    return sendAuthAwareError(res, e);
  }
}
