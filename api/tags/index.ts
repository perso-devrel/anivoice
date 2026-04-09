import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, migrate } from '../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await migrate();
    const result = await db.execute('SELECT * FROM tags ORDER BY id');
    return res.json({
      tags: result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        displayNameKo: row.display_name_ko,
        displayNameEn: row.display_name_en,
      })),
    });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
}
