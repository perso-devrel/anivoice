import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { DbProject } from '../services/anivoiceApi';
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
  'lip-syncing': {
    labelKey: 'dashboard.statusLipSyncing',
    dotClass: 'bg-blue-300',
    badgeBg: 'bg-blue-300/10',
    badgeText: 'text-blue-300',
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
      className="glass rounded-xl overflow-hidden group hover:ring-1 hover:ring-primary-500/40 transition-all"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-surface-800 flex items-center justify-center overflow-hidden">
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
          <VideoPlayIcon className="w-10 h-10 text-surface-700 relative z-10" />
        )}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-900/80 text-gray-300 backdrop-blur-sm">
          {project.sourceLanguage?.toUpperCase() || '?'} &rarr;{' '}
          {project.targetLanguage?.toUpperCase() || '?'}
        </span>
        <button
          onClick={(e) => onToggleFavorite(e, project.id, project.isFavorite)}
          aria-label={project.isFavorite ? t('dashboard.removeFavorite') : t('dashboard.addFavorite')}
          className="absolute top-2 right-2 p-1 rounded-full bg-surface-900/60 backdrop-blur-sm hover:bg-surface-900/90 transition-colors"
        >
          <StarIcon className={`w-4 h-4 ${project.isFavorite ? 'text-yellow-400' : 'text-gray-400'}`} fill={project.isFavorite ? 'currentColor' : 'none'} />
        </button>
        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[11px] font-medium bg-black/60 text-gray-300">
          {formatDuration(project.durationMs || 0)}
        </span>
      </div>

      {/* Card body */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
            {project.title}
          </h3>
          <span
            className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${cfg.badgeBg} ${cfg.badgeText}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`}
            />
            {t(cfg.labelKey)}
          </span>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-gray-500">
              {project.progress}%
            </span>
            <span className="text-[11px] text-gray-600">
              {project.createdAt?.split('T')[0] || ''}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-800">
            <div
              className={`h-full rounded-full ${getProgressBarColor(status)} transition-all`}
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
