import datetime
import random
import uuid
from sqlalchemy.orm import Session
from models import SecurityEvent, Alert, Incident, Evidence, SimulationRun, AuditLog, LabAsset
from detection_engine import evaluate_detection_rules

# Private simulated lab IPs
ATTACKER_IP = "192.168.10.55"
TARGET_WEB_IP = "192.168.10.10" # LAB-WEB-01
TARGET_AUTH_IP = "192.168.10.20" # LAB-AUTH-01
TARGET_DB_IP = "192.168.10.30" # LAB-DB-01
TARGET_PC_IP = "192.168.10.40" # LAB-PC-01

def simulate_brute_force(db: Session, run_id: int = None) -> dict:
    """Simulates 6 failed login attempts followed by detection & alert generation."""
    events_created = []
    timestamp = datetime.datetime.utcnow()

    users = ["admin", "root", "analyst", "service_acct", "sysadmin", "admin"]
    for i, user in enumerate(users):
        t = timestamp + datetime.timedelta(seconds=i * 2)
        ev = SecurityEvent(
            timestamp=t,
            event_type="FAILED_LOGIN",
            source_ip=ATTACKER_IP,
            dest_ip=TARGET_AUTH_IP,
            user=user,
            protocol="SSH",
            port=22,
            severity="MEDIUM",
            status="UNPROCESSED",
            description=f"SIMULATED: Failed SSH password attempt for user '{user}' from {ATTACKER_IP} port {49000 + i}",
            raw_data=f"Oct 03 {t.strftime('%H:%M:%S')} LAB-AUTH-01 sshd[{1200+i}]: Failed password for {user} from {ATTACKER_IP} port {49000+i} ssh2",
            simulation_run_id=run_id
        )
        db.add(ev)
        events_created.append(ev)

    db.commit()

    # Trigger detection engine
    alerts = evaluate_detection_rules(db)

    # Create synthetic evidence
    evd_code = f"EVD-{random.randint(1000, 9999)}"
    evidence = Evidence(
        evidence_code=evd_code,
        title="Authentication Audit Log Dump",
        type="AUTH_LOG",
        source="LAB-AUTH-01 /var/log/auth.log",
        timestamp=datetime.datetime.utcnow(),
        file_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        description=f"Extracted SSH auth failure log containing {len(events_created)} rapid brute-force attempts from IP {ATTACKER_IP}.",
        raw_payload="\n".join([e.raw_data for e in events_created]),
        collection_status="VERIFIED_SIMULATED"
    )
    db.add(evidence)
    db.commit()

    return {
        "simulation": "Brute Force Attack",
        "events_count": len(events_created),
        "alerts_generated": len(alerts),
        "alert_ids": [a.id for a in alerts],
        "evidence_code": evd_code
    }

def simulate_port_scan(db: Session, run_id: int = None) -> dict:
    """Simulates multi-port network reconnaissance scan."""
    events_created = []
    timestamp = datetime.datetime.utcnow()
    target_ports = [21, 22, 80, 443, 1433, 3306, 8080]

    for i, port in enumerate(target_ports):
        t = timestamp + datetime.timedelta(seconds=i)
        ev = SecurityEvent(
            timestamp=t,
            event_type="PORT_SCAN",
            source_ip=ATTACKER_IP,
            dest_ip=TARGET_WEB_IP,
            user=None,
            protocol="TCP SYN",
            port=port,
            severity="LOW",
            status="UNPROCESSED",
            description=f"SIMULATED: TCP SYN probe detected from {ATTACKER_IP} to port {port} on LAB-WEB-01",
            raw_data=f"Oct 03 {t.strftime('%H:%M:%S')} LAB-FW-01 kernel: [SYN_SCAN] IN=eth0 OUT= SRC={ATTACKER_IP} DST={TARGET_WEB_IP} PROTO=TCP SPT={52000+i} DPT={port} FLAGS=SYN",
            simulation_run_id=run_id
        )
        db.add(ev)
        events_created.append(ev)

    db.commit()
    alerts = evaluate_detection_rules(db)

    evd_code = f"EVD-{random.randint(1000, 9999)}"
    evidence = Evidence(
        evidence_code=evd_code,
        title="Firewall Network PCAP Summary",
        type="NETWORK_PCAP",
        source="LAB-FW-01 Firewall Packet Capture",
        timestamp=datetime.datetime.utcnow(),
        file_hash="a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
        description=f"SYN scan sequence targeting web server ports 21-8080 originating from lab subnet IP {ATTACKER_IP}.",
        raw_payload="\n".join([e.raw_data for e in events_created]),
        collection_status="VERIFIED_SIMULATED"
    )
    db.add(evidence)
    db.commit()

    return {
        "simulation": "Network Reconnaissance (Port Scan)",
        "events_count": len(events_created),
        "alerts_generated": len(alerts),
        "alert_ids": [a.id for a in alerts],
        "evidence_code": evd_code
    }

def simulate_phishing(db: Session, run_id: int = None) -> dict:
    """Simulates a phishing email interaction."""
    timestamp = datetime.datetime.utcnow()
    ev = SecurityEvent(
        timestamp=timestamp,
        event_type="PHISHING_CLICK",
        source_ip="192.168.10.105", # Simulated external phishing relay IP
        dest_ip=TARGET_PC_IP,
        user="john.doe@cybershield.local",
        protocol="HTTPS",
        port=443,
        severity="HIGH",
        status="UNPROCESSED",
        description="SIMULATED: User clicked link in suspicious email 'Urgent: Password Expiration Notice' leading to phishing domain 'http://auth-update-cybershield.net/login'",
        raw_data="[HTTP_CLIENT_LOG] GET http://auth-update-cybershield.net/login User-Agent: Mozilla/5.0 Client-IP: 192.168.10.40 Referrer: webmail.cybershield.local",
        simulation_run_id=run_id
    )
    db.add(ev)
    db.commit()

    alerts = evaluate_detection_rules(db)

    evd_code = f"EVD-{random.randint(1000, 9999)}"
    evidence = Evidence(
        evidence_code=evd_code,
        title="Browser Cache & URL Request Logs",
        type="BROWSER_HIST",
        source="LAB-PC-01 Chrome History Export",
        timestamp=datetime.datetime.utcnow(),
        file_hash="9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
        description="Browser history artifact confirming HTTP GET request to fake login page auth-update-cybershield.net.",
        raw_payload=ev.raw_data,
        collection_status="VERIFIED_SIMULATED"
    )
    db.add(evidence)
    db.commit()

    return {
        "simulation": "Phishing Simulation",
        "events_count": 1,
        "alerts_generated": len(alerts),
        "alert_ids": [a.id for a in alerts],
        "evidence_code": evd_code
    }

def simulate_suspicious_login(db: Session, run_id: int = None) -> dict:
    """Simulates an anomalous login from an unusual IP."""
    timestamp = datetime.datetime.utcnow()
    ev = SecurityEvent(
        timestamp=timestamp,
        event_type="SUSPICIOUS_LOGIN",
        source_ip=ATTACKER_IP,
        dest_ip=TARGET_DB_IP,
        user="db_admin@cybershield.local",
        protocol="RDP",
        port=3389,
        severity="HIGH",
        status="UNPROCESSED",
        description="SIMULATED: Successful RDP session established for user 'db_admin' from anomalous IP 192.168.10.55 at non-standard business hours.",
        raw_data="Oct 03 14:02:11 LAB-DB-01 Microsoft-Windows-TerminalServices-LocalSessionManager/Operational: User db_admin session 2 connected from 192.168.10.55",
        simulation_run_id=run_id
    )
    db.add(ev)
    db.commit()

    alerts = evaluate_detection_rules(db)

    evd_code = f"EVD-{random.randint(1000, 9999)}"
    evidence = Evidence(
        evidence_code=evd_code,
        title="Windows RDP Terminal Services Event Log",
        type="SYSTEM_EVENT",
        source="LAB-DB-01 Windows Event Viewer",
        timestamp=datetime.datetime.utcnow(),
        file_hash="c4ca4238a0b923820dcc509a6f75849b2862da42d2a4561081a95e263d84f884",
        description="Event ID 21: Remote Desktop Services: Session login verification artifact.",
        raw_payload=ev.raw_data,
        collection_status="VERIFIED_SIMULATED"
    )
    db.add(evidence)
    db.commit()

    return {
        "simulation": "Suspicious Login Anomaly",
        "events_count": 1,
        "alerts_generated": len(alerts),
        "alert_ids": [a.id for a in alerts],
        "evidence_code": evd_code
    }

def simulate_malware_indicator(db: Session, run_id: int = None) -> dict:
    """Simulates synthetic malware indicator detection."""
    timestamp = datetime.datetime.utcnow()
    ev = SecurityEvent(
        timestamp=timestamp,
        event_type="MALWARE_HASH",
        source_ip=TARGET_PC_IP,
        dest_ip=TARGET_PC_IP,
        user="alice.smith@cybershield.local",
        protocol="LOCAL_FS",
        port=0,
        severity="CRITICAL",
        status="UNPROCESSED",
        description="SIMULATED: Endpoint Protection flagged suspicious file 'invoice_update.exe' (Hash: 44d88612fea8a8f36de82e1278abb02f) creating process svchost_fake.exe",
        raw_data="[EDR_ALERT] Process Creation: C:\\Users\\alice\\Downloads\\invoice_update.exe -> PID 4912 svchost_fake.exe Hash: 44d88612fea8a8f36de82e1278abb02f Action: Terminated",
        simulation_run_id=run_id
    )
    db.add(ev)
    db.commit()

    alerts = evaluate_detection_rules(db)

    evd_code = f"EVD-{random.randint(1000, 9999)}"
    evidence = Evidence(
        evidence_code=evd_code,
        title="Endpoint EDR Process Tree Memory Dump",
        type="PROCESS_MEMORY",
        source="LAB-PC-01 Sentinel EDR Monitor",
        timestamp=datetime.datetime.utcnow(),
        file_hash="44d88612fea8a8f36de82e1278abb02f",
        description="EDR forensic dump detailing process creation of invoice_update.exe and attempted registry persistence key creation.",
        raw_payload=ev.raw_data,
        collection_status="VERIFIED_SIMULATED"
    )
    db.add(evidence)
    db.commit()

    return {
        "simulation": "Malware Indicator Investigation",
        "events_count": 1,
        "alerts_generated": len(alerts),
        "alert_ids": [a.id for a in alerts],
        "evidence_code": evd_code
    }

def run_attack_scenario(db: Session, scenario_key: str, user_email: str) -> dict:
    """
    Executes a complete cybersecurity scenario end-to-end:
    Simulate Events -> Detect -> Alert -> Create Incident -> Gather Evidence -> Contain -> Resolve.
    """
    started_at = datetime.datetime.utcnow()
    sim_run = SimulationRun(
        scenario_name=scenario_key,
        status="IN_PROGRESS",
        started_at=started_at,
        log_json=[]
    )
    db.add(sim_run)
    db.commit()
    db.refresh(sim_run)

    logs = []

    def log_step(msg: str):
        entry = {"time": datetime.datetime.utcnow().strftime("%H:%M:%S"), "message": msg}
        logs.append(entry)

    log_step(f"Initializing Scenario: {scenario_key}...")

    # Execute specific scenario logic
    if scenario_key == "phishing_to_login":
        log_step("Step 1: Simulating Phishing Email Interaction on LAB-PC-01...")
        res_phish = simulate_phishing(db, run_id=sim_run.id)
        log_step(f"Step 2: Phishing event generated. Alerts triggered: {res_phish['alert_ids']}")

        log_step("Step 3: Simulating Suspicious Login with Stolen Credentials...")
        res_login = simulate_suspicious_login(db, run_id=sim_run.id)
        log_step(f"Step 4: Suspicious Login event generated. Alerts triggered: {res_login['alert_ids']}")

        # Auto-create Incident
        all_alert_ids = res_phish['alert_ids'] + res_login['alert_ids']
        inc = Incident(
            title="Credential Harvest & Unintended Remote Access Incident",
            severity="CRITICAL",
            attack_type="Phishing & Account Compromise",
            affected_asset="LAB-DB-01",
            created_at=datetime.datetime.utcnow(),
            status="INVESTIGATING",
            stage="CONTAIN",
            assigned_analyst=user_email,
            description="Phishing email payload lured victim into providing credentials, followed by immediate unauthorized RDP connection to database server.",
            related_alerts=all_alert_ids,
            evidence_ids=[res_phish['evidence_code'], res_login['evidence_code']],
            containment_action="Simulated Account Revocation & Session Termination",
            recovery_action="Mandatory Password Reset & MFA Enforcement",
            resolution_notes="Incident fully contained. Malicious session terminated and victim account secured."
        )
        db.add(inc)
        db.commit()
        db.refresh(inc)

        log_step(f"Step 5: Automated Incident #{inc.id} created & escalated to SOC Analyst.")
        log_step("Step 6: Digital Forensics evidence artifacts compiled.")
        log_step("Step 7: Automated containment executed: Revoked compromised credentials.")
        log_step("Step 8: Incident marked CONTAINED -> RECOVERED -> RESOLVED.")

        inc.status = "RESOLVED"
        inc.stage = "LESSONS_LEARNED"
        db.commit()

    elif scenario_key == "brute_force":
        log_step("Step 1: Initiating High-Frequency SSH Password Probing...")
        res_bf = simulate_brute_force(db, run_id=sim_run.id)
        log_step(f"Step 2: Generated {res_bf['events_count']} auth failure events.")
        log_step(f"Step 3: Detection Engine threshold exceeded (>5 failures). Created Alert IDs: {res_bf['alert_ids']}")

        inc = Incident(
            title="SSH Automated Brute-Force Password Spraying Attack",
            severity="HIGH",
            attack_type="Brute Force",
            affected_asset="LAB-AUTH-01",
            created_at=datetime.datetime.utcnow(),
            status="RESOLVED",
            stage="LESSONS_LEARNED",
            assigned_analyst=user_email,
            description="Repeated failed password attempts detected from external lab IP 192.168.10.55 targeting LAB-AUTH-01 SSH port.",
            related_alerts=res_bf['alert_ids'],
            evidence_ids=[res_bf['evidence_code']],
            containment_action="Simulated Firewall Drop Rule added for 192.168.10.55",
            recovery_action="Fail2ban rule deployed; SSH password auth disabled in favor of key-based auth.",
            resolution_notes="Attacker IP blocked. No compromised accounts detected."
        )
        db.add(inc)
        db.commit()
        db.refresh(inc)

        log_step(f"Step 4: Incident #{inc.id} created and automatically contained via Firewall Block.")

    elif scenario_key == "network_recon":
        log_step("Step 1: Launching Synthetic Port Scan against LAB-WEB-01...")
        res_ps = simulate_port_scan(db, run_id=sim_run.id)
        log_step(f"Step 2: Probed 7 distinct ports (21-8080). Alerts generated: {res_ps['alert_ids']}")

        inc = Incident(
            title="Multi-Port Network Reconnaissance & Service Discovery",
            severity="MEDIUM",
            attack_type="Port Scan",
            affected_asset="LAB-WEB-01",
            created_at=datetime.datetime.utcnow(),
            status="RESOLVED",
            stage="LESSONS_LEARNED",
            assigned_analyst=user_email,
            description="Reconnaissance scan detected from source 192.168.10.55 probing internal server services.",
            related_alerts=res_ps['alert_ids'],
            evidence_ids=[res_ps['evidence_code']],
            containment_action="Simulated Rate-limiting & IDS IP Blacklist",
            recovery_action="Closed unnecessary open port 21 (FTP)",
            resolution_notes="Reconnaissance blocked. Ports hardened."
        )
        db.add(inc)
        db.commit()
        db.refresh(inc)

        log_step(f"Step 3: Port scan contained. Incident #{inc.id} updated to RESOLVED.")

    elif scenario_key == "suspicious_login":
        log_step("Step 1: Simulating Anomaly Login Event...")
        res_sl = simulate_suspicious_login(db, run_id=sim_run.id)
        log_step(f"Step 2: Suspicious login alert generated: {res_sl['alert_ids']}")

        inc = Incident(
            title="Unusual Off-Hours Remote Administration Session",
            severity="HIGH",
            attack_type="Suspicious Login",
            affected_asset="LAB-DB-01",
            created_at=datetime.datetime.utcnow(),
            status="RESOLVED",
            stage="LESSONS_LEARNED",
            assigned_analyst=user_email,
            description="Anomalous login flagged on database server LAB-DB-01.",
            related_alerts=res_sl['alert_ids'],
            evidence_ids=[res_sl['evidence_code']],
            containment_action="Terminated Active RDP Session",
            recovery_action="Enforced IP Whitelisting for RDP access.",
            resolution_notes="Session killed and user identity re-authenticated."
        )
        db.add(inc)
        db.commit()
        db.refresh(inc)

        log_step(f"Step 3: Session terminated. Incident #{inc.id} resolved.")

    elif scenario_key == "malware_indicator":
        log_step("Step 1: Simulating EDR Malware Execution Indicator...")
        res_mw = simulate_malware_indicator(db, run_id=sim_run.id)
        log_step(f"Step 2: EDR Critical alert generated: {res_mw['alert_ids']}")

        inc = Incident(
            title="Malicious Executable Process Execution & Hash Match",
            severity="CRITICAL",
            attack_type="Malware Indicator",
            affected_asset="LAB-PC-01",
            created_at=datetime.datetime.utcnow(),
            status="RESOLVED",
            stage="LESSONS_LEARNED",
            assigned_analyst=user_email,
            description="Synthetic suspicious binary hash detected attempting svchost injection.",
            related_alerts=res_mw['alert_ids'],
            evidence_ids=[res_mw['evidence_code']],
            containment_action="Simulated Host Network Isolation & Process Kill",
            recovery_action="Antivirus signature update & host disk remediation scan",
            resolution_notes="Process killed, binary deleted, host restored."
        )
        db.add(inc)
        db.commit()
        db.refresh(inc)

        log_step(f"Step 3: Malicious process terminated. Host isolated. Incident #{inc.id} resolved.")

    sim_run.status = "COMPLETED"
    sim_run.completed_at = datetime.datetime.utcnow()
    sim_run.log_json = logs
    db.commit()

    # Create Audit Log
    audit = AuditLog(
        timestamp=datetime.datetime.utcnow(),
        user_email=user_email,
        action="RUN_ATTACK_SCENARIO",
        resource=f"Scenario:{scenario_key}",
        result="SUCCESS",
        details=f"Ran complete scenario {scenario_key}. Generated events, alerts, evidence and incident #{inc.id}."
    )
    db.add(audit)
    db.commit()

    return {
        "scenario_key": scenario_key,
        "run_id": sim_run.id,
        "status": "COMPLETED",
        "incident_id": inc.id,
        "logs": logs
    }
