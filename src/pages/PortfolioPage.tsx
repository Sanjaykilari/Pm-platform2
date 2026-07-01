import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/PpmContext';
import { users } from '@/data/mockData';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Badge, Progress, Avatar, Tabs, TabsList, TabsTrigger, Select, Button
} from '@/components/ui/primitives';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  DollarSign, Briefcase, TrendingUp, AlertTriangle, CheckCircle2, Target, Calendar, Filter
} from 'lucide-react';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';

export default function PortfolioPage() {
  const { portfolios, projects, tasks } = useApp();
  const [activePortfolioId, setActivePortfolioId] = useState(portfolios[0]?.id || '');
  const [activeTab, setActiveTab] = useState('overview');

  const activePortfolio = portfolios.find((p) => p.id === activePortfolioId) || portfolios[0];

  const portfolioProjects = useMemo(() => {
    if (!activePortfolio) return [];
    return projects.filter((p) => p.portfolioId === activePortfolio.id);
  }, [activePortfolio, projects]);

  const portfolioTasks = useMemo(() => {
    return tasks.filter((t) => portfolioProjects.some((p) => p.id === t.projectId));
  }, [tasks, portfolioProjects]);

  const memberCapacity = useMemo(() => {
    const map: Record<string, { capacity: number; allocated: number; name: string; avatar: string; role: string }> = {};
    users.forEach((u) => {
      map[u.id] = { capacity: u.capacity, allocated: 0, name: u.name, avatar: u.avatar, role: u.role };
    });
    portfolioTasks.forEach((t) => {
      if (t.assigneeId && map[t.assigneeId]) {
        map[t.assigneeId].allocated += t.timeEstimate || 0;
      }
    });
    return Object.values(map);
  }, [portfolioTasks]);

  const budgetData = useMemo(() => {
    return (portfolioProjects || []).map((p) => ({
      name: p.name.length > 12 ? p.name.slice(0, 12) + '...' : p.name,
      budget: p.budget || 0,
      spent: p.spent || 0,
      remaining: (p.budget || 0) - (p.spent || 0),
    }));
  }, [portfolioProjects]);

  const timelineStart = useMemo(() => {
    if (!portfolioProjects || portfolioProjects.length === 0) return new Date();
    const dates = portfolioProjects.map((p) => p.startDate ? parseISO(p.startDate) : new Date());
    return new Date(Math.min(...dates.map((d) => d.getTime())));
  }, [portfolioProjects]);

  const timelineEnd = useMemo(() => {
    if (!portfolioProjects || portfolioProjects.length === 0) return addDays(new Date(), 30);
    const dates = portfolioProjects.map((p) => p.endDate ? parseISO(p.endDate) : new Date());
    return new Date(Math.max(...dates.map((d) => d.getTime())));
  }, [portfolioProjects]);

  const totalDays = Math.max(differenceInDays(timelineEnd, timelineStart), 1);

  const healthScore = useMemo(() => {
    if (portfolioProjects.length === 0) return 0;
    const scores = { green: 100, yellow: 70, red: 40 };
    const sum = portfolioProjects.reduce((acc, p) => acc + (scores[p.health] || 50), 0);
    return Math.round(sum / portfolioProjects.length);
  }, [portfolioProjects]);

  const cumulativeSpend = useMemo(() => {
    const data: { date: string; cumulative: number }[] = [];
    const days = Math.min(totalDays, 60);
    for (let i = 0; i <= days; i += 7) {
      const date = addDays(timelineStart, i);
      const ratio = i / days;
      const cumulative = Math.round((activePortfolio.spent || 0) * (ratio + Math.random() * 0.1));
      data.push({ date: format(date, 'MMM dd'), cumulative });
    }
    return data;
  }, [activePortfolio, timelineStart, totalDays]);

  if (!activePortfolio) {
    return <div className="p-8 text-center text-muted-foreground">No portfolios available.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portfolio Management</h1>
          <p className="text-muted-foreground">Strategic overview and resource allocation across programs</p>
        </div>
        <Select
          value={activePortfolioId}
          onChange={setActivePortfolioId}
          options={(portfolios || []).map((p) => ({ label: p.name, value: p.id }))}
          className="w-48"
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-violet-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">${((activePortfolio.budget || 0) / 1000000).toFixed(2)}M</p>
              </div>
              <DollarSign className="w-8 h-8 text-violet-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Budget Used</p>
                <p className="text-2xl font-bold">${((activePortfolio.spent || 0) / 1000000).toFixed(2)}M</p>
              </div>
              <TrendingUp className="w-8 h-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold">${(((activePortfolio.budget || 0) - (activePortfolio.spent || 0)) / 1000000).toFixed(2)}M</p>
              </div>
              <Target className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Projects</p>
                <p className="text-2xl font-bold">{portfolioProjects.length}</p>
              </div>
              <Briefcase className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 border-rose-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Health Score</p>
                <p className="text-2xl font-bold">{healthScore}%</p>
              </div>
              {healthScore >= 80 ? <CheckCircle2 className="w-8 h-8 text-emerald-400" /> : <AlertTriangle className="w-8 h-8 text-amber-400" />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs>
        <TabsList className="mb-4">
          {['overview', 'timeline', 'resources', 'financials'].map((tab) => (
            <TabsTrigger key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Strategic Goals */}
            <Card>
              <CardHeader>
                <CardTitle>Strategic Goals</CardTitle>
                <CardDescription>Objectives driving this portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(activePortfolio.strategicGoals || []).map((goal, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Target className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Goal {i + 1}</p>
                        <p className="text-sm text-muted-foreground">{goal}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolioProjects.map((project) => {
                const projectTasks = tasks.filter((t) => t.projectId === project.id);
                const team = [...new Set(projectTasks.map((t) => t.assigneeId).filter(Boolean))].map((id) => users.find((u) => u.id === id)).filter(Boolean);
                return (
                  <Card key={project.id} className="group hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                          <Link to={`/app/projects/${project.id}`} className="font-semibold hover:text-primary transition-colors">
                            {project.name}
                          </Link>
                        </div>
                        <Badge variant={project.health === 'green' ? 'default' : project.health === 'yellow' ? 'secondary' : 'destructive'}>
                          {project.health}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} />
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Budget</span>
                          <span>${(project.spent / 1000).toFixed(0)}k / ${(project.budget / 1000).toFixed(0)}k</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex -space-x-2">
                            {team.slice(0, 3).map((m) => (
                              <Avatar key={m!.id} src={m!.avatar} fallback={m!.name[0]} className="w-6 h-6 border-2 border-card" />
                            ))}
                            {team.length > 3 && (
                              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-card">+{team.length - 3}</div>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{projectTasks.length} tasks</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-4 h-[600px] flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><Calendar className="w-4 h-4 mr-1" /> {format(timelineStart, 'MMM yyyy')} - {format(timelineEnd, 'MMM yyyy')}</Button>
                <Button variant="outline" size="sm">Group by +</Button>
                <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1" /> Filter</Button>
              </div>
            </div>
            <div className="flex-1 bg-card rounded-md border border-border/50 overflow-hidden flex flex-col relative">
              {/* Header Grid */}
              <div className="flex bg-muted/30 border-b border-border/50 text-xs font-semibold text-muted-foreground">
                <div className="flex-1 min-w-[200px] border-r border-border/50">
                  <div className="text-center py-1 border-b border-border/50">Quarter 1</div>
                  <div className="flex">
                    <div className="flex-1 text-center py-2 border-r border-border/50">Month 1</div>
                    <div className="flex-1 text-center py-2 border-r border-border/50">Month 2</div>
                    <div className="flex-1 text-center py-2">Month 3</div>
                  </div>
                </div>
                <div className="flex-1 min-w-[200px] border-r border-border/50">
                  <div className="text-center py-1 border-b border-border/50">Quarter 2</div>
                  <div className="flex">
                    <div className="flex-1 text-center py-2 border-r border-border/50">Month 4</div>
                    <div className="flex-1 text-center py-2 border-r border-border/50">Month 5</div>
                    <div className="flex-1 text-center py-2">Month 6</div>
                  </div>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <div className="text-center py-1 border-b border-border/50">Quarter 3</div>
                  <div className="flex">
                    <div className="flex-1 text-center py-2 border-r border-border/50">Month 7</div>
                    <div className="flex-1 text-center py-2 border-r border-border/50">Month 8</div>
                    <div className="flex-1 text-center py-2">Month 9</div>
                  </div>
                </div>
              </div>
              {/* Body Grid with Lines */}
              <div className="flex-1 relative overflow-y-auto">
                <div className="absolute inset-0 flex pointer-events-none">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="flex-1 border-r border-border/50 border-dashed" />
                  ))}
                </div>
                
                {/* Timeline Cards */}
                <div className="relative pt-4 space-y-4 px-2">
                  {portfolioProjects.map((project) => {
                    const start = project.startDate ? parseISO(project.startDate) : new Date();
                    const end = project.endDate ? parseISO(project.endDate) : new Date();
                    const startOffset = (differenceInDays(start, timelineStart) / totalDays) * 100;
                    const width = (differenceInDays(end, start) / totalDays) * 100;
                    
                    return (
                      <Card key={project.id} className="relative shadow-md border-border/80 bg-card hover:border-primary/50 transition-colors z-10" style={{ left: `${Math.max(0, startOffset)}%`, width: `${Math.min(100 - startOffset, width)}%`, minWidth: '200px' }}>
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-sm leading-tight flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                              {project.name}
                            </h4>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                            {project.description}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <Badge className={`text-[10px] px-1.5 py-0.5 font-semibold ${
                              project.health === 'green' ? 'bg-emerald-500/20 text-emerald-500' :
                              project.health === 'yellow' ? 'bg-amber-500/20 text-amber-500' :
                              'bg-red-500/20 text-red-500'
                            }`}>{project.health === 'green' ? 'On track' : project.health === 'yellow' ? 'At risk' : 'Off track'}</Badge>
                            <span className="text-[10px] text-muted-foreground font-medium ml-auto">
                              {project.progress}% Complete
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <Card>
            <CardHeader>
              <CardTitle>Resource Allocation</CardTitle>
              <CardDescription>Team capacity across portfolio projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {memberCapacity.map((member) => {
                  const utilization = Math.round((member.allocated / member.capacity) * 100);
                  const color = utilization > 100 ? 'text-red-400' : utilization > 80 ? 'text-amber-400' : 'text-emerald-400';
                  return (
                    <div key={member.name} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <Avatar src={member.avatar} fallback={member.name[0]} className="w-10 h-10" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium">{member.name}</p>
                          <span className={`text-sm font-bold ${color}`}>{utilization}%</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{member.role}</span>
                          <span>•</span>
                          <span>{member.allocated}h / {member.capacity}h</span>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${utilization > 100 ? 'bg-red-500' : utilization > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(utilization, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'financials' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget vs Actual</CardTitle>
                <CardDescription>Per-project financial comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgetData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }}
                      formatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Legend />
                    <Bar dataKey="budget" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="spent" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Cumulative Spend</CardTitle>
                <CardDescription>Portfolio spend over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={cumulativeSpend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="date" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="cumulative" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </Tabs>
    </div>
  );
}
