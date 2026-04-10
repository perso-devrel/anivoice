import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, migrate } from '../_lib/db.js';
import { verifyFirebaseToken, ensureUser, sendAuthAwareError } from '../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const token = await verifyFirebaseToken(req);
    await migrate();
    await ensureUser(token);

    const { seconds, plan, description } = req.body;

    if (plan) {
      // Plan change — set credits to plan amount
      // 시간 단위(초): free=100h, basic=300h, pro=1000h
      const planCredits: Record<string, number> = {
        free: 360000,
        basic: 1080000,
        pro: 3600000,
      };
      const newCredits = planCredits[plan] ?? 60;

      await db.execute({
        sql: "UPDATE users SET plan = ?, credit_seconds = ?, updated_at = datetime('now') WHERE id = ?",
        args: [plan, newCredits, token.sub],
      });

      await db.execute({
        sql: `INSERT INTO credit_transactions (user_id, type, amount_seconds, balance_after, description)
              VALUES (?, 'plan_grant', ?, ?, ?)`,
        args: [token.sub, newCredits, newCredits, `플랜 변경: ${plan}`],
      });

      return res.json({ plan, creditSeconds: newCredits });
    }

    if (seconds && seconds > 0) {
      // Credit purchase
      await db.execute({
        sql: "UPDATE users SET credit_seconds = credit_seconds + ?, updated_at = datetime('now') WHERE id = ?",
        args: [seconds, token.sub],
      });

      const user = await db.execute({
        sql: 'SELECT credit_seconds FROM users WHERE id = ?',
        args: [token.sub],
      });
      const balanceAfter = Number(user.rows[0].credit_seconds);

      await db.execute({
        sql: `INSERT INTO credit_transactions (user_id, type, amount_seconds, balance_after, description)
              VALUES (?, 'purchase', ?, ?, ?)`,
        args: [token.sub, seconds, balanceAfter, description || `${seconds}초 구매`],
      });

      return res.json({ creditSeconds: balanceAfter, added: seconds });
    }

    return res.status(400).json({ error: 'seconds or plan required' });
  } catch (e) {
    return sendAuthAwareError(res, e);
  }
}
