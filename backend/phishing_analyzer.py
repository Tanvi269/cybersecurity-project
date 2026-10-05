import re
from typing import Dict, List, Any

URGENCY_KEYWORDS = [
    "urgent", "immediately", "action required", "account suspended", "password expired",
    "security alert", "verify now", "24 hours", "unauthorized access", "log in immediately",
    "failure to comply", "update billing", "suspended"
]

SUSPICIOUS_DOMAINS = [
    "secure-update", "auth-verify", "account-alert", "cybershield-login", "bank-secure",
    "paypal-verify", "login-portal", "update-now", "free-gift", "crypto-claim"
]

CREDENTIAL_KEYWORDS = [
    "enter your password", "confirm your pin", "social security", "credit card",
    "update credentials", "verify password", "login credentials"
]

def analyze_phishing_email(sender: str, subject: str, body: str, raw_url: str = "") -> Dict[str, Any]:
    indicators = []
    reasons = []
    recommendations = []
    risk_score = 10

    full_text = f"{subject} {body}".lower()

    # 1. Sender domain check
    sender_domain = sender.split("@")[-1] if "@" in sender else sender
    if any(sus in sender_domain.lower() for sus in SUSPICIOUS_DOMAINS) or sender_domain.endswith(".xyz") or sender_domain.endswith(".top") or sender_domain.endswith(".net"):
        risk_score += 25
        indicators.append("Suspicious Sender Domain")
        reasons.append(f"Sender domain '{sender_domain}' matches known spoofing pattern or suspicious TLD.")
    elif "cybershield" in full_text and "cybershield.local" not in sender_domain.lower():
        risk_score += 30
        indicators.append("Brand Impersonation / Domain Mismatch")
        reasons.append(f"Email claims to originate from CyberShield but sender domain is '{sender_domain}'.")

    # 2. Urgency language
    urgency_matches = [kw for kw in URGENCY_KEYWORDS if kw in full_text]
    if urgency_matches:
        risk_score += 20
        indicators.append("Urgency & Psychological Pressure")
        reasons.append(f"Email uses high-pressure psychological language: {', '.join(urgency_matches[:3])}.")

    # 3. Credential harvesting request
    cred_matches = [kw for kw in CREDENTIAL_KEYWORDS if kw in full_text]
    if cred_matches or "password" in full_text and "verify" in full_text:
        risk_score += 25
        indicators.append("Credential Harvest Request")
        reasons.append("Direct request for sensitive password or login verification detected.")

    # 4. Suspicious links / URLs
    urls_in_body = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', full_text)
    if raw_url:
        urls_in_body.append(raw_url.lower())

    for u in urls_in_body:
        if any(sus in u for sus in SUSPICIOUS_DOMAINS) or "bit.ly" in u or "tinyurl" in u or re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', u):
            risk_score += 20
            indicators.append("Malicious / Shortened Link")
            reasons.append(f"Detected suspicious destination URL: {u[:45]}...")
            break

    # 5. Attachment / Payload indicator
    if "attachment" in full_text or ".exe" in full_text or ".zip" in full_text or ".iso" in full_text:
        risk_score += 15
        indicators.append("Suspicious Executable/Compressed Attachment")
        reasons.append("Mentions executable or archive attachment payload.")

    # Final Risk Level Determination
    if risk_score >= 75:
        risk_level = "CRITICAL"
    elif risk_score >= 50:
        risk_level = "HIGH"
    elif risk_score >= 30:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    # Defensive recommendations
    recommendations.append("Do NOT click any embedded links or open attached files.")
    recommendations.append("Report message to SOC Incident Response team immediately.")
    recommendations.append("Block sender domain across email security gateway (ESG).")
    if risk_level in ["HIGH", "CRITICAL"]:
        recommendations.append("Purge email from all organizational mailboxes.")
        recommendations.append("Conduct credential reset for any users who interacted with the link.")

    return {
        "risk_level": risk_level,
        "risk_score": min(risk_score, 100),
        "sender": sender,
        "subject": subject,
        "indicators": indicators if indicators else ["No explicit malicious patterns detected"],
        "reasons": reasons if reasons else ["Email content matches standard operational communication."],
        "recommendations": recommendations,
        "urls_detected": urls_in_body
    }
