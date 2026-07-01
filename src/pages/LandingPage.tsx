import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Badge, Avatar
} from '@/components/ui/primitives';
import {
  LayoutDashboard, Kanban, BarChart3, Users, Calendar, Zap,
  Check, ArrowRight, Play, Star, ChevronRight
} from 'lucide-react';

const features = [
  {
    icon: LayoutDashboard,
    title: 'Project Planning',
    description: 'Plan, schedule, and track projects with intuitive Gantt charts and timeline views.',
  },
  {
    icon: Kanban,
    title: 'Agile Boards',
    description: 'Run sprints with customizable Kanban and Scrum boards built for velocity.',
  },
  {
    icon: BarChart3,
    title: 'Portfolio Management',
    description: 'Get a 10,000-foot view of all initiatives across teams and departments.',
  },
  {
    icon: Calendar,
    title: 'Resource Planning',
    description: 'Balance workloads and optimize team capacity with smart resource allocation.',
  },
  {
    icon: Zap,
    title: 'BI Dashboards',
    description: 'Turn project data into actionable insights with real-time analytics and reports.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Discuss tasks, share files, and keep stakeholders aligned in one place.',
  },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'VP of Engineering, TechFlow',
    quote: 'NexusPM transformed how our engineering teams deliver. We shipped 40% faster after the switch.',
    initials: 'SC',
  },
  {
    name: 'Marcus Johnson',
    role: 'Director of PMO, Vertex Systems',
    quote: 'The portfolio dashboards alone are worth it. Finally, real-time visibility into every initiative.',
    initials: 'MJ',
  },
  {
    name: 'Elena Rodriguez',
    role: 'Product Lead, Horizon Labs',
    quote: 'Intuitive, powerful, and beautiful. Our teams actually enjoy using this every day.',
    initials: 'ER',
  },
];

const pricing = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever free',
    description: 'For small teams getting started.',
    features: ['Up to 3 projects', '5 team members', 'Basic Kanban boards', '7-day activity history'],
    cta: 'Start Free',
    variant: 'outline' as const,
  },
  {
    name: 'Professional',
    price: '$29',
    period: 'per user / month',
    description: 'For growing teams that need more power.',
    features: ['Unlimited projects', 'Unlimited members', 'Gantt & Timeline views', 'BI dashboards', 'Custom workflows', 'Priority support'],
    cta: 'Start Trial',
    variant: 'default' as const,
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact sales',
    description: 'For large organizations with advanced needs.',
    features: ['SSO & SAML', 'Advanced permissions', 'Dedicated success manager', 'Custom integrations', 'On-premise option', 'SLA guarantee'],
    cta: 'Contact Sales',
    variant: 'outline' as const,
  },
];

const logos = ['AcmeCorp', 'Globex', 'Initech', 'MassiveDynamic', 'StarkInd', 'WayneEnt'];

export default function LandingPage() {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLDivElement>(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="dark bg-slate-950 text-white min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">NexusPM</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/login')} className="text-slate-300 hover:text-white">Sign In</Button>
            <Button onClick={() => navigate('/register')}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-black" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-violet-600/20 blur-[120px] animate-pulse" />
        <div className="absolute top-40 right-1/4 h-96 w-96 rounded-full bg-fuchsia-600/15 blur-[140px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/2 h-64 w-64 rounded-full bg-blue-600/10 blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-violet-500/10 text-violet-400 border-violet-500/20 px-3 py-1">
              Now with AI-powered insights
            </Badge>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
              Work,{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">
                Simplified.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              The enterprise project management platform that brings clarity to chaos. Plan, execute, and deliver exceptional results—together.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/register')} className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={scrollToFeatures} className="gap-2">
                <Play className="h-4 w-4" /> See Demo
              </Button>
            </div>
            <p className="text-sm text-slate-500 mt-4">No credit card required. 14-day free trial.</p>
          </div>
        </div>
      </section>

      {/* Logo Strip */}
      <section className="border-y border-white/5 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p className="text-center text-sm text-slate-500 mb-8 uppercase tracking-widest">Trusted by teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {logos.map((logo) => (
              <span key={logo} className="text-lg md:text-xl font-bold text-slate-600 tracking-tight hover:text-slate-400 transition-colors cursor-default">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" ref={featuresRef} className="py-24 relative">
        <div className="absolute top-0 left-1/2 h-96 w-96 rounded-full bg-violet-600/5 blur-[120px] -translate-x-1/2" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Everything you need to ship great work</h2>
            <p className="text-slate-400 text-lg">Powerful tools for every stage of the project lifecycle, designed for modern teams.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-slate-900/50 border-white/5 hover:border-white/10 hover:bg-slate-900/80 transition-all group">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-5 w-5 text-violet-400" />
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                  <CardDescription className="text-slate-400">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interface Preview */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">A command center for your work</h2>
            <p className="text-slate-400 text-lg">Clean, focused, and built for speed. See everything that matters at a glance.</p>
          </div>
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-3xl blur-2xl opacity-50" />
            <div className="relative rounded-xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden">
              {/* Mock Browser Header */}
              <div className="h-10 bg-slate-950 border-b border-white/5 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="h-6 px-4 rounded-md bg-slate-900 text-xs text-slate-500 flex items-center">app.nexuspm.com/dashboard</div>
                </div>
              </div>
              {/* Mock Dashboard */}
              <div className="flex h-96">
                {/* Sidebar */}
                <div className="w-48 border-r border-white/5 bg-slate-950/50 p-4 hidden md:block">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 mb-6" />
                  <div className="space-y-2">
                    <div className="h-8 rounded-md bg-violet-500/20 w-full" />
                    <div className="h-8 rounded-md bg-slate-800/50 w-full" />
                    <div className="h-8 rounded-md bg-slate-800/50 w-full" />
                    <div className="h-8 rounded-md bg-slate-800/50 w-full" />
                    <div className="h-8 rounded-md bg-slate-800/50 w-full" />
                  </div>
                  <div className="mt-8 space-y-2">
                    <div className="h-6 rounded-md bg-slate-800/30 w-3/4" />
                    <div className="h-6 rounded-md bg-slate-800/30 w-1/2" />
                  </div>
                </div>
                {/* Main Content */}
                <div className="flex-1 p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-48 rounded-md bg-slate-800/50" />
                    <div className="h-8 w-24 rounded-md bg-violet-500/30" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 rounded-lg bg-slate-800/40 border border-white/5 p-4">
                      <div className="h-3 w-20 rounded bg-slate-700/50 mb-3" />
                      <div className="h-8 w-16 rounded bg-slate-700/50" />
                      <div className="h-2 w-full rounded bg-slate-700/30 mt-3" />
                    </div>
                    <div className="h-24 rounded-lg bg-slate-800/40 border border-white/5 p-4">
                      <div className="h-3 w-24 rounded bg-slate-700/50 mb-3" />
                      <div className="h-8 w-12 rounded bg-slate-700/50" />
                      <div className="h-2 w-full rounded bg-slate-700/30 mt-3" />
                    </div>
                    <div className="h-24 rounded-lg bg-slate-800/40 border border-white/5 p-4">
                      <div className="h-3 w-20 rounded bg-slate-700/50 mb-3" />
                      <div className="h-8 w-14 rounded bg-slate-700/50" />
                      <div className="h-2 w-full rounded bg-slate-700/30 mt-3" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-40 rounded-lg bg-slate-800/40 border border-white/5 p-4">
                      <div className="h-3 w-32 rounded bg-slate-700/50 mb-4" />
                      <div className="flex items-end gap-2 h-24">
                        <div className="flex-1 h-[40%] rounded bg-violet-500/40" />
                        <div className="flex-1 h-[70%] rounded bg-violet-500/40" />
                        <div className="flex-1 h-[55%] rounded bg-violet-500/40" />
                        <div className="flex-1 h-[85%] rounded bg-violet-500/40" />
                        <div className="flex-1 h-[60%] rounded bg-violet-500/40" />
                        <div className="flex-1 h-[90%] rounded bg-violet-500/40" />
                        <div className="flex-1 h-[75%] rounded bg-violet-500/40" />
                      </div>
                    </div>
                    <div className="h-40 rounded-lg bg-slate-800/40 border border-white/5 p-4">
                      <div className="h-3 w-24 rounded bg-slate-700/50 mb-4" />
                      <div className="space-y-2">
                        <div className="h-8 rounded bg-slate-700/30 flex items-center px-3 gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-400" />
                          <div className="h-2 flex-1 rounded bg-slate-700/50" />
                        </div>
                        <div className="h-8 rounded bg-slate-700/30 flex items-center px-3 gap-2">
                          <div className="h-2 w-2 rounded-full bg-yellow-400" />
                          <div className="h-2 flex-1 rounded bg-slate-700/50" />
                        </div>
                        <div className="h-8 rounded bg-slate-700/30 flex items-center px-3 gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-400" />
                          <div className="h-2 flex-1 rounded bg-slate-700/50" />
                        </div>
                        <div className="h-8 rounded bg-slate-700/30 flex items-center px-3 gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-400" />
                          <div className="h-2 flex-1 rounded bg-slate-700/50" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Loved by teams worldwide</h2>
            <p className="text-slate-400 text-lg">See what industry leaders say about their experience with NexusPM.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="bg-slate-900/50 border-white/5">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 mb-6 leading-relaxed">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <Avatar fallback={t.initials} className="bg-violet-500/20 text-violet-300" />
                    <div>
                      <p className="text-sm font-medium text-white">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-400 text-lg">Start free, scale as you grow. No hidden fees, no surprises.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricing.map((plan) => (
              <Card key={plan.name} className={`relative bg-slate-900/50 border-white/5 ${plan.popular ? 'border-violet-500/30 ring-1 ring-violet-500/20' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-500 text-white border-0 px-3">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-white text-lg">{plan.name}</CardTitle>
                  <CardDescription className="text-slate-400">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-sm text-slate-500 ml-2">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-slate-300">
                        <Check className="h-4 w-4 text-violet-400 mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.variant}
                    className="w-full"
                    onClick={() => plan.name === 'Enterprise' ? undefined : navigate('/register')}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-12 overflow-hidden">
            <div className="absolute top-0 left-1/2 h-64 w-64 rounded-full bg-violet-600/20 blur-[80px] -translate-x-1/2" />
            <h2 className="relative text-3xl md:text-4xl font-bold tracking-tight mb-4">Ready to simplify your work?</h2>
            <p className="relative text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of teams who have already made the switch to smarter project management.
            </p>
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/register')} className="gap-2">
                Get Started Free <ChevronRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">NexusPM</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Security</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Contact</a>
            </div>
            <p className="text-sm text-slate-600">© {new Date().getFullYear()} NexusPM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
