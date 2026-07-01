import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/PpmContext';
import { Button, Card, CardContent, Input, Label,} from '@/components/ui/primitives';
import { Zap, AlertCircle, LayoutDashboard, Kanban, BarChart3, Calendar, Check } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const result = login(email, password);
      if (result && result.success) {
        navigate('/app');
      } else {
        setError('Invalid username or password. Try admin / admin');
      }
      setLoading(false);
    }, 400);
  };

  const validEmails = [
    { username: 'admin', label: 'Admin', password: 'admin' },
    { username: 'sarah', label: 'Portfolio Mgr', password: 'portfolio' },
    { username: 'alice', label: 'Project Mgr', password: 'project' },
  ];

  const fillDemo = (demo: { username: string, password: string }) => {
    setEmail(demo.username);
    setPassword(demo.password);
    setError('');
  };

  return (
    <div className="dark min-h-screen bg-slate-950 text-white flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 to-black items-center justify-center">
        {/* Background glow */}
        <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-violet-600/20 blur-[100px]" />
        <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-fuchsia-600/15 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />

        {/* CSS Illustration */}
        <div className="relative w-[480px] h-[400px]">
          {/* Floating card 1 - Back */}
          <div className="absolute top-0 left-8 w-64 h-44 rounded-xl bg-slate-800/60 border border-white/10 shadow-2xl backdrop-blur-sm rotate-[-6deg] transform">
            <div className="p-4 border-b border-white/5">
              <div className="h-3 w-24 rounded bg-slate-600/50" />
            </div>
            <div className="p-4 space-y-2">
              <div className="h-6 rounded bg-slate-700/40 w-full" />
              <div className="h-6 rounded bg-slate-700/40 w-3/4" />
              <div className="h-6 rounded bg-slate-700/40 w-5/6" />
            </div>
          </div>

          {/* Floating card 2 - Front center */}
          <div className="absolute top-20 left-24 w-72 h-52 rounded-xl bg-slate-800/80 border border-white/10 shadow-2xl backdrop-blur-sm z-10">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="h-3 w-28 rounded bg-slate-600/50" />
              <div className="h-5 w-5 rounded bg-violet-500/40" />
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-400/80" />
                <div className="h-4 rounded bg-slate-700/40 flex-1" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
                <div className="h-4 rounded bg-slate-700/40 flex-1" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-violet-400/80" />
                <div className="h-4 rounded bg-slate-700/40 flex-1" />
              </div>
              <div className="mt-3 h-8 rounded-md bg-violet-500/20 w-24" />
            </div>
          </div>

          {/* Floating card 3 - Right */}
          <div className="absolute top-8 right-0 w-48 h-36 rounded-xl bg-slate-800/60 border border-white/10 shadow-2xl backdrop-blur-sm rotate-[8deg] transform">
            <div className="p-3 border-b border-white/5">
              <div className="h-3 w-16 rounded bg-slate-600/50" />
            </div>
            <div className="p-3 flex items-end gap-2 h-20">
              <div className="flex-1 h-[30%] rounded bg-violet-500/40" />
              <div className="flex-1 h-[60%] rounded bg-violet-500/40" />
              <div className="flex-1 h-[45%] rounded bg-violet-500/40" />
              <div className="flex-1 h-[80%] rounded bg-fuchsia-500/40" />
              <div className="flex-1 h-[55%] rounded bg-violet-500/40" />
            </div>
          </div>

          {/* Floating shapes */}
          <div className="absolute bottom-8 left-16 h-12 w-12 rounded-lg bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 border border-white/10 flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 text-violet-300" />
          </div>
          <div className="absolute bottom-16 right-12 h-12 w-12 rounded-full bg-gradient-to-br from-fuchsia-500/30 to-pink-500/30 border border-white/10 flex items-center justify-center">
            <Kanban className="h-5 w-5 text-fuchsia-300" />
          </div>
          <div className="absolute top-48 left-0 h-10 w-10 rounded-md bg-gradient-to-br from-blue-500/30 to-violet-500/30 border border-white/10 flex items-center justify-center rotate-12">
            <BarChart3 className="h-4 w-4 text-blue-300" />
          </div>
          <div className="absolute top-36 right-8 h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-white/10 flex items-center justify-center -rotate-12">
            <Calendar className="h-4 w-4 text-emerald-300" />
          </div>

          {/* Orbs */}
          <div className="absolute bottom-0 left-1/2 h-32 w-32 rounded-full bg-violet-600/20 blur-[50px]" />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(139,92,246,0.08),_transparent_50%)]" />
        <div className="w-full max-w-md relative">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">NexusPM</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome back</h1>
            <p className="text-slate-400 text-sm">Sign in to your account to continue</p>
          </div>

          <Card className="bg-slate-900/50 border-white/5">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Email</Label>
                  <Input
                    type="text"
                    placeholder="alex@nexuspm.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-950/50 border-white/10 focus:border-violet-500/50 text-white placeholder:text-slate-600"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Password</Label>
                    <a href="#" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-950/50 border-white/10 focus:border-violet-500/50 text-white placeholder:text-slate-600"
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRemember(!remember)}
                    className={`h-4 w-4 rounded border transition-colors flex items-center justify-center ${remember ? 'bg-violet-500 border-violet-500' : 'border-slate-600 bg-transparent'}`}
                  >
                    {remember && <Check className="h-3 w-3 text-white" />}
                  </button>
                  <span className="text-sm text-slate-400 select-none" onClick={() => setRemember(!remember)}>
                    Remember me
                  </span>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6">
                <p className="text-xs text-slate-500 mb-3 text-center">Quick login with demo accounts</p>
                <div className="flex flex-wrap gap-2">
                  {validEmails.map((demo) => (
                    <button
                      key={demo.username}
                      type="button"
                      onClick={() => fillDemo(demo)}
                      className="text-xs px-2 py-1 rounded-md bg-slate-800/50 border border-white/5 text-slate-400 hover:text-white hover:border-white/10 transition-colors"
                    >
                      {demo.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
