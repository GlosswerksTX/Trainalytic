/* ============================================================
   Data — sample business, trainees, skills, training, scorecards
   Also: config defaults that mirror what the setup wizard collects.
   ============================================================ */

const DEFAULT_LABELS = {
  trainee: "Trainee",
  trainees: "Trainees",
  trainer: "Trainer",
  trainers: "Trainers",
  skill: "Skill",
  skills: "Skills",
  scorecard: "Scorecard",
  scorecards: "Scorecards",
  training_path: "Training Path",
  qualification: "Qualification",
  qualifications: "Qualifications",
  task: "Task",
  tasks: "Tasks",
  assigned_training: "Assigned Training",
};

const INDUSTRY_TEMPLATES = [
  {
    id: 'restaurant',
    name: 'Restaurant / Café',
    blurb: 'Front of house, kitchen, bar — covers food handling, POS, service.',
    icon: '🍽️',
    skills: [
      { name: 'Customer Service', category: 'Front of House', target: 90, blurb: 'Greeting, problem-solving, tone' },
      { name: 'POS Operation', category: 'Operations', target: 95, blurb: 'Order accuracy + speed' },
      { name: 'Cash Handling', category: 'Operations', target: 100, blurb: 'Drawer balanced, no shortages' },
      { name: 'Drink Prep', category: 'Bar', target: 90, blurb: 'Spec adherence, presentation' },
      { name: 'Food Handling', category: 'Kitchen', target: 100, blurb: 'Temp, hygiene, allergens' },
      { name: 'Opening Procedure', category: 'Operations', target: 95, blurb: 'Open-list completion' },
      { name: 'Closing Procedure', category: 'Operations', target: 95, blurb: 'Close-list completion' },
    ],
    training: [
      { name: 'Food Handler Certification', mandatory: true, expires: '12 months', link: true },
      { name: 'New Hire Orientation', mandatory: true, link: false },
      { name: 'Espresso Bar 101', mandatory: false, link: true },
      { name: 'Customer Recovery SOP', mandatory: false, link: true },
      { name: 'Cash Drawer Balancing', mandatory: true, link: true },
    ],
  },
  {
    id: 'retail',
    name: 'Retail Store',
    blurb: 'Floor, POS, stocking, customer service.',
    icon: '🛍️',
    skills: [
      { name: 'Customer Engagement', category: 'Floor', target: 90 },
      { name: 'POS / Returns', category: 'Operations', target: 95 },
      { name: 'Loss Prevention', category: 'Operations', target: 100 },
      { name: 'Merchandising', category: 'Floor', target: 85 },
      { name: 'Stocking / Inventory', category: 'Backroom', target: 90 },
    ],
    training: [
      { name: 'Brand Standards 101', mandatory: true },
      { name: 'POS & Returns SOP', mandatory: true },
      { name: 'Loss Prevention Module', mandatory: true },
    ],
  },
  {
    id: 'salon',
    name: 'Salon / Spa',
    blurb: 'Front desk, services, sanitation, retail.',
    icon: '✂️',
    skills: [
      { name: 'Client Consultation', category: 'Service', target: 90 },
      { name: 'Booking / Front Desk', category: 'Front Desk', target: 95 },
      { name: 'Sanitation', category: 'Operations', target: 100 },
      { name: 'Retail Sales', category: 'Service', target: 80 },
    ],
    training: [
      { name: 'Sanitation & State Compliance', mandatory: true, expires: '24 months' },
      { name: 'Booking System Training', mandatory: true },
    ],
  },
  {
    id: 'auto',
    name: 'Auto Shop',
    blurb: 'Service writing, diagnostics, safety, customer comms.',
    icon: '🔧',
    skills: [
      { name: 'Service Writing', category: 'Front of House', target: 90 },
      { name: 'Diagnostics', category: 'Bay', target: 85 },
      { name: 'Lift / Hoist Safety', category: 'Safety', target: 100 },
      { name: 'Customer Communication', category: 'Front of House', target: 90 },
    ],
    training: [
      { name: 'Bay Safety Module', mandatory: true, expires: '12 months' },
      { name: 'Service Advisor SOP', mandatory: true },
    ],
  },
  {
    id: 'fitness',
    name: 'Fitness / Studio',
    blurb: 'Member experience, class flow, safety.',
    icon: '🏋️',
    skills: [
      { name: 'Member Check-In', category: 'Front Desk', target: 95 },
      { name: 'Class Flow & Cuing', category: 'Floor', target: 90 },
      { name: 'Equipment Safety', category: 'Floor', target: 100 },
    ],
    training: [
      { name: 'CPR / First Aid', mandatory: true, expires: '24 months' },
      { name: 'Member Onboarding SOP', mandatory: true },
    ],
  },
  {
    id: 'blank',
    name: 'Start blank',
    blurb: 'Build skills and training from scratch.',
    icon: '◯',
    skills: [],
    training: [],
  },
];

/* ---- Sample business config (post-setup) ---- */
const SAMPLE_CONFIG = {
  businessName: "Roselane Coffee Co.",
  industry: "restaurant",
  labels: DEFAULT_LABELS,
  palette: "sage",
  fonts: "modern",
  theme: "light",
  density: "comfortable",
  ratingFormat: "percent", // 'percent' | 'stars' | 'passfail'
  sequentialTraining: false,
  defaultPathDays: 60,
  enabledSections: {
    trainees: true,
    skills: true,
    assigned_training: true,
    tasks: true,
    scorecards: true,
    ai_summary: true,
  },
  aiSummary: {
    tone: "coaching",
    length: "medium",
    language: "English",
    sections: { trends: true, wins: true, focus: true, recommendations: true, attendance: false },
    audience: "Trainee + Manager",
    role: "Lead Barista",
    apiProvider: "anthropic", // 'anthropic' | 'openai' | 'none'
    apiKey: "", // stored in localStorage in real product; visible-once UI here
  },
  notifications: {
    daily_reminder: false,
    weekly_summary_trainee: true,
    weekly_summary_manager: true,
    behind_schedule: true,
    cert_expiry: true,
    training_complete: false,
    calendar_invites: false,
  },
  integrations: { gmail: true, calendar: true },
  setupComplete: true,
  showTour: false,
};

/* Empty config for first-time wizard */
const BLANK_CONFIG = {
  businessName: "",
  industry: null,
  logoFile: null,
  labels: DEFAULT_LABELS,
  palette: "sage",
  fonts: "modern",
  theme: "light",
  density: "comfortable",
  ratingFormat: "percent",
  sequentialTraining: false,
  defaultPathDays: 60,
  enabledSections: {
    trainees: true,
    skills: true,
    assigned_training: true,
    tasks: true,
    scorecards: true,
    ai_summary: true,
  },
  aiSummary: {
    tone: "coaching",
    length: "medium",
    language: "English",
    sections: { trends: true, wins: true, focus: true, recommendations: true, attendance: false },
    audience: "Trainee + Manager",
    role: "",
    apiProvider: "anthropic",
    apiKey: "",
  },
  notifications: {
    daily_reminder: false,
    weekly_summary_trainee: false,
    weekly_summary_manager: false,
    behind_schedule: false,
    cert_expiry: false,
    training_complete: false,
    calendar_invites: false,
  },
  integrations: { gmail: false, calendar: false },
  setupComplete: false,
  showTour: false,
};

/* ---- Sample trainees ---- */
const SAMPLE_TRAINEES = [
  {
    id: 't1',
    name: 'Maya Okonkwo',
    position: 'Barista',
    startDate: '2026-04-22',
    pathDays: 60,
    daysIn: 21,
    status: 'on-track',
    trainer: 'Devon R.',
    scores: { 'Customer Service': 88, 'POS Operation': 92, 'Cash Handling': 100, 'Drink Prep': 78, 'Food Handling': 95, 'Opening Procedure': 82, 'Closing Procedure': 80 },
    trend: { 'Customer Service': 'up', 'POS Operation': 'up', 'Cash Handling': 'flat', 'Drink Prep': 'up', 'Food Handling': 'flat', 'Opening Procedure': 'up', 'Closing Procedure': 'up' },
    quals: ['Food Handler Cert', 'New Hire Orientation'],
    trainingDone: 2,
    trainingTotal: 5,
    redFlags: [],
    notes: [
      { date: '2026-05-12', author: 'Devon R.', text: 'Crushed the morning rush solo today — handled 3 mobile orders simultaneously without errors.' },
      { date: '2026-05-09', author: 'Kira P.', text: 'Latte art still inconsistent. Practicing free pours on slow shifts.' },
    ],
  },
  {
    id: 't2',
    name: 'Sam Reyes',
    position: 'Barista',
    startDate: '2026-05-06',
    pathDays: 60,
    daysIn: 7,
    status: 'on-track',
    trainer: 'Kira P.',
    scores: { 'Customer Service': 72, 'POS Operation': 80, 'Cash Handling': 95, 'Drink Prep': null, 'Food Handling': 85, 'Opening Procedure': null, 'Closing Procedure': null },
    trend: { 'Customer Service': 'up', 'POS Operation': 'flat', 'Cash Handling': 'up', 'Food Handling': 'up' },
    quals: ['New Hire Orientation'],
    trainingDone: 1,
    trainingTotal: 5,
    redFlags: [],
    notes: [
      { date: '2026-05-11', author: 'Kira P.', text: 'Asks great questions. Eager. Needs more shadowing on bar.' },
    ],
  },
  {
    id: 't3',
    name: 'Dani Park',
    position: 'Shift Lead (in training)',
    startDate: '2026-03-30',
    pathDays: 90,
    daysIn: 44,
    status: 'flagged',
    trainer: 'Marcus T.',
    scores: { 'Customer Service': 91, 'POS Operation': 88, 'Cash Handling': 72, 'Drink Prep': 90, 'Food Handling': 92, 'Opening Procedure': 78, 'Closing Procedure': 70 },
    trend: { 'Customer Service': 'flat', 'POS Operation': 'flat', 'Cash Handling': 'down', 'Drink Prep': 'up', 'Food Handling': 'flat', 'Opening Procedure': 'down', 'Closing Procedure': 'down' },
    quals: ['Food Handler Cert', 'New Hire Orientation', 'Cash Drawer Balancing'],
    trainingDone: 4,
    trainingTotal: 5,
    redFlags: [
      { kind: 'cash', severity: 'high', text: 'Cash drawer short $11 twice this week. Coaching conversation booked for Thursday.', date: '2026-05-12' },
      { kind: 'closing', severity: 'med', text: 'Two closing checklists incomplete in last 7 days.', date: '2026-05-10' },
    ],
    notes: [
      { date: '2026-05-12', author: 'Marcus T.', text: 'Strong with customers and bar. Numbers piece is the gap — scheduling 1:1 to walk through drawer count protocol.' },
    ],
  },
  {
    id: 't4',
    name: 'Jordan Lee',
    position: 'Barista',
    startDate: '2026-03-15',
    pathDays: 60,
    daysIn: 59,
    status: 'graduating',
    trainer: 'Devon R.',
    scores: { 'Customer Service': 96, 'POS Operation': 98, 'Cash Handling': 99, 'Drink Prep': 94, 'Food Handling': 97, 'Opening Procedure': 95, 'Closing Procedure': 92 },
    trend: { 'Customer Service': 'flat', 'POS Operation': 'up', 'Cash Handling': 'flat', 'Drink Prep': 'up', 'Food Handling': 'flat', 'Opening Procedure': 'up', 'Closing Procedure': 'up' },
    quals: ['Food Handler Cert', 'New Hire Orientation', 'Cash Drawer Balancing', 'Espresso Bar 101', 'Customer Recovery SOP'],
    trainingDone: 5,
    trainingTotal: 5,
    redFlags: [],
    notes: [
      { date: '2026-05-12', author: 'Devon R.', text: 'Ready to graduate. Recommending shift-lead track next.' },
    ],
  },
  {
    id: 't5',
    name: 'Riley Chen',
    position: 'Barista',
    startDate: '2026-04-29',
    pathDays: 60,
    daysIn: 14,
    status: 'behind',
    trainer: 'Kira P.',
    scores: { 'Customer Service': 68, 'POS Operation': 70, 'Cash Handling': 80, 'Drink Prep': 65, 'Food Handling': 78, 'Opening Procedure': null, 'Closing Procedure': null },
    trend: { 'Customer Service': 'flat', 'POS Operation': 'down', 'Cash Handling': 'flat', 'Drink Prep': 'flat', 'Food Handling': 'up' },
    quals: ['New Hire Orientation'],
    trainingDone: 1,
    trainingTotal: 5,
    redFlags: [
      { kind: 'schedule', severity: 'med', text: 'Behind by ~6 days on path. Two scheduled training sessions missed.', date: '2026-05-11' },
    ],
    notes: [],
  },
];

/* Sample weekly activity for charts */
const SAMPLE_WEEKLY_ACTIVITY = [
  { day: 'Mon', evals: 8 },
  { day: 'Tue', evals: 12 },
  { day: 'Wed', evals: 6 },
  { day: 'Thu', evals: 14 },
  { day: 'Fri', evals: 11 },
  { day: 'Sat', evals: 4 },
  { day: 'Sun', evals: 0 },
];

/* Helpers */
const initials = (name) => name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
const fmtDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const fmtDateShort = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
const dayDiff = (iso) => {
  const d = new Date(iso);
  return Math.max(0, Math.round((Date.now() - d.getTime()) / 86400000));
};

/* Sample trainers / evaluators */
const SAMPLE_TRAINERS = [
  {
    id: 'r1',
    name: 'Devon Reyes',
    role: 'Lead Barista',
    email: 'devon@roselane.coffee',
    phone: '+1 (415) 555-0184',
    joinedAt: '2024-09-15',
    location: 'Roselane — Marina',
    assignedTo: ['t1', 't4'],
    evals30d: 47,
    lastActive: '2 hours ago',
    color: 'oklch(0.6 0.1 145)',
    canScore: true,
    avatar: 'DR',
  },
  {
    id: 'r2',
    name: 'Kira Patel',
    role: 'Shift Lead',
    email: 'kira@roselane.coffee',
    phone: '+1 (415) 555-0117',
    joinedAt: '2025-02-03',
    location: 'Roselane — Marina',
    assignedTo: ['t2', 't5'],
    evals30d: 38,
    lastActive: 'Yesterday',
    color: 'oklch(0.6 0.1 30)',
    canScore: true,
    avatar: 'KP',
  },
  {
    id: 'r3',
    name: 'Marcus Tanaka',
    role: 'Store Manager',
    email: 'marcus@roselane.coffee',
    phone: '+1 (415) 555-0149',
    joinedAt: '2023-06-12',
    location: 'Roselane — Marina',
    assignedTo: ['t3'],
    evals30d: 22,
    lastActive: '30 minutes ago',
    color: 'oklch(0.55 0.12 265)',
    canScore: true,
    avatar: 'MT',
  },
  {
    id: 'r4',
    name: 'You (Owner)',
    role: 'Owner / Admin',
    email: 'owner@roselane.coffee',
    phone: '',
    joinedAt: '2023-01-01',
    location: 'All locations',
    assignedTo: [],
    evals30d: 14,
    lastActive: 'Active now',
    color: 'oklch(0.5 0.08 145)',
    canScore: true,
    avatar: 'YO',
    isYou: true,
  },
];

Object.assign(window, {
  DEFAULT_LABELS,
  INDUSTRY_TEMPLATES,
  SAMPLE_CONFIG,
  BLANK_CONFIG,
  SAMPLE_TRAINEES,
  SAMPLE_TRAINERS,
  SAMPLE_WEEKLY_ACTIVITY,
  initials, fmtDate, fmtDateShort, dayDiff,
});
