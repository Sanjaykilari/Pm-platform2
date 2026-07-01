import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/PpmContext';
import { useApp } from '@/context/PpmContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, FolderKanban, BarChart3, Users, Settings, ChevronLeft, ChevronRight, Search, Bell, LogOut, Target, Layers, Zap, FilePlus, Briefcase
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/app', icon: LayoutDashboard },
  { label: 'Projects', path: '/app/projects', icon: FolderKanban },
  { label: 'Portfolio', path: '/app/portfolio', icon: Layers },
  { label: 'Intake', path: '/app/intake', icon: FilePlus },
  { label: 'Product Management', path: '/app/agile', icon: Zap },
  { label: 'Goals', path: '/app/goals', icon: Target },
  { label: 'Reports', path: '/app/reports', icon: BarChart3 },
  { label: 'Team & Resources', path: '/app/team', icon: Users },
  { label: 'Settings', path: '/app/settings', icon: Settings },
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { projects, selectedProjectId, setSelectedProjectId } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(true);

  return (
    <div className="flex h-screen w-full bg-[#f4f7fc] overflow-hidden">
      <aside
        className={cn(
          'flex flex-col bg-[#1c1c1e] text-white transition-all duration-300 shrink-0 z-20 m-4 rounded-[32px] shadow-2xl',
          sidebarCollapsed ? 'w-20' : 'w-72'
        )}
      >
        <div className="flex items-center h-20 px-6 border-b border-white/10">
          <Link to="/app" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0">
              <Target className="w-[18px] h-[18px] text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-lg tracking-tight">NexusPM</span>
            )}
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {!sidebarCollapsed && (
            <div className="px-3 mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workspace</p>
            </div>
          )}
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-full transition-all duration-200 text-sm font-semibold',
                  sidebarCollapsed ? 'justify-center w-12 h-12 mx-auto' : 'px-5 py-3.5 mx-3',
                  isActive
                    ? 'bg-[#3d3f44] text-white shadow-inner'
                    : 'text-[#888b94] hover:text-white hover:bg-white/5'
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>

        <div className="border-t border-white/10 p-4">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex items-center justify-center w-full h-10 rounded-full text-[#888b94] hover:bg-white/5 hover:text-white transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!sidebarCollapsed && <span className="ml-2 text-xs">Collapse</span>}
          </button>
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0 pr-4 py-4">
        <header className="h-20 flex items-center justify-between px-6 shrink-0 z-10 mb-2">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative max-w-md w-80">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tasks, projects, people..."
                className="w-full h-12 pl-12 pr-4 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#749ef1]"
              />
            </div>
            {projects.length > 0 && (
              <select
                className="h-9 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={selectedProjectId || ''}
                onChange={(e) => setSelectedProjectId(e.target.value || null)}
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 overflow-hidden">
                {user?.avatar && <img src={user.avatar} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium leading-tight">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.role}</p>
              </div>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="ml-1 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
