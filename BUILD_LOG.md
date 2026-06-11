# ApplyAI Extension — Build Log
> Accountability log for every session.

---

## MASTER PROGRESS TRACKER

| Day | Feature | Status | Version | Date | Tested |
|-----|---------|--------|---------|------|--------|
| E1 | Project scaffold | ✅ Complete | v1.0 | Jun 11, 2026 | ⬜ Pending load test |
| E2 | Auth + profile sync | ✅ Complete | v1.1 | Jun 11, 2026 | ✅ Tested — sign-in works end-to-end |
| E3 | Popup UI | ✅ Complete | v1.1 | Jun 11, 2026 | ✅ Tested — dashboard renders correctly |
| E4 | LinkedIn Easy Apply | ✅ Complete | v1.1 | Jun 11, 2026 | ✅ Tested — button injected in detail panel |
| E5 | Naukri.com | ✅ Complete | v1.1 | Jun 11, 2026 | ✅ Tested — button injected |
| E6 | Indeed.com | ✅ Complete | v1.1 | Jun 11, 2026 | ✅ Tested — button injected (text selector fix) |
| E7 | Workday + Greenhouse + Lever | ✅ Complete | v1.0 | Jun 11, 2026 | ⏸ Workday: maintenance; GH/Lever: BofA blocked |
| E8 | App tracking + autopilot mode | ✅ Complete | v1.0 | Jun 11, 2026 | ⬜ Pending live apply test |

---

## OPEN BUGS

| ID | Description | Day | Opened | Status |
|----|-------------|-----|--------|--------|
| — | None yet | — | — | — |

---

## CURRENT STATUS

**Next to build:** Workday/Greenhouse/Lever live test + end-to-end apply test on LinkedIn
**Blocked on:** Workday: global maintenance. Greenhouse/Lever: BofA managed browser blocks those domains.
**Open bugs:** None
**Last push:** Jun 11, 2026
**Resume point:** Auth + popup fully working. Next: visit each portal with a job posting, confirm "Apply with ApplyAI" button appears, test form-fill and application recording.

---

## SESSION LOGS

---

### SESSION 1 — Jun 11, 2026 [E1: Project Scaffold]
**Type:** Planned (E1)
**Goal:** Full project scaffold — build tooling, source skeleton, doc system

**What was built:**
- `manifest.json` — MV3, 6 host permissions, background SW, popup, 6 content script entries
- `vite.config.ts` — Vite 5 + @vitejs/plugin-react + @crxjs/vite-plugin v2 beta
- `tsconfig.json` — strict TS, ES2020, bundler moduleResolution
- `package.json` — React 18, CRXJS v2 beta.26, @types/chrome 0.0.268, Vite 5
- `src/types/index.ts` — Job, StoredUser, Resume, ApplyPayload, AutoApplyMode, ExtensionMessage interfaces
- `src/storage/storage.ts` — typed chrome.storage.local helpers
- `src/api/apiClient.ts` — fetch wrapper with 402 handling
- `src/background/service-worker.ts` — install alarm, 60-min job sync, message handler
- `src/popup/index.html` + `main.tsx` + `App.tsx` — React popup: login check, LoginScreen, Dashboard
- `src/content/linkedin.ts` + naukri + indeed + workday + greenhouse + lever — IIFE skeletons

**Files created:** 16
**Commit:** (see below)
**Status:** ✅ E1 complete

---

### SESSION 2 — Jun 11, 2026 [E2/E3: Auth + Popup — Live Test + Bug Fixes]
**Type:** Bug Fix + Live Test
**Goal:** Complete ACTION_REQUIRED_E2 (Google OAuth client), test sign-in end-to-end

**What was done:**
- Created new Google Cloud project `applyai-499114` (new project — old project `applyai-47158` was inaccessible)
- Created OAuth 2.0 Web client `ApplyAI Chrome Extension` with redirect URI `https://akeabgbbnljoeejdmffaminjhjdnopdm.chromiumapp.org/oauth2`
- Added `VITE_GOOGLE_CLIENT_ID` to `.env`
- Fixed missing `identity` permission in `manifest.json`
- Added `https://applyai-backend-production-3b67.up.railway.app/*` to `host_permissions`
- Fixed `JobFeedResponse` bug: backend returns `{content, page, size, totalElements}` not a plain array — auth.ts and service-worker.ts now extract `.content`
- Added defensive `Array.isArray` guard in `JobQueueScreen` to prevent future crashes

**Bugs fixed:**
- `Cannot read properties of undefined (reading 'getRedirectURL')` — missing `identity` permission
- `TypeError: e.slice is not a function` — jobQueue stored as object instead of array (backend feed response shape mismatch)

**Result:** Sign-in works end-to-end. Popup shows dashboard with FREE badge, Job Queue tab, Settings tab. All portals active in status bar.

**Files changed:** `manifest.json`, `.env`, `src/popup/auth.ts`, `src/background/service-worker.ts`, `src/popup/JobQueueScreen.tsx`
**Status:** ✅ E2 + E3 live-tested and working
