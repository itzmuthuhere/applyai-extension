import { getJwt, setJobQueue } from '../storage/storage';
import { applyaiApi } from '../api/apiClient';
import { Job } from '../types';

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('sync-jobs', { periodInMinutes: 60 });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'sync-jobs') await syncJobQueue();
});

async function syncJobQueue() {
  const jwt = await getJwt();
  if (!jwt) return;
  try {
    const jobs = await applyaiApi.get<Job[]>('/api/jobs/feed', jwt);
    await setJobQueue(jobs);
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
  }
});

async function recordApplication(payload: { jobId: number; resumeId: number; coverLetter?: string }) {
  const jwt = await getJwt();
  if (!jwt) return { ok: false, error: 'Not logged in' };
  try {
    await applyaiApi.post('/api/applications/apply', payload, jwt);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}
