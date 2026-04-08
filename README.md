# AniVoice

AniVoice is a React + TypeScript + Vite app for dubbing anime clips with the Perso.ai API.

## Perso integration notes

Perso's official documentation requires that `XP-API-KEY` is sent from the server side. The API also rejects browser preflight requests when the key is sent directly from the client, so this project now routes Perso requests through a local Vite proxy at `/api/perso`.

- Official docs: https://developers.perso.ai/api/docs/llm
- API base URL: `https://api.perso.ai`
- File downloads use the Perso service host: `https://perso.ai`

## Environment variables

Create a `.env` file from `.env.example`.

Required for Perso:

- `XP_API_KEY=your_perso_api_key`
- `PERSO_API_BASE_URL=https://api.perso.ai`
- `VITE_PERSO_PROXY_PATH=/api/perso`
- `PERSO_API_PROXY_SECURE=false`

Backward compatibility is kept for older local setups that still use `VITE_PERSO_API_KEY`, but the recommended setup is to keep the Perso key server-side only.

If your local network or antivirus injects a self-signed TLS certificate, keep `PERSO_API_PROXY_SECURE=false` for local development so the Vite proxy can reach `api.perso.ai` without failing certificate validation.

## Development

```bash
npm install
npm run dev
```

The Studio flow now:

1. Lists the user's Perso spaces
2. Uploads the file to Azure Blob Storage using the SAS URL from Perso
3. Initializes the Perso queue for the selected space
4. Requests translation
5. Polls progress until the dub is complete

## Build

```bash
npm run build
npm run preview
```

The proxy is configured for both Vite dev server and Vite preview. If you deploy this app outside Vite, you will still need a server-side proxy or backend route that injects `XP-API-KEY`.

## Known Perso API limitation

If `GET /portal/api/v1/spaces` and `PUT /video-translator/api/v1/projects/spaces/{spaceSeq}/queue` succeed but `PUT /file/api/upload/video` returns `401` or `403`, the current Perso credentials do not have working File API write access. In that case, the app code is not the blocker; the Perso API key or account permissions need to be fixed on the Perso side.
