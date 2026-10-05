import React, { useState } from 'react';
import { Play, RefreshCw } from 'lucide-react';
import api from '../api/client';

interface AttackSimulatorProps {
  onSimulationRun: (type: string) => void;
}

export const AttackSimulator: React.FC<AttackSimulatorProps> = ({ onSimulationRun }) => {
  const [running, setRunning] = useState<string | null>(null);

  const attacks = [
    {
      type: 'brute_force',
      title: 'Brute Force Attack Simulation',
      target: 'LAB-AUTH-01 (192.168.10.20)',
      description: 'Generates 6 rapid SSH failed login events from IP 192.168.10.55. Triggers Rule 1 Brute Force threshold detection.',
      severity: 'HIGH'
    },
    {
      type: 'port_scan',
      title: 'Port Scan Reconnaissance',
      target: 'LAB-WEB-01 (192.168.10.10)',
      description: 'Generates synthetic SYN probes across 7 distinct ports (21, 22, 80, 443, 3306, 8080). Triggers Rule 2 Port Scan detection.',
      severity: 'MEDIUM'
    },
    {
      type: 'phishing',
      title: 'Phishing Link Click Simulation',
      target: 'LAB-PC-01 (192.168.10.40)',
      description: 'Simulates victim clicking credential harvest link in fake password expiration email. Triggers Rule 4 Phishing alert.',
      severity: 'HIGH'
    },
    {
      type: 'suspicious_login',
      title: 'Suspicious Login Anomaly',
      target: 'LAB-DB-01 (192.168.10.30)',
      description: 'Simulates anomalous RDP connection for db_admin from unassigned IP 192.168.10.55 outside business hours. Triggers Rule 3 Anomaly alert.',
      severity: 'HIGH'
    },
    {
      type: 'malware_indicator',
      title: 'Malware Process Execution',
      target: 'LAB-PC-01 (192.168.10.40)',
      description: 'Simulates endpoint Sentinel EDR flagging malicious binary hash (44d88612fea8a8f36de82e1278abb02f). Triggers Rule 5 Critical alert.',
      severity: 'CRITICAL'
    }
  ];

  const handleRun = async (type: string) => {
    setRunning(type);
    try {
      await api.post('/simulations/start', { attack_type: type });
      onSimulationRun(type);
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          Attack Simulator Controls
          <span className="text-xs bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-mono">
            SYNTHETIC LAB
          </span>
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Launch individual controlled cyber attack vector simulations against fictional lab assets.
        </p>
      </div>

      {/* Grid of Attacks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {attacks.map((att) => (
          <div
            key={att.type}
            className="cyber-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-purple-500/40 transition"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  att.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                  att.severity === 'HIGH' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                  'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {att.severity}
                </span>
                <span className="text-[10px] font-mono text-slate-500">SAFE SIMULATION</span>
              </div>
              <h3 className="font-bold text-white text-base">{att.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{att.description}</p>
              <div className="p-2 rounded-lg bg-slate-950 font-mono text-[11px] text-purple-300 border border-slate-900">
                Target: {att.target}
              </div>
            </div>

            <button
              onClick={() => handleRun(att.type)}
              disabled={running === att.type}
              className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 border border-purple-400/30 transition"
            >
              {running === att.type ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Simulating Attack & Evaluating Rules...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Run Attack Simulation</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
