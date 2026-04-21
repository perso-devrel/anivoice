import type { DbProject } from '../services/anivoiceApi';
import type { ProjectStatus } from '../types';

export type FilterTab = 'all' | 'favorites' | 'in-progress' | 'completed';
export type SortOrder = 'newest' | 'oldest';

type MappedProject = DbProject & { mappedStatus: ProjectStatus };

export function filterProjects(
  projects: MappedProject[],
  opts: { query: string; languageFilter: string; activeTab: FilterTab },
): MappedProject[] {
  const q = opts.query.trim().toLowerCase();
  return projects.filter((p) => {
    if (q && !p.title.toLowerCase().includes(q) && !p.targetLanguage.toLowerCase().includes(q)) return false;
    if (opts.languageFilter && !p.targetLanguage.toLowerCase().includes(opts.languageFilter)) return false;
    if (opts.activeTab === 'all') return true;
    if (opts.activeTab === 'favorites') return p.isFavorite;
    if (opts.activeTab === 'completed') return p.mappedStatus === 'completed';
    return p.mappedStatus !== 'completed' && p.mappedStatus !== 'failed';
  });
}

export function sortProjects(projects: MappedProject[], order: SortOrder): MappedProject[] {
  return [...projects].sort((a, b) => {
    const dateA = a.createdAt || '';
    const dateB = b.createdAt || '';
    return order === 'newest' ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB);
  });
}

export function extractAvailableLanguages(projects: DbProject[]): string[] {
  return Array.from(
    new Set(
      projects.flatMap((p) =>
        (p.targetLanguage || '').split(',').map((l) => l.trim().toLowerCase()).filter(Boolean),
      ),
    ),
  ).sort();
}

export function mapDbStatus(project: DbProject): ProjectStatus {
  const s = project.status?.toLowerCase() || '';
  if (s === 'failed') return 'failed';
  if (s === 'completed' || project.progress >= 100) return 'completed';
  if (s.includes('dub') || s.includes('translat')) return 'dubbing';
  if (s.includes('upload')) return 'uploading';
  if (s.includes('analyz') || s.includes('process')) return 'analyzing';
  if (project.progress > 0 && project.progress < 100) return 'dubbing';
  return 'analyzing';
}

export function countProjectStats(projects: MappedProject[]): { inProgress: number; completed: number } {
  let inProgress = 0;
  let completed = 0;
  for (const p of projects) {
    if (p.mappedStatus === 'completed') completed++;
    else if (p.mappedStatus !== 'failed') inProgress++;
  }
  return { inProgress, completed };
}

export function getProgressBarColor(status: ProjectStatus): string {
  switch (status) {
    case 'analyzing':
    case 'uploading':
      return 'bg-yellow-400';
    case 'dubbing':
      return 'bg-blue-400';
    case 'completed':
      return 'bg-green-400';
    case 'failed':
      return 'bg-red-400';
    default:
      return 'bg-primary-400';
  }
}

