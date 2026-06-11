# ApplyAI Extension — Build Log
> Accountability log for every session.

---

## MASTER PROGRESS TRACKER

| Day | Feature | Status | Version | Date | Tested |
|-----|---------|--------|---------|------|--------|
| E1 | Project scaffold | ✅ Complete | v1.0 | Jun 11, 2026 | ⬜ Pending load test |
| E2 | Auth + profile sync | ✅ Complete | v1.0 | Jun 11, 2026 | ⬜ Needs OAuth client (ACTION_REQUIRED_E2) |
| E3 | Popup UI | ✅ Complete | v1.0 | Jun 11, 2026 | ⬜ Pending device test |
| E4 | LinkedIn Easy Apply | ✅ Complete | v1.0 | Jun 11, 2026 | ⬜ Pending live test |
| E5 | Naukri.com | ✅ Complete | v1.0 | Jun 11, 2026 | ⬜ Pending live test |
| E6 | Indeed.com | ✅ Complete | v1.0 | Jun 11, 2026 | ⬜ Pending live test |
| E7 | Workday + Greenhouse + Lever | ✅ Complete | v1.0 | Jun 11, 2026 | ⬜ Pending live test |
| E8 | App tracking + autopilot mode | ✅ Complete | v1.0 | Jun 11, 2026 | ⬜ Pending live test |

---

## OPEN BUGS

| ID | Description | Day | Opened | Status |
|----|-------------|-----|--------|--------|
| — | None yet | — | — | — |

---

## CURRENT STATUS

**Next to build:** Live testing on portals
**Blocked on:** ACTION_REQUIRED_E2 — need Google OAuth Client ID before sign-in works
**Open bugs:** None
**Last push:** Jun 11, 2026 (E2–E8 complete)
**Resume point:** ALL features built. Blocked on ACTION_REQUIRED_E2 (Google OAuth client setup in Cloud Console). Once done: rebuild, reload extension, test sign-in, then live-test each portal.

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
