import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  listSpaces,
  uploadVideoFile,
  ensureSpaceQueue,
  requestTranslation,
  pollProgress,
  getScript,
  getProgress,
  translateSentence,
  generateSentenceAudio,
  requestLipSync,
  getDownloadLinks,
  resolvePersoFileUrl,
} from '../services/persoApi';
import { createProject, updateProject, deductCredits, getTags, publishProject } from '../services/anivoiceApi';
import { useAuthStore } from '../stores/authStore';
import type { Tag } from '../services/anivoiceApi';
import type { PersoProgress, PersoScriptSentence, PersoDownloadLinks } from '../types';

type Step = 'upload' | 'settings' | 'result';

const LANGUAGES = ['auto', 'ja', 'ko', 'en', 'es', 'pt', 'id', 'ar'] as const;

const SPEAKER_COLORS = ['#f472b6', '#a78bfa', '#38bdf8', '#34d399', '#fbbf24', '#fb923c'];

const STEPS: Step[] = ['upload', 'settings', 'result'];

/* ── inline SVG icons ── */

function FileIcon({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9.75m3 3H9.75m1.5-9h3.375c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H11.25a1.125 1.125 0 0 1-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125ZM3.375 6.75h.008v.008h-.008V6.75Zm0 3h.008v.008h-.008V9.75Zm0 3h.008v.008h-.008v-.008Zm13.5-9v1.5a3.375 3.375 0 0 0 3.375 3.375h1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 2.25h7.379a1.125 1.125 0 0 1 .795.33l4.246 4.245c.211.211.33.497.33.796V21.75a1.125 1.125 0 0 1-1.125 1.125H6a1.125 1.125 0 0 1-1.125-1.125V3.375C4.875 2.754 5.379 2.25 6 2.25Z" />
    </svg>
  );
}

function PlayIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function DownloadIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function CheckIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function SpinnerIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/* ── component ── */

export default function StudioPage() {
  const { t } = useTranslation();

  const [searchParams] = useSearchParams();

  const [step, setStep] = useState<Step>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [withLipSync, setWithLipSync] = useState(false);

  // Processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStage, setProcessStage] = useState<'uploading' | 'dubbing' | 'lip-syncing' | 'done'>('uploading');
  const [progress, setProgress] = useState(0);
  const [remainingMinutes, setRemainingMinutes] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Result
  const [projectSeq, setProjectSeq] = useState<number | null>(null);
  const [spaceSeq, setSpaceSeq] = useState<number | null>(null);
  const [downloadLinks, setDownloadLinks] = useState<PersoDownloadLinks | null>(null);
  const [sentences, setSentences] = useState<PersoScriptSentence[]>([]);
  const [editingValues, setEditingValues] = useState<Record<number, string>>({});
  const [savingSentence, setSavingSentence] = useState<number | null>(null);
  const [loadingProject, setLoadingProject] = useState(false);

  // DB project tracking
  const [dbProjectId, setDbProjectId] = useState<number | null>(null);

  // Publish
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Store uploaded file info for use after polling
  const uploadedFileRef = useRef<{ seq: number; durationMs: number } | null>(null);

  // Fetch tags on mount
  useEffect(() => { getTags().then(setTags).catch(() => {}); }, []);

  // Load existing project from URL params (?project=SEQ&space=SEQ)
  useEffect(() => {
    const projectParam = searchParams.get('project');
    const spaceParam = searchParams.get('space');
    if (!projectParam || !spaceParam) return;

    const pSeq = Number(projectParam);
    const sSeq = Number(spaceParam);
    if (isNaN(pSeq) || isNaN(sSeq)) return;

    setProjectSeq(pSeq);
    setSpaceSeq(sSeq);
    setStep('result');
    setLoadingProject(true);

    async function loadExistingProject() {
      try {
        // Check progress
        const prog = await getProgress(pSeq, sSeq);
        const reason = (prog.progressReason || '').toUpperCase();
        const isComplete = reason === 'COMPLETED' || prog.progress >= 100;

        if (!isComplete && !prog.hasFailed) {
          // Still processing — poll
          setIsProcessing(true);
          setProcessStage('dubbing');
          setProgress(prog.progress);
          await pollProgress(pSeq, sSeq, (p: PersoProgress) => {
            setProgress(p.progress);
            if (p.expectedRemainingTimeMinutes > 0) {
              setRemainingMinutes(p.expectedRemainingTimeMinutes);
            }
          });
        }

        if (prog.hasFailed) {
          setError(`Translation failed: ${prog.progressReason}`);
          setLoadingProject(false);
          setIsProcessing(false);
          return;
        }

        // Load script
        try {
          const script = await getScript(pSeq, sSeq);
          setSentences(script.sentences);
        } catch { /* script not ready */ }

        // Load downloads
        try {
          const links = await getDownloadLinks(pSeq, sSeq);
          setDownloadLinks(links);
        } catch { /* downloads not ready */ }

        setProgress(100);
        setProcessStage('done');
        setIsProcessing(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setIsProcessing(false);
      } finally {
        setLoadingProject(false);
      }
    }

    loadExistingProject();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── step indicator ── */
  const stepLabels: Record<Step, string> = {
    upload: t('common.upload'),
    settings: t('studio.selectLanguage'),
    result: t('studio.resultTitle'),
  };

  function StepIndicator() {
    return (
      <div className="flex items-center justify-center gap-2 mb-8">
        {STEPS.map((s, i) => {
          const isCurrent = s === step;
          const isPast = STEPS.indexOf(step) > i;
          return (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all ${
                  isCurrent
                    ? 'gradient-bg text-white shadow-lg shadow-primary-500/30'
                    : isPast
                      ? 'bg-primary-600 text-white'
                      : 'bg-surface-800 text-surface-200/50'
                }`}
              >
                {isPast ? <CheckIcon className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`text-sm hidden sm:inline ${
                  isCurrent ? 'text-white font-medium' : isPast ? 'text-primary-400' : 'text-surface-200/50'
                }`}
              >
                {stepLabels[s]}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-10 h-0.5 mx-1 rounded ${
                    isPast ? 'bg-primary-500' : 'bg-surface-700'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  /* ── handlers ── */

  function handleFileChange(file: File | null) {
    if (!file) return;
    setSelectedFile(file);
    setError(null);
    setStep('settings');
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    handleFileChange(e.dataTransfer.files?.[0] ?? null);
  }

  const handleStartDubbing = useCallback(async () => {
    setIsProcessing(true);
    setError(null);
    setRemainingMinutes(null);
    setStep('result');
    setProcessStage('uploading');
    setProgress(0);

    try {
      if (!targetLanguage || targetLanguage === sourceLanguage) {
        throw new Error(t('studio.selectTargetLanguage'));
      }

      // 1. Get user's space
      setProgress(5);
      const spaces = await listSpaces();
      if (spaces.length === 0) {
        throw new Error('No workspace found. Please create a space in Perso.ai first.');
      }
      const space = spaces[0];
      setSpaceSeq(space.spaceSeq);

      // 2. Upload file
      setProgress(10);
      let uploadedFile;
      if (selectedFile) {
        uploadedFile = await uploadVideoFile(space.spaceSeq, selectedFile);
      } else {
        throw new Error('No file provided');
      }
      setProgress(30);
      uploadedFileRef.current = uploadedFile;

      // 3. Ensure the queue exists before the first translation request
      setProgress(33);
      await ensureSpaceQueue(space.spaceSeq);

      // 4. Request translation (dubbing)
      setProcessStage('dubbing');
      setProgress(35);
      const projectIds = await requestTranslation(space.spaceSeq, {
        mediaSeq: uploadedFile.seq,
        isVideoProject: true,
        sourceLanguageCode: sourceLanguage === 'auto' ? undefined : sourceLanguage,
        targetLanguageCodes: [targetLanguage],
        numberOfSpeakers: 1,
        withLipSync,
        preferredSpeedType: 'GREEN',
      });

      const primaryProjectSeq = projectIds[0];
      if (!primaryProjectSeq) {
        throw new Error('Perso did not return a project id for this dubbing request.');
      }
      setProjectSeq(primaryProjectSeq);

      // Create project record in DB
      const dbProject = await createProject({
        title: selectedFile?.name || 'Untitled',
        originalFileName: selectedFile?.name,
        sourceLanguage,
        targetLanguage: targetLanguage,
        durationMs: uploadedFile.durationMs,
        persoProjectSeq: primaryProjectSeq,
        persoSpaceSeq: space.spaceSeq,
      });
      setDbProjectId(dbProject.id);

      // 5. Poll progress (every 5 seconds)
      await pollProgress(primaryProjectSeq, space.spaceSeq, (p: PersoProgress) => {
        setProgress(35 + (p.progress * 0.55)); // 35~90%
        if (p.expectedRemainingTimeMinutes > 0) {
          setRemainingMinutes(p.expectedRemainingTimeMinutes);
        }
      });

      setProgress(90);

      // 6. Fetch script for editing
      setProcessStage('done');
      setProgress(95);
      try {
        const script = await getScript(primaryProjectSeq, space.spaceSeq);
        setSentences(script.sentences);
      } catch {
        // Script may not be ready yet — ok to continue
      }

      // 7. Fetch download links
      let links: PersoDownloadLinks | null = null;
      try {
        links = await getDownloadLinks(primaryProjectSeq, space.spaceSeq);
        setDownloadLinks(links);
      } catch {
        // Downloads may not be available yet
      }

      // 8. Update DB project with completed status
      if (dbProject.id && links) {
        await updateProject(dbProject.id, {
          status: 'completed',
          progress: 100,
          videoUrl: links.videoFile?.videoDownloadLink,
          audioUrl: links.audioFile?.voiceWithBackgroundAudioDownloadLink || links.audioFile?.voiceAudioDownloadLink,
          zipUrl: links.zippedFileDownloadLink,
        });
        // Deduct credits
        try {
          const result = await deductCredits(dbProject.id, uploadedFile.durationMs);
          useAuthStore.getState().setCreditSeconds(result.remainingSeconds);
        } catch { /* credits may not be set up yet */ }
      }

      setProgress(100);
      setRemainingMinutes(null);
      setIsProcessing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setRemainingMinutes(null);
      setIsProcessing(false);
    }
  }, [selectedFile, sourceLanguage, targetLanguage, withLipSync, t]);

  async function handleSaveSentence(sentenceSeq: number) {
    if (!projectSeq || !(sentenceSeq in editingValues)) return;
    setSavingSentence(sentenceSeq);
    try {
      const newText = editingValues[sentenceSeq];
      // Update translation text
      await translateSentence(projectSeq, sentenceSeq, newText);
      // Regenerate audio for this sentence
      await generateSentenceAudio(projectSeq, sentenceSeq, newText);

      setSentences((prev) =>
        prev.map((s) =>
          s.seq === sentenceSeq ? { ...s, translatedText: newText } : s
        ),
      );
      setEditingValues((prev) => {
        const next = { ...prev };
        delete next[sentenceSeq];
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingSentence(null);
    }
  }

  async function handleRequestLipSync() {
    if (!projectSeq || !spaceSeq) return;
    setProcessStage('lip-syncing');
    setIsProcessing(true);
    setProgress(50);
    try {
      const lipSyncIds = await requestLipSync(projectSeq, spaceSeq);
      const lipSyncProjectSeq = lipSyncIds[0];
      if (!lipSyncProjectSeq) {
        throw new Error('Perso did not return a project id for lip sync.');
      }
      // Poll lip sync project progress
      await pollProgress(lipSyncProjectSeq, spaceSeq, (p) => {
        setProgress(50 + (p.progress * 0.5));
      });
      // Refresh download links
      const links = await getDownloadLinks(projectSeq, spaceSeq);
      setDownloadLinks(links);
      setIsProcessing(false);
      setProcessStage('done');
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setIsProcessing(false);
    }
  }

  function handleDownload(type: 'video' | 'subtitle' | 'audio' | 'zip') {
    if (!downloadLinks) return;
    let path: string | undefined;
    switch (type) {
      case 'video':
        path = downloadLinks.videoFile?.videoDownloadLink;
        break;
      case 'subtitle':
        path = downloadLinks.srtFile?.translatedSubtitleDownloadLink
          || downloadLinks.srtFile?.originalSubtitleDownloadLink;
        break;
      case 'audio':
        path = downloadLinks.audioFile?.voiceWithBackgroundAudioDownloadLink
          || downloadLinks.audioFile?.voiceAudioDownloadLink;
        break;
      case 'zip':
        path = downloadLinks.zippedFileDownloadLink;
        break;
    }
    if (path) {
      const fullUrl = resolvePersoFileUrl(path);
      if (fullUrl) {
        window.open(fullUrl, '_blank');
      }
    }
  }

  async function handlePublish() {
    if (!dbProjectId) return;
    setIsPublishing(true);
    try {
      await publishProject(dbProjectId, selectedTags);
      setIsPublished(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsPublishing(false);
    }
  }

  /* ── step: upload ── */

  function UploadStep() {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-2">
          <h2 className="text-2xl font-bold gradient-text mb-2">{t('studio.uploadTitle')}</h2>
          <p className="text-surface-200/60 text-sm">{t('studio.uploadDesc')}</p>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`glass rounded-2xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center py-16 gap-4 ${
            isDragOver
              ? 'border-primary-400 bg-primary-500/10'
              : 'border-surface-700 hover:border-primary-500/50'
          }`}
        >
          <FileIcon className="w-12 h-12 text-surface-200/40" />
          <p className="text-surface-200/70 text-center">{t('studio.dragDrop')}</p>
          <button type="button" className="gradient-bg px-5 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity">
            {t('studio.orBrowse')}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
        </div>

        <p className="text-center text-xs text-surface-200/40">{t('studio.supportedFormats')}</p>
      </div>
    );
  }

  /* ── step: settings ── */

  function SettingsStep() {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-2">
          <h2 className="text-2xl font-bold gradient-text mb-2">{t('studio.selectLanguage')}</h2>
        </div>

        {selectedFile && (
          <div className="glass rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-surface-200/80">
            <FileIcon className="w-5 h-5 shrink-0" />
            <span className="truncate">{selectedFile.name}</span>
            <button
              type="button"
              onClick={() => { setSelectedFile(null); setStep('upload'); }}
              className="ml-auto text-xs text-surface-200/40 hover:text-red-400 transition-colors"
            >
              {t('common.cancel')}
            </button>
          </div>
        )}

        {/* source language */}
        <div className="glass rounded-2xl p-5 space-y-3">
          <label className="block text-sm font-medium text-surface-200/80">
            {t('studio.sourceLanguage')}
          </label>
          <select
            value={sourceLanguage}
            onChange={(e) => {
              const nextSourceLanguage = e.target.value;
              setSourceLanguage(nextSourceLanguage);
              if (targetLanguage === nextSourceLanguage) setTargetLanguage('');
            }}
            className="w-full bg-surface-900 border border-surface-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors appearance-none"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang === 'auto' ? '\uC790\uB3D9 \uAC10\uC9C0 (Auto)' : t(`languages.${lang}`)}
              </option>
            ))}
          </select>
        </div>

        {/* target language (single select) */}
        <div className="glass rounded-2xl p-5 space-y-3">
          <label className="block text-sm font-medium text-surface-200/80">
            {t('studio.targetLanguage')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {LANGUAGES.filter((l) => l !== 'auto' && l !== sourceLanguage).map((lang) => {
              const checked = targetLanguage === lang;
              return (
                <label
                  key={lang}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg cursor-pointer border transition-all text-sm ${
                    checked
                      ? 'border-primary-500 bg-primary-500/10 text-white'
                      : 'border-surface-700 bg-surface-900/50 text-surface-200/60 hover:border-surface-200/30'
                  }`}
                >
                  <input type="radio" name="targetLanguage" checked={checked} onChange={() => setTargetLanguage(lang)} className="hidden" />
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${checked ? 'border-primary-500' : 'border-surface-700'}`}>
                    {checked && <span className="w-2 h-2 rounded-full bg-primary-500" />}
                  </span>
                  {t(`languages.${lang}`)}
                </label>
              );
            })}
          </div>
        </div>

        {/* lip sync toggle */}
        <div className="glass rounded-2xl p-5">
          <label className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              onClick={() => setWithLipSync(!withLipSync)}
              className={`w-11 h-6 rounded-full transition-colors relative ${withLipSync ? 'bg-primary-500' : 'bg-surface-700'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${withLipSync ? 'left-5.5 translate-x-0' : 'left-0.5'}`} />
            </button>
            <div>
              <span className="text-sm font-medium text-surface-200/80">{t('studio.progressLipSync')}</span>
              <p className="text-xs text-surface-200/40 mt-0.5">Pro plan required</p>
            </div>
          </label>
        </div>

        <button
          type="button"
          onClick={handleStartDubbing}
          disabled={!targetLanguage}
          className="w-full gradient-bg py-3 rounded-xl text-white font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {t('studio.startDubbing')}
        </button>
      </div>
    );
  }

  /* ── step: result ── */

  function ResultStep() {
    if (loadingProject) {
      return (
        <div className="max-w-lg mx-auto text-center py-12 space-y-4">
          <div className="w-10 h-10 mx-auto border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-surface-200/60 text-sm">{t('studio.loadingProject')}</p>
        </div>
      );
    }

    const progressLabels = [
      { key: 'uploading', label: t('studio.progressAnalyzing') },
      { key: 'dubbing', label: t('studio.progressDubbing') },
      { key: 'lip-syncing', label: t('studio.progressLipSync') },
    ];
    const stageOrder = ['uploading', 'dubbing', 'lip-syncing', 'done'];
    const currentStageIdx = stageOrder.indexOf(processStage);

    if (isProcessing) {
      return (
        <div className="max-w-lg mx-auto space-y-8 text-center py-12">
          <h2 className="text-2xl font-bold gradient-text">{t('studio.processing')}</h2>

          <div className="w-full bg-surface-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full gradient-bg rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          <p className="text-sm text-surface-200/60">
            {Math.round(progress)}%
            {remainingMinutes !== null && remainingMinutes > 0 && (
              <span className="ml-2 text-surface-200/40">
                {t('studio.remainingTime', { minutes: remainingMinutes })}
              </span>
            )}
          </p>

          <div className="flex justify-between text-xs text-surface-200/50">
            {progressLabels.map(({ key, label }, i) => (
              <span key={key} className={`transition-colors ${i <= currentStageIdx ? 'text-primary-400 font-medium' : ''}`}>
                {i <= currentStageIdx && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-400 mr-1.5 align-middle animate-pulse" />
                )}
                {label}
              </span>
            ))}
          </div>
        </div>
      );
    }

    // Error
    if (error) {
      return (
        <div className="max-w-lg mx-auto text-center py-12 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-400">{t('common.error')}</h2>
          <p className="text-sm text-surface-200/60 break-words">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => { setError(null); setStep('settings'); }}
              className="px-4 py-2 rounded-lg border border-surface-700 text-sm text-surface-200/80 hover:text-white transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={handleStartDubbing}
              className="gradient-bg px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {t('common.retry')}
            </button>
          </div>
        </div>
      );
    }

    // Success
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold gradient-text text-center mb-2">{t('studio.resultTitle')}</h2>

        {/* video player */}
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

        {/* download buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {([
            { label: t('studio.downloadVideo'), type: 'video' as const, available: !!downloadLinks?.videoFile?.videoDownloadLink },
            { label: t('studio.downloadSubtitle'), type: 'subtitle' as const, available: !!(downloadLinks?.srtFile?.translatedSubtitleDownloadLink || downloadLinks?.srtFile?.originalSubtitleDownloadLink) },
            { label: t('studio.downloadAudio'), type: 'audio' as const, available: !!(downloadLinks?.audioFile?.voiceWithBackgroundAudioDownloadLink || downloadLinks?.audioFile?.voiceAudioDownloadLink) },
            { label: 'ZIP (All)', type: 'zip' as const, available: !!downloadLinks?.zippedFileDownloadLink },
          ]).map(({ label, type, available }) => (
            <button
              key={type}
              type="button"
              onClick={() => handleDownload(type)}
              disabled={!available}
              className="glass rounded-xl px-4 py-3 flex items-center justify-center gap-2 text-sm text-surface-200/80 hover:text-white hover:border-primary-500/40 transition-colors disabled:opacity-30"
            >
              <DownloadIcon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* lip sync button (if not already applied) */}
        {!withLipSync && projectSeq && spaceSeq && (
          <button
            type="button"
            onClick={handleRequestLipSync}
            className="w-full glass rounded-xl px-4 py-3 text-sm text-accent-400 hover:text-white hover:border-accent-500/40 transition-colors"
          >
            {t('studio.progressLipSync')} (Pro)
          </button>
        )}

        {/* publish section */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="text-base font-semibold text-surface-200/90">
            {isPublished ? '\u2705 \uACF5\uAC1C\uB428' : '\uACF5\uAC1C\uD558\uAE30'}
          </h3>
          {isPublished ? (
            <p className="text-sm text-green-400">{t('studio.publishedMessage') || '\uB77C\uC774\uBE0C\uB7EC\uB9AC\uC5D0 \uACF5\uAC1C\uB418\uC5C8\uC2B5\uB2C8\uB2E4.'}</p>
          ) : (
            <>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() =>
                          setSelectedTags((prev) =>
                            isSelected ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                          )
                        }
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          isSelected
                            ? 'border-primary-500 bg-primary-500/15 text-primary-400'
                            : 'border-surface-700 bg-surface-900/50 text-surface-200/60 hover:border-surface-200/30'
                        }`}
                      >
                        {tag.displayNameKo}
                      </button>
                    );
                  })}
                </div>
              )}
              <button
                type="button"
                onClick={handlePublish}
                disabled={!dbProjectId || isPublishing}
                className="w-full gradient-bg py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {isPublishing ? <SpinnerIcon className="w-4 h-4 mx-auto" /> : '\uACF5\uAC1C\uD558\uAE30'}
              </button>
            </>
          )}
        </div>

        {/* translation edit */}
        {sentences.length > 0 && (
          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-semibold text-surface-200/90">{t('studio.editTranslation')}</h3>
            <div className="space-y-3">
              {sentences.map((s) => {
                const color = SPEAKER_COLORS[s.speakerOrderIndex % SPEAKER_COLORS.length];
                const isEditing = s.seq in editingValues;
                const isSaving = savingSentence === s.seq;

                return (
                  <div key={s.seq} className="bg-surface-900/60 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-surface-200/50">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span>Speaker {s.speakerOrderIndex + 1}</span>
                      <span className="ml-auto">{formatMs(s.offsetMs)} - {formatMs(s.offsetMs + s.durationMs)}</span>
                      {s.matchingRate && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          s.matchingRate.level >= 3 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {s.matchingRate.levelType}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="text-sm text-surface-200/60 bg-surface-800 rounded-lg px-3 py-2">
                        {s.originalText}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={isEditing ? editingValues[s.seq] : s.translatedText}
                          onChange={(e) =>
                            setEditingValues((prev) => ({ ...prev, [s.seq]: e.target.value }))
                          }
                          className="flex-1 text-sm text-white bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500 transition-colors"
                        />
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleSaveSentence(s.seq)}
                            disabled={isSaving}
                            className="px-3 py-2 rounded-lg gradient-bg text-white text-xs font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
                          >
                            {isSaving ? <SpinnerIcon className="w-3 h-3" /> : t('common.save')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* new project */}
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => {
              setStep('upload');
              setSelectedFile(null);
              setTargetLanguage('');
              setProjectSeq(null);
              setSpaceSeq(null);
              setDownloadLinks(null);
              setSentences([]);
              setEditingValues({});
              setError(null);
              setProgress(0);
              setWithLipSync(false);
              setDbProjectId(null);
              setSelectedTags([]);
              setIsPublished(false);
            }}
            className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            + {t('dashboard.newProject')}
          </button>
        </div>
      </div>
    );
  }

  /* ── render ── */

  return (
    <div className="min-h-screen bg-surface-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16">
        {StepIndicator()}
        {step === 'upload' && UploadStep()}
        {step === 'settings' && SettingsStep()}
        {step === 'result' && ResultStep()}
      </div>
    </div>
  );
}

function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
