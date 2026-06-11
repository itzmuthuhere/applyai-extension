import React, { useEffect, useState } from 'react';
import { getJwt, getUser, clearAuth } from '../storage/storage';
import { signInWithGoogle } from './auth';
import { StoredUser } from '../types';
import JobQueueScreen from './JobQueueScreen';
import SettingsScreen from './SettingsScreen';

const PRIMARY = '#2563EB';
const PRIMARY_LIGHT = '#DBEAFE';
const TEXT = '#0F172A';
const MUTED = '#64748B';
const BORDER = '#E2E8F0';
const BG = '#F8FAFC';
const SURFACE = '#FFFFFF';
const ERROR = '#EF4444';

type Tab = 'jobs' | 'settings';

export default function App() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('jobs');

  useEffect(() => {
    Promise.all([getJwt(), getUser()]).then(([jwt, u]) => {
      if (jwt && u) setUser(u);
      setLoading(false);
    });
  }, []);

  const handleSignOut = async () => {
    await clearAuth();
    setUser(null);
  };

  if (loading) return <Spinner />;
  if (!user) return <LoginScreen onSuccess={setUser} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 520, background: BG }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', background: SURFACE, borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: PRIMARY, color: '#fff', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>A</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>ApplyAI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PlanBadge plan={user.subscriptionPlan} />
          <button onClick={handleSignOut} style={{ background: 'none', border: 'none', fontSize: 11, color: MUTED, cursor: 'pointer' }}>Sign out</button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', background: SURFACE, borderBottom: `1px solid ${BORDER}` }}>
        <TabBtn label="Job Queue" active={tab === 'jobs'} onClick={() => setTab('jobs')} />
        <TabBtn label="Settings" active={tab === 'settings'} onClick={() => setTab('settings')} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'jobs' && <JobQueueScreen />}
        {tab === 'settings' && <SettingsScreen />}
      </div>

      {/* Status bar */}
      <div style={{ padding: '8px 16px', background: SURFACE, borderTop: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981' }} />
        <span style={{ fontSize: 11, color: MUTED }}>Active on LinkedIn · Naukri · Indeed · Workday · Greenhouse · Lever</span>
      </div>
    </div>
  );
}

function LoginScreen({ onSuccess }: { onSuccess: (user: StoredUser) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      const u = await getUser();
      if (u) onSuccess(u);
    } catch (e: any) {
      setError(e.message ?? 'Sign-in failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, background: BG, minHeight: 520 }}>
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: PRIMARY, color: '#fff', fontSize: 30, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>A</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: TEXT }}>ApplyAI</h1>
        <p style={{ fontSize: 13, color: MUTED, marginTop: 6, lineHeight: 1.6 }}>Auto-apply to jobs on LinkedIn,<br />Naukri, Indeed and more</p>
      </div>

      <div style={{ width: '100%', background: SURFACE, borderRadius: 14, padding: 16, border: `1px solid ${BORDER}` }}>
        {['AI match scoring per job', 'Auto-fills application forms', 'Syncs with your ApplyAI profile', 'Tracks every application'].map((f) => (
          <div key={f} style={{ display: 'flex', gap: 8, padding: '6px 0', fontSize: 13, color: MUTED }}>
            <span>✅</span><span>{f}</span>
          </div>
        ))}
      </div>

      {error && <div style={{ fontSize: 13, color: ERROR, textAlign: 'center', background: '#FEF2F2', padding: '8px 12px', borderRadius: 8, width: '100%' }}>{error}</div>}

      <button
        onClick={handleLogin}
        disabled={loading}
        style={{ width: '100%', padding: 14, background: loading ? '#93C5FD' : PRIMARY, color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: loading ? 'default' : 'pointer' }}
      >
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 520, background: BG }}>
      <div style={{ width: 32, height: 32, border: `3px solid ${PRIMARY_LIGHT}`, borderTopColor: PRIMARY, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const color = plan === 'PRO' ? '#8B5CF6' : plan === 'HUNTER' ? '#F59E0B' : PRIMARY;
  return <span style={{ fontSize: 11, fontWeight: 700, color, background: color + '20', padding: '2px 8px', borderRadius: 20 }}>{plan}</span>;
}

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ flex: 1, padding: '10px 0', background: 'none', border: 'none', borderBottom: `2px solid ${active ? PRIMARY : 'transparent'}`, fontSize: 13, fontWeight: active ? 700 : 400, color: active ? PRIMARY : MUTED, cursor: 'pointer' }}
    >
      {label}
    </button>
  );
}
