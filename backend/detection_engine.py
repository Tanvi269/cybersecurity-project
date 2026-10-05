import datetime
from sqlalchemy.orm import Session
from models import SecurityEvent, Alert, LabAsset

def evaluate_detection_rules(db: Session) -> list:
    """
    Evaluates unprocessed synthetic security events against rule thresholds
    and auto-generates security alerts.
    """
    new_alerts = []

    unprocessed_events = db.query(SecurityEvent).filter(SecurityEvent.status == "UNPROCESSED").all()
    if not unprocessed_events:
        return new_alerts

    # Group events by source_ip and event_type
    brute_force_groups = {}
    port_scan_groups = {}
    suspicious_logins = []
    malware_events = []
    phishing_events = []

    for ev in unprocessed_events:
        if ev.event_type == "FAILED_LOGIN":
            brute_force_groups.setdefault(ev.source_ip, []).append(ev)
        elif ev.event_type in ["PORT_SCAN", "NETWORK_RECON"]:
            port_scan_groups.setdefault(ev.source_ip, []).append(ev)
        elif ev.event_type == "SUSPICIOUS_LOGIN":
            suspicious_logins.append(ev)
        elif ev.event_type == "MALWARE_HASH" or "MALWARE" in ev.event_type:
            malware_events.append(ev)
        elif ev.event_type == "PHISHING_CLICK" or "PHISHING" in ev.event_type:
            phishing_events.append(ev)

    # RULE 1: BRUTE FORCE (Threshold > 5 failed logins from same source)
    for src_ip, events in brute_force_groups.items():
        if len(events) >= 5:
            event_ids = [e.id for e in events]
            target = events[0].dest_ip
            # Find target asset name if exists
            asset = db.query(LabAsset).filter(LabAsset.ip_address == target).first()
            target_name = asset.name if asset else target

            alert = Alert(
                alert_type="BRUTE_FORCE",
                severity="HIGH",
                source_ip=src_ip,
                target_asset=target_name,
                timestamp=datetime.datetime.utcnow(),
                description=f"Automated Detection: Detected {len(events)} repeated failed authentication attempts from IP {src_ip} targeting {target_name}.",
                detection_rule="RULE_1_BRUTE_FORCE_THRESHOLD_EXCEEDED",
                evidence_count=len(events),
                status="NEW",
                related_event_ids=event_ids
            )
            db.add(alert)
            new_alerts.append(alert)
            for e in events:
                e.status = "DETECTED"

    # RULE 2: PORT SCAN (Threshold > 5 distinct ports contacted by same source)
    for src_ip, events in port_scan_groups.items():
        distinct_ports = set(e.port for e in events if e.port is not None)
        if len(distinct_ports) >= 4 or len(events) >= 5:
            event_ids = [e.id for e in events]
            target = events[0].dest_ip
            asset = db.query(LabAsset).filter(LabAsset.ip_address == target).first()
            target_name = asset.name if asset else target

            alert = Alert(
                alert_type="PORT_SCAN",
                severity="MEDIUM",
                source_ip=src_ip,
                target_asset=target_name,
                timestamp=datetime.datetime.utcnow(),
                description=f"Automated Detection: High-frequency port probing detected from IP {src_ip} scanning multiple service ports on {target_name}.",
                detection_rule="RULE_2_PORT_SCAN_RECONNAISSANCE",
                evidence_count=len(events),
                status="NEW",
                related_event_ids=event_ids
            )
            db.add(alert)
            new_alerts.append(alert)
            for e in events:
                e.status = "DETECTED"

    # RULE 3: SUSPICIOUS LOGIN (Anomalous user login)
    for ev in suspicious_logins:
        target = ev.dest_ip
        asset = db.query(LabAsset).filter(LabAsset.ip_address == target).first()
        target_name = asset.name if asset else target

        alert = Alert(
            alert_type="SUSPICIOUS_LOGIN",
            severity="HIGH",
            source_ip=ev.source_ip,
            target_asset=target_name,
            timestamp=datetime.datetime.utcnow(),
            description=f"Automated Detection: Account '{ev.user or 'unknown'}' logged in from unassigned location/IP {ev.source_ip} outside standard working schedule.",
            detection_rule="RULE_3_SUSPICIOUS_LOGIN_ANOMALY",
            evidence_count=1,
            status="NEW",
            related_event_ids=[ev.id]
        )
        db.add(alert)
        new_alerts.append(alert)
        ev.status = "DETECTED"

    # RULE 4: PHISHING INDICATOR
    for ev in phishing_events:
        target = ev.dest_ip
        asset = db.query(LabAsset).filter(LabAsset.ip_address == target).first()
        target_name = asset.name if asset else target

        alert = Alert(
            alert_type="PHISHING",
            severity="HIGH",
            source_ip=ev.source_ip,
            target_asset=target_name,
            timestamp=datetime.datetime.utcnow(),
            description=f"Automated Detection: User '{ev.user or 'lab_user'}' clicked malicious credential-harvesting link from synthetic email payload.",
            detection_rule="RULE_4_PHISHING_CREDENTIAL_HARVEST",
            evidence_count=1,
            status="NEW",
            related_event_ids=[ev.id]
        )
        db.add(alert)
        new_alerts.append(alert)
        ev.status = "DETECTED"

    # RULE 5: MALWARE INDICATOR
    for ev in malware_events:
        target = ev.dest_ip
        asset = db.query(LabAsset).filter(LabAsset.ip_address == target).first()
        target_name = asset.name if asset else target

        alert = Alert(
            alert_type="MALWARE_INDICATOR",
            severity="CRITICAL",
            source_ip=ev.source_ip,
            target_asset=target_name,
            timestamp=datetime.datetime.utcnow(),
            description=f"Automated Detection: Suspicious synthetic executable hash matched endpoint monitor rule on asset {target_name}.",
            detection_rule="RULE_5_MALWARE_HASH_MATCH",
            evidence_count=1,
            status="NEW",
            related_event_ids=[ev.id]
        )
        db.add(alert)
        new_alerts.append(alert)
        ev.status = "DETECTED"

    # Mark remaining evaluated unprocessed events as PROCESSED
    for ev in unprocessed_events:
        if ev.status == "UNPROCESSED":
            ev.status = "PROCESSED"

    db.commit()
    return new_alerts
