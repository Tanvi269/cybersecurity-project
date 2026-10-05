import React, { useEffect, useState } from 'react';
import { FileCode, RefreshCw, X } from 'lucide-react';
import api from '../api/client';
import type { Evidence } from '../types';

export const DigitalForensics: React.FC = () => {
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [selectedEvd, setSelectedEvd] = useState<Evidence | null>(null);

  const fetchEvidence = async () => {
    try {
      const res = await api.get('/evidence');
      setEvidenceList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, []);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Digital Forensics Evidence Repository
            <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
              SIMULATED LAB EVIDENCE
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Synthetic forensic artifacts, authentication logs, network dumps, process memory & file hashes.
          </p>
        </div>
        <button
          onClick={fetchEvidence}
          className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-mono flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Evidence</span>
        </button>
      </div>

      {/* Evidence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {evidenceList.map((evd) => (
          <div
            key={evd.id}
            className="cyber-card p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-purple-500/50 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                  {evd.evidence_code}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                  {evd.type}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-white text-base font-mono">{evd.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{evd.description}</p>
              </div>

              <div className="space-y-1 font-mono text-[11px] text-slate-400 pt-2 border-t border-slate-900">
                <p>Source: <span className="text-slate-200">{evd.source}</span></p>
                <p className="truncate">Hash: <span className="text-purple-300">{evd.file_hash}</span></p>
                <div className="pt-1">
                  <span className="inline-block text-[9px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded">
                    SIMULATED LAB EVIDENCE
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedEvd(evd)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-mono flex items-center justify-center gap-2 transition"
            >
              <FileCode className="w-4 h-4" />
              <span>Inspect Raw Evidence Payload</span>
            </button>
          </div>
        ))}
      </div>

      {/* Evidence Inspection Modal */}
      {selectedEvd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base font-mono">{selectedEvd.evidence_code}: {selectedEvd.title}</h3>
                <p className="text-xs text-emerald-400 font-mono">SIMULATED LAB EVIDENCE • Source: {selectedEvd.source}</p>
              </div>
              <button onClick={() => setSelectedEvd(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <p><span className="text-purple-400 font-semibold">Description:</span> {selectedEvd.description}</p>
              <p><span className="text-purple-400 font-semibold">SHA-256 Hash Verification:</span> <span className="text-slate-200">{selectedEvd.file_hash}</span></p>

              <div className="space-y-1">
                <label className="text-slate-400">Raw Hex / Text Payload:</label>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto max-h-60">
                  <pre>{selectedEvd.raw_payload || 'No raw payload available'}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
