import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { DbProject } from '../services/koedubApi';
import type { ProjectStatus } from '../types';
import { getProgressBarColor } from '../utils/dashboard';
import { formatDuration } from '../utils/format';
import { VideoPlayIcon, StarIcon } from './icons';

const STATUS_CONFIG: Record<
  string,
  { labelKey: string; dotClass: string; badgeBg: string; badgeText: string }
> = {
  analyzing: {
    labelKey: 'dashboard.statusAnalyzing',
    dotClass: 'bg-yellow-400',
    badgeBg: 'bg-yellow-400/10',
    badgeText: 'text-yellow-400',
  },
  dubbing: {
    labelKey: 'dashboard.statusDubbing',
    dotClass: 'bg-blue-400',
    badgeBg: 'bg-blue-400/10',
    badgeText: 'text-blue-400',
  },
  uploading: {
    labelKey: 'dashboard.statusUploading',
    dotClass: 'bg-yellow-300',
    badgeBg: 'bg-yellow-300/10',
    badgeText: 'text-yellow-300',
  },
  completed: {
    labelKey: 'dashboard.statusCompleted',
    dotClass: 'bg-green-400',
    badgeBg: 'bg-green-400/10',
    badgeText: 'text-green-400',
  },
  failed: {
    labelKey: 'dashboard.statusFailed',
    dotClass: 'bg-red-400',
    badgeBg: 'bg-red-400/10',
    badgeText: 'text-red-400',
  },
};

interface ProjectCardProps {
  project: DbProject & { mappedStatus: ProjectStatus };
  gradient: string;
  onToggleFavorite: (e: React.MouseEvent, projectId: number, current: boolean) => void;
}

export function ProjectCard({ project, gradient, onToggleFavorite }: ProjectCardProps) {
  const { t } = useTranslation();
  const status = project.mappedStatus;
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.analyzing;

  return (
    <Link
      to={`/studio?project=${project.persoProjectSeq}&space=${project.persoSpaceSeq}`}
      className="bg-ink border-2 border-bone/30 overflow-hidden group hover:border-lucy transition-colors"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-void flex items-center justify-center overflow-hidden">
        {project.thumbnailUrl ? (
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
        )}
        {!project.thumbnailUrl && (
          <VideoPlayIcon className="w-10 h-10 text-bone/40 relative z-10" />
        )}
        <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-mono bg-void/80 text-bone/80">
          {project.sourceLanguage?.toUpperCase() || '?'} &rarr;{' '}
          {project.targetLanguage?.toUpperCase() || '?'}
        </span>
        <button
          onClick={(e) => onToggleFavorite(e, project.id, project.isFavorite)}
          aria-label={project.isFavorite ? t('dashboard.removeFavorite') : t('dashboard.addFavorite')}
          className="absolute top-2 right-2 p-1 rounded-full bg-void/60 hover:bg-void/90 transition-colors"
        >
          <StarIcon className={`w-4 h-4 ${project.isFavorite ? 'text-yellow-400' : 'text-bone/50'}`} fill={project.isFavorite ? 'currentColor' : 'none'} />
        </button>
        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[11px] font-medium bg-void/60 text-bone/80">
          {formatDuration(project.durationMs || 0)}
        </span>
      </div>

      {/* Card body */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-bone truncate group-hover:text-lucy transition-colors">
            {project.title}
          </h3>
          <span
            className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium ${cfg.badgeBg} ${cfg.badgeText}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`}
            />
            {t(cfg.labelKey)}
          </span>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-bone/50">
              {project.progress}%
            </span>
            <span className="text-[11px] text-bone/40">
              {project.createdAt?.split('T')[0] || ''}
            </span>
          </div>
          <div className="w-full h-1.5 bg-bone/10">
            <div
              className={`h-full ${getProgressBarColor(status)} transition-all`}
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
