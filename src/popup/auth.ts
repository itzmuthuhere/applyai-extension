import { setJwt, setUser, setJobQueue } from '../storage/storage';
import { applyaiApi } from '../api/apiClient';
import { Job, StoredUser } from '../types';

const API_URL = import.meta.env.VITE_API_URL as string;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

export async function signInWithGoogle(): Promise<void> {
  if (!CLIENT_ID) throw new Error('VITE_GOOGLE_CLIENT_ID not set in .env');

  const redirectUrl = chrome.identity.getRedirectURL('oauth2');
  const nonce = Math.random().toString(36).slice(2);

  const authUrl = new URL('https://accounts.google.com/o/oauth2/auth');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUrl);
  authUrl.searchParams.set('response_type', 'id_token');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('nonce', nonce);
  authUrl.searchParams.set('prompt', 'select_account');

  const responseUrl = await new Promise<string>((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      { url: authUrl.toString(), interactive: true },
      (url) => {
        if (chrome.runtime.lastError || !url) {
          reject(new Error(chrome.runtime.lastError?.message ?? 'Sign-in cancelled'));
        } else {
          resolve(url);
        }
      }
    );
  });

  const fragment = new URL(responseUrl).hash.slice(1);
  const idToken = new URLSearchParams(fragment).get('id_token');
  if (!idToken) throw new Error('No id_token returned from Google');

  const res = await fetch(`${API_URL}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) throw new Error('Backend authentication failed');

  const data: { jwt: string; user: StoredUser } = await res.json();

  await setJwt(data.jwt);
  await setUser(data.user);

  // Prime the job queue cache immediately after login
  try {
    const jobs = await applyaiApi.get<Job[]>('/api/jobs/feed', data.jwt);
    await setJobQueue(jobs);
  } catch {
    // non-fatal — service worker will sync on next alarm
  }

  // Cache resume list for content scripts
  try {
    const resumes = await applyaiApi.get<unknown[]>('/api/resumes', data.jwt);
    await chrome.storage.local.set({ resumes });
  } catch {
    // non-fatal
  }
}
