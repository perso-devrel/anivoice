import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, migrate } from '../_lib/db.js';
import { verifyFirebaseToken, ensureUser, sendAuthAwareError } from '../_lib/auth.js';
import { clampHistoryDays, mapHistoryRow } from '../_lib/credits.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const token = await verifyFirebaseToken(req);
    await migrate();
    await ensureUser(token);

    const days = clampHistoryDays(req.query.days);

    const result = await db.execute({
      sql: `SELECT date(created_at) AS day,
                   SUM(CASE WHEN amount_seconds < 0 THEN -amount_seconds ELSE 0 END) AS used_seconds,
                   COUNT(*) AS tx_count
            FROM credit_transactions
            WHERE user_id = ? AND created_at >= datetime('now', ? || ' days')
            GROUP BY date(created_at)
            ORDER BY day ASC`,
      args: [token.sub, `-${days}`],
    });

    const data = result.rows.map(mapHistoryRow);

    return res.json({ days, data });
  } catch (e) {
    return sendAuthAwareError(res, e);
  }
}
