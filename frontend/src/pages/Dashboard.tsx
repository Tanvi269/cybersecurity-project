import React, { useEffect, useState } from 'react';
import {
  ShieldAlert, AlertTriangle, Activity, FileText, Bug,
  ArrowUpRight, Play, RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../api/client';
import type { Alert, Incident } from '../types';

interface DashboardProps {
  onNavigate: (path: string) => void;
  onRunScenario: (scenarioKey: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onRunScenario }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono flex items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
        <span>Loading SOC Telemetry & Dashboard Data...</span>
      </div>
    );
  }

  // Chart data formatting
  const severityColors: any = {
    CRITICAL: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#f59e0b',
    LOW: '#3b82f6',
  };

  const severityPieData = Object.entries(stats?.severity_breakdown || {}).map(([key, val]) => ({
    name: key,
    value: val as number,
    color: severityColors[key] || '#94a3b8',
  }));

  const attackTypeData = Object.entries(stats?.attacks_by_type || {}).map(([key, val]) => ({
    name: key.replace('_', ' '),
    count: val as number,
  }));

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            SOC Command Center
            <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-mono font-normal">
              REAL-TIME MONITOR
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">Academic Laboratory Synthetic Threat & Incident Overview</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onRunScenario('phishing_to_login')}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-md shadow-purple-900/30 transition"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Launch Quick Attack Scenario</span>
          </button>
          <button
            onClick={fetchStats}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Security Events */}
        <div className="cyber-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">TOTAL EVENTS</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats?.total_events || 0}</div>
          <p className="text-[11px] text-slate-400 font-mono">Synthetic telemetry logs</p>
        </div>

        {/* Critical / High Alerts */}
        <div className="cyber-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">CRITICAL & HIGH ALERTS</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono">
            {(stats?.critical_alerts || 0) + (stats?.high_alerts || 0)}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Requires immediate SOC response</p>
        </div>

        {/* Active Incidents */}
        <div className="cyber-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">ACTIVE INCIDENTS</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{stats?.active_incidents || 0}</div>
          <p className="text-[11px] text-slate-400 font-mono">{stats?.resolved_incidents || 0} resolved incidents</p>
        </div>

        {/* Lab Assets & Open Vulnerabilities */}
        <div className="cyber-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">VULNERABILITIES</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Bug className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-400 font-mono">{stats?.open_vulnerabilities || 0}</div>
          <p className="text-[11px] text-slate-400 font-mono">Simulated lab asset CVEs</p>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attack Types Bar Chart */}
        <div className="cyber-card p-5 rounded-2xl border border-slate-800 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">Simulated Attacks by Category</h3>
              <p className="text-xs text-slate-400 font-mono">Detection engine rule matches</p>
            </div>
            <button
              onClick={() => onNavigate('/events')}
              className="text-xs text-purple-400 hover:text-purple-300 font-mono flex items-center gap-1"
            >
              <span>View Logs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-60 w-full pt-2">
            {attackTypeData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
                No attack events recorded yet. Run a simulation to populate charts.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attackTypeData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Severity Breakdown Pie Chart */}
        <div className="cyber-card p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">Alert Severity Spectrum</h3>
              <p className="text-xs text-slate-400 font-mono">Distribution of generated alerts</p>
            </div>
          </div>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800">
            {severityPieData.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></span>
                  {s.name}
                </span>
                <span className="font-bold text-slate-200">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables: Recent Alerts & Recent Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="cyber-card p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              <span>Recent Security Alerts</span>
            </h3>
            <button
              onClick={() => onNavigate('/alerts')}
              className="text-xs text-purple-400 hover:text-purple-300 font-mono"
            >
              View All
            </button>
          </div>
          <div className="space-y-2">
            {(!stats?.recent_alerts || stats.recent_alerts.length === 0) ? (
              <p className="text-xs text-slate-500 font-mono">No recent alerts recorded.</p>
            ) : (
              stats.recent_alerts.map((alert: Alert) => (
                <div
                  key={alert.id}
                  onClick={() => onNavigate('/alerts')}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 cursor-pointer transition flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        alert.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        alert.severity === 'HIGH' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                        'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="font-bold text-xs text-white">{alert.alert_type}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate max-w-sm">{alert.description}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{alert.target_asset}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="cyber-card p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Active Incident Response Desk</span>
            </h3>
            <button
              onClick={() => onNavigate('/incidents')}
              className="text-xs text-purple-400 hover:text-purple-300 font-mono"
            >
              View All
            </button>
          </div>
          <div className="space-y-2">
            {(!stats?.recent_incidents || stats.recent_incidents.length === 0) ? (
              <p className="text-xs text-slate-500 font-mono">No active incidents.</p>
            ) : (
              stats.recent_incidents.map((inc: Incident) => (
                <div
                  key={inc.id}
                  onClick={() => onNavigate(`/incidents/${inc.id}`)}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
                        #{inc.id} {inc.stage}
                      </span>
                      <span className="font-bold text-xs text-white truncate max-w-xs">{inc.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{inc.affected_asset} • {inc.attack_type}</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-1 bg-slate-800 text-slate-300 rounded">
                    {inc.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
