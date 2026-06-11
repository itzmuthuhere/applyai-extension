import React, { useEffect, useState } from 'react';
import { getJwt, getUser, clearAuth } from '../storage/storage';
import { StoredUser } from '../types';

const API_URL = import.meta.env.VITE_API_URL as string;
const PRIMARY = '#2563EB';
const PRIMARY_LIGHT = '#DBEAFE';
const TEXT = '#0F172A';
const MUTED = '#64748B';
const BORDER = '#E2E8F0';
const BG = '#F8FAFC';
const SURFACE = '#FFFFFF';

export default function App() {
  const [jwt, setJwt] = useState<string | null>(null);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getJwt(), getUser()]).then(([j, u]) => {
      setJwt(j);
      setUser(u);
      setLoading(false);
    });
  }, []);

  const handleSignOut = async () => {
    await clearAuth();
    setJwt(null);
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 520, background: BG }}>
        <div style={{ width: 32, height: 32, border: `3px solid ${PRIMARY_LIGHT}`, borderTopColor: PRIMARY, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!jwt || !user) return <LoginScreen />;
  return <Dashboard user={user} onSignOut={handleSignOut} />;
}

function LoginScreen() {
  const handleLogin = () => {
    // E2: replace with proper OAuth token-capture flow
    chrome.tabs.create({ url: `${API_URL}/api/auth/google` });
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, background: BG, minHeight: 520 }}>
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: PRIMARY, color: '#fff', fontSize: 30, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          A
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: TEXT }}>ApplyAI</h1>
        <p style={{ fontSize: 13, color: MUTED, marginTop: 6, lineHeight: 1.5 }}>
          Auto-apply to jobs on LinkedIn,{'\n'}Naukri, Indeed and more
        </p>
      </div>

      <div style={{ width: '100%', background: SURFACE, borderRadius: 14, padding: 16, border: `1px solid ${BORDER}` }}>
        <Feature icon="✅" text="AI match scoring per job" />
        <Feature icon="✅" text="Auto-fills application forms" />
        <Feature icon="✅" text="Syncs with your ApplyAI profile" />
        <Feature icon="✅" text="Tracks every application" />
      </div>

      <button
        onClick={handleLogin}
        style={{ width: '100%', padding: 14, background: PRIMARY, color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
      >
        Sign in with Google
      </button>
    </div>
  );
}

function Feature({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
      <span style={{ fontSize: 15 }}>{icon}</span>
      <span style={{ fontSize: 13, color: MUTED }}>{text}</span>
    </div>
  );
}

function Dashboard({ user, onSignOut }: { user: StoredUser; onSignOut: () => void }) {
  const planColor = user.subscriptionPlan === 'PRO' ? '#8B5CF6' : user.subscriptionPlan === 'HUNTER' ? '#F59E0B' : PRIMARY;

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, background: BG, minHeight: 520 }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: PRIMARY, color: '#fff', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            A
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{user.name}</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: planColor, background: planColor + '20', padding: '3px 10px', borderRadius: 20 }}>
          {user.subscriptionPlan}
        </span>
      </div>

      {/* Status card */}
      <div style={{ background: SURFACE, borderRadius: 14, padding: 16, border: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Extension active</span>
        </div>
        <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
          Visit a job page on LinkedIn, Naukri, or Indeed — ApplyAI will detect it and show an apply button.
        </p>
      </div>

      {/* Supported portals */}
      <div style={{ background: SURFACE, borderRadius: 14, padding: 16, border: `1px solid ${BORDER}` }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: MUTED, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Supported portals
        </p>
        {['LinkedIn Easy Apply', 'Naukri.com', 'Indeed.com', 'Workday', 'Greenhouse', 'Lever'].map((portal) => (
          <div key={portal} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
            <span style={{ fontSize: 13, color: MUTED }}>{portal}</span>
          </div>
        ))}
      </div>

      {/* Sign out */}
      <button
        onClick={onSignOut}
        style={{ width: '100%', padding: 10, background: 'transparent', color: MUTED, border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: 13, cursor: 'pointer', marginTop: 'auto' }}
      >
        Sign out
      </button>
    </div>
  );
}
