// E7: Greenhouse ATS content script — boards.greenhouse.io
import { injectApplyButton } from './shared/overlay';
import { recordApplication } from './shared/messaging';

(function applyaiGreenhouse() {
  if (document.querySelector('[data-applyai]')) return;
  document.documentElement.setAttribute('data-applyai', 'greenhouse');

  setTimeout(init, 1000);

  function init() {
    // Greenhouse job pages have a consistent form structure
    const applyBtn =
      document.querySelector<HTMLElement>('#apply_now_button') ??
      document.querySelector<HTMLElement>('a[href*="#app"]') ??
      document.querySelector<HTMLElement>('.btn--apply, button[class*="apply"]');

    if (!applyBtn) return;

    const jobTitle =
      document.querySelector<HTMLElement>('h1.app-title, h1[class*="title"]')?.textContent?.trim() ??
      document.title.split(' at ')[0] ?? 'This job';

    const company =
      document.querySelector<HTMLElement>('.company-name, [class*="company"]')?.textContent?.trim() ??
      location.hostname ?? '';

    const jobId = extractJobId();

    injectApplyButton(applyBtn, {
      jobId,
      jobTitle,
      company,
      onApplyClick: async (resumeId, user) => {
        fillGreenhouseForm(user);
        const result = await recordApplication({ jobId, resumeId });
        if (!result.ok) throw new Error(result.error ?? 'Failed to record application');
      },
    });
  }

  function fillGreenhouseForm(user: { name: string; email: string }) {
    // Greenhouse has a very consistent form layout
    fill('#first_name', nameFirst(user.name));
    fill('#last_name', nameLast(user.name));
    fill('#email', user.email);
    fill('#phone', '');
    // Scroll to form
    document.querySelector('#application_form, form')?.scrollIntoView({ behavior: 'smooth' });
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
