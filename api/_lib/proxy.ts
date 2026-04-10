const HOP_BY_HOP = new Set([
  'connection',
  'transfer-encoding',
  'content-encoding',
  'content-length',
  'keep-alive',
]);

export function buildTargetUrl(
  baseUrl: string,
  persoPath: string,
  query: Record<string, string | string[]>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      value.forEach((v) => search.append(key, v));
    } else if (value !== undefined) {
      search.append(key, value);
    }
  }
  const qs = search.toString();
  return qs ? `${baseUrl}/${persoPath}?${qs}` : `${baseUrl}/${persoPath}`;
}

export function buildForwardHeaders(
  apiKey: string,
  incomingContentType: string | undefined,
  method: string | undefined,
): Record<string, string> {
  const headers: Record<string, string> = { 'XP-API-KEY': apiKey };
  if (typeof incomingContentType === 'string') {
    headers['Content-Type'] = incomingContentType;
  } else if (method && method !== 'GET' && method !== 'HEAD') {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

export function serializeBody(
  method: string | undefined,
  body: unknown,
): string | undefined {
  if (!method || method === 'GET' || method === 'HEAD') return undefined;
  if (body === undefined || body === null) return undefined;
  return typeof body === 'string' ? body : JSON.stringify(body);
}

export function isHopByHopHeader(key: string): boolean {
  return HOP_BY_HOP.has(key.toLowerCase());
}
