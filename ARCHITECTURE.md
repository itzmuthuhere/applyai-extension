# ApplyAI Extension — Architecture
> Version: 1.0 | Last updated: Jun 11, 2026

---

## OVERVIEW

The extension is a Manifest V3 Chrome extension that acts as the "apply engine" for ApplyAI.
It runs inside the user's own browser session — no headless browser, no bot detection risk.

---

## MODULE BREAKDOWN

| Module | File(s) | Responsibility |
|--------|---------|---------------|
| Background service worker | `src/background/service-worker.ts` | Holds JWT, syncs job queue hourly, records applications to backend, handles messages from content scripts |
| Storage layer | `src/storage/storage.ts` | Typed wrappers over `chrome.storage.local` — JWT, user, job queue, settings |
| API client | `src/api/apiClient.ts` | Authenticated fetch wrapper for backend calls — used by service worker only (content scripts delegate via messages) |
| Popup (React) | `src/popup/` | Login screen + active dashboard — user-facing UI in the extension action button |
| Content scripts | `src/content/*.ts` | Injected into job portal pages — detect job pages, inject ApplyAI button/sidebar, fill forms, message service worker to record applications |
| Types | `src/types/index.ts` | Shared TypeScript interfaces across all modules |

---

## MESSAGE PASSING ARCHITECTURE

```
Content Script (job portal page)
        │
        │  chrome.runtime.sendMessage({ type: 'RECORD_APPLICATION', payload: { jobId, resumeId } })
        ▼
Background Service Worker
        │
        │  applyaiApi.post('/api/applications/apply', payload, jwt)
        ▼
Backend API (Railway)
```

Content scripts NEVER make direct API calls. They always delegate to the service worker via `chrome.runtime.sendMessage`. This keeps the JWT in one place (service worker / chrome.storage.local) and avoids CORS issues from content script context.

---

## DATA FLOW — APPLY FLOW (Supervised Mode)

```
1. User visits LinkedIn/Naukri/Indeed job page
2. Content script detects job page (URL pattern + DOM check)
3. Content script injects "Apply with ApplyAI" floating button
4. User clicks button
5. Content script sends GET_JWT message → service worker returns JWT
6. Content script fetches user's resumes from backend (or reads from storage)
7. Content script shows resume picker overlay
8. User selects resume → content script fills application form fields
9. User reviews + clicks "Submit"
10. Content script sends RECORD_APPLICATION message → service worker POSTs to /api/applications/apply
11. Application appears in mobile app tracker
```

---

## DATA FLOW — APPLY FLOW (Autopilot Mode)

Same as supervised, except:
- Step 4: no user click — content script fires automatically on page load if job matches user's minimum match score threshold
- Step 9: auto-submits without user review

---

## CHROME STORAGE SCHEMA

| Key | Type | Set by | Read by |
|-----|------|--------|---------|
| `jwt` | string | Popup (E2 OAuth flow) | Service worker, content scripts (via message) |
| `user` | StoredUser | Popup (E2 after login) | Popup dashboard |
| `jobQueue` | Job[] | Service worker (hourly sync) | Popup (E3) |
| `autoApplyMode` | 'supervised' \| 'autopilot' | Popup settings (E3) | Content scripts (via message) |

---

## CONTENT SCRIPT INJECTION RULES

1. **IIFE wrapper** — every content script is wrapped in `(function applyaiXxx() { ... })()`
2. **Double-injection guard** — first line checks `document.querySelector('[data-applyai]')` and returns if found; sets attribute immediately after
3. **No shared imports** — content scripts are standalone bundles; no imports from `src/api` or `src/storage`; all backend calls go through `chrome.runtime.sendMessage`
4. **Minimal DOM footprint** — inject only what's needed; remove injected elements on navigation away

---

## BUILD OUTPUT

```
dist/
├── manifest.json          ← transformed by CRXJS
├── service-worker.js      ← bundled background worker
├── popup/
│   └── index.html         ← React popup bundle
├── content/
│   ├── linkedin.js
│   ├── naukri.js
│   ├── indeed.js
│   ├── workday.js
│   ├── greenhouse.js
│   └── lever.js
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

ZIP the entire `dist/` folder for Chrome Web Store submission.

---

## ADR LOG

| # | Decision | Reason |
|---|----------|--------|
| 1 | Manifest V3 (not V2) | Chrome requires MV3 for all new extensions from 2024 onward |
| 2 | CRXJS v2 Vite plugin | Best DX for MV3 — handles content script HMR, manifest transformation, popup routing |
| 3 | React in popup only | Content scripts must be lightweight, no framework conflicts with host page |
| 4 | Content scripts delegate API calls to service worker | JWT stays in one place; avoids CORS from content script context; simpler auth flow |
| 5 | chrome.storage.local (not localStorage) | Shared across popup + service worker; localStorage is tab-scoped only |
