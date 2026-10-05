import React from 'react';
import { Activity, CheckCircle2, ArrowRight, X } from 'lucide-react';

interface LogItem {
  time: string;
  message: string;
}

interface SimulationProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  logs: LogItem[];
  isComplete: boolean;
  incidentId?: number;
  onViewIncident?: (id: number) => void;
}

export const SimulationProgressModal: React.FC<SimulationProgressModalProps> = ({
  isOpen,
  onClose,
  title,
  logs,
  isComplete,
  incidentId,
  onViewIncident
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-purple-500/40 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-purple-950/50">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isComplete ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-purple-500/20 text-purple-400 border border-purple-500/40'}`}>
              {isComplete ? <CheckCircle2 className="w-5 h-5" /> : <Activity className="w-5 h-5 animate-spin" />}
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">{title}</h3>
              <p className="text-xs text-slate-400 font-mono">
                {isComplete ? 'Execution Completed & Incident Updated' : 'Live Attack Event Stream & Rule Evaluation'}
              </p>
            </div>
          </div>
          {isComplete && (
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress Log Box */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs max-h-64 overflow-y-auto space-y-2">
            {logs.length === 0 ? (
              <div className="text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
                <span>Initializing cyber lab simulation engine...</span>
              </div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-3 border-b border-slate-900/60 pb-1.5 last:border-0">
                  <span className="text-purple-400 text-[10px] shrink-0 pt-0.5">[{log.time}]</span>
                  <span className="text-slate-200 leading-relaxed">{log.message}</span>
                </div>
              ))
            )}
          </div>

          {/* Lifecycle Execution Pipeline Visualization */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
              Cybersecurity Lifecycle Engine
            </p>
            <div className="grid grid-cols-5 gap-1 text-center font-mono text-[10px]">
              <div className={`p-2 rounded border ${logs.length >= 1 ? 'bg-purple-950/80 border-purple-600 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                1. SIMULATE
              </div>
              <div className={`p-2 rounded border ${logs.length >= 2 ? 'bg-indigo-950/80 border-indigo-600 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                2. DETECT
              </div>
              <div className={`p-2 rounded border ${logs.length >= 3 ? 'bg-amber-950/80 border-amber-600 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                3. ALERT
              </div>
              <div className={`p-2 rounded border ${logs.length >= 4 ? 'bg-rose-950/80 border-rose-600 text-rose-300' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                4. INCIDENT
              </div>
              <div className={`p-2 rounded border ${isComplete ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                5. RESOLVE
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            {isComplete ? 'Status: Complete' : 'Status: Executing...'}
          </span>
          <div className="flex items-center gap-3">
            {isComplete && incidentId && onViewIncident && (
              <button
                onClick={() => onViewIncident(incidentId)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow border border-purple-400/30"
              >
                <span>Investigate Incident #{incidentId}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {isComplete && (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
              >
                Close Modal
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
