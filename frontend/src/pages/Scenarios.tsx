import React from 'react';
import { PlayCircle, CheckCircle2, ArrowRight, Layers } from 'lucide-react';

interface ScenariosProps {
  onRunScenario: (scenarioKey: string) => void;
  onNavigate?: (path: string) => void;
}

export const Scenarios: React.FC<ScenariosProps> = ({ onRunScenario }) => {
  const scenarioCards = [
    {
      key: 'phishing_to_login',
      title: 'Scenario 1: Phishing to Suspicious Login',
      badge: 'MULTI-STAGE ATTACK',
      severity: 'CRITICAL',
      target: 'LAB-PC-01 & LAB-DB-01',
      description: 'Simulates a victim user clicking a malicious phishing email link, harvesting credentials, followed by an immediate anomalous remote database login.',
      flowSteps: [
        'Phishing Email Simulation',
        'User Interaction (Link Click)',
        'Suspicious RDP Login',
        'Detection Engine Evaluation',
        'Alert Generation',
        'Incident Escalation',
        'Forensic Artifact Dump',
        'Simulated Credential Revocation',
        'Resolution & Report'
      ]
    },
    {
      key: 'brute_force',
      title: 'Scenario 2: Automated SSH Brute Force Spraying',
      badge: 'AUTHENTICATION ATTACK',
      severity: 'HIGH',
      target: 'LAB-AUTH-01',
      description: 'Simulates rapid repeated SSH login attempts from an attacker IP until rule threshold (>5 attempts) triggers an automated SOC Brute Force Alert.',
      flowSteps: [
        'Rapid Failed SSH Attempts (x6)',
        'Detection Threshold Exceeded',
        'Brute Force Alert Created',
        'Incident Desk Escalation',
        'Auth Log Evidence Collection',
        'Simulated Firewall IP Block',
        'Resolution'
      ]
    },
    {
      key: 'network_recon',
      title: 'Scenario 3: Network Reconnaissance (Port Scan)',
      badge: 'RECONNAISSANCE',
      severity: 'MEDIUM',
      target: 'LAB-WEB-01',
      description: 'Simulates synthetic TCP SYN port probing across web server ports 21-8080 to discover vulnerable open services.',
      flowSteps: [
        'Synthetic Port Probes (Ports 21-8080)',
        'Multi-Port Recon Detection',
        'Port Scan Alert',
        'Firewall PCAP Evidence Dump',
        'IDS Rate Limit Containment',
        'Resolution'
      ]
    },
    {
      key: 'suspicious_login',
      title: 'Scenario 4: Suspicious Login Anomaly',
      badge: 'ANOMALY DETECTION',
      severity: 'HIGH',
      target: 'LAB-DB-01',
      description: 'Simulates a valid credential remote desktop session initiated from an unexpected IP address outside standard working hours.',
      flowSteps: [
        'Off-Hours RDP Session Start',
        'Anomaly Detection Rule Triggered',
        'Suspicious Login Alert',
        'Windows Event Log Evidence',
        'Simulated RDP Session Termination',
        'Resolution'
      ]
    },
    {
      key: 'malware_indicator',
      title: 'Scenario 5: Malware Indicator Investigation',
      badge: 'ENDPOINT THREAT',
      severity: 'CRITICAL',
      target: 'LAB-PC-01',
      description: 'Simulates Sentinel EDR endpoint detection flagging a synthetic malicious binary file hash attempting process injection into svchost.',
      flowSteps: [
        'Synthetic File Hash Detection',
        'EDR Malware Rule Triggered',
        'Malware Indicator Alert',
        'Process Memory Dump Evidence',
        'Simulated Host Network Isolation',
        'Resolution'
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Attack Scenario Engine
            <span className="text-xs bg-purple-600 text-white font-mono font-bold px-2 py-0.5 rounded shadow">
              CENTRAL FEATURE
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Execute complete end-to-end cybersecurity lifecycles inside the simulated lab.
          </p>
        </div>
      </div>

      {/* Lifecycle Blueprint Diagram */}
      <div className="cyber-card p-5 rounded-2xl border border-purple-500/30 bg-purple-950/20 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-300">
          <Layers className="w-4 h-4 text-purple-400" />
          <span>CYBERSHIELD LIFECYCLE PIPELINE FLOW</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-slate-300">
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700">ATTACK SIMULATION</span>
          <ArrowRight className="w-3 h-3 text-purple-400" />
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700">EVENT GENERATION</span>
          <ArrowRight className="w-3 h-3 text-purple-400" />
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700">THREAT DETECTION</span>
          <ArrowRight className="w-3 h-3 text-purple-400" />
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700">SECURITY ALERT</span>
          <ArrowRight className="w-3 h-3 text-purple-400" />
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700">INCIDENT CREATION</span>
          <ArrowRight className="w-3 h-3 text-purple-400" />
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700">FORENSICS & EVIDENCE</span>
          <ArrowRight className="w-3 h-3 text-purple-400" />
          <span className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold">CONTAINMENT & REPORT</span>
        </div>
      </div>

      {/* Scenario Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {scenarioCards.map((sc) => (
          <div
            key={sc.key}
            className="cyber-card p-6 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition space-y-5 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                  {sc.badge}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  sc.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                  sc.severity === 'HIGH' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                  'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {sc.severity}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-white text-base">{sc.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{sc.description}</p>
              </div>

              <div className="text-xs font-mono text-slate-400">
                <span className="text-purple-400 font-bold">Target Lab Asset: </span>
                <span className="text-slate-200">{sc.target}</span>
              </div>

              {/* Step Flow List */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-900 space-y-1.5 font-mono text-[11px]">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Scenario Lifecycle Flow:</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {sc.flowSteps.map((step, sIdx) => (
                    <React.Fragment key={sIdx}>
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                        {sIdx + 1}. {step}
                      </span>
                      {sIdx < sc.flowSteps.length - 1 && <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch Action */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Lab Safe Simulation</span>
              </span>
              <button
                onClick={() => onRunScenario(sc.key)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-900/40 border border-purple-300/30 transition transform hover:scale-[1.02]"
              >
                <PlayCircle className="w-4 h-4 fill-white" />
                <span>Execute Scenario</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
