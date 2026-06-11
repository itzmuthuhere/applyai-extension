export interface RecordApplicationPayload {
  jobId: number;
  resumeId: number;
  coverLetter?: string;
}

export function getJwtFromBackground(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'GET_JWT' }, (jwt) => resolve(jwt ?? null));
  });
}

export function recordApplication(payload: RecordApplicationPayload): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'RECORD_APPLICATION', payload }, (res) => {
      resolve(res ?? { ok: false, error: 'No response from background' });
    });
  });
}

export function getAutoApplyMode(): Promise<'supervised' | 'autopilot'> {
  return new Promise((resolve) => {
    chrome.storage.local.get('autoApplyMode', (r) => resolve(r.autoApplyMode ?? 'supervised'));
  });
}

export interface StoredResume {
  id: number;
  versionName: string;
  isOriginal: boolean;
  aiScore: number | null;
}

export function getResumes(): Promise<StoredResume[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get('resumes', (r) => resolve(r.resumes ?? []));
  });
}

export function getStoredUser(): Promise<{ name: string; email: string } | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get('user', (r) => resolve(r.user ?? null));
  });
}
