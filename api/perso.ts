import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Perso API 프록시 서버리스 함수.
 *
 * 클라이언트는 `/api/perso/<perso 경로>` 로 호출하고, vercel.json 의 rewrite 가
 * `/api/perso/(.*)` → `/api/perso?_path=$1` 로 변환하여 이 함수가 호출된다.
 * 여기서 XP-API-KEY 헤더를 주입한 뒤 https://api.perso.ai 로 그대로 전달한다.
 *
 * catch-all 동적 라우트(`[...path].ts`)가 Vercel 빌드에서 정상적으로 잡히지 않는
 * 환경 이슈를 피하기 위해, 명시적 rewrite 와 일반 파일 조합으로 구현.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.XP_API_KEY;
  const baseUrl = (process.env.PERSO_API_BASE_URL || 'https://api.perso.ai').replace(/\/+$/, '');

  if (!apiKey) {
    return res.status(500).json({
      error: 'XP_API_KEY 환경변수가 설정되지 않았습니다. Vercel 환경변수 또는 .env 를 확인하세요.',
    });
  }

  // vercel.json rewrite 가 _path 로 path 부분을 넘겨준다
  const { _path: pathParam, ...restQuery } = req.query as Record<string, string | string[]>;
  const persoPath = Array.isArray(pathParam) ? pathParam[0] : pathParam || '';

  // 나머지 쿼리 파라미터 그대로 전달
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(restQuery)) {
    if (Array.isArray(value)) {
      value.forEach((v) => search.append(key, v));
    } else if (value !== undefined) {
      search.append(key, value);
    }
  }
  const qs = search.toString();
  const targetUrl = qs ? `${baseUrl}/${persoPath}?${qs}` : `${baseUrl}/${persoPath}`;

  // Forward 헤더: XP-API-KEY 주입, content-type 보존
  const forwardHeaders: Record<string, string> = {
    'XP-API-KEY': apiKey,
  };
  const incomingContentType = req.headers['content-type'];
  if (typeof incomingContentType === 'string') {
    forwardHeaders['Content-Type'] = incomingContentType;
  } else if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
    forwardHeaders['Content-Type'] = 'application/json';
  }

  // body 직렬화
  let body: BodyInit | undefined;
  if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
    if (req.body !== undefined && req.body !== null) {
      body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }
  }

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body,
    });

    // hop-by-hop 헤더 제외하고 그대로 전달
    const skipHeaders = new Set([
      'connection',
      'transfer-encoding',
      'content-encoding',
      'content-length',
      'keep-alive',
    ]);
    upstream.headers.forEach((value, key) => {
      if (!skipHeaders.has(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    res.status(upstream.status);
    const text = await upstream.text();
    if (text) res.send(text);
    else res.end();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(502).json({
      error: `Perso API 프록시 요청 실패: ${message}`,
      target: targetUrl,
    });
  }
}
