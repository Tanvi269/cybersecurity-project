import React, { useEffect, useState } from 'react';
import { Search, RefreshCw, Eye, X } from 'lucide-react';
import api from '../api/client';
import type { SecurityEvent } from '../types';

export const SecurityEvents: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [search, setSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  const fetchEvents = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      if (eventTypeFilter) params.event_type = eventTypeFilter;
      if (severityFilter) params.severity = severityFilter;
      const res = await api.get('/events', { params });
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [eventTypeFilter, severityFilter]);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Security Event Telemetry Log
            <span className="text-xs bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-mono">
              SIEM STREAM
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Raw & processed synthetic security event logs from lab sensors, firewalls & EDR.
          </p>
        </div>
        <button
          onClick={fetchEvents}
          className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-mono flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="cyber-card p-4 rounded-xl border border-slate-800 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchEvents()}
            placeholder="Search IP, user, protocol, or raw text..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
          />
        </div>

        <select
          value={eventTypeFilter}
          onChange={(e) => setEventTypeFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-purple-500"
        >
          <option value="">All Event Types</option>
          <option value="FAILED_LOGIN">FAILED_LOGIN</option>
          <option value="PORT_SCAN">PORT_SCAN</option>
          <option value="SUSPICIOUS_LOGIN">SUSPICIOUS_LOGIN</option>
          <option value="PHISHING_CLICK">PHISHING_CLICK</option>
          <option value="MALWARE_HASH">MALWARE_HASH</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-purple-500"
        >
          <option value="">All Severities</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>
      </div>

      {/* Events Table */}
      <div className="cyber-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Event Type</th>
                <th className="p-3">Source IP</th>
                <th className="p-3">Destination</th>
                <th className="p-3">User</th>
                <th className="p-3">Protocol / Port</th>
                <th className="p-3">Severity</th>
                <th className="p-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-slate-500">
                    No security events found matching criteria.
                  </td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-900/60 transition">
                    <td className="p-3 text-slate-400 font-bold">#{ev.id}</td>
                    <td className="p-3 text-slate-400">{new Date(ev.timestamp).toLocaleTimeString()}</td>
                    <td className="p-3 font-semibold text-purple-300">{ev.event_type}</td>
                    <td className="p-3 text-rose-300">{ev.source_ip}</td>
                    <td className="p-3 text-slate-200">{ev.dest_ip}</td>
                    <td className="p-3 text-slate-400">{ev.user || 'N/A'}</td>
                    <td className="p-3 text-slate-400">{ev.protocol}:{ev.port || '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ev.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        ev.severity === 'HIGH' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                        'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {ev.severity}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedEvent(ev)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-purple-900 text-slate-300 hover:text-white"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base font-mono">Security Event #{selectedEvent.id} Raw Log</h3>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2 font-mono text-xs">
              <p><span className="text-purple-400 font-semibold">Description:</span> {selectedEvent.description}</p>
              <p><span className="text-purple-400 font-semibold">Source -&gt; Target:</span> {selectedEvent.source_ip} -&gt; {selectedEvent.dest_ip}</p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto">
                <pre>{selectedEvent.raw_data || 'No raw payload available'}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
