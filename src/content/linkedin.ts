// E4: LinkedIn Easy Apply content script
import { injectApplyButton } from './shared/overlay';
import { recordApplication } from './shared/messaging';

(function applyaiLinkedIn() {
  if (document.querySelector('[data-applyai]')) return;
  document.documentElement.setAttribute('data-applyai', 'linkedin');

  let lastUrl = location.href;
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      document.getElementById('applyai-btn')?.remove();
      document.getElementById('applyai-overlay')?.remove();
      setTimeout(init, 800);
    }
  });
  observer.observe(document, { subtree: true, childList: true });

  setTimeout(init, 1200);

  function init() {
    if (!isJobPage()) return;
    waitForElement('.jobs-apply-button--top-card, [data-job-id]', 3000).then(tryInject);
  }

  function isJobPage(): boolean {
    return /linkedin\.com\/jobs\/(view|search)/.test(location.href);
  }

  function tryInject() {
    if (document.getElementById('applyai-btn')) return;

    // Find the Easy Apply button (LinkedIn renders it with several possible selectors)
    const easyApplyBtn =
      document.querySelector<HTMLElement>('button.jobs-apply-button') ??
      document.querySelector<HTMLElement>('[aria-label*="Easy Apply"]') ??
      document.querySelector<HTMLElement>('.jobs-s-apply button');

    if (!easyApplyBtn) return;

    const jobTitle =
      document.querySelector('.job-details-jobs-unified-top-card__job-title')?.textContent?.trim() ??
      document.querySelector('.jobs-unified-top-card__job-title')?.textContent?.trim() ??
      document.title.split(' | ')[0] ?? 'This job';

    const company =
      document.querySelector('.job-details-jobs-unified-top-card__company-name')?.textContent?.trim() ??
      document.querySelector('.jobs-unified-top-card__company-name')?.textContent?.trim() ?? '';

    const jobId = extractJobId();

    injectApplyButton(easyApplyBtn, {
      jobId,
      jobTitle,
      company,
      onApplyClick: async (resumeId, user) => {
        await fillAndSubmitLinkedIn(easyApplyBtn, user);
        const result = await recordApplication({ jobId, resumeId });
        if (!result.ok) throw new Error(result.error ?? 'Failed to record application');
      },
    });
  }

  async function fillAndSubmitLinkedIn(easyApplyBtn: HTMLElement, user: { name: string; email: string }) {
    // Click the native Easy Apply button to open the modal
    easyApplyBtn.click();

    // Wait for modal to open
    const modal = await waitForElement('.jobs-easy-apply-content, .artdeco-modal__content', 3000);
    if (!modal) throw new Error('Easy Apply modal did not open');

    await sleep(600);

    // Fill visible text fields in the current step
    fillField(modal, '[id*="easyApplyFormElement"][type="text"]:first-of-type, input[name*="firstName"], [aria-label*="First name"]', nameFirst(user.name));
    fillField(modal, 'input[name*="lastName"], [aria-label*="Last name"]', nameLast(user.name));
    fillField(modal, 'input[type="email"], [aria-label*="Email"]', user.email);
    fillPhoneField(modal);

    // Click through steps until Submit button appears
    await clickThroughSteps(modal);
  }

  async function clickThroughSteps(modal: Element, maxSteps = 8) {
    for (let i = 0; i < maxSteps; i++) {
      await sleep(500);
      const submitBtn = modal.querySelector<HTMLElement>('button[aria-label="Submit application"]');
      if (submitBtn) { submitBtn.click(); return; }

      const nextBtn =
        modal.querySelector<HTMLElement>('button[aria-label="Continue to next step"]') ??
        modal.querySelector<HTMLElement>('footer button.artdeco-button--primary');
      if (nextBtn) { nextBtn.click(); } else { return; }
    }
  }

  function fillField(root: Element, selector: string, value: string) {
    const el = root.querySelector<HTMLInputElement>(selector);
    if (!el || el.value) return;
    nativeInputSet(el, value);
  }

  function fillPhoneField(root: Element) {
    const phone = root.querySelector<HTMLInputElement>('[id*="phoneNumber"], input[type="tel"], [aria-label*="Phone"]');
    if (phone && !phone.value) nativeInputSet(phone, '');
  }

  function extractJobId(): number {
    const match = location.href.match(/\/jobs\/view\/(\d+)/);
    if (match) return parseInt(match[1]);
    const el = document.querySelector<HTMLElement>('[data-job-id]');
    return el ? parseInt(el.dataset.jobId ?? '0') : 0;
  }
})();

// ── helpers ──────────────────────────────────────────────────────────────────

function waitForElement(selector: string, timeoutMs: number): Promise<Element | null> {
  return new Promise((resolve) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);
    const obs = new MutationObserver(() => {
      const found = document.querySelector(selector);
      if (found) { obs.disconnect(); resolve(found); }
    });
    obs.observe(document.body, { subtree: true, childList: true });
    setTimeout(() => { obs.disconnect(); resolve(null); }, timeoutMs);
  });
}

function nativeInputSet(el: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
  setter?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

function nameFirst(full: string): string { return full.split(' ')[0] ?? full; }
function nameLast(full: string): string { const p = full.split(' '); return p.length > 1 ? p.slice(1).join(' ') : ''; }
function sleep(ms: number): Promise<void> { return new Promise((r) => setTimeout(r, ms)); }
