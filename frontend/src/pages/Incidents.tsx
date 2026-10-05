import React, { useEffect, useState } from 'react';
import { Plus, ArrowRight, RefreshCw } from 'lucide-react';
import api from '../api/client';
import type { Incident } from '../types';

interface IncidentsProps {
  onNavigate: (path: string) => void;
}

export const Incidents: React.FC<IncidentsProps> = ({ onNavigate }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState('HIGH');
  const [attackType] = useState('Suspicious Login');
  const [affectedAsset, setAffectedAsset] = useState('LAB-DB-01');
  const [description, setDescription] = useState('');

  const fetchIncidents = async () => {
    try {
      const res = await api.get('/incidents');
      setIncidents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/incidents', {
        title,
        severity,
        attack_type: attackType,
        affected_asset: affectedAsset,
        description
      });
      setShowCreateModal(false);
      onNavigate(`/incidents/${res.data.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Incident Management Desk
            <span className="text-xs bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-mono">
              SOC TRIAGE & IR
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Active & resolved cybersecurity incident cases under SOC investigation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-md shadow-purple-900/30"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Incident</span>
          </button>
          <button
            onClick={fetchIncidents}
            className="p-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Incidents Table / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {incidents.map((inc) => (
          <div
            key={inc.id}
            onClick={() => onNavigate(`/incidents/${inc.id}`)}
            className="cyber-card p-6 rounded-2xl border border-slate-800 hover:border-amber-500/50 cursor-pointer transition space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  INCIDENT #{inc.id}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  inc.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                  'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  {inc.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-white text-base leading-snug">{inc.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{inc.description}</p>
              </div>

              <div className="space-y-1 font-mono text-[11px] text-slate-400 pt-2 border-t border-slate-900">
                <p>NIST IR Stage: <span className="text-purple-300 font-bold">{inc.stage}</span></p>
                <p>Affected Asset: <span className="text-slate-200">{inc.affected_asset}</span></p>
                <p>Analyst: <span className="text-slate-400">{inc.assigned_analyst}</span></p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-purple-400 font-mono font-semibold">
              <span>Open Investigation Workbench</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Create Incident Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <form onSubmit={handleCreateIncident} className="bg-slate-900 border border-purple-500/40 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base font-mono">Manually Log Security Incident</h3>
            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-300">Incident Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Unexplained SQL Exfiltration Probe"
                  className="w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded text-white"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300">Affected Asset</label>
                  <select
                    value={affectedAsset}
                    onChange={(e) => setAffectedAsset(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded text-white"
                  >
                    <option value="LAB-WEB-01">LAB-WEB-01</option>
                    <option value="LAB-AUTH-01">LAB-AUTH-01</option>
                    <option value="LAB-DB-01">LAB-DB-01</option>
                    <option value="LAB-PC-01">LAB-PC-01</option>
                    <option value="LAB-FILE-01">LAB-FILE-01</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300">Incident Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  className="w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded text-xs font-bold"
              >
                Save Incident
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
