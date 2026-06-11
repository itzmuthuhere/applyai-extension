export interface Job {
  id: number;
  title: string;
  company: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  isRemote: boolean;
  description: string;
  sourceUrl: string | null;
  source: string | null;
  postedDate: string | null;
  matchScore?: number;
}

export interface StoredUser {
  id: number;
  name: string;
  email: string;
  subscriptionPlan: 'FREE' | 'HUNTER' | 'PRO';
}

export interface Resume {
  id: number;
  versionName: string;
  isOriginal: boolean;
  aiScore: number | null;
}

export type AutoApplyMode = 'supervised' | 'autopilot';

export interface ApplyPayload {
  jobId: number;
  resumeId: number;
  coverLetter?: string;
}

export interface ExtensionMessage {
  type: 'GET_JWT' | 'GET_USER' | 'RECORD_APPLICATION' | 'GET_JOB_QUEUE';
  payload?: unknown;
}
