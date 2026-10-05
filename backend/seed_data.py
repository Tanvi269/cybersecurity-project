import datetime
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
from models import (
    User, LabAsset, SecurityEvent, Alert, Incident, IncidentNote,
    Evidence, Vulnerability, PhishingSample, AuditLog, Report
)
from auth import hash_password

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # 1. Check if seeded
    if db.query(User).filter(User.email == "admin@cybershield.local").first():
        db.close()
        return

    print("[CYBERSHIELD] Seeding initial lab database...")

    # 2. Lab Users
    admin_user = User(
        email="admin@cybershield.local",
        hashed_password=hash_password("CyberShield2026!"),
        full_name="SOC Lead Administrator",
        role="ADMIN",
        created_at=datetime.datetime.utcnow()
    )
    analyst_user = User(
        email="analyst@cybershield.local",
        hashed_password=hash_password("AnalystPass2026!"),
        full_name="Tier-2 SOC Analyst",
        role="SECURITY_ANALYST",
        created_at=datetime.datetime.utcnow()
    )
    forensics_user = User(
        email="forensics@cybershield.local",
        hashed_password=hash_password("ForensicsPass2026!"),
        full_name="Digital Forensics Investigator",
        role="FORENSIC_INVESTIGATOR",
        created_at=datetime.datetime.utcnow()
    )
    db.add_all([admin_user, analyst_user, forensics_user])
    db.commit()

    # 3. Lab Assets
    assets = [
        LabAsset(
            name="LAB-WEB-01",
            ip_address="192.168.10.10",
            os="Ubuntu Linux 22.04 LTS",
            asset_type="Web Server",
            status="ONLINE",
            risk_level="MEDIUM",
            open_ports="80, 443, 21, 8080",
            services="Apache2 HTTP, OpenSSL, ProFTPD",
            last_activity=datetime.datetime.utcnow()
        ),
        LabAsset(
            name="LAB-AUTH-01",
            ip_address="192.168.10.20",
            os="Debian 12 Enterprise",
            asset_type="Auth Server",
            status="ONLINE",
            risk_level="LOW",
            open_ports="22, 389, 636",
            services="OpenSSH 8.9p1, OpenLDAP",
            last_activity=datetime.datetime.utcnow()
        ),
        LabAsset(
            name="LAB-DB-01",
            ip_address="192.168.10.30",
            os="Windows Server 2022",
            asset_type="DB Server",
            status="ONLINE",
            risk_level="HIGH",
            open_ports="1433, 3306, 3389",
            services="Microsoft SQL Server, MySQL 8.0, RDP",
            last_activity=datetime.datetime.utcnow()
        ),
        LabAsset(
            name="LAB-PC-01",
            ip_address="192.168.10.40",
            os="Windows 11 Enterprise",
            asset_type="Workstation",
            status="ONLINE",
            risk_level="MEDIUM",
            open_ports="135, 445",
            services="SMBv2, WinRM, Sentinel EDR Agent",
            last_activity=datetime.datetime.utcnow()
        ),
        LabAsset(
            name="LAB-FILE-01",
            ip_address="192.168.10.50",
            os="Red Hat Enterprise Linux 9",
            asset_type="File Server",
            status="ONLINE",
            risk_level="LOW",
            open_ports="2049, 445, 22",
            services="NFS, Samba 4.16, SSH",
            last_activity=datetime.datetime.utcnow()
        )
    ]
    db.add_all(assets)
    db.commit()

    # 4. Vulnerabilities
    vulns = [
        Vulnerability(
            cve_id="CVE-2023-44487",
            title="HTTP/2 Rapid Reset DDoS Vulnerability",
            asset_name="LAB-WEB-01",
            severity="HIGH",
            description="The HTTP/2 protocol allows a high request rate leading to resource exhaustion.",
            recommendation="Apply web server patch and enable rate-limiting module on Apache/Nginx.",
            status="OPEN"
        ),
        Vulnerability(
            cve_id="CVE-2024-21626",
            title="runc Container Breakout / Leaked File Descriptor",
            asset_name="LAB-WEB-01",
            severity="CRITICAL",
            description="Container runtime privilege escalation flaw allows container breakout.",
            recommendation="Upgrade runc package to version 1.1.12 or later.",
            status="OPEN"
        ),
        Vulnerability(
            cve_id="LAB-VULN-001",
            title="Weak Password Policy & Missing MFA",
            asset_name="LAB-AUTH-01",
            severity="HIGH",
            description="Password policy permits simple passwords without mandatory multi-factor authentication.",
            recommendation="Enforce 12-character complex passwords and mandatory TOTP MFA.",
            status="IN_PROGRESS"
        ),
        Vulnerability(
            cve_id="LAB-VULN-002",
            title="Unnecessary Open Port 21 (FTP Plaintext Auth)",
            asset_name="LAB-WEB-01",
            severity="MEDIUM",
            description="FTP daemon exposes credentials in cleartext over unencrypted network traffic.",
            recommendation="Disable FTP service and require SFTP over SSH port 22.",
            status="OPEN"
        ),
        Vulnerability(
            cve_id="LAB-VULN-003",
            title="Outdated Windows RDP Protocol Patching",
            asset_name="LAB-DB-01",
            severity="HIGH",
            description="Remote Desktop Services contains unpatched session negotiation vulnerability.",
            recommendation="Apply Windows Security Update Rollup and enforce NLA (Network Level Authentication).",
            status="OPEN"
        )
    ]
    db.add_all(vulns)
    db.commit()

    # 5. Sample Security Events
    now = datetime.datetime.utcnow()
    events = [
        SecurityEvent(
            timestamp=now - datetime.timedelta(hours=2),
            event_type="FAILED_LOGIN",
            source_ip="192.168.10.55",
            dest_ip="192.168.10.20",
            user="admin",
            protocol="SSH",
            port=22,
            severity="MEDIUM",
            status="DETECTED",
            description="SIMULATED: Failed SSH password attempt for user 'admin' from 192.168.10.55",
            raw_data="Oct 03 12:10:01 LAB-AUTH-01 sshd[901]: Failed password for admin from 192.168.10.55 port 42100 ssh2"
        ),
        SecurityEvent(
            timestamp=now - datetime.timedelta(hours=1, minutes=45),
            event_type="PORT_SCAN",
            source_ip="192.168.10.55",
            dest_ip="192.168.10.10",
            user=None,
            protocol="TCP",
            port=80,
            severity="LOW",
            status="DETECTED",
            description="SIMULATED: TCP probe detected targeting port 80 on web host LAB-WEB-01",
            raw_data="Oct 03 12:25:00 LAB-FW-01 kernel: SRC=192.168.10.55 DST=192.168.10.10 PROTO=TCP DPT=80"
        ),
        SecurityEvent(
            timestamp=now - datetime.timedelta(minutes=30),
            event_type="SUSPICIOUS_LOGIN",
            source_ip="192.168.10.55",
            dest_ip="192.168.10.30",
            user="db_admin@cybershield.local",
            protocol="RDP",
            port=3389,
            severity="HIGH",
            status="DETECTED",
            description="SIMULATED: RDP authentication from anomalous IP 192.168.10.55",
            raw_data="Oct 03 13:40:00 LAB-DB-01 TerminalServices: Session logon user db_admin from 192.168.10.55"
        )
    ]
    db.add_all(events)
    db.commit()

    # 6. Sample Alerts
    alerts = [
        Alert(
            alert_type="BRUTE_FORCE",
            severity="HIGH",
            source_ip="192.168.10.55",
            target_asset="LAB-AUTH-01",
            timestamp=now - datetime.timedelta(hours=2),
            description="Automated Detection: Detected 6 repeated failed authentication attempts from IP 192.168.10.55 targeting LAB-AUTH-01.",
            detection_rule="RULE_1_BRUTE_FORCE_THRESHOLD_EXCEEDED",
            evidence_count=6,
            status="RESOLVED",
            related_event_ids=[1]
        ),
        Alert(
            alert_type="SUSPICIOUS_LOGIN",
            severity="HIGH",
            source_ip="192.168.10.55",
            target_asset="LAB-DB-01",
            timestamp=now - datetime.timedelta(minutes=30),
            description="Automated Detection: Account 'db_admin' logged in from anomalous IP 192.168.10.55 outside standard schedule.",
            detection_rule="RULE_3_SUSPICIOUS_LOGIN_ANOMALY",
            evidence_count=1,
            status="INVESTIGATING",
            related_event_ids=[3]
        )
    ]
    db.add_all(alerts)
    db.commit()

    # 7. Sample Incidents
    inc = Incident(
        title="Unauthorized Database Remote Access & Credential Investigation",
        severity="HIGH",
        attack_type="Suspicious Login",
        affected_asset="LAB-DB-01",
        created_at=now - datetime.timedelta(minutes=25),
        status="INVESTIGATING",
        stage="INVESTIGATE",
        assigned_analyst="analyst@cybershield.local",
        description="SOC analyst alerted to anomalous RDP session on database host LAB-DB-01 originating from unrecognized IP 192.168.10.55.",
        related_alerts=[2],
        evidence_ids=["EVD-8821", "EVD-8822"],
        containment_action="Terminated Active RDP Session & Blocked Attacker Subnet",
        recovery_action="Re-issued administrator credentials and performed memory artifact analysis.",
        resolution_notes="Active investigation in progress by Digital Forensics team."
    )
    db.add(inc)
    db.commit()

    note1 = IncidentNote(
        incident_id=inc.id,
        author="analyst@cybershield.local",
        text="Triage complete. Confirmed RDP session was established using valid credentials. Escalating to Forensics.",
        timestamp=now - datetime.timedelta(minutes=20)
    )
    note2 = IncidentNote(
        incident_id=inc.id,
        author="forensics@cybershield.local",
        text="Extracted Windows Event Log ID 4624 (Logon Type 10 - RemoteInteractive). Evidence recorded as EVD-8821.",
        timestamp=now - datetime.timedelta(minutes=10)
    )
    db.add_all([note1, note2])

    # 8. Sample Evidence
    evd1 = Evidence(
        evidence_code="EVD-8821",
        title="Windows Security Event Log 4624 (RDP Logon)",
        type="SYSTEM_EVENT",
        source="LAB-DB-01 Windows Security Log",
        timestamp=now - datetime.timedelta(minutes=30),
        file_hash="c4ca4238a0b923820dcc509a6f75849b2862da42d2a4561081a95e263d84f884",
        description="Logon Type 10 Remote Interactive authentication record for user db_admin.",
        raw_payload="Logon Type: 10\nTargetUser: db_admin\nWorkstationName: DESKTOP-LAB55\nIpAddress: 192.168.10.55",
        related_incident_id=inc.id,
        collection_status="VERIFIED_SIMULATED"
    )
    evd2 = Evidence(
        evidence_code="EVD-8822",
        title="Database Query Audit Trace",
        type="SYSTEM_EVENT",
        source="LAB-DB-01 SQL Audit Engine",
        timestamp=now - datetime.timedelta(minutes=28),
        file_hash="8f14e45fceea167a5a36dedd4bea2543",
        description="Query trace captured SELECT operations on sensitive schema tables right after login.",
        raw_payload="SELECT TOP 100 * FROM LabUserAccounts;\nSELECT TOP 50 * FROM SystemConfig;",
        related_incident_id=inc.id,
        collection_status="VERIFIED_SIMULATED"
    )
    db.add_all([evd1, evd2])
    db.commit()

    # 9. Initial Audit Log
    audit = AuditLog(
        timestamp=now,
        user_email="system@cybershield.local",
        action="SYSTEM_INITIALIZATION",
        resource="Database",
        ip_address="127.0.0.1",
        result="SUCCESS",
        details="CyberShield Academic Lab & SOC Platform successfully initialized with synthetic seed data."
    )
    db.add(audit)
    db.commit()

    db.close()
    print("[CYBERSHIELD] Database seeding completed successfully.")

if __name__ == "__main__":
    seed_database()
