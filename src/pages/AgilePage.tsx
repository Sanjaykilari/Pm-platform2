import { useState, useMemo } from 'react';
import { useApp } from '@/context/PpmContext';
import { users } from '@/data/mockData';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Badge, Avatar, Tabs, TabsList, TabsTrigger, Button, Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  Input, Select, ScrollArea, Progress
} from '@/components/ui/primitives';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Plus, ChevronDown, Calendar, Target, Zap, GripVertical,
  CheckCircle2, AlertCircle, Filter, Search, MessageSquare, List, Layout,
  Map, Layers, Package, Clock, TrendingUp, Link as LinkIcon, BarChart3, Users
} from 'lucide-react';
import { format, parseISO, differenceInDays, isPast, addMonths } from 'date-fns';

export interface Idea {
  id: string;
  summary: string;
  theme: string;
  roadmapStatus: 'Now' | 'Next' | 'Later' | 'Won\'t do';
  state: 'On track' | 'At risk' | 'Pending';
  comments: number;
  insights: number;
  impact: number;
  effort: number;
  score: number;
  customerSegments: string[];
  documents: string;
  deliveryProgress: number;
  startDate?: Date;
  endDate?: Date;
}

const mockIdeas: Idea[] = [
  { id: 'idea-1', summary: 'New rewards program', theme: 'Increase revenue', roadmapStatus: 'Now', state: 'On track', comments: 0, insights: 2, impact: 5, effort: 1, score: 5, customerSegments: ['Enterprise'], documents: 'https://go.a...', deliveryProgress: 60, startDate: new Date(2025, 9, 1), endDate: new Date(2025, 11, 31) },
  { id: 'idea-2', summary: 'Express checkout', theme: 'Increase revenue', roadmapStatus: 'Now', state: 'At risk', comments: 0, insights: 1, impact: 5, effort: 2, score: 2.5, customerSegments: ['Startups'], documents: 'https://go.a...', deliveryProgress: 40, startDate: new Date(2025, 10, 15), endDate: new Date(2025, 11, 31) },
  { id: 'idea-3', summary: 'Improve waiting list experience', theme: 'Delight users', roadmapStatus: 'Next', state: 'Pending', comments: 0, insights: 0, impact: 4, effort: 4, score: 1, customerSegments: ['SMB', 'Startups'], documents: 'https://go.a...', deliveryProgress: 0, startDate: new Date(2026, 0, 1), endDate: new Date(2026, 3, 30) },
  { id: 'idea-4', summary: 'Refactor user profile data', theme: 'Delight users', roadmapStatus: 'Later', state: 'Pending', comments: 0, insights: 0, impact: 3, effort: 4, score: 0.8, customerSegments: [], documents: 'https://go.a...', deliveryProgress: 0, startDate: new Date(2026, 4, 1), endDate: new Date(2026, 6, 31) },
  { id: 'idea-5', summary: 'Explore VR travel features', theme: 'Expand horizons', roadmapStatus: 'Later', state: 'Pending', comments: 0, insights: 0, impact: 1, effort: 5, score: 0.2, customerSegments: [], documents: 'https://go.a...', deliveryProgress: 0, startDate: new Date(2026, 5, 1), endDate: new Date(2026, 8, 30) },
];

export default function AgilePage() {
  const { tasks, projects, sprints, addSprint, updateTask, addComment, epics, releases, addEpic, addRelease } = useApp();
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [activeTab, setActiveTab] = useState('summary');
  
  // Backlog state
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newSprintOpen, setNewSprintOpen] = useState(false);
  const [newSprintName, setNewSprintName] = useState('');
  const [newSprintGoal, setNewSprintGoal] = useState('');
  const [newSprintStart, setNewSprintStart] = useState('');
  const [newSprintEnd, setNewSprintEnd] = useState('');
  const [quickAddColumn, setQuickAddColumn] = useState<string | null>(null);
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);

  // Filtering state
  const [filterEpicId, setFilterEpicId] = useState<string>('all');
  const [filterReleaseId, setFilterReleaseId] = useState<string>('all');

  const projectSprints = useMemo(() => {
    return sprints.filter((s) => s.projectId === selectedProjectId).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [sprints, selectedProjectId]);

  const projectEpics = useMemo(() => (epics || []).filter(e => e.projectId === selectedProjectId), [epics, selectedProjectId]);
  const projectReleases = useMemo(() => (releases || []).filter(r => r.projectId === selectedProjectId), [releases, selectedProjectId]);

  const activeSprint = useMemo(() => {
    return projectSprints.find((s) => s.status === 'active') || projectSprints[0];
  }, [projectSprints]);

  const selectedSprint = selectedSprintId ? projectSprints.find((s) => s.id === selectedSprintId) : activeSprint;

  const projectTasks = useMemo(() => {
    let pts = tasks.filter((t) => t.projectId === selectedProjectId);
    if (filterEpicId !== 'all') pts = pts.filter(t => t.epicId === filterEpicId);
    if (filterReleaseId !== 'all') pts = pts.filter(t => t.releaseId === filterReleaseId);
    return pts;
  }, [tasks, selectedProjectId, filterEpicId, filterReleaseId]);

  const backlogTasks = useMemo(() => {
    return projectTasks.filter((t) => !t.sprintId);
  }, [projectTasks]);

  const sprintTasks = useMemo(() => {
    if (!selectedSprint) return [];
    return projectTasks.filter((t) => t.sprintId === selectedSprint.id);
  }, [projectTasks, selectedSprint]);

  const selectedTask = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) : null;

  // Analytics mock data
  const velocityData = useMemo(() => {
    const completed = projectSprints.filter((s) => s.status === 'completed').slice(0, 6).reverse();
    return completed.map((s) => ({ name: s.name, velocity: s.velocity, planned: s.velocity + Math.round(Math.random() * 10 - 5) }));
  }, [projectSprints]);

  const burndownData = useMemo(() => {
    if (!selectedSprint) return [];
    const days = differenceInDays(parseISO(selectedSprint.endDate), parseISO(selectedSprint.startDate)) || 14;
    const totalPoints = sprintTasks.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
    const data = [];
    for (let i = 0; i <= days; i++) {
      const ideal = totalPoints * (1 - i / days);
      const actual = Math.max(0, ideal + (Math.random() - 0.5) * 10);
      data.push({ day: `Day ${i}`, ideal: Math.round(ideal), actual: Math.round(actual) });
    }
    return data;
  }, [selectedSprint, sprintTasks]);

  const cumulativeFlow = useMemo(() => {
    const days = 14;
    const data = [];
    const statuses = ['todo', 'in_progress', 'review', 'done'];
    for (let i = 0; i < days; i++) {
      const row: Record<string, number | string> = { day: `Day ${i + 1}` };
      statuses.forEach((status) => {
        row[status] = Math.round(Math.random() * 15 + 5);
      });
      data.push(row);
    }
    return data;
  }, [selectedSprint]);

  const handleCreateSprint = () => {
    if (!newSprintName || !newSprintStart || !newSprintEnd) return;
    addSprint({
      name: newSprintName,
      projectId: selectedProjectId,
      status: 'planning',
      startDate: newSprintStart,
      endDate: newSprintEnd,
      goal: newSprintGoal,
      velocity: 0,
    });
    setNewSprintOpen(false);
    setNewSprintName('');
    setNewSprintGoal('');
    setNewSprintStart('');
    setNewSprintEnd('');
  };

  const priorityColors: Record<string, string> = { urgent: 'bg-red-500/10 text-red-400 border-red-500/20', high: 'bg-orange-500/10 text-orange-400 border-orange-500/20', medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  const statusColors: Record<string, string> = { backlog: 'bg-gray-500/10 text-gray-400', todo: 'bg-blue-500/10 text-blue-400', in_progress: 'bg-purple-500/10 text-purple-400', review: 'bg-amber-500/10 text-amber-400', done: 'bg-emerald-500/10 text-emerald-400', cancelled: 'bg-red-500/10 text-red-400' };

  const statusColumns = ['todo', 'in_progress', 'review', 'done'];

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Management Module</h1>
          <p className="text-muted-foreground">Strategic planning, epics, releases, and agile execution</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowWalkthrough(true)}>
            <Zap className="w-4 h-4 mr-2" /> Walkthrough
          </Button>
          <Select
            value={selectedProjectId}
            onChange={setSelectedProjectId}
            options={projects.map((p) => ({ label: p.name, value: p.id }))}
            className="w-48"
          />
          <Button onClick={() => setNewSprintOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> New Sprint
          </Button>
        </div>
      </div>

      <Tabs className="flex-1 flex flex-col min-h-0">
        <TabsList className="mb-4 shrink-0 flex-wrap">
          <TabsTrigger active={activeTab === 'summary'} onClick={() => setActiveTab('summary')}><Target className="w-4 h-4 mr-1" /> Summary</TabsTrigger>
          <TabsTrigger active={activeTab === 'all_ideas'} onClick={() => setActiveTab('all_ideas')}><List className="w-4 h-4 mr-1" /> All Ideas</TabsTrigger>
          <TabsTrigger active={activeTab === 'impact'} onClick={() => setActiveTab('impact')}><Zap className="w-4 h-4 mr-1" /> Impact Assessment</TabsTrigger>
          <TabsTrigger active={activeTab === 'roadmap'} onClick={() => setActiveTab('roadmap')}><Map className="w-4 h-4 mr-1" /> Roadmap</TabsTrigger>
          <TabsTrigger active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')}><Calendar className="w-4 h-4 mr-1" /> Timeline</TabsTrigger>
          <TabsTrigger active={activeTab === 'epics'} onClick={() => setActiveTab('epics')}><Layers className="w-4 h-4 mr-1" /> Epics</TabsTrigger>
          <TabsTrigger active={activeTab === 'releases'} onClick={() => setActiveTab('releases')}><Package className="w-4 h-4 mr-1" /> Releases</TabsTrigger>
          <TabsTrigger active={activeTab === 'backlog'} onClick={() => setActiveTab('backlog')}><List className="w-4 h-4 mr-1" /> Backlog</TabsTrigger>
          <TabsTrigger active={activeTab === 'board'} onClick={() => setActiveTab('board')}><Layout className="w-4 h-4 mr-1" /> Board</TabsTrigger>
          <TabsTrigger active={activeTab === 'reports'} onClick={() => setActiveTab('reports')}><Zap className="w-4 h-4 mr-1" /> Reports</TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0 overflow-y-auto pr-2">
          
          {/* SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{projectTasks.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Across all sprints & backlog</p>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">{projectTasks.filter(t => t.status === 'in_progress').length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Currently being worked on</p>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Done</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-emerald-500">{projectTasks.filter(t => t.status === 'done').length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Completed tasks</p>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-500">
                      {projectTasks.filter(t => t.dueDate && isPast(parseISO(t.dueDate)) && t.status !== 'done').length}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Requires immediate attention</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest updates on your project</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {projectTasks.slice(0, 4).map((task, i) => (
                        <div key={task.id} className="flex items-start gap-3">
                          <Avatar src={users.find(u => u.id === task.assigneeId)?.avatar} fallback="?" className="w-8 h-8" />
                          <div>
                            <p className="text-sm">
                              <span className="font-medium">{users.find(u => u.id === task.assigneeId)?.name || 'Someone'}</span> updated 
                              <span className="font-medium text-primary ml-1">{task.title}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">{task.updatedAt ? format(parseISO(task.updatedAt), 'MMM dd, h:mm a') : 'Recently'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Priority Breakdown</CardTitle>
                    <CardDescription>Task distribution by priority</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 mt-2">
                      {['urgent', 'high', 'medium', 'low'].map(priority => {
                        const count = projectTasks.filter(t => t.priority === priority).length;
                        const percentage = projectTasks.length ? Math.round((count / projectTasks.length) * 100) : 0;
                        return (
                          <div key={priority}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="capitalize">{priority}</span>
                              <span className="font-medium">{count} ({percentage}%)</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ALL IDEAS */}
          {activeTab === 'all_ideas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="default" size="sm">Create</Button>
                  <Button variant="outline" size="sm">Group by +</Button>
                  <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1" /> Filter</Button>
                </div>
                <div className="relative w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Find an idea in this view" className="pl-9 h-9" />
                </div>
              </div>
              <div className="rounded-md border border-border/50 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 border-b border-border/50 text-xs font-semibold text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 w-10"><input type="checkbox" className="rounded" /></th>
                      <th className="px-4 py-3 min-w-[200px]">Aa Summary</th>
                      <th className="px-4 py-3 w-20 text-center"><MessageSquare className="w-4 h-4 inline" /></th>
                      <th className="px-4 py-3 w-24"><TrendingUp className="w-4 h-4 inline mr-1" /> Insights</th>
                      <th className="px-4 py-3"><CheckCircle2 className="w-4 h-4 inline mr-1" /> Theme</th>
                      <th className="px-4 py-3"><Calendar className="w-4 h-4 inline mr-1" /> Roadmap</th>
                      <th className="px-4 py-3"><AlertCircle className="w-4 h-4 inline mr-1" /> State</th>
                      <th className="px-4 py-3"><LinkIcon className="w-4 h-4 inline mr-1" /> Documents</th>
                      <th className="px-4 py-3 w-32"><Zap className="w-4 h-4 inline mr-1" /> Delivery progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 bg-card">
                    {mockIdeas.map((idea) => (
                      <tr key={idea.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3"><input type="checkbox" className="rounded" /></td>
                        <td className="px-4 py-3 font-medium">{idea.summary}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">
                          {idea.comments > 0 ? <span className="flex items-center justify-center gap-1"><MessageSquare className="w-4 h-4" /> {idea.comments}</span> : <MessageSquare className="w-4 h-4 mx-auto opacity-50" />}
                        </td>
                        <td className="px-4 py-3 font-semibold text-blue-500">
                          {idea.insights > 0 ? <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4" /> {idea.insights}</span> : <TrendingUp className="w-4 h-4 opacity-30 text-muted-foreground" />}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="bg-white dark:bg-black font-semibold shadow-sm">
                            {idea.theme.includes('revenue') ? <TrendingUp className="w-3 h-3 text-emerald-500 mr-1" /> :
                             idea.theme.includes('users') ? <Target className="w-3 h-3 text-red-500 mr-1" /> :
                             <Zap className="w-3 h-3 text-blue-500 mr-1" />}
                            <span className="text-blue-600 dark:text-blue-400">{idea.theme}</span>
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={
                            idea.roadmapStatus === 'Now' ? 'bg-cyan-500/20 text-cyan-500' :
                            idea.roadmapStatus === 'Next' ? 'bg-blue-500/20 text-blue-500' :
                            'bg-indigo-500/20 text-indigo-500'
                          }>{idea.roadmapStatus}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={
                            idea.state === 'On track' ? 'bg-emerald-500/20 text-emerald-500' :
                            idea.state === 'At risk' ? 'bg-amber-500/20 text-amber-500' :
                            'bg-gray-500/20 text-gray-400'
                          }>{idea.state}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 rounded-md px-2 py-1 max-w-[120px] truncate border border-border/50">
                            <LinkIcon className="w-3 h-3 shrink-0" /> {idea.documents}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-0.5">
                            <div className="flex-1 h-1.5 rounded-l-full bg-emerald-500" style={{ opacity: idea.deliveryProgress > 0 ? 1 : 0.2 }} />
                            <div className="flex-1 h-1.5 bg-blue-500" style={{ opacity: idea.deliveryProgress > 30 ? 1 : 0.2 }} />
                            <div className="flex-1 h-1.5 rounded-r-full bg-border" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* IMPACT ASSESSMENT */}
          {activeTab === 'impact' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="default" size="sm">Create</Button>
                  <Button variant="outline" size="sm">Group by +</Button>
                  <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1" /> Filter</Button>
                  <Button variant="outline" size="sm">Sort &darr;</Button>
                </div>
                <div className="relative w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Find an idea in this view" className="pl-9 h-9" />
                </div>
              </div>
              <div className="rounded-md border border-border/50 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 border-b border-border/50 text-xs font-semibold text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 w-10"><input type="checkbox" className="rounded" /></th>
                      <th className="px-4 py-3 min-w-[200px]">Aa Summary</th>
                      <th className="px-4 py-3"><CheckCircle2 className="w-4 h-4 inline mr-1" /> Theme</th>
                      <th className="px-4 py-3 w-20 text-center"><MessageSquare className="w-4 h-4 inline" /> Comments</th>
                      <th className="px-4 py-3 w-24"><TrendingUp className="w-4 h-4 inline mr-1" /> Insights</th>
                      <th className="px-4 py-3"><BarChart3 className="w-4 h-4 inline mr-1" /> Impact</th>
                      <th className="px-4 py-3"><BarChart3 className="w-4 h-4 inline mr-1" /> Effort</th>
                      <th className="px-4 py-3">fx Score &darr;</th>
                      <th className="px-4 py-3"><Users className="w-4 h-4 inline mr-1" /> Customer segments</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 bg-card">
                    {mockIdeas.map((idea) => (
                      <tr key={idea.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3"><input type="checkbox" className="rounded" /></td>
                        <td className="px-4 py-3 font-medium">{idea.summary}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="bg-white dark:bg-black font-semibold shadow-sm">
                            {idea.theme.includes('revenue') ? <TrendingUp className="w-3 h-3 text-emerald-500 mr-1" /> :
                             idea.theme.includes('users') ? <Target className="w-3 h-3 text-red-500 mr-1" /> :
                             <Zap className="w-3 h-3 text-blue-500 mr-1" />}
                            <span className="text-blue-600 dark:text-blue-400">{idea.theme}</span>
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground">
                          {idea.comments > 0 ? <span className="flex items-center justify-center gap-1"><MessageSquare className="w-4 h-4" /> {idea.comments}</span> : <MessageSquare className="w-4 h-4 mx-auto opacity-50" />}
                        </td>
                        <td className="px-4 py-3 font-semibold text-blue-500">
                          {idea.insights > 0 ? <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4" /> {idea.insights}</span> : <TrendingUp className="w-4 h-4 opacity-30 text-muted-foreground" />}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map(dot => (
                              <div key={dot} className={`w-2.5 h-2.5 rounded-full ${dot <= idea.impact ? 'bg-blue-400' : 'bg-muted-foreground/30'}`} />
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map(dot => (
                              <div key={dot} className={`w-2.5 h-2.5 rounded-full ${dot <= idea.effort ? 'bg-red-400' : 'bg-muted-foreground/30'}`} />
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          <Badge className={
                            idea.score >= 3 ? 'bg-emerald-500/20 text-emerald-500' :
                            idea.score >= 1 ? 'bg-amber-500/20 text-amber-500' :
                            'bg-gray-500/20 text-gray-400'
                          }>{idea.score}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {idea.customerSegments.map(seg => (
                              <Badge key={seg} variant="outline" className="text-xs bg-muted/50 font-normal">
                                <span className="w-3 h-3 flex items-center justify-center mr-1">⚖️</span>{seg}
                              </Badge>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ROADMAP */}
          {activeTab === 'roadmap' && (
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Columns <ChevronDown className="w-4 h-4 ml-1" /></Button>
                  <Button variant="outline" size="sm" className="bg-primary/10 text-primary border-primary/20"><CheckCircle2 className="w-4 h-4 mr-1" /> Roadmap</Button>
                  <Button variant="outline" size="sm">Group by +</Button>
                  <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1" /> Filter</Button>
                  <Button variant="outline" size="sm">Sort &darr;</Button>
                </div>
                <div className="relative w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Find an idea in this view" className="pl-9 h-9" />
                </div>
              </div>
              <div className="flex-1 min-h-0 flex gap-4 overflow-x-auto pb-4">
                {['Now', 'Next', 'Later', 'Won\'t do'].map((status) => {
                  const statusIdeas = mockIdeas.filter(i => i.roadmapStatus === status);
                  return (
                    <div key={status} className="w-[300px] shrink-0 bg-muted/30 rounded-lg border border-border/50 flex flex-col">
                      <div className="p-3 border-b border-border/50 flex items-center justify-between">
                        <Badge className="bg-muted text-foreground hover:bg-muted font-semibold">{status}</Badge>
                        <span className="text-xs text-muted-foreground font-medium">{statusIdeas.length}</span>
                      </div>
                      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                        {statusIdeas.map(idea => (
                          <Card key={idea.id} className="bg-card hover:border-primary/50 transition-colors shadow-sm">
                            <CardContent className="p-3">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-sm leading-tight">{idea.summary}</h4>
                                <Button variant="ghost" size="icon" className="h-5 w-5 -mr-1 -mt-1"><span className="text-muted-foreground">•••</span></Button>
                              </div>
                              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                Provide a seamless user experience that addresses the main pain points identified in our recent research.
                              </p>
                              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                                <Badge variant="outline" className="text-[10px] bg-white dark:bg-black font-semibold shadow-sm px-1.5 py-0.5">
                                  {idea.theme.includes('revenue') ? <TrendingUp className="w-2.5 h-2.5 text-emerald-500 mr-1" /> :
                                   idea.theme.includes('users') ? <Target className="w-2.5 h-2.5 text-red-500 mr-1" /> :
                                   <Zap className="w-2.5 h-2.5 text-blue-500 mr-1" />}
                                  <span className="text-blue-600 dark:text-blue-400">{idea.theme}</span>
                                </Badge>
                                <Badge className={`text-[10px] px-1.5 py-0.5 font-semibold ${
                                  idea.state === 'On track' ? 'bg-emerald-500/20 text-emerald-500' :
                                  idea.state === 'At risk' ? 'bg-amber-500/20 text-amber-500' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>{idea.state}</Badge>
                                {idea.startDate && <span className="text-[10px] text-muted-foreground font-medium ml-auto">
                                  {format(idea.startDate, 'MMM yyyy')}
                                </span>}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                                {idea.comments > 0 ? (
                                  <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {idea.comments}</span>
                                ) : (
                                  <MessageSquare className="w-3.5 h-3.5 opacity-30" />
                                )}
                                {idea.insights > 0 ? (
                                  <span className="flex items-center gap-1 text-blue-500"><TrendingUp className="w-3.5 h-3.5" /> {idea.insights}</span>
                                ) : (
                                  <TrendingUp className="w-3.5 h-3.5 opacity-30" />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        <Button variant="ghost" size="sm" className="w-full text-muted-foreground text-xs justify-start h-8 mt-2">
                          <Plus className="w-3 h-3 mr-1" /> Add
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm"><Calendar className="w-4 h-4 mr-1" /> Oct 2025 - Jun 2026</Button>
                  <Button variant="outline" size="sm">Group by +</Button>
                  <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1" /> Filter</Button>
                  <Button variant="outline" size="sm">Sort &darr;</Button>
                </div>
                <div className="relative w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Find an idea in this view" className="pl-9 h-9" />
                </div>
              </div>
              <div className="flex-1 bg-card rounded-md border border-border/50 overflow-hidden flex flex-col relative">
                {/* Header Grid */}
                <div className="flex bg-muted/30 border-b border-border/50 text-xs font-semibold text-muted-foreground">
                  <div className="flex-1 min-w-[200px] border-r border-border/50">
                    <div className="text-center py-1 border-b border-border/50">October - December 2025</div>
                    <div className="flex">
                      <div className="flex-1 text-center py-2 border-r border-border/50">October</div>
                      <div className="flex-1 text-center py-2 border-r border-border/50">November</div>
                      <div className="flex-1 text-center py-2">December</div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-[200px] border-r border-border/50">
                    <div className="text-center py-1 border-b border-border/50">January - March 2026</div>
                    <div className="flex">
                      <div className="flex-1 text-center py-2 border-r border-border/50">January</div>
                      <div className="flex-1 text-center py-2 border-r border-border/50">February</div>
                      <div className="flex-1 text-center py-2">March</div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <div className="text-center py-1 border-b border-border/50">April - June 2026</div>
                    <div className="flex">
                      <div className="flex-1 text-center py-2 border-r border-border/50">April</div>
                      <div className="flex-1 text-center py-2 border-r border-border/50">May</div>
                      <div className="flex-1 text-center py-2">June</div>
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
                    {mockIdeas.filter(i => i.startDate).map((idea, index) => {
                      // Extremely simplified mock positioning based on static dates
                      // In a real app this would use differenceInDays from timeline start
                      const isQ4 = idea.startDate?.getMonth()! >= 9; // Oct, Nov, Dec
                      const left = isQ4 ? '2%' : (idea.startDate?.getMonth() === 0 ? '40%' : '60%');
                      const width = isQ4 ? '20%' : '30%';
                      
                      return (
                        <Card key={idea.id} className="relative shadow-md border-border/80 bg-card hover:border-primary/50 transition-colors z-10" style={{ left, width, minWidth: '250px' }}>
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-sm leading-tight">{idea.summary}</h4>
                              <Button variant="ghost" size="icon" className="h-5 w-5 -mr-1 -mt-1"><span className="text-muted-foreground">•••</span></Button>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                              Provide a seamless user experience that addresses the main pain points identified in our recent research.
                            </p>
                            <div className="flex items-center gap-1.5">
                              <Badge variant="outline" className="text-[10px] bg-white dark:bg-black font-semibold shadow-sm px-1.5 py-0.5">
                                {idea.theme.includes('revenue') ? <TrendingUp className="w-2.5 h-2.5 text-emerald-500 mr-1" /> :
                                 idea.theme.includes('users') ? <Target className="w-2.5 h-2.5 text-red-500 mr-1" /> :
                                 <Zap className="w-2.5 h-2.5 text-blue-500 mr-1" />}
                                <span className="text-blue-600 dark:text-blue-400">{idea.theme}</span>
                              </Badge>
                              <Badge className={`text-[10px] px-1.5 py-0.5 font-semibold ${
                                idea.state === 'On track' ? 'bg-emerald-500/20 text-emerald-500' :
                                idea.state === 'At risk' ? 'bg-amber-500/20 text-amber-500' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>{idea.state}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
                
                <Button className="absolute bottom-4 right-4 rounded-full w-12 h-12 shadow-lg" size="icon">
                  <Plus className="w-6 h-6" />
                </Button>
              </div>
            </div>
          )}

          {/* EPICS */}
          {activeTab === 'epics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Epics</h2>
                <Button size="sm"><Plus className="w-4 h-4 mr-1"/> Create Epic</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectEpics.map(epic => (
                  <Card key={epic.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="mb-2">Epic</Badge>
                        <Badge className={epic.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}>
                          {epic.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <CardTitle className="text-base">{epic.title}</CardTitle>
                      <CardDescription className="line-clamp-2 text-xs">{epic.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 mt-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{epic.progress}%</span>
                          </div>
                          <Progress value={epic.progress} className="h-2" />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {epic.startDate ? format(parseISO(epic.startDate), 'MMM dd') : 'Unscheduled'}</span>
                          <Avatar src={users.find(u => u.id === epic.ownerId)?.avatar} fallback="?" className="w-6 h-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {projectEpics.length === 0 && <div className="col-span-full text-center text-muted-foreground py-8">No Epics defined.</div>}
              </div>
            </div>
          )}

          {/* RELEASES */}
          {activeTab === 'releases' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Releases & Versions</h2>
                <Button size="sm"><Plus className="w-4 h-4 mr-1"/> New Release</Button>
              </div>
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Version Name</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Target Date</th>
                      <th className="px-4 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {projectReleases.map(release => (
                      <tr key={release.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 font-medium">{release.name}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={release.status === 'released' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''}>
                            {release.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">{release.targetDate ? format(parseISO(release.targetDate), 'MMM dd, yyyy') : '-'}</td>
                        <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">{release.description}</td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </td>
                      </tr>
                    ))}
                    {projectReleases.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No releases planned.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BACKLOG */}
          {activeTab === 'backlog' && (
            <div className="flex flex-col lg:flex-row gap-6 h-full">
              {/* Sidebar */}
              <div className="w-full lg:w-64 shrink-0 space-y-6">
                
                {/* Global Filters */}
                <div className="space-y-3 bg-muted/30 p-3 rounded-lg border border-border">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Filter className="w-3 h-3"/> Context Filters</h3>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Epic</label>
                    <Select 
                      value={filterEpicId} 
                      onChange={setFilterEpicId}
                      options={[{label: 'All Epics', value: 'all'}, ...projectEpics.map(e => ({label: e.title, value: e.id}))]}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Release</label>
                    <Select 
                      value={filterReleaseId} 
                      onChange={setFilterReleaseId}
                      options={[{label: 'All Releases', value: 'all'}, ...projectReleases.map(r => ({label: r.name, value: r.id}))]}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Sprints</h3>
                    <span className="text-xs text-muted-foreground">{projectSprints.length}</span>
                  </div>
                  {projectSprints.map((sprint) => (
                    <div
                      key={sprint.id}
                      onClick={() => setSelectedSprintId(sprint.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedSprint?.id === sprint.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{sprint.name}</span>
                        <Badge variant={sprint.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {sprint.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{sprint.goal}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(parseISO(sprint.startDate), 'MMM dd')}</span>
                        <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {sprint.velocity} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Backlog Content */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Backlog</h2>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input type="text" placeholder="Search tasks..." className="h-9 pl-9 pr-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring w-48" />
                    </div>
                  </div>
                </div>

                {/* Sprint tasks */}
                {selectedSprint && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <ChevronDown className="w-4 h-4" />
                      {selectedSprint.name} ({sprintTasks.length} tasks)
                    </div>
                    {sprintTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => { setSelectedTaskId(task.id); setTaskDetailOpen(true); }}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors group bg-card"
                      >
                        <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                        <span className="text-xs text-muted-foreground font-mono w-16">{task.id.replace('task-', 'TSK-').toUpperCase()}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          <div className="flex gap-2 mt-1">
                            {task.epicId && <Badge variant="outline" className="text-[10px] h-4 leading-none bg-blue-500/10 text-blue-500 border-blue-500/20">{projectEpics.find(e=>e.id===task.epicId)?.title || 'Epic'}</Badge>}
                            {task.releaseId && <Badge variant="outline" className="text-[10px] h-4 leading-none bg-purple-500/10 text-purple-500 border-purple-500/20">{projectReleases.find(r=>r.id===task.releaseId)?.name || 'Release'}</Badge>}
                          </div>
                        </div>
                        <Badge variant="outline" className={priorityColors[task.priority] || ''}>{task.priority}</Badge>
                        <Badge className={statusColors[task.status] || ''}>{task.status.replace('_', ' ')}</Badge>
                        {task.storyPoints && <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded-full">{task.storyPoints} pts</span>}
                        {task.assigneeId ? <Avatar src={users.find((u) => u.id === task.assigneeId)?.avatar} fallback="A" className="w-6 h-6" /> : <div className="w-6 h-6 rounded-full bg-muted border border-border border-dashed"></div>}
                      </div>
                    ))}
                    {sprintTasks.length === 0 && <p className="text-sm text-muted-foreground py-2 pl-6">No tasks in this sprint.</p>}
                  </div>
                )}

                {/* Backlog tasks */}
                <div className="space-y-2 mt-6">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground border-t border-border pt-4">
                    <ChevronDown className="w-4 h-4" />
                    Backlog ({backlogTasks.length} tasks)
                  </div>
                  {backlogTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => { setSelectedTaskId(task.id); setTaskDetailOpen(true); }}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors group bg-card"
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      <span className="text-xs text-muted-foreground font-mono w-16">{task.id.replace('task-', 'TSK-').toUpperCase()}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <div className="flex gap-2 mt-1">
                            {task.epicId && <Badge variant="outline" className="text-[10px] h-4 leading-none bg-blue-500/10 text-blue-500 border-blue-500/20">{projectEpics.find(e=>e.id===task.epicId)?.title || 'Epic'}</Badge>}
                            {task.releaseId && <Badge variant="outline" className="text-[10px] h-4 leading-none bg-purple-500/10 text-purple-500 border-purple-500/20">{projectReleases.find(r=>r.id===task.releaseId)?.name || 'Release'}</Badge>}
                          </div>
                      </div>
                      <Badge variant="outline" className={priorityColors[task.priority] || ''}>{task.priority}</Badge>
                      <Badge className={statusColors[task.status] || ''}>{task.status.replace('_', ' ')}</Badge>
                      {task.storyPoints && <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded-full">{task.storyPoints} pts</span>}
                      {task.assigneeId ? <Avatar src={users.find((u) => u.id === task.assigneeId)?.avatar} fallback="A" className="w-6 h-6" /> : <div className="w-6 h-6 rounded-full bg-muted border border-border border-dashed"></div>}
                    </div>
                  ))}
                  {backlogTasks.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No backlog items</p>}
                </div>
              </div>
            </div>
          )}

          {/* BOARD */}
          {activeTab === 'board' && selectedSprint && (
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{selectedSprint.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedSprint.goal} • {format(parseISO(selectedSprint.startDate), 'MMM dd')} - {format(parseISO(selectedSprint.endDate), 'MMM dd')}</p>
                </div>
                
                {/* Board Context Filters */}
                <div className="flex items-center gap-3 bg-muted/30 p-1.5 rounded-lg border border-border">
                  <Filter className="w-4 h-4 text-muted-foreground ml-2"/>
                  <Select 
                    value={filterEpicId} 
                    onChange={setFilterEpicId}
                    options={[{label: 'All Epics', value: 'all'}, ...projectEpics.map(e => ({label: e.title, value: e.id}))]}
                    className="w-40"
                  />
                  <Select 
                    value={filterReleaseId} 
                    onChange={setFilterReleaseId}
                    options={[{label: 'All Releases', value: 'all'}, ...projectReleases.map(r => ({label: r.name, value: r.id}))]}
                    className="w-40"
                  />
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1"><Target className="w-4 h-4 text-primary" /> {sprintTasks.reduce((a, t) => a + (t.storyPoints || 0), 0)} pts</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> {sprintTasks.filter((t) => t.status === 'done').length} done</span>
                </div>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 flex-1">
                {statusColumns.map((status) => {
                  const colTasks = sprintTasks.filter((t) => t.status.replace('-', '_') === status || t.status === status.replace('_', '-'));
                  return (
                    <div key={status} className="w-72 shrink-0 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${status === 'todo' || status === 'not_started' ? 'bg-blue-400' : status === 'in_progress' ? 'bg-purple-400' : status === 'review' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                          <span className="text-sm font-medium capitalize">{status.replace('_', ' ')}</span>
                        </div>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{colTasks.length}</span>
                      </div>
                      <div className="space-y-3 flex-1 overflow-y-auto p-2 rounded-xl bg-muted/20 border border-dashed border-border/50">
                        {colTasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => { setSelectedTaskId(task.id); setTaskDetailOpen(true); }}
                            className="p-4 rounded-xl bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/30 cursor-pointer transition-all hover:-translate-y-0.5"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-sm font-medium leading-snug">{task.title}</p>
                            </div>
                            
                            <div className="flex gap-2 mb-3">
                              {task.epicId && <Badge variant="outline" className="text-[10px] h-4 leading-none bg-blue-500/10 text-blue-500 border-blue-500/20">{projectEpics.find(e=>e.id===task.epicId)?.title || 'Epic'}</Badge>}
                            </div>

                            <div className="flex items-center gap-2 flex-wrap mb-3">
                              <Badge variant="outline" className={`text-xs ${priorityColors[task.priority] || ''}`}>{task.priority}</Badge>
                              {task.storyPoints && <span className="text-xs font-medium bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{task.storyPoints} pts</span>}
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                              {task.assigneeId ? (
                                <Avatar src={users.find((u) => u.id === task.assigneeId)?.avatar} fallback="A" className="w-6 h-6" />
                              ) : <div className="w-6 h-6 rounded-full bg-muted border border-border border-dashed" />}
                              {task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'done' && (
                                <AlertCircle className="w-4 h-4 text-red-400" />
                              )}
                            </div>
                          </div>
                        ))}
                        {quickAddColumn === status ? (
                          <div className="p-2">
                            <input
                              autoFocus
                              value={quickAddTitle}
                              onChange={(e) => setQuickAddTitle(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd(status)}
                              onBlur={() => { if (!quickAddTitle) setQuickAddColumn(null); }}
                              placeholder="What needs to be done?"
                              className="w-full h-8 px-2 rounded bg-card border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => setQuickAddColumn(status)}
                            className="w-full p-2 text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 transition-colors rounded-lg border border-transparent hover:border-border hover:bg-card"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add task
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* REPORTS */}
          {activeTab === 'reports' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sprint Velocity</CardTitle>
                  <CardDescription>Completed story points per sprint</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={velocityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#888" fontSize={11} angle={-20} textAnchor="end" height={60} />
                      <YAxis stroke="#888" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                      <Legend />
                      <Bar dataKey="planned" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="velocity" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Cumulative Flow</CardTitle>
                  <CardDescription>Task status distribution over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={cumulativeFlow}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="day" stroke="#888" fontSize={11} />
                      <YAxis stroke="#888" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                      <Legend />
                      <Area type="monotone" dataKey="todo" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="in_progress" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="review" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="done" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Sprint Burndown</CardTitle>
                  <CardDescription>Actual vs ideal story point burndown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={burndownData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="day" stroke="#888" fontSize={12} />
                      <YAxis stroke="#888" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                      <Legend />
                      <Line type="monotone" dataKey="ideal" stroke="#666" strokeDasharray="5 5" dot={false} />
                      <Line type="monotone" dataKey="actual" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </Tabs>

      {/* New Sprint Dialog */}
      <Dialog open={newSprintOpen} onClose={() => setNewSprintOpen(false)}>
        <DialogHeader>
          <DialogTitle>Create Sprint</DialogTitle>
          <DialogDescription>Plan a new sprint for this project</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium">Sprint Name</label>
            <Input value={newSprintName} onChange={(e) => setNewSprintName(e.target.value)} placeholder="e.g., Sprint 27 - November" />
          </div>
          <div>
            <label className="text-sm font-medium">Sprint Goal</label>
            <Input value={newSprintGoal} onChange={(e) => setNewSprintGoal(e.target.value)} placeholder="What are we aiming to achieve?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input type="date" value={newSprintStart} onChange={(e) => setNewSprintStart(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input type="date" value={newSprintEnd} onChange={(e) => setNewSprintEnd(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setNewSprintOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateSprint}>Create Sprint</Button>
        </DialogFooter>
      </Dialog>

      {/* Task Detail Dialog */}
      {selectedTask && (
        <Dialog open={taskDetailOpen} onClose={() => setTaskDetailOpen(false)}>
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-muted-foreground">{selectedTask.id.replace('task-', 'TSK-').toUpperCase()}</span>
            </div>
            <DialogTitle className="text-xl">{selectedTask.title}</DialogTitle>
            <DialogDescription>{selectedTask.description || "No description provided."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-6 bg-muted/20 p-4 rounded-xl border border-border">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                <Select
                  value={selectedTask.status}
                  onChange={(v) => updateTask(selectedTask.id, { status: v as typeof selectedTask.status })}
                  options={[
                    { label: 'Not Started', value: 'not-started' },
                    { label: 'In Progress', value: 'in-progress' },
                    { label: 'Completed', value: 'completed' },
                  ]}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Priority</label>
                <Select
                  value={selectedTask.priority || 'medium'}
                  onChange={(v) => updateTask(selectedTask.id, { priority: v as typeof selectedTask.priority })}
                  options={[
                    { label: 'Low', value: 'low' },
                    { label: 'Medium', value: 'medium' },
                    { label: 'High', value: 'high' },
                    { label: 'Urgent', value: 'urgent' },
                  ]}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Epic</label>
                <Select
                  value={selectedTask.epicId || ''}
                  onChange={(v) => updateTask(selectedTask.id, { epicId: v || null })}
                  options={[{ label: 'None', value: '' }, ...projectEpics.map(e => ({ label: e.title, value: e.id }))]}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Release</label>
                <Select
                  value={selectedTask.releaseId || ''}
                  onChange={(v) => updateTask(selectedTask.id, { releaseId: v || null })}
                  options={[{ label: 'None', value: '' }, ...projectReleases.map(r => ({ label: r.name, value: r.id }))]}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Assignee</label>
              <Select
                value={selectedTask.assigneeId || ''}
                onChange={(v) => updateTask(selectedTask.id, { assigneeId: v || null })}
                options={[{ label: 'Unassigned', value: '' }, ...users.map((u) => ({ label: u.name, value: u.id }))]}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Story Points</label>
                <Input type="number" value={selectedTask.storyPoints || ''} onChange={(e) => updateTask(selectedTask.id, { storyPoints: parseInt(e.target.value) || null })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Due Date</label>
                <Input type="date" value={selectedTask.dueDate || ''} onChange={(e) => updateTask(selectedTask.id, { dueDate: e.target.value || null })} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Time Tracking</label>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-medium">{selectedTask.timeSpent || 0}h logged</span>
                    <span className="text-muted-foreground">{selectedTask.timeEstimate || 0}h estimated</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(((selectedTask.timeSpent||0) / (selectedTask.timeEstimate || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border">
              <label className="text-sm font-semibold mb-3 block">Comments</label>
              <ScrollArea className="h-40 space-y-3 pr-4">
                {tasks.filter((t) => t.id === selectedTask.id).map(() => (
                  <div key="comments" className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <Avatar src={users[0]?.avatar} fallback="A" className="w-8 h-8" />
                      <div className="text-sm flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-semibold">{users[0]?.name}</p>
                          <span className="text-xs text-muted-foreground">Today</span>
                        </div>
                        <p className="text-muted-foreground">Working on this now.</p>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
              <div className="flex gap-2 mt-4">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newComment) {
                      addComment({ taskId: selectedTask.id, userId: users[0].id, content: newComment });
                      setNewComment('');
                    }
                  }}
                />
                <Button onClick={() => { if (newComment) { addComment({ taskId: selectedTask.id, userId: users[0].id, content: newComment }); setNewComment(''); } }}>
                  <MessageSquare className="w-4 h-4 mr-2" /> Send
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {showWalkthrough && (
        <Dialog open={showWalkthrough} onOpenChange={setShowWalkthrough}>
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border shadow-lg rounded-xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
              <DialogHeader>
                <DialogTitle>Product Management Module</DialogTitle>
                <DialogDescription>Let's take a quick tour of the new features.</DialogDescription>
              </DialogHeader>
              
              <div className="my-6 min-h-[120px]">
                {walkthroughStep === 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-primary flex items-center gap-2"><Map className="w-5 h-5"/> Roadmap View</h3>
                    <p className="text-sm text-muted-foreground">The Roadmap view provides a high-level timeline of your Epics and Releases. Use it to align stakeholders on long-term goals and track overall delivery progress.</p>
                  </div>
                )}
                {walkthroughStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-primary flex items-center gap-2"><Layers className="w-5 h-5"/> Epics & Releases</h3>
                    <p className="text-sm text-muted-foreground">Group your tasks into larger Epics for feature tracking. Bundle tasks into Releases to manage version delivery and deployment schedules.</p>
                  </div>
                )}
                {walkthroughStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-primary flex items-center gap-2"><Layout className="w-5 h-5"/> Agile Boards</h3>
                    <p className="text-sm text-muted-foreground">The Backlog and Board views let you manage day-to-day execution. Filter by Epic or Release to focus on specific delivery increments.</p>
                  </div>
                )}
              </div>

              <DialogFooter className="flex items-center justify-between mt-6">
                <div className="flex gap-1">
                  {[0, 1, 2].map(step => (
                    <div key={step} className={`w-2 h-2 rounded-full ${step === walkthroughStep ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                  ))}
                </div>
                <div className="flex gap-2">
                  {walkthroughStep > 0 && (
                    <Button variant="outline" onClick={() => setWalkthroughStep(s => s - 1)}>Back</Button>
                  )}
                  {walkthroughStep < 2 ? (
                    <Button onClick={() => setWalkthroughStep(s => s + 1)}>Next</Button>
                  ) : (
                    <Button onClick={() => { setShowWalkthrough(false); setWalkthroughStep(0); }}>Finish</Button>
                  )}
                </div>
              </DialogFooter>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
