import React, { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import api from '../api/client';
import type { LabAsset } from '../types';

export const LabAssets: React.FC = () => {
  const [assets, setAssets] = useState<LabAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  const fetchAssets = async () => {
    try {
      const res = await api.get('/assets');
      setAssets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const inspectAsset = async (id: number) => {
    try {
      const res = await api.get(`/assets/${id}`);
      setSelectedAsset(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          Cyber Lab Infrastructure Topology
          <span className="text-xs bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-mono">
            ISOLATED SUBNET 192.168.10.0/24
          </span>
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Fictional simulated assets hosting lab services, web endpoints & database storage.
        </p>
      </div>

      {/* Assets Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="cyber-card p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-purple-500/50 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
                  {asset.asset_type}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  asset.status === 'ONLINE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                  asset.status === 'ISOLATED' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                  'bg-slate-800 text-slate-300'
                }`}>
                  {asset.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-white text-lg font-mono">{asset.name}</h3>
                <p className="text-xs font-mono text-purple-400">{asset.ip_address}</p>
                <p className="text-xs text-slate-400 mt-1">{asset.os}</p>
              </div>

              <div className="space-y-1 font-mono text-[11px]">
                <p className="text-slate-400">Open Ports: <span className="text-slate-200">{asset.open_ports}</span></p>
                <p className="text-slate-400 truncate">Services: <span className="text-slate-200">{asset.services}</span></p>
              </div>
            </div>

            <button
              onClick={() => inspectAsset(asset.id)}
              className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-mono flex items-center justify-center gap-2 transition"
            >
              <span>Inspect Vulnerabilities & Telemetry</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Asset Inspection Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base font-mono">{selectedAsset.asset.name}</h3>
                <p className="text-xs text-purple-400 font-mono">{selectedAsset.asset.ip_address} • {selectedAsset.asset.os}</p>
              </div>
              <button onClick={() => setSelectedAsset(null)} className="text-xs text-slate-400 hover:text-white">Close</button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-slate-300">Target Asset Vulnerabilities ({selectedAsset.vulnerabilities?.length || 0}):</h4>
              {selectedAsset.vulnerabilities?.map((v: any) => (
                <div key={v.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 font-mono">{v.cve_id}</span>
                    <span className="text-[10px] font-mono text-amber-300">{v.severity}</span>
                  </div>
                  <p className="text-xs font-semibold text-white">{v.title}</p>
                  <p className="text-[11px] text-slate-400">{v.description}</p>
                  <p className="text-[11px] text-emerald-400 font-mono pt-1">Fix: {v.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
