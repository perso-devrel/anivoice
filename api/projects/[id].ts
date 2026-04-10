import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, migrate } from '../_lib/db.js';
import { verifyFirebaseToken, sendAuthAwareError } from '../_lib/auth.js';

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
      const fields: string[] = [];
      const args: (string | number | null)[] = [];
      const allowed = ['title', 'status', 'progress', 'duration_ms', 'perso_project_seq', 'perso_space_seq', 'thumbnail_url', 'video_url', 'audio_url', 'subtitle_url', 'zip_url', 'is_favorite'];

      // Map camelCase body to snake_case columns
      const bodyMap: Record<string, string> = {
        title: 'title', status: 'status', progress: 'progress',
        durationMs: 'duration_ms', persoProjectSeq: 'perso_project_seq',
        persoSpaceSeq: 'perso_space_seq', thumbnailUrl: 'thumbnail_url',
        videoUrl: 'video_url', audioUrl: 'audio_url', subtitleUrl: 'subtitle_url',
        zipUrl: 'zip_url',
        isFavorite: 'is_favorite',
      };

      for (const [camel, snake] of Object.entries(bodyMap)) {
        if (req.body[camel] !== undefined && allowed.includes(snake)) {
          fields.push(`${snake} = ?`);
          const val = req.body[camel];
          args.push(snake === 'is_favorite' ? (val ? 1 : 0) : val);
        }
      }

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
