import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import api from '../api/client';
import type { Vulnerability } from '../types';

export const Vulnerabilities: React.FC = () => {
  const [vulns, setVulns] = useState<Vulnerability[]>([]);

  const fetchVulns = async () => {
    try {
      const res = await api.get('/vulnerabilities');
      setVulns(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVulns();
  }, []);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Vulnerability Assessment Dashboard
            <span className="text-xs bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-mono">
              CVE LAB SCANNER
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Synthetic vulnerability scans and misconfiguration audit across simulated lab assets.
          </p>
        </div>
        <button
          onClick={fetchVulns}
          className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-mono flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Rescan Lab Vulnerabilities</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vulns.map((v) => (
          <div
            key={v.id}
            className="cyber-card p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-purple-500/50 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                  {v.cve_id}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  v.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                  v.severity === 'HIGH' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                  'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {v.severity}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-white text-base leading-snug">{v.title}</h3>
                <p className="text-xs text-purple-400 font-mono mt-1">Asset: {v.asset_name}</p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{v.description}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 space-y-1 font-mono text-[11px]">
                <span className="text-emerald-400 font-bold block">Remediation Action:</span>
                <p className="text-slate-300">{v.recommendation}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between font-mono text-xs">
              <span className="text-slate-500">Status: {v.status}</span>
              <span className="text-purple-400 font-semibold">Simulated Vulnerability</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
