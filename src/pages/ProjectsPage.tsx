import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/PpmContext';
import { users } from '@/data/mockData';
import {
  Card, CardHeader, CardTitle, CardContent, Badge, Progress, Avatar, Tabs, TabsList, TabsTrigger,
  Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button, Input, Select, Label
} from '@/components/ui/primitives';
import { format, parseISO } from 'date-fns';
import { Plus, Search, Calendar, Layout, List } from 'lucide-react';
import { cn } from '@/lib/utils';
const sortOptions = [
  { label: 'Name', value: 'name' },
  { label: 'Progress', value: 'progress' },
  { label: 'Health', value: 'health' },
];

const projectColors = [
  '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6', '#6366f1',
];

function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'active': return 'default';
    case 'planning': return 'secondary';
    case 'completed': return 'outline';
    case 'on_hold': return 'destructive';
    case 'cancelled': return 'destructive';
    default: return 'default';
  }
}

function getStatusLabel(status: string | undefined) {
  if (!status) return 'Unknown';
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

function getHealthColor(health: string) {
  switch (health) {
    case 'green': return 'bg-green-500';
    case 'yellow': return 'bg-yellow-500';
    case 'red': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
}

export default function ProjectsPage() {
  const { projects, addProject } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: '',
    color: projectColors[0],
  });

  const filtered = useMemo(() => {
    let result = projects.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'progress') return b.progress - a.progress;
      if (sortBy === 'health') {
        const order: Record<string, number> = { green: 3, yellow: 2, red: 1 };
        return (order[b.health] || 0) - (order[a.health] || 0);
      }
      return 0;
    });

    return result;
  }, [projects, searchQuery, statusFilter, sortBy]);

  const handleCreate = () => {
    addProject({
      name: form.name,
      description: form.description,
      status: 'planning',
      ownerId: 'u1',
      teamIds: [],
      startDate: form.startDate || new Date().toISOString().split('T')[0],
      endDate: form.endDate || new Date().toISOString().split('T')[0],
      budget: Number(form.budget) || 0,
      spent: 0,
      health: 'green',
      portfolioId: null,
      color: form.color,
    });
    setIsDialogOpen(false);
    setForm({ name: '', description: '', startDate: '', endDate: '', budget: '', color: projectColors[0] });
  };

  const isFormValid = form.name.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track all your projects</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Filters & Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Tabs>
            <TabsList>
              <TabsTrigger active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>All</TabsTrigger>
              <TabsTrigger active={statusFilter === 'active'} onClick={() => setStatusFilter('active')}>Active</TabsTrigger>
              <TabsTrigger active={statusFilter === 'planning'} onClick={() => setStatusFilter('planning')}>Planning</TabsTrigger>
              <TabsTrigger active={statusFilter === 'completed'} onClick={() => setStatusFilter('completed')}>Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select
            value={sortBy}
            onChange={setSortBy}
            options={sortOptions}
            className="w-36"
          />

          <Tabs>
            <TabsList>
              <TabsTrigger active={viewMode === 'grid'} onClick={() => setViewMode('grid')}>
                <Layout className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger active={viewMode === 'list'} onClick={() => setViewMode('list')}>
                <List className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No projects match your filters.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project) => {
            const teamMembers = users.filter((u) => (project.teamIds || []).includes(u.id));
            const budgetPct = project.budget > 0 ? Math.round((project.spent / project.budget) * 100) : 0;

            return (
              <Card
                key={project.id}
                className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: project.color }} />
                <CardHeader className="pb-2 pl-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base group-hover:text-primary transition-colors">
                        {project.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(project.status)}>
                      {getStatusLabel(project.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pl-5">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2.5 h-2.5 rounded-full', getHealthColor(project.health))} />
                    <span className="text-xs text-muted-foreground capitalize">{project.health} health</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Budget</span>
                    <span className="font-medium">{budgetPct}% used</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {teamMembers.slice(0, 4).map((member) => (
                        <Avatar
                          key={member.id}
                          src={member.avatar}
                          alt={member.name}
                          fallback={member.name.charAt(0)}
                          className="w-7 h-7 border-2 border-card"
                        />
                      ))}
                      {teamMembers.length > 4 && (
                        <div className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-medium">
                          +{teamMembers.length - 4}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/app/projects/${project.id}`)}
                    >
                      View Board
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Project Name</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Health</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Progress</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Budget</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Team</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Due Date</th>
                  <th className="text-right font-medium text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((project) => {
                  const teamMembers = users.filter((u) => (project.teamIds || []).includes(u.id));
                  return (
                    <tr
                      key={project.id}
                      className="border-b border-border hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/app/projects/${project.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-8 rounded-full" style={{ backgroundColor: project.color }} />
                          <div>
                            <p className="font-medium">{project.name}</p>
                            <p className="text-xs text-muted-foreground">{project.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getStatusBadgeVariant(project.status)}>
                          {getStatusLabel(project.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={cn('w-2 h-2 rounded-full', getHealthColor(project.health))} />
                          <span className="capitalize">{project.health}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Progress value={project.progress} className="w-20" />
                          <span className="text-xs font-medium">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs">
                          <p className="font-medium">${(project.spent / 1000).toFixed(0)}k / ${(project.budget / 1000).toFixed(0)}k</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex -space-x-2">
                          {teamMembers.slice(0, 3).map((member) => (
                            <Avatar
                              key={member.id}
                              src={member.avatar}
                              alt={member.name}
                              fallback={member.name.charAt(0)}
                              className="w-6 h-6 border-2 border-card"
                            />
                          ))}
                          {teamMembers.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[9px]">
                              +{teamMembers.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          {project.endDate ? format(parseISO(project.endDate), 'MMM d, yyyy') : 'No Date'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/app/projects/${project.id}`)}
                          >
                            View
                          </Button>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* New Project Dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Fill in the details to create a new project.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label>Project Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter project name"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Enter project description"
              className="flex w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[80px] resize-y"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>End Date</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Budget ($)</Label>
            <Input
              type="number"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              placeholder="Enter budget"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {projectColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setForm({ ...form, color })}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-all',
                    form.color === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!isFormValid}>Create Project</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
