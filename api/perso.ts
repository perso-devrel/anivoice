import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildTargetUrl, buildForwardHeaders, serializeBody, isHopByHopHeader } from './_lib/proxy';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.XP_API_KEY;
  const baseUrl = (process.env.PERSO_API_BASE_URL || 'https://api.perso.ai').replace(/\/+$/, '');

  if (!apiKey) {
    return res.status(500).json({
      error: 'XP_API_KEY 환경변수가 설정되지 않았습니다. Vercel 환경변수 또는 .env 를 확인하세요.',
    });
  }

  const { _path: pathParam, ...restQuery } = req.query as Record<string, string | string[]>;
  const persoPath = Array.isArray(pathParam) ? pathParam[0] : pathParam || '';
  const targetUrl = buildTargetUrl(baseUrl, persoPath, restQuery);
  const forwardHeaders = buildForwardHeaders(apiKey, req.headers['content-type'] as string | undefined, req.method);
  const body = serializeBody(req.method, req.body);

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body,
    });

    upstream.headers.forEach((value, key) => {
      if (!isHopByHopHeader(key)) {
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
