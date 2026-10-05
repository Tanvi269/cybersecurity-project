import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginProps {
  onSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('analyst@cybershield.local');
  const [password, setPassword] = useState('AnalystPass2026!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoUser = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-400 mb-2 shadow-xl shadow-purple-900/30">
            <ShieldCheck className="w-10 h-10 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">CyberShield</h1>
          <p className="text-xs text-purple-400 font-mono">Academic Cyber Attack Simulation & SOC Platform</p>
        </div>

        {/* Login Box */}
        <div className="cyber-card p-8 rounded-2xl space-y-6 border border-slate-800 shadow-2xl">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-100">SOC Analyst Sign In</h2>
            <p className="text-xs text-slate-400">Access simulated lab controls, threat engine & forensic logs</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Lab Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  placeholder="analyst@cybershield.local"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40"
            >
              {loading ? 'Authenticating...' : 'Enter SOC Platform'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Selector */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Select Fictional Lab Role:</span>
            </p>
            <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
              <button
                type="button"
                onClick={() => setDemoUser('analyst@cybershield.local', 'AnalystPass2026!')}
                className="p-2 rounded bg-slate-900 border border-slate-700 hover:border-purple-500 text-slate-300 text-center"
              >
                <div className="font-semibold text-purple-300">Analyst</div>
                <div className="text-[9px] text-slate-500">Tier-2 SOC</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoUser('forensics@cybershield.local', 'ForensicsPass2026!')}
                className="p-2 rounded bg-slate-900 border border-slate-700 hover:border-purple-500 text-slate-300 text-center"
              >
                <div className="font-semibold text-purple-300">Forensics</div>
                <div className="text-[9px] text-slate-500">Investigator</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoUser('admin@cybershield.local', 'CyberShield2026!')}
                className="p-2 rounded bg-slate-900 border border-slate-700 hover:border-purple-500 text-slate-300 text-center"
              >
                <div className="font-semibold text-purple-300">Admin</div>
                <div className="text-[9px] text-slate-500">Full Access</div>
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer footer */}
        <p className="text-[11px] text-slate-500 text-center font-mono">
          Strictly for educational and academic laboratory simulation. No real network scanning or external operations.
        </p>
      </div>
    </div>
  );
};
