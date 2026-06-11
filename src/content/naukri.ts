// E5: Naukri.com content script
import { injectApplyButton } from './shared/overlay';
import { recordApplication } from './shared/messaging';

(function applyaiNaukri() {
  if (document.querySelector('[data-applyai]')) return;
  document.documentElement.setAttribute('data-applyai', 'naukri');

  setTimeout(init, 1500);

  function init() {
    if (!isJobDetailPage()) return;

    const applyBtn =
      document.querySelector<HTMLElement>('#apply-button') ??
      document.querySelector<HTMLElement>('[class*="apply-button"]') ??
      document.querySelector<HTMLElement>('a[href*="apply"], button[class*="Apply"]');

    if (!applyBtn) { setTimeout(init, 1500); return; }

    const jobTitle =
      document.querySelector<HTMLElement>('h1.jd-header-title, [class*="jd-header"] h1')?.textContent?.trim() ??
      document.title.split(' - ')[0] ?? 'This job';

    const company =
      document.querySelector<HTMLElement>('[class*="jd-header-comp-name"], .comp-name')?.textContent?.trim() ?? '';

    const jobId = extractJobId();

    injectApplyButton(applyBtn, {
      jobId,
      jobTitle,
      company,
      onApplyClick: async (resumeId, user) => {
        await fillAndSubmitNaukri(user);
        const result = await recordApplication({ jobId, resumeId });
        if (!result.ok) throw new Error(result.error ?? 'Failed to record application');
      },
    });
  }

  function isJobDetailPage(): boolean {
    return /naukri\.com\/(.*-jobs-.*|job-listings-)/.test(location.href) ||
      !!document.querySelector('#apply-button, [class*="apply-button"]');
  }

  async function fillAndSubmitNaukri(user: { name: string; email: string }) {
    const applyBtn = document.querySelector<HTMLElement>('#apply-button, [class*="apply-button"]');
    applyBtn?.click();

    await sleep(1200);

    // Naukri opens a registration/quick apply modal or page
    const form =
      document.querySelector<HTMLElement>('.naukri-apply-modal, [class*="applyForm"], form[id*="apply"]') ??
      document.body;

    fillInput(form, 'input[name="name"], input[placeholder*="Name"], input[id*="name"]', user.name);
    fillInput(form, 'input[type="email"], input[placeholder*="Email"], input[name="email"]', user.email);

    await sleep(400);
    const submit = form.querySelector<HTMLElement>('button[type="submit"], button[class*="submit"], input[type="submit"]');
    submit?.click();
  }

  function extractJobId(): number {
    const match = location.href.match(/-(\d+)\.htm/) ?? location.href.match(/\/(\d+)\/?$/);
    return match ? parseInt(match[1]) : 0;
  }
})();

function fillInput(root: Element, selector: string, value: string) {
  const el = root.querySelector<HTMLInputElement>(selector);
  if (!el || el.value) return;
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
  setter?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

function sleep(ms: number): Promise<void> { return new Promise((r) => setTimeout(r, ms)); }
