# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"The Chain" — a single-page PWA for tracking daily non-negotiables, habits to avoid, and longer-term goals, with streak/chain visualization. There is no backend and no build step: the entire app is a static site with all logic in one file.

## Development

There is no build, lint, or test tooling — this is intentional (see README: "no backend required"). To work on it:

- Edit [index.html](index.html) directly; it contains all markup, CSS, and JS inline.
- Serve the directory with any static file server (e.g. `npx serve` or the VS Code Live Server extension) and open it in a browser — `file://` won't work correctly for the service worker.
- Test changes manually in the browser; there is no automated test suite.
- To exercise the full data flow during manual testing, connect it to a real (or throwaway) GitHub repo with a fine-grained PAT scoped to that repo, per the setup steps in [README.md](README.md).

## Architecture

**Everything lives in [index.html](index.html)** — styles in a `<style>` block, markup, and all app logic in a single `<script>` block at the bottom. There are no other JS/CSS files and no dependencies to install.

**Storage model**: There is no database or server. App state (`DATA` global: `{ goals, tasks, logs }`) is persisted as a single JSON file (default `data/tracker.json`) committed directly to a GitHub repo via the GitHub Contents API (`ghRequest`/`loadData`/`saveData`). Every save creates a real commit in that repo. Writes are debounced 600ms (`queueSave`) and require tracking the file's blob `sha` between reads/writes to avoid clobbering.

**Auth/config**: On first run the user enters a GitHub PAT + owner/repo/path via the `#setup` screen (`connectGitHub`). Config (including the raw token) is cached in `localStorage` under `chainCfg` so reconnection is automatic on subsequent visits — there is no server-side secret handling since there is no server.

**Data shape**:
- `goals`: `{ id, title, unit, startValue, target, history: [{date, value}] }` — longer-term metrics with a progress bar computed from the latest history entry vs. start/target.
- `tasks`: `{ id, title, type: 'daily'|'avoid', goalId }` — `daily` tasks are non-negotiables checked off each day; `avoid` tasks are streak counters for habits to abstain from. `goalId` optionally links a task to a goal for display purposes only (no automatic goal progress from task completion).
- `logs`: `{ [dateStr]: { [taskId]: true } }` — a sparse map of per-day task completion, keyed by `YYYY-MM-DD` local date strings (see `todayStr`/`dateStrOffset`).

**Streaks** (`getStreak`) are computed on the fly by walking backward day-by-day from today through `logs`; there's no stored/cached streak value. If today isn't logged yet, the walk starts from yesterday so an unfinished today doesn't break the streak display.

**Rendering**: No framework — each tab (`renderToday`, `renderWeek`, `renderGoals`, `renderManage`) does a full innerHTML re-render from `DATA` on every mutation via `renderAll()`, called after any state change followed by `queueSave()`. Tab visibility is toggled by `switchTab` showing/hiding `#tab-*` divs; all four tabs are always rendered into the DOM, just hidden.

**PWA shell**: [manifest.json](manifest.json) and [sw.js](sw.js) provide install-to-home-screen support. The service worker caches only the static app shell (HTML/CSS/JS/icons) with a cache-first strategy — it explicitly bypasses caching for `api.github.com` / `githubusercontent` requests so tracker data is never served stale (see comment in [sw.js](sw.js)). Bump `CACHE_NAME` in sw.js when shipping shell changes that must invalidate old caches.

## Security notes specific to this app

- The GitHub PAT is stored in `localStorage` in plaintext and sent as a bearer token directly from the browser to `api.github.com`. This is a deliberate tradeoff of the "no backend" design (per README), not an oversight — don't "fix" it by adding a backend unless asked.
- User-provided strings (task/goal titles) are rendered via `escapeHtml` before interpolation into HTML — keep using it for any new user-facing string interpolation.
