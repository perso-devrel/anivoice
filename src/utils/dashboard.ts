import type { DbProject } from '../services/anivoiceApi';
import type { ProjectStatus } from '../types';

export function mapDbStatus(project: DbProject): ProjectStatus {
  const s = project.status?.toLowerCase() || '';
  if (s === 'failed') return 'failed';
  if (s === 'completed' || project.progress >= 100) return 'completed';
  if (s.includes('lip')) return 'lip-syncing';
  if (s.includes('dub') || s.includes('translat')) return 'dubbing';
  if (s.includes('upload')) return 'uploading';
  if (s.includes('analyz') || s.includes('process')) return 'analyzing';
  if (project.progress > 0 && project.progress < 100) return 'dubbing';
  return 'analyzing';
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
