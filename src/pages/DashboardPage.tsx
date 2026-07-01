import React, { useMemo } from 'react';
import { useApp, useAuth } from '@/context/PpmContext';
import { users } from '@/data/mockData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Avatar, ScrollArea, Progress, Button } from '@/components/ui/primitives';
import { format, parseISO, isWithinInterval, addDays, startOfDay } from 'date-fns';
import { CheckCircle2, AlertTriangle, Calendar, ListTodo, Briefcase, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { tasks, projects, comments } = useApp();
  const { user } = useAuth();

  // ── Personalized Data ──
  const myProjects = useMemo(() => {
    return projects.filter(p => p.ownerId === user?.id || p.teamIds?.includes(user?.id!));
  }, [projects, user]);

  const myTasks = useMemo(() => {
    return tasks.filter(t => t.assigneeId === user?.id);
  }, [tasks, user]);

  const myActiveTasks = myTasks.filter(t => t.status !== 'done');
  const myCompletedTasks = myTasks.filter(t => t.status === 'done');

  // Inbox: Recent activities relevant to user (comments on their tasks, or tasks assigned to them updated recently)
  const inboxActivities = useMemo(() => {
    const relevantComments = comments
      .filter(c => {
        const task = tasks.find(t => t.id === c.taskId);
        // Comments on my tasks, not by me
        return task?.assigneeId === user?.id && c.userId !== user?.id;
      })
      .map(c => ({
        id: c.id,
        type: 'comment',
        userId: c.userId,
        taskId: c.taskId,
        content: `Commented: "${c.content}"`,
        timestamp: c.createdAt
      }));

    const recentTaskUpdates = myTasks
      .filter(t => t.updatedAt && t.updatedAt !== t.createdAt)
      .map(t => ({
        id: t.id + '-update',
        type: 'task_update',
        userId: t.assigneeId, // Just showing it happened on my task
        taskId: t.id,
        content: `Task "${t.title}" was updated to ${t.status.replace('_', ' ')}`,
        timestamp: t.updatedAt!
      }));

    return [...relevantComments, ...recentTaskUpdates]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }, [comments, myTasks, tasks, user]);

  // Upcoming deadlines
  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    const next7Days = addDays(now, 7);
    return myActiveTasks
      .filter(t => t.dueDate && isWithinInterval(parseISO(t.dueDate), { start: startOfDay(now), end: next7Days }))
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  }, [myActiveTasks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Personal Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, {user?.name}. Here's your personalized workspace overview.
        </p>
      </div>

      {/* Top KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 border-violet-500/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">My Active Tasks</p>
                <h3 className="text-3xl font-bold mt-1">{myActiveTasks.length}</h3>
              </div>
              <div className="p-2.5 rounded-lg bg-violet-500/10">
                <ListTodo className="w-5 h-5 text-violet-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">My Projects</p>
                <h3 className="text-3xl font-bold mt-1">{myProjects.length}</h3>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-500/10">
                <Briefcase className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasks Completed</p>
                <h3 className="text-3xl font-bold mt-1">{myCompletedTasks.length}</h3>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming Deadlines</p>
                <h3 className="text-3xl font-bold mt-1">{upcomingDeadlines.length}</h3>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/10">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: My Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-semibold">My Tasks</CardTitle>
                <CardDescription>Your active assignments across all projects</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/app/agile">View All <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                {myActiveTasks.length > 0 ? (
                  <div className="space-y-3">
                    {myActiveTasks.map(task => {
                      const project = projects.find(p => p.id === task.projectId);
                      return (
                        <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 gap-3 hover:bg-muted/50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={task.status === 'in_progress' ? 'default' : 'secondary'} className="text-[10px] capitalize">
                                {task.status.replace('_', ' ')}
                              </Badge>
                              <Badge variant={task.priority === 'urgent' ? 'destructive' : task.priority === 'high' ? 'default' : 'secondary'} className="text-[10px] capitalize">
                                {task.priority}
                              </Badge>
                            </div>
                            <p className="font-medium text-sm truncate">{task.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{project?.name}</p>
                          </div>
                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 bg-background px-2 py-1 rounded-md border border-border">
                              <Calendar className="w-3 h-3" />
                              <span>{format(parseISO(task.dueDate), 'MMM d')}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                    <CheckCircle2 className="w-10 h-10 mb-3 opacity-50 text-emerald-500" />
                    <p className="text-sm">You have no active tasks!</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-semibold">My Projects</CardTitle>
                <CardDescription>Projects you own or participate in</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/app/projects">View All <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[250px] pr-4">
                {myProjects.length > 0 ? (
                  <div className="space-y-4">
                    {myProjects.map(project => (
                      <div key={project.id} className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors bg-card/50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{project.name}</h4>
                          <Badge variant={project.health === 'green' ? 'default' : project.health === 'yellow' ? 'secondary' : 'destructive'} className="capitalize text-xs">
                            {project.health || project.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span>{project.progress}% Complete</span>
                          <span>{project.teamIds?.length || 1} members</span>
                        </div>
                        <Progress value={project.progress} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                    <Briefcase className="w-10 h-10 mb-3 opacity-50" />
                    <p className="text-sm">You are not assigned to any projects.</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Inbox */}
        <div className="space-y-6">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" /> Inbox
              </CardTitle>
              <CardDescription>Recent activity on your tasks</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ScrollArea className="h-[580px] pr-4">
                {inboxActivities.length > 0 ? (
                  <div className="space-y-4">
                    {inboxActivities.map((activity, idx) => {
                      const activityUser = users.find(u => u.id === activity.userId);
                      const task = tasks.find(t => t.id === activity.taskId);
                      return (
                        <div key={`${activity.id}-${idx}`} className="flex gap-3 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                          <Avatar
                            src={activityUser?.avatar}
                            fallback={activityUser?.name?.charAt(0) || '?'}
                            className="w-8 h-8"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              {activityUser?.name || 'System'}
                              <span className="text-muted-foreground font-normal ml-1">
                                {activity.type === 'comment' ? 'commented' : 'updated task'}
                              </span>
                            </p>
                            <p className="text-xs font-semibold mt-0.5 truncate text-primary/80">{task?.title}</p>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{activity.content}</p>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2">
                              <Clock className="w-3 h-3" />
                              {format(parseISO(activity.timestamp), 'MMM d, h:mm a')}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
                    <CheckCircle2 className="w-10 h-10 mb-3 opacity-50" />
                    <p className="text-sm">You're all caught up!</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
