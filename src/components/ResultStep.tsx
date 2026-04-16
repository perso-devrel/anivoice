import { useTranslation } from 'react-i18next';
import { resolvePersoFileUrl } from '../services/persoApi';
import type { Tag } from '../services/anivoiceApi';
import type { PersoScriptSentence, PersoDownloadLinks } from '../types';
import { PlayIcon, DownloadIcon, AlertCircleIcon, LoadingSpinner } from './icons';
import { SentenceEditList } from './SentenceEditList';
import { PublishSection } from './PublishSection';

type ProcessStage = 'uploading' | 'dubbing' | 're-dubbing' | 'lip-syncing' | 'done';

const FLOW_STAGES: Record<string, { key: string; i18nKey: string }[]> = {
  initial: [
    { key: 'uploading', i18nKey: 'studio.progressAnalyzing' },
    { key: 'dubbing', i18nKey: 'studio.progressDubbing' },
    { key: 'done', i18nKey: 'studio.progressComplete' },
  ],
  editing: [
    { key: 're-dubbing', i18nKey: 'studio.progressEditing' },
    { key: 'done', i18nKey: 'studio.progressComplete' },
  ],
  lipsync: [
    { key: 'lip-syncing', i18nKey: 'studio.progressLipSync' },
    { key: 'done', i18nKey: 'studio.progressComplete' },
  ],
};

function getFlowType(stage: ProcessStage): string {
  if (stage === 're-dubbing') return 'editing';
  if (stage === 'lip-syncing') return 'lipsync';
  return 'initial';
}

const RESULT_CENTER_CLASS = 'max-w-lg mx-auto text-center py-12';
const RESULT_MUTED_TEXT = 'text-sm text-surface-200/60';

const DOWNLOAD_BUTTONS = [
  { i18nKey: 'studio.downloadVideo', type: 'video' },
  { i18nKey: 'studio.downloadSubtitle', type: 'subtitle' },
  { i18nKey: 'studio.downloadAudio', type: 'audio' },
  { i18nKey: 'studio.downloadZip', type: 'zip' },
] as const;

function isDownloadAvailable(type: string, links: PersoDownloadLinks | null): boolean {
  if (!links) return false;
  switch (type) {
    case 'video': return !!links.videoFile?.videoDownloadLink;
    case 'subtitle': return !!(links.srtFile?.translatedSubtitleDownloadLink || links.srtFile?.originalSubtitleDownloadLink);
    case 'audio': return !!(links.audioFile?.voiceWithBackgroundAudioDownloadLink || links.audioFile?.voiceAudioDownloadLink);
    case 'zip': return !!links.zippedFileDownloadLink;
    default: return false;
  }
}

interface ResultStepProps {
  loadingProject: boolean;
  isProcessing: boolean;
  processStage: ProcessStage;
  progress: number;
  remainingMinutes: number | null;
  error: string | null;
  downloadLinks: PersoDownloadLinks | null;
  projectSeq: number | null;
  spaceSeq: number | null;
  withLipSync: boolean;
  sentences: PersoScriptSentence[];
  editingValues: Record<number, string>;
  savingSentence: number | null;
  isPublished: boolean;
  isPublishing: boolean;
  tags: Tag[];
  selectedTags: number[];
  dbProjectId: number | null;
  linkCopied: boolean;
  onRetry: () => void;
  onGoBack: () => void;
  onDownload: (type: 'video' | 'subtitle' | 'audio' | 'zip') => void;
  onRequestLipSync: () => void;
  onTagToggle: (tagId: number) => void;
  onPublish: () => void;
  onCopyShareLink: () => void;
  onEditChange: (seq: number, value: string) => void;
  onSaveSentence: (seq: number) => void;
  onApplyEdits: () => void;
  onReset: () => void;
}

export function ResultStep({
  loadingProject,
  isProcessing,
  processStage,
  progress,
  remainingMinutes,
  error,
  downloadLinks,
  projectSeq,
  spaceSeq,
  withLipSync,
  sentences,
  editingValues,
  savingSentence,
  isPublished,
  isPublishing,
  tags,
  selectedTags,
  dbProjectId,
  linkCopied,
  onRetry,
  onGoBack,
  onDownload,
  onRequestLipSync,
  onTagToggle,
  onPublish,
  onCopyShareLink,
  onEditChange,
  onSaveSentence,
  onApplyEdits,
  onReset,
}: ResultStepProps) {
  const { t } = useTranslation();

  if (loadingProject) {
    return (
      <div className={`${RESULT_CENTER_CLASS} space-y-4`}>
        <LoadingSpinner className="w-10 h-10 mx-auto border-primary-400" />
        <p className={RESULT_MUTED_TEXT}>{t('studio.loadingProject')}</p>
      </div>
    );
  }

  const flowType = getFlowType(processStage);
  const flowStages = FLOW_STAGES[flowType];
  const currentStageIdx = flowStages.findIndex(({ key }) => key === processStage);

  if (isProcessing) {
    return (
      <div className={`${RESULT_CENTER_CLASS} space-y-8`}>
        <h2 className="text-2xl font-bold gradient-text">{t('studio.processing')}</h2>

        <div className="w-full bg-surface-800 rounded-full h-2 overflow-hidden">
          <div
            className="h-full gradient-bg rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <p className={RESULT_MUTED_TEXT}>
          {Math.round(progress)}%
          {remainingMinutes !== null && remainingMinutes > 0 && (
            <span className="ml-2 text-surface-200/40">
              {t('studio.remainingTime', { minutes: remainingMinutes })}
            </span>
          )}
        </p>

        <div className="flex justify-between text-xs text-surface-200/50">
          {flowStages.map(({ key, i18nKey }, i) => (
            <span key={key} className={`transition-colors ${i <= currentStageIdx ? 'text-primary-400 font-medium' : ''}`}>
              {i <= currentStageIdx && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-400 mr-1.5 align-middle animate-pulse" />
              )}
              {t(i18nKey)}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${RESULT_CENTER_CLASS} space-y-4`}>
        <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircleIcon className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-red-400">{t('common.error')}</h2>
        <p className={`${RESULT_MUTED_TEXT} break-words`}>{error}</p>
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={onGoBack}
            className="px-4 py-2 rounded-lg border border-surface-700 text-sm text-surface-200/80 hover:text-white transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={onRetry}
            className="gradient-bg px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold gradient-text text-center mb-2">{t('studio.resultTitle')}</h2>

      <div className="glass rounded-2xl overflow-hidden">
        {downloadLinks?.videoFile?.videoDownloadLink ? (
          <video
            src={resolvePersoFileUrl(downloadLinks.videoFile.videoDownloadLink)}
            controls
            className="w-full aspect-video bg-black"
          />
        ) : (
          <div className="relative bg-black aspect-video flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <PlayIcon className="w-8 h-8 text-white ml-1" />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {DOWNLOAD_BUTTONS.map(({ i18nKey, type }) => (
          <button
            key={type}
            type="button"
            onClick={() => onDownload(type)}
            disabled={!isDownloadAvailable(type, downloadLinks)}
            className="glass rounded-xl px-4 py-3 flex items-center justify-center gap-2 text-sm text-surface-200/80 hover:text-white hover:border-primary-500/40 transition-colors disabled:opacity-30"
          >
            <DownloadIcon className="w-4 h-4" />
            {t(i18nKey)}
          </button>
        ))}
      </div>

      {!withLipSync && projectSeq && spaceSeq && (
        <button
          type="button"
          onClick={onRequestLipSync}
          className="w-full glass rounded-xl px-4 py-3 text-sm text-accent-400 hover:text-white hover:border-accent-500/40 transition-colors"
        >
          {t('studio.progressLipSync')}
        </button>
      )}

      <PublishSection
        isPublished={isPublished}
        isPublishing={isPublishing}
        tags={tags}
        selectedTags={selectedTags}
        onTagToggle={onTagToggle}
        dbProjectId={dbProjectId}
        linkCopied={linkCopied}
        onPublish={onPublish}
        onCopyShareLink={onCopyShareLink}
      />

      <SentenceEditList
        sentences={sentences}
        editingValues={editingValues}
        savingSentence={savingSentence}
        onEditChange={onEditChange}
        onSave={onSaveSentence}
      />

      {sentences.length > 0 && (
        <button
          type="button"
          onClick={onApplyEdits}
          disabled={isProcessing}
          className="w-full gradient-bg py-3 rounded-xl text-white font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t('studio.applyEdits')}
        </button>
      )}

      <div className="text-center pt-4">
        <button
          type="button"
          onClick={onReset}
          className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
        >
          + {t('dashboard.newProject')}
        </button>
      </div>
    </div>
  );
}
