// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Kanban, BarChart3, Users, Calendar, Zap,
  Check, ArrowRight, Play, Star, ChevronRight, X, Menu,
  Target, Layers, Map, Package, Clock, TrendingUp, Shield,
  Cpu, GitBranch, Globe, Lock, Sparkles, ChevronDown
} from 'lucide-react';

// ─── Animated counter hook ───────────────────────────────────────
function useCounter(end: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

// ─── Intersection observer hook ──────────────────────────────────
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Gradient text ───────────────────────────────────────────────
function GradientText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 ${className}`}>
      {children}
    </span>
  );
}

// ─── Feature pill ────────────────────────────────────────────────
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20">
      {children}
    </span>
  );
}

// ─── Pricing card ────────────────────────────────────────────────
interface PricingTier {
  name: string;
  price: string;
  period?: string;
  badge?: string;
  description: string;
  features: string[];
  addons?: string[];
  cta: string;
  ctaAction?: () => void;
  highlight?: boolean;
  enterprise?: boolean;
}

function PricingCard({ tier, index }: { tier: PricingTier; index: number }) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl
        ${tier.highlight
          ? 'border-violet-500 bg-gradient-to-b from-violet-950/80 to-slate-950 shadow-violet-500/20 shadow-xl'
          : 'border-white/10 bg-slate-900/60 hover:border-white/20'
        }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {tier.highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg">
            MOST POPULAR
          </span>
        </div>
      )}
      {tier.badge && (
        <div className="absolute -top-3 right-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
            {tier.badge}
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-1">{tier.name}</h3>
        <p className="text-slate-400 text-sm mb-4">{tier.description}</p>
        {tier.enterprise ? (
          <div className="text-3xl font-bold text-white">Custom</div>
        ) : (
          <div className="flex items-end gap-1">
            <span className="text-4xl font-extrabold text-white">{tier.price}</span>
            {tier.period && <span className="text-slate-400 text-sm pb-1">/{tier.period}</span>}
          </div>
        )}
      </div>

      <ul className="space-y-2.5 flex-1 mb-6">
        {tier.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
            <Check className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>

      {tier.addons && tier.addons.length > 0 && (
        <div className="mb-5 pt-4 border-t border-white/10">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Available Add-ons</p>
          <ul className="space-y-1.5">
            {tier.addons.map((a, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={tier.ctaAction}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95
          ${tier.highlight
            ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600 shadow-lg shadow-violet-500/30'
            : tier.enterprise
              ? 'bg-slate-800 text-white border border-white/10 hover:bg-slate-700'
              : 'bg-slate-800 text-white hover:bg-slate-700'
          }`}
      >
        {tier.cta}
      </button>
    </div>
  );
}

// ─── Onboarding Modal ───────────────────────────────────────────
function OnboardingModal({ onClose, onComplete }: { onClose: () => void; onComplete: (type: 'personal' | 'team') => void }) {
  const [step, setStep] = useState(0);
  const [workspaceType, setWorkspaceType] = useState<'personal' | 'team' | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
            style={{ width: `${((step + 1) / 2) * 100}%` }}
          />
        </div>

        <div className="p-8">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>

          {step === 0 && (
            <div className="space-y-6">
              <div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome to NexusPM</h2>
                <p className="text-slate-400">Let's set up your workspace. How will you be using NexusPM?</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setWorkspaceType('personal')}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${workspaceType === 'personal' ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 hover:border-white/20 bg-slate-800/50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                      <Target className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Personal Workspace</p>
                      <p className="text-xs text-slate-400 mt-0.5">Manage your own projects and goals</p>
                    </div>
                    {workspaceType === 'personal' && <Check className="w-5 h-5 text-violet-400 ml-auto" />}
                  </div>
                </button>

                <button
                  onClick={() => setWorkspaceType('team')}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${workspaceType === 'team' ? 'border-fuchsia-500 bg-fuchsia-500/10' : 'border-white/10 hover:border-white/20 bg-slate-800/50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-fuchsia-500/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-fuchsia-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Team / Organization</p>
                      <p className="text-xs text-slate-400 mt-0.5">Collaborate with your team on shared projects</p>
                    </div>
                    {workspaceType === 'team' && <Check className="w-5 h-5 text-fuchsia-400 ml-auto" />}
                  </div>
                </button>
              </div>

              <button
                disabled={!workspaceType}
                onClick={() => setStep(1)}
                className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:from-violet-600 hover:to-fuchsia-600 transition-all"
              >
                Continue →
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4">
                  {workspaceType === 'personal' ? <Target className="w-6 h-6 text-white" /> : <Users className="w-6 h-6 text-white" />}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {workspaceType === 'personal' ? 'Personal Workspace' : 'Team Workspace'}
                </h2>
                <p className="text-slate-400 text-sm">
                  {workspaceType === 'personal'
                    ? 'Your personal workspace is ready. You get 1 project free, forever.'
                    : 'Set up your team workspace and invite members to collaborate.'}
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-white/10">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">What you get</p>
                  <ul className="space-y-2">
                    {(workspaceType === 'personal' ? [
                      '1 project free forever',
                      'Full RAID log & WBS timeline',
                      'Task management & milestones',
                      'OKR tracking & targets',
                      'Add modules as you grow',
                    ] : [
                      'Unlimited team members',
                      'Portfolio & program management',
                      'Resource allocation & capacity',
                      'BI dashboards & reports',
                      'Enterprise security (SSO, audit)',
                    ]).map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                        <Check className="w-4 h-4 text-violet-400 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => onComplete(workspaceType!)}
                className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600 transition-all"
              >
                Get Started for Free
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Screenshot showcase ─────────────────────────────────────────
function ScreenshotTabs() {
  const [active, setActive] = useState(0);
  const tabs = [
    { label: 'Portfolio Dashboard', src: '/screenshots/dashboard.png', desc: 'Real-time portfolio health with budget tracking and project status at a glance.' },
    { label: 'Gantt Timeline', src: '/screenshots/gantt.png', desc: 'Visual Gantt charts for ideas and milestones with month-by-month clarity.' },
    { label: 'Product Roadmap', src: '/screenshots/roadmap.png', desc: 'Drag-and-drop roadmap Kanban with impact scoring and customer segment tagging.' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-center">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${active === i ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 bg-slate-950">
        {/* Fake browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-slate-800 rounded-md px-3 py-1 text-xs text-slate-500 text-center">app.nexuspm.io</div>
          </div>
        </div>
        <div className="relative overflow-hidden" style={{ paddingBottom: '56.25%' }}>
          {tabs.map((tab, i) => (
            <img
              key={i}
              src={tab.src}
              alt={tab.label}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${active === i ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            />
          ))}
        </div>
      </div>
      <p className="text-center text-slate-400 text-sm">{tabs[active].desc}</p>
    </div>
  );
}

// ─── Main Landing Page ───────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activePricingToggle, setActivePricingToggle] = useState<'monthly' | 'annual'>('monthly');

  const statsRef = useInView();
  const c1 = useCounter(10000, 2000, statsRef.inView);
  const c2 = useCounter(99, 2000, statsRef.inView);
  const c3 = useCounter(40, 2000, statsRef.inView);

  const handleOnboardingComplete = (type: 'personal' | 'team') => {
    setShowOnboarding(false);
    navigate('/register');
  };

  // ── Pricing tiers ──────────────────────────────────────────────
  const pricingTiers: PricingTier[] = [
    {
      name: 'Personal',
      price: 'Free',
      badge: 'Lifetime',
      description: 'Perfect for solo project managers and freelancers.',
      features: [
        '1 project free forever',
        'Full RAID log (Risk, Assumption, Issue, Dependency)',
        'WBS task scheduling & milestones',
        'OKR targets & performance tracking',
        'Financials (CapEx/OpEx budgeting)',
        'Requirements traceability',
        'Discussion boards',
      ],
      addons: [
        'Product Module (+$9/mo)',
        'AI Assistant (+$7/mo)',
        'Advanced Reports (+$5/mo)',
        'Extra Projects (+$4/project/mo)',
      ],
      cta: 'Start Free',
      ctaAction: () => setShowOnboarding(true),
    },
    {
      name: 'Standard',
      price: activePricingToggle === 'monthly' ? '$29' : '$23',
      period: 'user/mo',
      description: 'For growing teams managing multiple projects.',
      features: [
        'Unlimited projects',
        'Up to 20 team members',
        'Portfolio & program management',
        'Resource allocation & capacity planning',
        'All Personal tier features',
        'BI dashboards & analytics',
        'Priority support',
      ],
      addons: [
        'Product Module (+$12/user/mo)',
        'AI Assistant (+$9/user/mo)',
        'SSO Integration (+$15/mo)',
      ],
      cta: 'Start Trial',
      ctaAction: () => navigate('/register'),
      highlight: true,
    },
    {
      name: 'Standard + Product',
      price: activePricingToggle === 'monthly' ? '$44' : '$35',
      period: 'user/mo',
      description: 'Standard plus the full Product Management Module.',
      features: [
        'Everything in Standard',
        '✦ Product Management Module included',
        'Idea capture & scoring (RICE framework)',
        'Product roadmap (Kanban + drag & drop)',
        'Gantt timeline for ideas',
        'Epic & release management',
        'Impact assessment boards',
      ],
      cta: 'Start Trial',
      ctaAction: () => navigate('/register'),
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations with advanced security & compliance needs.',
      features: [
        'Unlimited users & projects',
        'All Standard + Product features',
        'SSO & SAML authentication',
        'Audit logs & compliance exports',
        'Custom SLA & uptime guarantees',
        'Dedicated success manager',
        'On-premise or private cloud option',
      ],
      cta: 'Contact Sales',
      ctaAction: () => window.location.href = 'mailto:sales@nexuspm.io',
      enterprise: true,
    },
  ];

  // ── Add-on modules ─────────────────────────────────────────────
  const addons = [
    { icon: Map, name: 'Product Management Module', price: '$9–$12', desc: 'Ideas, roadmap, Gantt timeline, impact scoring, epics & releases.', color: 'from-violet-500 to-fuchsia-500' },
    { icon: Cpu, name: 'AI Assistant', price: '$7–$9', desc: 'AI-powered task suggestions, risk predictions, and smart summaries.', color: 'from-blue-500 to-cyan-500' },
    { icon: BarChart3, name: 'Advanced Reports', price: '$5', desc: 'Custom BI dashboards, PDF exports, and executive report templates.', color: 'from-emerald-500 to-teal-500' },
    { icon: GitBranch, name: 'Developer Tools', price: '$6', desc: 'GitHub/Jira sync, CI/CD pipeline tracking, and deployment logs.', color: 'from-orange-500 to-amber-500' },
    { icon: Shield, name: 'Enterprise Security', price: '$15/mo', desc: 'SSO/SAML, audit logs, IP whitelisting, and data residency controls.', color: 'from-red-500 to-pink-500' },
    { icon: Globe, name: 'Multi-region Sync', price: '$10', desc: 'Workspace sync across regions with conflict resolution and offline mode.', color: 'from-indigo-500 to-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal
          onClose={() => setShowOnboarding(false)}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* ── BACKGROUND GRID ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-fuchsia-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-cyan-600/8 rounded-full blur-[120px]" />
      </div>

      {/* ── NAV ── */}
      <nav className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-slate-950/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-extrabold tracking-tight">NexusPM</span>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#screenshots" className="hover:text-white transition-colors">Screenshots</a>
              <a href="#addons" className="hover:text-white transition-colors">Add-ons</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors">Log in</Link>
              <button
                onClick={() => setShowOnboarding(true)}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600 transition-all shadow-lg shadow-violet-500/20"
              >
                Get Started Free
              </button>
            </div>

            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMobileMenu(m => !m)}>
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden bg-slate-900 border-t border-white/5 px-4 py-4 space-y-3 text-sm">
            {['Features','Screenshots','Add-ons','Pricing'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="block text-slate-300 hover:text-white" onClick={() => setMobileMenu(false)}>{item}</a>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <Link to="/login" className="text-center py-2 rounded-lg border border-white/10 text-slate-300">Log in</Link>
              <button onClick={() => { setShowOnboarding(true); setMobileMenu(false); }} className="py-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold">Get Started Free</button>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 px-4 text-center">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border border-violet-500/30 bg-violet-500/5 text-violet-300 mb-8 animate-pulse">
            <Sparkles className="w-3 h-3" />
            Now with AI-powered project intelligence
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-6">
            The only PM tool
            <br />
            <GradientText>your team will love</GradientText>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Enterprise-grade project portfolio management — from solo freelancers to Fortune 500 teams.
            Plans, tracks, and delivers everything in one beautiful workspace.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={() => setShowOnboarding(true)}
              className="group px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600 transition-all shadow-2xl shadow-violet-500/30 flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#screenshots"
              className="px-8 py-4 rounded-xl text-base font-semibold border border-white/10 text-slate-300 hover:border-white/20 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              See it in action
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-400" /> No credit card required</span>
            <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-400" /> 1 project free forever</span>
            <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-400" /> Setup in 2 minutes</span>
          </div>
        </div>

        {/* Floating pills */}
        <div className="hidden lg:flex absolute left-8 top-40 flex-col gap-3 animate-[float_6s_ease-in-out_infinite]">
          <div className="bg-slate-900/80 backdrop-blur border border-white/10 rounded-xl p-3 shadow-xl text-xs font-medium text-slate-300 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            5 projects on track
          </div>
          <div className="bg-slate-900/80 backdrop-blur border border-white/10 rounded-xl p-3 shadow-xl text-xs font-medium text-slate-300 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-400" />
            Budget 94% utilized
          </div>
        </div>
        <div className="hidden lg:flex absolute right-8 top-40 flex-col gap-3 animate-[float_8s_ease-in-out_infinite_1s]">
          <div className="bg-slate-900/80 backdrop-blur border border-white/10 rounded-xl p-3 shadow-xl text-xs font-medium text-slate-300 flex items-center gap-2">
            <Star className="w-3 h-3 text-amber-400" />
            Sprint velocity: 42 pts
          </div>
          <div className="bg-slate-900/80 backdrop-blur border border-white/10 rounded-xl p-3 shadow-xl text-xs font-medium text-slate-300 flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-cyan-400" />
            Ideas scored: 12 new
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section ref={statsRef.ref} className="relative py-16 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { value: c1, suffix: '+', label: 'Projects managed' },
            { value: c2, suffix: '%', label: 'On-time delivery rate' },
            { value: c3, suffix: '%', label: 'Faster team velocity' },
          ].map(({ value, suffix, label }) => (
            <div key={label} className="space-y-2">
              <div className="text-5xl font-black">
                <GradientText>{value.toLocaleString()}{suffix}</GradientText>
              </div>
              <p className="text-slate-400 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SCREENSHOTS ── */}
      <section id="screenshots" className="relative py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Pill><Star className="w-3 h-3" />Real application screenshots</Pill>
            <h2 className="text-4xl font-bold mt-4 mb-4">See exactly what you're getting</h2>
            <p className="text-slate-400 max-w-xl mx-auto">No mockups. These are live screenshots from the actual NexusPM interface.</p>
          </div>
          <ScreenshotTabs />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Pill><Zap className="w-3 h-3" />Everything you need</Pill>
            <h2 className="text-4xl font-bold mt-4 mb-4">Built for every layer of your organization</h2>
            <p className="text-slate-400 max-w-xl mx-auto">From solo tasks to enterprise portfolios — one platform, infinite scale.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: LayoutDashboard, title: 'Portfolio Management', desc: 'Real-time portfolio health, budget tracking, and strategic alignment across all projects.', color: 'from-violet-500 to-fuchsia-500' },
              { icon: Calendar, title: 'Gantt & WBS Timeline', desc: 'Visual task scheduling with Gantt charts, milestones, dependencies, and predecessor links.', color: 'from-blue-500 to-cyan-500' },
              { icon: Target, title: 'OKR & Goal Tracking', desc: 'Define objectives, link key results to projects, and track strategic goal achievement.', color: 'from-emerald-500 to-teal-500' },
              { icon: Shield, title: 'RAID Log Management', desc: 'Track Risks, Assumptions, Issues, and Dependencies in a single structured log.', color: 'from-orange-500 to-amber-500' },
              { icon: Users, title: 'Resource Planning', desc: 'Visualize capacity, allocate hours, and prevent team burnout with smart workload views.', color: 'from-red-500 to-pink-500' },
              { icon: Map, title: 'Product Roadmap', desc: 'Drag-and-drop Now/Next/Later roadmap with idea scoring, impact assessment, and epics.', color: 'from-indigo-500 to-purple-500' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="group p-6 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-white/15 transition-all hover:-translate-y-1">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCT MODULE HIGHLIGHT ── */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-950/30 to-fuchsia-950/20" />
        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Pill><Map className="w-3 h-3" />Product Management Module</Pill>
              <h2 className="text-4xl font-bold mt-4 mb-6">
                The complete<br /><GradientText>Product OS</GradientText>
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                A dedicated product management layer — sold separately or bundled. Designed for PMs who need more than just task management.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Sparkles, label: 'Idea Capture & Scoring', desc: 'RICE scoring, impact vs effort matrix, customer segment tagging.' },
                  { icon: Map, label: 'Drag-and-drop Roadmap', desc: 'Now/Next/Later Kanban board with instant drag-and-drop status updates.' },
                  { icon: Calendar, label: 'Gantt Timeline', desc: 'Ideas plotted as horizontal Gantt bars across a 12-month calendar grid.' },
                  { icon: Layers, label: 'Epics & Releases', desc: 'Group features into epics and manage version releases with full CRUD.' },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/50 border border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-white">{label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex gap-4">
                <button onClick={() => setShowOnboarding(true)} className="px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600 transition-all">
                  Try Product Module Free
                </button>
                <a href="#pricing" className="px-6 py-3 rounded-xl text-sm font-semibold border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all">
                  See pricing
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-violet-500/10">
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" /><div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  </div>
                  <span className="text-xs text-slate-500 ml-2">Product Roadmap — NexusPM</span>
                </div>
                <img src="/screenshots/roadmap.png" alt="Product Roadmap" className="w-full" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-slate-900 border border-violet-500/30 rounded-xl p-3 shadow-xl">
                <p className="text-xs font-bold text-violet-400">✦ Product Module</p>
                <p className="text-xs text-slate-400">Available as add-on from $9/mo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ADD-ONS ── */}
      <section id="addons" className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Pill><Package className="w-3 h-3" />Modular add-ons</Pill>
            <h2 className="text-4xl font-bold mt-4 mb-4">Build your perfect workspace</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Start free, add power exactly where you need it. Each module is a standalone enhancement.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addons.map(({ icon: Icon, name, price, desc, color }) => (
              <div key={name} className="group p-6 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-white/15 transition-all hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2 py-1 rounded-full">{price}/mo</span>
                </div>
                <h3 className="font-bold text-white mb-2">{name}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                <button className="mt-4 text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
                  Learn more <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Pill><Star className="w-3 h-3" />Simple, transparent pricing</Pill>
            <h2 className="text-4xl font-bold mt-4 mb-4">Plans that grow with you</h2>
            <p className="text-slate-400 max-w-xl mx-auto mb-8">Start free. Scale when you need. No surprise fees.</p>

            {/* Monthly / Annual toggle */}
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-white/10">
              {(['monthly', 'annual'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setActivePricingToggle(t)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activePricingToggle === t ? 'bg-violet-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  {t === 'monthly' ? 'Monthly' : 'Annual'}
                  {t === 'annual' && <span className="ml-2 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full">-20%</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingTiers.map((tier, i) => (
              <PricingCard key={tier.name} tier={tier} index={i} />
            ))}
          </div>

          <div className="mt-12 p-6 rounded-2xl bg-slate-900/60 border border-white/10 text-center">
            <p className="text-slate-400 text-sm">
              All plans include: SSL encryption · 99.9% uptime SLA · GDPR compliant · Data export anytime
              <span className="text-slate-500"> · </span>
              <span className="text-violet-400">Need a custom plan? <a href="mailto:sales@nexuspm.io" className="underline hover:text-violet-300">Contact our sales team</a></span>
            </p>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by teams worldwide</h2>
            <p className="text-slate-400">Real feedback from real project managers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah Chen', role: 'VP of Engineering, TechFlow', quote: 'NexusPM transformed how our engineering teams deliver. We shipped 40% faster after the switch.', initials: 'SC' },
              { name: 'Marcus Johnson', role: 'Director of PMO, Vertex Systems', quote: 'The portfolio dashboards alone are worth it. Finally, real-time visibility into every initiative.', initials: 'MJ' },
              { name: 'Elena Rodriguez', role: 'Product Lead, Horizon Labs', quote: 'The Product Module\'s roadmap and Gantt timeline are exceptional. Our PMs live in it every day.', initials: 'ER' },
            ].map(({ name, role, quote, initials }) => (
              <div key={name} className="p-6 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition-all">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold">{initials}</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{name}</p>
                    <p className="text-xs text-slate-400">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative p-12 rounded-3xl overflow-hidden border border-violet-500/20 bg-gradient-to-b from-violet-950/40 to-slate-950">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15),transparent_70%)]" />
            <h2 className="text-4xl font-black mb-4 relative">
              Ready to transform<br /><GradientText>how your team works?</GradientText>
            </h2>
            <p className="text-slate-400 mb-8 relative">Join thousands of teams already using NexusPM. Start free today — no credit card needed.</p>
            <button
              onClick={() => setShowOnboarding(true)}
              className="relative px-10 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600 transition-all shadow-2xl shadow-violet-500/40 inline-flex items-center gap-2 group"
            >
              Start Your Free Workspace
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold">NexusPM</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">The enterprise PPM platform built for modern teams.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Product Module', 'Add-ons', 'Changelog'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Security', 'GDPR'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">{title}</h4>
                <ul className="space-y-2">
                  {links.map(link => (
                    <li key={link}><a href="#" className="text-slate-500 hover:text-white text-xs transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
            <p className="text-slate-500 text-xs">© 2026 NexusPM. All rights reserved.</p>
            <p className="text-slate-500 text-xs">Built with ❤️ for project managers everywhere</p>
          </div>
        </div>
      </footer>

      {/* Float animation keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
}
