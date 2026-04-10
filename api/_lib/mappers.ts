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
