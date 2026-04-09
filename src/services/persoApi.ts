import axios from 'axios';
import type {
  PersoDownloadLinks,
  PersoProgress,
  PersoScriptSentence,
  PersoSpaceBanner,
  PersoUploadedFile,
} from '../types';

const BASE = (import.meta.env.VITE_PERSO_PROXY_PATH || '/api/perso').replace(/\/+$/, '');
const PERSO_FILE_BASE_URL = 'https://perso.ai';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(new Error(extractApiErrorMessage(error))),
);

type ResultEnvelope<T> = {
  result: T;
};

type PersoLanguage = {
  code: string;
  name: string;
  experiment: boolean;
};

type QueueStatusResponse = {
  success: boolean;
  data: {
    userSeq: number;
    planName: string;
    usedQueueCount: number;
    maxQueueCount: number;
    redZoneQueueCount: number;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function unwrapResult<T>(payload: T | ResultEnvelope<T>): T {
  if (isRecord(payload) && 'result' in payload) {
    return payload.result as T;
  }
  return payload as T;
}

function findApiMessage(payload: unknown): string | undefined {
  if (typeof payload === 'string' && payload.trim()) {
    return payload.trim();
  }

  if (!isRecord(payload)) {
    return undefined;
  }

  const messageKeys = ['detail', 'message', 'error', 'title'] as const;
  for (const key of messageKeys) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  if ('result' in payload) {
    const nestedMessage = findApiMessage(payload.result);
    if (nestedMessage) {
      return nestedMessage;
    }
  }

  if ('data' in payload) {
    const nestedMessage = findApiMessage(payload.data);
    if (nestedMessage) {
      return nestedMessage;
    }
  }

  return undefined;
}

function extractApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const method = (error.config?.method || 'get').toUpperCase();
    const detail = findApiMessage(error.response?.data) || error.message;

    if (
      (status === 401 || status === 403) &&
      url.includes('/file/api/') &&
      method !== 'GET'
    ) {
      return 'Perso File API rejected this upload request. This API key can reach read endpoints, but file upload/write endpoints are not authorized for the current credentials or account.';
    }

    return status ? `Perso API request failed (${status}): ${detail}` : detail;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export function resolvePersoFileUrl(path?: string | null) {
  if (!path) {
    return undefined;
  }

  return path.startsWith('http') ? path : `${PERSO_FILE_BASE_URL}${path}`;
}

export async function listSpaces(): Promise<PersoSpaceBanner[]> {
  const { data } = await api.get('/portal/api/v1/spaces');
  return unwrapResult(data);
}

export async function getSpace(spaceSeq: number): Promise<PersoSpaceBanner> {
  const { data } = await api.get(`/portal/api/v1/spaces/${spaceSeq}`);
  return unwrapResult(data);
}

export async function getSasToken(fileName: string) {
  const { data } = await api.get('/file/api/upload/sas-token', {
    params: { fileName },
  });
  return data as { blobSasUrl: string; expirationDatetime: string };
}

export async function uploadToAzure(blobSasUrl: string, file: File) {
  await axios.put(blobSasUrl, file, {
    headers: {
      'x-ms-blob-type': 'BlockBlob',
      'Content-Type': 'application/octet-stream',
    },
  });
}

export async function registerVideo(
  spaceSeq: number,
  fileUrl: string,
  fileName: string
): Promise<PersoUploadedFile> {
  const { data } = await api.put('/file/api/upload/video', {
    spaceSeq,
    fileUrl,
    fileName,
  });
  return data;
}

export async function uploadVideoFile(
  spaceSeq: number,
  file: File
): Promise<PersoUploadedFile> {
  const sas = await getSasToken(file.name);
  await uploadToAzure(sas.blobSasUrl, file);
  const fileUrl = sas.blobSasUrl.split('?')[0];
  return registerVideo(spaceSeq, fileUrl, file.name);
}

export async function uploadExternalVideo(
  spaceSeq: number,
  url: string,
  lang: string = 'ko'
): Promise<PersoUploadedFile> {
  const { data } = await api.put('/file/api/upload/video/external', {
    space_seq: spaceSeq,
    url,
    lang,
  });
  return data;
}

export async function getExternalMetadata(
  spaceSeq: number,
  url: string,
  lang: string = 'ko'
) {
  const { data } = await api.post('/file/api/v1/video-translator/external/metadata', {
    space_seq: spaceSeq,
    url,
    lang,
  });
  return data;
}

export interface TranslateRequest {
  mediaSeq: number;
  isVideoProject: boolean;
  sourceLanguageCode?: string;
  targetLanguageCodes: string[];
  numberOfSpeakers: number;
  withLipSync?: boolean;
  preferredSpeedType: 'GREEN' | 'RED';
}

export async function ensureSpaceQueue(spaceSeq: number): Promise<QueueStatusResponse> {
  const { data } = await api.put(
    `/video-translator/api/v1/projects/spaces/${spaceSeq}/queue`
  );
  return data as QueueStatusResponse;
}

export async function requestTranslation(
  spaceSeq: number,
  req: TranslateRequest
): Promise<number[]> {
  const { data } = await api.post(
    `/video-translator/api/v1/projects/spaces/${spaceSeq}/translate`,
    req
  );
  return unwrapResult<{ startGenerateProjectIdList: number[] }>(data).startGenerateProjectIdList;
}

export async function getProject(projectSeq: number, spaceSeq: number) {
  const { data } = await api.get(
    `/video-translator/api/v1/projects/${projectSeq}/spaces/${spaceSeq}`
  );
  return unwrapResult(data);
}

export async function getProgress(
  projectSeq: number,
  spaceSeq: number
): Promise<PersoProgress> {
  const { data } = await api.get(
    `/video-translator/api/v1/projects/${projectSeq}/space/${spaceSeq}/progress`
  );
  return unwrapResult(data);
}

export async function pollProgress(
  projectSeq: number,
  spaceSeq: number,
  onProgress: (p: PersoProgress) => void,
  intervalMs = 5000
): Promise<PersoProgress> {
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const progress = await getProgress(projectSeq, spaceSeq);
        onProgress(progress);

        const reason = (progress.progressReason || '').toUpperCase();

        if (reason === 'COMPLETED' || progress.progress >= 100) {
          resolve(progress);
        } else if (progress.hasFailed || reason === 'FAILED') {
          reject(new Error(`Translation failed: ${progress.progressReason}`));
        } else if (reason === 'CANCELED') {
          reject(new Error('Translation was canceled'));
        } else {
          // Adapt interval: poll less often when ETA is long
          const eta = progress.expectedRemainingTimeMinutes ?? 0;
          const nextInterval = eta > 3 ? 10000 : eta > 1 ? 7000 : intervalMs;
          setTimeout(poll, nextInterval);
        }
      } catch (error) {
        reject(error);
      }
    };

    poll();
  });
}

export async function cancelProject(projectSeq: number, spaceSeq: number) {
  const { data } = await api.post(
    `/video-translator/api/v1/projects/${projectSeq}/spaces/${spaceSeq}/cancel`
  );
  return unwrapResult(data);
}

export async function getScript(
  projectSeq: number,
  spaceSeq: number
): Promise<{
  sentences: PersoScriptSentence[];
  speakers: { speakerOrderIndex: number; externalSpeakerSeq: string }[];
}> {
  const { data } = await api.get(
    `/video-translator/api/v1/projects/${projectSeq}/spaces/${spaceSeq}/script`,
    { params: { size: 10000 } }
  );
  return unwrapResult(data);
}

export async function translateSentence(
  projectSeq: number,
  sentenceSeq: number,
  targetText: string
) {
  const { data } = await api.patch(
    `/video-translator/api/v1/project/${projectSeq}/audio-sentence/${sentenceSeq}`,
    { targetText }
  );
  return unwrapResult(data);
}

export async function generateSentenceAudio(
  projectSeq: number,
  sentenceSeq: number,
  targetText: string
) {
  const { data } = await api.patch(
    `/video-translator/api/v1/project/${projectSeq}/audio-sentence/${sentenceSeq}/generate-audio`,
    { targetText }
  );
  return unwrapResult(data);
}

export async function resetSentence(projectSeq: number, sentenceSeq: number) {
  const { data } = await api.put(
    `/video-translator/api/v1/project/${projectSeq}/audio-sentence/${sentenceSeq}/reset`
  );
  return unwrapResult(data);
}

export async function requestLipSync(projectSeq: number, spaceSeq: number) {
  const { data } = await api.post(
    `/video-translator/api/v1/projects/${projectSeq}/spaces/${spaceSeq}/lip-sync`,
    { preferredSpeedType: 'GREEN' }
  );
  return unwrapResult<{ startGenerateProjectIdList: number[] }>(data).startGenerateProjectIdList;
}

async function fetchDownloadTarget(
  projectSeq: number,
  spaceSeq: number,
  target: string
): Promise<PersoDownloadLinks> {
  const { data } = await api.get(
    `/video-translator/api/v1/projects/${projectSeq}/spaces/${spaceSeq}/download`,
    { params: { target } }
  );
  return unwrapResult(data);
}

/**
 * Fetch all download links by calling the working individual targets
 * and merging results. `target=all` only returns a zip; individual targets
 * like `dubbingVideo`, `voiceAudio` etc. return actual file paths.
 */
export async function getDownloadLinks(
  projectSeq: number,
  spaceSeq: number,
): Promise<PersoDownloadLinks> {
  const targets = [
    'dubbingVideo',
    'voiceAudio',
    'voicewithBackgroundAudio',
    'all', // zip
  ];

  const results = await Promise.allSettled(
    targets.map((t) => fetchDownloadTarget(projectSeq, spaceSeq, t))
  );

  const merged: PersoDownloadLinks = {};

  for (const r of results) {
    if (r.status !== 'fulfilled') continue;
    const d = r.value;
    if (d.videoFile?.videoDownloadLink) {
      merged.videoFile = d.videoFile;
    }
    if (d.audioFile) {
      merged.audioFile = {
        ...merged.audioFile,
        voiceAudioDownloadLink: d.audioFile.voiceAudioDownloadLink || merged.audioFile?.voiceAudioDownloadLink || '',
        backgroundAudioDownloadLink: d.audioFile.backgroundAudioDownloadLink || merged.audioFile?.backgroundAudioDownloadLink || '',
        voiceWithBackgroundAudioDownloadLink: d.audioFile.voiceWithBackgroundAudioDownloadLink || merged.audioFile?.voiceWithBackgroundAudioDownloadLink || '',
      };
    }
    if (d.srtFile?.originalSubtitleDownloadLink || d.srtFile?.translatedSubtitleDownloadLink) {
      merged.srtFile = { ...merged.srtFile, ...d.srtFile } as PersoDownloadLinks['srtFile'];
    }
    if (d.zippedFileDownloadLink) {
      merged.zippedFileDownloadLink = d.zippedFileDownloadLink;
    }
  }

  return merged;
}

export async function getDownloadInfo(projectSeq: number, spaceSeq: number) {
  const { data } = await api.get(
    `/video-translator/api/v1/projects/${projectSeq}/spaces/${spaceSeq}/download-info`
  );
  return unwrapResult(data);
}

export async function getSupportedLanguages() {
  const { data } = await api.get('/video-translator/api/v1/languages');
  const payload = unwrapResult<{ languages: PersoLanguage[] } | PersoLanguage[]>(data);
  return Array.isArray(payload) ? payload : payload.languages;
}

export async function listProjects(
  spaceSeq: number,
  params: { size?: number; offset?: number; sortType?: string; sortDirection?: string; memberRole?: string } = {}
) {
  const { data } = await api.get(
    `/video-translator/api/v1/projects/spaces/${spaceSeq}`,
    {
      params: {
        memberRole: params.memberRole || 'space_owner',
        size: params.size || 20,
        offset: params.offset || 0,
        sortType: params.sortType || 'update_date',
        sortDirection: params.sortDirection || 'desc',
        ...params,
      },
    }
  );
  return unwrapResult(data);
}

export async function getQuotaStatus(spaceSeq: number) {
  const { data } = await api.get(
    `/video-translator/api/v1/projects/spaces/${spaceSeq}/plan/status`
  );
  return unwrapResult(data);
}

export async function estimateQuota(
  spaceSeq: number,
  params: {
    mediaType: 'VIDEO' | 'AUDIO';
    lipSync: boolean;
    durationMs: number;
    targetLanguageSize?: number;
  }
) {
  const { data } = await api.get(
    `/video-translator/api/v1/projects/spaces/${spaceSeq}/media/quota`,
    { params }
  );
  return unwrapResult(data);
}

export async function submitFeedback(projectSeq: number, rating: number) {
  const { data } = await api.post('/video-translator/api/v1/projects/feedbacks', {
    projectSeq,
    rating,
  });
  return unwrapResult(data);
}
