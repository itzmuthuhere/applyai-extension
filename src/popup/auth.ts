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

  let fragment: string;
  try {
    fragment = new URL(responseUrl).hash.slice(1);
  } catch {
    throw new Error(`Bad redirect URL: ${responseUrl}`);
  }

  const idToken = new URLSearchParams(fragment).get('id_token');
  if (!idToken) {
    const errParam = new URLSearchParams(fragment).get('error');
    throw new Error(errParam ? `Google error: ${errParam}` : `No id_token in redirect. Fragment: ${fragment.slice(0, 100)}`);
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
  } catch (fetchErr: any) {
    throw new Error(`Network error contacting backend: ${fetchErr.message}`);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Backend returned ${res.status}: ${body.slice(0, 200)}`);
  }

  let data: { jwt: string; user: StoredUser };
  try {
    data = await res.json();
  } catch {
    throw new Error('Backend response was not valid JSON');
  }

  await setJwt(data.jwt);
  await setUser(data.user);

  // Prime the job queue cache immediately after login
  try {
    const feed = await applyaiApi.get<{ content: Job[] } | Job[]>('/api/jobs/feed', data.jwt);
    const jobs = Array.isArray(feed) ? feed : (feed.content ?? []);
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
