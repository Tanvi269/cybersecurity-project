import datetime
from typing import List, Optional, Any, Dict
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import engine, Base, get_db
from models import (
    User, LabAsset, SecurityEvent, Alert, Incident, IncidentNote,
    Evidence, Vulnerability, PhishingSample, SimulationRun, AuditLog, Report
)
from auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, require_role
)
from detection_engine import evaluate_detection_rules
from attack_simulator import (
    simulate_brute_force, simulate_port_scan, simulate_phishing,
    simulate_suspicious_login, simulate_malware_indicator, run_attack_scenario
)
from phishing_analyzer import analyze_phishing_email
from seed_data import seed_database

# Initialize database schema and seed data
Base.metadata.create_all(bind=engine)
seed_database()

app = FastAPI(
    title="CyberShield SOC & Cybersecurity Simulation API",
    description="Academic Laboratory SOC Platform for Attack Simulation, Threat Detection & Digital Forensics.",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------
# PYDANTIC SCHEMAS
# ------------------------------------------------------------------

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: Optional[str] = "SECURITY_ANALYST"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class AlertStatusUpdate(BaseModel):
    status: str # NEW, ACKNOWLEDGED, INVESTIGATING, RESOLVED, FALSE_POSITIVE

class IncidentCreate(BaseModel):
    title: str
    severity: str
    attack_type: str
    affected_asset: str
    description: str
    related_alerts: Optional[List[int]] = []
    assigned_analyst: Optional[str] = "analyst@cybershield.local"

class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    stage: Optional[str] = None
    assigned_analyst: Optional[str] = None
    containment_action: Optional[str] = None
    recovery_action: Optional[str] = None
    resolution_notes: Optional[str] = None

class IncidentNoteCreate(BaseModel):
    text: str

class PhishingAnalysisRequest(BaseModel):
    sender: str
    subject: str
    body: str
    raw_url: Optional[str] = ""

class SimulationStartRequest(BaseModel):
    attack_type: str # brute_force, port_scan, phishing, suspicious_login, malware_indicator

class ScenarioRunRequest(BaseModel):
    scenario_key: str # phishing_to_login, brute_force, network_recon, suspicious_login, malware_indicator

class IRActionRequest(BaseModel):
    incident_id: int
    action_type: str # block_ip, isolate_asset, revoke_credentials, kill_process
    target: str

class ReportCreateRequest(BaseModel):
    incident_id: int
    title: Optional[str] = None

# Helper to log audit actions
def create_audit(db: Session, user_email: str, action: str, resource: str, result: str = "SUCCESS", details: str = ""):
    log = AuditLog(
        timestamp=datetime.datetime.utcnow(),
        user_email=user_email,
        action=action,
        resource=resource,
        result=result,
        details=details
    )
    db.add(log)
    db.commit()

# ------------------------------------------------------------------
# 1. AUTHENTICATION ROUTER
# ------------------------------------------------------------------

@app.post("/api/auth/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User email already registered")

    user = User(
        email=req.email,
        hashed_password=hash_password(req.password),
        full_name=req.full_name,
        role=req.role or "SECURITY_ANALYST",
        created_at=datetime.datetime.utcnow()
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    create_audit(db, user.email, "USER_REGISTER", f"User:{user.email}")
    token = create_access_token({"sub": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"email": user.email, "full_name": user.full_name, "role": user.role}
    }

@app.post("/api/auth/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        create_audit(db, req.email, "USER_LOGIN_FAILED", "Auth", result="FAILED", details="Invalid credentials")
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.email, "role": user.role})
    create_audit(db, user.email, "USER_LOGIN", f"User:{user.email}")
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"email": user.email, "full_name": user.full_name, "role": user.role}
    }

@app.get("/api/auth/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "created_at": current_user.created_at
    }

# ------------------------------------------------------------------
# 2. SOC DASHBOARD METRICS & CHARTS
# ------------------------------------------------------------------

@app.get("/api/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_events = db.query(SecurityEvent).count()
    critical_alerts = db.query(Alert).filter(Alert.severity == "CRITICAL").count()
    high_alerts = db.query(Alert).filter(Alert.severity == "HIGH").count()
    total_alerts = db.query(Alert).count()

    active_incidents = db.query(Incident).filter(Incident.status.in_(["NEW", "TRIAGING", "INVESTIGATING", "CONTAINED"])).count()
    resolved_incidents = db.query(Incident).filter(Incident.status.in_(["RESOLVED", "CLOSED"])).count()
    total_simulations = db.query(SimulationRun).count()

    suspicious_ips = db.query(SecurityEvent.source_ip).distinct().count()
    open_vulnerabilities = db.query(Vulnerability).filter(Vulnerability.status == "OPEN").count()

    # Alerts by severity breakdown
    severity_breakdown = {
        "CRITICAL": db.query(Alert).filter(Alert.severity == "CRITICAL").count(),
        "HIGH": db.query(Alert).filter(Alert.severity == "HIGH").count(),
        "MEDIUM": db.query(Alert).filter(Alert.severity == "MEDIUM").count(),
        "LOW": db.query(Alert).filter(Alert.severity == "LOW").count(),
    }

    # Attacks by type breakdown
    attacks_by_type = {}
    alert_types = db.query(Alert.alert_type, func.count(Alert.id)).group_by(Alert.alert_type).all()
    for atype, count in alert_types:
        attacks_by_type[atype] = count

    # Incident status breakdown
    incident_status_breakdown = {}
    status_counts = db.query(Incident.status, func.count(Incident.id)).group_by(Incident.status).all()
    for st, count in status_counts:
        incident_status_breakdown[st] = count

    # Most targeted assets
    targeted_assets = []
    asset_counts = db.query(Alert.target_asset, func.count(Alert.id)).group_by(Alert.target_asset).all()
    for name, count in asset_counts:
        targeted_assets.append({"asset": name, "alerts": count})

    # Recent Alerts & Incidents
    recent_alerts = db.query(Alert).order_by(Alert.timestamp.desc()).limit(5).all()
    recent_incidents = db.query(Incident).order_by(Incident.created_at.desc()).limit(5).all()

    return {
        "total_events": total_events,
        "total_alerts": total_alerts,
        "critical_alerts": critical_alerts,
        "high_alerts": high_alerts,
        "active_incidents": active_incidents,
        "resolved_incidents": resolved_incidents,
        "total_simulations": total_simulations,
        "suspicious_ips": suspicious_ips,
        "open_vulnerabilities": open_vulnerabilities,
        "severity_breakdown": severity_breakdown,
        "attacks_by_type": attacks_by_type,
        "incident_status_breakdown": incident_status_breakdown,
        "targeted_assets": targeted_assets,
        "recent_alerts": recent_alerts,
        "recent_incidents": recent_incidents
    }

# ------------------------------------------------------------------
# 3. LAB ASSETS
# ------------------------------------------------------------------

@app.get("/api/assets")
def get_assets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(LabAsset).all()

@app.get("/api/assets/{asset_id}")
def get_asset_detail(asset_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    asset = db.query(LabAsset).filter(LabAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Lab asset not found")
    vulns = db.query(Vulnerability).filter(Vulnerability.asset_name == asset.name).all()
    alerts = db.query(Alert).filter(Alert.target_asset == asset.name).all()
    return {"asset": asset, "vulnerabilities": vulns, "alerts": alerts}

# ------------------------------------------------------------------
# 4. SECURITY EVENTS LOG
# ------------------------------------------------------------------

@app.get("/api/events")
def get_events(
    event_type: Optional[str] = None,
    severity: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(SecurityEvent)
    if event_type:
        query = query.filter(SecurityEvent.event_type == event_type)
    if severity:
        query = query.filter(SecurityEvent.severity == severity)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (SecurityEvent.source_ip.like(s)) |
            (SecurityEvent.dest_ip.like(s)) |
            (SecurityEvent.description.like(s)) |
            (SecurityEvent.user.like(s))
        )
    return query.order_by(SecurityEvent.timestamp.desc()).limit(limit).all()

@app.get("/api/events/{event_id}")
def get_event_detail(event_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ev = db.query(SecurityEvent).filter(SecurityEvent.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Security event not found")
    return ev

# ------------------------------------------------------------------
# 5. ALERTS MANAGEMENT
# ------------------------------------------------------------------

@app.get("/api/alerts")
def get_alerts(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Alert)
    if status:
        query = query.filter(Alert.status == status)
    if severity:
        query = query.filter(Alert.severity == severity)
    return query.order_by(Alert.timestamp.desc()).all()

@app.get("/api/alerts/{alert_id}")
def get_alert_detail(alert_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    related_events = []
    if alert.related_event_ids:
        related_events = db.query(SecurityEvent).filter(SecurityEvent.id.in_(alert.related_event_ids)).all()

    return {"alert": alert, "related_events": related_events}

@app.patch("/api/alerts/{alert_id}")
def update_alert_status(alert_id: int, req: AlertStatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = req.status
    db.commit()
    db.refresh(alert)
    create_audit(db, current_user.email, "ALERT_STATUS_UPDATE", f"Alert:{alert_id}", details=f"New status: {req.status}")
    return alert

# ------------------------------------------------------------------
# 6. INCIDENT MANAGEMENT
# ------------------------------------------------------------------

@app.get("/api/incidents")
def get_incidents(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Incident)
    if status:
        query = query.filter(Incident.status == status)
    if severity:
        query = query.filter(Incident.severity == severity)
    return query.order_by(Incident.created_at.desc()).all()

@app.post("/api/incidents")
def create_incident(req: IncidentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    inc = Incident(
        title=req.title,
        severity=req.severity,
        attack_type=req.attack_type,
        affected_asset=req.affected_asset,
        description=req.description,
        related_alerts=req.related_alerts or [],
        assigned_analyst=req.assigned_analyst or current_user.email,
        status="NEW",
        stage="TRIAGE",
        created_at=datetime.datetime.utcnow()
    )
    db.add(inc)
    db.commit()
    db.refresh(inc)

    # Link related alerts if any
    if req.related_alerts:
        alerts = db.query(Alert).filter(Alert.id.in_(req.related_alerts)).all()
        for a in alerts:
            a.status = "INVESTIGATING"
        db.commit()

    create_audit(db, current_user.email, "INCIDENT_CREATE", f"Incident:{inc.id}", details=f"Title: {inc.title}")
    return inc

@app.get("/api/incidents/{incident_id}")
def get_incident_detail(incident_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    notes = db.query(IncidentNote).filter(IncidentNote.incident_id == incident_id).order_by(IncidentNote.timestamp.asc()).all()
    related_alerts = []
    if inc.related_alerts:
        related_alerts = db.query(Alert).filter(Alert.id.in_(inc.related_alerts)).all()

    evidence_items = []
    if inc.evidence_ids:
        evidence_items = db.query(Evidence).filter(Evidence.evidence_code.in_(inc.evidence_ids)).all()

    return {
        "incident": inc,
        "notes": notes,
        "related_alerts": related_alerts,
        "evidence_items": evidence_items
    }

@app.patch("/api/incidents/{incident_id}")
def update_incident(incident_id: int, req: IncidentUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    if req.status:
        inc.status = req.status
    if req.stage:
        inc.stage = req.stage
    if req.assigned_analyst:
        inc.assigned_analyst = req.assigned_analyst
    if req.containment_action:
        inc.containment_action = req.containment_action
    if req.recovery_action:
        inc.recovery_action = req.recovery_action
    if req.resolution_notes:
        inc.resolution_notes = req.resolution_notes

    inc.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(inc)

    create_audit(db, current_user.email, "INCIDENT_UPDATE", f"Incident:{incident_id}", details=f"Updated status: {inc.status}, stage: {inc.stage}")
    return inc

@app.post("/api/incidents/{incident_id}/notes")
def add_incident_note(incident_id: int, req: IncidentNoteCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    note = IncidentNote(
        incident_id=incident_id,
        author=current_user.email,
        text=req.text,
        timestamp=datetime.datetime.utcnow()
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    create_audit(db, current_user.email, "INCIDENT_NOTE_ADD", f"Incident:{incident_id}")
    return note

# ------------------------------------------------------------------
# 7. DIGITAL FORENSICS & EVIDENCE REPOSITORY
# ------------------------------------------------------------------

@app.get("/api/evidence")
def get_evidence_repository(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Evidence).order_by(Evidence.timestamp.desc()).all()

@app.get("/api/evidence/{evidence_id}")
def get_evidence_detail(evidence_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    evd = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evd:
        raise HTTPException(status_code=404, detail="Evidence item not found")
    create_audit(db, current_user.email, "EVIDENCE_VIEW", f"Evidence:{evd.evidence_code}")
    return evd

# ------------------------------------------------------------------
# 8. VULNERABILITY ASSESSMENT
# ------------------------------------------------------------------

@app.get("/api/vulnerabilities")
def get_vulnerabilities(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    create_audit(db, current_user.email, "VULNERABILITIES_VIEW", "LabAssets")
    return db.query(Vulnerability).all()

# ------------------------------------------------------------------
# 9. PHISHING EMAIL ANALYZER
# ------------------------------------------------------------------

@app.post("/api/phishing/analyze")
def analyze_phishing(req: PhishingAnalysisRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = analyze_phishing_email(sender=req.sender, subject=req.subject, body=req.body, raw_url=req.raw_url)

    # Save to history DB
    sample = PhishingSample(
        subject=req.subject,
        sender=req.sender,
        body=req.body,
        risk_level=result["risk_level"],
        risk_score=result["risk_score"],
        indicators_json=result["indicators"],
        recommendations=result["recommendations"],
        analyzed_at=datetime.datetime.utcnow()
    )
    db.add(sample)
    db.commit()

    create_audit(db, current_user.email, "PHISHING_ANALYZE", f"Sample:{req.sender}", details=f"Risk: {result['risk_level']}")
    return result

# ------------------------------------------------------------------
# 10. ATTACK SIMULATION & SCENARIO ENGINE
# ------------------------------------------------------------------

@app.get("/api/simulations")
def get_simulations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(SimulationRun).order_by(SimulationRun.started_at.desc()).all()

@app.post("/api/simulations/start")
def start_individual_simulation(req: SimulationStartRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    stype = req.attack_type.lower()
    run = SimulationRun(
        scenario_name=f"Single Attack: {req.attack_type.upper()}",
        status="COMPLETED",
        started_at=datetime.datetime.utcnow(),
        completed_at=datetime.datetime.utcnow()
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    if stype == "brute_force":
        res = simulate_brute_force(db, run_id=run.id)
    elif stype == "port_scan":
        res = simulate_port_scan(db, run_id=run.id)
    elif stype == "phishing":
        res = simulate_phishing(db, run_id=run.id)
    elif stype == "suspicious_login":
        res = simulate_suspicious_login(db, run_id=run.id)
    elif stype == "malware_indicator":
        res = simulate_malware_indicator(db, run_id=run.id)
    else:
        raise HTTPException(status_code=400, detail="Unsupported attack type")

    create_audit(db, current_user.email, "SIMULATION_RUN", f"AttackType:{req.attack_type}")
    return res

@app.post("/api/simulations/scenarios/run")
def start_scenario_run(req: ScenarioRunRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = run_attack_scenario(db, scenario_key=req.scenario_key, user_email=current_user.email)
    return result

# ------------------------------------------------------------------
# 11. INCIDENT RESPONSE WORKFLOW & SIMULATED ACTIONS
# ------------------------------------------------------------------

@app.post("/api/incident-response/action")
def execute_ir_action(req: IRActionRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    inc = db.query(Incident).filter(Incident.id == req.incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    action_summary = ""
    if req.action_type == "block_ip":
        action_summary = f"Simulated Firewall Block Rule added for IP {req.target}."
        inc.containment_action = action_summary
        inc.stage = "CONTAIN"
    elif req.action_type == "isolate_asset":
        action_summary = f"Simulated Host Isolation initiated for Asset {req.target}."
        inc.containment_action = action_summary
        inc.stage = "CONTAIN"
        asset = db.query(LabAsset).filter(LabAsset.name == req.target).first()
        if asset:
            asset.status = "ISOLATED"
    elif req.action_type == "revoke_credentials":
        action_summary = f"Simulated Active Directory Credential Revocation executed for User {req.target}."
        inc.containment_action = action_summary
        inc.stage = "CONTAIN"
    elif req.action_type == "kill_process":
        action_summary = f"Simulated EDR Agent Process Termination executed for Process {req.target}."
        inc.containment_action = action_summary
        inc.stage = "ERADICATE"

    inc.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(inc)

    create_audit(db, current_user.email, "IR_ACTION_EXECUTE", f"Incident:{inc.id}", details=action_summary)
    return {
        "status": "COMPLETED",
        "action_type": req.action_type,
        "target": req.target,
        "summary": action_summary,
        "incident_stage": inc.stage
    }

# ------------------------------------------------------------------
# 12. SECURITY REPORT GENERATOR
# ------------------------------------------------------------------

@app.get("/api/reports")
def get_reports(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Report).order_by(Report.created_at.desc()).all()

@app.post("/api/reports")
def generate_security_report(req: ReportCreateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    inc = db.query(Incident).filter(Incident.id == req.incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    rep_code = f"REP-2026-{inc.id:03d}"
    title = req.title or f"CYBERSHIELD INCIDENT REPORT: {inc.title}"

    # Gather related artifacts
    related_alerts = []
    if inc.related_alerts:
        related_alerts = db.query(Alert).filter(Alert.id.in_(inc.related_alerts)).all()

    evidence_items = []
    if inc.evidence_ids:
        evidence_items = db.query(Evidence).filter(Evidence.evidence_code.in_(inc.evidence_ids)).all()

    notes = db.query(IncidentNote).filter(IncidentNote.incident_id == inc.id).all()

    content = {
        "report_title": title,
        "incident_id": inc.id,
        "incident_title": inc.title,
        "attack_type": inc.attack_type,
        "severity": inc.severity,
        "affected_asset": inc.affected_asset,
        "assigned_analyst": inc.assigned_analyst,
        "created_at": inc.created_at.isoformat(),
        "status": inc.status,
        "description": inc.description,
        "alerts_count": len(related_alerts),
        "alerts_summary": [{"id": a.id, "type": a.alert_type, "rule": a.detection_rule, "severity": a.severity} for a in related_alerts],
        "evidence_summary": [{"code": e.evidence_code, "type": e.type, "source": e.source, "hash": e.file_hash} for e in evidence_items],
        "containment_action": inc.containment_action or "Simulated Firewall IP Drop and credential revocation.",
        "recovery_action": inc.recovery_action or "System patch deployment & active session monitor.",
        "resolution_notes": inc.resolution_notes or "Incident fully contained in simulated laboratory environment.",
        "investigation_notes": [n.text for n in notes]
    }

    report = Report(
        report_code=rep_code,
        incident_id=inc.id,
        title=title,
        generated_by=current_user.email,
        created_at=datetime.datetime.utcnow(),
        content_json=content
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    create_audit(db, current_user.email, "REPORT_GENERATED", f"Report:{rep_code}")
    return report

@app.get("/api/reports/{report_id}")
def get_report_detail(report_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rep = db.query(Report).filter(Report.id == report_id).first()
    if not rep:
        raise HTTPException(status_code=404, detail="Report not found")
    return rep

# ------------------------------------------------------------------
# 13. AUDIT LOGS
# ------------------------------------------------------------------

@app.get("/api/audit-logs")
def get_audit_logs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(150).all()
