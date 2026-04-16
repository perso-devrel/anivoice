import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import * as api from '../services/persoApi';
import { usePageTitle } from '../hooks/usePageTitle';
import { useClipboard } from '../hooks/useClipboard';
import { getErrorMessage } from '../utils/format';

const BASE = (import.meta.env.VITE_PERSO_PROXY_PATH || '/api/perso').replace(/\/+$/, '');
const INTEGRATION_INPUT_CLASS = 'w-24 bg-transparent border-b border-ink/30 px-1 py-0.5 text-ink text-xs font-mono focus:outline-none focus:border-cinnabar';

// ── Types ──

type TestStatus = 'idle' | 'running' | 'pass' | 'fail';

interface TestResult {
  success: boolean;
  data?: unknown;
  error?: string;
  duration: number;
}

// ── Helpers ──

async function runTest(fn: () => Promise<unknown>): Promise<TestResult> {
  const start = performance.now();
  try {
    const data = await fn();
    return { success: true, data, duration: Math.round(performance.now() - start) };
  } catch (e: unknown) {
    const msg = getErrorMessage(e);
    return { success: false, error: msg, duration: Math.round(performance.now() - start) };
  }
}

function statusDot(s: TestStatus) {
  if (s === 'pass') return 'bg-ink';
  if (s === 'fail') return 'bg-cinnabar';
  if (s === 'running') return 'bg-cinnabar animate-pulse';
  return 'bg-ink/20';
}

function statusLabel(s: TestStatus) {
  if (s === 'pass') return 'PASS';
  if (s === 'fail') return 'FAIL';
  if (s === 'running') return 'RUN';
  return 'IDLE';
}

function formatDocExpected(raw: string): string {
  const lines = raw.split('\n');
  const formatted: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { formatted.push(''); continue; }
    try {
      const parsed = JSON.parse(trimmed);
      formatted.push(JSON.stringify(parsed, null, 2));
    } catch {
      formatted.push(trimmed);
    }
  }
  return formatted.join('\n');
}

function CopyButton({ text }: { text: string }) {
  const { copied, copy } = useClipboard(1500);
  return (
    <button
      className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-mute hover:text-ink px-2 py-0.5 border border-ink/20"
      onClick={() => copy(text)}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function ResultBlock({ result, docExpected, issues }: {
  result: TestResult | null;
  docExpected?: string;
  issues?: string;
}) {
  const [open, setOpen] = useState(true);
  if (!result) return null;
  const json = JSON.stringify(result.data ?? result.error, null, 2);
  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2">
        <button className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft hover:text-ink" onClick={() => setOpen(!open)}>
          {open ? '▼' : '▶'} {result.success ? 'Pass' : 'Fail'} · {result.duration}ms
        </button>
        <CopyButton text={json} />
      </div>

      {open && (
        <div className="space-y-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink mb-1">Actual Response</p>
            <pre className="bg-paper p-3 text-xs overflow-auto max-h-48 text-ink whitespace-pre-wrap break-all border border-ink/15 font-mono">
              {json}
            </pre>
          </div>

          {docExpected && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cinnabar mb-1">Doc Expected</p>
              <pre className="bg-cream p-3 text-xs overflow-auto max-h-36 text-ink-soft border border-cinnabar/30 leading-relaxed font-mono">
                {formatDocExpected(docExpected)}
              </pre>
            </div>
          )}

          {issues && (
            <div className="border border-cinnabar/40 p-3 bg-cream">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cinnabar mb-1">Known Issues</p>
              <p className="text-xs text-ink">{issues}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TestRow({ label, description, endpoint, status, result, onRun, docExpected, issues, children }: {
  label: string;
  description: string;
  endpoint: string;
  status: TestStatus;
  result: TestResult | null;
  onRun: () => void;
  docExpected?: string;
  issues?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-ink/15 py-4 last:border-b-0">
      <div className="flex items-start gap-3">
        <span className={`w-2 h-2 shrink-0 mt-1.5 ${statusDot(status)}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] text-ink">{label}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-mute border border-ink/15 px-1.5 py-0.5">{statusLabel(status)}</span>
          </div>
          <p className="text-[12px] text-ink-soft mt-1">{description}</p>
          <code className="font-mono text-[10px] text-cinnabar/80 break-all">{endpoint}</code>
        </div>
        {children}
        <button
          onClick={onRun}
          disabled={status === 'running'}
          className="px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] bg-ink text-cream hover:bg-cinnabar disabled:opacity-40 transition-colors shrink-0"
        >
          Run
        </button>
      </div>
      <ResultBlock result={result} docExpected={docExpected} issues={issues} />
    </div>
  );
}

function Section({ title, description, num, children }: {
  title: string;
  description: string;
  num: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-t border-ink/15 py-5 mb-2">
      <button className="flex items-center gap-4 w-full text-left" onClick={() => setOpen(!open)}>
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute shrink-0">
          §{String(num).padStart(2, '0')}
        </span>
        <div className="flex-1">
          <h2 className="font-display text-xl text-ink">{title}</h2>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mute mt-1">{description}</p>
        </div>
        <span className="font-mono text-[11px] text-ink-mute">{open ? '▼' : '▶'}</span>
      </button>
      {open && <div className="mt-4 pl-10">{children}</div>}
    </div>
  );
}

// ── Main Component ──

export default function TestPage() {
  usePageTitle('pageTitle.test');
  const [spaceSeq, setSpaceSeq] = useState<number | null>(null);
  const [mediaSeq, setMediaSeq] = useState<number | null>(null);
  const [projectSeq, setProjectSeq] = useState<number | null>(null);
  const [sentenceSeq, setSentenceSeq] = useState<number | null>(null);
  const [sentenceText, setSentenceText] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [progressLog, setProgressLog] = useState<string[]>([]);

  type TK = string;
  const [statuses, setStatuses] = useState<Record<TK, TestStatus>>({});
  const [results, setResults] = useState<Record<TK, TestResult>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const set = useCallback((key: string, status: TestStatus, result?: TestResult) => {
    setStatuses(p => ({ ...p, [key]: status }));
    if (result) setResults(p => ({ ...p, [key]: result }));
  }, []);

  const run = useCallback(async (key: string, fn: () => Promise<unknown>) => {
    set(key, 'running');
    const r = await runTest(fn);
    set(key, r.success ? 'pass' : 'fail', r);
    return r;
  }, [set]);

  const allKeys = Object.keys(statuses);
  const passCount = allKeys.filter(k => statuses[k] === 'pass').length;
  const failCount = allKeys.filter(k => statuses[k] === 'fail').length;
  const runningCount = allKeys.filter(k => statuses[k] === 'running').length;

  const runAll = async () => {
    const s1a = await run('listSpaces', async () => {
      const spaces = await api.listSpaces();
      if (spaces.length > 0) setSpaceSeq(spaces[0].spaceSeq);
      return spaces;
    });
    if (s1a.success && spaceSeq) {
      await run('getSpace', () => api.getSpace(spaceSeq!));
    }
    await run('languages', () => api.getSupportedLanguages());
    if (spaceSeq) {
      await run('quotaStatus', () => api.getQuotaStatus(spaceSeq!));
      await run('estimateQuota', () => api.estimateQuota(spaceSeq!, { mediaType: 'VIDEO', lipSync: false, durationMs: 30000 }));
      await run('ensureQueue', () => api.ensureSpaceQueue(spaceSeq!));
      await run('listProjects', () => api.listProjects(spaceSeq!, { size: 5 }));
    }
    await run('sasToken', () => api.getSasToken('test_video.mp4'));
    await run('recommended', async () => {
      const { data } = await axios.get(`${BASE}/video-translator/api/v1/projects/recommended`);
      return data;
    });
  };

  return (
    <main className="min-h-screen bg-cream text-ink pt-20 md:pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Masthead */}
        <header className="border-t border-ink pt-6 mb-8">
          <div className="flex items-baseline justify-between mb-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
              Lab — Diagnostics · 検査
            </span>
            <span className="font-mono text-[11px] tracking-widest text-ink-mute hidden sm:inline">
              {new Date().toISOString().split('T')[0]}
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="font-display text-4xl md:text-5xl text-ink leading-[1.02] tracking-tight">
                Perso API Test Tool
              </h1>
              <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink-soft mt-3">
                Live endpoint validation · doc parity check
              </p>
            </div>
            <button
              onClick={runAll}
              className="bg-ink text-cream px-6 py-3 font-mono text-[12px] uppercase tracking-[0.22em] hover:bg-cinnabar transition-colors self-start md:self-auto"
            >
              Run All →
            </button>
          </div>
        </header>

        {/* Summary */}
        <div className="grid grid-cols-3 border-t border-l border-ink/15 mb-6">
          {[
            { label: 'Passed', value: passCount, dot: 'bg-ink' },
            { label: 'Failed', value: failCount, dot: 'bg-cinnabar' },
            { label: 'Running', value: runningCount, dot: 'bg-cinnabar animate-pulse' },
          ].map(({ label, value, dot }) => (
            <div key={label} className="border-r border-b border-ink/15 px-5 py-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute mb-2 flex items-center gap-2">
                <span className={`w-1.5 h-1.5 ${dot}`} />
                {label}
              </p>
              <p className="font-display text-3xl text-ink leading-none">{value}</p>
            </div>
          ))}
        </div>

        {/* Integration state */}
        <div className="border border-ink/15 px-5 py-4 mb-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute mb-3">
            Integration State · 連携
          </p>
          <div className="flex flex-wrap gap-5">
            {[
              { label: 'spaceSeq', value: spaceSeq, onChange: setSpaceSeq },
              { label: 'mediaSeq', value: mediaSeq, onChange: setMediaSeq },
              { label: 'projectSeq', value: projectSeq, onChange: setProjectSeq },
            ].map(({ label, value, onChange }) => (
              <label key={label} className="flex items-center gap-2 text-ink-soft">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-mute">{label}</span>
                <input
                  type="number"
                  value={value ?? ''}
                  onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}
                  className={INTEGRATION_INPUT_CLASS}
                />
              </label>
            ))}
          </div>
        </div>

        {/* ── 1. Space API ── */}
        <Section title="Space API" description="Retrieve user workspace information" num={1}>
          <TestRow
            label="List spaces"
            description="Fetch all workspaces the user belongs to. Auto-sets spaceSeq."
            endpoint="GET /portal/api/v1/spaces"
            status={statuses['listSpaces'] || 'idle'}
            result={results['listSpaces'] || null}
            docExpected={`{ "result": [{ "spaceSeq": 123, "spaceName": "My Space", "planName": "Pro", "tier": "team", "memberRole": "space_owner" }] }`}
            onRun={() => run('listSpaces', async () => {
              const spaces = await api.listSpaces();
              if (spaces.length > 0) setSpaceSeq(spaces[0].spaceSeq);
              return spaces;
            })}
          />
          <TestRow
            label="Space details"
            description={`Get details for spaceSeq=${spaceSeq ?? '?'}`}
            endpoint={`GET /portal/api/v1/spaces/${spaceSeq ?? '{spaceSeq}'}`}
            status={statuses['getSpace'] || 'idle'}
            result={results['getSpace'] || null}
            docExpected={`{ "result": { "spaceSeq": 123, "spaceName": "...", "planName": "...", "useVideoTranslatorEdit": true } }`}
            onRun={() => { if (!spaceSeq) return alert('Please list spaces first'); run('getSpace', () => api.getSpace(spaceSeq!)); }}
          />
        </Section>

        {/* ── 2. File API ── */}
        <Section title="File API" description="Upload video/audio files via Azure Blob Storage" num={2}>
          <TestRow
            label="SAS token"
            description="Get a temporary Azure Blob Storage upload token (valid 30 min)."
            endpoint="GET /file/api/upload/sas-token?fileName=test_video.mp4"
            status={statuses['sasToken'] || 'idle'}
            result={results['sasToken'] || null}
            docExpected={`{ "blobSasUrl": "https://{account}.blob.core.windows.net/...", "expirationDatetime": "2026-04-08T..." }`}
            onRun={() => run('sasToken', () => api.getSasToken('test_video.mp4'))}
          />

          <TestRow
            label="Azure direct upload"
            description="Upload test_video.mp4 directly to Azure using the SAS token URL (not via Perso server)."
            endpoint="PUT {blobSasUrl} (Azure Blob Storage)"
            status={statuses['azureUpload'] || 'idle'}
            result={results['azureUpload'] || null}
            docExpected={`201 Created (empty body). Expired SAS token returns 403.`}
            onRun={() => run('azureUpload', async () => {
              const sas = await api.getSasToken('test_video.mp4');
              const resp = await fetch('/test_video.mp4');
              if (!resp.ok) throw new Error('Cannot find public/test_video.mp4');
              const blob = await resp.blob();
              const file = new File([blob], 'test_video.mp4', { type: blob.type });
              await api.uploadToAzure(sas.blobSasUrl, file);
              return { status: 'Upload complete', blobUrl: sas.blobSasUrl.split('?')[0], expirationDatetime: sas.expirationDatetime };
            })}
          />

          <TestRow
            label="Register video (notify Perso)"
            description="Register the Azure-uploaded file with Perso server. Returns mediaSeq."
            endpoint="PUT /file/api/upload/video"
            status={statuses['registerVideo'] || 'idle'}
            result={results['registerVideo'] || null}
            docExpected={`{ "seq": 456, "originalName": "test_video", "videoFilePath": "/container/.../uuid.mp4", "durationMs": 30000 }`}
            onRun={() => {
              if (!spaceSeq) return alert('spaceSeq is required');
              const azRes = results['azureUpload'];
              if (!azRes?.success) return alert('Please run Azure upload first');
              const fileUrl = (azRes.data as { blobUrl: string }).blobUrl;
              run('registerVideo', async () => {
                const r = await api.registerVideo(spaceSeq!, fileUrl, 'test_video.mp4');
                setMediaSeq(r.seq);
                return r;
              });
            }}
          />

          <TestRow
            label="Full upload flow (file select)"
            description="SAS token → Azure upload → Perso registration in one step."
            endpoint="getSasToken → uploadToAzure → registerVideo"
            status={statuses['fullUpload'] || 'idle'}
            result={results['fullUpload'] || null}
            onRun={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept="video/*,audio/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) { setSelectedFile(f); run('fullUpload', async () => {
                if (!spaceSeq) throw new Error('spaceSeq is required');
                const r = await api.uploadVideoFile(spaceSeq!, f);
                setMediaSeq(r.seq);
                return r;
              }); } }} />
            {selectedFile && <span className="font-mono text-[11px] text-ink-mute shrink-0">{selectedFile.name}</span>}
          </TestRow>

          <TestRow
            label="Audio file upload"
            description="Upload test_audio.mp3 via the audio-specific endpoint."
            endpoint="PUT /file/api/upload/audio"
            status={statuses['audioUpload'] || 'idle'}
            result={results['audioUpload'] || null}
            docExpected={`{ "seq": 789, "originalName": "test_audio", "audioFilePath": "/container/.../uuid.mp3", "durationMs": 180000 }`}
            onRun={() => run('audioUpload', async () => {
              if (!spaceSeq) throw new Error('spaceSeq is required');
              const sas = await api.getSasToken('test_audio.mp3');
              const resp = await fetch('/test_audio.mp3');
              if (!resp.ok) throw new Error('Cannot find public/test_audio.mp3');
              const blob = await resp.blob();
              const file = new File([blob], 'test_audio.mp3', { type: blob.type });
              await api.uploadToAzure(sas.blobSasUrl, file);
              const fileUrl = sas.blobSasUrl.split('?')[0];
              const { data } = await axios.put(`${BASE}/file/api/upload/audio`, { spaceSeq, fileUrl, fileName: 'test_audio.mp3' });
              return data;
            })}
          />

          <TestRow
            label="Media validation"
            description="Pre-validate file size, duration, and format constraints before upload."
            endpoint="POST /file/api/v1/media/validate"
            status={statuses['validateMedia'] || 'idle'}
            result={results['validateMedia'] || null}
            docExpected={`{ "status": true }`}
            onRun={() => run('validateMedia', async () => {
              const { data } = await axios.post(`${BASE}/file/api/v1/media/validate`, {
                spaceSeq: spaceSeq ?? 0, durationMs: 30000, originalName: 'test.mp4',
                mediaType: 'video', extension: '.mp4', size: 8932689, width: 1920, height: 1080, thumbnailFilePath: null,
              });
              return data;
            })}
          />
        </Section>

        {/* ── 3. Translation (Dubbing) API ── */}
        <Section title="Translation (Dubbing) API" description="Translate and dub videos in multiple languages" num={3}>
          <TestRow
            label="Initialize queue"
            description="Queue must be initialized before translation requests. Auto-creates if absent."
            endpoint={`PUT /video-translator/api/v1/projects/spaces/${spaceSeq ?? '{spaceSeq}'}/queue`}
            status={statuses['ensureQueue'] || 'idle'}
            result={results['ensureQueue'] || null}
            docExpected={`{ "success": true, "data": { "planName": "Free", "usedQueueCount": 5, "maxQueueCount": 10 } }`}
            onRun={() => { if (!spaceSeq) return alert('spaceSeq is required'); run('ensureQueue', () => api.ensureSpaceQueue(spaceSeq!)); }}
          />

          <TestRow
            label="Request translation"
            description={`Request ko→en translation for mediaSeq=${mediaSeq ?? '?'}. Returns projectSeq.`}
            endpoint={`POST /video-translator/api/v1/projects/spaces/${spaceSeq ?? '{spaceSeq}'}/translate`}
            status={statuses['requestTranslation'] || 'idle'}
            result={results['requestTranslation'] || null}
            docExpected={`{ "result": { "startGenerateProjectIdList": [101, 102] } }`}
            onRun={() => {
              if (!spaceSeq || !mediaSeq) return alert('spaceSeq and mediaSeq are required');
              run('requestTranslation', async () => {
                const ids = await api.requestTranslation(spaceSeq!, {
                  mediaSeq: mediaSeq!, isVideoProject: true, sourceLanguageCode: 'ko',
                  targetLanguageCodes: ['en'], numberOfSpeakers: 1, preferredSpeedType: 'GREEN',
                });
                if (ids.length > 0) setProjectSeq(ids[0]);
                return { projectSeqs: ids };
              });
            }}
          />

          <TestRow
            label="Poll progress (realtime)"
            description="Check translation progress every 5 seconds. Auto-stops on completion or failure."
            endpoint={`GET /video-translator/api/v1/projects/${projectSeq ?? '{projectSeq}'}/space/${spaceSeq ?? '{spaceSeq}'}/progress`}
            status={statuses['pollProgress'] || 'idle'}
            result={results['pollProgress'] || null}
            docExpected={`{ "result": { "progress": 65, "progressReason": "PROCESSING", "expectedRemainingTimeMinutes": 3 } }`}
            issues="Doc says progressReason is uppercase (COMPLETED) but actual responses may use Pascal case (Completed). Use .toUpperCase() for comparison."
            onRun={() => {
              if (!projectSeq || !spaceSeq) return alert('projectSeq and spaceSeq are required');
              setProgressLog([]);
              run('pollProgress', () => api.pollProgress(projectSeq!, spaceSeq!, p => {
                setProgressLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${p.progress}% — ${p.progressReason} (est. ${p.expectedRemainingTimeMinutes} min)`]);
              }));
            }}
          >
            {progressLog.length > 0 && (
              <div className="mt-2 bg-paper border border-ink/15 p-2 max-h-24 overflow-auto w-full">
                {progressLog.map((l, i) => <div key={i} className="font-mono text-[10px] text-ink-soft">{l}</div>)}
              </div>
            )}
          </TestRow>

          <TestRow
            label="Project details"
            description="Get full info for the translation project."
            endpoint={`GET /video-translator/api/v1/projects/${projectSeq ?? '{projectSeq}'}/spaces/${spaceSeq ?? '{spaceSeq}'}`}
            status={statuses['getProject'] || 'idle'}
            result={results['getProject'] || null}
            docExpected={`{ "result": { "seq": 101, "title": "...", "progress": 100, "progressReason": "COMPLETED", "sourceLanguage": { "code": "ko" }, "targetLanguage": { "code": "en" } } }`}
            onRun={() => { if (!projectSeq || !spaceSeq) return alert('ID is required'); run('getProject', () => api.getProject(projectSeq!, spaceSeq!)); }}
          />

          <TestRow
            label="List projects"
            description="Fetch the 5 most recent projects."
            endpoint={`GET /video-translator/api/v1/projects/spaces/${spaceSeq ?? '{spaceSeq}'}`}
            status={statuses['listProjects'] || 'idle'}
            result={results['listProjects'] || null}
            docExpected={`{ "result": { "totalCount": 100, "hasNext": true, "content": [...] } }`}
            onRun={() => { if (!spaceSeq) return alert('spaceSeq is required'); run('listProjects', () => api.listProjects(spaceSeq!, { size: 5 })); }}
          />

          <TestRow
            label="Cancel project"
            description="Cancel an in-progress GREEN zone project. Shows confirmation dialog."
            endpoint={`POST /video-translator/api/v1/projects/${projectSeq ?? '{projectSeq}'}/spaces/${spaceSeq ?? '{spaceSeq}'}/cancel`}
            status={statuses['cancelProject'] || 'idle'}
            result={results['cancelProject'] || null}
            onRun={() => {
              if (!projectSeq || !spaceSeq) return alert('ID is required');
              if (!confirm('Cancel this project?')) return;
              run('cancelProject', () => api.cancelProject(projectSeq!, spaceSeq!));
            }}
          />
        </Section>

        {/* ── 4. Script & Editing API ── */}
        <Section title="Script & Editing API" description="Edit translated text by sentence and regenerate audio" num={4}>
          <TestRow
            label="Get script"
            description="Fetch the full translation script by sentence. Includes speaker info."
            endpoint={`GET /video-translator/api/v1/projects/${projectSeq ?? '{projectSeq}'}/spaces/${spaceSeq ?? '{spaceSeq}'}/script`}
            status={statuses['getScript'] || 'idle'}
            result={results['getScript'] || null}
            docExpected={`{ "result": { "sentences": [{ "seq": 1, "speakerOrderIndex": 0, "offsetMs": 0, "durationMs": 3500, "originalText": "...", "translatedText": "...", "matchingRate": { "level": 3, "levelType": "GOOD" } }], "speakers": [...] } }`}
            onRun={() => {
              if (!projectSeq || !spaceSeq) return alert('ID is required');
              run('getScript', async () => {
                const script = await api.getScript(projectSeq!, spaceSeq!);
                if (script.sentences.length > 0) {
                  setSentenceSeq(script.sentences[0].seq);
                  setSentenceText(script.sentences[0].translatedText);
                }
                return { sentenceCount: script.sentences.length, speakerCount: script.speakers.length, firstSentence: script.sentences[0] };
              });
            }}
          />

          <TestRow
            label="Edit sentence translation"
            description="Edit the translation text of a specific sentence."
            endpoint={`PATCH /video-translator/api/v1/project/${projectSeq ?? '{projectSeq}'}/audio-sentence/${sentenceSeq ?? '{sentenceSeq}'}`}
            status={statuses['translateSentence'] || 'idle'}
            result={results['translateSentence'] || null}
            docExpected={`{ "result": { "scriptSeq": 1, "translatedText": "...", "matchingRate": { "level": 4, "levelType": "EXCELLENT" } } }`}
            onRun={() => {
              if (!projectSeq || !sentenceSeq) return alert('projectSeq and sentenceSeq are required');
              run('translateSentence', () => api.translateSentence(projectSeq!, sentenceSeq!, sentenceText || 'Hello world'));
            }}
          >
            <input
              value={sentenceText}
              onChange={e => setSentenceText(e.target.value)}
              className="w-40 bg-transparent border-b border-ink/30 px-1 py-1 text-xs text-ink shrink-0 font-mono focus:outline-none focus:border-cinnabar"
              placeholder="Edited text"
            />
          </TestRow>

          <TestRow
            label="Regenerate audio"
            description="Generate new audio from the edited translation text."
            endpoint={`PATCH /video-translator/api/v1/project/${projectSeq ?? '{projectSeq}'}/audio-sentence/${sentenceSeq ?? '{sentenceSeq}'}/generate-audio`}
            status={statuses['genAudio'] || 'idle'}
            result={results['genAudio'] || null}
            docExpected={`{ "result": { "scriptSeq": 1, "translatedText": "...", "generateAudioFilePath": "/audio/1.mp3", "matchingRate": {...} } }`}
            onRun={() => {
              if (!projectSeq || !sentenceSeq) return alert('ID is required');
              run('genAudio', () => api.generateSentenceAudio(projectSeq!, sentenceSeq!, sentenceText || 'Hello world'));
            }}
          />

          <TestRow
            label="Reset sentence"
            description="Revert edited translation to the original (proofread) state."
            endpoint={`PUT /video-translator/api/v1/project/${projectSeq ?? '{projectSeq}'}/audio-sentence/${sentenceSeq ?? '{sentenceSeq}'}/reset`}
            status={statuses['resetSentence'] || 'idle'}
            result={results['resetSentence'] || null}
            onRun={() => {
              if (!projectSeq || !sentenceSeq) return alert('ID is required');
              run('resetSentence', () => api.resetSentence(projectSeq!, sentenceSeq!));
            }}
          />

          <TestRow
            label="Translation quality check"
            description="Preview matching rate and speed info for translated text."
            endpoint={`POST /video-translator/api/v1/project/${projectSeq ?? '{projectSeq}'}/audio-sentence/${sentenceSeq ?? '{sentenceSeq}'}/match-rewrite`}
            status={statuses['matchRewrite'] || 'idle'}
            result={results['matchRewrite'] || null}
            docExpected={`{ "result": { "matchingRate": { "level": 3, "levelType": "Low" }, "rewrite": { "speed": "fast", "current": 3, "optimal": { "min": 101, "max": 120 } } } }`}
            onRun={() => {
              if (!projectSeq || !sentenceSeq) return alert('ID is required');
              run('matchRewrite', async () => {
                const { data } = await axios.post(
                  `${BASE}/video-translator/api/v1/project/${projectSeq}/audio-sentence/${sentenceSeq}/match-rewrite`,
                  { targetText: sentenceText || 'Hello world' }
                );
                return data;
              });
            }}
          />
        </Section>

        {/* ── 5. Download API ── */}
        <Section title="Download API" description="Download video, audio, and subtitle files from completed projects" num={5}>
          <TestRow
            label="Download availability"
            description="Check which files are downloadable via boolean flags."
            endpoint={`GET /video-translator/api/v1/projects/${projectSeq ?? '{projectSeq}'}/spaces/${spaceSeq ?? '{spaceSeq}'}/download-info`}
            status={statuses['downloadInfo'] || 'idle'}
            result={results['downloadInfo'] || null}
            docExpected={`{ "hasTranslatedVideo": true, "hasOriginalSubtitle": true, "hasTranslatedSubtitle": true, "hasZipDownload": true, ... }`}
            onRun={() => {
              if (!projectSeq || !spaceSeq) return alert('ID is required');
              run('downloadInfo', () => api.getDownloadInfo(projectSeq!, spaceSeq!));
            }}
          />

          <TestRow
            label="Download links (merged)"
            description="Call individual targets (dubbingVideo, voiceAudio, all) separately and merge results."
            endpoint="getDownloadLinks() — dubbingVideo + voiceAudio + voicewithBackgroundAudio + all"
            status={statuses['downloadLinks'] || 'idle'}
            result={results['downloadLinks'] || null}
            issues="target=all returns only the ZIP path. Individual files require separate target calls."
            onRun={() => {
              if (!projectSeq || !spaceSeq) return alert('ID is required');
              run('downloadLinks', async () => {
                const links = await api.getDownloadLinks(projectSeq!, spaceSeq!);
                if (links.videoFile?.videoDownloadLink) setVideoUrl(api.resolvePersoFileUrl(links.videoFile.videoDownloadLink) || null);
                return links;
              });
            }}
          />

          {['dubbingVideo', 'voiceAudio', 'voicewithBackgroundAudio', 'all'].map(target => (
            <TestRow
              key={target}
              label={`Individual download: target=${target}`}
              description={target === 'all' ? 'ZIP full archive (tar)' : `${target} file only`}
              endpoint={`GET .../download?target=${target}`}
              status={statuses[`dl_${target}`] || 'idle'}
              result={results[`dl_${target}`] || null}
              docExpected={target === 'all' ? '{ "zippedFileDownloadLink": "/perso-storage/.../DownloadAllFiles.tar" }' : undefined}
              onRun={() => {
                if (!projectSeq || !spaceSeq) return alert('ID is required');
                run(`dl_${target}`, async () => {
                  const { data } = await axios.get(
                    `${BASE}/video-translator/api/v1/projects/${projectSeq}/spaces/${spaceSeq}/download`,
                    { params: { target } }
                  );
                  return data;
                });
              }}
            />
          ))}

          {videoUrl && (
            <div className="mt-3 p-3 border border-ink/15 bg-paper">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cinnabar mb-2">Dubbed Video Playback</p>
              <video src={videoUrl} controls className="w-full max-w-lg bg-black" />
            </div>
          )}
        </Section>

        {/* ── 6. Lip Sync API ── */}
        <Section title="Lip Sync API" description="Sync mouth movements to dubbed audio (Pro plan)" num={6}>
          <TestRow
            label="Request lip sync"
            description="Apply lip sync to a completed translation project."
            endpoint={`POST /video-translator/api/v1/projects/${projectSeq ?? '{projectSeq}'}/spaces/${spaceSeq ?? '{spaceSeq}'}/lip-sync`}
            status={statuses['lipSync'] || 'idle'}
            result={results['lipSync'] || null}
            docExpected={`{ "result": { "startGenerateProjectIdList": [1, 2, 3] } }`}
            onRun={() => {
              if (!projectSeq || !spaceSeq) return alert('ID is required');
              run('lipSync', () => api.requestLipSync(projectSeq!, spaceSeq!));
            }}
          />

          <TestRow
            label="Lip sync history"
            description="Retrieve lip sync generation history with pagination."
            endpoint={`GET .../lip-sync/generated`}
            status={statuses['lipSyncHistory'] || 'idle'}
            result={results['lipSyncHistory'] || null}
            onRun={() => {
              if (!projectSeq || !spaceSeq) return alert('ID is required');
              run('lipSyncHistory', async () => {
                const { data } = await axios.get(
                  `${BASE}/video-translator/api/v1/projects/${projectSeq}/spaces/${spaceSeq}/lip-sync/generated`
                );
                return data;
              });
            }}
          />
        </Section>

        {/* ── 7. Language API ── */}
        <Section title="Language API" description="Retrieve supported translation languages" num={7}>
          <TestRow
            label="Supported languages"
            description="Check all available languages and whether they are experimental."
            endpoint="GET /video-translator/api/v1/languages"
            status={statuses['languages'] || 'idle'}
            result={results['languages'] || null}
            docExpected={`{ "result": { "languages": [{ "code": "en", "name": "English", "experiment": false }, { "code": "ko", "name": "Korean", "experiment": false }] } }`}
            onRun={() => run('languages', () => api.getSupportedLanguages())}
          />
        </Section>

        {/* ── 8. Usage/Quota API ── */}
        <Section title="Usage / Quota API" description="Check plan info and remaining credits (quota)" num={8}>
          <TestRow
            label="Plan status"
            description="Check current plan, remaining quota, and reset date."
            endpoint={`GET /video-translator/api/v1/projects/spaces/${spaceSeq ?? '{spaceSeq}'}/plan/status`}
            status={statuses['quotaStatus'] || 'idle'}
            result={results['quotaStatus'] || null}
            docExpected={`{ "result": { "planTier": "creator", "remainingQuota": { "remainingQuota": 500000 }, "resetDateTime": "2026-04-30T..." } }`}
            onRun={() => { if (!spaceSeq) return alert('spaceSeq is required'); run('quotaStatus', () => api.getQuotaStatus(spaceSeq!)); }}
          />

          <TestRow
            label="Estimate quota usage"
            description="Calculate estimated quota consumption for a 30-second video translation."
            endpoint={`GET .../media/quota?mediaType=VIDEO&durationMs=30000`}
            status={statuses['estimateQuota'] || 'idle'}
            result={results['estimateQuota'] || null}
            docExpected={`{ "result": { "expectedUsedQuota": 5000 } }`}
            onRun={() => { if (!spaceSeq) return alert('spaceSeq is required'); run('estimateQuota', () => api.estimateQuota(spaceSeq!, { mediaType: 'VIDEO', lipSync: false, durationMs: 30000 })); }}
          />
        </Section>

        {/* ── 9. Feedback API ── */}
        <Section title="Feedback API" description="Submit star ratings for translation projects" num={9}>
          <TestRow
            label="Submit feedback (5 stars)"
            description="Submit a 5-star rating for the project."
            endpoint="POST /video-translator/api/v1/projects/feedbacks"
            status={statuses['submitFeedback'] || 'idle'}
            result={results['submitFeedback'] || null}
            docExpected={`{ "result": { "averageRating": 4.5, "count": 10 } }`}
            onRun={() => {
              if (!projectSeq) return alert('projectSeq is required');
              run('submitFeedback', () => api.submitFeedback(projectSeq!, 5));
            }}
          />

          <TestRow
            label="Get feedback"
            description="Retrieve your submitted feedback. Returns 204 if none."
            endpoint="GET /video-translator/api/v1/projects/feedbacks?projectSeq=..."
            status={statuses['getFeedback'] || 'idle'}
            result={results['getFeedback'] || null}
            onRun={() => {
              if (!projectSeq) return alert('projectSeq is required');
              run('getFeedback', async () => {
                const { data } = await axios.get(`${BASE}/video-translator/api/v1/projects/feedbacks`, { params: { projectSeq } });
                return data;
              });
            }}
          />
        </Section>

        {/* ── 10. Community Spotlight ── */}
        <Section title="Community Spotlight" description="Retrieve recommended projects" num={10}>
          <TestRow
            label="Recommended projects"
            description="Retrieve popular projects shared in the community."
            endpoint="GET /video-translator/api/v1/projects/recommended"
            status={statuses['recommended'] || 'idle'}
            result={results['recommended'] || null}
            docExpected={`{ "result": { "totalCount": 100, "contents": [{ "seq": 1, "title": "...", "thumbnailUrl": "...", "sourceLanguage": {...}, "targetLanguage": {...} }] } }`}
            onRun={() => run('recommended', async () => {
              const { data } = await axios.get(`${BASE}/video-translator/api/v1/projects/recommended`);
              return data;
            })}
          />
        </Section>

        {/* ── 11. Edge Cases ── */}
        <Section title="Known Issues & Edge Cases" description="Reproduce differences between API docs and actual responses" num={11}>
          <TestRow
            label="progressReason case mismatch"
            description='Doc: "COMPLETED" (all caps) → Actual: "Completed" (Pascal case). Use toUpperCase().'
            endpoint={`GET .../progress`}
            status={statuses['edgeProgressCase'] || 'idle'}
            result={results['edgeProgressCase'] || null}
            issues='Doc says progressReason values are all-uppercase (COMPLETED, FAILED, CANCELED), but actual responses use Pascal case (Completed). Comparing with === "COMPLETED" fails to detect completion, causing infinite polling.'
            docExpected={`Doc: { "progressReason": "COMPLETED" }\nActual: { "progressReason": "Completed" }`}
            onRun={() => run('edgeProgressCase', async () => {
              if (!projectSeq || !spaceSeq) throw new Error('A completed project with projectSeq is required');
              const progress = await api.getProgress(projectSeq!, spaceSeq!);
              return {
                actualProgressReason: progress.progressReason,
                docExpected: 'COMPLETED',
                match: progress.progressReason === 'COMPLETED' ? 'Matched' : 'Mismatched!',
                solution: 'Normalize with .toUpperCase() for comparison',
              };
            })}
          />

          <TestRow
            label="download target=all → individual links null"
            description="When called with target=all, only the ZIP path is returned; individual file links are all null."
            endpoint={`GET .../download?target=all`}
            status={statuses['edgeDownloadAll'] || 'idle'}
            result={results['edgeDownloadAll'] || null}
            issues='Doc says target=all includes all file links, but only zippedFileDownloadLink is populated — the rest are null. Individual files require separate target calls (dubbingVideo, voiceAudio, etc.).'
            docExpected={`Doc expected: all links included\nActual: { videoFile: { videoDownloadLink: null }, ..., zippedFileDownloadLink: "/perso-storage/...tar" }`}
            onRun={() => {
              if (!projectSeq || !spaceSeq) return alert('ID is required');
              run('edgeDownloadAll', async () => {
                const { data } = await axios.get(
                  `${BASE}/video-translator/api/v1/projects/${projectSeq}/spaces/${spaceSeq}/download`,
                  { params: { target: 'all' } }
                );
                const result = data?.result ?? data;
                return {
                  videoDownloadLink: result?.videoFile?.videoDownloadLink ?? 'null ← this is the issue',
                  voiceAudioDownloadLink: result?.audioFile?.voiceAudioDownloadLink ?? 'null ← this is the issue',
                  zippedFileDownloadLink: result?.zippedFileDownloadLink ?? 'null',
                  conclusion: 'target=all returns ZIP only; individual files need separate target calls',
                };
              });
            }}
          />

          <TestRow
            label="download target=video → server error"
            description='Doc lists "video" as a valid target, but server returns 500 error.'
            endpoint={`GET .../download?target=video`}
            status={statuses['edgeDownloadVideo'] || 'idle'}
            result={results['edgeDownloadVideo'] || null}
            issues='Doc lists "video" as a valid target, but server returns "Unexpected Download value: VIDEO". Use "dubbingVideo" instead.'
            docExpected={`Doc: target=video valid\nActual: 500 { "code": "VT5001", "message": "Unexpected Download value: VIDEO" }`}
            onRun={() => {
              if (!projectSeq || !spaceSeq) return alert('ID is required');
              run('edgeDownloadVideo', async () => {
                try {
                  const { data } = await axios.get(
                    `${BASE}/video-translator/api/v1/projects/${projectSeq}/spaces/${spaceSeq}/download`,
                    { params: { target: 'video' } }
                  );
                  return { unexpectedSuccess: data };
                } catch (e) {
                  return {
                    failedAsExpected: true,
                    error: getErrorMessage(e),
                    solution: 'Use target=dubbingVideo instead of target=video',
                  };
                }
              });
            }}
          />

          <TestRow
            label="download target=translatedSubtitle → server error"
            description='Doc lists "translatedSubtitle" as valid target, but server returns 500 error.'
            endpoint={`GET .../download?target=translatedSubtitle`}
            status={statuses['edgeDownloadSub'] || 'idle'}
            result={results['edgeDownloadSub'] || null}
            issues='Server returns "Unexpected Download value: TRANSLATED_SUBTITLE".'
            onRun={() => {
              if (!projectSeq || !spaceSeq) return alert('ID is required');
              run('edgeDownloadSub', async () => {
                try {
                  const { data } = await axios.get(
                    `${BASE}/video-translator/api/v1/projects/${projectSeq}/spaces/${spaceSeq}/download`,
                    { params: { target: 'translatedSubtitle' } }
                  );
                  return { unexpectedSuccess: data };
                } catch (e) {
                  return {
                    failedAsExpected: true,
                    error: getErrorMessage(e),
                    solution: 'Download ZIP (target=all) and extract subtitles',
                  };
                }
              });
            }}
          />

          <TestRow
            label="Unsupported targets batch test"
            description="Test all doc-listed targets that actually return 500 errors in one go."
            endpoint="GET .../download?target=video|originalSubtitle|translatedSubtitle|..."
            status={statuses['edgeBrokenTargets'] || 'idle'}
            result={results['edgeBrokenTargets'] || null}
            issues="Some targets listed as valid in docs return Unexpected Download value errors from the server."
            onRun={() => {
              if (!projectSeq || !spaceSeq) return alert('ID is required');
              run('edgeBrokenTargets', async () => {
                const targets = ['video', 'originalSubtitle', 'translatedSubtitle', 'originalVoiceAudio', 'backgroundAudio', 'translatedAudio', 'lipSyncVideo', 'originalVoiceSpeakers', 'speakerSegmentExcel', 'speakerSegmentWithTranslationExcel'];
                const results: Record<string, string> = {};
                for (const t of targets) {
                  try {
                    await axios.get(`${BASE}/video-translator/api/v1/projects/${projectSeq}/spaces/${spaceSeq}/download`, { params: { target: t } });
                    results[t] = 'Pass';
                  } catch (e) {
                    results[t] = 'Fail · ' + getErrorMessage(e);
                  }
                }
                return results;
              });
            }}
          />
        </Section>

        <div className="text-center font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute py-10 border-t border-ink/15 mt-8">
          AniVoice Perso API Test Tool · {allKeys.length} tests registered
          <br />
          <span className="text-ink/30 normal-case tracking-normal">For testing only. To remove, delete TestPage.tsx and the /test route.</span>
        </div>
      </div>
    </main>
  );
}
