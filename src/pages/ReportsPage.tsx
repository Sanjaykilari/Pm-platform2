import { useState, useMemo } from 'react';
import { useApp } from '@/context/PpmContext';
import { users } from '@/data/mockData';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Badge, Avatar, Tabs, TabsList, TabsTrigger, Button, Select
} from '@/components/ui/primitives';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, CheckCircle2, Clock, DollarSign, AlertTriangle, BarChart3, PieChart as PieChartIcon, Activity
} from 'lucide-react';
import { format, parseISO, isPast, differenceInDays, addDays } from 'date-fns';

export default function ReportsPage() {
  const { tasks, projects } = useApp();
  const [dateRange, setDateRange] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');

  const days = parseInt(dateRange);
  const cutoffDate = addDays(new Date(), -days);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => t.createdAt && parseISO(t.createdAt) >= cutoffDate);
  }, [tasks, cutoffDate]);

  const completedTasks = useMemo(() => {
    return filteredTasks.filter((t) => t.status === 'done');
  }, [filteredTasks]);

  const onTimeRate = useMemo(() => {
    if (completedTasks.length === 0) return 0;
    const onTime = completedTasks.filter((t) => !t.dueDate || !isPast(parseISO(t.dueDate))).length;
    return Math.round((onTime / completedTasks.length) * 100);
  }, [completedTasks]);

  const avgCycleTime = useMemo(() => {
    if (completedTasks.length === 0) return 0;
    const times = completedTasks.map((t) => differenceInDays(t.updatedAt ? parseISO(t.updatedAt) : new Date(), t.createdAt ? parseISO(t.createdAt) : new Date()));
    return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  }, [completedTasks]);

  const budgetVariance = useMemo(() => {
    const totalBudget = projects.reduce((a, p) => a + p.budget, 0);
    const totalSpent = projects.reduce((a, p) => a + p.spent, 0);
    return totalBudget > 0 ? Math.round(((totalSpent - totalBudget) / totalBudget) * 100) : 0;
  }, [projects]);

  const taskCompletionTrend = useMemo(() => {
    const data = [];
    for (let i = days; i >= 0; i -= Math.max(1, Math.floor(days / 10))) {
      const date = addDays(new Date(), -i);
      const count = tasks.filter((t) => t.status === 'done' && t.updatedAt && parseISO(t.updatedAt) <= date).length;
      data.push({ date: format(date, 'MMM dd'), count });
    }
    return data;
  }, [tasks, days]);

  const tasksByProject = useMemo(() => {
    return projects.map((p) => ({
      name: p.name.length > 15 ? p.name.slice(0, 15) + '...' : p.name,
      tasks: tasks.filter((t) => t.projectId === p.id).length,
      completed: tasks.filter((t) => t.projectId === p.id && t.status === 'done').length,
    }));
  }, [tasks, projects]);

  const tasksByPriority = useMemo(() => {
    const priorities = ['urgent', 'high', 'medium', 'low'];
    const counts = priorities.map((p) => ({ name: p, value: tasks.filter((t) => t.priority === p).length }));
    return counts.filter((c) => c.value > 0);
  }, [tasks]);

  const teamPerformance = useMemo(() => {
    return users.map((u) => {
      const userTasks = tasks.filter((t) => t.assigneeId === u.id);
      const completed = userTasks.filter((t) => t.status === 'done').length;
      return {
        name: u.name.split(' ')[0],
        completed,
        assigned: userTasks.length,
        utilization: u.capacity > 0 ? Math.round((userTasks.reduce((a, t) => a + (t.timeEstimate || 0), 0) / u.capacity) * 100) : 0,
      };
    });
  }, [tasks]);

  const projectFinancials = useMemo(() => {
    return projects.map((p) => ({
      name: p.name.length > 12 ? p.name.slice(0, 12) + '...' : p.name,
      budget: p.budget,
      spent: p.spent,
      variance: p.spent - p.budget,
      progress: p.progress,
      health: p.health,
      roi: p.budget > 0 ? Math.round(((p.budget - p.spent) / p.budget) * 100) : 0,
    }));
  }, [projects]);

  const timeTracking = useMemo(() => {
    return projects.map((p) => {
      const projectTasks = tasks.filter((t) => t.projectId === p.id);
      const estimated = projectTasks.reduce((a, t) => a + (t.timeEstimate || 0), 0);
      const actual = projectTasks.reduce((a, t) => a + t.timeSpent, 0);
      return { name: p.name.length > 12 ? p.name.slice(0, 12) + '...' : p.name, estimated, actual };
    });
  }, [tasks, projects]);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-muted-foreground">Comprehensive insights across your workspace</p>
        </div>
        <Select
          value={dateRange}
          onChange={setDateRange}
          options={[
            { label: 'Last 7 Days', value: '7' },
            { label: 'Last 30 Days', value: '30' },
            { label: 'This Quarter', value: '90' },
            { label: 'This Year', value: '365' },
          ]}
          className="w-44"
        />
      </div>

      <Tabs>
        <TabsList className="mb-4">
          {['overview', 'projects', 'team', 'time', 'custom'].map((tab) => (
            <TabsTrigger key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completed Tasks</p>
                      <p className="text-2xl font-bold">{completedTasks.length}</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">On-Time Rate</p>
                      <p className="text-2xl font-bold">{onTimeRate}%</p>
                    </div>
                    <Clock className="w-8 h-8 text-cyan-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Cycle Time</p>
                      <p className="text-2xl font-bold">{avgCycleTime}d</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-amber-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-rose-500/10 to-pink-500/10">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Budget Variance</p>
                      <p className="text-2xl font-bold">{budgetVariance > 0 ? '+' : ''}{budgetVariance}%</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-rose-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Task Completion Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={taskCompletionTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" stroke="#888" fontSize={12} />
                      <YAxis stroke="#888" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="count" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Tasks by Priority</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={tasksByPriority} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" nameKey="name">
                        {tasksByPriority.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Tasks by Project</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={tasksByProject}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="tasks" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Performance</CardTitle>
                <CardDescription>Budget, progress, and health metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Project</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Budget</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Spent</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Variance</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Progress</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Health</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">ROI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectFinancials.map((p) => (
                        <tr key={p.name} className="border-b border-border/50 hover:bg-accent/30">
                          <td className="py-3 px-2 font-medium">{p.name}</td>
                          <td className="text-right py-3 px-2">${(p.budget / 1000).toFixed(0)}k</td>
                          <td className="text-right py-3 px-2">${(p.spent / 1000).toFixed(0)}k</td>
                          <td className={`text-right py-3 px-2 ${p.variance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {p.variance > 0 ? '+' : ''}${(p.variance / 1000).toFixed(0)}k
                          </td>
                          <td className="py-3 px-2 w-32">
                            <div className="flex items-center gap-2">
                              <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${p.progress}%` }} />
                              </div>
                              <span className="text-xs">{p.progress}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <Badge variant={p.health === 'green' ? 'default' : p.health === 'yellow' ? 'secondary' : 'destructive'}>
                              {p.health}
                            </Badge>
                          </td>
                          <td className="text-right py-3 px-2">{p.roi}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Budget vs Actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={projectFinancials}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#888" fontSize={12} />
                      <YAxis stroke="#888" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                      <Legend />
                      <Bar dataKey="budget" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="spent" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Schedule Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={projectFinancials}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#888" fontSize={12} />
                      <YAxis stroke="#888" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                      <Legend />
                      <Line type="monotone" dataKey="progress" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} name="Actual" />
                      <Line type="monotone" dataKey="roi" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} name="Planned" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TEAM */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tasks Completed per Member</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={teamPerformance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#888" fontSize={12} />
                      <YAxis stroke="#888" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                      <Legend />
                      <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="assigned" fill="#334155" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Utilization Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={teamPerformance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis type="number" stroke="#888" fontSize={12} domain={[0, 150]} />
                      <YAxis dataKey="name" type="category" stroke="#888" fontSize={12} width={80} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                      <Bar dataKey="utilization" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Member</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Capacity</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Assigned</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Completed</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Utilization</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Overdue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => {
                        const userTasks = tasks.filter((t) => t.assigneeId === u.id);
                        const completed = userTasks.filter((t) => t.status === 'done').length;
                        const overdue = userTasks.filter((t) => t.dueDate && isPast(parseISO(t.dueDate)) && t.status !== 'done').length;
                        const utilization = u.capacity > 0 ? Math.round((userTasks.reduce((a, t) => a + (t.timeEstimate || 0), 0) / u.capacity) * 100) : 0;
                        return (
                          <tr key={u.id} className="border-b border-border/50 hover:bg-accent/30">
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <Avatar src={u.avatar} fallback={u.name[0]} className="w-6 h-6" />
                                <span className="font-medium">{u.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2">{u.capacity}h/wk</td>
                            <td className="text-right py-3 px-2">{userTasks.length}</td>
                            <td className="text-right py-3 px-2">{completed}</td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                                  <div className={`h-full rounded-full ${utilization > 100 ? 'bg-red-500' : utilization > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(utilization, 100)}%` }} />
                                </div>
                                <span className="text-xs">{utilization}%</span>
                              </div>
                            </td>
                            <td className="text-right py-3 px-2">
                              {overdue > 0 ? <Badge variant="destructive">{overdue}</Badge> : <span className="text-muted-foreground">0</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TIME */}
        {activeTab === 'time' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estimated vs Actual Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={timeTracking}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#888" fontSize={12} />
                      <YAxis stroke="#888" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                      <Legend />
                      <Bar dataKey="estimated" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="actual" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Cumulative Time Spent</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={taskCompletionTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" stroke="#888" fontSize={12} />
                      <YAxis stroke="#888" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="count" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Time Tracking Detail</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Task</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Assignee</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Estimated</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Actual</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Variance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.filter((t) => t.timeEstimate > 0).map((t) => {
                        const assignee = users.find((u) => u.id === t.assigneeId);
                        const variance = t.timeSpent - t.timeEstimate;
                        return (
                          <tr key={t.id} className="border-b border-border/50 hover:bg-accent/30">
                            <td className="py-3 px-2 font-medium">{t.title}</td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <Avatar src={assignee?.avatar} fallback={assignee?.name[0] || '?'} className="w-6 h-6" />
                                <span>{assignee?.name || 'Unassigned'}</span>
                              </div>
                            </td>
                            <td className="text-right py-3 px-2">{t.timeEstimate}h</td>
                            <td className="text-right py-3 px-2">{t.timeSpent}h</td>
                            <td className={`text-right py-3 px-2 ${variance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                              {variance > 0 ? '+' : ''}{variance}h
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* CUSTOM */}
        {activeTab === 'custom' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Sprint Velocity', icon: TrendingUp, color: 'from-violet-500/20 to-fuchsia-500/20' },
                { title: 'Burndown Chart', icon: BarChart3, color: 'from-cyan-500/20 to-blue-500/20' },
                { title: 'Cumulative Flow', icon: Activity, color: 'from-emerald-500/20 to-teal-500/20' },
                { title: 'Epic Progress', icon: PieChartIcon, color: 'from-amber-500/20 to-orange-500/20' },
                { title: 'Release Status', icon: CheckCircle2, color: 'from-rose-500/20 to-pink-500/20' },
                { title: 'Bug Trends', icon: AlertTriangle, color: 'from-red-500/20 to-orange-500/20' },
              ].map((widget, i) => (
                <Card key={i} className={`bg-gradient-to-br ${widget.color} border-border/50 hover:border-primary/50 transition-colors cursor-pointer group`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <widget.icon className="w-8 h-8 text-primary/60 group-hover:text-primary transition-colors" />
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">Add</Button>
                    </div>
                    <h3 className="font-semibold">{widget.title}</h3>
                    <p className="text-sm text-muted-foreground">Click to add to dashboard</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Tabs>
    </div>
  );
}
