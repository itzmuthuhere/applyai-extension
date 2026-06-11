import { StoredUser } from '../types';

export async function getJwt(): Promise<string | null> {
  const result = await chrome.storage.local.get('jwt');
  return result.jwt ?? null;
}

export async function setJwt(jwt: string): Promise<void> {
  await chrome.storage.local.set({ jwt });
}

export async function clearAuth(): Promise<void> {
  await chrome.storage.local.remove(['jwt', 'user', 'jobQueue', 'resumes']);
}

export async function getUser(): Promise<StoredUser | null> {
  const result = await chrome.storage.local.get('user');
  return result.user ?? null;
}

export async function setUser(user: StoredUser): Promise<void> {
  await chrome.storage.local.set({ user });
}

export async function getJobQueue(): Promise<unknown[]> {
  const result = await chrome.storage.local.get('jobQueue');
  return result.jobQueue ?? [];
}

export async function setJobQueue(jobs: unknown[]): Promise<void> {
  await chrome.storage.local.set({ jobQueue: jobs });
}

export async function getAutoApplyMode(): Promise<'supervised' | 'autopilot'> {
  const result = await chrome.storage.local.get('autoApplyMode');
  return result.autoApplyMode ?? 'supervised';
}

export async function setAutoApplyMode(mode: 'supervised' | 'autopilot'): Promise<void> {
  await chrome.storage.local.set({ autoApplyMode: mode });
}
