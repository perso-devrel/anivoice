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

export function getProgressBarColor(status: ProjectStatus): string {
  switch (status) {
    case 'analyzing':
    case 'uploading':
      return 'bg-yellow-400';
    case 'dubbing':
    case 'lip-syncing':
      return 'bg-blue-400';
    case 'completed':
      return 'bg-green-400';
    case 'failed':
      return 'bg-red-400';
    default:
      return 'bg-primary-400';
  }
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
