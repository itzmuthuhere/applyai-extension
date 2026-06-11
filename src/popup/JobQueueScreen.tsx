import React, { useEffect, useState } from 'react';
import { Job } from '../types';

const PRIMARY = '#2563EB';
const PRIMARY_LIGHT = '#DBEAFE';
const SUCCESS = '#10B981';
const TEXT = '#0F172A';
const MUTED = '#64748B';
const BORDER = '#E2E8F0';
const SURFACE = '#FFFFFF';

export default function JobQueueScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    chrome.storage.local.get('jobQueue', (r) => {
      const q = r.jobQueue;
      setJobs(Array.isArray(q) ? q : []);
    });
  }, []);

  if (jobs.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: MUTED, fontSize: 13 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
        No jobs in queue yet.
        <br />Job queue syncs every hour.
      </div>
    );
  }

  return (
    <div style={{ overflowY: 'auto', maxHeight: 400 }}>
      {jobs.slice(0, 20).map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  const score = job.matchScore;
  const scoreColor = score != null ? (score >= 75 ? SUCCESS : score >= 50 ? '#F59E0B' : MUTED) : MUTED;

  return (
    <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {job.title}
        </div>
        <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{job.company}</div>
        {job.location && (
          <div style={{ fontSize: 11, color: MUTED, marginTop: 1 }}>{job.location}</div>
        )}
      </div>
      {score != null && (
        <div style={{ flexShrink: 0, textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: scoreColor }}>{score}%</div>
          <div style={{ fontSize: 10, color: MUTED }}>match</div>
        </div>
      )}
      {job.sourceUrl && (
        <a
          href={job.sourceUrl}
          target="_blank"
          rel="noreferrer"
          style={{ flexShrink: 0, fontSize: 11, color: PRIMARY, background: PRIMARY_LIGHT, padding: '4px 8px', borderRadius: 6, textDecoration: 'none', fontWeight: 600 }}
        >
          View
        </a>
      )}
    </div>
  );
}
