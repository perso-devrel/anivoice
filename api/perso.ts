import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildTargetUrl, buildForwardHeaders, serializeBody, isHopByHopHeader } from './_lib/proxy.js';
import { verifyFirebaseToken, sendAuthAwareError } from './_lib/auth.js';

const ALLOWED_PATH_PREFIX = /^(portal|video-translator|spaces|files?|projects|dubbing|editing|languages|quota)\b/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await verifyFirebaseToken(req);
  } catch (e) {
    return sendAuthAwareError(res, e);
  }

  // The Perso API key is provided per-request by the client in the `X-Perso-Api-Key` header.
  // It is NOT read from environment variables, written to disk, logged, or persisted in any form —
  // it is forwarded once to Perso as `XP-API-KEY` and discarded when the request ends.
  const headerKey = req.headers['x-perso-api-key'];
  const apiKey = (Array.isArray(headerKey) ? headerKey[0] : headerKey)?.trim();
  const baseUrl = (process.env.PERSO_API_BASE_URL || 'https://api.perso.ai').replace(/\/+$/, '');

  if (!apiKey) {
    return res.status(401).json({
      error: 'Perso API key missing. Provide it in the dubbing settings before starting.',
    });
  }

  const { _path: pathParam, ...restQuery } = req.query as Record<string, string | string[]>;
  const persoPath = Array.isArray(pathParam) ? pathParam[0] : pathParam || '';

  if (persoPath && !ALLOWED_PATH_PREFIX.test(persoPath)) {
    return res.status(400).json({ error: 'Invalid proxy path' });
  }
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
      error: `Perso API proxy request failed: ${message}`,
    });
  }
}
