import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import api from '../api/client';

export const PhishingAnalyzer: React.FC = () => {
  const [sender, setSender] = useState('security-notice@auth-update-cybershield.net');
  const [subject, setSubject] = useState('URGENT: Action Required - Password Expiration Notice');
  const [body, setBody] = useState(
    'Dear Employee,\n\nYour account credentials will expire in 24 hours. Immediately log in to http://auth-update-cybershield.net/login to verify your password and update billing details to avoid account suspension.\n\nThank you,\nIT Support Team'
  );
  const [rawUrl, setRawUrl] = useState('http://auth-update-cybershield.net/login');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/phishing/analyze', {
        sender,
        subject,
        body,
        raw_url: rawUrl
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (type: string) => {
    if (type === 'phish') {
      setSender('security-alert@secure-update-cybershield.com');
      setSubject('CRITICAL: Verify Account Credentials Immediately');
      setBody('Your account has experienced unauthorized access. Please enter your password at http://secure-update-cybershield.com/verify to restore full access within 24 hours.');
      setRawUrl('http://secure-update-cybershield.com/verify');
    } else if (type === 'safe') {
      setSender('newsletter@cybershield.local');
      setSubject('CyberShield Weekly Lab Maintenance Schedule');
      setBody('Hello Team,\n\nPlease note scheduled lab server updates on Friday at 22:00 UTC. No action is required.\n\nBest regards,\nSOC Operations');
      setRawUrl('');
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          Phishing Email Heuristic Analyzer
          <span className="text-xs bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-mono">
            SAFE ACADEMIC ANALYZER
          </span>
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Safe heuristic evaluation of sample emails for spoofing domains, psychological urgency & credential traps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="cyber-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-white text-sm font-mono">Email Payload Input</h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadSample('phish')}
                className="px-2 py-1 bg-rose-950/60 border border-rose-800 text-rose-300 rounded text-[10px] font-mono"
              >
                Load Phishing Sample
              </button>
              <button
                type="button"
                onClick={() => loadSample('safe')}
                className="px-2 py-1 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded text-[10px] font-mono"
              >
                Load Legitimate Sample
              </button>
            </div>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-slate-300">Sender Address</label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                required
                className="w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded text-white"
              />
            </div>

            <div>
              <label className="text-slate-300">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded text-white"
              />
            </div>

            <div>
              <label className="text-slate-300">Destination URL (Optional)</label>
              <input
                type="text"
                value={rawUrl}
                onChange={(e) => setRawUrl(e.target.value)}
                className="w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded text-white"
              />
            </div>

            <div>
              <label className="text-slate-300">Email Body Text</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                required
                className="w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold font-mono shadow-lg shadow-purple-900/40"
            >
              {loading ? 'Evaluating Indicators...' : 'Run Phishing Heuristic Analysis'}
            </button>
          </form>
        </div>

        {/* Results Card */}
        <div className="cyber-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-sm font-mono border-b border-slate-800 pb-2">
            Analysis Report & Risk Evaluation
          </h3>

          {!result ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">
              Fill in sample email headers and click "Run Phishing Heuristic Analysis".
            </div>
          ) : (
            <div className="space-y-4 font-mono text-xs">
              {/* Risk Level Badge */}
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 text-[10px] block">ASSESSED RISK LEVEL</span>
                  <span className={`text-lg font-bold ${
                    result.risk_level === 'CRITICAL' ? 'text-rose-400' :
                    result.risk_level === 'HIGH' ? 'text-orange-400' :
                    result.risk_level === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {result.risk_level} (Score: {result.risk_score}/100)
                  </span>
                </div>
                <div className={`p-3 rounded-xl ${
                  result.risk_level === 'CRITICAL' ? 'bg-rose-950 border border-rose-800 text-rose-300' : 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                }`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>

              {/* Detected Indicators */}
              <div className="space-y-2">
                <span className="text-purple-400 font-bold block">Threat Indicators Identified ({result.indicators.length}):</span>
                <div className="space-y-1">
                  {result.indicators.map((ind: string, idx: number) => (
                    <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-900 text-slate-200 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                      <span>{ind}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detection Rationale */}
              <div className="space-y-2">
                <span className="text-slate-300 font-bold block">Detailed Detection Rationale:</span>
                <div className="space-y-1">
                  {result.reasons.map((reason: string, idx: number) => (
                    <p key={idx} className="text-slate-400 leading-relaxed text-[11px]">• {reason}</p>
                  ))}
                </div>
              </div>

              {/* Defensive Recommendations */}
              <div className="p-4 bg-purple-950/40 border border-purple-800/50 rounded-xl space-y-2">
                <span className="text-purple-300 font-bold block">SOC Defensive Recommendations:</span>
                <ul className="space-y-1 text-slate-300 text-[11px]">
                  {result.recommendations.map((rec: string, idx: number) => (
                    <li key={idx}>✓ {rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
