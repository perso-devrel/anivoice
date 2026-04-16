import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { DbProject } from '../services/anivoiceApi';
import type { ProjectStatus } from '../types';
import { formatDuration } from '../utils/format';
import { VideoPlayIcon, StarIcon } from './icons';

const STATUS_CONFIG: Record<
  string,
  { labelKey: string; tone: 'work' | 'done' | 'fail' }
> = {
  analyzing: { labelKey: 'dashboard.statusAnalyzing', tone: 'work' },
  dubbing: { labelKey: 'dashboard.statusDubbing', tone: 'work' },
  'lip-syncing': { labelKey: 'dashboard.statusLipSyncing', tone: 'work' },
  uploading: { labelKey: 'dashboard.statusUploading', tone: 'work' },
  completed: { labelKey: 'dashboard.statusCompleted', tone: 'done' },
  failed: { labelKey: 'dashboard.statusFailed', tone: 'fail' },
};

const TONE_CLASS: Record<'work' | 'done' | 'fail', string> = {
  work: 'text-cinnabar',
  done: 'text-ink',
  fail: 'text-cinnabar-deep',
};

interface ProjectCardProps {
  project: DbProject & { mappedStatus: ProjectStatus };
  gradient?: string;
  onToggleFavorite: (e: React.MouseEvent, projectId: number, current: boolean) => void;
}

export function ProjectCard({ project, gradient: _gradient, onToggleFavorite }: ProjectCardProps) {
  const { t } = useTranslation();
  void _gradient;
  const status = project.mappedStatus;
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.analyzing;

  return (
    <Link
      to={`/studio?project=${project.persoProjectSeq}&space=${project.persoSpaceSeq}`}
      className="group block border border-ink/10 hover:border-ink transition-colors bg-cream"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-paper-deep overflow-hidden">
        {project.thumbnailUrl ? (
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-ink flex items-center justify-center">
            <VideoPlayIcon className="w-8 h-8 text-cream/30" />
          </div>
        )}
        <span className="absolute top-2 left-2 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] bg-cream text-ink">
          {project.sourceLanguage?.toUpperCase() || '?'} → {project.targetLanguage?.toUpperCase() || '?'}
        </span>
        <button
          onClick={(e) => onToggleFavorite(e, project.id, project.isFavorite)}
          aria-label={project.isFavorite ? t('dashboard.removeFavorite') : t('dashboard.addFavorite')}
          className="absolute top-2 right-2 p-1 bg-cream/95 hover:bg-cream transition-colors"
        >
          <StarIcon
            className={`w-4 h-4 ${project.isFavorite ? 'text-cinnabar' : 'text-ink-mute'}`}
            fill={project.isFavorite ? 'currentColor' : 'none'}
          />
        </button>
        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 font-mono text-[10px] tracking-wider bg-ink text-cream">
          {formatDuration(project.durationMs || 0)}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 border-t border-ink/10">
        <div className="flex items-baseline justify-between gap-2 mb-3">
          <h3 className="font-display text-base text-ink truncate group-hover:text-cinnabar transition-colors">
            {project.title}
          </h3>
          <span className={`shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] ${TONE_CLASS[cfg.tone]}`}>
            · {t(cfg.labelKey)}
          </span>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[10px] tracking-widest text-ink-mute">
              {project.progress.toString().padStart(3, '0')}%
            </span>
            <span className="font-mono text-[10px] tracking-widest text-ink-mute">
              {project.createdAt?.split('T')[0] || ''}
            </span>
          </div>
          <div className="w-full h-px bg-ink/15">
            <div
              className="h-full bg-ink transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
