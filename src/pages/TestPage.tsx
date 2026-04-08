import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import * as api from '../services/persoApi';

const BASE = (import.meta.env.VITE_PERSO_PROXY_PATH || '/api/perso').replace(/\/+$/, '');

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
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, error: msg, duration: Math.round(performance.now() - start) };
  }
}

function statusDot(s: TestStatus) {
  if (s === 'pass') return 'bg-green-500';
  if (s === 'fail') return 'bg-red-500';
  if (s === 'running') return 'bg-yellow-500 animate-pulse';
  return 'bg-gray-600';
}

function statusLabel(s: TestStatus) {
  if (s === 'pass') return '성공';
  if (s === 'fail') return '실패';
  if (s === 'running') return '실행 중...';
  return '대기';
}

/** 문서 기대값 문자열을 JSON이면 예쁘게, 아니면 줄바꿈 정리해서 표시 */
function formatDocExpected(raw: string): string {
  // 여러 줄로 나뉜 경우 각각 시도
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
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="text-[10px] text-gray-500 hover:text-white px-2 py-0.5 rounded bg-surface-800 border border-surface-700"
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
    >
      {copied ? '복사됨!' : '복사'}
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
      {/* 상태 요약 */}
      <div className="flex items-center gap-2">
        <button className="text-xs text-gray-400 hover:text-white" onClick={() => setOpen(!open)}>
          {open ? '▼' : '▶'} {result.success ? '✅ 성공' : '❌ 실패'} ({result.duration}ms)
        </button>
        <CopyButton text={json} />
      </div>

      {open && (
        <div className="space-y-2">
          {/* 실제 응답 */}
          <div>
            <p className="text-[10px] font-semibold text-primary-400 mb-1">📦 실제 응답 (Response)</p>
            <pre className="bg-surface-900 rounded-lg p-3 text-xs overflow-auto max-h-48 text-gray-300 whitespace-pre-wrap break-all border border-surface-700">
              {json}
            </pre>
          </div>

          {/* 문서 기대값 */}
          {docExpected && (
            <div>
              <p className="text-[10px] font-semibold text-accent-400 mb-1">📄 API 문서 기대값 (Expected)</p>
              <pre className="bg-accent-900/20 rounded-lg p-3 text-xs overflow-auto max-h-36 text-accent-300 border border-accent-500/20 leading-relaxed">
                {formatDocExpected(docExpected)}
              </pre>
            </div>
          )}

          {/* 이슈 */}
          {issues && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-[10px] font-semibold text-red-400 mb-1">⚠️ 알려진 이슈</p>
              <p className="text-xs text-red-300">{issues}</p>
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
    <div className="border-b border-surface-700/50 py-4 last:border-b-0">
      <div className="flex items-start gap-3">
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${statusDot(status)}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-white">{label}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-800 text-gray-500 font-mono">{statusLabel(status)}</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          <code className="text-[10px] text-primary-400/70 font-mono">{endpoint}</code>
        </div>
        {children}
        <button
          onClick={onRun}
          disabled={status === 'running'}
          className="px-3 py-1.5 text-xs rounded-lg gradient-bg hover:opacity-90 disabled:opacity-50 text-white font-medium shrink-0"
        >
          실행
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
    <div className="glass rounded-2xl p-5 mb-4">
      <button className="flex items-center gap-3 w-full text-left" onClick={() => setOpen(!open)}>
        <span className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-sm font-bold shrink-0">{num}</span>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <span className="text-gray-500 text-sm">{open ? '▼' : '▶'}</span>
      </button>
      {open && <div className="mt-4 ml-11">{children}</div>}
    </div>
  );
}

// ── Main Component ──

export default function TestPage() {
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

  // ── Run All ──
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
    <div className="min-h-screen bg-surface-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold gradient-text">Perso API 테스트 도구</h1>
            <p className="text-sm text-gray-400 mt-1">모든 엔드포인트를 실제 API로 테스트하고, 문서와 응답을 비교합니다</p>
          </div>
          <button onClick={runAll} className="px-5 py-2.5 rounded-xl gradient-bg font-medium text-sm">
            전체 실행
          </button>
        </div>

        {/* 요약 */}
        <div className="flex gap-4 mb-4 text-sm flex-wrap">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> {passCount} 성공</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> {failCount} 실패</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> {runningCount} 실행중</span>
        </div>

        {/* 연동 상태 */}
        <div className="glass rounded-xl p-4 mb-4">
          <p className="text-xs text-gray-400 mb-2">🔗 연동 상태 (이전 테스트 결과가 다음 테스트의 입력으로 사용됩니다)</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <label className="flex items-center gap-2 text-gray-400">
              <span className="text-[10px] bg-surface-800 px-1.5 py-0.5 rounded">spaceSeq</span>
              <input type="number" value={spaceSeq ?? ''} onChange={e => setSpaceSeq(e.target.value ? Number(e.target.value) : null)}
                className="w-24 bg-surface-900 border border-surface-700 rounded px-2 py-1 text-white text-xs" />
            </label>
            <label className="flex items-center gap-2 text-gray-400">
              <span className="text-[10px] bg-surface-800 px-1.5 py-0.5 rounded">mediaSeq</span>
              <input type="number" value={mediaSeq ?? ''} onChange={e => setMediaSeq(e.target.value ? Number(e.target.value) : null)}
                className="w-24 bg-surface-900 border border-surface-700 rounded px-2 py-1 text-white text-xs" />
            </label>
            <label className="flex items-center gap-2 text-gray-400">
              <span className="text-[10px] bg-surface-800 px-1.5 py-0.5 rounded">projectSeq</span>
              <input type="number" value={projectSeq ?? ''} onChange={e => setProjectSeq(e.target.value ? Number(e.target.value) : null)}
                className="w-24 bg-surface-900 border border-surface-700 rounded px-2 py-1 text-white text-xs" />
            </label>
          </div>
        </div>

        {/* ── 1. Space API ── */}
        <Section title="Space API" description="사용자의 워크스페이스 정보를 조회합니다" num={1}>
          <TestRow
            label="스페이스 목록 조회"
            description="사용자가 속한 모든 워크스페이스를 가져옵니다. spaceSeq를 자동으로 설정합니다."
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
            label="스페이스 상세 조회"
            description={`spaceSeq=${spaceSeq ?? '?'}의 상세 정보를 가져옵니다`}
            endpoint={`GET /portal/api/v1/spaces/${spaceSeq ?? '{spaceSeq}'}`}
            status={statuses['getSpace'] || 'idle'}
            result={results['getSpace'] || null}
            docExpected={`{ "result": { "spaceSeq": 123, "spaceName": "...", "planName": "...", "useVideoTranslatorEdit": true } }`}
            onRun={() => { if (!spaceSeq) return alert('먼저 스페이스 목록을 조회하세요'); run('getSpace', () => api.getSpace(spaceSeq!)); }}
          />
        </Section>

        {/* ── 2. File API ── */}
        <Section title="File API" description="영상/오디오 파일을 Azure Blob Storage를 거쳐 업로드합니다" num={2}>
          <TestRow
            label="SAS 토큰 발급"
            description="Azure Blob Storage 업로드를 위한 임시 토큰을 발급받습니다. 유효시간 30분."
            endpoint="GET /file/api/upload/sas-token?fileName=test_video.mp4"
            status={statuses['sasToken'] || 'idle'}
            result={results['sasToken'] || null}
            docExpected={`{ "blobSasUrl": "https://{account}.blob.core.windows.net/...", "expirationDatetime": "2026-04-08T..." }`}
            onRun={() => run('sasToken', () => api.getSasToken('test_video.mp4'))}
          />

          <TestRow
            label="Azure 직접 업로드"
            description="SAS 토큰으로 발급받은 URL에 test_video.mp4를 직접 업로드합니다. Perso 서버가 아닌 Azure로 전송됩니다."
            endpoint="PUT {blobSasUrl} (Azure Blob Storage)"
            status={statuses['azureUpload'] || 'idle'}
            result={results['azureUpload'] || null}
            docExpected={`201 Created (빈 응답). 만료된 SAS 토큰은 403 반환.`}
            onRun={() => run('azureUpload', async () => {
              const sas = await api.getSasToken('test_video.mp4');
              const resp = await fetch('/test_video.mp4');
              if (!resp.ok) throw new Error('public/test_video.mp4 파일을 찾을 수 없습니다');
              const blob = await resp.blob();
              const file = new File([blob], 'test_video.mp4', { type: blob.type });
              await api.uploadToAzure(sas.blobSasUrl, file);
              return { status: '업로드 완료', blobUrl: sas.blobSasUrl.split('?')[0], expirationDatetime: sas.expirationDatetime };
            })}
          />

          <TestRow
            label="영상 등록 (Perso에 알림)"
            description="Azure에 업로드한 파일을 Perso 서버에 등록합니다. mediaSeq가 반환됩니다."
            endpoint="PUT /file/api/upload/video"
            status={statuses['registerVideo'] || 'idle'}
            result={results['registerVideo'] || null}
            docExpected={`{ "seq": 456, "originalName": "test_video", "videoFilePath": "/container/.../uuid.mp4", "durationMs": 30000 }`}
            onRun={() => {
              if (!spaceSeq) return alert('spaceSeq가 필요합니다');
              const azRes = results['azureUpload'];
              if (!azRes?.success) return alert('먼저 Azure 업로드를 실행하세요');
              const fileUrl = (azRes.data as { blobUrl: string }).blobUrl;
              run('registerVideo', async () => {
                const r = await api.registerVideo(spaceSeq!, fileUrl, 'test_video.mp4');
                setMediaSeq(r.seq);
                return r;
              });
            }}
          />

          <TestRow
            label="전체 업로드 플로우 (파일 선택)"
            description="SAS 토큰 발급 → Azure 업로드 → Perso 등록을 한번에 수행합니다."
            endpoint="getSasToken → uploadToAzure → registerVideo"
            status={statuses['fullUpload'] || 'idle'}
            result={results['fullUpload'] || null}
            onRun={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept="video/*,audio/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) { setSelectedFile(f); run('fullUpload', async () => {
                if (!spaceSeq) throw new Error('spaceSeq가 필요합니다');
                const r = await api.uploadVideoFile(spaceSeq!, f);
                setMediaSeq(r.seq);
                return r;
              }); } }} />
            {selectedFile && <span className="text-xs text-gray-500 shrink-0">{selectedFile.name}</span>}
          </TestRow>

          <TestRow
            label="오디오 파일 업로드"
            description="test_audio.mp3를 오디오 전용 엔드포인트로 업로드합니다."
            endpoint="PUT /file/api/upload/audio"
            status={statuses['audioUpload'] || 'idle'}
            result={results['audioUpload'] || null}
            docExpected={`{ "seq": 789, "originalName": "test_audio", "audioFilePath": "/container/.../uuid.mp3", "durationMs": 180000 }`}
            onRun={() => run('audioUpload', async () => {
              if (!spaceSeq) throw new Error('spaceSeq가 필요합니다');
              const sas = await api.getSasToken('test_audio.mp3');
              const resp = await fetch('/test_audio.mp3');
              if (!resp.ok) throw new Error('public/test_audio.mp3 파일을 찾을 수 없습니다');
              const blob = await resp.blob();
              const file = new File([blob], 'test_audio.mp3', { type: blob.type });
              await api.uploadToAzure(sas.blobSasUrl, file);
              const fileUrl = sas.blobSasUrl.split('?')[0];
              const { data } = await axios.put(`${BASE}/file/api/upload/audio`, { spaceSeq, fileUrl, fileName: 'test_audio.mp3' });
              return data;
            })}
          />

          <TestRow
            label="미디어 유효성 검증"
            description="업로드 전에 파일 사이즈, 길이, 형식 등의 제약을 사전 검증합니다."
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
        <Section title="번역 (더빙) API" description="영상을 다국어로 번역하고 더빙합니다. 가장 핵심적인 API입니다." num={3}>
          <TestRow
            label="큐 초기화"
            description="번역 요청 전에 반드시 큐를 초기화해야 합니다. 없으면 자동 생성됩니다."
            endpoint={`PUT /video-translator/api/v1/projects/spaces/${spaceSeq ?? '{spaceSeq}'}/queue`}
            status={statuses['ensureQueue'] || 'idle'}
            result={results['ensureQueue'] || null}
            docExpected={`{ "success": true, "data": { "planName": "Free", "usedQueueCount": 5, "maxQueueCount": 10 } }`}
            onRun={() => { if (!spaceSeq) return alert('spaceSeq가 필요합니다'); run('ensureQueue', () => api.ensureSpaceQueue(spaceSeq!)); }}
          />

          <TestRow
            label="번역 요청"
            description={`mediaSeq=${mediaSeq ?? '?'}를 한국어→영어로 번역 요청합니다. projectSeq가 반환됩니다.`}
            endpoint={`POST /video-translator/api/v1/projects/spaces/${spaceSeq ?? '{spaceSeq}'}/translate`}
            status={statuses['requestTranslation'] || 'idle'}
            result={results['requestTranslation'] || null}
            docExpected={`{ "result": { "startGenerateProjectIdList": [101, 102] } }`}
            onRun={() => {
              if (!spaceSeq || !mediaSeq) return alert('spaceSeq와 mediaSeq가 필요합니다');
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
            label="진행률 폴링 (실시간)"
            description="5초 간격으로 번역 진행 상태를 확인합니다. 완료/실패 시 자동 종료됩니다."
            endpoint={`GET /video-translator/api/v1/projects/${projectSeq ?? '{projectSeq}'}/space/${spaceSeq ?? '{spaceSeq}'}/progress`}
            status={statuses['pollProgress'] || 'idle'}
            result={results['pollProgress'] || null}
            docExpected={`{ "result": { "progress": 65, "progressReason": "PROCESSING", "expectedRemainingTimeMinutes": 3 } }`}
            issues="문서에서는 progressReason이 대문자(COMPLETED)이지만 실제로는 Pascal case(Completed)가 올 수 있습니다. .toUpperCase()로 비교해야 합니다."
            onRun={() => {
              if (!projectSeq || !spaceSeq) return alert('projectSeq와 spaceSeq가 필요합니다');
              setProgressLog([]);
              run('pollProgress', () => api.pollProgress(projectSeq!, spaceSeq!, p => {
                setProgressLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${p.progress}% — ${p.progressReason} (예상 ${p.expectedRemainingTimeMinutes}분)`]);
              }));
            }}
          >
            {progressLog.length > 0 && (
              <div className="mt-2 bg-surface-900 rounded-lg p-2 max-h-24 overflow-auto w-full">
                {progressLog.map((l, i) => <div key={i} className="text-[10px] text-gray-400 font-mono">{l}</div>)}
              </div>
            )}
          </TestRow>

          <TestRow
            label="프로젝트 상세 조회"
            description="번역 프로젝트의 전체 정보를 가져옵니다."
            endpoint={`GET /video-translator/api/v1/projects/${projectSeq ?? '{projectSeq}'}/spaces/${spaceSeq ?? '{spaceSeq}'}`}
            status={statuses['getProject'] || 'idle'}
            result={results['getProject'] || null}
            docExpected={`{ "result": { "seq": 101, "title": "...", "progress": 100, "progressReason": "COMPLETED", "sourceLanguage": { "code": "ko" }, "targetLanguage": { "code": "en" } } }`}
            onRun={() => { if (!projectSeq || !spaceSeq) return alert('ID가 필요합니다'); run('getProject', () => api.getProject(projectSeq!, spaceSeq!)); }}
          />

          <TestRow
            label="프로젝트 목록 조회"
            description="최근 5개 프로젝트를 가져옵니다."
            endpoint={`GET /video-translator/api/v1/projects/spaces/${spaceSeq ?? '{spaceSeq}'}`}
            status={statuses['listProjects'] || 'idle'}
            result={results['listProjects'] || null}
            docExpected={`{ "result": { "totalCount": 100, "hasNext": true, "content": [...] } }`}
            onRun={() => { if (!spaceSeq) return alert('spaceSeq가 필요합니다'); run('listProjects', () => api.listProjects(spaceSeq!, { size: 5 })); }}
          />

          <TestRow
            label="프로젝트 취소"
            description="진행 중인 GREEN 존 프로젝트를 취소합니다. 확인 대화상자가 표시됩니다."
            endpoint={`POST /video-translator/api/v1/projects/${projectSeq ?? '{projectSeq}'}/spaces/${spaceSeq ?? '{spaceSeq}'}/cancel`}
            status={statuses['cancelProject'] || 'idle'}
            result={results['cancelProject'] || null}
            onRun={() => {
              if (!projectSeq || !spaceSeq) return alert('ID가 필요합니다');
              if (!confirm('이 프로젝트를 취소하시겠습니까?')) return;
              run('cancelProject', () => api.cancelProject(projectSeq!, spaceSeq!));
            }}
          />
        </Section>

        {/* ── 4. Script & Editing API ── */}
        <Section title="스크립트 & 편집 API" description="번역된 텍스트를 문장 단위로 편집하고 오디오를 재생성합니다" num={4}>
          <TestRow
            label="스크립트 조회"
            description="프로젝트의 전체 번역 스크립트를 문장 단위로 가져옵니다. 화자 정보도 포함됩니다."
            endpoint={`GET /video-translator/api/v1/projects/${projectSeq ?? '{projectSeq}'}/spaces/${spaceSeq ?? '{spaceSeq}'}/script`}
            status={statuses['getScript'] || 'idle'}
            result={results['getScript'] || null}
            docExpected={`{ "result": { "sentences": [{ "seq": 1, "speakerOrderIndex": 0, "offsetMs": 0, "durationMs": 3500, "originalText": "...", "translatedText": "...", "matchingRate": { "level": 3, "levelType": "GOOD" } }], "speakers": [...] } }`}
            onRun={() => {
              if (!projectSeq || !spaceSeq) return alert('ID가 필요합니다');
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
            label="문장 번역 수정"
            description="특정 문장의 번역 텍스트를 수정합니다."
            endpoint={`PATCH /video-translator/api/v1/project/${projectSeq ?? '{projectSeq}'}/audio-sentence/${sentenceSeq ?? '{sentenceSeq}'}`}
            status={statuses['translateSentence'] || 'idle'}
            result={results['translateSentence'] || null}
            docExpected={`{ "result": { "scriptSeq": 1, "translatedText": "...", "matchingRate": { "level": 4, "levelType": "EXCELLENT" } } }`}
            onRun={() => {
              if (!projectSeq || !sentenceSeq) return alert('projectSeq와 sentenceSeq가 필요합니다');
              run('translateSentence', () => api.translateSentence(projectSeq!, sentenceSeq!, sentenceText || 'Hello world'));
            }}
          >
            <input value={sentenceText} onChange={e => setSentenceText(e.target.value)}
              className="w-40 bg-surface-900 border border-surface-700 rounded px-2 py-1 text-xs text-white shrink-0"
              placeholder="수정할 번역 텍스트" />
          </TestRow>

          <TestRow
            label="오디오 재생성"
            description="수정된 번역 텍스트로 새 오디오를 생성합니다."
            endpoint={`PATCH /video-translator/api/v1/project/${projectSeq ?? '{projectSeq}'}/audio-sentence/${sentenceSeq ?? '{sentenceSeq}'}/generate-audio`}
            status={statuses['genAudio'] || 'idle'}
            result={results['genAudio'] || null}
            docExpected={`{ "result": { "scriptSeq": 1, "translatedText": "...", "generateAudioFilePath": "/audio/1.mp3", "matchingRate": {...} } }`}
            onRun={() => {
              if (!projectSeq || !sentenceSeq) return alert('ID가 필요합니다');
              run('genAudio', () => api.generateSentenceAudio(projectSeq!, sentenceSeq!, sentenceText || 'Hello world'));
            }}
          />

          <TestRow
            label="문장 초기화"
            description="편집한 번역을 원래 상태(교정본)로 되돌립니다."
            endpoint={`PUT /video-translator/api/v1/project/${projectSeq ?? '{projectSeq}'}/audio-sentence/${sentenceSeq ?? '{sentenceSeq}'}/reset`}
            status={statuses['resetSentence'] || 'idle'}
            result={results['resetSentence'] || null}
            onRun={() => {
              if (!projectSeq || !sentenceSeq) return alert('ID가 필요합니다');
              run('resetSentence', () => api.resetSentence(projectSeq!, sentenceSeq!));
            }}
          />

          <TestRow
            label="번역 품질 평가"
            description="번역 텍스트의 매칭률과 속도 정보를 미리 확인합니다."
            endpoint={`POST /video-translator/api/v1/project/${projectSeq ?? '{projectSeq}'}/audio-sentence/${sentenceSeq ?? '{sentenceSeq}'}/match-rewrite`}
            status={statuses['matchRewrite'] || 'idle'}
            result={results['matchRewrite'] || null}
            docExpected={`{ "result": { "matchingRate": { "level": 3, "levelType": "Low" }, "rewrite": { "speed": "fast", "current": 3, "optimal": { "min": 101, "max": 120 } } } }`}
            onRun={() => {
              if (!projectSeq || !sentenceSeq) return alert('ID가 필요합니다');
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
        <Section title="다운로드 API" description="완료된 프로젝트의 영상, 오디오, 자막 파일을 다운로드합니다" num={5}>
          <TestRow
            label="다운로드 가능 여부 확인"
            description="어떤 파일들이 다운로드 가능한지 boolean 플래그로 확인합니다."
            endpoint={`GET /video-translator/api/v1/projects/${projectSeq ?? '{projectSeq}'}/spaces/${spaceSeq ?? '{spaceSeq}'}/download-info`}
            status={statuses['downloadInfo'] || 'idle'}
            result={results['downloadInfo'] || null}
            docExpected={`{ "hasTranslatedVideo": true, "hasOriginalSubtitle": true, "hasTranslatedSubtitle": true, "hasZipDownload": true, ... }`}
            onRun={() => {
              if (!projectSeq || !spaceSeq) return alert('ID가 필요합니다');
              run('downloadInfo', () => api.getDownloadInfo(projectSeq!, spaceSeq!));
            }}
          />

          <TestRow
            label="다운로드 링크 조회 (병합)"
            description="개별 target(dubbingVideo, voiceAudio, all)을 각각 호출 후 하나로 병합합니다."
            endpoint="getDownloadLinks() — dubbingVideo + voiceAudio + voicewithBackgroundAudio + all"
            status={statuses['downloadLinks'] || 'idle'}
            result={results['downloadLinks'] || null}
            issues="target=all은 ZIP 경로만 반환합니다. 개별 파일은 각각의 target으로 호출해야 합니다."
            onRun={() => {
              if (!projectSeq || !spaceSeq) return alert('ID가 필요합니다');
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
              label={`개별 다운로드: target=${target}`}
              description={target === 'all' ? 'ZIP 전체 파일 (tar)' : `${target} 파일만 개별 조회`}
              endpoint={`GET .../download?target=${target}`}
              status={statuses[`dl_${target}`] || 'idle'}
              result={results[`dl_${target}`] || null}
              docExpected={target === 'all' ? '{ "zippedFileDownloadLink": "/perso-storage/.../DownloadAllFiles.tar" }' : undefined}
              onRun={() => {
                if (!projectSeq || !spaceSeq) return alert('ID가 필요합니다');
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
            <div className="mt-3 p-3 bg-surface-900 rounded-lg">
              <p className="text-xs text-primary-400 mb-2">🎬 더빙된 영상 재생</p>
              <video src={videoUrl} controls className="w-full max-w-lg rounded-lg bg-black" />
            </div>
          )}
        </Section>

        {/* ── 6. Lip Sync API ── */}
        <Section title="립싱크 API" description="더빙된 오디오에 맞춰 입 모양을 동기화합니다 (Pro 플랜)" num={6}>
          <TestRow
            label="립싱크 요청"
            description="완료된 번역 프로젝트에 립싱크를 적용합니다."
            endpoint={`POST /video-translator/api/v1/projects/${projectSeq ?? '{projectSeq}'}/spaces/${spaceSeq ?? '{spaceSeq}'}/lip-sync`}
            status={statuses['lipSync'] || 'idle'}
            result={results['lipSync'] || null}
            docExpected={`{ "result": { "startGenerateProjectIdList": [1, 2, 3] } }`}
            onRun={() => {
              if (!projectSeq || !spaceSeq) return alert('ID가 필요합니다');
              run('lipSync', () => api.requestLipSync(projectSeq!, spaceSeq!));
            }}
          />

          <TestRow
            label="립싱크 생성 이력"
            description="립싱크 생성 기록을 페이지네이션으로 조회합니다."
            endpoint={`GET .../lip-sync/generated`}
            status={statuses['lipSyncHistory'] || 'idle'}
            result={results['lipSyncHistory'] || null}
            onRun={() => {
              if (!projectSeq || !spaceSeq) return alert('ID가 필요합니다');
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
        <Section title="언어 API" description="지원되는 번역 언어 목록을 조회합니다" num={7}>
          <TestRow
            label="지원 언어 목록"
            description="사용 가능한 모든 언어와 실험적(experiment) 언어 여부를 확인합니다."
            endpoint="GET /video-translator/api/v1/languages"
            status={statuses['languages'] || 'idle'}
            result={results['languages'] || null}
            docExpected={`{ "result": { "languages": [{ "code": "en", "name": "English", "experiment": false }, { "code": "ko", "name": "Korean", "experiment": false }] } }`}
            onRun={() => run('languages', () => api.getSupportedLanguages())}
          />
        </Section>

        {/* ── 8. Usage/Quota API ── */}
        <Section title="사용량 / 쿼타 API" description="플랜 정보와 잔여 크레딧(쿼타)을 확인합니다" num={8}>
          <TestRow
            label="플랜 상태 조회"
            description="현재 플랜, 잔여 쿼타, 리셋 일시를 확인합니다."
            endpoint={`GET /video-translator/api/v1/projects/spaces/${spaceSeq ?? '{spaceSeq}'}/plan/status`}
            status={statuses['quotaStatus'] || 'idle'}
            result={results['quotaStatus'] || null}
            docExpected={`{ "result": { "planTier": "creator", "remainingQuota": { "remainingQuota": 500000 }, "resetDateTime": "2026-04-30T..." } }`}
            onRun={() => { if (!spaceSeq) return alert('spaceSeq가 필요합니다'); run('quotaStatus', () => api.getQuotaStatus(spaceSeq!)); }}
          />

          <TestRow
            label="쿼타 소모량 추정"
            description="30초 영상을 번역할 때 예상되는 쿼타 소모량을 계산합니다."
            endpoint={`GET .../media/quota?mediaType=VIDEO&durationMs=30000`}
            status={statuses['estimateQuota'] || 'idle'}
            result={results['estimateQuota'] || null}
            docExpected={`{ "result": { "expectedUsedQuota": 5000 } }`}
            onRun={() => { if (!spaceSeq) return alert('spaceSeq가 필요합니다'); run('estimateQuota', () => api.estimateQuota(spaceSeq!, { mediaType: 'VIDEO', lipSync: false, durationMs: 30000 })); }}
          />
        </Section>

        {/* ── 9. Feedback API ── */}
        <Section title="피드백 API" description="번역 프로젝트에 별점 피드백을 남깁니다" num={9}>
          <TestRow
            label="피드백 제출 (별점 5)"
            description="프로젝트에 별점 5점을 제출합니다."
            endpoint="POST /video-translator/api/v1/projects/feedbacks"
            status={statuses['submitFeedback'] || 'idle'}
            result={results['submitFeedback'] || null}
            docExpected={`{ "result": { "averageRating": 4.5, "count": 10 } }`}
            onRun={() => {
              if (!projectSeq) return alert('projectSeq가 필요합니다');
              run('submitFeedback', () => api.submitFeedback(projectSeq!, 5));
            }}
          />

          <TestRow
            label="피드백 조회"
            description="내가 남긴 피드백을 조회합니다. 없으면 204 응답."
            endpoint="GET /video-translator/api/v1/projects/feedbacks?projectSeq=..."
            status={statuses['getFeedback'] || 'idle'}
            result={results['getFeedback'] || null}
            onRun={() => {
              if (!projectSeq) return alert('projectSeq가 필요합니다');
              run('getFeedback', async () => {
                const { data } = await axios.get(`${BASE}/video-translator/api/v1/projects/feedbacks`, { params: { projectSeq } });
                return data;
              });
            }}
          />
        </Section>

        {/* ── 10. Community Spotlight ── */}
        <Section title="커뮤니티 스포트라이트" description="추천 프로젝트 목록을 조회합니다" num={10}>
          <TestRow
            label="추천 프로젝트 목록"
            description="커뮤니티에서 공개된 인기 프로젝트를 조회합니다."
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
        <Section title="알려진 이슈 & 엣지 케이스" description="API 문서와 실제 응답이 다른 부분을 재현합니다" num={11}>
          <TestRow
            label="progressReason 대소문자 불일치"
            description='문서: "COMPLETED" (전체 대문자) → 실제: "Completed" (Pascal case). toUpperCase()로 비교 필요.'
            endpoint={`GET .../progress`}
            status={statuses['edgeProgressCase'] || 'idle'}
            result={results['edgeProgressCase'] || null}
            issues='API 문서에는 progressReason 값이 COMPLETED, FAILED, CANCELED 등 전체 대문자로 되어있지만, 실제 응답은 Completed처럼 첫 글자만 대문자입니다. 문서 기준으로 === "COMPLETED" 비교하면 완료 감지가 안 되어 무한 폴링됩니다.'
            docExpected={`문서: { "progressReason": "COMPLETED" }\n실제: { "progressReason": "Completed" }`}
            onRun={() => run('edgeProgressCase', async () => {
              if (!projectSeq || !spaceSeq) throw new Error('완료된 프로젝트의 projectSeq가 필요합니다');
              const progress = await api.getProgress(projectSeq!, spaceSeq!);
              return {
                실제_progressReason: progress.progressReason,
                문서_기대값: 'COMPLETED',
                일치여부: progress.progressReason === 'COMPLETED' ? '일치' : '불일치!',
                해결방법: '.toUpperCase()로 정규화하여 비교',
              };
            })}
          />

          <TestRow
            label="download target=all → 개별 링크 null"
            description="target=all로 호출하면 ZIP 경로만 반환되고, videoFile/audioFile/srtFile의 개별 링크는 전부 null입니다."
            endpoint={`GET .../download?target=all`}
            status={statuses['edgeDownloadAll'] || 'idle'}
            result={results['edgeDownloadAll'] || null}
            issues='문서에서는 target=all이 모든 파일 링크를 포함한다고 되어있지만, 실제로는 zippedFileDownloadLink만 채워지고 나머지는 null입니다. 개별 파일이 필요하면 dubbingVideo, voiceAudio 등 별도 호출이 필요합니다.'
            docExpected={`문서 기대값: 모든 링크 포함\n실제: { videoFile: { videoDownloadLink: null }, ..., zippedFileDownloadLink: "/perso-storage/...tar" }`}
            onRun={() => {
              if (!projectSeq || !spaceSeq) return alert('ID가 필요합니다');
              run('edgeDownloadAll', async () => {
                const { data } = await axios.get(
                  `${BASE}/video-translator/api/v1/projects/${projectSeq}/spaces/${spaceSeq}/download`,
                  { params: { target: 'all' } }
                );
                const result = data?.result ?? data;
                return {
                  videoDownloadLink: result?.videoFile?.videoDownloadLink ?? 'null ← 여기가 문제',
                  voiceAudioDownloadLink: result?.audioFile?.voiceAudioDownloadLink ?? 'null ← 여기가 문제',
                  zippedFileDownloadLink: result?.zippedFileDownloadLink ?? 'null',
                  결론: 'target=all은 ZIP만 반환, 개별 파일은 각 target으로 호출해야 함',
                };
              });
            }}
          />

          <TestRow
            label="download target=video → 서버 에러"
            description='문서에 "video"가 유효한 target으로 나열되어 있지만, 실제로는 500 에러가 발생합니다.'
            endpoint={`GET .../download?target=video`}
            status={statuses['edgeDownloadVideo'] || 'idle'}
            result={results['edgeDownloadVideo'] || null}
            issues='문서에 target 값으로 "video"가 있지만, 서버는 "Unexpected Download value: VIDEO" 에러를 반환합니다. "dubbingVideo"를 사용해야 합니다.'
            docExpected={`문서: target=video 가능\n실제: 500 에러 { "code": "VT5001", "message": "Unexpected Download value: VIDEO" }`}
            onRun={() => {
              if (!projectSeq || !spaceSeq) return alert('ID가 필요합니다');
              run('edgeDownloadVideo', async () => {
                try {
                  const { data } = await axios.get(
                    `${BASE}/video-translator/api/v1/projects/${projectSeq}/spaces/${spaceSeq}/download`,
                    { params: { target: 'video' } }
                  );
                  return { 예상과_다르게_성공: data };
                } catch (e) {
                  return {
                    예상대로_실패: true,
                    에러: e instanceof Error ? e.message : String(e),
                    해결방법: 'target=video 대신 target=dubbingVideo 사용',
                  };
                }
              });
            }}
          />

          <TestRow
            label="download target=translatedSubtitle → 서버 에러"
            description='문서에 "translatedSubtitle"가 유효한 target이지만, 실제로는 500 에러가 발생합니다.'
            endpoint={`GET .../download?target=translatedSubtitle`}
            status={statuses['edgeDownloadSub'] || 'idle'}
            result={results['edgeDownloadSub'] || null}
            issues='서버가 "Unexpected Download value: TRANSLATED_SUBTITLE"를 반환합니다.'
            onRun={() => {
              if (!projectSeq || !spaceSeq) return alert('ID가 필요합니다');
              run('edgeDownloadSub', async () => {
                try {
                  const { data } = await axios.get(
                    `${BASE}/video-translator/api/v1/projects/${projectSeq}/spaces/${spaceSeq}/download`,
                    { params: { target: 'translatedSubtitle' } }
                  );
                  return { 예상과_다르게_성공: data };
                } catch (e) {
                  return {
                    예상대로_실패: true,
                    에러: e instanceof Error ? e.message : String(e),
                    해결방법: 'ZIP 다운로드(target=all) 후 압축 해제하여 자막 추출',
                  };
                }
              });
            }}
          />

          <TestRow
            label="download 미지원 target 종합 테스트"
            description="문서에 나열된 target 중 실제로 500 에러를 반환하는 것들을 한번에 테스트합니다."
            endpoint="GET .../download?target=video|originalSubtitle|translatedSubtitle|..."
            status={statuses['edgeBrokenTargets'] || 'idle'}
            result={results['edgeBrokenTargets'] || null}
            issues="문서에 유효하다고 되어있지만, 일부 target은 서버에서 Unexpected Download value 에러를 반환합니다."
            onRun={() => {
              if (!projectSeq || !spaceSeq) return alert('ID가 필요합니다');
              run('edgeBrokenTargets', async () => {
                const targets = ['video', 'originalSubtitle', 'translatedSubtitle', 'originalVoiceAudio', 'backgroundAudio', 'translatedAudio', 'lipSyncVideo', 'originalVoiceSpeakers', 'speakerSegmentExcel', 'speakerSegmentWithTranslationExcel'];
                const results: Record<string, string> = {};
                for (const t of targets) {
                  try {
                    await axios.get(`${BASE}/video-translator/api/v1/projects/${projectSeq}/spaces/${spaceSeq}/download`, { params: { target: t } });
                    results[t] = '✅ 성공';
                  } catch (e) {
                    results[t] = '❌ ' + (e instanceof Error ? e.message : String(e));
                  }
                }
                return results;
              });
            }}
          />
        </Section>

        <div className="text-center text-xs text-gray-600 py-8">
          AniVoice Perso API 테스트 도구 — {allKeys.length}개 테스트 등록됨
          <br />
          <span className="text-gray-700">이 페이지는 테스트 전용입니다. 삭제 시 TestPage.tsx 파일과 App.tsx의 /test 라우트만 제거하면 됩니다.</span>
        </div>
      </div>
    </div>
  );
}
