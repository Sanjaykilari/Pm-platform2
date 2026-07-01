import { useState, useMemo } from 'react';
import { useApp } from '@/context/PpmContext';
import { users } from '@/data/mockData';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Badge, Avatar, Button, Dialog, DialogHeader, DialogTitle, DialogFooter,
  Input, Select, Separator, Tabs, TabsList, TabsTrigger
} from '@/components/ui/primitives';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Users, Plus, Search, Clock,
  BarChart3, Activity
} from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';

export default function TeamAndResourcesPage() {
  const { tasks } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('directory');

  const departments = [...new Set(users.map((u) => u.department))];
  const roles = [...new Set(users.map((u) => u.role))];

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept = departmentFilter === 'all' || u.department === departmentFilter;
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      return matchSearch && matchDept && matchRole;
    });
  }, [searchQuery, departmentFilter, roleFilter]);

  const memberData = useMemo(() => {
    return users.map((u) => {
      const userTasks = tasks.filter((t) => t.assigneeId === u.id);
      const completed = userTasks.filter((t) => t.status === 'done').length;
      const active = userTasks.filter((t) => t.status !== 'done' && t.status !== 'cancelled').length;
      const overdue = userTasks.filter((t) => t.dueDate && isPast(parseISO(t.dueDate)) && t.status !== 'done').length;
      const utilization = u.capacity > 0 ? Math.round((userTasks.reduce((a, t) => a + (t.timeEstimate || 0), 0) / u.capacity) * 100) : 0;
      return { ...u, userTasks, completed, active, overdue, utilization };
    });
  }, [tasks]);

  const selectedMember = selectedMemberId ? memberData.find((m) => m.id === selectedMemberId) : null;

  const deptComposition = useMemo(() => {
    const map: Record<string, number> = {};
    users.forEach((u) => { map[u.department] = (map[u.department] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, []);

  const capacityData = useMemo(() => {
    return users.map((u) => {
      const userTasks = tasks.filter((t) => t.assigneeId === u.id);
      const utilized = userTasks.reduce((a, t) => a + (t.timeEstimate || 0), 0);
      return { name: u.name.split(' ')[0], capacity: u.capacity, utilized };
    });
  }, [tasks]);

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team & Resources</h1>
          <p className="text-muted-foreground">Directory, capacity, and resource planning</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-1" /> Invite Member
        </Button>
      </div>

      <Tabs>
        <TabsList className="mb-4">
          {['directory', 'resources'].map((tab) => (
            <TabsTrigger key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
              {tab === 'directory' && <Users className="w-4 h-4 mr-1" />}
              {tab === 'resources' && <BarChart3 className="w-4 h-4 mr-1" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* DIRECTORY */}
        {activeTab === 'directory' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search team members..."
                  className="pl-9"
                />
              </div>
              <Select
                value={departmentFilter}
                onChange={setDepartmentFilter}
                options={[{ label: 'All Departments', value: 'all' }, ...departments.map((d) => ({ label: d, value: d }))]}
                className="w-44"
              />
              <Select
                value={roleFilter}
                onChange={setRoleFilter}
                options={[{ label: 'All Roles', value: 'all' }, ...roles.map((r) => ({ label: r, value: r }))]}
                className="w-36"
              />
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredUsers.map((u) => {
                const data = memberData.find((m) => m.id === u.id);
                return (
                  <Card key={u.id} className="group hover:shadow-lg transition-all cursor-pointer" onClick={() => { setSelectedMemberId(u.id); setDetailOpen(true); }}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar src={u.avatar} fallback={u.name[0]} className="w-12 h-12" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{u.name}</p>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs">{u.role}</Badge>
                            <Badge variant="outline" className="text-xs">{u.department}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Capacity</span>
                            <span className={data && data.utilization > 100 ? 'text-red-400' : data && data.utilization > 80 ? 'text-amber-400' : 'text-emerald-400'}>
                              {data?.utilization || 0}%
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${data && data.utilization > 100 ? 'bg-red-500' : data && data.utilization > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(data?.utilization || 0, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {u.capacity}h/wk</span>
                          <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {data?.active || 0} active</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* RESOURCES */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Capacity vs Utilized</CardTitle>
                  <CardDescription>Weekly hours allocation</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={capacityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#888" fontSize={12} />
                      <YAxis stroke="#888" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                      <Legend />
                      <Bar dataKey="capacity" fill="#334155" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="utilized" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Team Composition</CardTitle>
                  <CardDescription>Members by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={deptComposition} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" nameKey="name">
                        {deptComposition.map((_, index) => (
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
                <CardTitle>Resource Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Member</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Role</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Dept</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Capacity</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Active</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Completed</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Utilization</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Overdue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memberData.map((m) => (
                        <tr key={m.id} className="border-b border-border/50 hover:bg-accent/30">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <Avatar src={m.avatar} fallback={m.name[0]} className="w-6 h-6" />
                              <span className="font-medium">{m.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2"><Badge variant="secondary" className="text-xs">{m.role}</Badge></td>
                          <td className="py-3 px-2 text-muted-foreground">{m.department}</td>
                          <td className="text-right py-3 px-2">{m.capacity}h</td>
                          <td className="text-right py-3 px-2">{m.active}</td>
                          <td className="text-right py-3 px-2">{m.completed}</td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                                <div className={`h-full rounded-full ${m.utilization > 100 ? 'bg-red-500' : m.utilization > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(m.utilization, 100)}%` }} />
                              </div>
                              <span className="text-xs">{m.utilization}%</span>
                            </div>
                          </td>
                          <td className="text-right py-3 px-2">
                            {m.overdue > 0 ? <Badge variant="destructive" className="text-xs">{m.overdue}</Badge> : <span className="text-muted-foreground">0</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Tabs>

      {/* Member Detail Dialog */}
      {selectedMember && (
        <Dialog open={detailOpen} onClose={() => setDetailOpen(false)}>
          <DialogHeader>
            <DialogTitle>Member Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-4">
              <Avatar src={selectedMember.avatar} fallback={selectedMember.name[0]} className="w-16 h-16" />
              <div>
                <p className="text-lg font-bold">{selectedMember.name}</p>
                <p className="text-sm text-muted-foreground">{selectedMember.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{selectedMember.role}</Badge>
                  <Badge variant="outline">{selectedMember.department}</Badge>
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <h4 className="text-sm font-semibold mb-2">Current Assignments</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedMember.userTasks.filter((t) => t.status !== 'done').map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <div>
                      <p className="text-sm font-medium">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{t.status} • {t.priority}</p>
                    </div>
                    {t.dueDate && <span className={`text-xs ${isPast(parseISO(t.dueDate)) ? 'text-red-400' : 'text-muted-foreground'}`}>{format(parseISO(t.dueDate), 'MMM dd')}</span>}
                  </div>
                ))}
                {selectedMember.userTasks.filter((t) => t.status !== 'done').length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No active assignments</p>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Workload</h4>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ week: 'W1', hours: Math.round(selectedMember.utilization * 0.4) }, { week: 'W2', hours: Math.round(selectedMember.utilization * 0.6) }, { week: 'W3', hours: Math.round(selectedMember.utilization * 0.8) }, { week: 'W4', hours: selectedMember.utilization }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="week" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                    <Bar dataKey="hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}
