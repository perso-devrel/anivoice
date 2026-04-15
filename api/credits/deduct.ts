import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, migrate } from '../_lib/db.js';
import { verifyFirebaseToken, ensureUser, sendAuthAwareError } from '../_lib/auth.js';
import { computeDeductSeconds } from '../_lib/credits.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const token = await verifyFirebaseToken(req);
    await migrate();
    await ensureUser(token);

    const { projectId, durationMs, languageCount = 1 } = req.body;

    if (!durationMs || typeof durationMs !== 'number' || durationMs <= 0) {
      return res.status(400).json({ error: 'durationMs must be a positive number' });
    }

    const seconds = computeDeductSeconds(durationMs, languageCount);

    // Atomic deduct: only succeeds if enough credits
    const result = await db.execute({
      sql: `UPDATE users SET credit_seconds = credit_seconds - ?, updated_at = datetime('now')
            WHERE id = ? AND credit_seconds >= ?`,
      args: [seconds, token.sub, seconds],
    });

    if (result.rowsAffected === 0) {
      return res.status(402).json({ error: 'Insufficient credit balance.' });
    }

    // Get new balance
    const user = await db.execute({
      sql: 'SELECT credit_seconds FROM users WHERE id = ?',
      args: [token.sub],
    });
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const balanceAfter = Number(user.rows[0].credit_seconds);

    // Record transaction
    await db.execute({
      sql: `INSERT INTO credit_transactions (user_id, type, amount_seconds, balance_after, description, project_id)
            VALUES (?, 'dubbing_deduct', ?, ?, ?, ?)`,
      args: [token.sub, -seconds, balanceAfter, `Dubbing usage: ${seconds}s`, projectId || null],
    });

    return res.json({ remainingSeconds: balanceAfter, deducted: seconds });
  } catch (e) {
    return sendAuthAwareError(res, e);
  }
}
