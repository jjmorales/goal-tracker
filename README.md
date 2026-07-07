# The Chain

Daily non-negotiables and streak tracking, tied to your bigger goals. Data lives in this repo as a JSON file, edited directly via the GitHub API — no backend required.

## Features

- **Today** — check off daily non-negotiables, track streaks for habits you're avoiding, and step back/forward through past days to fill in or correct a missed entry.
- **Week** — a 7-day grid of every task so you can spot gaps at a glance.
- **Goals** — longer-term metrics (e.g. "Run a 5k under 35:00") with a progress bar, a history chart, and a log of past values. Tasks can optionally link to a goal for display purposes.
- **Manage** — add, edit, or remove goals and tasks.
- Installable as a PWA (add to home screen) for a full-screen, app-like experience with an offline-capable shell.

## Setup

1. **Fork or create this repo on GitHub** (public or private both work).
2. **Update the repo constants**: in `index.html`, set `REPO_OWNER` and `REPO_NAME` (near `connectGitHub`) to your GitHub username and this repo's name. `REPO_DATA_PATH` defaults to `data/tracker.json` — the app creates this file automatically on first connect.
3. **Push all these files** to the root of the repo.
4. **Enable GitHub Pages**: Settings → Pages → Deploy from branch → `main` / root.
5. **Generate a Personal Access Token**: GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens. Scope it to *this repo only*, with **Contents: Read and write** permission.
6. Visit your Pages URL (e.g. `https://yourname.github.io/the-chain/`), and on first load paste in the token from step 5.

## Files

- `index.html` — the app itself
- `manifest.json` / `sw.js` / `icon-*.png` — PWA support, so it can be added to your phone's home screen and opens full-screen
- `data/tracker.json` — created automatically on first run; holds your goals, tasks, and daily logs

## Notes

- A fine-grained token scoped to just this repo is safer than a classic token with full repo access.
- The service worker only caches the app shell (HTML/CSS/JS/icons) — your actual tracker data always comes fresh from GitHub, never from a stale cache.
- Every change (checking off a task, logging a goal value, editing tasks/goals) is saved automatically ~600ms after you stop making changes, creating a real commit in your data repo each time.
- The GitHub token is stored in your browser's `localStorage` in plaintext and sent directly to `api.github.com` — this is a deliberate tradeoff of the no-backend design, so only use a token scoped to this one repo.
- Using the app from two tabs/devices at once can conflict: if both save around the same time, the second save will fail with a conflict error — click retry (it will pick up the latest state and try again).
