import React from 'react';
import { Play, Bell, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onTriggerDemo: () => void;
  unreadAlertsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ onTriggerDemo, unreadAlertsCount = 2 }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>LAB ENVIRONMENT: ACTIVE SIMULATION</span>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-mono">
          <Lock className="w-3.5 h-3.5 text-purple-400" />
          <span>Fictional Users & Private IPs Only</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* DEMO MODE BUTTON */}
        <button
          onClick={onTriggerDemo}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-900/40 border border-purple-300/30 transition transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Play className="w-4 h-4 fill-white animate-pulse" />
          <span>⚡ DEMO MODE (Automated Attack Tour)</span>
        </button>

        {/* System Time & Role Badge */}
        <div className="hidden lg:flex flex-col text-right font-mono text-[11px] text-slate-400 border-l border-slate-800 pl-4">
          <span className="text-slate-200 font-semibold">{user?.email || 'analyst@cybershield.local'}</span>
          <span className="text-purple-400">{user?.role || 'SECURITY_ANALYST'}</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 relative">
            <Bell className="w-4 h-4 text-slate-300" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {unreadAlertsCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
