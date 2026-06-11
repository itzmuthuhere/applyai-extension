import React, { useEffect, useState } from 'react';

const PRIMARY = '#2563EB';
const PRIMARY_LIGHT = '#DBEAFE';
const SUCCESS = '#10B981';
const TEXT = '#0F172A';
const MUTED = '#64748B';
const BORDER = '#E2E8F0';
const SURFACE = '#FFFFFF';
const WARNING_BG = '#FEF3C7';
const WARNING = '#D97706';

export default function SettingsScreen() {
  const [mode, setMode] = useState<'supervised' | 'autopilot'>('supervised');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    chrome.storage.local.get('autoApplyMode', (r) => {
      setMode(r.autoApplyMode ?? 'supervised');
    });
  }, []);

  const handleModeChange = (newMode: 'supervised' | 'autopilot') => {
    setMode(newMode);
    chrome.storage.local.set({ autoApplyMode: newMode });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>

      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: MUTED, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Apply Mode
        </div>

        <ModeOption
          active={mode === 'supervised'}
          title="Supervised"
          description="You review each application before it submits. Recommended."
          icon="👀"
          onClick={() => handleModeChange('supervised')}
        />
        <ModeOption
          active={mode === 'autopilot'}
          title="Autopilot"
          description="Extension applies automatically when you visit a job page."
          icon="🤖"
          onClick={() => handleModeChange('autopilot')}
        />
      </div>

      {mode === 'autopilot' && (
        <div style={{ background: WARNING_BG, borderRadius: 10, padding: 12, fontSize: 12, color: WARNING, lineHeight: 1.5 }}>
          ⚠️ Autopilot will submit applications automatically. Make sure your profile and default resume are up to date before enabling.
        </div>
      )}

      {saved && (
        <div style={{ textAlign: 'center', fontSize: 12, color: SUCCESS, fontWeight: 600 }}>
          ✓ Saved
        </div>
      )}

      <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: MUTED, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          About
        </div>
        <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
          Version 1.0.0<br />
          Backend: <span style={{ color: PRIMARY }}>Connected</span>
        </div>
      </div>
    </div>
  );
}

function ModeOption({ active, title, description, icon, onClick }: {
  active: boolean; title: string; description: string; icon: string; onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: 12, borderRadius: 10, border: `2px solid ${active ? PRIMARY : BORDER}`,
        background: active ? PRIMARY_LIGHT : SURFACE, cursor: 'pointer',
        marginBottom: 8, display: 'flex', gap: 10, alignItems: 'flex-start',
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: active ? PRIMARY : TEXT }}>{title}</div>
        <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{description}</div>
      </div>
    </div>
  );
}
