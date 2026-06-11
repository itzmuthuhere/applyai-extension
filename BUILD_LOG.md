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
| E7 | Workday + Greenhouse + Lever | ✅ Complete | v1.1 | Jun 11, 2026 | ✅ Greenhouse + Lever live-tested Jun 11; ⏸ Workday: maintenance |
| E8 | App tracking + autopilot mode | ✅ Complete | v1.0 | Jun 11, 2026 | ⬜ Pending live apply test |

---

## OPEN BUGS

| ID | Description | Day | Opened | Status |
|----|-------------|-----|--------|--------|
| BUG-E001 | Greenhouse script appeared to not inject on job-boards.greenhouse.io — actually injected fine, but the page fails React hydration and replaces `<html>` ~1s after load, wiping the marker + button. Apply-button selectors also didn't match the new job-boards DOM. | E7 | Jun 11, 2026 | ✅ FIXED Jun 11, 2026 — isolated-world guard + keep-alive re-injection loop + text-based Apply button fallback |

---

## CURRENT STATUS

**Next to build:** End-to-end apply test on LinkedIn (signed-in) + Workday live test when maintenance ends
**Blocked on:** Workday: global maintenance.
**Open bugs:** None
**Last push:** Jun 11, 2026
**Resume point:** Greenhouse (job-boards + boards) and Lever live-verified via automated browser: button injects, survives React re-render, overlay shows correct title/company. Remaining: signed-in apply test (form-fill + RECORD_APPLICATION) on each portal, Workday after maintenance.

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

---

### SESSION 3 — Jun 11, 2026 [BUG-E001: Greenhouse injection + Lever live test]
**Type:** Bug Fix + Live Test
**Goal:** Debug Greenhouse content script "not injecting" on job-boards.greenhouse.io; test Lever

**Root cause investigation (via agent-browser automated Chrome with extension loaded):**
- Disproved the CSP hypothesis: a main-world `import()` of the extension module succeeds on job-boards.greenhouse.io — page CSP does not block `chrome-extension://` imports, and the CRXJS loader is fine
- Mutation-observer timeline proved the script DOES inject: test attr at 310ms (document_start), CRXJS loader at 644ms, `data-applyai="greenhouse"` at 673ms — then ALL attributes gone seconds later with no attribute-removal mutation logged
- Conclusion: job-boards.greenhouse.io is a Next.js app that consistently fails React hydration (its own #418/#423/#425 console errors) and falls back to client rendering, **replacing the entire `<html>` element** — destroying the marker and any injected UI
- Second latent bug: new job-boards DOM has `<button class="btn btn--rounded">Apply</button>` — none of the old selectors (`#apply_now_button`, `.btn--apply`, `button[class*="apply"]`) matched

**Fix (src/content/greenhouse.ts rewrite):**
- Guard moved from DOM attribute to isolated-world flag (`window.__applyaiGreenhouse`)
- Keep-alive loop (1.2s interval): re-asserts `data-applyai` marker, re-injects button when `#applyai-btn` disappears (injectApplyButton already idempotent)
- Apply button: legacy selectors + text-based fallback (`/^apply( now)?$/i` on `<button>`)
- Title: added `h1.section-header` (new boards) + strips "Job Application for " prefix from document.title fallback
- Company: falls back to document.title " at X" suffix, then URL path slug
- Form scroll: added `#application-form` (new boards id; old boards use `#application_form`); field ids `#first_name`/`#last_name`/`#email`/`#phone` unchanged across both generations

**Endpoint test results (live, automated browser):**
- Greenhouse job-boards.greenhouse.io/anthropic/jobs/5023394008: button injected next to native Apply, survives hydration wipe (verified at 8s and 14s, single injection), overlay shows correct title "Anthropic Fellows Program" + company "Anthropic" ✅
- Lever jobs.lever.co/mistral/&lt;uuid&gt;: marker `lever`, button injected under "APPLY FOR THIS JOB", title extracted ✅ (no code change needed — Lever is server-rendered)
- Workday: still in global maintenance, untested

**Files changed:** `src/content/greenhouse.ts`
**Commit:** see below
**Status:** ✅ BUG-E001 fixed; Greenhouse + Lever live-verified
