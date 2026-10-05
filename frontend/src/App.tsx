import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SimulationProgressModal } from './components/SimulationProgressModal';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Scenarios } from './pages/Scenarios';
import { AttackSimulator } from './pages/AttackSimulator';
import { LabAssets } from './pages/LabAssets';
import { SecurityEvents } from './pages/SecurityEvents';
import { Alerts } from './pages/Alerts';
import { Incidents } from './pages/Incidents';
import { IncidentDetail } from './pages/IncidentDetail';
import { DigitalForensics } from './pages/DigitalForensics';
import { Vulnerabilities } from './pages/Vulnerabilities';
import { PhishingAnalyzer } from './pages/PhishingAnalyzer';
import { IncidentResponse } from './pages/IncidentResponse';
import { Reports } from './pages/Reports';
import { AuditLogs } from './pages/AuditLogs';
import { Settings } from './pages/Settings';

import api from './api/client';

const MainLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState('/');

  // Simulation Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalLogs, setModalLogs] = useState<Array<{ time: string; message: string }>>([]);
  const [modalComplete, setModalComplete] = useState(false);
  const [modalIncidentId, setModalIncidentId] = useState<number | undefined>(undefined);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
        Initializing CyberShield Platform...
      </div>
    );
  }

  if (!user) {
    return <Login onSuccess={() => setCurrentPath('/')} />;
  }

  // Trigger automated scenario execution with animated progress modal
  const runScenarioWithModal = async (scenarioKey: string) => {
    setModalOpen(true);
    setModalTitle(`Executing Scenario: ${scenarioKey.toUpperCase()}`);
    setModalLogs([]);
    setModalComplete(false);
    setModalIncidentId(undefined);

    const now = () => new Date().toLocaleTimeString();
    setModalLogs([{ time: now(), message: 'Initializing cyber attack simulation engine...' }]);

    try {
      setTimeout(() => {
        setModalLogs(prev => [...prev, { time: now(), message: 'Generating synthetic attack vectors and endpoint telemetry...' }]);
      }, 700);

      setTimeout(() => {
        setModalLogs(prev => [...prev, { time: now(), message: 'Rule-based Detection Engine evaluating log event thresholds...' }]);
      }, 1400);

      const res = await api.post('/simulations/scenarios/run', { scenario_key: scenarioKey });

      setTimeout(() => {
        const backendLogs = res.data.logs || [];
        const formattedLogs = backendLogs.map((l: any) => ({ time: l.time || now(), message: l.message }));
        setModalLogs(formattedLogs);
        setModalComplete(true);
        setModalIncidentId(res.data.incident_id);
      }, 2100);

    } catch (err) {
      setModalLogs(prev => [...prev, { time: now(), message: 'Execution error in simulation engine.' }]);
      setModalComplete(true);
    }
  };

  // Trigger 1-Click Demo Mode (Automated Multi-Step Attack Scenario Tour)
  const handleTriggerDemoMode = () => {
    runScenarioWithModal('phishing_to_login');
  };

  // Render current view component based on currentPath
  const renderCurrentView = () => {
    if (currentPath === '/') {
      return <Dashboard onNavigate={setCurrentPath} onRunScenario={runScenarioWithModal} />;
    }
    if (currentPath === '/scenarios') {
      return <Scenarios onRunScenario={runScenarioWithModal} onNavigate={setCurrentPath} />;
    }
    if (currentPath === '/simulator') {
      return <AttackSimulator onSimulationRun={(type) => runScenarioWithModal(type)} />;
    }
    if (currentPath === '/lab') {
      return <LabAssets />;
    }
    if (currentPath === '/events') {
      return <SecurityEvents />;
    }
    if (currentPath === '/alerts') {
      return <Alerts onNavigate={setCurrentPath} />;
    }
    if (currentPath === '/incidents') {
      return <Incidents onNavigate={setCurrentPath} />;
    }
    if (currentPath.startsWith('/incidents/')) {
      const idStr = currentPath.replace('/incidents/', '');
      const id = parseInt(idStr, 10);
      return <IncidentDetail incidentId={id} onNavigate={setCurrentPath} />;
    }
    if (currentPath === '/forensics') {
      return <DigitalForensics />;
    }
    if (currentPath === '/vulnerabilities') {
      return <Vulnerabilities />;
    }
    if (currentPath === '/phishing-analyzer') {
      return <PhishingAnalyzer />;
    }
    if (currentPath === '/incident-response') {
      return <IncidentResponse />;
    }
    if (currentPath === '/reports') {
      return <Reports />;
    }
    if (currentPath === '/audit-logs') {
      return <AuditLogs />;
    }
    if (currentPath === '/settings') {
      return <Settings />;
    }

    return <Dashboard onNavigate={setCurrentPath} onRunScenario={runScenarioWithModal} />;
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar currentPath={currentPath} onNavigate={setCurrentPath} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header onTriggerDemo={handleTriggerDemoMode} />
        <main className="flex-1">
          {renderCurrentView()}
        </main>
      </div>

      {/* Simulation Animated Terminal Progress Modal */}
      <SimulationProgressModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        logs={modalLogs}
        isComplete={modalComplete}
        incidentId={modalIncidentId}
        onViewIncident={(id) => {
          setModalOpen(false);
          setCurrentPath(`/incidents/${id}`);
        }}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
