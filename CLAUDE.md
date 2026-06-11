# ApplyAI Extension — Claude Master Instructions
> Version: 1.0 | Last updated: Jun 11, 2026
> Read this file every session. EVERY rule is MANDATORY.

---

## THE GUARANTEE

> ✅ DONE = Code written + Docs updated + Committed + CHANGE RECEIPT printed
> ❌ NOT DONE = Code written but docs not yet updated

---

## ROLE
Same 8 roles as backend: Developer, Architect, DB Designer, PM, Scrum Master, Tester, Tech Lead, Documentation Owner.

---

## FILE INDEX

| Question | File |
|----------|------|
| What's built? What files exist? | `PROJECT_STATE.md` |
| What's next? Any blockers? | `BUILD_LOG.md` |
| How does the extension work? Message flows? | `ARCHITECTURE.md` |
| What does each screen/component do? | `PROJECT_STATE.md` → Components section |

---

## SESSION START PROTOCOL

```
STEP 1 → Read PROJECT_STATE.md
STEP 2 → Read BUILD_LOG.md → CURRENT STATUS
STEP 3 → Identify change type (Feature / Bug / Tech / Architecture)
STEP 4 → Check dependencies — all must be ✅ before building
STEP 5 → Build
STEP 6 → Update docs (Scenario A–H checklist)
STEP 7 → Print CHANGE RECEIPT
STEP 8 → git add . && git commit && git push
```

---

## SCENARIO CHECKLISTS

### SCENARIO A — Feature Built

```
□ PROJECT_STATE.md → FEATURE STATUS: mark ✅, set version, set tested
□ PROJECT_STATE.md → FILES THAT EXIST: add new files + what they do
□ PROJECT_STATE.md → CURRENT BUILD PHASE: update Active Day

□ BUILD_LOG.md → MASTER PROGRESS TRACKER: mark ✅, set version, date, tested
□ BUILD_LOG.md → session entry: What built, Files created, Commit, Status
□ BUILD_LOG.md → CURRENT STATUS: update Next to build + Last push
```

### SCENARIO B — Feature Modified
```
□ PROJECT_STATE.md → FILES THAT EXIST: update description if changed
□ BUILD_LOG.md → session entry: describe what changed and why
□ BUILD_LOG.md → CURRENT STATUS: update Last push
□ ARCHITECTURE.md → if message flow or module responsibility changed: update
```

### SCENARIO F — Bug Found
```
□ Assign ID: BUG-001, BUG-002, etc.
□ BUILD_LOG.md → OPEN BUGS: add row
□ PROJECT_STATE.md → KNOWN ISSUES: add row
□ If fixable immediately: fix + run Scenario G
```

### SCENARIO G — Bug Fixed
```
□ BUILD_LOG.md → OPEN BUGS: mark FIXED, add date + fix description
□ PROJECT_STATE.md → KNOWN ISSUES: mark FIXED
```

### SCENARIO H — "What's Next?" asked
```
□ Read PROJECT_STATE.md → CURRENT BUILD PHASE + FEATURE STATUS
□ Read BUILD_LOG.md → CURRENT STATUS
□ Report: Last completed / Next to build / Blocked on / Open bugs
```

---

## CHANGE RECEIPT — PRINTED AFTER EVERY RESPONSE THAT TOUCHES CODE OR DOCS

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHANGE RECEIPT — [date]
Scenario: [A/B/C/D/E/F/G/H] — [name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Code changes:
  ✅ [file] — [what changed]

Docs updated:
  ✅ PROJECT_STATE.md — [what changed]
  ✅ BUILD_LOG.md — [what changed]
  ✅ ARCHITECTURE.md — [what changed]  ← if changed

Docs NOT changed (and why):
  — ARCHITECTURE.md: no structural changes

Committed: [hash] — [message]
Next to build: E[N] — [feature name]
Blocked on: [anything] or "Nothing — ready"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## CODE STANDARDS (NON-NEGOTIABLE)

- **TypeScript strict mode** — no `any`, no `!` non-null assertions without a comment
- **Manifest V3 only** — no persistent background pages, use service worker + `chrome.alarms`
- **Content scripts must be IIFEs** — wrap in `(function applyaiXxx() { ... })()` and guard against double-injection with `[data-applyai]` attribute check
- **No hardcoded secrets** — use `.env` + `import.meta.env.VITE_*`
- **No inline OAuth tokens** — JWT lives only in `chrome.storage.local`, never in DOM
- **All API calls go through `src/api/apiClient.ts`** — never raw `fetch` in components or content scripts
- **chrome.storage, not localStorage** — localStorage is per-tab and not shared with service worker
- **React only in popup** — content scripts use vanilla TypeScript (no React, no imports from react)
- **IIFE + self-contained** — content scripts cannot import from `src/` at runtime; copy any shared logic inline or use `chrome.runtime.sendMessage` to delegate to background worker

---

## PROJECT IDENTITY

| Item | Value |
|------|-------|
| App | ApplyAI Extension |
| Stack | TypeScript, React 18, Vite 5, CRXJS v2, Manifest V3 |
| Backend | https://applyai-backend-production-3b67.up.railway.app |
| GitHub | https://github.com/itzmuthuhere/applyai-extension |
| Local | D:\applyai-extension |
| Deploy | `npm run build` → ZIP `dist/` → Chrome Web Store |
| Builder | Muthu, 26, Java Dev at Bank of America |
