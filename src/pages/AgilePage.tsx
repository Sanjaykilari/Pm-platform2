// @ts-nocheck
import { useState, useMemo, useRef, useCallback } from 'react';
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
  CheckCircle2, AlertCircle, Filter, Search, MessageSquare, List, 
  Map, Layers, Package, Clock, TrendingUp, Link as LinkIcon, BarChart3, Users,
  X, Edit2, Trash2, MoreHorizontal, ChevronRight, ArrowUpDown
} from 'lucide-react';
import { format, parseISO, differenceInDays, isPast, startOfMonth, endOfMonth, addMonths, isBefore, isAfter } from 'date-fns';

// ─── Types ─────────────────────────────────────────────────────
interface Idea {
  id: string;
  summary: string;
  description?: string;
  theme: string;
  roadmapStatus: 'Now' | 'Next' | 'Later' | "Won't do";
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

// ─── Initial mock ideas ─────────────────────────────────────────
const INITIAL_IDEAS: Idea[] = [
  { id: 'idea-1', summary: 'New rewards program', description: 'Loyalty rewards to increase repeat purchases.', theme: 'Increase revenue', roadmapStatus: 'Now', state: 'On track', comments: 2, insights: 2, impact: 5, effort: 1, score: 5, customerSegments: ['Enterprise'], documents: 'https://go.a...', deliveryProgress: 60, startDate: new Date(2025, 9, 1), endDate: new Date(2025, 11, 31) },
  { id: 'idea-2', summary: 'Express checkout', description: 'Reduce checkout friction to improve conversion.', theme: 'Increase revenue', roadmapStatus: 'Now', state: 'At risk', comments: 0, insights: 1, impact: 5, effort: 2, score: 2.5, customerSegments: ['Startups'], documents: 'https://go.a...', deliveryProgress: 40, startDate: new Date(2025, 10, 15), endDate: new Date(2025, 11, 31) },
  { id: 'idea-3', summary: 'Improve waiting list experience', description: 'Better UX for users on the waiting list.', theme: 'Delight users', roadmapStatus: 'Next', state: 'Pending', comments: 0, insights: 0, impact: 4, effort: 4, score: 1, customerSegments: ['SMB', 'Startups'], documents: 'https://go.a...', deliveryProgress: 0, startDate: new Date(2026, 0, 1), endDate: new Date(2026, 3, 30) },
  { id: 'idea-4', summary: 'Refactor user profile data', description: 'Modernize user profile data model.', theme: 'Delight users', roadmapStatus: 'Later', state: 'Pending', comments: 0, insights: 0, impact: 3, effort: 4, score: 0.8, customerSegments: [], documents: 'https://go.a...', deliveryProgress: 0, startDate: new Date(2026, 4, 1), endDate: new Date(2026, 6, 31) },
  { id: 'idea-5', summary: 'Explore VR travel features', description: 'Experimental feature for immersive travel experiences.', theme: 'Expand horizons', roadmapStatus: 'Later', state: 'Pending', comments: 0, insights: 0, impact: 1, effort: 5, score: 0.2, customerSegments: [], documents: 'https://go.a...', deliveryProgress: 0, startDate: new Date(2026, 5, 1), endDate: new Date(2026, 8, 30) },
];

// ─── Dropdown helper ────────────────────────────────────────────
function Dropdown({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-xl min-w-[160px] py-1 animate-in fade-in slide-in-from-top-2 duration-150">
            {children}
          </div>
        </>
      )}
    </div>
  );
}

function DropdownItem({ onClick, children, className = '' }: { onClick?: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center gap-2 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// ─── Main Component ─────────────────────────────────────────────
export default function AgilePage() {
  const { tasks, projects, addEpic, updateEpic, deleteEpic, addRelease, updateRelease, deleteRelease, epics, releases, updateTask, addDiscussionComment } = useApp();

  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [activeTab, setActiveTab] = useState('summary');

  // ── Sprints (local only for now) ──
  const [sprints, setSprints] = useState([
    { id: 'sp-1', name: 'Sprint 1', goal: 'MVP Foundation', startDate: '2026-06-01', endDate: '2026-06-14', status: 'completed', velocity: 32, projectId: projects[0]?.id },
    { id: 'sp-2', name: 'Sprint 2', goal: 'Core Features', startDate: '2026-06-15', endDate: '2026-06-28', status: 'active', velocity: 40, projectId: projects[0]?.id },
  ]);
  const [newSprintOpen, setNewSprintOpen] = useState(false);
  const [newSprintName, setNewSprintName] = useState('');
  const [newSprintGoal, setNewSprintGoal] = useState('');
  const [newSprintStart, setNewSprintStart] = useState('');
  const [newSprintEnd, setNewSprintEnd] = useState('');
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);

  // ── Ideas (state so Create/edit works) ──
  const [ideas, setIdeas] = useState<Idea[]>(INITIAL_IDEAS);
  const [createIdeaOpen, setCreateIdeaOpen] = useState(false);
  const [editIdeaOpen, setEditIdeaOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [ideaForm, setIdeaForm] = useState({
    summary: '', description: '', theme: 'Increase revenue',
    roadmapStatus: 'Now' as Idea['roadmapStatus'], state: 'Pending' as Idea['state'],
    impact: 3, effort: 3, customerSegments: '', documents: '',
  });

  // ── Filters ──
  const [ideaSearch, setIdeaSearch] = useState('');
  const [ideaGroupBy, setIdeaGroupBy] = useState<'none' | 'theme' | 'roadmapStatus' | 'state'>('none');
  const [ideaFilter, setIdeaFilter] = useState<string>('all');
  const [ideaSort, setIdeaSort] = useState<'score_desc' | 'score_asc' | 'impact_desc' | 'effort_asc'>('score_desc');
  const [roadmapFilter, setRoadmapFilter] = useState<string>('all');

  // ── Drag & Drop for Roadmap ──
  const [draggedIdeaId, setDraggedIdeaId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // ── Epics state ──
  const [epicDialogOpen, setEpicDialogOpen] = useState(false);
  const [editEpicDialogOpen, setEditEpicDialogOpen] = useState(false);
  const [editingEpic, setEditingEpic] = useState<any>(null);
  const [epicForm, setEpicForm] = useState({ title: '', description: '', status: 'planning', startDate: '', targetDate: '' });

  // ── Releases state ──
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);
  const [editReleaseDialogOpen, setEditReleaseDialogOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<any>(null);
  const [releaseForm, setReleaseForm] = useState({ name: '', description: '', status: 'planned', targetDate: '' });

  // ── Task detail & comments ──
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [taskComments, setTaskComments] = useState<Record<string, Array<{id: string, author: string, text: string, timestamp: string}>>>({});

  // ── Walkthrough ──
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);

  // ── Memos ──
  const projectEpics = useMemo(() => (epics || []).filter(e => e.projectId === selectedProjectId), [epics, selectedProjectId]);
  const projectReleases = useMemo(() => (releases || []).filter(r => r.projectId === selectedProjectId), [releases, selectedProjectId]);
  const projectSprints = useMemo(() => sprints.filter(s => s.projectId === selectedProjectId), [sprints, selectedProjectId]);
  const activeSprint = useMemo(() => projectSprints.find(s => s.status === 'active') || projectSprints[0], [projectSprints]);
  const selectedSprint = selectedSprintId ? projectSprints.find(s => s.id === selectedSprintId) : activeSprint;
  const projectTasks = useMemo(() => tasks.filter(t => t.projectId === selectedProjectId), [tasks, selectedProjectId]);
  const sprintTasks = useMemo(() => selectedSprint ? projectTasks.filter(t => t.sprintId === selectedSprint.id) : [], [projectTasks, selectedSprint]);
  const backlogTasks = useMemo(() => projectTasks.filter(t => !t.sprintId), [projectTasks]);
  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null;

  // ── Filtered ideas ──
  const filteredIdeas = useMemo(() => {
    let result = [...ideas];
    if (ideaSearch) result = result.filter(i => i.summary.toLowerCase().includes(ideaSearch.toLowerCase()));
    if (ideaFilter !== 'all') result = result.filter(i => i.roadmapStatus === ideaFilter);
    result.sort((a, b) => {
      if (ideaSort === 'score_desc') return b.score - a.score;
      if (ideaSort === 'score_asc') return a.score - b.score;
      if (ideaSort === 'impact_desc') return b.impact - a.impact;
      if (ideaSort === 'effort_asc') return a.effort - b.effort;
      return 0;
    });
    return result;
  }, [ideas, ideaSearch, ideaFilter, ideaSort]);

  const groupedIdeas = useMemo(() => {
    if (ideaGroupBy === 'none') return { 'All Ideas': filteredIdeas };
    return filteredIdeas.reduce((acc, idea) => {
      const key = idea[ideaGroupBy] as string;
      acc[key] = acc[key] || [];
      acc[key].push(idea);
      return acc;
    }, {} as Record<string, Idea[]>);
  }, [filteredIdeas, ideaGroupBy]);

  // ── Gantt timeline data (Oct 2025 - Sep 2026) ──
  const TIMELINE_START = new Date(2025, 9, 1);
  const TIMELINE_END = new Date(2026, 8, 30);
  const TOTAL_DAYS = differenceInDays(TIMELINE_END, TIMELINE_START);
  const MONTHS: Date[] = [];
  let cur = TIMELINE_START;
  while (isBefore(cur, TIMELINE_END) || format(cur, 'yyyy-MM') === format(TIMELINE_END, 'yyyy-MM')) {
    MONTHS.push(new Date(cur.getFullYear(), cur.getMonth(), 1));
    cur = addMonths(cur, 1);
  }

  const getGanttStyle = (start?: Date, end?: Date) => {
    if (!start || !end) return { display: 'none' };
    const s = Math.max(0, differenceInDays(start, TIMELINE_START));
    const e = Math.min(TOTAL_DAYS, differenceInDays(end, TIMELINE_START));
    const leftPct = (s / TOTAL_DAYS) * 100;
    const widthPct = Math.max(1, ((e - s) / TOTAL_DAYS) * 100);
    return { left: `${leftPct}%`, width: `${widthPct}%` };
  };

  const timelineIdeas = useMemo(() => {
    let result = ideas.filter(i => i.startDate && i.endDate);
    if (ideaFilter !== 'all') result = result.filter(i => i.roadmapStatus === ideaFilter);
    return result;
  }, [ideas, ideaFilter]);

  // ── Handlers ──
  const handleCreateIdea = () => {
    const score = ideaForm.effort > 0 ? +(ideaForm.impact / ideaForm.effort).toFixed(1) : 0;
    const newIdea: Idea = {
      id: `idea-${Date.now()}`,
      summary: ideaForm.summary,
      description: ideaForm.description,
      theme: ideaForm.theme,
      roadmapStatus: ideaForm.roadmapStatus,
      state: ideaForm.state,
      comments: 0,
      insights: 0,
      impact: +ideaForm.impact,
      effort: +ideaForm.effort,
      score,
      customerSegments: ideaForm.customerSegments ? ideaForm.customerSegments.split(',').map(s => s.trim()) : [],
      documents: ideaForm.documents,
      deliveryProgress: 0,
      startDate: new Date(),
      endDate: addMonths(new Date(), 3),
    };
    setIdeas(prev => [newIdea, ...prev]);
    setCreateIdeaOpen(false);
    setIdeaForm({ summary: '', description: '', theme: 'Increase revenue', roadmapStatus: 'Now', state: 'Pending', impact: 3, effort: 3, customerSegments: '', documents: '' });
  };

  const handleEditIdea = () => {
    if (!editingIdea) return;
    const score = ideaForm.effort > 0 ? +(+ideaForm.impact / +ideaForm.effort).toFixed(1) : 0;
    setIdeas(prev => prev.map(i => i.id === editingIdea.id
      ? { ...i, ...ideaForm, impact: +ideaForm.impact, effort: +ideaForm.effort, score, customerSegments: ideaForm.customerSegments ? ideaForm.customerSegments.split(',').map(s => s.trim()) : [] }
      : i
    ));
    setEditIdeaOpen(false);
    setEditingIdea(null);
  };

  const handleDeleteIdea = (id: string) => setIdeas(prev => prev.filter(i => i.id !== id));

  const openEditIdea = (idea: Idea) => {
    setEditingIdea(idea);
    setIdeaForm({
      summary: idea.summary,
      description: idea.description || '',
      theme: idea.theme,
      roadmapStatus: idea.roadmapStatus,
      state: idea.state,
      impact: idea.impact,
      effort: idea.effort,
      customerSegments: idea.customerSegments.join(', '),
      documents: idea.documents,
    });
    setEditIdeaOpen(true);
  };

  // Drag & Drop
  const handleDragStart = (id: string) => setDraggedIdeaId(id);
  const handleDragOver = (e: React.DragEvent, col: string) => { e.preventDefault(); setDragOverColumn(col); };
  const handleDrop = (col: string) => {
    if (!draggedIdeaId) return;
    setIdeas(prev => prev.map(i => i.id === draggedIdeaId ? { ...i, roadmapStatus: col as Idea['roadmapStatus'] } : i));
    setDraggedIdeaId(null);
    setDragOverColumn(null);
  };

  // Epics
  const handleCreateEpic = () => {
    if (!epicForm.title) return;
    addEpic({ ...epicForm, projectId: selectedProjectId, progress: 0, ownerId: null });
    setEpicDialogOpen(false);
    setEpicForm({ title: '', description: '', status: 'planning', startDate: '', targetDate: '' });
  };
  const handleSaveEpic = () => {
    if (!editingEpic) return;
    updateEpic(editingEpic.id, epicForm);
    setEditEpicDialogOpen(false);
    setEditingEpic(null);
  };

  // Releases
  const handleCreateRelease = () => {
    if (!releaseForm.name) return;
    addRelease({ ...releaseForm, projectId: selectedProjectId });
    setReleaseDialogOpen(false);
    setReleaseForm({ name: '', description: '', status: 'planned', targetDate: '' });
  };
  const handleSaveRelease = () => {
    if (!editingRelease) return;
    updateRelease(editingRelease.id, releaseForm);
    setEditReleaseDialogOpen(false);
    setEditingRelease(null);
  };

  // Comments / Discussion
  const handleAddComment = () => {
    if (!newComment.trim() || !selectedTask) return;
    const comment = { id: `c-${Date.now()}`, author: 'You', text: newComment.trim(), timestamp: new Date().toISOString() };
    setTaskComments(prev => ({ ...prev, [selectedTask.id]: [...(prev[selectedTask.id] || []), comment] }));
    setNewComment('');
  };

  const handleCreateSprint = () => {
    if (!newSprintName || !newSprintStart || !newSprintEnd) return;
    setSprints(prev => [...prev, { id: `sp-${Date.now()}`, name: newSprintName, goal: newSprintGoal, startDate: newSprintStart, endDate: newSprintEnd, status: 'planning', velocity: 0, projectId: selectedProjectId }]);
    setNewSprintOpen(false);
    setNewSprintName(''); setNewSprintGoal(''); setNewSprintStart(''); setNewSprintEnd('');
  };

  // ── Style maps ──
  const priorityColors: Record<string, string> = { urgent: 'bg-red-500/10 text-red-400 border-red-500/20', high: 'bg-orange-500/10 text-orange-400 border-orange-500/20', medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  const statusColors: Record<string, string> = { backlog: 'bg-gray-500/10 text-gray-400', todo: 'bg-blue-500/10 text-blue-400', in_progress: 'bg-purple-500/10 text-purple-400', 'in-progress': 'bg-purple-500/10 text-purple-400', review: 'bg-amber-500/10 text-amber-400', done: 'bg-emerald-500/10 text-emerald-400', completed: 'bg-emerald-500/10 text-emerald-400', cancelled: 'bg-red-500/10 text-red-400' };
  const roadmapColors: Record<string, string> = { Now: 'bg-cyan-500', Next: 'bg-blue-500', Later: 'bg-indigo-500', "Won't do": 'bg-gray-500' };

  // ── Idea form fields (shared between Create & Edit) ──
  const IdeaFormFields = () => (
    <div className="space-y-4 mt-4">
      <div><label className="text-sm font-medium">Summary *</label><Input value={ideaForm.summary} onChange={e => setIdeaForm(f => ({...f, summary: e.target.value}))} placeholder="Brief idea title" /></div>
      <div><label className="text-sm font-medium">Description</label><textarea value={ideaForm.description} onChange={e => setIdeaForm(f => ({...f, description: e.target.value}))} placeholder="Describe the idea..." className="w-full mt-1 h-20 px-3 py-2 rounded-md bg-muted/50 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-sm font-medium">Theme</label>
          <Select value={ideaForm.theme} onChange={v => setIdeaForm(f => ({...f, theme: v}))} options={['Increase revenue','Delight users','Expand horizons','Reduce costs','Improve quality'].map(t => ({label: t, value: t}))} />
        </div>
        <div><label className="text-sm font-medium">Roadmap Status</label>
          <Select value={ideaForm.roadmapStatus} onChange={v => setIdeaForm(f => ({...f, roadmapStatus: v as any}))} options={['Now','Next','Later',"Won't do"].map(t => ({label: t, value: t}))} />
        </div>
        <div><label className="text-sm font-medium">State</label>
          <Select value={ideaForm.state} onChange={v => setIdeaForm(f => ({...f, state: v as any}))} options={['On track','At risk','Pending'].map(t => ({label: t, value: t}))} />
        </div>
        <div><label className="text-sm font-medium">Impact (1–5)</label><Input type="number" min={1} max={5} value={ideaForm.impact} onChange={e => setIdeaForm(f => ({...f, impact: +e.target.value}))} /></div>
        <div><label className="text-sm font-medium">Effort (1–5)</label><Input type="number" min={1} max={5} value={ideaForm.effort} onChange={e => setIdeaForm(f => ({...f, effort: +e.target.value}))} /></div>
      </div>
      <div><label className="text-sm font-medium">Customer Segments (comma-separated)</label><Input value={ideaForm.customerSegments} onChange={e => setIdeaForm(f => ({...f, customerSegments: e.target.value}))} placeholder="Enterprise, SMB, Startups" /></div>
      <div><label className="text-sm font-medium">Documents URL</label><Input value={ideaForm.documents} onChange={e => setIdeaForm(f => ({...f, documents: e.target.value}))} placeholder="https://..." /></div>
    </div>
  );

  // ─── RENDER ─────────────────────────────────────────────────
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
          <Select value={selectedProjectId} onChange={setSelectedProjectId} options={projects.map(p => ({ label: p.name, value: p.id }))} className="w-48" />
          <Button onClick={() => setNewSprintOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> New Sprint
          </Button>
        </div>
      </div>

      <Tabs className="flex-1 flex flex-col min-h-0">
        <TabsList className="mb-4 shrink-0 flex-wrap">
          {[
            { id: 'summary', icon: <Target className="w-4 h-4 mr-1" />, label: 'Summary' },
            { id: 'all_ideas', icon: <List className="w-4 h-4 mr-1" />, label: 'All Ideas' },
            { id: 'impact', icon: <Zap className="w-4 h-4 mr-1" />, label: 'Impact Assessment' },
            { id: 'roadmap', icon: <Map className="w-4 h-4 mr-1" />, label: 'Roadmap' },
            { id: 'timeline', icon: <Calendar className="w-4 h-4 mr-1" />, label: 'Timeline' },
            { id: 'epics', icon: <Layers className="w-4 h-4 mr-1" />, label: 'Epics' },
            { id: 'releases', icon: <Package className="w-4 h-4 mr-1" />, label: 'Releases' },
            { id: 'backlog', icon: <List className="w-4 h-4 mr-1" />, label: 'Backlog' },
            { id: 'reports', icon: <Zap className="w-4 h-4 mr-1" />, label: 'Reports' },
          ].map(t => (
            <TabsTrigger key={t.id} active={activeTab === t.id} onClick={() => setActiveTab(t.id)}>
              {t.icon}{t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 min-h-0 overflow-y-auto pr-2">

          {/* ─── SUMMARY ─── */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Tasks', value: projectTasks.length, sub: 'Across all sprints & backlog', color: '' },
                  { label: 'In Progress', value: projectTasks.filter(t => t.status === 'in_progress' || t.status === 'in-progress').length, sub: 'Currently being worked on', color: 'text-primary' },
                  { label: 'Done', value: projectTasks.filter(t => t.status === 'done' || t.status === 'completed').length, sub: 'Completed tasks', color: 'text-emerald-500' },
                  { label: 'Ideas', value: ideas.length, sub: 'Product ideas tracked', color: 'text-violet-500' },
                ].map(card => (
                  <Card key={card.label} className="glass-card">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle></CardHeader>
                    <CardContent>
                      <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
                      <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="glass-card lg:col-span-2">
                  <CardHeader><CardTitle>Ideas by Roadmap Status</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(['Now','Next','Later'] as const).map(status => {
                        const count = ideas.filter(i => i.roadmapStatus === status).length;
                        const pct = ideas.length ? Math.round((count / ideas.length) * 100) : 0;
                        return (
                          <div key={status}>
                            <div className="flex justify-between text-sm mb-1"><span>{status}</span><span className="font-medium">{count} ({pct}%)</span></div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden"><div className={`h-full rounded-full ${roadmapColors[status]}/60`} style={{width:`${pct}%`}} /></div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardHeader><CardTitle>Top Scoring Ideas</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[...ideas].sort((a,b)=>b.score-a.score).slice(0,4).map(idea => (
                        <div key={idea.id} className="flex items-center gap-3">
                          <Badge className="bg-primary/10 text-primary font-bold w-10 text-center">{idea.score}</Badge>
                          <span className="text-sm truncate flex-1">{idea.summary}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ─── ALL IDEAS ─── */}
          {activeTab === 'all_ideas' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <Button variant="default" size="sm" onClick={() => setCreateIdeaOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Create
                  </Button>
                  <Dropdown trigger={<Button variant="outline" size="sm">Group by: {ideaGroupBy === 'none' ? 'None' : ideaGroupBy} <ChevronDown className="w-3 h-3 ml-1" /></Button>}>
                    {([['none','None'],['theme','Theme'],['roadmapStatus','Roadmap Status'],['state','State']] as [string,string][]).map(([val,lbl]) => (
                      <DropdownItem key={val} onClick={() => setIdeaGroupBy(val as any)}>{lbl}</DropdownItem>
                    ))}
                  </Dropdown>
                  <Dropdown trigger={<Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1" />Filter {ideaFilter !== 'all' ? `(${ideaFilter})` : ''}</Button>}>
                    {[['all','All'],['Now','Now'],['Next','Next'],['Later','Later']].map(([val,lbl]) => (
                      <DropdownItem key={val} onClick={() => setIdeaFilter(val)}>{lbl}</DropdownItem>
                    ))}
                  </Dropdown>
                  <Dropdown trigger={<Button variant="outline" size="sm"><ArrowUpDown className="w-4 h-4 mr-1" />Sort</Button>}>
                    {([['score_desc','Score ↓'],['score_asc','Score ↑'],['impact_desc','Impact ↓'],['effort_asc','Effort ↑']] as [string,string][]).map(([val,lbl]) => (
                      <DropdownItem key={val} onClick={() => setIdeaSort(val as any)}>{lbl}</DropdownItem>
                    ))}
                  </Dropdown>
                </div>
                <div className="relative w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={ideaSearch} onChange={e => setIdeaSearch(e.target.value)} placeholder="Find an idea..." className="pl-9 h-9" />
                </div>
              </div>

              {Object.entries(groupedIdeas).map(([group, groupIdeas]) => (
                <div key={group}>
                  {ideaGroupBy !== 'none' && <div className="text-sm font-semibold text-muted-foreground mb-2 mt-4 flex items-center gap-2"><ChevronRight className="w-4 h-4" />{group} <Badge className="bg-muted text-foreground text-xs">{groupIdeas.length}</Badge></div>}
                  <div className="rounded-md border border-border/50 overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 border-b border-border/50 text-xs font-semibold text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 min-w-[200px]">Summary</th>
                          <th className="px-4 py-3"><MessageSquare className="w-4 h-4 inline" /></th>
                          <th className="px-4 py-3"><TrendingUp className="w-4 h-4 inline mr-1" />Insights</th>
                          <th className="px-4 py-3">Theme</th>
                          <th className="px-4 py-3">Roadmap</th>
                          <th className="px-4 py-3">State</th>
                          <th className="px-4 py-3">Progress</th>
                          <th className="px-4 py-3 w-16">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50 bg-card">
                        {groupIdeas.map(idea => (
                          <tr key={idea.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-medium">{idea.summary}</td>
                            <td className="px-4 py-3 text-center text-muted-foreground">
                              {idea.comments > 0 ? <span className="flex items-center justify-center gap-1"><MessageSquare className="w-4 h-4" />{idea.comments}</span> : <MessageSquare className="w-4 h-4 mx-auto opacity-30" />}
                            </td>
                            <td className="px-4 py-3 font-semibold text-blue-500">
                              {idea.insights > 0 ? <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4" />{idea.insights}</span> : <TrendingUp className="w-4 h-4 opacity-30 text-muted-foreground" />}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="bg-card font-semibold">{idea.theme}</Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={`${idea.roadmapStatus === 'Now' ? 'bg-cyan-500/20 text-cyan-500' : idea.roadmapStatus === 'Next' ? 'bg-blue-500/20 text-blue-500' : 'bg-indigo-500/20 text-indigo-500'}`}>{idea.roadmapStatus}</Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={`${idea.state === 'On track' ? 'bg-emerald-500/20 text-emerald-500' : idea.state === 'At risk' ? 'bg-amber-500/20 text-amber-500' : 'bg-gray-500/20 text-gray-400'}`}>{idea.state}</Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-0.5 items-center">
                                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary rounded-full" style={{width:`${idea.deliveryProgress}%`}} /></div>
                                <span className="text-xs text-muted-foreground ml-1 w-8">{idea.deliveryProgress}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Dropdown trigger={<Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-4 h-4" /></Button>}>
                                <DropdownItem onClick={() => openEditIdea(idea)}><Edit2 className="w-3 h-3" />Edit</DropdownItem>
                                <DropdownItem onClick={() => handleDeleteIdea(idea.id)} className="text-red-400"><Trash2 className="w-3 h-3" />Delete</DropdownItem>
                              </Dropdown>
                            </td>
                          </tr>
                        ))}
                        {groupIdeas.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No ideas found.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─── IMPACT ASSESSMENT ─── */}
          {activeTab === 'impact' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <Button variant="default" size="sm" onClick={() => setCreateIdeaOpen(true)}><Plus className="w-4 h-4 mr-1" />Create</Button>
                  <Dropdown trigger={<Button variant="outline" size="sm">Group by: {ideaGroupBy === 'none' ? 'None' : ideaGroupBy} <ChevronDown className="w-3 h-3 ml-1" /></Button>}>
                    {([['none','None'],['theme','Theme'],['roadmapStatus','Status'],['state','State']] as [string,string][]).map(([val,lbl]) => (
                      <DropdownItem key={val} onClick={() => setIdeaGroupBy(val as any)}>{lbl}</DropdownItem>
                    ))}
                  </Dropdown>
                  <Dropdown trigger={<Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1" />Filter</Button>}>
                    {[['all','All'],['Now','Now'],['Next','Next'],['Later','Later']].map(([val,lbl]) => (
                      <DropdownItem key={val} onClick={() => setIdeaFilter(val)}>{lbl}</DropdownItem>
                    ))}
                  </Dropdown>
                  <Dropdown trigger={<Button variant="outline" size="sm"><ArrowUpDown className="w-4 h-4 mr-1" />Sort</Button>}>
                    {([['score_desc','Score ↓'],['impact_desc','Impact ↓'],['effort_asc','Effort ↑']] as [string,string][]).map(([val,lbl]) => (
                      <DropdownItem key={val} onClick={() => setIdeaSort(val as any)}>{lbl}</DropdownItem>
                    ))}
                  </Dropdown>
                </div>
                <div className="relative w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={ideaSearch} onChange={e => setIdeaSearch(e.target.value)} placeholder="Find an idea..." className="pl-9 h-9" />
                </div>
              </div>
              <div className="rounded-md border border-border/50 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 border-b border-border/50 text-xs font-semibold text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 min-w-[200px]">Summary</th>
                      <th className="px-4 py-3">Theme</th>
                      <th className="px-4 py-3 text-center"><MessageSquare className="w-4 h-4 inline" /></th>
                      <th className="px-4 py-3"><TrendingUp className="w-4 h-4 inline mr-1" />Insights</th>
                      <th className="px-4 py-3"><BarChart3 className="w-4 h-4 inline mr-1" />Impact</th>
                      <th className="px-4 py-3"><BarChart3 className="w-4 h-4 inline mr-1" />Effort</th>
                      <th className="px-4 py-3">Score ↓</th>
                      <th className="px-4 py-3"><Users className="w-4 h-4 inline mr-1" />Segments</th>
                      <th className="px-4 py-3 w-16">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 bg-card">
                    {filteredIdeas.map(idea => (
                      <tr key={idea.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">{idea.summary}</td>
                        <td className="px-4 py-3"><Badge variant="outline" className="bg-card font-semibold text-xs">{idea.theme}</Badge></td>
                        <td className="px-4 py-3 text-center text-muted-foreground">
                          {idea.comments > 0 ? <span className="flex items-center justify-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{idea.comments}</span> : <MessageSquare className="w-3.5 h-3.5 mx-auto opacity-30" />}
                        </td>
                        <td className="px-4 py-3 font-semibold text-blue-500">
                          {idea.insights > 0 ? <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" />{idea.insights}</span> : <TrendingUp className="w-3.5 h-3.5 opacity-30 text-muted-foreground" />}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">{[1,2,3,4,5].map(dot => <div key={dot} className={`w-2.5 h-2.5 rounded-full ${dot <= idea.impact ? 'bg-blue-400' : 'bg-muted-foreground/30'}`} />)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">{[1,2,3,4,5].map(dot => <div key={dot} className={`w-2.5 h-2.5 rounded-full ${dot <= idea.effort ? 'bg-red-400' : 'bg-muted-foreground/30'}`} />)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`${idea.score >= 3 ? 'bg-emerald-500/20 text-emerald-500' : idea.score >= 1 ? 'bg-amber-500/20 text-amber-500' : 'bg-gray-500/20 text-gray-400'}`}>{idea.score}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">{idea.customerSegments.map(seg => <Badge key={seg} variant="outline" className="text-xs bg-muted/50 font-normal">{seg}</Badge>)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Dropdown trigger={<Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-4 h-4" /></Button>}>
                            <DropdownItem onClick={() => openEditIdea(idea)}><Edit2 className="w-3 h-3" />Edit</DropdownItem>
                            <DropdownItem onClick={() => handleDeleteIdea(idea.id)} className="text-red-400"><Trash2 className="w-3 h-3" />Delete</DropdownItem>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                    {filteredIdeas.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">No ideas found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── ROADMAP (Kanban + Drag & Drop) ─── */}
          {activeTab === 'roadmap' && (
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <Button variant="default" size="sm" onClick={() => setCreateIdeaOpen(true)}><Plus className="w-4 h-4 mr-1" />Create</Button>
                  <Dropdown trigger={<Button variant="outline" size="sm">Group by: {ideaGroupBy === 'none' ? 'Roadmap' : ideaGroupBy} <ChevronDown className="w-3 h-3 ml-1" /></Button>}>
                    {([['none','Roadmap (Default)'],['theme','Theme'],['state','State']] as [string,string][]).map(([val,lbl]) => (
                      <DropdownItem key={val} onClick={() => setIdeaGroupBy(val as any)}>{lbl}</DropdownItem>
                    ))}
                  </Dropdown>
                  <Dropdown trigger={<Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1" />Filter {roadmapFilter !== 'all' ? `(${roadmapFilter})` : ''}</Button>}>
                    {[['all','All'],['On track','On track'],['At risk','At risk'],['Pending','Pending']].map(([val,lbl]) => (
                      <DropdownItem key={val} onClick={() => setRoadmapFilter(val)}>{lbl}</DropdownItem>
                    ))}
                  </Dropdown>
                  <Dropdown trigger={<Button variant="outline" size="sm"><ArrowUpDown className="w-4 h-4 mr-1" />Sort</Button>}>
                    {([['score_desc','Score ↓'],['impact_desc','Impact ↓']] as [string,string][]).map(([val,lbl]) => (
                      <DropdownItem key={val} onClick={() => setIdeaSort(val as any)}>{lbl}</DropdownItem>
                    ))}
                  </Dropdown>
                </div>
                <div className="relative w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={ideaSearch} onChange={e => setIdeaSearch(e.target.value)} placeholder="Find an idea..." className="pl-9 h-9" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">💡 Drag and drop cards between columns to update roadmap status</p>
              <div className="flex-1 min-h-0 flex gap-4 overflow-x-auto pb-4">
                {(["Now", "Next", "Later", "Won't do"] as const).map(status => {
                  const colIdeas = filteredIdeas.filter(i => i.roadmapStatus === status && (roadmapFilter === 'all' || i.state === roadmapFilter));
                  const isDragOver = dragOverColumn === status;
                  return (
                    <div
                      key={status}
                      className={`w-[300px] shrink-0 rounded-lg border flex flex-col transition-all ${isDragOver ? 'border-primary bg-primary/5' : 'border-border/50 bg-muted/30'}`}
                      onDragOver={e => handleDragOver(e, status)}
                      onDrop={() => handleDrop(status)}
                      onDragLeave={() => setDragOverColumn(null)}
                    >
                      <div className="p-3 border-b border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${roadmapColors[status]}`} />
                          <Badge className="bg-muted text-foreground font-semibold">{status}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">{colIdeas.length}</span>
                      </div>
                      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                        {colIdeas.map(idea => (
                          <Card
                            key={idea.id}
                            className={`bg-card shadow-sm cursor-grab active:cursor-grabbing transition-all ${draggedIdeaId === idea.id ? 'opacity-50 scale-95' : 'hover:border-primary/50'}`}
                            draggable
                            onDragStart={() => handleDragStart(idea.id)}
                            onDragEnd={() => { setDraggedIdeaId(null); setDragOverColumn(null); }}
                          >
                            <CardContent className="p-3">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-sm leading-tight">{idea.summary}</h4>
                                <Dropdown trigger={<Button variant="ghost" size="icon" className="h-5 w-5 -mr-1 -mt-1 shrink-0"><MoreHorizontal className="w-3 h-3" /></Button>}>
                                  <DropdownItem onClick={() => openEditIdea(idea)}><Edit2 className="w-3 h-3" />Edit</DropdownItem>
                                  <DropdownItem onClick={() => handleDeleteIdea(idea.id)} className="text-red-400"><Trash2 className="w-3 h-3" />Delete</DropdownItem>
                                </Dropdown>
                              </div>
                              {idea.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{idea.description}</p>}
                              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                                <Badge variant="outline" className="text-[10px] bg-card font-semibold px-1.5 py-0.5">{idea.theme}</Badge>
                                <Badge className={`text-[10px] px-1.5 py-0.5 font-semibold ${idea.state === 'On track' ? 'bg-emerald-500/20 text-emerald-500' : idea.state === 'At risk' ? 'bg-amber-500/20 text-amber-500' : 'bg-gray-500/20 text-gray-400'}`}>{idea.state}</Badge>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                                <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />Impact: {idea.impact}</span>
                                <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />Score: {idea.score}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        <Button variant="ghost" size="sm" className="w-full text-muted-foreground text-xs justify-start h-8 mt-2" onClick={() => { setIdeaForm(f => ({...f, roadmapStatus: status})); setCreateIdeaOpen(true); }}>
                          <Plus className="w-3 h-3 mr-1" /> Add idea
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── TIMELINE (Proper Gantt Chart) ─── */}
          {activeTab === 'timeline' && (
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <Dropdown trigger={<Button variant="outline" size="sm">Group by: {ideaGroupBy === 'none' ? 'None' : ideaGroupBy} <ChevronDown className="w-3 h-3 ml-1" /></Button>}>
                    {([['none','None'],['theme','Theme'],['roadmapStatus','Roadmap Status'],['state','State']] as [string,string][]).map(([val,lbl]) => (
                      <DropdownItem key={val} onClick={() => setIdeaGroupBy(val as any)}>{lbl}</DropdownItem>
                    ))}
                  </Dropdown>
                  <Dropdown trigger={<Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1" />Filter {ideaFilter !== 'all' ? `(${ideaFilter})` : ''}</Button>}>
                    {[['all','All'],['Now','Now'],['Next','Next'],['Later','Later']].map(([val,lbl]) => (
                      <DropdownItem key={val} onClick={() => setIdeaFilter(val)}>{lbl}</DropdownItem>
                    ))}
                  </Dropdown>
                  <Dropdown trigger={<Button variant="outline" size="sm"><ArrowUpDown className="w-4 h-4 mr-1" />Sort</Button>}>
                    {([['score_desc','Score ↓'],['impact_desc','Impact ↓']] as [string,string][]).map(([val,lbl]) => (
                      <DropdownItem key={val} onClick={() => setIdeaSort(val as any)}>{lbl}</DropdownItem>
                    ))}
                  </Dropdown>
                </div>
                <Button size="sm" onClick={() => setCreateIdeaOpen(true)}><Plus className="w-4 h-4 mr-1" />Add Idea</Button>
              </div>

              {/* Gantt Chart */}
              <div className="flex-1 min-h-0 bg-card rounded-lg border border-border overflow-hidden flex flex-col">
                {/* Month header */}
                <div className="flex bg-muted/50 border-b border-border sticky top-0 z-10">
                  {/* Label column */}
                  <div className="w-52 shrink-0 border-r border-border py-2 px-3 text-xs font-semibold text-muted-foreground">Idea</div>
                  {/* Month columns */}
                  <div className="flex-1 flex overflow-x-auto">
                    {MONTHS.map((m, i) => (
                      <div key={i} className="flex-1 min-w-[80px] text-center py-2 text-xs font-semibold text-muted-foreground border-r border-border/50 last:border-r-0">
                        {format(m, 'MMM yy')}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rows */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                  {timelineIdeas.length === 0 && (
                    <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">No ideas with date ranges to display.</div>
                  )}
                  {timelineIdeas.map((idea, idx) => (
                    <div key={idea.id} className={`flex items-center border-b border-border/30 hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? '' : 'bg-muted/10'}`} style={{height: '44px'}}>
                      {/* Label */}
                      <div className="w-52 shrink-0 border-r border-border px-3 text-xs font-medium truncate" title={idea.summary}>
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${roadmapColors[idea.roadmapStatus]}`} />
                        {idea.summary}
                      </div>
                      {/* Gantt bar area */}
                      <div className="flex-1 relative h-full" style={{minWidth: `${MONTHS.length * 80}px`}}>
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex pointer-events-none">
                          {MONTHS.map((_, i) => <div key={i} className="flex-1 border-r border-border/20 border-dashed" />)}
                        </div>
                        {/* Bar */}
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 h-6 rounded flex items-center px-2 text-[10px] font-semibold text-white shadow-sm cursor-pointer group transition-all hover:h-7 hover:shadow-md ${roadmapColors[idea.roadmapStatus]}/80`}
                          style={getGanttStyle(idea.startDate, idea.endDate)}
                          title={`${idea.summary} | ${idea.startDate ? format(idea.startDate, 'MMM d, yyyy') : ''} → ${idea.endDate ? format(idea.endDate, 'MMM d, yyyy') : ''}`}
                          onClick={() => openEditIdea(idea)}
                        >
                          <span className="truncate">{idea.summary}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── EPICS ─── */}
          {activeTab === 'epics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Epics</h2>
                <Button size="sm" onClick={() => setEpicDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Create Epic
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectEpics.map(epic => (
                  <Card key={epic.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="mb-2">Epic</Badge>
                        <div className="flex items-center gap-1">
                          <Badge className={epic.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}>
                            {epic.status.replace('_', ' ')}
                          </Badge>
                          <Dropdown trigger={<Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-4 h-4" /></Button>}>
                            <DropdownItem onClick={() => { setEditingEpic(epic); setEpicForm({title: epic.title, description: epic.description, status: epic.status, startDate: epic.startDate || '', targetDate: epic.targetDate || ''}); setEditEpicDialogOpen(true); }}><Edit2 className="w-3 h-3" />Edit</DropdownItem>
                            <DropdownItem onClick={() => deleteEpic(epic.id)} className="text-red-400"><Trash2 className="w-3 h-3" />Delete</DropdownItem>
                          </Dropdown>
                        </div>
                      </div>
                      <CardTitle className="text-base">{epic.title}</CardTitle>
                      <CardDescription className="line-clamp-2 text-xs">{epic.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 mt-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{epic.progress || 0}%</span>
                          </div>
                          <Progress value={epic.progress || 0} className="h-2" />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{epic.startDate ? format(parseISO(epic.startDate), 'MMM dd') : 'Unscheduled'}</span>
                          {epic.targetDate && <span className="flex items-center gap-1"><Target className="w-3 h-3" />{format(parseISO(epic.targetDate), 'MMM dd, yyyy')}</span>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {projectEpics.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                    <Layers className="w-12 h-12 opacity-20" />
                    <p>No epics yet. Create your first epic to group related tasks.</p>
                    <Button size="sm" onClick={() => setEpicDialogOpen(true)}><Plus className="w-4 h-4 mr-1" />Create Epic</Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── RELEASES ─── */}
          {activeTab === 'releases' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Releases & Versions</h2>
                <Button size="sm" onClick={() => setReleaseDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" /> New Release
                </Button>
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
                          <Dropdown trigger={<Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-4 h-4" /></Button>}>
                            <DropdownItem onClick={() => { setEditingRelease(release); setReleaseForm({name: release.name, description: release.description || '', status: release.status, targetDate: release.targetDate || ''}); setEditReleaseDialogOpen(true); }}><Edit2 className="w-3 h-3" />Edit</DropdownItem>
                            <DropdownItem onClick={() => deleteRelease(release.id)} className="text-red-400"><Trash2 className="w-3 h-3" />Delete</DropdownItem>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                    {projectReleases.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-16 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-3">
                          <Package className="w-12 h-12 opacity-20" />
                          <p>No releases planned. Create your first release.</p>
                          <Button size="sm" onClick={() => setReleaseDialogOpen(true)}><Plus className="w-4 h-4 mr-1" />New Release</Button>
                        </div>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── BACKLOG ─── */}
          {activeTab === 'backlog' && (
            <div className="flex flex-col lg:flex-row gap-6 h-full">
              <div className="w-full lg:w-64 shrink-0 space-y-4">
                <div className="space-y-3 bg-muted/30 p-3 rounded-lg border border-border">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Calendar className="w-3 h-3" />Sprints</h3>
                  {projectSprints.map(sprint => (
                    <div key={sprint.id} onClick={() => setSelectedSprintId(sprint.id)} className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedSprint?.id === sprint.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{sprint.name}</span>
                        <Badge variant={sprint.status === 'active' ? 'default' : 'secondary'} className="text-xs">{sprint.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{sprint.goal}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Backlog</h2>
                </div>
                {selectedSprint && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <ChevronDown className="w-4 h-4" />{selectedSprint.name} ({sprintTasks.length} tasks)
                    </div>
                    {sprintTasks.map(task => (
                      <div key={task.id} onClick={() => { setSelectedTaskId(task.id); setTaskDetailOpen(true); }} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors group bg-card">
                        <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                        <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{task.title}</p></div>
                        <Badge variant="outline" className={priorityColors[task.priority] || ''}>{task.priority}</Badge>
                        <Badge className={statusColors[task.status] || ''}>{(task.status || '').replace('_', ' ')}</Badge>
                        {task.assigneeId ? <Avatar src={users.find(u => u.id === task.assigneeId)?.avatar} fallback="A" className="w-6 h-6" /> : <div className="w-6 h-6 rounded-full bg-muted border border-dashed" />}
                      </div>
                    ))}
                    {sprintTasks.length === 0 && <p className="text-sm text-muted-foreground py-2 pl-6">No tasks in this sprint.</p>}
                  </div>
                )}
                <div className="space-y-2 mt-6">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground border-t border-border pt-4">
                    <ChevronDown className="w-4 h-4" />Backlog ({backlogTasks.length} tasks)
                  </div>
                  {backlogTasks.map(task => (
                    <div key={task.id} onClick={() => { setSelectedTaskId(task.id); setTaskDetailOpen(true); }} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors group bg-card">
                      <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{task.title}</p></div>
                      <Badge variant="outline" className={priorityColors[task.priority] || ''}>{task.priority}</Badge>
                      <Badge className={statusColors[task.status] || ''}>{(task.status || '').replace('_', ' ')}</Badge>
                      {task.assigneeId ? <Avatar src={users.find(u => u.id === task.assigneeId)?.avatar} fallback="A" className="w-6 h-6" /> : <div className="w-6 h-6 rounded-full bg-muted border border-dashed" />}
                    </div>
                  ))}
                  {backlogTasks.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No backlog items</p>}
                </div>
              </div>
            </div>
          )}

          {/* ─── REPORTS ─── */}
          {activeTab === 'reports' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
              <Card>
                <CardHeader><CardTitle>Sprint Velocity</CardTitle><CardDescription>Story points completed per sprint</CardDescription></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={projectSprints}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#888" fontSize={11} />
                      <YAxis stroke="#888" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                      <Legend />
                      <Bar dataKey="velocity" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Velocity" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Ideas by Impact</CardTitle><CardDescription>Distribution across impact levels</CardDescription></CardHeader>
                <CardContent>
                  <div className="space-y-3 mt-2">
                    {[5,4,3,2,1].map(imp => {
                      const count = ideas.filter(i => i.impact === imp).length;
                      const pct = ideas.length ? Math.round((count / ideas.length) * 100) : 0;
                      return (
                        <div key={imp}>
                          <div className="flex justify-between text-sm mb-1"><span>Impact {imp}</span><span className="font-medium">{count}</span></div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-blue-500" style={{width:`${pct}%`}} /></div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </Tabs>

      {/* ── Create Idea Dialog ── */}
      <Dialog open={createIdeaOpen} onClose={() => setCreateIdeaOpen(false)}>
        <DialogHeader>
          <DialogTitle>Create New Idea</DialogTitle>
          <DialogDescription>Capture a product idea to be scored and prioritized.</DialogDescription>
        </DialogHeader>
        <IdeaFormFields />
        <DialogFooter>
          <Button variant="outline" onClick={() => setCreateIdeaOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateIdea} disabled={!ideaForm.summary}>Create Idea</Button>
        </DialogFooter>
      </Dialog>

      {/* ── Edit Idea Dialog ── */}
      <Dialog open={editIdeaOpen} onClose={() => setEditIdeaOpen(false)}>
        <DialogHeader>
          <DialogTitle>Edit Idea</DialogTitle>
          <DialogDescription>Update the details of this idea.</DialogDescription>
        </DialogHeader>
        <IdeaFormFields />
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditIdeaOpen(false)}>Cancel</Button>
          <Button onClick={handleEditIdea}>Save Changes</Button>
        </DialogFooter>
      </Dialog>

      {/* ── Create Epic Dialog ── */}
      <Dialog open={epicDialogOpen} onClose={() => setEpicDialogOpen(false)}>
        <DialogHeader>
          <DialogTitle>Create Epic</DialogTitle>
          <DialogDescription>Group related tasks into an epic for this project.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div><label className="text-sm font-medium">Title *</label><Input value={epicForm.title} onChange={e => setEpicForm(f => ({...f, title: e.target.value}))} placeholder="Epic title" /></div>
          <div><label className="text-sm font-medium">Description</label><Input value={epicForm.description} onChange={e => setEpicForm(f => ({...f, description: e.target.value}))} placeholder="What is this epic about?" /></div>
          <div><label className="text-sm font-medium">Status</label>
            <Select value={epicForm.status} onChange={v => setEpicForm(f => ({...f, status: v}))} options={['planning','in_progress','completed'].map(s => ({label: s.replace('_',' '), value: s}))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Start Date</label><Input type="date" value={epicForm.startDate} onChange={e => setEpicForm(f => ({...f, startDate: e.target.value}))} /></div>
            <div><label className="text-sm font-medium">Target Date</label><Input type="date" value={epicForm.targetDate} onChange={e => setEpicForm(f => ({...f, targetDate: e.target.value}))} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setEpicDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateEpic} disabled={!epicForm.title}>Create Epic</Button>
        </DialogFooter>
      </Dialog>

      {/* ── Edit Epic Dialog ── */}
      <Dialog open={editEpicDialogOpen} onClose={() => setEditEpicDialogOpen(false)}>
        <DialogHeader><DialogTitle>Edit Epic</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-4">
          <div><label className="text-sm font-medium">Title *</label><Input value={epicForm.title} onChange={e => setEpicForm(f => ({...f, title: e.target.value}))} /></div>
          <div><label className="text-sm font-medium">Description</label><Input value={epicForm.description} onChange={e => setEpicForm(f => ({...f, description: e.target.value}))} /></div>
          <div><label className="text-sm font-medium">Status</label>
            <Select value={epicForm.status} onChange={v => setEpicForm(f => ({...f, status: v}))} options={['planning','in_progress','completed'].map(s => ({label: s.replace('_',' '), value: s}))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Start Date</label><Input type="date" value={epicForm.startDate} onChange={e => setEpicForm(f => ({...f, startDate: e.target.value}))} /></div>
            <div><label className="text-sm font-medium">Target Date</label><Input type="date" value={epicForm.targetDate} onChange={e => setEpicForm(f => ({...f, targetDate: e.target.value}))} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditEpicDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEpic}>Save Changes</Button>
        </DialogFooter>
      </Dialog>

      {/* ── Create Release Dialog ── */}
      <Dialog open={releaseDialogOpen} onClose={() => setReleaseDialogOpen(false)}>
        <DialogHeader>
          <DialogTitle>New Release</DialogTitle>
          <DialogDescription>Plan a new version or release for this project.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div><label className="text-sm font-medium">Version Name *</label><Input value={releaseForm.name} onChange={e => setReleaseForm(f => ({...f, name: e.target.value}))} placeholder="e.g., v2.0 Beta" /></div>
          <div><label className="text-sm font-medium">Description</label><Input value={releaseForm.description} onChange={e => setReleaseForm(f => ({...f, description: e.target.value}))} placeholder="What's included in this release?" /></div>
          <div><label className="text-sm font-medium">Status</label>
            <Select value={releaseForm.status} onChange={v => setReleaseForm(f => ({...f, status: v}))} options={['planned','in_progress','released'].map(s => ({label: s.replace('_',' '), value: s}))} />
          </div>
          <div><label className="text-sm font-medium">Target Date</label><Input type="date" value={releaseForm.targetDate} onChange={e => setReleaseForm(f => ({...f, targetDate: e.target.value}))} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setReleaseDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateRelease} disabled={!releaseForm.name}>Create Release</Button>
        </DialogFooter>
      </Dialog>

      {/* ── Edit Release Dialog ── */}
      <Dialog open={editReleaseDialogOpen} onClose={() => setEditReleaseDialogOpen(false)}>
        <DialogHeader><DialogTitle>Edit Release</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-4">
          <div><label className="text-sm font-medium">Version Name *</label><Input value={releaseForm.name} onChange={e => setReleaseForm(f => ({...f, name: e.target.value}))} /></div>
          <div><label className="text-sm font-medium">Description</label><Input value={releaseForm.description} onChange={e => setReleaseForm(f => ({...f, description: e.target.value}))} /></div>
          <div><label className="text-sm font-medium">Status</label>
            <Select value={releaseForm.status} onChange={v => setReleaseForm(f => ({...f, status: v}))} options={['planned','in_progress','released'].map(s => ({label: s.replace('_',' '), value: s}))} />
          </div>
          <div><label className="text-sm font-medium">Target Date</label><Input type="date" value={releaseForm.targetDate} onChange={e => setReleaseForm(f => ({...f, targetDate: e.target.value}))} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditReleaseDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveRelease}>Save Changes</Button>
        </DialogFooter>
      </Dialog>

      {/* ── New Sprint Dialog ── */}
      <Dialog open={newSprintOpen} onClose={() => setNewSprintOpen(false)}>
        <DialogHeader>
          <DialogTitle>Create Sprint</DialogTitle>
          <DialogDescription>Plan a new sprint for this project</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div><label className="text-sm font-medium">Sprint Name</label><Input value={newSprintName} onChange={e => setNewSprintName(e.target.value)} placeholder="e.g., Sprint 27 - November" /></div>
          <div><label className="text-sm font-medium">Sprint Goal</label><Input value={newSprintGoal} onChange={e => setNewSprintGoal(e.target.value)} placeholder="What are we aiming to achieve?" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Start Date</label><Input type="date" value={newSprintStart} onChange={e => setNewSprintStart(e.target.value)} /></div>
            <div><label className="text-sm font-medium">End Date</label><Input type="date" value={newSprintEnd} onChange={e => setNewSprintEnd(e.target.value)} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setNewSprintOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateSprint}>Create Sprint</Button>
        </DialogFooter>
      </Dialog>

      {/* ── Task Detail Dialog (with live comments/discussions) ── */}
      {selectedTask && (
        <Dialog open={taskDetailOpen} onClose={() => setTaskDetailOpen(false)}>
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-muted-foreground">{selectedTask.id.replace('task-', 'TSK-').toUpperCase()}</span>
            </div>
            <DialogTitle className="text-xl">{selectedTask.title}</DialogTitle>
            <DialogDescription>{selectedTask.description || 'No description provided.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-6 bg-muted/20 p-4 rounded-xl border border-border">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                <Select value={selectedTask.status} onChange={v => updateTask(selectedTask.id, { status: v })} options={[{label:'Not Started',value:'not-started'},{label:'In Progress',value:'in-progress'},{label:'Completed',value:'completed'}]} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Priority</label>
                <Select value={selectedTask.priority || 'medium'} onChange={v => updateTask(selectedTask.id, { priority: v })} options={['low','medium','high','urgent'].map(p => ({label: p, value: p}))} />
              </div>
            </div>

            {/* Live Discussion / Comments */}
            <div className="pt-4 border-t border-border">
              <label className="text-sm font-semibold mb-3 block flex items-center gap-2"><MessageSquare className="w-4 h-4" />Discussion</label>
              <ScrollArea className="h-44 pr-2 mb-3">
                <div className="space-y-3">
                  {/* Pre-existing mock comment */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <Avatar src={users[0]?.avatar} fallback="A" className="w-8 h-8" />
                    <div className="text-sm flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-semibold">{users[0]?.name || 'Team Member'}</p>
                        <span className="text-xs text-muted-foreground">Previously</span>
                      </div>
                      <p className="text-muted-foreground text-sm">Working on this task now.</p>
                    </div>
                  </div>
                  {/* Live comments added in this session */}
                  {(taskComments[selectedTask.id] || []).map(comment => (
                    <div key={comment.id} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">You</div>
                      <div className="text-sm flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-semibold">You</p>
                          <span className="text-xs text-muted-foreground">{format(parseISO(comment.timestamp), 'h:mm a')}</span>
                        </div>
                        <p className="text-foreground">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                  {(taskComments[selectedTask.id] || []).length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">No comments yet. Be the first to comment!</p>
                  )}
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Input
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Add a comment or question..."
                  className="flex-1"
                  onKeyDown={e => { if (e.key === 'Enter' && newComment) { handleAddComment(); } }}
                />
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  <MessageSquare className="w-4 h-4 mr-2" /> Send
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* ── Walkthrough ── */}
      {showWalkthrough && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-lg rounded-xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Product Management Module</h2>
              <Button variant="ghost" size="icon" onClick={() => { setShowWalkthrough(false); setWalkthroughStep(0); }}><X className="w-4 h-4" /></Button>
            </div>
            <div className="my-6 min-h-[120px]">
              {walkthroughStep === 0 && <div className="space-y-3"><h3 className="font-semibold text-primary flex items-center gap-2"><List className="w-5 h-5" />All Ideas & Impact Assessment</h3><p className="text-sm text-muted-foreground">Capture product ideas, score them by impact vs effort, and filter/group by theme or roadmap status. Use the Create button to add new ideas, and three-dot menus to edit or delete them.</p></div>}
              {walkthroughStep === 1 && <div className="space-y-3"><h3 className="font-semibold text-primary flex items-center gap-2"><Map className="w-5 h-5" />Roadmap with Drag & Drop</h3><p className="text-sm text-muted-foreground">The Roadmap view shows ideas in Now / Next / Later columns. You can drag and drop cards between columns to instantly update their roadmap status.</p></div>}
              {walkthroughStep === 2 && <div className="space-y-3"><h3 className="font-semibold text-primary flex items-center gap-2"><Calendar className="w-5 h-5" />Gantt Timeline</h3><p className="text-sm text-muted-foreground">The Timeline view renders ideas as proper Gantt bars across a 12-month calendar. Each bar represents an idea's start and end date. Click any bar to edit the idea.</p></div>}
              {walkthroughStep === 3 && <div className="space-y-3"><h3 className="font-semibold text-primary flex items-center gap-2"><MessageSquare className="w-5 h-5" />Live Discussions</h3><p className="text-sm text-muted-foreground">Click on any task in the Backlog to open the task detail panel. Use the Discussion section to post live comments — they appear instantly in the thread.</p></div>}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-1">{[0,1,2,3].map(s => <div key={s} className={`w-2 h-2 rounded-full transition-colors ${s === walkthroughStep ? 'bg-primary' : 'bg-muted-foreground/30'}`} />)}</div>
              <div className="flex gap-2">
                {walkthroughStep > 0 && <Button variant="outline" onClick={() => setWalkthroughStep(s => s - 1)}>Back</Button>}
                {walkthroughStep < 3 ? <Button onClick={() => setWalkthroughStep(s => s + 1)}>Next</Button> : <Button onClick={() => { setShowWalkthrough(false); setWalkthroughStep(0); }}>Finish</Button>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
