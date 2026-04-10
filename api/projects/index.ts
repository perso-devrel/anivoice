import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, migrate } from '../_lib/db.js';
import { verifyFirebaseToken, ensureUser, sendAuthAwareError } from '../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const token = await verifyFirebaseToken(req);
    await migrate();
    await ensureUser(token);

    if (req.method === 'GET') {
      const { limit = '20', offset = '0' } = req.query;
      const projects = await db.execute({
        sql: `SELECT p.*, GROUP_CONCAT(t.name) as tag_names
              FROM projects p
              LEFT JOIN project_tags pt ON p.id = pt.project_id
              LEFT JOIN tags t ON pt.tag_id = t.id
              WHERE p.user_id = ?
              GROUP BY p.id
              ORDER BY p.created_at DESC
              LIMIT ? OFFSET ?`,
        args: [token.sub, Number(limit), Number(offset)],
      });

      const total = await db.execute({
        sql: 'SELECT COUNT(*) as count FROM projects WHERE user_id = ?',
        args: [token.sub],
      });

      return res.json({
        projects: projects.rows.map(mapProject),
        total: total.rows[0].count,
      });
    }

    if (req.method === 'POST') {
      const { title, originalFileName, sourceLanguage, targetLanguage, durationMs, persoProjectSeq, persoSpaceSeq } = req.body || {};

      if (!targetLanguage) {
        return res.status(400).json({ error: 'targetLanguage is required' });
      }

      const result = await db.execute({
        sql: `INSERT INTO projects (user_id, title, original_file_name, source_language, target_language, duration_ms, perso_project_seq, perso_space_seq, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'uploading')`,
        args: [token.sub, title || '', originalFileName || '', sourceLanguage || 'auto', targetLanguage, durationMs || 0, persoProjectSeq || null, persoSpaceSeq || null],
      });

      return res.status(201).json({ id: Number(result.lastInsertRowid) });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return sendAuthAwareError(res, e);
  }
}

function mapProject(row: Record<string, unknown>) {
  return {
    id: row.id,
    title: row.title,
    originalFileName: row.original_file_name,
    sourceLanguage: row.source_language,
    targetLanguage: row.target_language,
    status: row.status,
    progress: row.progress,
    durationMs: row.duration_ms,
    persoProjectSeq: row.perso_project_seq,
    persoSpaceSeq: row.perso_space_seq,
    thumbnailUrl: row.thumbnail_url,
    videoUrl: row.video_url,
    audioUrl: row.audio_url,
    zipUrl: row.zip_url,
    isPublic: row.is_public === 1,
    tags: typeof row.tag_names === 'string' ? row.tag_names.split(',') : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
