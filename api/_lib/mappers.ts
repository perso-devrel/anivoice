export function parseTags(tagNames: unknown): string[] {
  return typeof tagNames === 'string' ? tagNames.split(',') : [];
}

export function mapProjectRow(row: Record<string, unknown>) {
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
    isFavorite: row.is_favorite === 1,
    tags: parseTags(row.tag_names),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapLibraryRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    title: row.title,
    authorName: row.author_name,
    sourceLanguage: row.source_language,
    targetLanguage: row.target_language,
    durationMs: row.duration_ms,
    thumbnailUrl: row.thumbnail_url,
    videoUrl: row.video_url,
    tags: parseTags(row.tag_names),
    createdAt: row.created_at,
  };
}

export function mapLibraryDetailRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    title: row.title,
    authorName: row.author_name,
    sourceLanguage: row.source_language,
    targetLanguage: row.target_language,
    durationMs: row.duration_ms,
    thumbnailUrl: row.thumbnail_url,
    videoUrl: row.video_url,
    audioUrl: row.audio_url,
    subtitleUrl: row.subtitle_url,
    tags: parseTags(row.tag_names),
    createdAt: row.created_at,
  };
}

export function mapUserRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    photoURL: row.photo_url,
    plan: row.plan,
    creditSeconds: row.credit_seconds,
    language: row.language,
    createdAt: row.created_at,
  };
}

export function mapTagRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    displayNameKo: row.display_name_ko,
    displayNameEn: row.display_name_en,
  };
}

const PATCH_BODY_MAP: Record<string, string> = {
  title: 'title', status: 'status', progress: 'progress',
  durationMs: 'duration_ms', persoProjectSeq: 'perso_project_seq',
  persoSpaceSeq: 'perso_space_seq', thumbnailUrl: 'thumbnail_url',
  videoUrl: 'video_url', audioUrl: 'audio_url', subtitleUrl: 'subtitle_url',
  zipUrl: 'zip_url', isFavorite: 'is_favorite',
};

const ALLOWED_PATCH_COLUMNS = new Set(Object.values(PATCH_BODY_MAP));

export function buildPatchFields(body: Record<string, unknown>): {
  fields: string[];
  args: (string | number | null)[];
} {
  const fields: string[] = [];
  const args: (string | number | null)[] = [];
  for (const [camel, snake] of Object.entries(PATCH_BODY_MAP)) {
    if (body[camel] !== undefined && ALLOWED_PATCH_COLUMNS.has(snake)) {
      fields.push(`${snake} = ?`);
      const val = body[camel];
      args.push(snake === 'is_favorite' ? (val ? 1 : 0) : (val as string | number | null));
    }
  }
  return { fields, args };
}
