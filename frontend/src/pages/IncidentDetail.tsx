import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, CheckCircle2,
  Send, Clock, Search, Zap, FileSpreadsheet
} from 'lucide-react';
import api from '../api/client';
import type { Incident, IncidentNote, Alert, Evidence } from '../types';

interface IncidentDetailProps {
  incidentId: number;
  onNavigate: (path: string) => void;
}

export const IncidentDetail: React.FC<IncidentDetailProps> = ({ incidentId, onNavigate }) => {
  const [data, setData] = useState<{
    incident: Incident;
    notes: IncidentNote[];
    related_alerts: Alert[];
    evidence_items: Evidence[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [newNoteText, setNewNoteText] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const nistStages = ['DETECT', 'TRIAGE', 'CONTAIN', 'INVESTIGATE', 'ERADICATE', 'RECOVER', 'LESSONS_LEARNED'];

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/incidents/${incidentId}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [incidentId]);

  const updateStage = async (newStage: string) => {
    try {
      await api.patch(`/incidents/${incidentId}`, { stage: newStage });
      fetchDetail();
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      await api.patch(`/incidents/${incidentId}`, { status: newStatus });
      fetchDetail();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    try {
      await api.post(`/incidents/${incidentId}/notes`, { text: newNoteText });
      setNewNoteText('');
      fetchDetail();
    } catch (err) {
      console.error(err);
    }
  };

  const handleIRAction = async (actionType: string, target: string) => {
    try {
      const res = await api.post('/incident-response/action', {
        incident_id: incidentId,
        action_type: actionType,
        target: target
      });
      setActionMessage(res.data.summary);
      fetchDetail();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-400 font-mono">Loading Incident Details...</div>;
  }

  const { incident, notes, related_alerts, evidence_items } = data;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/incidents')}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded">
                INCIDENT #{incident.id}
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">{incident.title}</h1>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Asset: {incident.affected_asset} • Attack Type: {incident.attack_type} • Analyst: {incident.assigned_analyst}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/reports')}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Generate Security Report</span>
          </button>
        </div>
      </div>

      {/* NIST 7-STAGE INCIDENT RESPONSE PIPELINE STEPPER */}
      <div className="cyber-card p-5 rounded-2xl border border-slate-800 space-y-3">
        <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          NIST SP 800-61 Incident Lifecycle Stages
        </p>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
          {nistStages.map((stg, idx) => {
            const isCurrent = incident.stage === stg;
            return (
              <button
                key={stg}
                onClick={() => updateStage(stg)}
                className={`p-2.5 rounded-xl border text-center font-mono text-[10px] font-bold transition ${
                  isCurrent
                    ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-900/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>{idx + 1}. {stg}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Details + IR Actions vs Evidence & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Simulated Response Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Overview Card */}
          <div className="cyber-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-sm font-mono border-b border-slate-800 pb-2">
              Incident Case Overview
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">{incident.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs pt-2">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900">
                <span className="text-slate-500 block text-[10px]">CURRENT STATUS</span>
                <select
                  value={incident.status}
                  onChange={(e) => updateStatus(e.target.value)}
                  className="bg-transparent text-purple-300 font-bold focus:outline-none cursor-pointer mt-1"
                >
                  {['NEW', 'TRIAGING', 'INVESTIGATING', 'CONTAINED', 'RECOVERING', 'RESOLVED', 'CLOSED'].map((s) => (
                    <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900">
                <span className="text-slate-500 block text-[10px]">SEVERITY LEVEL</span>
                <span className="font-bold text-rose-400">{incident.severity}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900">
                <span className="text-slate-500 block text-[10px]">CREATED TIME</span>
                <span className="text-slate-300">{new Date(incident.created_at).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* SIMULATED INCIDENT RESPONSE ACTIONS */}
          <div className="cyber-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-sm font-mono flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Simulated Incident Response Controls</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400">LAB SAFE EXECUTIONS</span>
            </div>

            {actionMessage && (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{actionMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <button
                onClick={() => handleIRAction('block_ip', '192.168.10.55')}
                className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left hover:border-purple-500/50 transition"
              >
                <div className="font-bold text-rose-400">1. Block Source IP 192.168.10.55</div>
                <div className="text-[10px] text-slate-400">Simulates Firewall ACL Drop Rule</div>
              </button>

              <button
                onClick={() => handleIRAction('isolate_asset', incident.affected_asset)}
                className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left hover:border-purple-500/50 transition"
              >
                <div className="font-bold text-amber-400">2. Isolate Asset {incident.affected_asset}</div>
                <div className="text-[10px] text-slate-400">Simulates Host Network Isolation</div>
              </button>

              <button
                onClick={() => handleIRAction('revoke_credentials', 'db_admin@cybershield.local')}
                className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left hover:border-purple-500/50 transition"
              >
                <div className="font-bold text-purple-400">3. Revoke User Credentials</div>
                <div className="text-[10px] text-slate-400">Simulates Active Directory Session Reset</div>
              </button>

              <button
                onClick={() => handleIRAction('kill_process', 'svchost_fake.exe (PID 4912)')}
                className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left hover:border-purple-500/50 transition"
              >
                <div className="font-bold text-indigo-400">4. EDR Process Kill</div>
                <div className="text-[10px] text-slate-400">Simulates Endpoint Agent Process Kill</div>
              </button>
            </div>
          </div>

          {/* FORENSIC TIMELINE ANALYZER */}
          <div className="cyber-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-sm font-mono flex items-center gap-2 border-b border-slate-800 pb-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>Interactive Incident Timeline Analyzer</span>
            </h3>

            <div className="relative pl-6 border-l-2 border-slate-800 space-y-4 font-mono text-xs">
              <div className="relative">
                <span className="absolute -left-[31px] top-0.5 w-3 h-3 rounded-full bg-purple-500 border-2 border-slate-900"></span>
                <p className="text-[10px] text-slate-500">{new Date(incident.created_at).toLocaleTimeString()}</p>
                <p className="font-semibold text-white">Incident Recorded & Assigned to SOC Analyst</p>
              </div>

              {related_alerts.map((al) => (
                <div key={al.id} className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-3 h-3 rounded-full bg-rose-500 border-2 border-slate-900"></span>
                  <p className="text-[10px] text-slate-500">{new Date(al.timestamp).toLocaleTimeString()}</p>
                  <p className="font-semibold text-rose-300">Detection Rule Triggered: {al.detection_rule}</p>
                  <p className="text-[11px] text-slate-400">{al.description}</p>
                </div>
              ))}

              {notes.map((n) => (
                <div key={n.id} className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-3 h-3 rounded-full bg-amber-500 border-2 border-slate-900"></span>
                  <p className="text-[10px] text-slate-500">{new Date(n.timestamp).toLocaleTimeString()}</p>
                  <p className="font-semibold text-amber-300">Analyst Note ({n.author}):</p>
                  <p className="text-[11px] text-slate-300">{n.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Evidence & Analyst Notes */}
        <div className="space-y-6">
          {/* Evidence Artifacts */}
          <div className="cyber-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-sm font-mono flex items-center gap-2 border-b border-slate-800 pb-2">
              <Search className="w-4 h-4 text-purple-400" />
              <span>Digital Forensics Evidence</span>
            </h3>

            <div className="space-y-3">
              {evidence_items.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono">No evidence artifacts attached.</p>
              ) : (
                evidence_items.map((evd) => (
                  <div key={evd.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-400 font-bold">{evd.evidence_code}</span>
                      <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">{evd.type}</span>
                    </div>
                    <p className="font-semibold text-white">{evd.title}</p>
                    <p className="text-[10px] text-slate-400 truncate">Hash: {evd.file_hash}</p>
                    <span className="inline-block text-[9px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded mt-1">
                      SIMULATED LAB EVIDENCE
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Investigation Notes Form */}
          <div className="cyber-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-sm font-mono border-b border-slate-800 pb-2">
              Analyst Investigation Notes
            </h3>

            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Log observation or forensic findings..."
                rows={3}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
              <button
                type="submit"
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Investigation Note</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
