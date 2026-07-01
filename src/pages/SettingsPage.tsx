import { useState } from 'react';
import { useAuth } from '@/context/PpmContext';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Badge, Button, Input, Select, Label, Tabs, TabsList, TabsTrigger
} from '@/components/ui/primitives';
import {
  User, Building2, Bell, Plug, Shield, Camera, Save,
  Slack, Github, Figma, Calendar, ShieldCheck, Key, Smartphone, Trash2
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    timezone: 'America/New_York',
    language: 'en',
  });

  const [workspace, setWorkspace] = useState({
    name: 'NexusPM Workspace',
    description: 'Enterprise project management workspace',
    defaultView: 'board',
    sprintLength: '2',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    dailyDigest: true,
    assignments: true,
    mentions: true,
    sprintReminders: true,
    deadlineAlerts: true,
  });

  const [integrations] = useState([
    { name: 'Slack', icon: Slack, color: 'bg-purple-500', connected: true },
    { name: 'GitHub', icon: Github, color: 'bg-gray-800', connected: true },
    { name: 'Jira', icon: ShieldCheck, color: 'bg-blue-500', connected: false },
    { name: 'Figma', icon: Figma, color: 'bg-pink-500', connected: true },
    { name: 'Google Calendar', icon: Calendar, color: 'bg-red-500', connected: false },
    { name: 'Microsoft Teams', icon: Building2, color: 'bg-blue-600', connected: false },
  ]);

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactor: false,
    apiKey: 'nxpm_live_••••••••••••••••••••••••',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sessions = [
    { device: 'MacBook Pro', location: 'San Francisco, CA', lastActive: 'Now', current: true },
    { device: 'iPhone 15', location: 'San Francisco, CA', lastActive: '2 hours ago', current: false },
    { device: 'Chrome / Windows', location: 'New York, NY', lastActive: '3 days ago', current: false },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and workspace preferences</p>
      </div>

      <Tabs>
        <TabsList className="mb-4">
          {[
            { id: 'profile', icon: User, label: 'Profile' },
            { id: 'workspace', icon: Building2, label: 'Workspace' },
            { id: 'notifications', icon: Bell, label: 'Notifications' },
            { id: 'integrations', icon: Plug, label: 'Integrations' },
            { id: 'security', icon: Shield, label: 'Security' },
          ].map((tab) => (
            <TabsTrigger key={tab.id} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>
              <tab.icon className="w-4 h-4 mr-1" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* PROFILE */}
        {activeTab === 'profile' && (
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center overflow-hidden">
                  {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-white" />}
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    <Camera className="w-4 h-4 mr-1" /> Change Avatar
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input value={user?.role || 'member'} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input value="Engineering" disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Time Zone</Label>
                  <Select
                    value={profile.timezone}
                    onChange={(v) => setProfile({ ...profile, timezone: v })}
                    options={[
                      { label: 'UTC', value: 'UTC' },
                      { label: 'America/New_York', value: 'America/New_York' },
                      { label: 'America/Los_Angeles', value: 'America/Los_Angeles' },
                      { label: 'Europe/London', value: 'Europe/London' },
                      { label: 'Asia/Tokyo', value: 'Asia/Tokyo' },
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={profile.language}
                    onChange={(v) => setProfile({ ...profile, language: v })}
                    options={[
                      { label: 'English', value: 'en' },
                      { label: 'Spanish', value: 'es' },
                      { label: 'French', value: 'fr' },
                      { label: 'German', value: 'de' },
                      { label: 'Japanese', value: 'ja' },
                      { label: 'Chinese', value: 'zh' },
                    ]}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-1" /> Save Changes
                </Button>
                {saved && <Badge variant="default" className="bg-emerald-500/10 text-emerald-400">Saved successfully!</Badge>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* WORKSPACE */}
        {activeTab === 'workspace' && (
          <Card>
            <CardHeader>
              <CardTitle>Workspace</CardTitle>
              <CardDescription>Configure your workspace defaults</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Workspace Name</Label>
                  <Input value={workspace.name} onChange={(e) => setWorkspace({ ...workspace, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Default Project View</Label>
                  <Select
                    value={workspace.defaultView}
                    onChange={(v) => setWorkspace({ ...workspace, defaultView: v })}
                    options={[
                      { label: 'Board', value: 'board' },
                      { label: 'List', value: 'list' },
                      { label: 'Timeline', value: 'timeline' },
                    ]}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <textarea
                    value={workspace.description}
                    onChange={(e) => setWorkspace({ ...workspace, description: e.target.value })}
                    className="w-full h-20 rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Sprint Length</Label>
                  <Select
                    value={workspace.sprintLength}
                    onChange={(v) => setWorkspace({ ...workspace, sprintLength: v })}
                    options={[
                      { label: '1 Week', value: '1' },
                      { label: '2 Weeks', value: '2' },
                      { label: '3 Weeks', value: '3' },
                      { label: '4 Weeks', value: '4' },
                    ]}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Working Days</Label>
                <div className="flex gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <button
                      key={day}
                      onClick={() => {
                        const days = workspace.workingDays.includes(day)
                          ? workspace.workingDays.filter((d) => d !== day)
                          : [...workspace.workingDays, day];
                        setWorkspace({ ...workspace, workingDays: days });
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        workspace.workingDays.includes(day)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-1" /> Save Changes
                </Button>
                {saved && <Badge variant="default" className="bg-emerald-500/10 text-emerald-400">Saved successfully!</Badge>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'email', label: 'Email Notifications', description: 'Receive email updates for important events' },
                { key: 'push', label: 'Push Notifications', description: 'Browser push notifications' },
                { key: 'dailyDigest', label: 'Daily Digest', description: 'Summary of your day every morning' },
                { key: 'assignments', label: 'Task Assignments', description: 'When you are assigned to a task' },
                { key: 'mentions', label: 'Mentions', description: 'When someone mentions you in a comment' },
                { key: 'sprintReminders', label: 'Sprint Reminders', description: 'Upcoming sprint events and deadlines' },
                { key: 'deadlineAlerts', label: 'Deadline Alerts', description: 'Tasks approaching their due date' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${notifications[item.key as keyof typeof notifications] ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-3 pt-2">
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-1" /> Save Preferences
                </Button>
                {saved && <Badge variant="default" className="bg-emerald-500/10 text-emerald-400">Saved!</Badge>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* INTEGRATIONS */}
        {activeTab === 'integrations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => (
              <Card key={integration.name} className="hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg ${integration.color} flex items-center justify-center`}>
                      <integration.icon className="w-5 h-5 text-white" />
                    </div>
                    <Badge variant={integration.connected ? 'default' : 'outline'}>
                      {integration.connected ? 'Connected' : 'Not Connected'}
                    </Badge>
                  </div>
                  <h3 className="font-semibold">{integration.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">Sync data and receive notifications</p>
                  <Button variant={integration.connected ? 'outline' : 'default'} size="sm" className="w-full">
                    {integration.connected ? 'Configure' : 'Connect'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* SECURITY */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password regularly for security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" value={security.currentPassword} onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" value={security.newPassword} onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input type="password" value={security.confirmPassword} onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })} />
                </div>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-1" /> Update Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Authenticator App</p>
                      <p className="text-xs text-muted-foreground">Use an authenticator app to generate codes</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSecurity({ ...security, twoFactor: !security.twoFactor })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${security.twoFactor ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${security.twoFactor ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Manage access tokens for integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                  <Key className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Production API Key</p>
                    <p className="text-xs text-muted-foreground font-mono">{security.apiKey}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Key className="w-4 h-4 mr-1" /> Generate
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Manage your active login sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessions.map((session, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                          <Smartphone className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium flex items-center gap-2">
                            {session.device}
                            {session.current && <Badge variant="default" className="text-xs">Current</Badge>}
                          </p>
                          <p className="text-xs text-muted-foreground">{session.location} • {session.lastActive}</p>
                        </div>
                      </div>
                      {!session.current && (
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4 mr-1" /> Revoke
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Tabs>
    </div>
  );
}
