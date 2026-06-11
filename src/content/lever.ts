// E7: Lever ATS content script — jobs.lever.co
import { injectApplyButton } from './shared/overlay';
import { recordApplication } from './shared/messaging';

(function applyaiLever() {
  if (document.querySelector('[data-applyai]')) return;
  document.documentElement.setAttribute('data-applyai', 'lever');

  setTimeout(init, 1000);

  function init() {
    const applyBtn =
      document.querySelector<HTMLElement>('.postings-btn-wrapper a, a[href*="#application"]') ??
      document.querySelector<HTMLElement>('a.btn--apply, button.btn--apply');

    if (!applyBtn) return;

    const jobTitle =
      document.querySelector<HTMLElement>('h2.posting-headline')?.textContent?.trim() ??
      document.querySelector<HTMLElement>('h1')?.textContent?.trim() ??
      document.title.split(' at ')[0] ?? 'This job';

    const company =
      document.querySelector<HTMLElement>('.main-header-logo img')?.getAttribute('alt') ??
      location.hostname.replace('jobs.lever.co/', '') ?? '';

    const jobId = extractJobId();

    injectApplyButton(applyBtn, {
      jobId,
      jobTitle,
      company,
      onApplyClick: async (resumeId, user) => {
        fillLeverForm(user);
        const result = await recordApplication({ jobId, resumeId });
        if (!result.ok) throw new Error(result.error ?? 'Failed to record application');
      },
    });
  }

  function fillLeverForm(user: { name: string; email: string }) {
    // Lever application form has consistent field names
    fill('input[name="name"]', user.name);
    fill('input[name="email"]', user.email);
    fill('input[name="org"]', ''); // current company — leave blank
    // Scroll to application form
    document.querySelector('.application-form, form')?.scrollIntoView({ behavior: 'smooth' });
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
    const parts = location.pathname.split('/');
    const uuidPart = parts[parts.length - 1];
    // Use hash of UUID string as numeric ID since Lever uses UUIDs
    return uuidPart ? Math.abs(uuidPart.split('').reduce((a, c) => (a << 5) - a + c.charCodeAt(0), 0)) % 1000000 : 0;
  }
})();
