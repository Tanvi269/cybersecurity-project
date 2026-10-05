export type UserRole = 'ADMIN' | 'SECURITY_ANALYST' | 'FORENSIC_INVESTIGATOR';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface LabAsset {
  id: number;
  name: string;
  ip_address: string;
  os: string;
  asset_type: string;
  status: 'ONLINE' | 'DEGRADED' | 'ISOLATED' | 'OFFLINE';
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  open_ports?: string;
  services?: string;
  last_activity: string;
}

export interface SecurityEvent {
  id: number;
  timestamp: string;
  event_type: string;
  source_ip: string;
  dest_ip: string;
  user?: string;
  protocol: string;
  port?: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'UNPROCESSED' | 'PROCESSED' | 'DETECTED';
  description: string;
  raw_data?: string;
  simulation_run_id?: number;
}

export interface Alert {
  id: number;
  alert_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source_ip: string;
  target_asset: string;
  timestamp: string;
  description: string;
  detection_rule: string;
  evidence_count: number;
  status: 'NEW' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';
  related_event_ids?: number[];
}

export interface IncidentNote {
  id: number;
  incident_id: number;
  author: string;
  text: string;
  timestamp: string;
}

export interface Incident {
  id: number;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  attack_type: string;
  affected_asset: string;
  created_at: string;
  updated_at?: string;
  status: 'NEW' | 'TRIAGING' | 'INVESTIGATING' | 'CONTAINED' | 'RECOVERING' | 'RESOLVED' | 'CLOSED';
  stage: 'DETECT' | 'TRIAGE' | 'CONTAIN' | 'INVESTIGATE' | 'ERADICATE' | 'RECOVER' | 'LESSONS_LEARNED';
  assigned_analyst: string;
  description: string;
  related_alerts?: number[];
  evidence_ids?: string[];
  containment_action?: string;
  recovery_action?: string;
  resolution_notes?: string;
}

export interface Evidence {
  id: number;
  evidence_code: string;
  title: string;
  type: string;
  source: string;
  timestamp: string;
  file_hash?: string;
  description: string;
  raw_payload?: string;
  related_incident_id?: number;
  collection_status: string;
}

export interface Vulnerability {
  id: number;
  cve_id: string;
  title: string;
  asset_name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  recommendation: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'MITIGATED' | 'RESOLVED';
}

export interface SimulationRun {
  id: number;
  scenario_name: string;
  status: string;
  started_at: string;
  completed_at?: string;
  log_json?: Array<{ time: string; message: string }>;
}

export interface AuditLog {
  id: number;
  timestamp: string;
  user_email: string;
  action: string;
  resource: string;
  ip_address: string;
  result: string;
  details?: string;
}

export interface Report {
  id: number;
  report_code: string;
  incident_id: number;
  title: string;
  generated_by: string;
  created_at: string;
  content_json: any;
}
