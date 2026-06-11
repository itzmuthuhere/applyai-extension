// E1 skeleton + E8: application tracking, autopilot stats
import { getJwt, setJobQueue, getAutoApplyMode } from '../storage/storage';
import { applyaiApi } from '../api/apiClient';
import { Job } from '../types';

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('sync-jobs', { periodInMinutes: 60 });
  chrome.storage.local.set({ extensionAppliedCount: 0 });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'sync-jobs') await syncJobQueue();
});

async function syncJobQueue() {
  const jwt = await getJwt();
  if (!jwt) return;
  try {
    const [feed, resumes] = await Promise.all([
      applyaiApi.get<{ content: Job[] } | Job[]>('/api/jobs/feed', jwt),
      applyaiApi.get<unknown[]>('/api/resumes', jwt),
    ]);
    const jobs = Array.isArray(feed) ? feed : (feed.content ?? []);
    await setJobQueue(jobs);
    await chrome.storage.local.set({ resumes });
  } catch {
    // retry on next alarm tick
  }
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  switch (msg.type) {
    case 'GET_JWT':
      getJwt().then(sendResponse);
      return true;

    case 'SYNC_NOW':
      syncJobQueue().then(() => sendResponse({ ok: true }));
      return true;

    case 'RECORD_APPLICATION':
      recordApplication(msg.payload).then(sendResponse);
      return true;

    case 'GET_APPLY_MODE':
      getAutoApplyMode().then(sendResponse);
      return true;

    case 'GET_STATS':
      chrome.storage.local.get('extensionAppliedCount', (r) => {
        sendResponse({ appliedCount: r.extensionAppliedCount ?? 0 });
      });
      return true;
  }
});

async function recordApplication(payload: { jobId: number; resumeId: number; coverLetter?: string }) {
  const jwt = await getJwt();
  if (!jwt) return { ok: false, error: 'Not logged in' };
  try {
    await applyaiApi.post('/api/applications/apply', payload, jwt);
    // Increment local applied count for extension stats
    const r = await chrome.storage.local.get('extensionAppliedCount');
    await chrome.storage.local.set({ extensionAppliedCount: (r.extensionAppliedCount ?? 0) + 1 });
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}
