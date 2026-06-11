// E6: Indeed.com content script
import { injectApplyButton } from './shared/overlay';
import { recordApplication } from './shared/messaging';

(function applyaiIndeed() {
  if (document.querySelector('[data-applyai]')) return;
  document.documentElement.setAttribute('data-applyai', 'indeed');

  setTimeout(init, 1500);

  function init() {
    // Indeed dropped stable IDs — find the primary apply button by text content
    const applyBtn =
      document.querySelector<HTMLElement>('#indeedApplyButton') ??
      document.querySelector<HTMLElement>('[class*="IndeedApplyButton"]') ??
      document.querySelector<HTMLElement>('[data-indeed-apply-jobid]') ??
      Array.from(document.querySelectorAll<HTMLElement>('button')).find(
        (btn) => /^apply\b/i.test(btn.textContent?.trim() ?? '')
      ) ?? null;

    if (!applyBtn) { setTimeout(init, 1500); return; }

    const jobTitle =
      document.querySelector<HTMLElement>('h1.jobsearch-JobInfoHeader-title, [class*="jobTitle"]')?.textContent?.trim() ??
      document.title.split(' - ')[0] ?? 'This job';

    const company =
      document.querySelector<HTMLElement>('[data-testid="inlineHeader-companyName"], [class*="companyName"]')?.textContent?.trim() ?? '';

    const jobId = extractJobId();

    injectApplyButton(applyBtn, {
      jobId,
      jobTitle,
      company,
      onApplyClick: async (resumeId, user) => {
        await fillAndSubmitIndeed(applyBtn, user);
        const result = await recordApplication({ jobId, resumeId });
        if (!result.ok) throw new Error(result.error ?? 'Failed to record application');
      },
    });
  }

  async function fillAndSubmitIndeed(applyBtn: HTMLElement, user: { name: string; email: string }) {
    applyBtn.click();
    await sleep(1500);

    // Indeed Easy Apply opens in an iframe or modal
    const iframe = document.querySelector<HTMLIFrameElement>('iframe[id*="indeed-apply"], iframe[title*="Apply"]');
    const root: Document | Element = iframe?.contentDocument ?? document;

    fillInRoot(root, 'input[name="applicant.name"], input[id*="input-applicant.name"]', user.name);
    fillInRoot(root, 'input[type="email"], input[name*="email"]', user.email);

    await sleep(400);

    const continueBtn = (root as Document).querySelector?.
      ('button[id*="form-action-continue"], button[type="submit"]') as HTMLElement | null ??
      root.querySelector?.('button[type="submit"]') as HTMLElement | null;
    continueBtn?.click();
  }

  function fillInRoot(root: Document | Element, selector: string, value: string) {
    const el = (root as Document).querySelector<HTMLInputElement>(selector) ??
      (root as Element).querySelector<HTMLInputElement>(selector);
    if (!el || el.value) return;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    setter?.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function extractJobId(): number {
    const params = new URLSearchParams(location.search);
    const jk = params.get('jk');
    if (jk) return parseInt(jk.replace(/\D/g, '').slice(0, 9)) || 0;
    const el = document.querySelector<HTMLElement>('[data-indeed-apply-jobid]');
    return el ? parseInt(el.dataset.indeedApplyJobid ?? '0') : 0;
  }
})();

function sleep(ms: number): Promise<void> { return new Promise((r) => setTimeout(r, ms)); }
