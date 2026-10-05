import React, { useState } from 'react';
import { Zap, CheckCircle2 } from 'lucide-react';
import api from '../api/client';

export const IncidentResponse: React.FC = () => {
  const [incidentId, setIncidentId] = useState('1');
  const [actionType, setActionType] = useState('block_ip');
  const [target, setTarget] = useState('192.168.10.55');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/incident-response/action', {
        incident_id: parseInt(incidentId, 10),
        action_type: actionType,
        target
      });
      setResult(res.data);
    } catch (err: any) {
      setResult({ error: err.response?.data?.detail || 'Failed to execute response action' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          Incident Response Action Center
          <span className="text-xs bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-mono font-bold">
            SIMULATED CONTROLS
          </span>
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Execute simulated containment, eradication & recovery controls across lab firewalls & endpoints.
        </p>
      </div>

      {/* NIST 7 Stage Lifecycle Banner */}
      <div className="cyber-card p-5 rounded-2xl border border-slate-800 space-y-3">
        <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          NIST SP 800-61 Incident Lifecycle Execution Pipeline
        </p>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2 font-mono text-[11px] text-center">
          <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-600 text-purple-300 font-bold">1. DETECT</div>
          <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-600 text-purple-300 font-bold">2. TRIAGE</div>
          <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-600 text-purple-300 font-bold">3. CONTAIN</div>
          <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-600 text-purple-300 font-bold">4. INVESTIGATE</div>
          <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-600 text-purple-300 font-bold">5. ERADICATE</div>
          <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-600 text-purple-300 font-bold">6. RECOVER</div>
          <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-300 font-bold">7. LESSONS</div>
        </div>
      </div>

      {/* Action Execution Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="cyber-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-sm font-mono border-b border-slate-800 pb-2">
            Execute Simulated Response Action
          </h3>

          <form onSubmit={handleExecute} className="space-y-4 font-mono text-xs">
            <div>
              <label className="text-slate-300">Target Incident ID</label>
              <input
                type="number"
                value={incidentId}
                onChange={(e) => setIncidentId(e.target.value)}
                required
                className="w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded text-white"
              />
            </div>

            <div>
              <label className="text-slate-300">Action Type</label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded text-white"
              >
                <option value="block_ip">Block Source IP (Firewall Drop Rule)</option>
                <option value="isolate_asset">Isolate Asset (Host Network Isolation)</option>
                <option value="revoke_credentials">Revoke Credentials (Active Directory Lock)</option>
                <option value="kill_process">Kill Process (EDR Agent Process Termination)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300">Target Value (IP / Asset / User / Process)</label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                required
                className="w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold font-mono shadow-lg shadow-amber-900/40 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>{loading ? 'Executing Simulated Control...' : 'Execute Containment Action'}</span>
            </button>
          </form>
        </div>

        {/* Execution Output */}
        <div className="cyber-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-sm font-mono border-b border-slate-800 pb-2">
            Execution Log & Audit Status
          </h3>

          {!result ? (
            <p className="text-xs text-slate-500 font-mono p-4">Select an action and click "Execute Containment Action".</p>
          ) : result.error ? (
            <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 font-mono text-xs">
              Error: {result.error}
            </div>
          ) : (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>ACTION EXECUTED SUCCESSFULLY</span>
                </div>
                <p className="text-slate-200">{result.summary}</p>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-emerald-900">
                  ACTION TYPE: <span className="text-purple-300">Simulated</span> | STATUS: <span className="text-emerald-400">Completed</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
