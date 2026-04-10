import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { path } = req.query;
  const persoPath = Array.isArray(path) ? path.join('/') : path || '';
  const baseUrl = process.env.PERSO_API_BASE_URL || 'https://api.perso.ai';
  const apiKey = process.env.XP_API_KEY;

  const targetUrl = `${baseUrl}/${persoPath}`;
  const query = new URLSearchParams(req.query as Record<string, string>);
  query.delete('path');
  const qs = query.toString();
  const fullUrl = qs ? `${targetUrl}?${qs}` : targetUrl;

  const headers: Record<string, string> = {
    'Content-Type': req.headers['content-type'] || 'application/json',
  };
  if (apiKey) {
    headers['XP-API-KEY'] = apiKey;
  }

  try {
    const fetchOptions: RequestInit = {
      method: req.method || 'GET',
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(fullUrl, fetchOptions);
    const data = await response.text();

    // Forward status and content-type
    res.status(response.status);
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    res.send(data);
  } catch (e) {
    res.status(502).json({ error: e instanceof Error ? e.message : 'Proxy error' });
  }
}
