// E7: Workday ATS content script — *.myworkdayjobs.com
import { injectApplyButton } from './shared/overlay';
import { recordApplication } from './shared/messaging';

(function applyaiWorkday() {
  if (document.querySelector('[data-applyai]')) return;
  document.documentElement.setAttribute('data-applyai', 'workday');

  // Workday is a heavy React SPA — wait longer for render
  setTimeout(init, 2000);

  function init() {
    const applyBtn =
      document.querySelector<HTMLElement>('[data-automation-id="applyNowButton"] button') ??
      document.querySelector<HTMLElement>('button[data-automation-id="applyNowButton"]') ??
      document.querySelector<HTMLElement>('[class*="css-"] button[type="button"]');

    if (!applyBtn) { setTimeout(init, 2000); return; }

    const jobTitle =
      document.querySelector<HTMLElement>('[data-automation-id="jobPostingHeader"]')?.textContent?.trim() ??
      document.querySelector<HTMLElement>('h1[class*="css-"]')?.textContent?.trim() ??
      document.title.split(' - ')[0] ?? 'This job';

    const company =
      document.querySelector<HTMLElement>('[data-automation-id="jobPostingCompanyName"]')?.textContent?.trim() ??
      location.hostname.replace('.myworkdayjobs.com', '') ?? '';

    const jobId = extractJobId();

    injectApplyButton(applyBtn, {
      jobId,
      jobTitle,
      company,
      onApplyClick: async (resumeId, user) => {
        await fillWorkdayForm(applyBtn, user);
        const result = await recordApplication({ jobId, resumeId });
        if (!result.ok) throw new Error(result.error ?? 'Failed to record application');
      },
    });
  }

  async function fillWorkdayForm(applyBtn: HTMLElement, user: { name: string; email: string }) {
    applyBtn.click();
    await sleep(2000);

    // Workday first asks to create account or sign in — fill email
    fillReact('[data-automation-id="email"], input[type="email"]', user.email);
    fillReact('[data-automation-id="firstName"], input[placeholder*="First"]', nameFirst(user.name));
    fillReact('[data-automation-id="lastName"], input[placeholder*="Last"]', nameLast(user.name));
    fillReact('[data-automation-id="phone"], input[type="tel"]', '');
  }

  function fillReact(selector: string, value: string) {
    const el = document.querySelector<HTMLInputElement>(selector);
    if (!el || el.value) return;
    // Workday uses React — must use the React synthetic event setter
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    setter?.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  function extractJobId(): number {
    const match = location.href.match(/\/job\/[^/]+\/(\d+)/);
    if (match) return parseInt(match[1]);
    return Math.abs(location.pathname.split('').reduce((a, c) => (a << 5) - a + c.charCodeAt(0), 0)) % 1000000;
  }
})();

function nameFirst(full: string): string { return full.split(' ')[0] ?? full; }
function nameLast(full: string): string { const p = full.split(' '); return p.length > 1 ? p.slice(1).join(' ') : ''; }
function sleep(ms: number): Promise<void> { return new Promise((r) => setTimeout(r, ms)); }
