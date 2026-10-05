import React from 'react';
import { UserCheck, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Settings: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          System Settings & RBAC Permissions
          <span className="text-xs bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-mono">
            ACCESS CONTROL
          </span>
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Inspect role-based access control matrix & simulated lab configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active User Card */}
        <div className="cyber-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-sm font-mono border-b border-slate-800 pb-2 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-purple-400" />
            <span>Active Session Information</span>
          </h3>

          <div className="space-y-2 font-mono text-xs text-slate-300">
            <p><span className="text-slate-500">Full Name:</span> {user?.full_name}</p>
            <p><span className="text-slate-500">Lab Email:</span> {user?.email}</p>
            <p><span className="text-slate-500">Assigned Role:</span> <span className="text-purple-300 font-bold">{user?.role}</span></p>
            <p><span className="text-slate-500">Authentication Scheme:</span> JWT (HS256)</p>
          </div>
        </div>

        {/* RBAC Matrix Card */}
        <div className="cyber-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-sm font-mono border-b border-slate-800 pb-2 flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400" />
            <span>Role-Based Access Control (RBAC) Matrix</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 space-y-1">
              <span className="text-purple-300 font-bold">ADMIN:</span>
              <p className="text-slate-400 text-[11px]">Full access to all modules, assets, simulations, reports & user management.</p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 space-y-1">
              <span className="text-indigo-300 font-bold">SECURITY_ANALYST:</span>
              <p className="text-slate-400 text-[11px]">Access to Dashboard, Security Events, Alerts, Incidents, Attack Simulator & IR Actions.</p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 space-y-1">
              <span className="text-emerald-300 font-bold">FORENSIC_INVESTIGATOR:</span>
              <p className="text-slate-400 text-[11px]">Access to Incidents, Evidence Repository, Digital Forensics, Phishing Analyzer & Security Reports.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
