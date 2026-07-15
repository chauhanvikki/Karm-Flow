export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Remote' | 'Onsite' | 'Hybrid';
  postedAt: string;
  summary: string;
  description: string;
  requirements: string[];
  status: 'Open' | 'Closed' | 'Draft';
  applicantCount: number;
}

export type ApplicationStage = 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  initials: string;
  source: string;
  tags: string[];
  atsScore?: number;
}

export interface ApplicationTimelineEvent {
  stage: ApplicationStage;
  date: string;
}

export interface ATSScore {
  matchScore?: number;
  summary?: string;
  matchedKeywords?: string[];
  missingKeywords?: string[];
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  appliedAt: string;
  currentStage: ApplicationStage;
  timeline: ApplicationTimelineEvent[];
  atsScore?: ATSScore;
}

export interface ActivityEvent {
  id: string;
  type: 'stage_moved' | 'new_application' | 'job_posted' | 'note_added';
  title: string;
  description: string;
  timestamp: string;
}

export const MOCK_CANDIDATES: Record<string, Candidate> = {
  'c1': { id: 'c1', name: 'Alice Chen', email: 'alice@example.com', initials: 'AC', source: 'LinkedIn', tags: ['Strong Portfolio', 'Referral'], atsScore: 92 },
  'c2': { id: 'c2', name: 'Bob Smith', email: 'bob@example.com', initials: 'BS', source: 'Website', tags: [], atsScore: 45 },
  'c3': { id: 'c3', name: 'Charlie Davis', email: 'charlie@example.com', initials: 'CD', source: 'Indeed', tags: ['Needs Visa'], atsScore: 78 },
  'c4': { id: 'c4', name: 'Diana Prince', email: 'diana@example.com', initials: 'DP', source: 'Referral', tags: ['Top Candidate'], atsScore: 98 },
  'c5': { id: 'c5', name: 'Evan Wright', email: 'evan@example.com', initials: 'EW', source: 'LinkedIn', tags: [], atsScore: 35 },
  'c6': { id: 'c6', name: 'Fiona Gallagher', email: 'fiona@example.com', initials: 'FG', source: 'Website', tags: ['Available immediately'], atsScore: 85 },
  'c7': { id: 'c7', name: 'George Miller', email: 'george@example.com', initials: 'GM', source: 'Twitter', tags: [], atsScore: null as any },
  'c8': { id: 'c8', name: 'Hannah Lee', email: 'hannah@example.com', initials: 'HL', source: 'LinkedIn', tags: ['Remote Only'], atsScore: 60 },
};

export const MOCK_JOBS: Job[] = [
  {
    id: 'j1',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'Remote',
    postedAt: '2026-07-01T10:00:00Z',
    summary: 'Build delightful user experiences with React and Framer Motion.',
    description: 'We are looking for a Senior Frontend Engineer to join our core product team. You will be responsible for architecting and building complex, interactive web applications that our users love.',
    requirements: ['5+ years React experience', 'Deep knowledge of CSS/Tailwind', 'Experience with animation libraries'],
    status: 'Open',
    applicantCount: 5,
  },
  {
    id: 'j2',
    title: 'Product Designer',
    department: 'Design',
    location: 'New York, NY',
    type: 'Hybrid',
    postedAt: '2026-07-05T09:30:00Z',
    summary: 'Shape the future of ATS platforms with clean, premium design.',
    description: 'Join our design team to craft premium, seamless interfaces. We value aesthetics, micro-interactions, and simplicity over complex enterprise clutter.',
    requirements: ['Strong portfolio showcasing web apps', 'Figma mastery', 'Experience with design systems'],
    status: 'Open',
    applicantCount: 2,
  },
  {
    id: 'j3',
    title: 'Backend Engineer',
    department: 'Engineering',
    location: 'London, UK',
    type: 'Remote',
    postedAt: '2026-07-08T14:15:00Z',
    summary: 'Scale our Express and MongoDB infrastructure.',
    description: 'We need a robust backend to support our growing platform. You will design scalable APIs, optimize database queries, and ensure data security.',
    requirements: ['Experience with Node.js/Express', 'MongoDB expertise', 'Strong understanding of REST APIs'],
    status: 'Draft',
    applicantCount: 0,
  }
];

export const MOCK_RECRUITER_APPLICATIONS: Application[] = [
  {
    id: 'a1', jobId: 'j1', candidateId: 'c1', appliedAt: '2026-07-02T10:00:00Z', currentStage: 'Offer',
    timeline: [{ stage: 'Applied', date: '2026-07-02T10:00:00Z' }, { stage: 'Interview', date: '2026-07-06T10:00:00Z' }]
  },
  {
    id: 'a2', jobId: 'j1', candidateId: 'c2', appliedAt: '2026-07-03T11:00:00Z', currentStage: 'Interview',
    timeline: [{ stage: 'Applied', date: '2026-07-03T11:00:00Z' }]
  },
  {
    id: 'a3', jobId: 'j1', candidateId: 'c3', appliedAt: '2026-07-04T12:00:00Z', currentStage: 'Screening',
    timeline: [{ stage: 'Applied', date: '2026-07-04T12:00:00Z' }]
  },
  {
    id: 'a4', jobId: 'j1', candidateId: 'c4', appliedAt: '2026-07-05T13:00:00Z', currentStage: 'Applied',
    timeline: [{ stage: 'Applied', date: '2026-07-05T13:00:00Z' }]
  },
  {
    id: 'a5', jobId: 'j1', candidateId: 'c5', appliedAt: '2026-07-06T14:00:00Z', currentStage: 'Rejected',
    timeline: [{ stage: 'Applied', date: '2026-07-06T14:00:00Z' }]
  },
  {
    id: 'a6', jobId: 'j2', candidateId: 'c6', appliedAt: '2026-07-07T15:00:00Z', currentStage: 'Screening',
    timeline: [{ stage: 'Applied', date: '2026-07-07T15:00:00Z' }]
  },
  {
    id: 'a7', jobId: 'j2', candidateId: 'c7', appliedAt: '2026-07-08T16:00:00Z', currentStage: 'Applied',
    timeline: [{ stage: 'Applied', date: '2026-07-08T16:00:00Z' }]
  }
];

export const MOCK_ACTIVITIES: ActivityEvent[] = [
  { id: 'ac1', type: 'stage_moved', title: 'Candidate moved to Offer', description: 'Alice Chen was moved to Offer for Senior Frontend Engineer', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: 'ac2', type: 'new_application', title: 'New Application', description: 'George Miller applied for Product Designer', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: 'ac3', type: 'job_posted', title: 'Job Posted', description: 'Marketing Manager was published', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
];

// Helper to simulate API delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const MOCK_APPLICATIONS = MOCK_RECRUITER_APPLICATIONS;
