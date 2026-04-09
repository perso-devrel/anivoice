export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  plan: PlanType;
  creditSeconds: number;
  language: SupportedLanguage;
  createdAt: string;
}

export type PlanType = 'free' | 'basic' | 'pro' | 'pay-per-use';

export type SupportedLanguage = 'ja' | 'ko' | 'en' | 'es' | 'pt' | 'id' | 'ar';

export type ProjectStatus = 'uploading' | 'analyzing' | 'dubbing' | 'lip-syncing' | 'completed' | 'failed';

export interface Project {
  id: string;
  userId: string;
  title: string;
  originalFileName: string;
  originalLanguage: SupportedLanguage;
  targetLanguages: SupportedLanguage[];
  status: ProjectStatus;
  progress: number;
  duration: number;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  spaceSeq?: number;
  projectSeq?: number;
}

// Perso API types

export interface PersoSpaceBanner {
  spaceSeq: number;
  spaceName: string;
  planName: string;
  tier: string;
  logo: string;
  memberCount: number;
  seat: number;
  isDefaultSpaceOwned: boolean;
  memberRole: string;
  useVideoTranslatorEdit: boolean;
}

export interface PersoUploadedFile {
  seq: number;
  originalName: string;
  videoFilePath: string;
  thumbnailFilePath: string;
  size: number;
  durationMs: number;
}

export interface PersoProject {
  seq: number;
  projectType: string;
  title: string;
  isEditable: boolean;
  durationMs: number;
  sourceLanguage: { code: string; name: string };
  targetLanguage: { code: string; name: string };
  progress: number;
  progressReason: string;
  hasFailed: boolean;
  isLipSync: boolean;
  thumbnailUrl?: string;
  createDate: string;
  updateDate: string;
}

export interface PersoProgress {
  projectSeq: number;
  progress: number;
  progressReason: string;
  hasFailed: boolean;
  speedType: string;
  expectedRemainingTimeMinutes: number;
  isCancelable: boolean;
}

export interface PersoScriptSentence {
  seq: number;
  speakerOrderIndex: number;
  offsetMs: number;
  durationMs: number;
  originalText: string;
  translatedText: string;
  audioUrl?: string;
  matchingRate?: { level: number; levelType: string };
}

export interface PersoDownloadLinks {
  videoFile?: { videoDownloadLink: string };
  audioFile?: {
    voiceAudioDownloadLink: string;
    backgroundAudioDownloadLink: string;
    voiceWithBackgroundAudioDownloadLink: string;
  };
  srtFile?: {
    originalSubtitleDownloadLink: string;
    translatedSubtitleDownloadLink: string;
  };
  zippedFileDownloadLink?: string;
}
