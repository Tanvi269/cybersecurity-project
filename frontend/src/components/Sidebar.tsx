import React from 'react';
import {
  LayoutDashboard, PlayCircle, Cpu, Server, ShieldAlert,
  AlertTriangle, FileText, Search, Bug, Mail, Zap, FileSpreadsheet,
  History, LogOut, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'SOC Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Attack Scenarios', path: '/scenarios', icon: PlayCircle, highlight: true },
    { label: 'Attack Simulator', path: '/simulator', icon: Cpu },
    { label: 'Cyber Lab Assets', path: '/lab', icon: Server },
    { label: 'Security Events', path: '/events', icon: ShieldAlert },
    { label: 'Security Alerts', path: '/alerts', icon: AlertTriangle },
    { label: 'Incident Desk', path: '/incidents', icon: FileText },
    { label: 'Digital Forensics', path: '/forensics', icon: Search },
    { label: 'Phishing Analyzer', path: '/phishing-analyzer', icon: Mail },
    { label: 'Vulnerabilities', path: '/vulnerabilities', icon: Bug },
    { label: 'Incident Response', path: '/incident-response', icon: Zap },
    { label: 'Security Reports', path: '/reports', icon: FileSpreadsheet },
    { label: 'Audit Logs', path: '/audit-logs', icon: History },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-900/30">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wide flex items-center gap-1.5">
              CyberShield <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-700/50 px-1.5 py-0.5 rounded font-mono">SOC</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">Simulated Cyber Lab</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40 border border-purple-400/30 font-semibold'
                    : item.highlight
                    ? 'bg-purple-950/40 text-purple-300 border border-purple-800/40 hover:bg-purple-900/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-purple-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.highlight && !isActive && (
                  <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30 font-mono">
                    MAIN
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer & Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50">
        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between mb-2">
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.full_name || 'SOC Analyst'}</p>
            <p className="text-[10px] text-purple-400 font-mono truncate">{user?.role || 'ANALYST'}</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-950/30 hover:border-rose-900/50 border border-transparent transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
