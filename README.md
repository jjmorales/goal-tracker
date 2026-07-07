# The Chain

Daily non-negotiables and streak tracking, tied to your bigger goals. Data lives in this repo as a JSON file, edited directly via the GitHub API — no backend required.

## Setup

1. **Create this repo on GitHub** (public or private both work).
2. **Push all these files** to the root of the repo.
3. **Enable GitHub Pages**: Settings → Pages → Deploy from branch → `main` / root.
4. **Generate a Personal Access Token**: GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens. Scope it to *this repo only*, with **Contents: Read and write** permission.
5. Visit your Pages URL (e.g. `https://yourname.github.io/the-chain/`), and on first load enter:
   - The token from step 4
   - Your GitHub username (repo owner)
   - This repo's name
   - Data path: `data/tracker.json` (default — the app creates this file automatically on first connect)

## Files

- `index.html` — the app itself
- `manifest.json` / `sw.js` / `icon-*.png` — PWA support, so it can be added to your phone's home screen and opens full-screen
- `data/tracker.json` — created automatically on first run; holds your goals, tasks, and daily logs

## Notes

- A fine-grained token scoped to just this repo is safer than a classic token with full repo access.
- The service worker only caches the app shell (HTML/CSS/JS/icons) — your actual tracker data always comes fresh from GitHub, never from a stale cache.
