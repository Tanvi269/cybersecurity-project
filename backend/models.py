import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="SECURITY_ANALYST") # ADMIN, SECURITY_ANALYST, FORENSIC_INVESTIGATOR
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class LabAsset(Base):
    __tablename__ = "lab_assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    ip_address = Column(String, nullable=False)
    os = Column(String, nullable=False)
    asset_type = Column(String, nullable=False) # Web Server, DB Server, Auth Server, Workstation, File Server
    status = Column(String, default="ONLINE") # ONLINE, DEGRADED, ISOLATED, OFFLINE
    risk_level = Column(String, default="LOW") # LOW, MEDIUM, HIGH, CRITICAL
    open_ports = Column(String, nullable=True) # e.g. "80, 443, 22"
    services = Column(String, nullable=True)
    last_activity = Column(DateTime, default=datetime.datetime.utcnow)

class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    event_type = Column(String, nullable=False, index=True) # FAILED_LOGIN, PORT_SCAN, SUSPICIOUS_LOGIN, MALWARE_HASH, PHISHING_CLICK
    source_ip = Column(String, nullable=False)
    dest_ip = Column(String, nullable=False)
    user = Column(String, nullable=True)
    protocol = Column(String, default="TCP")
    port = Column(Integer, nullable=True)
    severity = Column(String, default="LOW") # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String, default="UNPROCESSED") # UNPROCESSED, PROCESSED, DETECTED
    description = Column(Text, nullable=False)
    raw_data = Column(Text, nullable=True)
    simulation_run_id = Column(Integer, nullable=True)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String, nullable=False) # BRUTE_FORCE, PORT_SCAN, SUSPICIOUS_LOGIN, PHISHING, MALWARE_INDICATOR
    severity = Column(String, default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    source_ip = Column(String, nullable=False)
    target_asset = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    description = Column(Text, nullable=False)
    detection_rule = Column(String, nullable=False)
    evidence_count = Column(Integer, default=1)
    status = Column(String, default="NEW") # NEW, ACKNOWLEDGED, INVESTIGATING, RESOLVED, FALSE_POSITIVE
    related_event_ids = Column(JSON, default=list) # List of int event IDs

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    severity = Column(String, default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL
    attack_type = Column(String, nullable=False)
    affected_asset = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    status = Column(String, default="NEW") # NEW, TRIAGING, INVESTIGATING, CONTAINED, RECOVERING, RESOLVED, CLOSED
    stage = Column(String, default="DETECT") # DETECT, TRIAGE, CONTAIN, INVESTIGATE, ERADICATE, RECOVER, LESSONS_LEARNED
    assigned_analyst = Column(String, default="analyst@cybershield.local")
    description = Column(Text, nullable=False)
    related_alerts = Column(JSON, default=list) # List of alert IDs
    evidence_ids = Column(JSON, default=list) # List of evidence IDs
    containment_action = Column(String, nullable=True)
    recovery_action = Column(String, nullable=True)
    resolution_notes = Column(Text, nullable=True)

    notes = relationship("IncidentNote", back_populates="incident", cascade="all, delete-orphan")

class IncidentNote(Base):
    __tablename__ = "incident_notes"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    author = Column(String, nullable=False)
    text = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    incident = relationship("Incident", back_populates="notes")

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    evidence_code = Column(String, unique=True, index=True, nullable=False) # e.g. EVD-1092
    title = Column(String, nullable=False)
    type = Column(String, nullable=False) # AUTH_LOG, NETWORK_PCAP, PROCESS_MEMORY, FILE_METADATA, BROWSER_HIST, SYSTEM_EVENT
    source = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    file_hash = Column(String, nullable=True) # SHA-256 / MD5
    description = Column(Text, nullable=False)
    raw_payload = Column(Text, nullable=True)
    related_incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    collection_status = Column(String, default="VERIFIED_SIMULATED")

class Vulnerability(Base):
    __tablename__ = "vulnerabilities"

    id = Column(Integer, primary_key=True, index=True)
    cve_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    asset_name = Column(String, nullable=False)
    severity = Column(String, default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL
    description = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=False)
    status = Column(String, default="OPEN") # OPEN, IN_PROGRESS, MITIGATED, RESOLVED

class PhishingSample(Base):
    __tablename__ = "phishing_samples"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, nullable=False)
    sender = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    risk_level = Column(String, default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL
    risk_score = Column(Integer, default=85) # 0 to 100
    indicators_json = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)
    analyzed_at = Column(DateTime, default=datetime.datetime.utcnow)

class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id = Column(Integer, primary_key=True, index=True)
    scenario_name = Column(String, nullable=False)
    status = Column(String, default="COMPLETED") # IN_PROGRESS, COMPLETED, FAILED
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    log_json = Column(JSON, default=list)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    user_email = Column(String, nullable=False)
    action = Column(String, nullable=False) # LOGIN, SIMULATION_START, ALERT_UPDATE, INCIDENT_CREATE, etc.
    resource = Column(String, nullable=False)
    ip_address = Column(String, default="127.0.0.1")
    result = Column(String, default="SUCCESS") # SUCCESS, DENIED, FAILED
    details = Column(Text, nullable=True)

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    report_code = Column(String, unique=True, nullable=False) # e.g. REP-2026-001
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    title = Column(String, nullable=False)
    generated_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    content_json = Column(JSON, nullable=False)
