// E7: Greenhouse ATS content script — boards.greenhouse.io + job-boards.greenhouse.io
import { injectApplyButton } from './shared/overlay';
import { recordApplication } from './shared/messaging';

(function applyaiGreenhouse() {
  // Guard lives in the isolated world, not the DOM: job-boards.greenhouse.io fails
  // React hydration and re-renders the entire <html> element ~1s after load, wiping
  // any DOM markers and injected UI. The keep-alive loop below re-asserts both.
  const w = window as unknown as { __applyaiGreenhouse?: boolean };
  if (w.__applyaiGreenhouse) return;
  w.__applyaiGreenhouse = true;

  tick();
  setInterval(tick, 1200);

  function tick() {
    document.documentElement.setAttribute('data-applyai', 'greenhouse');
    if (!document.getElementById('applyai-btn')) inject();
  }

  function inject() {
    const applyBtn = findApplyButton();
    if (!applyBtn) return;

    const jobId = extractJobId();
    injectApplyButton(applyBtn, {
      jobId,
      jobTitle: extractTitle(),
      company: extractCompany(),
      onApplyClick: async (resumeId, user) => {
        fillGreenhouseForm(user);
        const result = await recordApplication({ jobId, resumeId });
        if (!result.ok) throw new Error(result.error ?? 'Failed to record application');
      },
    });
  }

  function findApplyButton(): HTMLElement | null {
    // Old boards.greenhouse.io layout
    const legacy =
      document.querySelector<HTMLElement>('#apply_now_button') ??
      document.querySelector<HTMLElement>('a[href*="#app"]') ??
      document.querySelector<HTMLElement>('.btn--apply, button[class*="apply"]');
    if (legacy) return legacy;

    // New job-boards.greenhouse.io layout: plain <button class="btn btn--rounded">Apply</button>
    for (const btn of Array.from(document.querySelectorAll<HTMLElement>('button'))) {
      if (/^apply( now)?$/i.test(btn.textContent?.trim() ?? '')) return btn;
    }
    return null;
  }

  function extractTitle(): string {
    const fromDom = document
      .querySelector<HTMLElement>('h1.app-title, h1.section-header, h1[class*="title"], h1')
      ?.textContent?.trim();
    if (fromDom) return fromDom;
    return document.title.replace(/^Job Application for /i, '').split(' at ')[0] ?? 'This job';
  }

  function extractCompany(): string {
    const fromDom = document
      .querySelector<HTMLElement>('.company-name, [class*="company"]')
      ?.textContent?.trim();
    if (fromDom) return fromDom;
    // Title is "Job Application for <role> at <company>" on job-boards pages
    const fromTitle = document.title.split(' at ').pop()?.trim();
    if (fromTitle && fromTitle !== document.title) return fromTitle;
    return location.pathname.split('/')[1] ?? location.hostname;
  }

  function fillGreenhouseForm(user: { name: string; email: string }) {
    // Both board generations use the same form field ids
    fill('#first_name', nameFirst(user.name));
    fill('#last_name', nameLast(user.name));
    fill('#email', user.email);
    fill('#phone', '');
    document
      .querySelector('#application-form, #application_form, form')
      ?.scrollIntoView({ behavior: 'smooth' });
  }

  function fill(selector: string, value: string) {
    const el = document.querySelector<HTMLInputElement>(selector);
    if (!el || el.value) return;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    setter?.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function extractJobId(): number {
    const match = location.href.match(/\/jobs\/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
})();

function nameFirst(full: string): string { return full.split(' ')[0] ?? full; }
function nameLast(full: string): string { const p = full.split(' '); return p.length > 1 ? p.slice(1).join(' ') : ''; }
