import { getResumes, recordApplication, StoredResume, getStoredUser } from './messaging';

const Z = '2147483647';
const PRIMARY = '#2563EB';
const PRIMARY_LIGHT = '#DBEAFE';
const SUCCESS = '#10B981';
const ERROR = '#EF4444';
const SURFACE = '#FFFFFF';
const TEXT = '#0F172A';
const MUTED = '#64748B';
const BORDER = '#E2E8F0';

export interface OverlayConfig {
  jobId: number;
  jobTitle: string;
  company: string;
  onApplyClick: (resumeId: number, user: { name: string; email: string }) => Promise<void>;
}

export function injectApplyButton(anchorEl: Element, config: OverlayConfig): void {
  if (document.getElementById('applyai-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'applyai-btn';
  btn.textContent = '⚡ Apply with ApplyAI';
  btn.style.cssText = `
    display:inline-flex;align-items:center;gap:6px;
    padding:8px 16px;background:${PRIMARY};color:#fff;
    border:none;border-radius:8px;font-size:14px;font-weight:600;
    cursor:pointer;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
    margin-left:8px;flex-shrink:0;
  `;
  btn.addEventListener('click', () => showOverlay(config));
  anchorEl.insertAdjacentElement('afterend', btn);
}

function showOverlay(config: OverlayConfig): void {
  document.getElementById('applyai-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'applyai-overlay';
  overlay.style.cssText = `
    position:fixed;bottom:24px;right:24px;width:340px;
    background:${SURFACE};border-radius:16px;padding:20px;
    box-shadow:0 8px 32px rgba(0,0,0,0.18);border:1px solid ${BORDER};
    z-index:${Z};font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  `;

  overlay.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;">
      <div>
        <div style="font-size:11px;font-weight:700;color:${PRIMARY};background:${PRIMARY_LIGHT};padding:2px 8px;border-radius:20px;display:inline-block;margin-bottom:6px;">ApplyAI</div>
        <div style="font-size:15px;font-weight:700;color:${TEXT};line-height:1.3;">${config.jobTitle}</div>
        <div style="font-size:13px;color:${MUTED};">${config.company}</div>
      </div>
      <button id="applyai-close" style="background:none;border:none;cursor:pointer;font-size:18px;color:${MUTED};padding:0;line-height:1;">✕</button>
    </div>
    <div id="applyai-body">
      <div style="text-align:center;padding:16px;color:${MUTED};font-size:13px;">Loading resumes...</div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.getElementById('applyai-close')!.addEventListener('click', () => overlay.remove());

  loadResumeOptions(overlay, config);
}

async function loadResumeOptions(overlay: HTMLElement, config: OverlayConfig): Promise<void> {
  const body = document.getElementById('applyai-body')!;
  const [resumes, user] = await Promise.all([getResumes(), getStoredUser()]);

  if (!user) {
    body.innerHTML = `<div style="color:${ERROR};font-size:13px;text-align:center;">Sign in to ApplyAI extension first.</div>`;
    return;
  }
  if (resumes.length === 0) {
    body.innerHTML = `<div style="color:${MUTED};font-size:13px;text-align:center;">No resumes found. Upload one in the ApplyAI app.</div>`;
    return;
  }

  body.innerHTML = `
    <label style="font-size:12px;font-weight:600;color:${MUTED};display:block;margin-bottom:6px;">SELECT RESUME</label>
    <select id="applyai-resume-select" style="width:100%;padding:10px;border:1px solid ${BORDER};border-radius:8px;font-size:13px;color:${TEXT};background:${SURFACE};margin-bottom:14px;">
      ${resumes.map((r: StoredResume) => `<option value="${r.id}">${r.versionName}${r.isOriginal ? ' (original)' : ''}${r.aiScore ? ` — ${r.aiScore}/100` : ''}</option>`).join('')}
    </select>
    <button id="applyai-submit" style="width:100%;padding:12px;background:${PRIMARY};color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;">
      Apply Now
    </button>
    <div id="applyai-status" style="margin-top:10px;font-size:13px;text-align:center;"></div>
  `;

  document.getElementById('applyai-submit')!.addEventListener('click', async () => {
    const select = document.getElementById('applyai-resume-select') as HTMLSelectElement;
    const resumeId = parseInt(select.value);
    const submitBtn = document.getElementById('applyai-submit') as HTMLButtonElement;
    const statusEl = document.getElementById('applyai-status')!;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Applying...';
    statusEl.textContent = '';

    try {
      await config.onApplyClick(resumeId, user);
      submitBtn.style.background = SUCCESS;
      submitBtn.textContent = '✓ Applied!';
      statusEl.style.color = SUCCESS;
      statusEl.textContent = 'Application recorded in your tracker.';
      setTimeout(() => overlay.remove(), 2500);
    } catch (e: any) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Apply Now';
      statusEl.style.color = ERROR;
      statusEl.textContent = e.message ?? 'Something went wrong. Try again.';
    }
  });
}
