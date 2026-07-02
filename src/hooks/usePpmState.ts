// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

// ----- Constants -----
const STORAGE_KEY = 'aurappm_state_v2';
const AUTH_KEY = 'aurappm_auth_user';
const REGISTERED_PROFILES_KEY = 'aurappm_registered_profiles';

const loadRegisteredProfiles = () => {
  try {
    const serialized = localStorage.getItem(REGISTERED_PROFILES_KEY);
    if (serialized) {
      const list = JSON.parse(serialized);
      const cleaned = (list || []).filter(p => p.role !== 'Individual User');
      localStorage.setItem(REGISTERED_PROFILES_KEY, JSON.stringify(cleaned));
      return cleaned;
    }
  } catch (e) {
    console.warn('Failed to load registered profiles', e);
  }
  return [];
};

// ----- ID Generator -----
const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// ----- Profiles & Credentials -----
export const PROFILES = [
  { id: 'admin', username: 'admin', name: 'Sanjay Kilari', role: 'PPM Administrator', avatar: 'SK', password: 'admin', company: 'AuraCorp' },
  { id: 'port_mgr', username: 'sarah', name: 'Sarah Jenkins', role: 'Portfolio Manager', avatar: 'SJ', password: 'portfolio', company: 'AuraCorp' },
  { id: 'proj_mgr', username: 'alice', name: 'Alice Chen', role: 'Project Manager', avatar: 'AC', password: 'project', company: 'AuraCorp' },
  { id: 'indiv_user', username: 'individual', name: 'John Doe', role: 'Individual User', avatar: 'JD', password: 'individual', company: 'Individual' }
];

// ----- High‑Quality Mock Data -----
const mockResources = [
  { id: 'res-1', name: 'Alice Chen', role: 'Project Manager', weeklyCapacity: 40, hourlyRate: 75, company: 'AuraCorp' },
  { id: 'res-2', name: 'Bob Martinez', role: 'Developer', weeklyCapacity: 40, hourlyRate: 85, company: 'AuraCorp' },
  { id: 'res-3', name: 'Carla Johnson', role: 'Designer', weeklyCapacity: 35, hourlyRate: 70, company: 'AuraCorp' },
  { id: 'res-4', name: 'David Lee', role: 'QA Engineer', weeklyCapacity: 40, hourlyRate: 65, company: 'AuraCorp' },
  { id: 'res-5', name: 'Eva Kim', role: 'Business Analyst', weeklyCapacity: 40, hourlyRate: 80, company: 'AuraCorp' },
];

const mockPortfolios = [
  { id: 'port-1', name: 'Digital Transformation', description: 'Enterprise-wide digitalization initiatives.', owner: 'Sarah Jenkins', strategicAlignment: 9, budgetTarget: 500000, company: 'AuraCorp' },
  { id: 'port-2', name: 'Infrastructure Modernization', description: 'Core cloud and hardware upgrades.', owner: 'David Lee', strategicAlignment: 8, budgetTarget: 300000, company: 'AuraCorp' }
];

const mockPrograms = [
  { id: 'prog-1', name: 'ERP Modernization', description: 'Consolidating business databases.', portfolioId: 'port-1', owner: 'Alice Chen', sponsor: 'Executive Board', status: 'on-track', startDate: '2026-06-01', endDate: '2026-12-31', company: 'AuraCorp' },
  { id: 'prog-2', name: 'Customer Experience Portal', description: 'New web and mobile customer faces.', portfolioId: 'port-1', owner: 'Sarah Jenkins', sponsor: 'Sales Division', status: 'at-risk', startDate: '2026-07-01', endDate: '2026-11-30', company: 'AuraCorp' },
  { id: 'prog-3', name: 'Hybrid Cloud Infrastructure', description: 'Migration to AWS & private data centers.', portfolioId: 'port-2', owner: 'David Lee', sponsor: 'IT Ops', status: 'on-track', startDate: '2026-05-01', endDate: '2026-12-15', company: 'AuraCorp' }
];

const mockTasks = [
  {
    id: 'task-1',
    title: 'Design system architecture',
    description: 'Create high-level system architecture diagram and choose tech stack.',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2026-06-15',
    assigneeId: 'res-2',
    allocatedHours: 16,
    isMilestone: false,
    predecessorId: null,
    subtasks: [
      { id: 'sub-1', title: 'Research microservices', completed: true },
      { id: 'sub-2', title: 'Draft architecture diagram', completed: false },
    ],
    comments: [
      { id: 'com-1', author: 'Alice Chen', text: 'Please align with company standards.', timestamp: '2026-06-05T09:00:00Z' },
    ],
  },
  {
    id: 'task-2',
    title: 'User authentication module',
    description: 'Implement login, registration, and password reset flows.',
    status: 'not-started',
    priority: 'high',
    dueDate: '2026-07-01',
    assigneeId: 'res-2',
    allocatedHours: 24,
    isMilestone: false,
    predecessorId: 'task-1',
    subtasks: [],
    comments: [],
  },
  {
    id: 'task-3',
    title: 'Dashboard wireframes',
    description: 'Create wireframes for main project dashboard view.',
    status: 'completed',
    priority: 'medium',
    dueDate: '2026-06-10',
    assigneeId: 'res-3',
    allocatedHours: 10,
    isMilestone: true,
    predecessorId: null,
    subtasks: [
      { id: 'sub-3', title: 'Sketch layouts', completed: true },
    ],
    comments: [],
  },
];

const mockProjects = [
  {
    id: 'proj-1',
    name: 'AuraPPM Core',
    description: 'Revamp of the central PPM platform – feature enhancements and performance improvements.',
    owner: 'Alice Chen',
    company: 'AuraCorp',
    visibility: 'public',
    dueDate: '2026-08-30',
    status: 'healthy',
    capexBudget: 150000,
    opexBudget: 50000,
    businessUnit: 'Core Platform',
    category: 'Applications',
    startDate: '2026-06-01',
    endDate: '2026-12-31',
    strategicAlignment: 8,
    portfolioId: 'port-1',
    programId: 'prog-1',
    // RAID lists
    assumptions: [
      { id: 'ass-1', title: 'Stable cloud infrastructure', description: 'AWS services remain available without major outages', owner: 'Alice Chen', status: 'validated' },
    ],
    issues: [
      { id: 'iss-1', title: 'API rate limiting', description: 'Third-party API has low rate limit and may block bulk operations', priority: 'high', owner: 'Bob Martinez', status: 'open' },
    ],
    dependencies: [
      { id: 'dep-1', title: 'Figma License Renewal', description: 'Must be renewed before Q3 start to avoid access loss', type: 'external', owner: 'Carla Johnson', status: 'blocked' },
    ],
    tasks: mockTasks,
    risks: [
      {
        id: 'risk-1',
        title: 'Third‑party API deprecation',
        likelihood: 3,
        impact: 4,
        status: 'open',
        mitigation: 'Identify alternative APIs before migration.',
        owner: 'Bob Martinez',
      },
    ],
    capexItems: [
      { id: 'capex-1', name: 'Cloud infrastructure (AWS)', cost: 45000, category: 'Infrastructure' },
      { id: 'capex-2', name: 'License for Figma Enterprise', cost: 12000, category: 'Software' },
    ],
    // New structures
    actionItems: [
      { id: 'act-1', title: 'Confirm server endpoints with Dev1', assigneeId: 'res-2', dueDate: '2026-06-18', status: 'pending' },
      { id: 'act-2', title: 'Document auth endpoints API', assigneeId: 'res-2', dueDate: '2026-06-25', status: 'completed' }
    ],
    decisions: [
      { id: 'dec-1', title: 'Use React Context for State Management', deciders: 'Alice Chen, Bob Martinez', dateDecided: '2026-06-02', optionsConsidered: 'Redux, MobX, React Context', notes: 'React Context was chosen for simplicity, speed of building, and lightweight bundle.' }
    ],
    requirements: [
      { id: 'req-1', title: 'Unified authentication wrapper', description: 'The application must validate user credentials and scopes for Admin, PM, Portfolio Mgr.', category: 'functional', priority: 'high', wbsTaskId: 'task-2', status: 'approved' }
    ],
    targets: [
      { id: 'tar-1', title: 'Core Launch OKR', metric: 'User Adoption Rate', targetValue: '95%', actualValue: '0%', type: 'okr', status: 'on-track' },
      { id: 'tar-2', title: 'Budget Limit', metric: 'Expense Variance', targetValue: '< 5%', actualValue: '1.2%', type: 'financial', status: 'on-track' }
    ],
    discussions: [
      { id: 'com-1', targetType: 'project', targetId: 'proj-1', text: 'Excited to kick off Phase 1 development!', author: 'Sanjay Kilari', timestamp: '2026-06-06T12:00:00Z' }
    ]
  },
  {
    id: 'proj-2',
    name: 'Mobile Companion App',
    description: 'Native mobile app for on‑the‑go task updates and approvals.',
    owner: 'David Lee',
    company: 'AuraCorp',
    visibility: 'public',
    dueDate: '2026-09-15',
    status: 'warning',
    capexBudget: 80000,
    opexBudget: 30000,
    businessUnit: 'IT Services',
    category: 'Applications',
    startDate: '2026-07-01',
    endDate: '2026-10-31',
    strategicAlignment: 7,
    portfolioId: 'port-1',
    programId: 'prog-2',
    assumptions: [],
    issues: [],
    dependencies: [],
    tasks: [
      {
        id: 'task-4',
        title: 'Push notifications',
        description: 'Integrate Firebase Cloud Messaging for real‑time updates.',
        status: 'not-started',
        priority: 'high',
        dueDate: '2026-07-20',
        assigneeId: 'res-4',
        allocatedHours: 20,
        isMilestone: false,
        predecessorId: null,
        subtasks: [],
        comments: [],
      },
    ],
    risks: [
      {
        id: 'risk-2',
        title: 'Device fragmentation',
        likelihood: 4,
        impact: 3,
        status: 'mitigated',
        mitigation: 'Target Android 12+ and iOS 15+; use responsive UI components.',
        owner: 'David Lee',
      },
    ],
    capexItems: [
      { id: 'capex-3', name: 'Developer devices (iPad, Android tablets)', cost: 8000, category: 'Hardware' },
    ],
    actionItems: [],
    decisions: [],
    requirements: [],
    targets: [],
    discussions: []
  },
  {
    id: 'proj-3',
    name: 'Data Analytics Dashboard',
    description: 'Interactive dashboards for project KPIs, budget tracking, and resource utilization.',
    owner: 'Eva Kim',
    company: 'AuraCorp',
    visibility: 'private',
    dueDate: '2026-11-01',
    status: 'risk',
    capexBudget: 200000,
    opexBudget: 60000,
    businessUnit: 'Core Platform',
    category: 'Infrastructure',
    startDate: '2026-08-01',
    endDate: '2026-12-15',
    strategicAlignment: 9,
    portfolioId: 'port-2',
    programId: 'prog-3',
    assumptions: [],
    issues: [],
    dependencies: [],
    tasks: [],
    risks: [
      {
        id: 'risk-3',
        title: 'Data privacy compliance (GDPR)',
        likelihood: 5,
        impact: 5,
        status: 'open',
        mitigation: 'Engage legal team early; implement anonymisation techniques.',
        owner: 'Eva Kim',
      },
    ],
    capexItems: [
      { id: 'capex-4', name: 'Tableau Server license', cost: 35000, category: 'Software' },
    ],
    actionItems: [],
    decisions: [],
    requirements: [],
    targets: [],
    discussions: []
  },
];

const mockEpics = [
  { id: 'epic-1', title: 'User Authentication Redesign', description: 'Overhaul the login and signup flows', status: 'in_progress', progress: 45, ownerId: 'res-1', projectId: 'proj-1', startDate: '2026-06-01', targetDate: '2026-08-15' },
  { id: 'epic-2', title: 'Dashboard V2', description: 'New analytics and widgets for the main dashboard', status: 'planning', progress: 0, ownerId: 'res-2', projectId: 'proj-1', startDate: '2026-07-01', targetDate: '2026-10-15' },
];

const mockReleases = [
  { id: 'rel-1', name: 'v2.0 Beta', description: 'Initial beta rollout for key customers', status: 'in_progress', projectId: 'proj-1', targetDate: '2026-08-30' },
  { id: 'rel-2', name: 'v2.0 GA', description: 'General availability for v2.0', status: 'planned', projectId: 'proj-1', targetDate: '2026-10-31' },
];

const mockIntakeRequests = [
  {
    id: 'intake-1',
    name: 'Employee Portal Redesign',
    description: 'Modernise the internal employee portal with self‑service HR features.',
    proposedBy: 'Carla Johnson',
    company: 'AuraCorp',
    budgetEstimate: 120000,
    strategicAlignment: 8,
    resourceComplexity: 6,
    status: 'pending',
    score: Math.round((8 * 10) / 6),
  },
  {
    id: 'intake-2',
    name: 'Automated Testing Suite',
    description: 'Build a CI/CD‑integrated test automation framework to reduce QA cycles.',
    proposedBy: 'David Lee',
    company: 'AuraCorp',
    budgetEstimate: 70000,
    strategicAlignment: 9,
    resourceComplexity: 4,
    status: 'pending',
    score: Math.round((9 * 10) / 4),
  },
];

const initialMockState = {
  resources: mockResources,
  projects: mockProjects,
  intakeRequests: mockIntakeRequests,
  portfolios: mockPortfolios,
  programs: mockPrograms,
  epics: mockEpics,
  releases: mockReleases,
};

// ----- Helper to load state from localStorage -----
const loadState = () => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized) {
      const parsed = JSON.parse(serialized);
      if (parsed && parsed.resources && parsed.projects && parsed.intakeRequests) {
        // Clean up projects belonging to deleted individual users
        const defaultOwners = ['John Doe', 'Sanjay Kilari', 'Sarah Jenkins', 'Alice Chen', 'Bob Martinez', 'Carla Johnson', 'David Lee', 'Eva Kim'];
        const cleanedProjects = (parsed.projects || []).filter(p => {
          return defaultOwners.includes(p.owner) || p.id === 'proj-1' || p.id === 'proj-2' || p.id === 'proj-3';
        });

        return {
          ...initialMockState,
          ...parsed,
          portfolios: parsed.portfolios || mockPortfolios,
          programs: parsed.programs || mockPrograms,
          epics: parsed.epics || mockEpics,
          releases: parsed.releases || mockReleases,
          projects: cleanedProjects.map(p => ({
            ...p,
            actionItems: p.actionItems || [],
            decisions: p.decisions || [],
            requirements: p.requirements || [],
            targets: p.targets || [],
            discussions: p.discussions || [],
            portfolioId: p.portfolioId || null,
            programId: p.programId || null
          }))
        };
      }
    }
  } catch (error) {
    console.warn("Failed to load state from localStorage", error);
  }
  return initialMockState;
};

// ----- Helper to load auth user -----
const loadAuthUser = () => {
  try {
    const serialized = localStorage.getItem(AUTH_KEY);
    if (serialized) {
      const parsed = JSON.parse(serialized);
      // Automatically log out if user was a custom individual user
      if (parsed && parsed.role === 'Individual User' && parsed.id !== 'indiv_user') {
        localStorage.removeItem(AUTH_KEY);
        return null;
      }
      if (parsed && parsed.role) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load user session', e);
  }
  return null;
};

// ----- Pure calculation helpers -----
const findResource = (resources, id) => resources.find((r) => r.id === id);

const calculateOpex = (project, resources) => {
  return (project.tasks || []).reduce((total, task) => {
    const resource = findResource(resources, task.assigneeId);
    const rate = resource ? resource.hourlyRate : 0;
    return total + ((task.allocatedHours || 0) * rate);
  }, 0);
};

const calculateProjectProgress = (project) => {
  if (!project.tasks || project.tasks.length === 0) return 0;
  const completed = project.tasks.filter((t) => t.status === 'completed').length;
  return Math.round((completed / project.tasks.length) * 100);
};

const calculateProjectCost = (project, resources) => {
  const capexTotal = (project.capexItems || []).reduce((sum, item) => sum + item.cost, 0);
  const opexTotal = calculateOpex(project, resources);
  return capexTotal + opexTotal;
};

// ----- Custom Hook -----
const usePpmState = () => {
  const [state, setState] = useState(loadState);
  const [currentUser, setCurrentUser] = useState(loadAuthUser);
  const [registeredProfiles, setRegisteredProfiles] = useState(loadRegisteredProfiles);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to persist state to localStorage', error);
    }
  }, [state]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(AUTH_KEY);
      }
    } catch (e) {
      console.error('Failed to persist auth session', e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(REGISTERED_PROFILES_KEY, JSON.stringify(registeredProfiles));
    } catch (error) {
      console.error('Failed to persist registered profiles', error);
    }
  }, [registeredProfiles]);

  // --- Auth operations ---
  const login = useCallback((username, password) => {
    const input = username.toLowerCase();
    
    // Check default profiles
    let user = PROFILES.find(p => {
      const defaultEmail = `${p.username}@example.com`.toLowerCase();
      return (p.username === input || defaultEmail === input) && p.password === password;
    });
    
    // Check registered profiles
    if (!user) {
      user = registeredProfiles.find(p => 
        (p.username.toLowerCase() === input || (p.email && p.email.toLowerCase() === input)) && 
        p.password === password
      );
    }
    
    if (user) {
      setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, error: 'Invalid username or password' };
  }, [registeredProfiles]);


  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const changeCurrentUserProfile = useCallback((profileId) => {
    let profile = PROFILES.find(p => p.id === profileId);
    if (!profile) {
      profile = registeredProfiles.find(p => p.id === profileId);
    }
    if (profile) {
      setCurrentUser(profile);
    }
  }, [registeredProfiles]);

  const registerProfile = useCallback((profileData) => {
    const firstInitial = (profileData.firstName || '').substring(0, 1).toUpperCase();
    const lastInitial = (profileData.lastName || '').substring(0, 1).toUpperCase();
    const avatar = `${firstInitial}${lastInitial}` || 'U';
    const fullName = `${profileData.firstName} ${profileData.lastName}`;
    
    const newProfile = {
      id: `user-${Date.now()}`,
      username: profileData.username.toLowerCase(),
      name: fullName,
      role: profileData.role, // PPM Administrator, Portfolio Manager, Project Manager, Individual User
      avatar,
      password: profileData.password,
      email: profileData.email.toLowerCase(),
      age: profileData.age,
      company: profileData.company,
      location: profileData.location,
      theme: profileData.theme || 'Light',
      industry: profileData.industry || 'Technology'
    };
    
    let isDuplicate = false;
    setRegisteredProfiles((prev) => {
      const exists = prev.some(p => p.username === newProfile.username || p.email === newProfile.email);
      if (exists) {
        isDuplicate = true;
        return prev;
      }
      return [...prev, newProfile];
    });
    
    if (isDuplicate) {
      return { success: false, error: 'Username or email already exists' };
    }

    // Generate a beautiful sample project for individual workspace
    const sampleProjectId = `proj-${Date.now()}`;
    const sampleProject = {
      id: sampleProjectId,
      name: 'My Standalone Workspace Launch',
      description: 'Welcome to your individual project workspace! Here you can schedule WBS tasks, manage RAID logs, trace requirements, and set OKRs.',
      owner: fullName,
      company: newProfile.company,
      visibility: 'private',
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'healthy',
      capexBudget: 15000,
      opexBudget: 8000,
      businessUnit: 'Individual Workspace',
      category: 'Applications',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      strategicAlignment: 9,
      portfolioId: null,
      programId: null,
      tasks: [
        {
          id: `task-${Date.now()}-1`,
          title: 'Draft Project Plan & Milestones',
          description: 'Establish milestones, assign hours, and structure the WBS workplan.',
          status: 'in-progress',
          priority: 'high',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          assigneeId: 'res-1',
          allocatedHours: 12,
          isMilestone: false,
          predecessorId: null,
          subtasks: [],
          comments: []
        },
        {
          id: `task-${Date.now()}-2`,
          title: 'Review RAID Mitigation Strategies',
          description: 'Identify risks, document decisions, and list dependencies in the RAID-AD log.',
          status: 'not-started',
          priority: 'medium',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          assigneeId: 'res-1',
          allocatedHours: 8,
          isMilestone: false,
          predecessorId: null,
          subtasks: [],
          comments: []
        }
      ],
      risks: [
        {
          id: `risk-${Date.now()}-1`,
          title: 'Unfamiliar with AuraPPM',
          likelihood: 2,
          impact: 2,
          status: 'open',
          mitigation: 'Explore WBS task tracking and collaborative comments.',
          owner: fullName
        }
      ],
      capexItems: [],
      assumptions: [],
      issues: [],
      dependencies: [],
      actionItems: [
        { id: `act-${Date.now()}-1`, title: 'Complete first task walkthrough', assigneeId: 'res-1', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'pending' }
      ],
      decisions: [],
      requirements: [
        { id: `req-${Date.now()}-1`, title: 'Familiarization Spec', description: 'User must interact with WBS scheduling tasks.', category: 'functional', priority: 'medium', wbsTaskId: `task-${Date.now()}-1`, status: 'approved' }
      ],
      targets: [
        { id: `tar-${Date.now()}-1`, title: 'Setup OKR', metric: 'Workspace configuration completed', targetValue: '100%', actualValue: '50%', type: 'okr', status: 'on-track' }
      ],
      discussions: [
        { id: `com-${Date.now()}-1`, targetType: 'project', targetId: sampleProjectId, text: 'This comment board is for contextual project discussions.', author: fullName, timestamp: new Date().toISOString() }
      ]
    };

    setState(prev => ({
      ...prev,
      projects: [...prev.projects, sampleProject]
    }));

    setCurrentUser(newProfile);
    return { success: true, user: newProfile };
  }, []);

  const resetPasswordByEmail = useCallback((email, newPassword) => {
    const lowerEmail = email.toLowerCase();

    // Check if it's one of the default profiles
    const defaultUser = PROFILES.find(p => {
      const defaultEmail = `${p.username}@example.com`;
      return defaultEmail === lowerEmail || p.username === lowerEmail;
    });

    if (defaultUser) {
      // Copy to registeredProfiles with custom password override
      setRegisteredProfiles((prev) => {
        const otherProfiles = prev.filter(p => p.username !== defaultUser.username);
        return [...otherProfiles, {
          ...defaultUser,
          email: `${defaultUser.username}@example.com`,
          password: newPassword
        }];
      });
      return { success: true };
    }

    // Check registered profiles
    const registeredUser = registeredProfiles.find(p => p.email.toLowerCase() === lowerEmail);
    if (registeredUser) {
      setRegisteredProfiles((prev) =>
        prev.map(p => p.email.toLowerCase() === lowerEmail ? { ...p, password: newPassword } : p)
      );
      return { success: true };
    }

    return { success: false, error: 'No user found with this email address' };
  }, [registeredProfiles]);

  // --- Portfolio & Program CRUD ---
  const addPortfolio = useCallback((portfolio) => {
    setState((prev) => ({
      ...prev,
      portfolios: [...prev.portfolios, { 
        ...portfolio, 
        id: generateId(), 
        strategicAlignment: Number(portfolio.strategicAlignment) || 5, 
        budgetTarget: Number(portfolio.budgetTarget) || 0,
        company: portfolio.company || currentUser?.company || (currentUser?.role === 'Individual User' ? 'Individual' : 'AuraCorp')
      }]
    }));
  }, [currentUser]);

  const updatePortfolioDetails = useCallback((portfolioId, updatedDetails) => {
    setState((prev) => ({
      ...prev,
      portfolios: prev.portfolios.map((p) =>
        p.id === portfolioId ? { ...p, ...updatedDetails, strategicAlignment: Number(updatedDetails.strategicAlignment || p.strategicAlignment), budgetTarget: Number(updatedDetails.budgetTarget || p.budgetTarget) } : p
      ),
    }));
  }, []);

  const deletePortfolio = useCallback((portfolioId) => {
    setState((prev) => ({
      ...prev,
      portfolios: prev.portfolios.filter(p => p.id !== portfolioId),
      // Orphan all child programs
      programs: prev.programs.map(pr => pr.portfolioId === portfolioId ? { ...pr, portfolioId: null } : pr)
    }));
  }, []);

  const addProgram = useCallback((program) => {
    setState((prev) => ({
      ...prev,
      programs: [...prev.programs, { 
        ...program, 
        id: generateId(),
        company: program.company || currentUser?.company || (currentUser?.role === 'Individual User' ? 'Individual' : 'AuraCorp')
      }]
    }));
  }, [currentUser]);

  const updateProgramDetails = useCallback((programId, updatedDetails) => {
    setState((prev) => ({
      ...prev,
      programs: prev.programs.map((pr) =>
        pr.id === programId ? { ...pr, ...updatedDetails } : pr
      ),
    }));
  }, []);

  const deleteProgram = useCallback((programId) => {
    setState((prev) => ({
      ...prev,
      programs: prev.programs.filter(pr => pr.id !== programId),
      // Orphan all child projects
      projects: prev.projects.map(p => p.programId === programId ? { ...p, programId: null } : p)
    }));
  }, []);

  // --- Core projects operations ---
  const addProject = useCallback(async (project) => {
    const newProject = {
      ...project,
      id: project.id || crypto.randomUUID(), // Use valid UUIDs for new projects
      businessUnit: project.businessUnit || 'Core Platform',
      category: project.category || 'Infrastructure',
      startDate: project.startDate || '2026-06-01',
      endDate: project.endDate || '2026-12-31',
      strategicAlignment: Number(project.strategicAlignment) || 5,
      portfolioId: project.portfolioId || null,
      programId: project.programId || null,
      assumptions: project.assumptions || [],
      issues: project.issues || [],
      dependencies: project.dependencies || [],
      tasks: project.tasks || [],
      risks: project.risks || [],
      capexItems: project.capexItems || [],
      actionItems: project.actionItems || [],
      decisions: project.decisions || [],
      requirements: project.requirements || [],
      targets: project.targets || [],
      discussions: project.discussions || [],
      company: project.company || currentUser?.company || (currentUser?.role === 'Individual User' ? 'Individual' : 'AuraCorp'),
      visibility: project.visibility || (currentUser?.role === 'Project Manager' || currentUser?.role === 'Individual User' ? 'private' : 'public')
    };

    // Optimistic UI update
    setState((prev) => ({
      ...prev,
      projects: [...prev.projects, newProject],
    }));

    // Sync to Supabase
    try {
      // Need a valid workspace_id for RLS, we'll bypass or use a dummy for now if missing.
      // Wait, RLS requires workspace_id. Since we don't have workspaces UI yet, 
      // the user will need to disable RLS or create a default workspace.
      // For now, we attempt insert.
      await supabase.from('projects').insert([{
        id: newProject.id,
        name: newProject.name,
        status: newProject.status,
        health: newProject.status === 'healthy' ? 'Green' : 'Yellow', // map mock status to db health
        start_date: newProject.startDate,
        end_date: newProject.endDate,
        budget: newProject.capexBudget || 0,
        assumptions: newProject.assumptions,
        issues: newProject.issues,
        dependencies: newProject.dependencies,
        risks: newProject.risks,
        capex_items: newProject.capexItems,
        action_items: newProject.actionItems,
        decisions: newProject.decisions,
        requirements: newProject.requirements,
        targets: newProject.targets,
        discussions: newProject.discussions
      }]);
    } catch(err) {
      console.error("Supabase insert failed:", err);
    }

  }, [currentUser]);

  const updateProjectDetails = useCallback(async (projectId, updatedDetails) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === projectId ? { ...p, ...updatedDetails } : p
      ),
    }));

    try {
      await supabase.from('projects').update({
        name: updatedDetails.name,
        status: updatedDetails.status,
        health: updatedDetails.health,
        budget: updatedDetails.capexBudget,
        assumptions: updatedDetails.assumptions,
        issues: updatedDetails.issues,
        dependencies: updatedDetails.dependencies,
        risks: updatedDetails.risks,
        capex_items: updatedDetails.capexItems,
        action_items: updatedDetails.actionItems,
        decisions: updatedDetails.decisions,
        requirements: updatedDetails.requirements,
        targets: updatedDetails.targets,
        discussions: updatedDetails.discussions
      }).eq('id', projectId);
    } catch(err) {
      console.error("Supabase update failed:", err);
    }
  }, []);

  // --- Resources and Intake ---
  const addResource = useCallback((resource) => {
    setState((prev) => ({
      ...prev,
      resources: [
        ...prev.resources,
        {
          ...resource,
          id: generateId(),
          weeklyCapacity: Number(resource.weeklyCapacity) || 40,
          hourlyRate: Number(resource.hourlyRate) || 0,
          company: resource.company || currentUser?.company || (currentUser?.role === 'Individual User' ? 'Individual' : 'AuraCorp')
        }
      ]
    }));
  }, [currentUser]);

  const updateResource = useCallback((resourceId, updatedFields) => {
    setState((prev) => ({
      ...prev,
      resources: prev.resources.map((r) =>
        r.id === resourceId ? { ...r, ...updatedFields } : r
      ),
    }));
  }, []);

  const addIntakeRequest = useCallback((request) => {
    const strategicAlignment = Number(request.strategicAlignment) || 5;
    const financialValue = Number(request.financialValue) || 5;
    const techFeasibility = Number(request.techFeasibility) || 5;
    const riskImpact = Number(request.riskImpact) || 5;
    const resourceComplexity = Number(request.resourceComplexity) || 5;
    const score = strategicAlignment + financialValue + techFeasibility + (11 - riskImpact) + (11 - resourceComplexity);

    setState((prev) => ({
      ...prev,
      intakeRequests: [
        ...prev.intakeRequests,
        {
          ...request,
          id: generateId(),
          score,
          status: 'pending',
          company: request.company || currentUser?.company || (currentUser?.role === 'Individual User' ? 'Individual' : 'AuraCorp')
        },
      ],
    }));
  }, [currentUser]);

  const approveIntakeRequest = useCallback((requestId, adminNotes = '') => {
    setState((prev) => {
      const request = prev.intakeRequests.find((r) => r.id === requestId);
      if (!request || request.status !== 'pending') return prev;

      const updatedIntakeRequests = prev.intakeRequests.map((r) =>
        r.id === requestId ? { ...r, status: 'approved', adminNotes } : r
      );

      const newProject = {
        id: generateId(),
        name: request.name,
        description: request.description,
        owner: request.proposedBy,
        dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'healthy',
        capexBudget: request.budgetEstimate,
        opexBudget: 0,
        businessUnit: 'Core Platform',
        category: 'Applications',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        strategicAlignment: request.strategicAlignment || 5,
        portfolioId: null,
        programId: null,
        tasks: [],
        risks: [],
        capexItems: [],
        assumptions: [],
        issues: [],
        dependencies: [],
        actionItems: [],
        decisions: [],
        requirements: [],
        targets: [],
        discussions: [],
        company: request.company || currentUser?.company || (currentUser?.role === 'Individual User' ? 'Individual' : 'AuraCorp'),
        visibility: currentUser?.role === 'Individual User' ? 'private' : 'public'
      };

      return {
        ...prev,
        intakeRequests: updatedIntakeRequests,
        projects: [...prev.projects, newProject],
      };
    });
  }, [currentUser]);

  const declineIntakeRequest = useCallback((requestId, adminNotes = '') => {
    setState((prev) => ({
      ...prev,
      intakeRequests: prev.intakeRequests.map((r) =>
        r.id === requestId ? { ...r, status: 'declined', adminNotes } : r
      ),
    }));
  }, []);

  // --- Project sub-array helper ---
  const updateProjectArray = useCallback((projectId, arrayName, updater) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === projectId
          ? { ...p, [arrayName]: updater(p[arrayName] || []) }
          : p
      ),
    }));
  }, []);

  // --- Tasks operations ---
  const addTask = useCallback((projectId, task) => {
    updateProjectArray(projectId, 'tasks', (tasks) => [
      ...tasks,
      {
        ...task,
        id: generateId(),
        isMilestone: task.isMilestone || false,
        predecessorId: task.predecessorId || null,
        subtasks: task.subtasks || [],
        comments: task.comments || [],
        allocatedHours: Number(task.allocatedHours) || 0,
      },
    ]);
  }, [updateProjectArray]);

  const updateTask = useCallback((projectId, taskId, updatedTask) => {
    updateProjectArray(projectId, 'tasks', (tasks) =>
      tasks.map((t) => {
        if (t.id === taskId) {
          const merged = { ...t, ...updatedTask };
          if (updatedTask.allocatedHours !== undefined) {
            merged.allocatedHours = Number(updatedTask.allocatedHours) || 0;
          }
          if (updatedTask.isMilestone !== undefined) {
            merged.isMilestone = updatedTask.isMilestone;
          }
          if (updatedTask.predecessorId !== undefined) {
            merged.predecessorId = updatedTask.predecessorId || null;
          }
          return merged;
        }
        return t;
      })
    );
  }, [updateProjectArray]);

  const deleteTask = useCallback((projectId, taskId) => {
    updateProjectArray(projectId, 'tasks', (tasks) =>
      tasks.filter((t) => t.id !== taskId)
    );
  }, [updateProjectArray]);

  // --- Risks operations ---
  const addRisk = useCallback((projectId, risk) => {
    updateProjectArray(projectId, 'risks', (risks) => [
      ...risks,
      { ...risk, id: generateId() },
    ]);
  }, [updateProjectArray]);

  const updateRisk = useCallback((projectId, riskId, updatedRisk) => {
    updateProjectArray(projectId, 'risks', (risks) =>
      risks.map((r) => (r.id === riskId ? { ...r, ...updatedRisk } : r))
    );
  }, [updateProjectArray]);

  const deleteRisk = useCallback((projectId, riskId) => {
    updateProjectArray(projectId, 'risks', (risks) =>
      risks.filter((r) => r.id !== riskId)
    );
  }, [updateProjectArray]);

  // --- RAID log operations ---
  const addAssumption = useCallback((projectId, assumption) => {
    updateProjectArray(projectId, 'assumptions', (assumptions) => [
      ...assumptions,
      { ...assumption, id: generateId() },
    ]);
  }, [updateProjectArray]);

  const updateAssumption = useCallback((projectId, assumptionId, updatedAssumption) => {
    updateProjectArray(projectId, 'assumptions', (assumptions) =>
      assumptions.map((a) => (a.id === assumptionId ? { ...a, ...updatedAssumption } : a))
    );
  }, [updateProjectArray]);

  const deleteAssumption = useCallback((projectId, assumptionId) => {
    updateProjectArray(projectId, 'assumptions', (assumptions) =>
      assumptions.filter((a) => a.id !== assumptionId)
    );
  }, [updateProjectArray]);

  const addIssue = useCallback((projectId, issue) => {
    updateProjectArray(projectId, 'issues', (issues) => [
      ...issues,
      { ...issue, id: generateId() },
    ]);
  }, [updateProjectArray]);

  const updateIssue = useCallback((projectId, issueId, updatedIssue) => {
    updateProjectArray(projectId, 'issues', (issues) =>
      issues.map((i) => (i.id === issueId ? { ...i, ...updatedIssue } : i))
    );
  }, [updateProjectArray]);

  const deleteIssue = useCallback((projectId, issueId) => {
    updateProjectArray(projectId, 'issues', (issues) =>
      issues.filter((i) => i.id !== issueId)
    );
  }, [updateProjectArray]);

  const addDependency = useCallback((projectId, dependency) => {
    updateProjectArray(projectId, 'dependencies', (dependencies) => [
      ...dependencies,
      { ...dependency, id: generateId() },
    ]);
  }, [updateProjectArray]);

  const updateDependency = useCallback((projectId, dependencyId, updatedDependency) => {
    updateProjectArray(projectId, 'dependencies', (dependencies) =>
      dependencies.map((d) => (d.id === dependencyId ? { ...d, ...updatedDependency } : d))
    );
  }, [updateProjectArray]);

  const deleteDependency = useCallback((projectId, dependencyId) => {
    updateProjectArray(projectId, 'dependencies', (dependencies) =>
      dependencies.filter((d) => d.id !== dependencyId)
    );
  }, [updateProjectArray]);

  const addCapexItem = useCallback((projectId, item) => {
    updateProjectArray(projectId, 'capexItems', (items) => [
      ...items,
      { ...item, id: generateId(), cost: Number(item.cost) || 0 },
    ]);
  }, [updateProjectArray]);

  const deleteCapexItem = useCallback((projectId, itemId) => {
    updateProjectArray(projectId, 'capexItems', (items) =>
      items.filter((i) => i.id !== itemId)
    );
  }, [updateProjectArray]);

  // --- Action Items operations ---
  const addActionItem = useCallback((projectId, item) => {
    updateProjectArray(projectId, 'actionItems', (items) => [
      ...items,
      { ...item, id: generateId(), status: item.status || 'pending' }
    ]);
  }, [updateProjectArray]);

  const updateActionItem = useCallback((projectId, itemId, updatedFields) => {
    updateProjectArray(projectId, 'actionItems', (items) =>
      items.map((i) => i.id === itemId ? { ...i, ...updatedFields } : i)
    );
  }, [updateProjectArray]);

  const deleteActionItem = useCallback((projectId, itemId) => {
    updateProjectArray(projectId, 'actionItems', (items) =>
      items.filter((i) => i.id !== itemId)
    );
  }, [updateProjectArray]);

  // --- Decisions operations ---
  const addDecision = useCallback((projectId, decision) => {
    updateProjectArray(projectId, 'decisions', (decisions) => [
      ...decisions,
      { ...decision, id: generateId() }
    ]);
  }, [updateProjectArray]);

  const updateDecision = useCallback((projectId, decisionId, updatedFields) => {
    updateProjectArray(projectId, 'decisions', (decisions) =>
      decisions.map((d) => d.id === decisionId ? { ...d, ...updatedFields } : d)
    );
  }, [updateProjectArray]);

  const deleteDecision = useCallback((projectId, decisionId) => {
    updateProjectArray(projectId, 'decisions', (decisions) =>
      decisions.filter((d) => d.id !== decisionId)
    );
  }, [updateProjectArray]);

  // --- Requirements operations ---
  const addRequirement = useCallback((projectId, requirement) => {
    updateProjectArray(projectId, 'requirements', (requirements) => [
      ...requirements,
      { ...requirement, id: generateId(), status: requirement.status || 'draft' }
    ]);
  }, [updateProjectArray]);

  const updateRequirement = useCallback((projectId, reqId, updatedFields) => {
    updateProjectArray(projectId, 'requirements', (requirements) =>
      requirements.map((r) => r.id === reqId ? { ...r, ...updatedFields } : r)
    );
  }, [updateProjectArray]);

  const deleteRequirement = useCallback((projectId, reqId) => {
    updateProjectArray(projectId, 'requirements', (requirements) =>
      requirements.filter((r) => r.id !== reqId)
    );
  }, [updateProjectArray]);

  // --- Targets operations ---
  const addTarget = useCallback((projectId, target) => {
    updateProjectArray(projectId, 'targets', (targets) => [
      ...targets,
      { ...target, id: generateId(), status: target.status || 'on-track' }
    ]);
  }, [updateProjectArray]);

  const updateTarget = useCallback((projectId, targetId, updatedFields) => {
    updateProjectArray(projectId, 'targets', (targets) =>
      targets.map((t) => t.id === targetId ? { ...t, ...updatedFields } : t)
    );
  }, [updateProjectArray]);

  const deleteTarget = useCallback((projectId, targetId) => {
    updateProjectArray(projectId, 'targets', (targets) =>
      targets.filter((t) => t.id !== targetId)
    );
  }, [updateProjectArray]);

  // --- Discussions operations ---
  const addDiscussionComment = useCallback((projectId, targetType, targetId, text, author) => {
    const comment = {
      id: generateId(),
      targetType,
      targetId,
      text,
      author,
      timestamp: new Date().toISOString()
    };
    updateProjectArray(projectId, 'discussions', (comments) => [
      ...comments,
      comment
    ]);
  }, [updateProjectArray]);

  // --- Read-only calculations ---
  const calcOpex = useCallback(
    (project) => calculateOpex(project, state.resources),
    [state.resources]
  );

  const calcProjectProgress = useCallback(
    (project) => calculateProjectProgress(project),
    []
  );

  const calcProjectCost = useCallback(
    (project) => calculateProjectCost(project, state.resources),
    [state.resources]
  );

  const replaceTasks = useCallback((projectId, newTasks) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === projectId ? { ...p, tasks: newTasks } : p
      ),
    }));
  }, []);

  const addEpic = useCallback((epic) => {
    setState((prev) => ({
      ...prev,
      epics: [...prev.epics, { ...epic, id: generateId() }]
    }));
  }, []);

  const updateEpic = useCallback((epicId, updatedFields) => {
    setState((prev) => ({
      ...prev,
      epics: prev.epics.map((e) => e.id === epicId ? { ...e, ...updatedFields } : e),
    }));
  }, []);

  const deleteEpic = useCallback((epicId) => {
    setState((prev) => ({
      ...prev,
      epics: prev.epics.filter(e => e.id !== epicId),
    }));
  }, []);

  const addRelease = useCallback((release) => {
    setState((prev) => ({
      ...prev,
      releases: [...prev.releases, { ...release, id: generateId() }]
    }));
  }, []);

  const updateRelease = useCallback((releaseId, updatedFields) => {
    setState((prev) => ({
      ...prev,
      releases: prev.releases.map((r) => r.id === releaseId ? { ...r, ...updatedFields } : r),
    }));
  }, []);

  const deleteRelease = useCallback((releaseId) => {
    setState((prev) => ({
      ...prev,
      releases: prev.releases.filter(r => r.id !== releaseId),
    }));
  }, []);

  return {
    state,
    currentUser,
    registeredProfiles,
    login,
    logout,
    registerProfile,
    changeCurrentUserProfile,
    resetPasswordByEmail,
    addPortfolio,
    updatePortfolioDetails,
    deletePortfolio,
    addProgram,
    updateProgramDetails,
    deleteProgram,
    addProject,
    updateProjectDetails,
    addResource,
    updateResource,
    addIntakeRequest,
    approveIntakeRequest,
    declineIntakeRequest,
    addTask,
    updateTask,
    deleteTask,
    replaceTasks,
    addRisk,
    updateRisk,
    deleteRisk,
    addCapexItem,
    deleteCapexItem,
    addAssumption,
    updateAssumption,
    deleteAssumption,
    addIssue,
    updateIssue,
    deleteIssue,
    addDependency,
    updateDependency,
    deleteDependency,
    addActionItem,
    updateActionItem,
    deleteActionItem,
    addDecision,
    updateDecision,
    deleteDecision,
    addRequirement,
    updateRequirement,
    deleteRequirement,
    addTarget,
    updateTarget,
    deleteTarget,
    addDiscussionComment,
    calculateOpex: calcOpex,
    calculateProjectCost: calcProjectCost,
    calculateProjectProgress: calcProjectProgress,
    addEpic,
    updateEpic,
    deleteEpic,
    addRelease,
    updateRelease,
    deleteRelease,
  };
};

export default usePpmState;
