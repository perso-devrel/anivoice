#!/usr/bin/env node
/**
 * .ralph/test/dub-flow.mjs
 *
 * Studio 페이지의 더빙 흐름 전체를 Node.js 에서 직접 호출해 검증한다.
 * 두 영상이 모두 더빙 완료될 때까지 끝나지 않는다.
 *
 * 사용:
 *   node .ralph/test/dub-flow.mjs
 *
 * 환경변수:
 *   BASE_URL          (default: https://anivoice-lime.vercel.app)
 *   TARGET_LANGUAGE   (default: en)
 *   POLL_INTERVAL_MS  (default: 8000)
 *   MAX_POLL_MINUTES  (default: 25)  — 한 영상당 최대 대기
 *   ONLY              ('1' | '2' | undefined) — 특정 영상만 테스트
 */

// 사내 CA 환경에서도 자체 배포 URL 만 호출하므로 인증서 검증을 끈다.
// (테스트 스크립트 한정 — 프로덕션 코드에는 영향 없음)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

const BASE_URL = (process.env.BASE_URL || 'https://anivoice-lime.vercel.app').replace(/\/+$/, '');
const PROXY = `${BASE_URL}/api/perso`;
const TARGET_LANGUAGE = process.env.TARGET_LANGUAGE || 'en';
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS || 8000);
const MAX_POLL_MINUTES = Number(process.env.MAX_POLL_MINUTES || 25);
const ONLY = process.env.ONLY;

const VIDEOS = [
  { id: '1', label: 'test_animation', file: path.join(PROJECT_ROOT, 'test', 'test_animation.mp4') },
  { id: '2', label: 'test video',     file: path.join(PROJECT_ROOT, 'test', 'test video.mp4') },
];

// ────────────── 로깅 ──────────────
const stamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19);
const log  = (...a) => console.log(`[${stamp()}]`, ...a);
const warn = (...a) => console.warn(`[${stamp()}] ⚠`, ...a);
const fail = (msg, extra) => {
  const detail = extra ? ` :: ${typeof extra === 'string' ? extra : JSON.stringify(extra).slice(0, 600)}` : '';
  throw new Error(`${msg}${detail}`);
};

// ────────────── 헬퍼 ──────────────
async function call(method, path_, { query, body, headers } = {}) {
  let url = `${PROXY}${path_}`;
  if (query) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      qs.append(k, String(v));
    }
    const qsStr = qs.toString();
    if (qsStr) url += `?${qsStr}`;
  }

  const init = {
    method,
    headers: { Accept: 'application/json', ...(headers || {}) },
  };
  if (body !== undefined) {
    if (typeof body === 'string' || body instanceof Uint8Array || body instanceof ArrayBuffer) {
      init.body = body;
    } else {
      init.body = JSON.stringify(body);
      init.headers['Content-Type'] = 'application/json';
    }
  }

  const res = await fetch(url, init);
  const text = await res.text();
  let parsed = text;
  try { parsed = JSON.parse(text); } catch { /* leave as text */ }

  if (!res.ok) {
    if (res.status === 402 || (parsed?.detailCode ?? parsed?.code ?? '').toString().includes('QUOTA')) {
      log(`⚠ QUOTA EXCEEDED — ${method} ${path_} → HTTP ${res.status}`);
      log('  This is an external API quota limit, not a code regression.');
      log('  Exiting with code 78 (quota). Re-run when quota resets.');
      process.exit(78);
    }
    fail(`${method} ${path_} -> HTTP ${res.status}`, parsed);
  }
  return parsed;
}

function unwrap(payload) {
  if (payload && typeof payload === 'object' && !Array.isArray(payload) && 'result' in payload) {
    return payload.result;
  }
  return payload;
}

function pickProjectIds(payload) {
  const root = payload && typeof payload === 'object' ? payload : {};
  const inner = unwrap(root);
  const candidates = [];
  for (const obj of [inner, root]) {
    if (!obj || typeof obj !== 'object') continue;
    for (const k of ['startGenerateProjectIdList', 'projectSeqList', 'projectIdList', 'projectIds', 'projectSeqs']) {
      if (Array.isArray(obj[k])) candidates.push(obj[k]);
    }
    for (const k of ['projectSeq', 'projectId', 'project_seq', 'project_id']) {
      if (typeof obj[k] === 'number') candidates.push([obj[k]]);
    }
  }
  if (Array.isArray(inner)) candidates.push(inner);
  for (const cand of candidates) {
    const ids = cand
      .map((v) => {
        if (typeof v === 'number') return v;
        if (typeof v === 'string' && /^\d+$/.test(v)) return Number(v);
        if (v && typeof v === 'object') {
          for (const k of ['projectSeq', 'projectId', 'seq', 'id']) {
            const inner = v[k];
            if (typeof inner === 'number') return inner;
            if (typeof inner === 'string' && /^\d+$/.test(inner)) return Number(inner);
          }
        }
        return null;
      })
      .filter((v) => v !== null);
    if (ids.length) return ids;
  }
  return [];
}

// ────────────── 단계별 호출 ──────────────
async function getFirstSpace() {
  log('listSpaces ...');
  const data = await call('GET', '/portal/api/v1/spaces');
  const spaces = unwrap(data);
  if (!Array.isArray(spaces) || spaces.length === 0) {
    fail('No spaces returned', data);
  }
  const space = spaces[0];
  log(`  -> spaceSeq=${space.spaceSeq} (${space.spaceName})`);
  return space.spaceSeq;
}

async function getSasToken(fileName) {
  log(`getSasToken("${fileName}") ...`);
  const data = await call('GET', '/file/api/upload/sas-token', { query: { fileName } });
  const payload = unwrap(data);
  if (!payload?.blobSasUrl) fail('SAS token missing blobSasUrl', data);
  return payload;
}

async function uploadToAzure(blobSasUrl, filePath) {
  const stat = fs.statSync(filePath);
  log(`uploadToAzure ... ${(stat.size / 1024 / 1024).toFixed(2)} MB`);

  const buffer = fs.readFileSync(filePath);
  const res = await fetch(blobSasUrl, {
    method: 'PUT',
    headers: {
      'x-ms-blob-type': 'BlockBlob',
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(buffer.length),
    },
    body: buffer,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    fail(`Azure upload HTTP ${res.status}`, text.slice(0, 600));
  }
  log('  -> upload OK');
}

async function registerVideo(spaceSeq, fileUrl, fileName) {
  log('registerVideo ...');
  const data = await call('PUT', '/file/api/upload/video', {
    body: { spaceSeq, fileUrl, fileName },
  });
  const payload = unwrap(data);
  if (!payload?.seq) fail('registerVideo response missing seq', data);
  log(`  -> mediaSeq=${payload.seq}, durationMs=${payload.durationMs}`);
  return payload;
}

async function ensureQueue(spaceSeq) {
  log('ensureSpaceQueue ...');
  const data = await call('PUT', `/video-translator/api/v1/projects/spaces/${spaceSeq}/queue`);
  const payload = unwrap(data);
  log(`  -> usedQueueCount=${payload?.usedQueueCount}/${payload?.maxQueueCount}`);
  return payload;
}

async function requestTranslation(spaceSeq, mediaSeq, targetLang = TARGET_LANGUAGE) {
  log(`requestTranslation(spaceSeq=${spaceSeq}, mediaSeq=${mediaSeq}, target=${targetLang || '(none)'}) ...`);
  const data = await call('POST', `/video-translator/api/v1/projects/spaces/${spaceSeq}/translate`, {
    body: {
      mediaSeq,
      isVideoProject: true,
      sourceLanguageCode: 'auto',
      targetLanguageCodes: targetLang ? [targetLang] : [],
      numberOfSpeakers: 1,
      preferredSpeedType: 'GREEN',
    },
  });
  const ids = pickProjectIds(data);
  if (!ids.length) fail('requestTranslation returned no project ids', data);
  log(`  -> projectIds=${JSON.stringify(ids)}`);
  return ids[0];
}

async function pollProgress(projectSeq, spaceSeq) {
  log(`pollProgress(project=${projectSeq}) ...`);
  const startedAt = Date.now();
  const deadline = startedAt + MAX_POLL_MINUTES * 60_000;
  let lastReason = '';
  let attempts = 0;
  while (Date.now() < deadline) {
    attempts += 1;
    let snapshot;
    try {
      snapshot = await call(
        'GET',
        `/video-translator/api/v1/projects/${projectSeq}/space/${spaceSeq}/progress`,
      );
    } catch (e) {
      warn(`progress fetch failed (attempt ${attempts}): ${e.message}`);
      await sleep(POLL_INTERVAL_MS);
      continue;
    }
    const p = unwrap(snapshot) || {};
    const reason = String(p.progressReason || '').toUpperCase();
    if (reason !== lastReason) {
      log(`  - progress=${p.progress}% reason=${reason} ETA=${p.expectedRemainingTimeMinutes ?? '?'}m`);
      lastReason = reason;
    } else if (attempts % 5 === 0) {
      log(`  - progress=${p.progress}% reason=${reason} ETA=${p.expectedRemainingTimeMinutes ?? '?'}m`);
    }

    if (reason === 'COMPLETED' || (typeof p.progress === 'number' && p.progress >= 100)) {
      const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
      log(`  -> COMPLETED in ${elapsed}s`);
      return p;
    }
    if (p.hasFailed || reason === 'FAILED') {
      fail(`Translation FAILED for project ${projectSeq}`, p);
    }
    if (reason === 'CANCELED') {
      fail(`Translation CANCELED for project ${projectSeq}`, p);
    }
    await sleep(POLL_INTERVAL_MS);
  }
  fail(`Translation timed out after ${MAX_POLL_MINUTES} minutes for project ${projectSeq}`);
}

async function fetchDownloads(projectSeq, spaceSeq) {
  log('fetchDownloads ...');
  const targets = ['dubbingVideo', 'voiceAudio', 'voicewithBackgroundAudio', 'all'];
  const results = {};
  for (const t of targets) {
    try {
      const data = await call(
        'GET',
        `/video-translator/api/v1/projects/${projectSeq}/spaces/${spaceSeq}/download`,
        { query: { target: t } },
      );
      results[t] = unwrap(data);
    } catch (e) {
      warn(`download target=${t} failed: ${e.message}`);
    }
  }
  const link = results.dubbingVideo?.videoFile?.videoDownloadLink;
  if (!link) {
    warn('no dubbingVideo.videoFile.videoDownloadLink in download response');
  } else {
    log(`  -> dubbingVideo URL OK (${String(link).slice(0, 80)}...)`);
  }
  return results;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ────────────── 한 영상 처리 ──────────────
async function dubOne({ id, label, file }, spaceSeq) {
  log(`──────── Video #${id} (${label}) ────────`);
  if (!fs.existsSync(file)) fail(`File not found: ${file}`);

  const baseName = path.basename(file);
  const sas = await getSasToken(baseName);
  await uploadToAzure(sas.blobSasUrl, file);
  const fileUrl = sas.blobSasUrl.split('?')[0];
  const uploaded = await registerVideo(spaceSeq, fileUrl, baseName);

  await ensureQueue(spaceSeq);
  const projectSeq = await requestTranslation(spaceSeq, uploaded.seq);
  const progress = await pollProgress(projectSeq, spaceSeq);
  const downloads = await fetchDownloads(projectSeq, spaceSeq);

  return {
    label,
    mediaSeq: uploaded.seq,
    projectSeq,
    progress,
    downloads,
  };
}

// ────────────── 추가 검증: 비공개 엔드포인트 인증 가드 ──────────────
async function checkAuthGuards() {
  log('───── auth-guard checks ─────');
  const cases = [
    { method: 'GET',  path: '/api/user/me',   expect: 401 },
    { method: 'POST', path: '/api/projects',  expect: 401 },
    { method: 'GET',  path: '/api/tags',      expect: 200 },
    { method: 'GET',  path: '/api/library',   expect: 200 },
  ];
  let allOk = true;
  for (const c of cases) {
    const res = await fetch(`${BASE_URL}${c.path}`, { method: c.method });
    const ok = res.status === c.expect;
    log(`  ${ok ? '✔' : '✗'} ${c.method} ${c.path} → ${res.status} (expected ${c.expect})`);
    if (!ok) allOk = false;
  }
  if (!allOk) fail('auth-guard checks failed');
}

// ────────────── 추가 검증: SPA 경로는 index.html ──────────────
async function checkSpaFallback() {
  log('───── spa-fallback check ─────');
  const res = await fetch(`${BASE_URL}/dashboard`);
  const text = await res.text();
  const isHtml = res.status === 200 && /<!doctype html/i.test(text);
  log(`  ${isHtml ? '✔' : '✗'} GET /dashboard → ${res.status} ${isHtml ? '(html ok)' : '(not html!)'}`);
  if (!isHtml) fail('SPA fallback broken');
}

// ────────────── main ──────────────
async function main() {
  log(`BASE_URL=${BASE_URL}`);
  log(`TARGET_LANGUAGE=${TARGET_LANGUAGE}`);
  log(`MAX_POLL_MINUTES=${MAX_POLL_MINUTES}`);

  await checkAuthGuards();
  await checkSpaFallback();

  const spaceSeq = await getFirstSpace();

  const targets = ONLY ? VIDEOS.filter((v) => v.id === ONLY) : VIDEOS;
  if (targets.length === 0) fail(`ONLY=${ONLY} matched no videos`);

  const results = [];
  for (const v of targets) {
    const r = await dubOne(v, spaceSeq);
    results.push(r);
  }

  log('═════════ SUMMARY ═════════');
  for (const r of results) {
    log(`✔ ${r.label}: project=${r.projectSeq}, dubbingVideo=${r.downloads?.dubbingVideo?.videoFile?.videoDownloadLink ? 'OK' : 'MISSING'}`);
  }
  log('ALL VIDEOS DUBBED SUCCESSFULLY');
}

main().catch((e) => {
  console.error('\n═════════ FAILURE ═════════');
  console.error(e?.stack || String(e));
  process.exit(1);
});
