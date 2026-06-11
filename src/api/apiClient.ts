const API_URL = import.meta.env.VITE_API_URL as string;

async function request<T>(path: string, jwt: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
      ...init?.headers,
    },
  });
  if (res.status === 402) throw Object.assign(new Error('Plan limit reached'), { status: 402 });
  if (!res.ok) throw new Error(`${init?.method ?? 'GET'} ${path} failed: ${res.status}`);
  return res.json();
}

export const applyaiApi = {
  get<T>(path: string, jwt: string): Promise<T> {
    return request<T>(path, jwt);
  },
  post<T>(path: string, body: unknown, jwt: string): Promise<T> {
    return request<T>(path, jwt, { method: 'POST', body: JSON.stringify(body) });
  },
};
