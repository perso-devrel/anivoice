# Iteration 133 — perf: lazy load thumbnail images

## BACKLOG item
Self-generated (P2 performance): thumbnail images in DashboardPage and LibraryPage loaded eagerly, causing unnecessary network requests for off-screen content.

## Root cause / hypothesis
The `<img>` tags for project thumbnails had no `loading` or `decoding` attributes. On pages with many projects, all thumbnails load simultaneously regardless of viewport position.

## Changes
- `src/pages/DashboardPage.tsx` — added `loading="lazy"` and `decoding="async"` to thumbnail `<img>`
- `src/pages/LibraryPage.tsx` — added `loading="lazy"` and `decoding="async"` to thumbnail `<img>`

## Verification
- `npm run build` — pass (257KB main bundle, unchanged)
- `npx vitest run` — 376 tests pass
- `dub-flow.mjs` — exit 77 (Perso API upstream 500, not a code regression)

## PR chain
- Issue: #373
- develop PR: #374 (squash merged)
- main PR: #375 (merge committed)

## Notes for next loop
- Perso API still returning 500 on `/portal/api/v1/spaces` — exit 77 continues
- dub-flow regression not possible until upstream recovers
- All P0/P1/P2 items complete; next iteration should self-generate from remaining opportunities
