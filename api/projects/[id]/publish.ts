import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, migrate } from '../../_lib/db.js';
import { verifyFirebaseToken, sendAuthAwareError } from '../../_lib/auth.js';
import {
  buildOwnershipQuery,
  buildPublishUpdateQuery,
  buildTagDeleteQuery,
  buildTagInsertQueries,
} from '../../_lib/publish.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  const projectId = Number(id);

  try {
    const token = await verifyFirebaseToken(req);
    await migrate();

    const { tagIds = [], isPublic = true } = req.body;

    const project = await db.execute(buildOwnershipQuery(projectId, token.sub));
    if (project.rows.length === 0) return res.status(404).json({ error: 'Project not found' });

    await db.execute(buildPublishUpdateQuery(projectId, isPublic));
    await db.execute(buildTagDeleteQuery(projectId));

    for (const q of buildTagInsertQueries(projectId, tagIds)) {
      await db.execute(q);
    }

    return res.json({ ok: true });
  } catch (e) {
    return sendAuthAwareError(res, e);
  }
}
